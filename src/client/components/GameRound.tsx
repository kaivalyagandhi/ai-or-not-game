import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameRound as GameRoundType, SubmitAnswerResponse } from '../../shared/types/api';
import { apiCall } from '../utils/network';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useAudio } from '../hooks/useAudio';
import { triggerConfetti, cleanupConfetti } from '../utils/confetti';
import { formatRoundLabel } from '../utils/ui';
import { MagnifyContainer } from './MagnifyContainer';

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
  const [isTimeout, setIsTimeout] = useState(false);
  const [timeoutCountdown, setTimeoutCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio controls
  const audio = useAudio();
  
  // Enhanced error handling
  const errorHandler = useErrorHandler({
    enableOfflineDetection: true,
    enableAutoRetry: false, // Don't auto-retry during gameplay
  });

  // Magnification is only active during gameplay, not during feedback or when answer is selected
  const isMagnifyActive = !showFeedback && selectedAnswer === null && !isSubmitting;
  
  // Get border color that matches the game's pre-selection border (gray-300)
  const magnifyBorderColor = '#d1d5db';

  // Reset component state when round changes
  useEffect(() => {
    setTimeRemaining(10);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setFeedbackData(null);
    setIsSubmitting(false);
    setIsTimeout(false);
    setTimeoutCountdown(null);
    
    // Clear any existing countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    
    // Cleanup any existing confetti animations
    cleanupConfetti();
  }, [round.roundNumber]); // Reset when round number changes

  // Cleanup confetti and intervals on component unmount
  useEffect(() => {
    return () => {
      cleanupConfetti();
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

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
          
          // Trigger confetti animation for positive scores (but not on timeout)
          if (data.roundScore && data.roundScore > 0 && !isTimeout) {
            // Small delay to ensure feedback is visible before confetti
            setTimeout(() => {
              triggerConfetti(data.roundScore!);
            }, 100);
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
        
        // Trigger confetti animation for positive scores (but not on timeout)
        if (fallbackResponse.roundScore && fallbackResponse.roundScore > 0 && !isTimeout) {
          // Small delay to ensure feedback is visible before confetti
          setTimeout(() => {
            triggerConfetti(fallbackResponse.roundScore!);
          }, 100);
        }
        
        // Show feedback and continue
        setTimeout(() => {
          onRoundComplete(fallbackResponse);
        }, 2000);
      }
    };

    await executeSubmit();
  }, [sessionId, round.roundNumber, round.correctAnswer, round.aiImagePosition, onRoundComplete, isSubmitting, errorHandler]);

  // Submit timeout to server to get proper game state
  const submitTimeout = useCallback(async () => {
    console.log('submitTimeout called');
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setIsTimeout(true);
    setShowFeedback(true);
    errorHandler.clearError();

    try {
      // Submit timeout as wrong answer with 0 time remaining
      // Submit the opposite of the correct answer to ensure it's marked as incorrect
      const wrongAnswer = round.correctAnswer === 'A' ? 'B' : 'A';
      const data: SubmitAnswerResponse = await apiCall('/api/game/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          roundNumber: round.roundNumber,
          userAnswer: wrongAnswer, // Submit wrong answer for timeout
          timeRemaining: 0, // 0 time = timeout
        }),
      }, {
        maxRetries: 2,
        baseDelay: 1000,
      });
      
      // Override the response to show timeout behavior
      const timeoutResponse: SubmitAnswerResponse = {
        ...data,
        isCorrect: false, // Always show as incorrect for timeout
        roundScore: 0, // No points for timeout
      };
      
      setFeedbackData(timeoutResponse);
      
      // No sound effects for timeout
      
      // Start countdown animation
      setTimeoutCountdown(3);
      
      // Clear any existing interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      
      let currentCountdown = 3;
      
      // Countdown timer
      countdownIntervalRef.current = setInterval(() => {
        currentCountdown -= 1;
        console.log('Countdown tick:', currentCountdown);
        
        if (currentCountdown <= 0) {
          console.log('Countdown finished, calling onRoundComplete');
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setTimeoutCountdown(null);
          // Use the original server response for proper game state
          onRoundComplete(data);
        } else {
          setTimeoutCountdown(currentCountdown);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting timeout:', error);
      
      // Fallback timeout response
      const fallbackResponse: SubmitAnswerResponse = {
        success: true,
        isCorrect: false,
        correctAnswer: round.correctAnswer,
        aiImagePosition: round.aiImagePosition,
        roundScore: 0,
      };
      
      setFeedbackData(fallbackResponse);
      
      // Start countdown animation even on error
      setTimeoutCountdown(3);
      
      // Clear any existing interval
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      
      let currentCountdown = 3;
      
      // Countdown timer
      countdownIntervalRef.current = setInterval(() => {
        currentCountdown -= 1;
        console.log('Countdown tick (fallback):', currentCountdown);
        
        if (currentCountdown <= 0) {
          console.log('Countdown finished (fallback), calling onRoundComplete');
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setTimeoutCountdown(null);
          onRoundComplete(fallbackResponse);
        } else {
          setTimeoutCountdown(currentCountdown);
        }
      }, 1000);
    }
  }, [sessionId, round.roundNumber, round.correctAnswer, round.aiImagePosition, onRoundComplete, isSubmitting, errorHandler]);

  // Handle timeout scenario
  const handleTimeout = useCallback(() => {
    console.log('handleTimeout called', { selectedAnswer, showFeedback });
    if (selectedAnswer || showFeedback) return;
    
    submitTimeout();
  }, [selectedAnswer, showFeedback, submitTimeout]);

  // Handle image selection
  const handleImageSelect = (answer: 'A' | 'B') => {
    if (selectedAnswer || showFeedback || isSubmitting) return;
    
    submitAnswer(answer, timeRemaining);
  };

  // Timer countdown effect
  useEffect(() => {
    if (showFeedback || selectedAnswer) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - handle timeout without submitting answer
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showFeedback, selectedAnswer, round.roundNumber]); // Removed submitAnswer dependency

  // Get timer color based on remaining time
  const getTimerColor = () => {
    if (timeRemaining > 6) return 'text-green-600'; // Normal green for high time
    if (timeRemaining > 3) return 'text-secondary-600'; // Secondary color for medium time
    return 'text-error-600'; // Maroon red for low time
  };

  // Get progress bar color
  const getProgressColor = () => {
    if (timeRemaining > 6) return 'bg-green-500'; // Normal green for high time
    if (timeRemaining > 3) return 'bg-secondary-500'; // Secondary color (#ffb800) for medium time
    return 'bg-error-500'; // Maroon red for low time
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {/* Fixed header with round info aligned with audio toggle */}
      <div className="fixed top-4 left-4 z-40">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          <div className="text-base font-medium text-gray-700">
            {formatRoundLabel(round.roundNumber, 6, round.category)}
          </div>
        </div>
      </div>

      <div className="max-w-4xl w-full">
        {/* Header with timer */}
        <div className="text-center mb-6">
          {/* Add top padding to account for fixed header */}
          <div className="pt-16"></div>
          
          {/* Timer */}
          <div className="mb-4">
            {showFeedback && isTimeout && timeoutCountdown !== null ? (
              // Show countdown in place of timer
              <div className="text-4xl font-bold text-gray-700">
                {timeoutCountdown}
              </div>
            ) : (
              // Show normal timer
              <div className={`text-4xl font-bold ${getTimerColor()}`}>
                {timeRemaining}
              </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
                style={{ width: `${(timeRemaining / 10) * 100}%` }}
              />
            </div>
          </div>

          <h2 className={`text-xl font-semibold mb-2 ${showFeedback && isTimeout ? "text-red-600" : "text-gray-900"}`}>
            {isSubmitting && !showFeedback ? (
              // Show loading spinner during submission
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#3da8ff]"></div>
              </div>
            ) : showFeedback && !isTimeout && feedbackData ? (
              // Show points feedback after submission
              feedbackData.roundScore !== undefined && feedbackData.roundScore > 0 ? (
                <span style={{ color: '#22c55e' }}>
                  +{Math.round(feedbackData.roundScore)} points
                </span>
              ) : (
                <span style={{ color: '#8b0000' }}>
                  No points
                </span>
              )
            ) : showFeedback && isTimeout ? (
              "Time's Up!"
            ) : (
              "Which image is not AI?"
            )}
          </h2>
        </div>

        {/* Image Selection - Responsive Layout */}
        <div className="image-container">
          {/* Image A */}
          <div className="image-wrapper">
            <MagnifyContainer
              imageUrl={round.imageA.url}
              isActive={isMagnifyActive}
              borderColor={magnifyBorderColor}
            >
              <button
                onClick={() => handleImageSelect('A')}
                disabled={selectedAnswer !== null || showFeedback || isSubmitting}
                className={`game-image-button ${
                  showFeedback
                    ? isTimeout
                      ? feedbackData?.correctAnswer === 'A'
                        ? 'correct-feedback'
                        : 'incorrect-feedback'
                      : selectedAnswer === 'A'
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
                
                {/* Custom Overlay Indicators - Show on selected image or correct answer on timeout */}
                {showFeedback && (selectedAnswer === 'A' || (isTimeout && feedbackData?.correctAnswer === 'A')) && (
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
            </MagnifyContainer>
          </div>

          {/* Image B */}
          <div className="image-wrapper">
            <MagnifyContainer
              imageUrl={round.imageB.url}
              isActive={isMagnifyActive}
              borderColor={magnifyBorderColor}
            >
              <button
                onClick={() => handleImageSelect('B')}
                disabled={selectedAnswer !== null || showFeedback || isSubmitting}
                className={`game-image-button ${
                  showFeedback
                    ? isTimeout
                      ? feedbackData?.correctAnswer === 'B'
                        ? 'correct-feedback'
                        : 'incorrect-feedback'
                      : selectedAnswer === 'B'
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
                
                {/* Custom Overlay Indicators - Show on selected image or correct answer on timeout */}
                {showFeedback && (selectedAnswer === 'B' || (isTimeout && feedbackData?.correctAnswer === 'B')) && (
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
            </MagnifyContainer>
          </div>
        </div>




      </div>
    </div>
  );
};
