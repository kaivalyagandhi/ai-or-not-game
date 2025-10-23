import { useState } from 'react';
import { 
  SplashScreen, 
  GameRound, 
  ResultsScreen,
  LeaderboardTabs
} from './components';
import { 
  GameSession, 
  GameRound as GameRoundType, 
  GameInitResponse, 
  StartGameResponse, 
  SubmitAnswerResponse 
} from '../shared/types/api';

type GameState = 'splash' | 'playing' | 'results' | 'leaderboard' | 'error';

export const App = () => {
  const [gameState, setGameState] = useState<GameState>('splash');
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentRound, setCurrentRound] = useState<GameRoundType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize game session
  const initializeGame = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/game/init');
      const data: GameInitResponse = await response.json();
      
      if (data.success && data.session) {
        setSession(data.session);
        
        // If user already completed today's game, show results
        if (data.session.completed) {
          setGameState('results');
        } else {
          // Start a new game
          await startGame();
        }
      } else {
        setError(data.error || 'Failed to initialize game');
        setGameState('error');
      }
    } catch (err) {
      console.error('Error initializing game:', err);
      setError('Network error. Please try again.');
      setGameState('error');
    } finally {
      setLoading(false);
    }
  };

  // Start a new game
  const startGame = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'current-user', // This will be handled by Devvit auth
        }),
      });

      const data: StartGameResponse = await response.json();
      
      if (data.success && data.currentRound && data.sessionId) {
        setCurrentRound(data.currentRound);
        setSession(prev => prev ? { ...prev, sessionId: data.sessionId! } : null);
        setGameState('playing');
      } else {
        setError(data.error || 'Failed to start game');
        setGameState('error');
      }
    } catch (err) {
      console.error('Error starting game:', err);
      setError('Network error. Please try again.');
      setGameState('error');
    } finally {
      setLoading(false);
    }
  };

  // Handle round completion
  const handleRoundComplete = (response: SubmitAnswerResponse) => {
    if (!response.success) {
      setError(response.error || 'Failed to submit answer');
      setGameState('error');
      return;
    }

    // Update session with round results
    if (session) {
      const updatedSession = { ...session };
      if (response.isCorrect !== undefined) {
        updatedSession.correctCount = (updatedSession.correctCount || 0) + (response.isCorrect ? 1 : 0);
      }
      if (response.roundScore !== undefined) {
        updatedSession.totalScore = (updatedSession.totalScore || 0) + response.roundScore;
      }
      setSession(updatedSession);
    }

    // Check if game is complete
    if (response.gameComplete && response.finalResults) {
      // Update session with final results
      if (session) {
        const finalSession: GameSession = {
          ...session,
          totalScore: response.finalResults.totalScore,
          correctCount: response.finalResults.correctCount,
          totalTimeBonus: response.finalResults.timeBonus,
          badge: response.finalResults.badge,
          completed: true,
        };
        setSession(finalSession);
      }
      setGameState('results');
    } else if (response.nextRound) {
      // Move to next round
      setCurrentRound(response.nextRound);
    }
  };

  // Handle start game from splash
  const handleStartGame = () => {
    initializeGame();
  };

  // Handle back to splash from results
  const handleBackToSplash = () => {
    setGameState('splash');
    setSession(null);
    setCurrentRound(null);
    setError(null);
  };

  // Handle view leaderboard
  const handleViewLeaderboard = () => {
    setGameState('leaderboard');
  };

  // Handle back from leaderboard
  const handleBackFromLeaderboard = () => {
    if (session?.completed) {
      setGameState('results');
    } else {
      setGameState('splash');
    }
  };

  // Error state
  if (gameState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-2xl font-bold text-red-900">
            Oops! Something went wrong
          </h1>
          <p className="text-red-700">
            {error || 'An unexpected error occurred'}
          </p>
          <button
            onClick={handleBackToSplash}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  // Render current game state
  switch (gameState) {
    case 'splash':
      return <SplashScreen onStartGame={handleStartGame} />;
    
    case 'playing':
      if (!currentRound || !session?.sessionId) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-red-600">Game data not available</p>
          </div>
        );
      }
      return (
        <GameRound
          round={currentRound}
          sessionId={session.sessionId}
          onRoundComplete={handleRoundComplete}
        />
      );
    
    case 'results':
      if (!session) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-red-600">Session data not available</p>
          </div>
        );
      }
      return (
        <ResultsScreen
          session={session}
          onPlayAgain={handleBackToSplash}
          onViewLeaderboard={handleViewLeaderboard}
        />
      );
    
    case 'leaderboard':
      return (
        <div className="min-h-screen bg-gray-50">
          <LeaderboardTabs
            currentUserId={session?.userId}
            onClose={handleBackFromLeaderboard}
          />
        </div>
      );
    
    default:
      return <SplashScreen onStartGame={handleStartGame} />;
  }
};
