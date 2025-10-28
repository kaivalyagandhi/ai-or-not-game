import React, { useState, useEffect, useRef } from 'react';
import { ParticipantCountResponse, RealtimeMessage, PlayAttemptsResponse } from '../../shared/types/api';
import { connectRealtime } from '@devvit/web/client';
import { apiCall } from '../utils/network';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { gameStorage } from '../utils/storage';

interface SplashScreenProps {
  onStartGame: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStartGame }) => {
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [playAttempts, setPlayAttempts] = useState<{
    attempts: number;
    maxAttempts: number;
    remainingAttempts: number;
    bestScore: number;
  } | null>(null);
  const [playAttemptsLoading, setPlayAttemptsLoading] = useState(true);
  const connectionRef = useRef<any>(null);
  
  // Enhanced error handling
  const errorHandler = useErrorHandler({
    enableOfflineDetection: true,
    enableAutoRetry: true,
    autoRetryDelay: 5000,
    maxAutoRetries: 3,
  });

  // Get current date in a readable format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fetch play attempts data
  const fetchPlayAttempts = async () => {
    try {
      const data: PlayAttemptsResponse = await apiCall('/api/game/play-attempts', {
        method: 'GET',
      }, {
        maxRetries: 2,
        baseDelay: 1000,
      });
      
      if (data.success) {
        setPlayAttempts({
          attempts: data.attempts || 0,
          maxAttempts: data.maxAttempts || 2,
          remainingAttempts: data.remainingAttempts || 0,
          bestScore: data.bestScore || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching play attempts:', err);
      // Set default values on error
      setPlayAttempts({
        attempts: 0,
        maxAttempts: 2,
        remainingAttempts: 2,
        bestScore: 0,
      });
    } finally {
      setPlayAttemptsLoading(false);
    }
  };

  // Fetch initial participant count with enhanced error handling
  const fetchParticipantCount = async () => {
    const executeFetch = async () => {
      try {
        // Try cached data first if offline
        if (!errorHandler.isOnline) {
          const cachedData = gameStorage.getCachedLeaderboard('participant-count');
          if (cachedData) {
            console.log('Using cached participant count');
            setParticipantCount(cachedData.count || 0);
            setError(null);
            setLoading(false);
            return;
          }
        }
        
        const data: ParticipantCountResponse = await apiCall('/api/participants/count', {
          method: 'GET',
        }, {
          maxRetries: 3,
          baseDelay: 1000,
        });
        
        if (data.success && data.count !== undefined) {
          setParticipantCount(data.count);
          setError(null);
          
          // Cache the result
          gameStorage.cacheLeaderboard('participant-count', { count: data.count });
        } else {
          throw new Error(data.error || 'Failed to load participant count');
        }
      } catch (err) {
        console.error('Error fetching participant count:', err);
        errorHandler.handleError(err, 'Failed to load participant count');
        
        // Try cached data as fallback
        const cachedData = gameStorage.getCachedLeaderboard('participant-count');
        if (cachedData) {
          console.log('Using cached participant count as fallback');
          setParticipantCount(cachedData.count || 0);
          setError('Using cached data (offline)');
        } else {
          setError(errorHandler.errorState.message);
        }
      } finally {
        setLoading(false);
      }
    };

    await executeFetch();
  };

  // Set up realtime connection for live participant updates
  const setupRealtimeConnection = async () => {
    try {
      const connection = await connectRealtime({
        channel: 'participant_updates',
        onConnect: (channel) => {
          console.log(`Connected to ${channel}`);
          setIsConnected(true);
          setError(null);
        },
        onDisconnect: (channel) => {
          console.log(`Disconnected from ${channel}`);
          setIsConnected(false);
        },
        onMessage: (data: any) => {
          console.log('Received realtime message:', data);
          
          const message = data as RealtimeMessage;
          if (message.type === 'participant_count_update') {
            setParticipantCount(message.count);
          } else if (message.type === 'participant_join') {
            console.log(`User ${message.username} joined the game`);
          } else if (message.type === 'participant_leave') {
            console.log(`User ${message.userId} left the game`);
          }
        },
      });

      connectionRef.current = connection;
    } catch (err) {
      console.error('Error setting up realtime connection:', err);
      setError('Failed to connect to live updates');
    }
  };

  useEffect(() => {
    // Fetch initial data
    fetchParticipantCount();
    fetchPlayAttempts();
    
    // Set up realtime connection
    setupRealtimeConnection();
    
    // Cleanup on unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Game Logo/Title */}
        <div className="space-y-4">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Spot the Bot
          </h1>
          <p className="text-lg text-gray-600">
            Can you tell AI from reality?
          </p>
        </div>

        {/* Current Date */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
            Daily Challenge
          </p>
          <p className="text-lg font-semibold text-gray-900">
            {getCurrentDate()}
          </p>
        </div>

        {/* Play Attempts and Best Score */}
        {!playAttemptsLoading && playAttempts && (
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-3">
              Your Progress
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">
                  {playAttempts.remainingAttempts}
                </p>
                <p className="text-xs text-gray-500">
                  Attempts Left
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {playAttempts.bestScore > 0 ? playAttempts.bestScore.toFixed(2) : '—'}
                </p>
                <p className="text-xs text-gray-500">
                  Best Score
                </p>
              </div>
            </div>
            {playAttempts.remainingAttempts === 0 && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-center">
                <p className="text-sm text-yellow-700">
                  Daily limit reached. Come back tomorrow!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Participant Counter */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
              Players Today
            </p>
            {isConnected && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                <span className="text-xs text-green-600">Live</span>
              </div>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div>
              <p className="text-red-500 text-sm">{error}</p>
              {!isConnected && (
                <p className="text-xs text-gray-400 mt-1">Trying to reconnect...</p>
              )}
            </div>
          ) : (
            <p className="text-2xl font-bold text-indigo-600">
              {participantCount.toLocaleString()}
            </p>
          )}
        </div>

        {/* Game Instructions */}
        <div className="bg-white rounded-lg p-6 shadow-sm text-left">
          <h3 className="font-semibold text-gray-900 mb-3">How to Play:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-2">1.</span>
              You'll see 6 pairs of images
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-2">2.</span>
              Pick the REAL photo (not AI-generated)
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-2">3.</span>
              You have 10 seconds per round
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 font-bold mr-2">4.</span>
              Faster correct answers = higher score!
            </li>
          </ul>
        </div>

        {/* Start Game Button */}
        <button
          onClick={async () => {
            // Check if user can play
            if (playAttempts && playAttempts.remainingAttempts === 0) {
              return; // Button should be disabled, but just in case
            }

            // Register participant join when starting game with error handling
            try {
              await apiCall('/api/participants/join', {
                method: 'POST',
              }, {
                maxRetries: 1,
                baseDelay: 500,
              });
            } catch (err) {
              console.error('Error registering participant:', err);
              // Continue with game start even if registration fails
              // This is not critical for gameplay
            }
            onStartGame();
          }}
          disabled={playAttempts?.remainingAttempts === 0}
          className={`w-full font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg ${
            playAttempts?.remainingAttempts === 0
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-xl transform hover:scale-105 transition-transform'
          }`}
        >
          {playAttempts?.remainingAttempts === 0 ? 'Daily Limit Reached' : 'Start Playing'}
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-400 mt-8">
          {playAttempts?.maxAttempts === 999 
            ? 'Unlimited attempts (dev mode) • Compete on the leaderboard'
            : `${playAttempts?.maxAttempts || 2} attempts per day • Compete on the leaderboard`
          }
        </p>
      </div>
    </div>
  );
};
