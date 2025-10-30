import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/network';

interface SplashScreenProps {
  onStartGame: () => void;
  onViewLeaderboard?: () => void;
}

interface WeeklyRankData {
  userRank: number | null;
  totalParticipants: number | null;
  loading: boolean;
  error?: string;
}

interface DailyPlayData {
  playCount: number;
  maxAttempts: number;
  loading: boolean;
  error?: string;
}

interface DailyParticipantsData {
  count: number;
  loading: boolean;
  error?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStartGame, onViewLeaderboard }) => {
  const [weeklyRank, setWeeklyRank] = useState<WeeklyRankData>({
    userRank: null,
    totalParticipants: null,
    loading: true,
  });

  const [dailyPlayData, setDailyPlayData] = useState<DailyPlayData>({
    playCount: 0,
    maxAttempts: 2,
    loading: true,
  });

  const [dailyParticipants, setDailyParticipants] = useState<DailyParticipantsData>({
    count: 0,
    loading: true,
  });

  // Animation states
  const [showHeader, setShowHeader] = useState(false);
  const [showDataBoxes, setShowDataBoxes] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Get current date in a shorter format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
  };

  // Fetch weekly ranking data and daily play count
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch weekly rank
        setWeeklyRank(prev => ({ ...prev, loading: true }));
        
        const weeklyResponse = await fetch('/api/leaderboard/user-rank/weekly');
        const weeklyData = await weeklyResponse.json();
        
        if (weeklyData.success) {
          setWeeklyRank({
            userRank: weeklyData.userRank,
            totalParticipants: weeklyData.totalParticipants,
            loading: false,
          });
        } else {
          setWeeklyRank(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Failed to load ranking data' 
          }));
        }

        // Fetch daily play count and participants count
        setDailyPlayData(prev => ({ ...prev, loading: true }));
        setDailyParticipants(prev => ({ ...prev, loading: true }));
        
        const [playResponse, participantsResponse] = await Promise.all([
          fetch('/api/game/play-attempts'),
          fetch('/api/participants/count?type=daily')
        ]);
        
        const playData = await playResponse.json();
        const participantsData = await participantsResponse.json();
        
        if (playData.success) {
          setDailyPlayData({
            playCount: playData.attempts || 0,
            maxAttempts: playData.maxAttempts || 2,
            loading: false,
          });
        } else {
          setDailyPlayData(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Failed to load play data' 
          }));
        }

        if (participantsData.success) {
          setDailyParticipants({
            count: participantsData.count || 0,
            loading: false,
          });
        } else {
          setDailyParticipants(prev => ({ 
            ...prev, 
            loading: false, 
            error: 'Failed to load participants data' 
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setWeeklyRank(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to load ranking data' 
        }));
        setDailyPlayData(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to load play data' 
        }));
        setDailyParticipants(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to load participants data' 
        }));
      }
    };

    fetchData();
  }, []);

  // Animation sequence
  useEffect(() => {
    const animationSequence = async () => {
      // Show header first
      setTimeout(() => setShowHeader(true), 100);
      
      // Show data boxes
      setTimeout(() => setShowDataBoxes(true), 400);
      
      // Show button last
      setTimeout(() => setShowButton(true), 700);
    };

    animationSequence();
  }, []);





  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Game Logo/Title */}
        <div className={`space-y-3 transition-all duration-500 ${showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl font-bold text-primary-500 mb-2">
            AI or Not?
          </h1>
          <p className="text-lg text-gray-600">
            Train your human eye to detect AI images
          </p>
        </div>

        {/* Current Date and Instructions - Horizontal Layout */}
        <div className={`splash-horizontal-layout transition-all duration-500 ${showDataBoxes ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Current Date */}
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
              Daily Challenge
            </p>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              {getCurrentDate()}
            </p>
            
            {/* Gray divider */}
            <div className="w-full h-px bg-gray-500 mb-3"></div>
            
            {(dailyPlayData.loading || dailyParticipants.loading) ? (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">🎮 Plays:</span> {dailyPlayData.error ? '--' : dailyPlayData.playCount}/{dailyPlayData.maxAttempts}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">👥 Players Today:</span> {dailyParticipants.error ? '--' : dailyParticipants.count.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Rankings Box */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mb-3 text-center">
              Weekly Rankings
            </p>
            
            {weeklyRank.loading ? (
              <div className="flex items-center justify-center py-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
              </div>
            ) : weeklyRank.error ? (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Unable to load rankings</p>
                {onViewLeaderboard && (
                  <button
                    onClick={onViewLeaderboard}
                    className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm btn-text"
                  >
                    <span>🏆</span>
                    Leaderboard
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center">
                {weeklyRank.userRank ? (
                  <div className="mb-3">
                    <p className="text-lg font-semibold text-gray-900">
                      #{weeklyRank.userRank}
                    </p>
                    <p className="text-sm text-gray-500">
                      of {weeklyRank.totalParticipants} players
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-3">
                    Play to get ranked!
                  </p>
                )}
                
                {onViewLeaderboard && (
                  <button
                    onClick={onViewLeaderboard}
                    className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm btn-text"
                  >
                    <span>🏆</span>
                    Leaderboard
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Start Game Button */}
        <div className={`transition-all duration-500 ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {(() => {
            const hasReachedLimit = !dailyPlayData.loading && dailyPlayData.playCount >= dailyPlayData.maxAttempts;
            const buttonText = hasReachedLimit ? 'Come back tomorrow!' : 'Start Playing!';
            
            return (
              <button
                onClick={async () => {
                  if (hasReachedLimit) return; // Prevent action if limit reached
                  
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
                disabled={hasReachedLimit}
                className={`w-full font-bold py-4 px-6 rounded-lg text-lg transition-colors duration-200 shadow-lg btn-text ${
                  hasReachedLimit 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-primary-500 hover:bg-primary-600 text-white hover:shadow-xl transform hover:scale-105 transition-transform'
                }`}
              >
                <span className="magnify-wave-text btn-text">
                  {buttonText.split('').map((char, index) => (
                    <span key={index} className="char">
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </span>
              </button>
            );
          })()}
          
          {/* Daily limit message */}
          {!dailyPlayData.loading && dailyPlayData.playCount >= dailyPlayData.maxAttempts && (
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600">
                🎯 You've completed your daily challenges!
              </p>
              <p className="text-xs text-gray-500 mt-1">
                New challenges available tomorrow at midnight UTC
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
