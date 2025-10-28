import React, { useState, useEffect, useRef } from 'react';
import { GameSession, BadgeType, LeaderboardResponse, RealtimeMessage, PlayAttemptsResponse } from '../../shared/types/api';
import { connectRealtime } from '@devvit/web/client';
import { fetchCurrentContentCached } from '../utils/content';
import { useAudio } from '../hooks/useAudio';

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
  const [inspirationalContent, setInspirationalContent] = useState<string>('');
  const [playAttempts, setPlayAttempts] = useState<{
    remainingAttempts: number;
    maxAttempts: number;
    bestScore: number;
  } | null>(null);
  const connectionRef = useRef<any>(null);
  
  // Audio controls
  const audio = useAudio();

  // Badge display configuration - updated for 6-round gameplay
  const getBadgeInfo = (badge: BadgeType) => {
    switch (badge) {
      case BadgeType.AI_WHISPERER:
        return {
          emoji: '🤖',
          title: 'AI Whisperer',
          description: 'Perfect score! You can spot AI-generated content with incredible accuracy.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
        };
      case BadgeType.AI_DETECTIVE:
        return {
          emoji: '🕵️',
          title: 'AI Detective',
          description: 'Outstanding! You have excellent skills at detecting AI-generated content.',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
        };
      case BadgeType.GOOD_SAMARITAN:
        return {
          emoji: '👁️',
          title: 'Good Samaritan',
          description: 'Excellent work! You have a keen eye for distinguishing real from artificial.',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        };
      case BadgeType.JUST_HUMAN:
        return {
          emoji: '👤',
          title: 'Just Human',
          description: 'Not bad! You\'re getting the hang of spotting AI-generated images.',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        };
      case BadgeType.HUMAN_IN_TRAINING:
        return {
          emoji: '🎓',
          title: 'Human in Training',
          description: 'Keep practicing! AI detection skills take time to develop.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        };
    }
  };

  // Fetch user's leaderboard position, inspirational content, and play attempts
  const fetchLeaderboardPosition = async () => {
    try {
      const [leaderboardResponse, contentResponse, playAttemptsResponse] = await Promise.all([
        fetch(`/api/leaderboard/user-rank/daily`),
        fetchCurrentContentCached(),
        fetch(`/api/game/play-attempts`)
      ]);
      
      const leaderboardData: LeaderboardResponse = await leaderboardResponse.json();
      
      if (leaderboardData.success) {
        setLeaderboardPosition(leaderboardData.userRank || null);
        setTotalParticipants(leaderboardData.totalParticipants || null);
      }
      
      if (contentResponse.success && contentResponse.inspiration) {
        setInspirationalContent(contentResponse.inspiration);
      } else {
        // Fallback inspirational content
        setInspirationalContent('Every expert was once a beginner. Keep practicing!');
      }

      const playAttemptsData: PlayAttemptsResponse = await playAttemptsResponse.json();
      if (playAttemptsData.success) {
        setPlayAttempts({
          remainingAttempts: playAttemptsData.remainingAttempts || 0,
          maxAttempts: playAttemptsData.maxAttempts || 2,
          bestScore: playAttemptsData.bestScore || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set fallback content
      setInspirationalContent('Practice makes perfect - each game makes you better!');
    } finally {
      setLoading(false);
    }
  };

  // Generate share message for general sharing
  const generateShareMessage = () => {
    const badgeInfo = getBadgeInfo(session.badge);
    const position = leaderboardPosition ? `#${leaderboardPosition}` : 'Unranked';
    const attemptText = session.attemptNumber > 1 ? ` (Attempt ${session.attemptNumber})` : '';
    const canPlayAgain = playAttempts && playAttempts.remainingAttempts > 0;
    
    // Show improvement if this is a second attempt and score improved
    const improvementText = session.attemptNumber > 1 && playAttempts && session.totalScore > playAttempts.bestScore 
      ? `\n🚀 Improved from my previous best: ${playAttempts.bestScore.toFixed(2)} points!` 
      : '';
    
    // Show best score context if this is not the best attempt
    const bestScoreContext = playAttempts && session.totalScore < playAttempts.bestScore 
      ? `\n💪 My best today: ${playAttempts.bestScore.toFixed(2)} points` 
      : '';
    
    // Encourage replay or challenge others
    const challengeText = canPlayAgain 
      ? `I still have ${playAttempts?.remainingAttempts} attempt${playAttempts?.remainingAttempts === 1 ? '' : 's'} left - going for a higher score!` 
      : 'Can you beat my score? Try today\'s challenge!';
    
    return `🤖 Spot the Bot - Daily Challenge Results 🤖

📊 Score: ${session.totalScore.toFixed(2)} points${attemptText}
✅ Correct: ${session.correctCount}/6
⚡ Time Bonus: +${session.totalTimeBonus.toFixed(2)}
🏆 Badge: ${badgeInfo.emoji} ${badgeInfo.title}
📈 Rank: ${position}${totalParticipants ? ` of ${totalParticipants}` : ''}${improvementText}${bestScoreContext}

${challengeText}
#SpotTheBot #AIChallenge`;
  };

  // Generate share message specifically for friends
  const generateFriendsShareMessage = () => {
    const badgeInfo = getBadgeInfo(session.badge);
    const position = leaderboardPosition ? `#${leaderboardPosition}` : 'Unranked';
    const attemptText = session.attemptNumber > 1 ? ` (Attempt ${session.attemptNumber})` : '';
    const canPlayAgain = playAttempts && playAttempts.remainingAttempts > 0;
    
    // Show improvement if this is a second attempt and score improved
    const improvementText = session.attemptNumber > 1 && playAttempts && session.totalScore > playAttempts.bestScore 
      ? `\n🚀 Just improved from ${playAttempts.bestScore.toFixed(2)} points - getting better at this!` 
      : '';
    
    // Show best score context if this is not the best attempt
    const bestScoreContext = playAttempts && session.totalScore < playAttempts.bestScore 
      ? `\n💪 My best score today is still ${playAttempts.bestScore.toFixed(2)} points though!` 
      : '';
    
    // Encourage friends to play with context about attempts
    let friendChallenge = '';
    if (canPlayAgain) {
      friendChallenge = `I still have ${playAttempts?.remainingAttempts} more attempt${playAttempts?.remainingAttempts === 1 ? '' : 's'} today - going to try to beat this score! 💪

Want to see if you can beat me before I get my next try? 😏`;
    } else {
      const attemptContext = session.attemptNumber > 1 
        ? 'After using both my daily attempts, this is my final score for today!' 
        : 'Used my daily attempts and this is where I landed!';
      
      friendChallenge = `${attemptContext}

Think you can spot AI better than me? You get 2 attempts per day - give it a shot! 🎯`;
    }
    
    return `Hey friends! 👋 Just finished today's Spot the Bot challenge:

🤖 Daily AI Detection Results:
📊 Final Score: ${session.totalScore.toFixed(2)} points${attemptText}
✅ Correct Guesses: ${session.correctCount}/6 images
🏆 Badge Earned: ${badgeInfo.emoji} ${badgeInfo.title}
📈 Daily Rank: ${position}${totalParticipants ? ` of ${totalParticipants} players` : ''}${improvementText}${bestScoreContext}

${friendChallenge}

Some of these AI images are getting scary good - it's actually a fun challenge! 🤯

#SpotTheBot #AIChallenge #FriendsChallenge`;
  };

  // Handle general share button click
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

  // Handle share with friends button click
  const handleShareWithFriends = async () => {
    const shareText = generateFriendsShareMessage();
    
    try {
      if (navigator.share) {
        // Use native sharing if available (mobile)
        await navigator.share({
          title: 'Spot the Bot - Challenge Your Friends!',
          text: shareText,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('Error sharing with friends:', error);
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
    
    // Play ending sound based on performance
    const playEndingSound = () => {
      if (session.correctCount >= 5) {
        // Excellent performance (5-6 correct)
        audio?.playSuccessSound();
      } else if (session.correctCount >= 3) {
        // Good performance (3-4 correct)
        audio?.playSuccessSound();
      } else {
        // Poor performance (0-2 correct)
        audio?.playFailureSound();
      }
    };
    
    // Delay the sound slightly to let the component render
    const soundTimeout = setTimeout(playEndingSound, 500);
    
    // Cleanup on unmount
    return () => {
      clearTimeout(soundTimeout);
      if (connectionRef.current) {
        connectionRef.current.disconnect();
      }
    };
  }, [session.correctCount, audio]);

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
              Total Score {session.attemptNumber > 1 ? `(Attempt ${session.attemptNumber})` : ''}
            </div>
            
            {/* Show improvement or best score context */}
            {session.attemptNumber > 1 && playAttempts && (
              <div className="mt-2">
                {session.totalScore > playAttempts.bestScore ? (
                  <div className="text-sm text-green-600 font-medium">
                    🚀 Improved from {playAttempts.bestScore.toFixed(2)} points!
                  </div>
                ) : session.totalScore < playAttempts.bestScore ? (
                  <div className="text-sm text-orange-600 font-medium">
                    💪 Best today: {playAttempts.bestScore.toFixed(2)} points
                  </div>
                ) : (
                  <div className="text-sm text-blue-600 font-medium">
                    🎯 Matched your best score!
                  </div>
                )}
              </div>
            )}
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

        {/* Inspirational Content - Daily rotating quotes and jokes */}
        {inspirationalContent && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-3xl mb-3">✨</div>
            <p className="text-gray-700 italic leading-relaxed text-sm md:text-base">
              "{inspirationalContent}"
            </p>
            <div className="text-xs text-gray-500 mt-2">
              Daily inspiration • New content every day
            </div>
          </div>
        )}

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
          {/* Enhanced Sharing Options */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShare}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <span>📤</span>
              Share Results
            </button>
            <button
              onClick={handleShareWithFriends}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <span>👥</span>
              Challenge Friends
            </button>
          </div>

          {/* Play Again Button - only show if attempts remain */}
          {playAttempts && playAttempts.remainingAttempts > 0 && onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <span>🎮</span>
              Play Again ({playAttempts.remainingAttempts} left)
            </button>
          )}

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
          {playAttempts && playAttempts.remainingAttempts > 0 ? (
            <div className="space-y-1">
              <p className="text-xs text-gray-400">
                {playAttempts.remainingAttempts} attempt{playAttempts.remainingAttempts === 1 ? '' : 's'} remaining today
              </p>
              <p className="text-xs text-indigo-600 font-medium">
                {session.totalScore >= playAttempts.bestScore 
                  ? 'Great score! Share with friends or try to beat it!' 
                  : 'Think you can improve? Give it another shot!'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs text-gray-400">
                All attempts used for today
              </p>
              <p className="text-xs text-indigo-600 font-medium">
                Share your results and come back tomorrow for a new challenge!
              </p>
            </div>
          )}
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
