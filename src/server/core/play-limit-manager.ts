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

// Configuration override - set this to force a specific mode
const FORCE_PRODUCTION_MODE = true; // Set to true to always use production limits

/**
 * Check if we're in development mode
 * Multiple detection methods for different hosting environments
 */
function isDevelopmentMode(): boolean {
  // Configuration override - if set, always use this setting
  if (FORCE_PRODUCTION_MODE) {
    console.log('🔒 FORCED PRODUCTION MODE - Play limits: 2 attempts per day');
    return false;
  }

  // Method 1: Check NODE_ENV (traditional)
  if (process.env.NODE_ENV === 'production') {
    console.log('🏭 Production mode detected via NODE_ENV');
    return false;
  }

  // Method 2: Check for Devvit playtest environment
  if (process.env.DEVVIT_PLAYTEST === 'true') {
    console.log('🧪 Development mode detected via DEVVIT_PLAYTEST');
    return true;
  }

  // Method 3: Check for Reddit execution context (production indicator)
  if (process.env.REDDIT_CONTEXT || process.env.DEVVIT_EXECUTION_ID) {
    console.log('🏭 Production mode detected via Reddit execution context');
    return false;
  }

  // Method 4: Check hostname/domain patterns
  const hostname = process.env.HOSTNAME || '';
  if (hostname.includes('reddit.com') || hostname.includes('devvit')) {
    console.log('🏭 Production mode detected via hostname:', hostname);
    return false;
  }

  // Method 5: Default to PRODUCTION for safety
  // This ensures production limits are enforced when in doubt
  console.log('🚨 DEFAULTING TO PRODUCTION MODE - Play limits: 2 attempts per day');
  console.error('🚨 Environment detection unclear - using production mode for safety');
  return false; // Default to production mode
}

/**
 * Get maximum attempts allowed per day
 */
function getMaxAttempts(): number {
  const maxAttempts = isDevelopmentMode() ? DEVELOPMENT_MAX_ATTEMPTS : PRODUCTION_MAX_ATTEMPTS;
  console.log(
    `Max attempts determined: ${maxAttempts} (${isDevelopmentMode() ? 'Development' : 'Production'} mode)`
  );
  return maxAttempts;
}

/**
 * Get current environment configuration for debugging
 */
export function getEnvironmentInfo(): {
  mode: 'development' | 'production';
  maxAttempts: number;
  detectionMethod: string;
  environmentVars: Record<string, string | undefined>;
} {
  const isDev = isDevelopmentMode();
  const maxAttempts = getMaxAttempts();

  let detectionMethod = 'default-production';

  if (FORCE_PRODUCTION_MODE) {
    detectionMethod = 'forced-production';
  } else if (process.env.NODE_ENV === 'production') {
    detectionMethod = 'NODE_ENV';
  } else if (process.env.DEVVIT_PLAYTEST === 'true') {
    detectionMethod = 'DEVVIT_PLAYTEST';
  } else if (process.env.REDDIT_CONTEXT || process.env.DEVVIT_EXECUTION_ID) {
    detectionMethod = 'reddit-context';
  }

  return {
    mode: isDev ? 'development' : 'production',
    maxAttempts,
    detectionMethod,
    environmentVars: {
      NODE_ENV: process.env.NODE_ENV,
      DEVVIT_PLAYTEST: process.env.DEVVIT_PLAYTEST,
      REDDIT_CONTEXT: process.env.REDDIT_CONTEXT ? 'present' : undefined,
      DEVVIT_EXECUTION_ID: process.env.DEVVIT_EXECUTION_ID ? 'present' : undefined,
      HOSTNAME: process.env.HOSTNAME,
    },
  };
}

/**
 * Get user's current play limit data for today
 */
export async function getUserPlayLimit(
  userId: string,
  date?: string
): Promise<UserPlayLimit | null> {
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
export async function initializeUserPlayLimit(
  userId: string,
  date?: string
): Promise<UserPlayLimit> {
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
export async function canUserPlay(
  userId: string,
  date?: string
): Promise<{
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

    if (canPlay) {
      return {
        canPlay,
        remainingAttempts,
        maxAttempts: playLimit.maxAttempts,
      };
    } else {
      return {
        canPlay,
        remainingAttempts,
        maxAttempts: playLimit.maxAttempts,
        reason: 'Daily play limit reached',
      };
    }
  } catch (error) {
    console.error('Error checking if user can play:', error);

    // In case of error, allow play in development mode, deny in production
    const fallbackMaxAttempts = getMaxAttempts();
    if (isDevelopmentMode()) {
      return {
        canPlay: true,
        remainingAttempts: fallbackMaxAttempts,
        maxAttempts: fallbackMaxAttempts,
      };
    } else {
      return {
        canPlay: false,
        remainingAttempts: 0,
        maxAttempts: fallbackMaxAttempts,
        reason: 'Error checking play limit',
      };
    }
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
export async function getUserPlayStats(
  userId: string,
  date?: string
): Promise<{
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

    const result: {
      attempts: number;
      maxAttempts: number;
      remainingAttempts: number;
      bestScore: number;
      bestAttempt?: GameSession;
      canPlayAgain: boolean;
    } = {
      attempts: playLimit.attempts,
      maxAttempts: playLimit.maxAttempts,
      remainingAttempts,
      bestScore: playLimit.bestScore,
      canPlayAgain,
    };

    if (playLimit.bestScore > 0) {
      result.bestAttempt = playLimit.bestAttempt;
    }

    return result;
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
