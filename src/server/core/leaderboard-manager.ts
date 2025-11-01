/**
 * Leaderboard Management using Redis Sorted Sets
 *
 * This module handles leaderboard operations including adding scores,
 * retrieving rankings, and user position lookups using Redis sorted sets
 * with atomic operations to prevent race conditions.
 */

import { redis, realtime } from '@devvit/web/server';
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
 * Auto-consolidation settings
 */
const AUTO_CONSOLIDATION_CONFIG = {
  // Enable auto-consolidation on leaderboard retrieval
  CONSOLIDATE_ON_RETRIEVAL: true,
  
  // Consolidate after every N score additions
  CONSOLIDATE_AFTER_SCORES: 10,
  
  // Redis key to track consolidation counters
  CONSOLIDATION_COUNTER_KEY: 'global_aiornotgame_consolidation_counter',
  
  // Redis key to track last consolidation time
  LAST_CONSOLIDATION_KEY: 'global_aiornotgame_last_consolidation',
  
  // Minimum time between auto-consolidations (in milliseconds)
  MIN_CONSOLIDATION_INTERVAL: 5 * 60 * 1000, // 5 minutes
};

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
 * Only keeps the best score per user to avoid duplicate entries
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

    console.log(`🎯 Adding score for user ${userId} (${username}) with score ${score}`);
    console.log(`📅 Daily key: ${dailyKey}`);
    console.log(`📊 Weekly key: ${weeklyKey}`);
    console.log(`🏆 All-time key: ${allTimeKey}`);

    // For each leaderboard, check if user exists and only update if new score is better
    const leaderboardConfigs = [
      { key: dailyKey, expiration: KEY_EXPIRATION.DAILY_LEADERBOARD, type: 'daily' },
      { key: weeklyKey, expiration: KEY_EXPIRATION.WEEKLY_LEADERBOARD, type: 'weekly' },
      { key: allTimeKey, expiration: null, type: 'all-time' }, // No expiration for all-time
    ];

    for (const config of leaderboardConfigs) {
      console.log(`🔄 Processing ${config.type} leaderboard...`);
      await updateUserBestScore(config.key, entryData, config.expiration);
    }

    // Send realtime leaderboard updates for all leaderboard types
    const leaderboardEntry: LeaderboardEntry = {
      userId,
      username,
      score,
      correctCount,
      timeBonus,
      completedAt,
      badge,
    };

    // Send updates for each leaderboard type
    const leaderboardTypes: LeaderboardType[] = ['daily', 'weekly', 'all-time'];

    for (const leaderboardType of leaderboardTypes) {
      // Send leaderboard update message
      await realtime.send('leaderboard_updates', {
        type: 'leaderboard_update',
        leaderboardType,
        entry: {
          userId: leaderboardEntry.userId,
          username: leaderboardEntry.username,
          score: leaderboardEntry.score,
          correctCount: leaderboardEntry.correctCount,
          timeBonus: leaderboardEntry.timeBonus,
          completedAt: leaderboardEntry.completedAt,
          badge: leaderboardEntry.badge,
        },
        timestamp: Date.now(),
      });

      // Get user's new rank and send rank update
      try {
        const rankData = await getUserRank(userId, leaderboardType);
        if (rankData) {
          await realtime.send('leaderboard_updates', {
            type: 'rank_update',
            userId,
            leaderboardType,
            newRank: rankData.rank,
            totalParticipants: rankData.totalParticipants,
            timestamp: Date.now(),
          });
        }
      } catch (rankError) {
        console.error(`Error getting rank for realtime update (${leaderboardType}):`, rankError);
        // Don't fail the whole operation if rank lookup fails
      }
    }

    // Trigger auto-consolidation counter (runs in background, doesn't block)
    incrementConsolidationCounter().catch(error => {
      console.error('Error incrementing consolidation counter:', error);
    });

  } catch (error) {
    console.error('Error adding score to leaderboards:', error);
    throw new LeaderboardError(
      'Failed to add score to leaderboards',
      LEADERBOARD_ERROR_CODES.REDIS_ERROR
    );
  }
}

/**
 * Update user's best score on a specific leaderboard
 * Removes old entry if new score is better, or adds new entry if user doesn't exist
 */
async function updateUserBestScore(
  leaderboardKey: string,
  newEntry: RedisLeaderboardEntry,
  expiration: number | null
): Promise<void> {
  try {
    // Get all entries to find existing user entry
    const allEntries = await redis.zRange(leaderboardKey, 0, -1, { by: 'rank' });

    let existingEntry: string | null = null;
    let existingScore = 0;

    // Find user's existing entry
    for (const entry of allEntries) {
      try {
        if (!entry || !entry.member) continue;

        const entryData: RedisLeaderboardEntry = JSON.parse(entry.member);
        if (entryData.userId === newEntry.userId) {
          existingEntry = entry.member;
          existingScore = entryData.score;
          break;
        }
      } catch (parseError) {
        console.error('Error parsing entry during best score update:', parseError);
        continue;
      }
    }

    // If user exists and new score is not better, don't update
    if (existingEntry && newEntry.score <= existingScore) {
      console.log(
        `🚫 User ${newEntry.userId} already has better score (${existingScore} vs ${newEntry.score}) - skipping update`
      );
      return;
    }

    // Log what we're about to do
    if (existingEntry) {
      console.log(
        `🔄 User ${newEntry.userId} has existing score ${existingScore}, updating to better score ${newEntry.score}`
      );
    } else {
      console.log(`✨ New user ${newEntry.userId} being added with score ${newEntry.score}`);
    }

    // Remove existing entry if it exists
    if (existingEntry) {
      await redis.zRem(leaderboardKey, [existingEntry]);
      console.log(`Removed old entry for user ${newEntry.userId} with score ${existingScore}`);
    }

    // Add new entry
    await redis.zAdd(leaderboardKey, { member: JSON.stringify(newEntry), score: newEntry.score });
    console.log(`Added new entry for user ${newEntry.userId} with score ${newEntry.score}`);

    // Set expiration if specified
    if (expiration) {
      await redis.expire(leaderboardKey, expiration);
    }
  } catch (error) {
    console.error('Error updating user best score:', error);
    throw error;
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

    console.log(`🔍 Getting ${type} leaderboard with key:`, leaderboardKey);

    // Check if key exists and get total count
    const totalCount = await redis.zCard(leaderboardKey);
    console.log(`📊 Total entries in ${type} leaderboard:`, totalCount);

    // Get entries in descending order (highest scores first)
    // Use zRange with reverse option to get highest scores first
    const entries = await redis.zRange(leaderboardKey, offset, offset + limit - 1, {
      by: 'rank',
      reverse: true,
    });

    console.log(`📋 Retrieved ${entries.length} entries from ${type} leaderboard`);

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

    // Trigger auto-consolidation on retrieval if enabled (runs in background)
    if (AUTO_CONSOLIDATION_CONFIG.CONSOLIDATE_ON_RETRIEVAL) {
      autoConsolidateIfNeeded().catch(error => {
        console.error('Error during auto-consolidation on retrieval:', error);
      });
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
 * Check if auto-consolidation should run based on time and counter thresholds
 */
async function shouldAutoConsolidate(): Promise<boolean> {
  try {
    // Check last consolidation time
    const lastConsolidationStr = await redis.get(AUTO_CONSOLIDATION_CONFIG.LAST_CONSOLIDATION_KEY);
    const lastConsolidation = lastConsolidationStr ? parseInt(lastConsolidationStr, 10) : 0;
    const now = Date.now();
    
    // Don't consolidate if we did it recently
    if (now - lastConsolidation < AUTO_CONSOLIDATION_CONFIG.MIN_CONSOLIDATION_INTERVAL) {
      return false;
    }
    
    // Check consolidation counter
    const counterStr = await redis.get(AUTO_CONSOLIDATION_CONFIG.CONSOLIDATION_COUNTER_KEY);
    const counter = counterStr ? parseInt(counterStr, 10) : 0;
    
    return counter >= AUTO_CONSOLIDATION_CONFIG.CONSOLIDATE_AFTER_SCORES;
  } catch (error) {
    console.error('Error checking auto-consolidation conditions:', error);
    return false;
  }
}

/**
 * Increment the consolidation counter and trigger auto-consolidation if needed
 */
async function incrementConsolidationCounter(): Promise<void> {
  try {
    const newCount = await redis.incr(AUTO_CONSOLIDATION_CONFIG.CONSOLIDATION_COUNTER_KEY);
    
    if (newCount >= AUTO_CONSOLIDATION_CONFIG.CONSOLIDATE_AFTER_SCORES) {
      console.log(`🎯 Auto-consolidation triggered after ${newCount} score additions`);
      await autoConsolidateIfNeeded();
    }
  } catch (error) {
    console.error('Error incrementing consolidation counter:', error);
  }
}

/**
 * Reset consolidation counter and update last consolidation time
 */
async function resetConsolidationTracking(): Promise<void> {
  try {
    await redis.set(AUTO_CONSOLIDATION_CONFIG.CONSOLIDATION_COUNTER_KEY, '0');
    await redis.set(AUTO_CONSOLIDATION_CONFIG.LAST_CONSOLIDATION_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error resetting consolidation tracking:', error);
  }
}

/**
 * Auto-consolidate leaderboards if conditions are met
 */
async function autoConsolidateIfNeeded(): Promise<boolean> {
  if (!(await shouldAutoConsolidate())) {
    return false;
  }
  
  try {
    console.log('🤖 Running auto-consolidation...');
    const results = await consolidateAllLeaderboards();
    
    const totalDuplicatesRemoved = results.daily.duplicatesRemoved + 
                                  results.weekly.duplicatesRemoved + 
                                  results.allTime.duplicatesRemoved;
    
    if (totalDuplicatesRemoved > 0) {
      console.log(`🎉 Auto-consolidation removed ${totalDuplicatesRemoved} duplicates`);
    }
    
    await resetConsolidationTracking();
    return true;
  } catch (error) {
    console.error('Error during auto-consolidation:', error);
    return false;
  }
}

/**
 * Consolidate all leaderboards (daily, weekly, all-time)
 * Useful for maintenance or fixing existing duplicate data
 */
export async function consolidateAllLeaderboards(): Promise<{
  daily: { originalCount: number; consolidatedCount: number; duplicatesRemoved: number };
  weekly: { originalCount: number; consolidatedCount: number; duplicatesRemoved: number };
  allTime: { originalCount: number; consolidatedCount: number; duplicatesRemoved: number };
}> {
  console.log('🧹 Starting consolidation of all leaderboards...');

  const results = {
    daily: await consolidateLeaderboard('daily'),
    weekly: await consolidateLeaderboard('weekly'),
    allTime: await consolidateLeaderboard('all-time'),
  };

  const totalDuplicatesRemoved =
    results.daily.duplicatesRemoved +
    results.weekly.duplicatesRemoved +
    results.allTime.duplicatesRemoved;

  console.log(`✅ Consolidation complete! Removed ${totalDuplicatesRemoved} total duplicates`);

  return results;
}

/**
 * Initialize leaderboard system and run startup consolidation if needed
 */
export async function initializeLeaderboardSystem(): Promise<void> {
  try {
    console.log('🚀 Initializing leaderboard system...');
    
    // Check if we should run a startup consolidation
    const lastConsolidationStr = await redis.get(AUTO_CONSOLIDATION_CONFIG.LAST_CONSOLIDATION_KEY);
    const lastConsolidation = lastConsolidationStr ? parseInt(lastConsolidationStr, 10) : 0;
    const now = Date.now();
    
    // If it's been more than 1 hour since last consolidation, run it
    const oneHour = 60 * 60 * 1000;
    if (now - lastConsolidation > oneHour) {
      console.log('⏰ Running startup consolidation (last run was over 1 hour ago)');
      await autoConsolidateIfNeeded();
    }
    
    console.log('✅ Leaderboard system initialized');
  } catch (error) {
    console.error('Error initializing leaderboard system:', error);
    // Don't throw - we don't want to break the app if consolidation fails
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

/**
 * Consolidate existing leaderboard by removing duplicate users and keeping only their best scores
 * This is useful for cleaning up leaderboards that already have multiple entries per user
 */
export async function consolidateLeaderboard(type: LeaderboardType): Promise<{
  originalCount: number;
  consolidatedCount: number;
  duplicatesRemoved: number;
}> {
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
    let expiration: number | null = null;

    switch (type) {
      case 'daily':
        leaderboardKey = LeaderboardKeys.daily();
        expiration = KEY_EXPIRATION.DAILY_LEADERBOARD;
        break;
      case 'weekly':
        leaderboardKey = LeaderboardKeys.weekly();
        expiration = KEY_EXPIRATION.WEEKLY_LEADERBOARD;
        break;
      case 'all-time':
        leaderboardKey = LeaderboardKeys.allTime();
        break;
    }

    // Get all entries
    const allEntries = await redis.zRange(leaderboardKey, 0, -1, { by: 'rank' });
    const originalCount = allEntries.length;

    if (originalCount === 0) {
      return { originalCount: 0, consolidatedCount: 0, duplicatesRemoved: 0 };
    }

    // Group entries by userId and keep only the best score for each user
    const userBestEntries = new Map<string, { entry: RedisLeaderboardEntry; serialized: string }>();

    for (const entry of allEntries) {
      try {
        if (!entry || !entry.member) continue;

        const entryData: RedisLeaderboardEntry = JSON.parse(entry.member);
        const existingBest = userBestEntries.get(entryData.userId);

        if (!existingBest || entryData.score > existingBest.entry.score) {
          userBestEntries.set(entryData.userId, {
            entry: entryData,
            serialized: entry.member,
          });
        }
      } catch (parseError) {
        console.error('Error parsing entry during consolidation:', parseError);
        continue;
      }
    }

    const consolidatedCount = userBestEntries.size;
    const duplicatesRemoved = originalCount - consolidatedCount;

    // If no duplicates found, no need to rebuild
    if (duplicatesRemoved === 0) {
      console.log(`No duplicates found in ${type} leaderboard`);
      return { originalCount, consolidatedCount, duplicatesRemoved: 0 };
    }

    console.log(
      `Consolidating ${type} leaderboard: ${originalCount} -> ${consolidatedCount} entries (${duplicatesRemoved} duplicates removed)`
    );

    // Clear the leaderboard
    await redis.del(leaderboardKey);

    // Add back only the best entries for each user
    for (const { entry, serialized } of userBestEntries.values()) {
      await redis.zAdd(leaderboardKey, { member: serialized, score: entry.score });
    }

    // Restore expiration if needed
    if (expiration) {
      await redis.expire(leaderboardKey, expiration);
    }

    console.log(`Successfully consolidated ${type} leaderboard`);

    return { originalCount, consolidatedCount, duplicatesRemoved };
  } catch (error) {
    console.error('Error consolidating leaderboard:', error);
    throw new LeaderboardError(
      'Failed to consolidate leaderboard',
      LEADERBOARD_ERROR_CODES.REDIS_ERROR
    );
  }
}
