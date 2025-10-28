/**
 * Play Limit Manager
 *
 * This module handles daily play limit tracking, validation, and enforcement.
 * Players can play up to 2 times per day in production mode, unlimited in development.
 */

import { redis } from '@devvit/web/server';
import { UserPlayLimit, GameSession } from '../../shared/types/api.js';
import { UserSessionKeys, KEY_EXPIRATION } from './redis-keys.js';

/**
 * Play Limit Errors
 */
export class PlayLimitError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'PlayLimitError';
  }
}

export const PLAY_LIMIT_ERROR_CODES = {
  INVALID_USER_ID: 'INVALID_USER_ID',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  REDIS_ERROR: 'REDIS_ERROR',
  INVALID_DATA: 'INVALID_DATA',
} as const;

/**
 * Configuration
 */
const PRODUCTION_MAX_ATTEMPTS = 2;
const DEVELOPMENT_MAX_ATTEMPTS = 999; // Effectively unlimited for testing

/**
 * Check if we're in development mode
 */
function isDevelopmentMode(): boolean {
  // In development, allow unlimited attempts
  // This can be controlled via environment variable or other configuration
  return process.env.NODE_ENV !== 'production';
}

/**
 * Get maximum attempts allowed per day
 */
function getMaxAttempts(): number {
  return isDevelopmentMode() ? DEVELOPMENT_MAX_ATTEMPTS : PRODUCTION_MAX_ATTEMPTS;
}

/**
 * Get user's current play limit data for today
 */
export async function getUserPlayLimit(userId: string, date?: string): Promise<UserPlayLimit | null> {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new PlayLimitError('Invalid user ID', PLAY_LIMIT_ERROR_CODES.INVALID_USER_ID);
    }

    const playLimitKey = UserSessionKeys.playLimit(userId, date);
    const playLimitData = await redis.get(playLimitKey);

    if (!playLimitData) {
      return null;
    }

    const parsedData = JSON.parse(playLimitData);
    
    // Validate the data structure
    if (!parsedData || typeof parsedData !== 'object') {
      console.warn(`Invalid play limit data for user ${userId}:`, parsedData);
      return null;
    }

    return parsedData as UserPlayLimit;
  } catch (error) {
    console.error('Error getting user play limit:', error);
    
    if (error instanceof PlayLimitError) {
      throw error;
    }
    
    throw new PlayLimitError('Failed to get play limit data', PLAY_LIMIT_ERROR_CODES.REDIS_ERROR);
  }
}

/**
 * Initialize or get user's play limit data for today
 */
export async function initializeUserPlayLimit(userId: string, date?: string): Promise<UserPlayLimit> {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new PlayLimitError('Invalid user ID', PLAY_LIMIT_ERROR_CODES.INVALID_USER_ID);
    }

    const currentDate = date || new Date().toISOString().split('T')[0];
    if (!currentDate) {
      throw new PlayLimitError('Invalid date', PLAY_LIMIT_ERROR_CODES.INVALID_DATA);
    }

    // Try to get existing data
    const existingLimit = await getUserPlayLimit(userId, date);
    if (existingLimit) {
      return existingLimit;
    }

    // Create new play limit data
    const newPlayLimit: UserPlayLimit = {
      userId,
      date: currentDate,
      attempts: 0,
      maxAttempts: getMaxAttempts(),
      bestScore: 0,
      bestAttempt: {} as GameSession, // Will be populated when user completes a game
    };

    // Store in Redis
    const playLimitKey = UserSessionKeys.playLimit(userId, date);
    await redis.set(playLimitKey, JSON.stringify(newPlayLimit));
    await redis.expire(playLimitKey, KEY_EXPIRATION.USER_PLAY_LIMIT);

    return newPlayLimit;
  } catch (error) {
    console.error('Error initializing user play limit:', error);
    
    if (error instanceof PlayLimitError) {
      throw error;
    }
    
    throw new PlayLimitError('Failed to initialize play limit', PLAY_LIMIT_ERROR_CODES.REDIS_ERROR);
  }
}

/**
 * Check if user can start a new game (has remaining attempts)
 */
export async function canUserPlay(userId: string, date?: string): Promise<{
  canPlay: boolean;
  remainingAttempts: number;
  maxAttempts: number;
  reason?: string;
}> {
  try {
    if (!userId || typeof userId !== 'string') {
      return {
        canPlay: false,
        remainingAttempts: 0,
        maxAttempts: 0,
        reason: 'Invalid user ID',
      };
    }

    const playLimit = await initializeUserPlayLimit(userId, date);
    const remainingAttempts = Math.max(0, playLimit.maxAttempts - playLimit.attempts);
    const canPlay = remainingAttempts > 0;

    return {
      canPlay,
      remainingAttempts,
      maxAttempts: playLimit.maxAttempts,
      reason: canPlay ? undefined : 'Daily play limit reached',
    };
  } catch (error) {
    console.error('Error checking if user can play:', error);
    
    // In case of error, allow play in development mode, deny in production
    const fallbackMaxAttempts = getMaxAttempts();
    return {
      canPlay: isDevelopmentMode(),
      remainingAttempts: isDevelopmentMode() ? fallbackMaxAttempts : 0,
      maxAttempts: fallbackMaxAttempts,
      reason: isDevelopmentMode() ? undefined : 'Error checking play limit',
    };
  }
}

/**
 * Increment user's attempt count (call when starting a new game)
 */
export async function incrementUserAttempts(userId: string, date?: string): Promise<UserPlayLimit> {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new PlayLimitError('Invalid user ID', PLAY_LIMIT_ERROR_CODES.INVALID_USER_ID);
    }

    const playLimit = await initializeUserPlayLimit(userId, date);
    
    // Check if user has remaining attempts
    if (playLimit.attempts >= playLimit.maxAttempts) {
      throw new PlayLimitError('Daily play limit exceeded', PLAY_LIMIT_ERROR_CODES.LIMIT_EXCEEDED);
    }

    // Increment attempts
    playLimit.attempts += 1;

    // Update in Redis
    const playLimitKey = UserSessionKeys.playLimit(userId, date);
    await redis.set(playLimitKey, JSON.stringify(playLimit));
    await redis.expire(playLimitKey, KEY_EXPIRATION.USER_PLAY_LIMIT);

    return playLimit;
  } catch (error) {
    console.error('Error incrementing user attempts:', error);
    
    if (error instanceof PlayLimitError) {
      throw error;
    }
    
    throw new PlayLimitError('Failed to increment attempts', PLAY_LIMIT_ERROR_CODES.REDIS_ERROR);
  }
}

/**
 * Update user's best score if the new score is better
 */
export async function updateBestScore(
  userId: string,
  completedSession: GameSession,
  date?: string
): Promise<UserPlayLimit> {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new PlayLimitError('Invalid user ID', PLAY_LIMIT_ERROR_CODES.INVALID_USER_ID);
    }

    if (!completedSession || typeof completedSession !== 'object') {
      throw new PlayLimitError('Invalid session data', PLAY_LIMIT_ERROR_CODES.INVALID_DATA);
    }

    const playLimit = await initializeUserPlayLimit(userId, date);
    
    // Update best score if this score is better
    if (completedSession.totalScore > playLimit.bestScore) {
      playLimit.bestScore = completedSession.totalScore;
      playLimit.bestAttempt = completedSession;

      // Update in Redis
      const playLimitKey = UserSessionKeys.playLimit(userId, date);
      await redis.set(playLimitKey, JSON.stringify(playLimit));
      await redis.expire(playLimitKey, KEY_EXPIRATION.USER_PLAY_LIMIT);
    }

    return playLimit;
  } catch (error) {
    console.error('Error updating best score:', error);
    
    if (error instanceof PlayLimitError) {
      throw error;
    }
    
    throw new PlayLimitError('Failed to update best score', PLAY_LIMIT_ERROR_CODES.REDIS_ERROR);
  }
}

/**
 * Get user's play statistics for today
 */
export async function getUserPlayStats(userId: string, date?: string): Promise<{
  attempts: number;
  maxAttempts: number;
  remainingAttempts: number;
  bestScore: number;
  bestAttempt?: GameSession;
  canPlayAgain: boolean;
}> {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new PlayLimitError('Invalid user ID', PLAY_LIMIT_ERROR_CODES.INVALID_USER_ID);
    }

    const playLimit = await initializeUserPlayLimit(userId, date);
    const remainingAttempts = Math.max(0, playLimit.maxAttempts - playLimit.attempts);
    const canPlayAgain = remainingAttempts > 0;

    return {
      attempts: playLimit.attempts,
      maxAttempts: playLimit.maxAttempts,
      remainingAttempts,
      bestScore: playLimit.bestScore,
      bestAttempt: playLimit.bestScore > 0 ? playLimit.bestAttempt : undefined,
      canPlayAgain,
    };
  } catch (error) {
    console.error('Error getting user play stats:', error);
    
    // Return safe defaults on error
    const maxAttempts = getMaxAttempts();
    return {
      attempts: 0,
      maxAttempts,
      remainingAttempts: maxAttempts,
      bestScore: 0,
      canPlayAgain: true,
    };
  }
}

/**
 * Reset all play limits (for testing or admin purposes)
 */
export async function resetUserPlayLimit(userId: string, date?: string): Promise<void> {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new PlayLimitError('Invalid user ID', PLAY_LIMIT_ERROR_CODES.INVALID_USER_ID);
    }

    const playLimitKey = UserSessionKeys.playLimit(userId, date);
    await redis.del(playLimitKey);
  } catch (error) {
    console.error('Error resetting user play limit:', error);
    throw new PlayLimitError('Failed to reset play limit', PLAY_LIMIT_ERROR_CODES.REDIS_ERROR);
  }
}

/**
 * Validate play limit data structure
 */
export function validatePlayLimitData(data: any): data is UserPlayLimit {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const required = ['userId', 'date', 'attempts', 'maxAttempts', 'bestScore'];
  for (const field of required) {
    if (!(field in data)) {
      return false;
    }
  }

  return (
    typeof data.userId === 'string' &&
    typeof data.date === 'string' &&
    typeof data.attempts === 'number' &&
    typeof data.maxAttempts === 'number' &&
    typeof data.bestScore === 'number' &&
    data.attempts >= 0 &&
    data.maxAttempts > 0 &&
    data.bestScore >= 0
  );
}
