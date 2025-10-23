import React, { useState, useEffect, useRef } from 'react';
import { GameSession, BadgeType, LeaderboardResponse, RealtimeMessage } from '../../shared/types/api';
import { connectRealtime } from '@devvit/web/client';

interface ResultsScreenProps {
  session: GameSession;
  onPlayAgain?: () => void;
  onViewLeaderboard?: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ 
  session, 
  onPlayAgain, 
  onViewLeaderboard 
}) => {
  const [leaderboardPosition, setLeaderboardPosition] = useState<number | null>(null);
  const [totalParticipants, setTotalParticipants] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<any>(null);

  // Badge display configuration
  const getBadgeInfo = (badge: BadgeType) => {
    switch (badge) {
      case BadgeType.AI_WHISPERER:
        return {
          emoji: '🧙‍♂️',
          title: 'AI Whisperer',
          description: 'Perfect score! You can spot AI from a mile away.',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
        };
      case BadgeType.GOOD_SAMARITAN:
        return {
          emoji: '😇',
          title: 'Good Samaritan',
          description: 'Great job! You got most of them right.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        };
      case BadgeType.JUST_HUMAN:
        return {
          emoji: '🙂',
          title: 'Just Human',
          description: 'Not bad! You\'re getting the hang of this.',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        };
      case BadgeType.HUMAN_IN_TRAINING:
        return {
          emoji: '🤖',
          title: 'Human in Training',
          description: 'Keep practicing! AI is getting better every day.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        };
    }
  };

  // Fetch user's leaderboard position
  const fetchLeaderboardPosition = async () => {
    try {
      const response = await fetch(`/api/leaderboard/user-rank/daily`);
      const data: LeaderboardResponse = await response.json();
      
      if (data.success) {
        setLeaderboardPosition(data.userRank || null);
        setTotalParticipants(data.totalParticipants || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard position:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate share message
  const generateShareMessage = () => {
    const badgeInfo = getBadgeInfo(session.badge);
    const position = leaderboardPosition ? `#${leaderboardPosition}` : 'Unranked';
    
    return `🤖 Spot the Bot - Daily Challenge Results 🤖

📊 Score: ${session.totalScore.toFixed(2)} points
✅ Correct: ${session.correctCount}/5
⚡ Time Bonus: +${session.totalTimeBonus.toFixed(2)}
🏆 Badge: ${badgeInfo.emoji} ${badgeInfo.title}
📈 Rank: ${position}${totalParticipants ? ` of ${totalParticipants}` : ''}

Can you beat my score? Try today's challenge!
#SpotTheBot #AIChallenge`;
  };

  // Handle share button click
  const handleShare = async () => {
    const shareText = generateShareMessage();
    
    try {
      if (navigator.share) {
        // Use native sharing if available (mobile)
        await navigator.share({
          title: 'Spot the Bot - My Results',
          text: shareText,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to clipboard even if share fails
      try {
        await navigator.clipboard.writeText(shareText);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
      }
    }
  };

  // Set up realtime connection for live rank updates
  const setupRealtimeConnection = async () => {
    try {
      const connection = await connectRealtime({
        channel: 'leaderboard_updates',
        onConnect: (channel) => {
          console.log(`Connected to ${channel} for results screen`);
          setIsConnected(true);
        },
        onDisconnect: (channel) => {
          console.log(`Disconnected from ${channel} for results screen`);
          setIsConnected(false);
        },
        onMessage: (data: any) => {
          console.log('Received leaderboard realtime message in results:', data);
          
          const message = data as RealtimeMessage;
          
          if (message.type === 'rank_update') {
            // Update user rank if it's for the current user and daily leaderboard
            if (message.userId === session.userId && message.leaderboardType === 'daily') {
              setLeaderboardPosition(message.newRank);
              setTotalParticipants(message.totalParticipants);
            }
          }
        },
      });

      connectionRef.current = connection;
    } catch (err) {
      console.error('Error setting up results realtime connection:', err);
    }
  };

  useEffect(() => {
    fetchLeaderboardPosition();
    setupRealtimeConnection();
    
    // Cleanup on unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.disconnect();
      }
    };
  }, []);

  const badgeInfo = getBadgeInfo(session.badge);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Challenge Complete!
          </h1>
          <p className="text-gray-600">
            Here's how you did today
          </p>
        </div>

        {/* Score Display */}
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {session.totalScore.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 uppercase tracking-wide">
              Total Score
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold text-green-600">
                {session.correctCount}
              </div>
              <div className="text-xs text-gray-500">Correct Answers</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-blue-600">
                +{session.totalTimeBonus.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">Time Bonus</div>
            </div>
          </div>
        </div>

        {/* Badge Display */}
        <div className={`${badgeInfo.bgColor} rounded-lg p-6 text-center`}>
          <div className="text-5xl mb-3">{badgeInfo.emoji}</div>
          <h3 className={`text-xl font-bold ${badgeInfo.color} mb-2`}>
            {badgeInfo.title}
          </h3>
          <p className="text-sm text-gray-700">
            {badgeInfo.description}
          </p>
        </div>

        {/* Leaderboard Position */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="text-sm text-gray-500 uppercase tracking-wide">
                Daily Leaderboard
              </div>
              {isConnected && (
                <div className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1"></div>
                  <span className="text-xs text-green-600">Live</span>
                </div>
              )}
            </div>
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : leaderboardPosition ? (
              <div>
                <div className="text-2xl font-bold text-indigo-600">
                  #{leaderboardPosition}
                </div>
                {totalParticipants && (
                  <div className="text-sm text-gray-500">
                    out of {totalParticipants.toLocaleString()} players
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">
                Position not available
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleShare}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <span>📤</span>
            Share Results
          </button>

          {onViewLeaderboard && (
            <button
              onClick={onViewLeaderboard}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>🏆</span>
              View Leaderboard
            </button>
          )}

          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Back to Home
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Come back tomorrow for a new challenge!
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <span>✅</span>
            Results copied to clipboard!
          </div>
        </div>
      )}
    </div>
  );
};
