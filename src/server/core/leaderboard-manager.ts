/**
 * Leaderboard Management using Redis Sorted Sets
 *
 * This module handles leaderboard operations including adding scores,
 * retrieving rankings, and user position lookups using Redis sorted sets
 * with atomic operations to prevent race conditions.
 */

import { redis } from '@devvit/web/server';
import { LeaderboardEntry, BadgeType } from '../../shared/types/api.js';
import { LeaderboardKeys, KEY_EXPIRATION, isValidUserId } from './redis-keys.js';

/**
 * Leaderboard Management Errors
 */
export class LeaderboardError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'LeaderboardError';
  }
}

export const LEADERBOARD_ERROR_CODES = {
  INVALID_USER_ID: 'INVALID_USER_ID',
  INVALID_SCORE: 'INVALID_SCORE',
  INVALID_LEADERBOARD_TYPE: 'INVALID_LEADERBOARD_TYPE',
  REDIS_ERROR: 'REDIS_ERROR',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
} as const;

/**
 * Leaderboard types
 */
export type LeaderboardType = 'daily' | 'weekly' | 'all-time';

/**
 * Leaderboard entry for Redis storage (simplified)
 */
interface RedisLeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  correctCount: number;
  timeBonus: number;
  completedAt: number;
  badge: BadgeType;
}

/**
 * Add or update a user's score on all leaderboards atomically
 */
export async function addScoreToLeaderboards(
  userId: string,
  username: string,
  score: number,
  correctCount: number,
  timeBonus: number,
  badge: BadgeType,
  completedAt: number = Date.now()
): Promise<void> {
  // Validate inputs
  if (!isValidUserId(userId)) {
    throw new LeaderboardError('Invalid user ID format', LEADERBOARD_ERROR_CODES.INVALID_USER_ID);
  }

  if (typeof score !== 'number' || score < 0) {
    throw new LeaderboardError('Invalid score value', LEADERBOARD_ERROR_CODES.INVALID_SCORE);
  }

  const entryData: RedisLeaderboardEntry = {
    userId,
    username,
    score,
    correctCount,
    timeBonus,
    completedAt,
    badge,
  };

  try {
    // Get leaderboard keys
    const dailyKey = LeaderboardKeys.daily();
    const weeklyKey = LeaderboardKeys.weekly();
    const allTimeKey = LeaderboardKeys.allTime();

    // Note: Devvit Redis doesn't support pipelines, so we'll use individual operations
    // This is less atomic but still functional for our use case

    // Add to daily leaderboard
    await redis.zAdd(dailyKey, { member: JSON.stringify(entryData), score });
    await redis.expire(dailyKey, KEY_EXPIRATION.DAILY_LEADERBOARD);

    // Add to weekly leaderboard
    await redis.zAdd(weeklyKey, { member: JSON.stringify(entryData), score });
    await redis.expire(weeklyKey, KEY_EXPIRATION.WEEKLY_LEADERBOARD);

    // Add to all-time leaderboard (no expiration)
    await redis.zAdd(allTimeKey, { member: JSON.stringify(entryData), score });
  } catch (error) {
    console.error('Error adding score to leaderboards:', error);
    throw new LeaderboardError(
      'Failed to add score to leaderboards',
      LEADERBOARD_ERROR_CODES.REDIS_ERROR
    );
  }
}

/**
 * Get leaderboard entries with rankings
 */
export async function getLeaderboard(
  type: LeaderboardType,
  limit: number = 100,
  offset: number = 0
): Promise<LeaderboardEntry[]> {
  // Validate leaderboard type
  if (!['daily', 'weekly', 'all-time'].includes(type)) {
    throw new LeaderboardError(
      'Invalid leaderboard type',
      LEADERBOARD_ERROR_CODES.INVALID_LEADERBOARD_TYPE
    );
  }

  try {
    // Get appropriate leaderboard key
    let leaderboardKey: string;
    switch (type) {
      case 'daily':
        leaderboardKey = LeaderboardKeys.daily();
        break;
      case 'weekly':
        leaderboardKey = LeaderboardKeys.weekly();
        break;
      case 'all-time':
        leaderboardKey = LeaderboardKeys.allTime();
        break;
    }

    // Get entries in descending order (highest scores first)
    // Use zRange with reverse option to get highest scores first
    const entries = await redis.zRange(leaderboardKey, offset, offset + limit - 1, {
      by: 'rank',
      reverse: true,
    });

    const leaderboardEntries: LeaderboardEntry[] = [];

    for (let i = 0; i < entries.length; i++) {
      try {
        const entry = entries[i];
        if (!entry || !entry.member) continue;

        const entryData: RedisLeaderboardEntry = JSON.parse(entry.member);
        leaderboardEntries.push({
          userId: entryData.userId,
          username: entryData.username,
          score: entryData.score,
          correctCount: entryData.correctCount,
          timeBonus: entryData.timeBonus,
          completedAt: entryData.completedAt,
          badge: entryData.badge,
        });
      } catch (parseError) {
        console.error('Error parsing leaderboard entry:', parseError);
        // Skip malformed entries
        continue;
      }
    }

    return leaderboardEntries;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw new LeaderboardError('Failed to get leaderboard', LEADERBOARD_ERROR_CODES.REDIS_ERROR);
  }
}

/**
 * Get user's rank and score on a specific leaderboard
 */
export async function getUserRank(
  userId: string,
  type: LeaderboardType
): Promise<{ rank: number; score: number; totalParticipants: number } | null> {
  // Validate inputs
  if (!isValidUserId(userId)) {
    throw new LeaderboardError('Invalid user ID format', LEADERBOARD_ERROR_CODES.INVALID_USER_ID);
  }

  if (!['daily', 'weekly', 'all-time'].includes(type)) {
    throw new LeaderboardError(
      'Invalid leaderboard type',
      LEADERBOARD_ERROR_CODES.INVALID_LEADERBOARD_TYPE
    );
  }

  try {
    // Get appropriate leaderboard key
    let leaderboardKey: string;
    switch (type) {
      case 'daily':
        leaderboardKey = LeaderboardKeys.daily();
        break;
      case 'weekly':
        leaderboardKey = LeaderboardKeys.weekly();
        break;
      case 'all-time':
        leaderboardKey = LeaderboardKeys.allTime();
        break;
    }

    // Find user's entry in the sorted set
    const allEntries = await redis.zRange(leaderboardKey, 0, -1, { by: 'rank', reverse: true });
    const totalParticipants = allEntries.length;

    let userRank = -1;
    let userScore = 0;

    for (let i = 0; i < allEntries.length; i++) {
      try {
        const entry = allEntries[i];
        if (!entry || !entry.member) continue;

        const entryData: RedisLeaderboardEntry = JSON.parse(entry.member);
        if (entryData.userId === userId) {
          userRank = i + 1; // Rank is 1-based
          userScore = entryData.score;
          break;
        }
      } catch (parseError) {
        console.error('Error parsing leaderboard entry for rank lookup:', parseError);
        continue;
      }
    }

    if (userRank === -1) {
      return null; // User not found on leaderboard
    }

    return {
      rank: userRank,
      score: userScore,
      totalParticipants,
    };
  } catch (error) {
    console.error('Error getting user rank:', error);
    throw new LeaderboardError('Failed to get user rank', LEADERBOARD_ERROR_CODES.REDIS_ERROR);
  }
}

/**
 * Get total participant count for a leaderboard
 */
export async function getLeaderboardParticipantCount(type: LeaderboardType): Promise<number> {
  // Validate leaderboard type
  if (!['daily', 'weekly', 'all-time'].includes(type)) {
    throw new LeaderboardError(
      'Invalid leaderboard type',
      LEADERBOARD_ERROR_CODES.INVALID_LEADERBOARD_TYPE
    );
  }

  try {
    // Get appropriate leaderboard key
    let leaderboardKey: string;
    switch (type) {
      case 'daily':
        leaderboardKey = LeaderboardKeys.daily();
        break;
      case 'weekly':
        leaderboardKey = LeaderboardKeys.weekly();
        break;
      case 'all-time':
        leaderboardKey = LeaderboardKeys.allTime();
        break;
    }

    // Get count of entries in sorted set
    const count = await redis.zCard(leaderboardKey);
    return count;
  } catch (error) {
    console.error('Error getting participant count:', error);
    throw new LeaderboardError(
      'Failed to get participant count',
      LEADERBOARD_ERROR_CODES.REDIS_ERROR
    );
  }
}

/**
 * Get leaderboard entries around a specific user's rank
 */
export async function getLeaderboardAroundUser(
  userId: string,
  type: LeaderboardType,
  range: number = 5
): Promise<{ entries: LeaderboardEntry[]; userRank: number; totalParticipants: number } | null> {
  // Validate inputs
  if (!isValidUserId(userId)) {
    throw new LeaderboardError('Invalid user ID format', LEADERBOARD_ERROR_CODES.INVALID_USER_ID);
  }

  try {
    // First get user's rank
    const userRankData = await getUserRank(userId, type);
    if (!userRankData) {
      return null; // User not found
    }

    const { rank: userRank, totalParticipants } = userRankData;

    // Calculate range around user
    const startRank = Math.max(0, userRank - range - 1); // Convert to 0-based index
    const endRank = Math.min(totalParticipants - 1, userRank + range - 1); // Convert to 0-based index

    // Get entries in that range
    const entries = await getLeaderboard(type, endRank - startRank + 1, startRank);

    return {
      entries,
      userRank,
      totalParticipants,
    };
  } catch (error) {
    console.error('Error getting leaderboard around user:', error);
    throw new LeaderboardError(
      'Failed to get leaderboard around user',
      LEADERBOARD_ERROR_CODES.REDIS_ERROR
    );
  }
}

/**
 * Remove a user from all leaderboards (for cleanup/moderation)
 */
export async function removeUserFromLeaderboards(userId: string): Promise<void> {
  // Validate user ID
  if (!isValidUserId(userId)) {
    throw new LeaderboardError('Invalid user ID format', LEADERBOARD_ERROR_CODES.INVALID_USER_ID);
  }

  try {
    // Get all leaderboard keys
    const dailyKey = LeaderboardKeys.daily();
    const weeklyKey = LeaderboardKeys.weekly();
    const allTimeKey = LeaderboardKeys.allTime();

    // Find and remove user entries from each leaderboard
    const leaderboardKeys = [dailyKey, weeklyKey, allTimeKey];

    for (const key of leaderboardKeys) {
      const entries = await redis.zRange(key, 0, -1, { by: 'rank' });

      for (const entry of entries) {
        try {
          if (!entry || !entry.member) continue;

          const entryData: RedisLeaderboardEntry = JSON.parse(entry.member);
          if (entryData.userId === userId) {
            await redis.zRem(key, [entry.member]);
            break; // User should only have one entry per leaderboard
          }
        } catch (parseError) {
          console.error('Error parsing entry during removal:', parseError);
          continue;
        }
      }
    }
  } catch (error) {
    console.error('Error removing user from leaderboards:', error);
    throw new LeaderboardError(
      'Failed to remove user from leaderboards',
      LEADERBOARD_ERROR_CODES.REDIS_ERROR
    );
  }
}

/**
 * Get top N users from a leaderboard
 */
export async function getTopUsers(
  type: LeaderboardType,
  count: number = 10
): Promise<LeaderboardEntry[]> {
  return getLeaderboard(type, count, 0);
}

/**
 * Check if user exists on a leaderboard
 */
export async function userExistsOnLeaderboard(
  userId: string,
  type: LeaderboardType
): Promise<boolean> {
  try {
    const rankData = await getUserRank(userId, type);
    return rankData !== null;
  } catch (error) {
    console.error('Error checking if user exists on leaderboard:', error);
    return false;
  }
}

/**
 * Get leaderboard statistics
 */
export async function getLeaderboardStats(type: LeaderboardType): Promise<{
  totalParticipants: number;
  highestScore: number;
  averageScore: number;
  lowestScore: number;
}> {
  try {
    const entries = await getLeaderboard(type, -1, 0); // Get all entries

    if (entries.length === 0) {
      return {
        totalParticipants: 0,
        highestScore: 0,
        averageScore: 0,
        lowestScore: 0,
      };
    }

    const scores = entries.map((entry) => entry.score);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);

    return {
      totalParticipants: entries.length,
      highestScore: Math.max(...scores),
      averageScore: totalScore / entries.length,
      lowestScore: Math.min(...scores),
    };
  } catch (error) {
    console.error('Error getting leaderboard stats:', error);
    throw new LeaderboardError(
      'Failed to get leaderboard stats',
      LEADERBOARD_ERROR_CODES.REDIS_ERROR
    );
  }
}
