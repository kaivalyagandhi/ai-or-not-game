import React, { useState, useEffect, useCallback } from 'react';
import { GameRound as GameRoundType, SubmitAnswerResponse } from '../../shared/types/api';
import { apiCall } from '../utils/network';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useAudio } from '../hooks/useAudio';

interface GameRoundProps {
  round: GameRoundType;
  sessionId: string;
  onRoundComplete: (response: SubmitAnswerResponse) => void;
}

export const GameRound: React.FC<GameRoundProps> = ({ round, sessionId, onRoundComplete }) => {
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<SubmitAnswerResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Audio controls
  const audio = useAudio();
  
  // Enhanced error handling
  const errorHandler = useErrorHandler({
    enableOfflineDetection: true,
    enableAutoRetry: false, // Don't auto-retry during gameplay
  });

  // Reset component state when round changes
  useEffect(() => {
    setTimeRemaining(10);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setFeedbackData(null);
    setIsSubmitting(false);
  }, [round.roundNumber]); // Reset when round number changes

  // Submit answer to server with enhanced error handling
  const submitAnswer = useCallback(async (answer: 'A' | 'B', timeLeft: number) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSelectedAnswer(answer);
    errorHandler.clearError();

    const executeSubmit = async () => {
      try {
        const data: SubmitAnswerResponse = await apiCall('/api/game/submit-answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            roundNumber: round.roundNumber,
            userAnswer: answer,
            timeRemaining: timeLeft,
          }),
        }, {
          maxRetries: 2,
          baseDelay: 1000,
        });
        
        if (data.success) {
          setFeedbackData(data);
          setShowFeedback(true);
          
          // Play success or failure sound based on answer
          if (data.isCorrect) {
            audio?.playSuccessSound();
          } else {
            audio?.playFailureSound();
          }
          
          // Show feedback for 2 seconds before proceeding
          setTimeout(() => {
            onRoundComplete(data);
          }, 2000);
        } else {
          console.error('Failed to submit answer:', data.error);
          // Still proceed to next round on server error
          setTimeout(() => {
            onRoundComplete(data);
          }, 1000);
        }
      } catch (error) {
        console.error('Error submitting answer:', error);
        errorHandler.handleError(error, 'Failed to submit answer');
        
        // For gameplay, we need to continue even on network errors
        // Create a fallback response based on local validation
        const fallbackResponse: SubmitAnswerResponse = {
          success: false,
          error: errorHandler.errorState.message,
          isCorrect: answer === round.correctAnswer,
          correctAnswer: round.correctAnswer,
          aiImagePosition: round.aiImagePosition,
          roundScore: answer === round.correctAnswer ? timeLeft * 0.01 : 0,
        };
        
        setFeedbackData(fallbackResponse);
        setShowFeedback(true);
        
        // Play success or failure sound based on answer
        if (fallbackResponse.isCorrect) {
          audio?.playSuccessSound();
        } else {
          audio?.playFailureSound();
        }
        
        // Show feedback and continue
        setTimeout(() => {
          onRoundComplete(fallbackResponse);
        }, 2000);
      }
    };

    await executeSubmit();
  }, [sessionId, round.roundNumber, round.correctAnswer, round.aiImagePosition, onRoundComplete, isSubmitting, errorHandler]);

  // Handle image selection
  const handleImageSelect = (answer: 'A' | 'B') => {
    if (selectedAnswer || showFeedback) return;
    
    // Play click sound
    audio?.playClickSound();
    
    submitAnswer(answer, timeRemaining);
  };

  // Timer countdown effect
  useEffect(() => {
    if (showFeedback || selectedAnswer) return;


    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - submit with no answer
          submitAnswer('A', 0); // Default to A when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showFeedback, selectedAnswer, submitAnswer, round.roundNumber]); // Added round.roundNumber

  // Get timer color based on remaining time
  const getTimerColor = () => {
    if (timeRemaining > 6) return 'text-green-600';
    if (timeRemaining > 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get progress bar color
  const getProgressColor = () => {
    if (timeRemaining > 6) return 'bg-green-500';
    if (timeRemaining > 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl w-full">
        {/* Header with round info and timer */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">
              Round {round.roundNumber} of 6
            </div>
            <div className="text-sm text-gray-500 capitalize">
              Category: {round.category}
            </div>
          </div>
          
          {/* Timer */}
          <div className="mb-4">
            <div className={`text-4xl font-bold ${getTimerColor()}`}>
              {timeRemaining}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
                style={{ width: `${(timeRemaining / 10) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Which image is REAL?
          </h2>
          <p className="text-gray-600">
            Click on the photo taken by a human (not AI-generated)
          </p>
        </div>

        {/* Image Selection - Responsive Layout */}
        <div className="image-container">
          {/* Image A */}
          <div className="image-wrapper">
            <button
              onClick={() => handleImageSelect('A')}
              disabled={selectedAnswer !== null || showFeedback}
              className={`game-image-button ${
                showFeedback
                  ? selectedAnswer === 'A'
                    ? feedbackData?.isCorrect
                      ? 'selected correct-feedback'
                      : 'selected incorrect-feedback'
                    : feedbackData?.correctAnswer === 'A'
                    ? 'correct-feedback'
                    : 'incorrect-feedback'
                  : selectedAnswer === 'A'
                  ? 'selected'
                  : 'default'
              } ${selectedAnswer || showFeedback ? 'disabled' : ''}`}
            >
              <img
                src={round.imageA.url}
                alt={`Option A - ${round.imageA.metadata.description}`}
                onError={(e) => {
                  console.error('Failed to load image A:', round.imageA.url);
                  console.error('Image A error event:', e);
                }}
                onLoad={(e) => {
                  console.log('Successfully loaded image A:', round.imageA.url);
                  const img = e.target as HTMLImageElement;
                  console.log('Image A dimensions:', img.naturalWidth, 'x', img.naturalHeight);
                  console.log('Image A display size:', img.width, 'x', img.height);
                }}
                className="game-image"
              />
              
              {/* Custom Overlay Indicators - Only show on selected image */}
              {showFeedback && selectedAnswer === 'A' && (
                <div className="overlay-indicator">
                  {feedbackData?.aiImagePosition === 'A' ? (
                    <div className="ai-indicator">
                      <div className="overlay-icon">✕</div>
                      <div className="overlay-label">AI</div>
                    </div>
                  ) : (
                    <div className="human-indicator">
                      <div className="overlay-icon">✓</div>
                      <div className="overlay-label">Human</div>
                    </div>
                  )}
                </div>
              )}
            </button>
          </div>

          {/* Image B */}
          <div className="image-wrapper">
            <button
              onClick={() => handleImageSelect('B')}
              disabled={selectedAnswer !== null || showFeedback}
              className={`game-image-button ${
                showFeedback
                  ? selectedAnswer === 'B'
                    ? feedbackData?.isCorrect
                      ? 'selected correct-feedback'
                      : 'selected incorrect-feedback'
                    : feedbackData?.correctAnswer === 'B'
                    ? 'correct-feedback'
                    : 'incorrect-feedback'
                  : selectedAnswer === 'B'
                  ? 'selected'
                  : 'default'
              } ${selectedAnswer || showFeedback ? 'disabled' : ''}`}
            >
              <img
                src={round.imageB.url}
                alt={`Option B - ${round.imageB.metadata.description}`}
                onError={(e) => {
                  console.error('Failed to load image B:', round.imageB.url);
                  console.error('Image B error event:', e);
                }}
                onLoad={(e) => {
                  console.log('Successfully loaded image B:', round.imageB.url);
                  const img = e.target as HTMLImageElement;
                  console.log('Image B dimensions:', img.naturalWidth, 'x', img.naturalHeight);
                  console.log('Image B display size:', img.width, 'x', img.height);
                }}
                className="game-image"
              />
              
              {/* Custom Overlay Indicators - Only show on selected image */}
              {showFeedback && selectedAnswer === 'B' && (
                <div className="overlay-indicator">
                  {feedbackData?.aiImagePosition === 'B' ? (
                    <div className="ai-indicator">
                      <div className="overlay-icon">✕</div>
                      <div className="overlay-label">AI</div>
                    </div>
                  ) : (
                    <div className="human-indicator">
                      <div className="overlay-icon">✓</div>
                      <div className="overlay-label">Human</div>
                    </div>
                  )}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Points Display */}
        {showFeedback && feedbackData && feedbackData.roundScore !== undefined && (
          <div className="text-center">
            <div className="text-sm text-gray-600">
              +{feedbackData.roundScore.toFixed(2)} points
            </div>
          </div>
        )}

        {/* Loading state during submission */}
        {isSubmitting && !showFeedback && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <div className="text-gray-600 mt-2">Checking your answer...</div>
          </div>
        )}
      </div>
    </div>
  );
};
