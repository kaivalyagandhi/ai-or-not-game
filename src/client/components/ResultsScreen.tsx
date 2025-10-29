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
  
  // Animation states
  const [showHeader, setShowHeader] = useState(false);
  const [showFirstRow, setShowFirstRow] = useState(false);
  const [showSecondRow, setShowSecondRow] = useState(false);
  
  // Audio controls
  const audio = useAudio();

  // Badge display configuration - updated for 6-round gameplay
  const getBadgeInfo = (badge: BadgeType) => {
    switch (badge) {
      case BadgeType.AI_WHISPERER:
        return {
          emoji: '🤖',
          title: 'AI WHISPERER',
          description: 'Perfect score! Incredible accuracy.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
        };
      case BadgeType.AI_DETECTIVE:
        return {
          emoji: '🕵️',
          title: 'AI DETECTIVE',
          description: 'Outstanding detection skills!',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
        };
      case BadgeType.GOOD_SAMARITAN:
        return {
          emoji: '👁️',
          title: 'GOOD SAMARITAN',
          description: 'Excellent eye for detail!',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        };
      case BadgeType.JUST_HUMAN:
        return {
          emoji: '👤',
          title: 'JUST HUMAN',
          description: 'Getting the hang of it!',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        };
      case BadgeType.HUMAN_IN_TRAINING:
        return {
          emoji: '🎓',
          title: 'HUMAN IN TRAINING',
          description: 'Keep practicing!',
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

  // Generate share message for challenging friends
  const generateShareMessage = () => {
    const badgeInfo = getBadgeInfo(session.badge);
    const position = leaderboardPosition ? `#${leaderboardPosition}` : 'Unranked';
    const attemptText = session.attemptNumber > 1 ? ` (Attempt ${session.attemptNumber})` : '';
    const canPlayAgain = playAttempts && playAttempts.remainingAttempts > 0;
    
    // Show improvement if this is a second attempt and score improved
    const improvementText = session.attemptNumber > 1 && playAttempts && session.totalScore > playAttempts.bestScore 
      ? `\n🚀 Just improved from ${Math.round(playAttempts.bestScore)} points - getting better at this!` 
      : '';
    
    // Show best score context if this is not the best attempt
    const bestScoreContext = playAttempts && session.totalScore < playAttempts.bestScore 
      ? `\n💪 My best score today is still ${Math.round(playAttempts.bestScore)} points though!` 
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
📊 Final Score: ${Math.round(session.totalScore)} points${attemptText}
✅ Correct Guesses: ${session.correctCount}/6 images
🏆 Badge Earned: ${badgeInfo.emoji} ${badgeInfo.title}
📈 Daily Rank: ${position}${totalParticipants ? ` of ${totalParticipants} players` : ''}${improvementText}${bestScoreContext}

${friendChallenge}

Some of these AI images are getting scary good - it's actually a fun challenge! 🤯

#SpotTheBot #AIChallenge #FriendsChallenge`;
  };

  // Handle share button click
  const handleShare = async () => {
    const shareText = generateShareMessage();
    
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
    
    // Don't play ending sound after final round - let the game end naturally without additional audio
    // The success/failure sounds during gameplay are sufficient feedback
    
    // Staggered animation sequence
    const animationSequence = async () => {
      // Show header first
      setTimeout(() => setShowHeader(true), 100);
      // Show first row (score and badge)
      setTimeout(() => setShowFirstRow(true), 400);
      // Show second row (rankings and buttons) after first row is visible
      setTimeout(() => setShowSecondRow(true), 800);
    };
    
    animationSequence();
    
    // Cleanup on unmount
    return () => {
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
        <div className={`text-center transition-all duration-500 ${showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Challenge Complete!
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Score and Badge - Horizontal Layout */}
        <div className={`results-horizontal-layout transition-all duration-500 ${showFirstRow ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Score Display */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {Math.round(session.totalScore)}
              </div>
              <div className="text-sm text-gray-500 uppercase tracking-wide">
                Total Score {session.attemptNumber > 1 ? `(Attempt ${session.attemptNumber})` : ''}
              </div>
              
              {/* Show improvement or best score context */}
              {session.attemptNumber > 1 && playAttempts && (
                <div className="mt-2">
                  {session.totalScore > playAttempts.bestScore ? (
                    <div className="text-sm text-green-600 font-medium">
                      🚀 Improved from {Math.round(playAttempts.bestScore)} points!
                    </div>
                  ) : session.totalScore < playAttempts.bestScore ? (
                    <div className="text-sm text-orange-600 font-medium">
                      💪 Best today: {Math.round(playAttempts.bestScore)} points
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
                <div className="text-xs text-gray-500 leading-tight">
                  Correct<br />Answers
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-blue-600">
                  +{Math.round(session.totalTimeBonus)}
                </div>
                <div className="text-xs text-gray-500 leading-tight">
                  Time<br />Bonus
                </div>
              </div>
            </div>
          </div>

          {/* Badge Display */}
          <div className={`${badgeInfo.bgColor} rounded-lg p-6 text-center`}>
            <div className="mb-3">
              <div className="text-4xl mb-2">{badgeInfo.emoji}</div>
              <h3 className={`text-xl font-bold ${badgeInfo.color}`}>
                {badgeInfo.title}
              </h3>
            </div>
            <p className="text-sm text-gray-700">
              {badgeInfo.description}
            </p>
          </div>
        </div>



        {/* Rankings and Action Buttons - Horizontal Layout */}
        <div className={`results-horizontal-layout transition-all duration-500 ${showSecondRow ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Rankings Section */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="text-sm text-gray-500 uppercase tracking-wide">
                  RANKINGS
                </div>
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
              
              {/* Integrated View Leaderboard Button */}
              {onViewLeaderboard && (
                <button
                  onClick={onViewLeaderboard}
                  className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
                >
                  <span>🏆</span>
                  View Leaderboard
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Challenge Friends Button */}
            <button
              onClick={handleShare}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <span>👥</span>
              Challenge Friends
            </button>

            {/* Play Again Button - only show if attempts remain */}
            {playAttempts && playAttempts.remainingAttempts > 0 && onPlayAgain && (
              <button
                onClick={onPlayAgain}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <span>🎮</span>
                Play Again
              </button>
            )}
          </div>
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
