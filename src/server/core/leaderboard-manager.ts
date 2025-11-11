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

    // Add to leaderboards using userId as member, but only if score is better
    const dailyKey = LeaderboardKeys.daily();
    const weeklyKey = LeaderboardKeys.weekly();
    const allTimeKey = LeaderboardKeys.allTime();

    const leaderboards = [
      { key: dailyKey, expiration: KEY_EXPIRATION.DAILY_LEADERBOARD, name: 'daily' },
      { key: weeklyKey, expiration: KEY_EXPIRATION.WEEKLY_LEADERBOARD, name: 'weekly' },
      { key: allTimeKey, expiration: null, name: 'all-time' },
    ];

    for (const leaderboard of leaderboards) {
      // Check existing score
      const existingScore = await redis.zScore(leaderboard.key, userId);
      
      if (existingScore === null || existingScore === undefined || score > existingScore) {
        // Add/update score (new user or better score)
        await redis.zAdd(leaderboard.key, { member: userId, score });
        
        if (leaderboard.expiration) {
          await redis.expire(leaderboard.key, leaderboard.expiration);
        }
        
        console.log(`🎯 Updated ${leaderboard.name} leaderboard for ${username}: ${existingScore || 'new'} → ${score}`);
      } else {
        console.log(`⏭️ Skipped ${leaderboard.name} leaderboard for ${username}: ${score} ≤ ${existingScore} (existing is better)`);
      }
    }

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

    console.log(`📋 Retrieved ${userIds.length} user entries from ${type} leaderboard (key: ${leaderboardKey})`);
    
    const entries: LeaderboardEntry[] = [];

    for (const entry of userIds) {
      if (!entry || !entry.member) continue;

      let userId = entry.member;
      let score = entry.score || 0;
      let userData: any = null;

      try {
        // First, check if this is old JSON format data
        try {
          const parsedData = JSON.parse(entry.member);
          if (parsedData.userId && parsedData.username) {
            // This is old format - migrate it automatically
            console.log(`🔄 Auto-migrating old entry for ${parsedData.username}`);
            
            userId = parsedData.userId;
            score = parsedData.score || score;
            
            // Remove old JSON entry
            await redis.zRem(leaderboardKey, [entry.member]);
            
            // Add new entry with userId as member
            await redis.zAdd(leaderboardKey, { member: userId, score });
            
            // Store user data separately
            const userDataKey = `user_data:${userId}`;
            await redis.hSet(userDataKey, {
              username: parsedData.username,
              correctCount: (parsedData.correctCount || 0).toString(),
              timeBonus: (parsedData.timeBonus || 0).toString(),
              completedAt: (parsedData.completedAt || Date.now()).toString(),
              badge: parsedData.badge || BadgeType.GOOD_SAMARITAN,
            });
            await redis.expire(userDataKey, 30 * 24 * 60 * 60); // 30 days
            
            // Use the migrated data
            userData = {
              username: parsedData.username,
              correctCount: (parsedData.correctCount || 0).toString(),
              timeBonus: (parsedData.timeBonus || 0).toString(),
              completedAt: (parsedData.completedAt || Date.now()).toString(),
              badge: parsedData.badge || 'good_samaritan',
            };
          }
        } catch (parseError) {
          // Not JSON - this is new format, continue normally
        }

        // If we didn't migrate, get user data normally
        if (!userData) {
          const userDataKey = `user_data:${userId}`;
          userData = await redis.hGetAll(userDataKey);
        }

        if (userData && userData.username) {
          // User data exists - use it
          entries.push({
            userId,
            username: userData.username,
            score,
            correctCount: parseInt(userData.correctCount || '0', 10),
            timeBonus: parseInt(userData.timeBonus || '0', 10),
            completedAt: parseInt(userData.completedAt || '0', 10),
            badge: (userData.badge as BadgeType) || 'good_samaritan',
          });
          console.log(`👤 Added ${userData.username} to leaderboard with score ${score}`);
        } else {
          // User data missing - create entry with userId as fallback username
          console.log(`⚠️ Missing user data for userId: ${userId}, using fallback`);
          entries.push({
            userId,
            username: userId, // Use userId as username fallback
            score,
            correctCount: 0,
            timeBonus: 0,
            completedAt: Date.now(),
            badge: BadgeType.GOOD_SAMARITAN,
          });
        }
      } catch (userDataError) {
        console.error(`Error processing entry for ${userId}:`, userDataError);
        // Skip this entry if we can't process it
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
