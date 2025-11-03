/**
 * Simplified Leaderboard Management using Redis Sorted Sets
 * Uses userId as member key to automatically prevent duplicates
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

export type LeaderboardType = 'daily' | 'weekly' | 'all-time';

/**
 * Add or update a user's score on all leaderboards
 * Uses userId as member key - Redis automatically handles duplicates
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
  if (!isValidUserId(userId)) {
    throw new LeaderboardError('Invalid user ID format', LEADERBOARD_ERROR_CODES.INVALID_USER_ID);
  }

  if (typeof score !== 'number' || score < 0) {
    throw new LeaderboardError('Invalid score value', LEADERBOARD_ERROR_CODES.INVALID_SCORE);
  }

  try {
    // Store user metadata separately
    const userDataKey = `user_data:${userId}`;
    await redis.hSet(userDataKey, {
      username,
      correctCount: correctCount.toString(),
      timeBonus: timeBonus.toString(),
      completedAt: completedAt.toString(),
      badge,
    });
    await redis.expire(userDataKey, 30 * 24 * 60 * 60); // 30 days

    // Add to leaderboards using userId as member (automatically prevents duplicates)
    const dailyKey = LeaderboardKeys.daily();
    const weeklyKey = LeaderboardKeys.weekly();
    const allTimeKey = LeaderboardKeys.allTime();

    await redis.zAdd(dailyKey, { member: userId, score });
    await redis.expire(dailyKey, KEY_EXPIRATION.DAILY_LEADERBOARD);

    await redis.zAdd(weeklyKey, { member: userId, score });
    await redis.expire(weeklyKey, KEY_EXPIRATION.WEEKLY_LEADERBOARD);

    await redis.zAdd(allTimeKey, { member: userId, score });

    console.log(`✅ Added/updated score for ${username} (${userId}): ${score} points`);

  } catch (error) {
    console.error('Error adding score to leaderboards:', error);
    throw new LeaderboardError(
      'Failed to add score to leaderboards',
      LEADERBOARD_ERROR_CODES.REDIS_ERROR
    );
  }
}

/**
 * Get leaderboard entries with user data
 */
export async function getLeaderboard(
  type: LeaderboardType,
  limit: number = 100,
  offset: number = 0
): Promise<LeaderboardEntry[]> {
  if (!['daily', 'weekly', 'all-time'].includes(type)) {
    throw new LeaderboardError(
      'Invalid leaderboard type',
      LEADERBOARD_ERROR_CODES.INVALID_LEADERBOARD_TYPE
    );
  }

  try {
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

    // Get user IDs from sorted set (highest scores first)
    const userIds = await redis.zRange(leaderboardKey, offset, offset + limit - 1, {
      by: 'rank',
      reverse: true,
    });

    const entries: LeaderboardEntry[] = [];

    for (const entry of userIds) {
      if (!entry || !entry.member) continue;

      const userId = entry.member;
      const score = entry.score || 0;

      try {
        // Get user data
        const userDataKey = `user_data:${userId}`;
        const userData = await redis.hGetAll(userDataKey);

        if (userData && userData.username) {
          entries.push({
            userId,
            username: userData.username,
            score,
            correctCount: parseInt(userData.correctCount || '0', 10),
            timeBonus: parseInt(userData.timeBonus || '0', 10),
            completedAt: parseInt(userData.completedAt || '0', 10),
            badge: (userData.badge as BadgeType) || 'good_samaritan',
          });
        }
      } catch (userDataError) {
        console.error(`Error getting user data for ${userId}:`, userDataError);
        // Skip this entry if we can't get user data
        continue;
      }
    }

    return entries;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw new LeaderboardError('Failed to get leaderboard', LEADERBOARD_ERROR_CODES.REDIS_ERROR);
  }
}

/**
 * Get user's rank on a leaderboard
 */
export async function getUserRank(
  userId: string,
  type: LeaderboardType
): Promise<{ rank: number; score: number; totalParticipants: number } | null> {
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

    // Get user's score
    const score = await redis.zScore(leaderboardKey, userId);
    if (score === null || score === undefined) {
      return null; // User not on leaderboard
    }

    // Get user's rank by getting all entries and finding position
    const allEntries = await redis.zRange(leaderboardKey, 0, -1, {
      by: 'rank',
      reverse: true,
    });

    let rank = -1;
    for (let i = 0; i < allEntries.length; i++) {
      if (allEntries[i]?.member === userId) {
        rank = i + 1; // Convert to 1-based ranking
        break;
      }
    }

    if (rank === -1) {
      return null; // User not found
    }

    // Get total participants
    const totalParticipants = (await redis.zCard(leaderboardKey)) || 0;

    return {
      rank,
      score,
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
  if (!['daily', 'weekly', 'all-time'].includes(type)) {
    throw new LeaderboardError(
      'Invalid leaderboard type',
      LEADERBOARD_ERROR_CODES.INVALID_LEADERBOARD_TYPE
    );
  }

  try {
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

    const count = (await redis.zCard(leaderboardKey)) || 0;
    console.log(`📊 Leaderboard ${type} has ${count} participants (key: ${leaderboardKey})`);
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
 * Clear all leaderboards (for testing/reset)
 */
export async function clearAllLeaderboards(): Promise<void> {
  try {
    const dailyKey = LeaderboardKeys.daily();
    const weeklyKey = LeaderboardKeys.weekly();
    const allTimeKey = LeaderboardKeys.allTime();

    await redis.del(dailyKey);
    await redis.del(weeklyKey);
    await redis.del(allTimeKey);

    console.log('🧹 All leaderboards cleared');
  } catch (error) {
    console.error('Error clearing leaderboards:', error);
    throw new LeaderboardError(
      'Failed to clear leaderboards',
      LEADERBOARD_ERROR_CODES.REDIS_ERROR
    );
  }
}
