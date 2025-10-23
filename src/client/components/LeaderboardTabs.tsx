import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, LeaderboardResponse, UserRankResponse } from '../../shared/types/api';

type LeaderboardType = 'daily' | 'weekly' | 'all-time';

interface LeaderboardTabsProps {
  currentUserId?: string | undefined;
  onClose?: () => void;
}

export const LeaderboardTabs: React.FC<LeaderboardTabsProps> = ({ 
  currentUserId, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('daily');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab configuration
  const tabs = [
    { id: 'daily' as LeaderboardType, label: 'Daily', icon: '📅' },
    { id: 'weekly' as LeaderboardType, label: 'Weekly', icon: '📊' },
    { id: 'all-time' as LeaderboardType, label: 'All Time', icon: '🏆' },
  ];

  // Fetch leaderboard data
  const fetchLeaderboard = async (type: LeaderboardType) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch leaderboard entries
      const leaderboardResponse = await fetch(`/api/leaderboard/${type}?limit=50`);
      const leaderboardData: LeaderboardResponse = await leaderboardResponse.json();

      if (!leaderboardData.success) {
        throw new Error(leaderboardData.error || 'Failed to fetch leaderboard');
      }

      setEntries(leaderboardData.entries || []);
      setTotalParticipants(leaderboardData.totalParticipants || 0);

      // Fetch user rank if user ID is available
      if (currentUserId) {
        const rankResponse = await fetch(`/api/leaderboard/user-rank/${type}`);
        const rankData: UserRankResponse = await rankResponse.json();

        if (rankData.success && rankData.rank) {
          setUserRank(rankData.rank);
        } else {
          setUserRank(null);
        }
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (type: LeaderboardType) => {
    setActiveTab(type);
  };

  // Get badge emoji
  const getBadgeEmoji = (badge: string) => {
    switch (badge) {
      case 'ai_whisperer':
        return '🧙‍♂️';
      case 'good_samaritan':
        return '😇';
      case 'just_human':
        return '🙂';
      case 'human_in_training':
        return '🤖';
      default:
        return '🏅';
    }
  };

  // Format score display
  const formatScore = (score: number) => {
    return score.toFixed(2);
  };

  // Check if entry is current user
  const isCurrentUser = (entry: LeaderboardEntry) => {
    return currentUserId && entry.userId === currentUserId;
  };

  // Load data when tab changes
  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab, currentUserId]);

  return (
    <div className="flex flex-col h-full max-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* User Rank Summary */}
      {userRank && !loading && (
        <div className="p-4 bg-indigo-50 border-b border-indigo-100">
          <div className="text-center">
            <div className="text-sm text-indigo-600 font-medium">Your Rank</div>
            <div className="text-2xl font-bold text-indigo-700">
              #{userRank}
            </div>
            <div className="text-xs text-indigo-500">
              out of {totalParticipants.toLocaleString()} players
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-500">Loading leaderboard...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="text-4xl">😵</div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchLeaderboard(activeTab)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="text-4xl">🏆</div>
              <p className="text-gray-500">No players yet</p>
              <p className="text-sm text-gray-400">
                Be the first to complete today's challenge!
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {entries.map((entry, index) => {
              const rank = index + 1;
              const isUser = isCurrentUser(entry);
              
              return (
                <div
                  key={`${entry.userId}-${entry.completedAt}`}
                  className={`p-4 transition-colors ${
                    isUser 
                      ? 'bg-indigo-50 border-l-4 border-indigo-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Rank and User Info */}
                    <div className="flex items-center space-x-3">
                      {/* Rank */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        rank === 1 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : rank === 2 
                          ? 'bg-gray-100 text-gray-800'
                          : rank === 3
                          ? 'bg-orange-100 text-orange-800'
                          : isUser
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-gray-50 text-gray-600'
                      }`}>
                        {rank <= 3 ? (
                          <span>
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          rank
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className={`text-sm font-medium truncate ${
                            isUser ? 'text-indigo-900' : 'text-gray-900'
                          }`}>
                            {entry.username}
                            {isUser && (
                              <span className="ml-2 text-xs text-indigo-600 font-normal">
                                (You)
                              </span>
                            )}
                          </p>
                          <span className="text-lg">
                            {getBadgeEmoji(entry.badge)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>✅ {entry.correctCount}/5</span>
                          <span>⚡ +{entry.timeBonus.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        isUser ? 'text-indigo-700' : 'text-gray-900'
                      }`}>
                        {formatScore(entry.score)}
                      </div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && entries.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center text-sm text-gray-500">
            Showing top {entries.length} of {totalParticipants.toLocaleString()} players
          </div>
        </div>
      )}
    </div>
  );
};
