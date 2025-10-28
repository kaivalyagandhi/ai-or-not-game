import { useState, useCallback, useEffect } from 'react';
import { 
  GameSession, 
  GameRound, 
  GameInitResponse, 
  StartGameResponse, 
  SubmitAnswerResponse,
  BadgeType 
} from '../../shared/types/api';
import { apiCall } from '../utils/network';
import { useErrorHandler } from './useErrorHandler';
import { gameStorage } from '../utils/storage';

export type GameState = 'splash' | 'playing' | 'educational' | 'results' | 'leaderboard' | 'error' | 'loading';

interface GameStateManager {
  // State
  gameState: GameState;
  session: GameSession | null;
  currentRound: GameRound | null;
  error: string | null;
  loading: boolean;
  
  // Actions
  setGameState: (state: GameState) => void;
  setSession: (session: GameSession | null) => void;
  setCurrentRound: (round: GameRound | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Game flow methods
  initializeGame: () => Promise<void>;
  startGame: () => Promise<void>;
  handleRoundComplete: (response: SubmitAnswerResponse) => void;
  resetGame: () => void;
  
  // Navigation methods
  goToSplash: () => void;
  goToLeaderboard: () => void;
  goBackFromLeaderboard: () => void;
  continueFromEducational: () => void;
  
  // Session management
  validateSession: () => boolean;
  calculateFinalScore: () => void;
  persistSession: () => Promise<void>;
  cleanupSession: () => void;
}

export const useGameState = (): GameStateManager => {
  const [gameState, setGameState] = useState<GameState>('splash');
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Enhanced error handling with retry logic
  const errorHandler = useErrorHandler({
    enableOfflineDetection: true,
    enableAutoRetry: true,
    autoRetryDelay: 3000,
    maxAutoRetries: 2,
  });

  // Clean up session data
  const cleanupSession = useCallback(() => {
    setSession(null);
    setCurrentRound(null);
    setError(null);
    console.log('Session cleaned up');
  }, []);

  // Session validation
  const validateSession = useCallback((): boolean => {
    if (!session) {
      console.warn('No active session found');
      return false;
    }

    // Check if session has required fields
    if (!session.userId || !session.sessionId) {
      console.warn('Session missing required fields:', session);
      return false;
    }

    // Check if session is expired (older than 24 hours)
    const sessionAge = Date.now() - session.startTime;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (sessionAge > maxAge) {
      console.warn('Session expired:', sessionAge, 'ms old');
      return false;
    }

    return true;
  }, [session]);

  // Calculate final score based on correct answers and time bonus
  const calculateFinalScore = useCallback(() => {
    if (!session || !session.rounds) {
      return;
    }

    let correctCount = 0;
    let totalTimeBonus = 0;

    // Calculate score from completed rounds
    session.rounds.forEach(round => {
      if (round.isCorrect) {
        correctCount += 1;
        // Add time bonus (0.01 points per millisecond remaining)
        if (round.timeRemaining) {
          totalTimeBonus += round.timeRemaining * 0.01;
        }
      }
    });

    // Determine badge based on correct count
    let badge: BadgeType;
    if (correctCount >= 6) {
      badge = BadgeType.AI_WHISPERER;
    } else if (correctCount >= 5) {
      badge = BadgeType.AI_DETECTIVE;
    } else if (correctCount >= 4) {
      badge = BadgeType.GOOD_SAMARITAN;
    } else if (correctCount >= 3) {
      badge = BadgeType.JUST_HUMAN;
    } else {
      badge = BadgeType.HUMAN_IN_TRAINING;
    }

    const totalScore = correctCount + totalTimeBonus;

    // Update session with final results
    setSession(prevSession => {
      if (!prevSession) return null;
      
      return {
        ...prevSession,
        correctCount,
        totalTimeBonus,
        totalScore,
        badge,
        completed: true,
      };
    });

    console.log('Final score calculated:', {
      correctCount,
      totalTimeBonus,
      totalScore,
      badge,
    });
  }, [session]);

  // Persist session data to server with enhanced error handling
  const persistSession = useCallback(async (): Promise<void> => {
    if (!session || !validateSession()) {
      console.warn('Cannot persist invalid session');
      return;
    }

    try {
      const data = await apiCall('/api/game/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.sessionId,
          userId: session.userId,
          totalScore: session.totalScore,
          correctCount: session.correctCount,
          totalTimeBonus: session.totalTimeBonus,
          badge: session.badge,
          rounds: session.rounds,
        }),
      }, {
        maxRetries: 2,
        baseDelay: 2000,
      });
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to persist session');
      }

      console.log('Session persisted successfully');
      
      // Clear cached session after successful persistence
      gameStorage.clearSession();
    } catch (err) {
      console.error('Error persisting session:', err);
      
      // Store as pending request for retry when online
      if (err && typeof err === 'object' && 'isNetworkError' in err && !errorHandler.isOnline) {
        const requestId = `persist-session-${session.sessionId}-${Date.now()}`;
        gameStorage.savePendingRequest(requestId, {
          url: '/api/game/results',
          method: 'POST',
          body: {
            sessionId: session.sessionId,
            userId: session.userId,
            totalScore: session.totalScore,
            correctCount: session.correctCount,
            totalTimeBonus: session.totalTimeBonus,
            badge: session.badge,
            rounds: session.rounds,
          },
        });
        console.log('Session persistence queued for when online');
      }
      
      // Don't throw error - this is not critical for user experience
    }
  }, [session, validateSession, errorHandler.isOnline]);

  // Reset game state
  const resetGame = useCallback(() => {
    cleanupSession();
    setGameState('splash');
    setLoading(false);
  }, [cleanupSession]);

  // Initialize game session with enhanced error handling
  const initializeGame = useCallback(async () => {
    const executeInit = async () => {
      setLoading(true);
      setError(null);
      errorHandler.clearError();
      
      try {
        // Try to load from cache first if offline
        if (!errorHandler.isOnline) {
          const cachedSession = gameStorage.getSession();
          if (cachedSession) {
            console.log('Loading cached session for offline play');
            setSession(cachedSession);
            if (cachedSession.completed) {
              setGameState('results');
            } else {
              setGameState('playing');
              setCurrentRound(cachedSession.rounds?.find((r: GameRound) => !r.isCorrect && r.userAnswer === undefined) || null);
            }
            return;
          }
        }
        
        const data: GameInitResponse = await apiCall('/api/game/init', {
          method: 'GET',
        }, {
          maxRetries: 3,
          baseDelay: 1000,
        });
        
        if (data.success) {
          if (data.session) {
            // User has an existing session (already played today)
            setSession(data.session);
            
            // Cache session for offline recovery
            gameStorage.saveSession(data.session);
            
            // If user already completed today's game, show results
            if (data.session.completed) {
              setGameState('results');
            } else {
              // Resume existing game
              await startGame();
            }
          } else {
            // User can play but hasn't started yet - stay on splash screen
            console.log('User can play, ready to start new game');
            setGameState('splash');
          }
        } else {
          console.error('Game initialization failed. Server response:', data);
          throw new Error(data.error || 'Failed to initialize game');
        }
      } catch (err) {
        console.error('Error initializing game:', err);
        errorHandler.handleError(err, 'Failed to initialize game');
        
        // Try to load cached data as fallback
        const cachedSession = gameStorage.getSession();
        if (cachedSession) {
          console.log('Using cached session as fallback');
          setSession(cachedSession);
          setGameState(cachedSession.completed ? 'results' : 'splash');
        } else {
          setError(errorHandler.errorState.message);
          setGameState('error');
        }
      } finally {
        setLoading(false);
      }
    };

    await executeInit();
  }, [errorHandler]);

  // Start a new game with enhanced error handling
  const startGame = useCallback(async () => {
    const executeStart = async () => {
      setLoading(true);
      setError(null);
      errorHandler.clearError();
      
      try {
        const data: StartGameResponse = await apiCall('/api/game/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 'current-user', // This will be handled by Devvit auth
          }),
        }, {
          maxRetries: 3,
          baseDelay: 1000,
        });
        
        console.log('Start game response:', data);
        
        if (data.success && data.currentRound && data.sessionId) {
          console.log('Setting current round:', data.currentRound);
          console.log('Setting session ID:', data.sessionId);
          setCurrentRound(data.currentRound);
          
          // Create a new session object if one doesn't exist
          const updatedSession = session ? 
            { ...session, sessionId: data.sessionId } : 
            {
              userId: 'current-user',
              sessionId: data.sessionId,
              startTime: Date.now(),
              rounds: [],
              totalScore: 0,
              correctCount: 0,
              totalTimeBonus: 0,
              badge: 'human_in_training' as BadgeType,
              completed: false,
              attemptNumber: 1,
              showedEducationalContent: false,
            };
          
          console.log('Setting session:', updatedSession);
          setSession(updatedSession);
          setGameState('playing');
          
          // Cache updated session
          if (updatedSession) {
            gameStorage.saveSession(updatedSession);
          }
        } else {
          console.error('Start game failed. Response:', data);
          console.error('Missing data - success:', data.success, 'currentRound:', !!data.currentRound, 'sessionId:', !!data.sessionId);
          throw new Error(data.error || 'Failed to start game');
        }
      } catch (err) {
        console.error('Error starting game:', err);
        errorHandler.handleError(err, 'Failed to start game');
        setError(errorHandler.errorState.message);
        setGameState('error');
      } finally {
        setLoading(false);
      }
    };

    await executeStart();
  }, [session, errorHandler]);

  // Handle round completion with proper state transitions
  const handleRoundComplete = useCallback((response: SubmitAnswerResponse) => {
    console.log('Round completed with response:', response);
    console.log('Game complete?', response.gameComplete);
    console.log('Has nextRound?', !!response.nextRound);
    console.log('NextRound data:', response.nextRound);
    
    if (!response.success) {
      setError(response.error || 'Failed to submit answer');
      setGameState('error');
      return;
    }

    // Update session with round results
    setSession(prevSession => {
      if (!prevSession) return null;
      
      const updatedSession = { ...prevSession };
      const rounds = [...(updatedSession.rounds || [])];
      
      // Update the current round with results
      if (currentRound) {
        const roundIndex = rounds.findIndex(r => r.roundNumber === currentRound.roundNumber);
        if (roundIndex >= 0 && rounds[roundIndex]) {
          const existingRound = rounds[roundIndex];
          const updatedRound: GameRound = {
            ...existingRound,
          };
          
          if (response.isCorrect !== undefined) {
            updatedRound.userAnswer = response.isCorrect ? currentRound.correctAnswer : 
              (currentRound.correctAnswer === 'A' ? 'B' : 'A');
            updatedRound.isCorrect = response.isCorrect;
          }
          
          if (response.roundScore !== undefined) {
            updatedRound.timeRemaining = Math.round(response.roundScore / 0.01);
          }
          
          rounds[roundIndex] = updatedRound;
        }
      }
      
      updatedSession.rounds = rounds;
      
      // Update running totals
      if (response.isCorrect !== undefined) {
        updatedSession.correctCount = (updatedSession.correctCount || 0) + (response.isCorrect ? 1 : 0);
      }
      
      if (response.roundScore !== undefined) {
        updatedSession.totalScore = (updatedSession.totalScore || 0) + response.roundScore;
      }
      
      return updatedSession;
    });

    // Check if game is complete
    if (response.gameComplete && response.finalResults) {
      // Update session with final results from server
      setSession(prevSession => {
        if (!prevSession) return null;
        
        return {
          ...prevSession,
          totalScore: response.finalResults!.totalScore,
          correctCount: response.finalResults!.correctCount,
          totalTimeBonus: response.finalResults!.timeBonus,
          badge: response.finalResults!.badge,
          completed: true,
        };
      });
      
      setGameState('results');
      setCurrentRound(null);
      
      console.log('Game completed with final results:', response.finalResults);
    } else if (response.nextRound) {
      // Check if we just completed round 3 and should show educational content
      if (currentRound?.roundNumber === 3 && !session?.showedEducationalContent) {
        console.log('Round 3 completed, showing educational content');
        // Store the next round for after educational content
        setCurrentRound(response.nextRound);
        setGameState('educational');
      } else {
        // Move to next round normally
        setCurrentRound(response.nextRound);
        console.log('Moving to round:', response.nextRound.roundNumber);
      }
    } else {
      // Check if we've completed all rounds locally
      const completedRounds = session?.rounds?.filter(r => r.isCorrect !== undefined).length || 0;
      if (completedRounds >= 6) {
        console.log('All rounds completed, calculating final score');
        calculateFinalScore();
        setGameState('results');
        setCurrentRound(null);
      }
    }
  }, [currentRound, session, calculateFinalScore]);

  // Navigation methods
  const goToSplash = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const goToLeaderboard = useCallback(() => {
    setGameState('leaderboard');
  }, []);

  const goBackFromLeaderboard = useCallback(() => {
    if (session?.completed) {
      setGameState('results');
    } else {
      setGameState('splash');
    }
  }, [session?.completed]);

  const continueFromEducational = useCallback(() => {
    // Mark that educational content has been shown
    setSession(prevSession => {
      if (!prevSession) return null;
      return {
        ...prevSession,
        showedEducationalContent: true,
      };
    });
    
    // Continue to next round (round 4)
    setGameState('playing');
  }, []);

  // Auto-persist session when game completes
  useEffect(() => {
    if (session?.completed && gameState === 'results') {
      persistSession();
    }
  }, [session?.completed, gameState, persistSession]);

  // Validate session on state changes
  useEffect(() => {
    if (session && !validateSession()) {
      console.warn('Invalid session detected, resetting game');
      resetGame();
    }
  }, [session, validateSession, resetGame]);

  return {
    // State
    gameState,
    session,
    currentRound,
    error,
    loading,
    
    // Setters
    setGameState,
    setSession,
    setCurrentRound,
    setError,
    setLoading,
    
    // Game flow methods
    initializeGame,
    startGame,
    handleRoundComplete,
    resetGame,
    
    // Navigation methods
    goToSplash,
    goToLeaderboard,
    goBackFromLeaderboard,
    continueFromEducational,
    
    // Session management
    validateSession,
    calculateFinalScore,
    persistSession,
    cleanupSession,
  };
};
