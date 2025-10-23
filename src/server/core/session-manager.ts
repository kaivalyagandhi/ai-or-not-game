/**
 * Game Session Management
 *
 * This module handles storage and retrieval of user game sessions in Redis,
 * including session validation to ensure users can only play once per day
 * and session expiration handling for cleanup.
 */

import { redis } from '@devvit/web/server';
import { GameSession, BadgeType } from '../../shared/types/api.js';
import { UserSessionKeys, KEY_EXPIRATION, isValidUserId, isValidSessionId } from './redis-keys.js';

/**
 * Session Management Errors
 */
export class SessionError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'SessionError';
  }
}

export const SESSION_ERROR_CODES = {
  INVALID_USER_ID: 'INVALID_USER_ID',
  INVALID_SESSION_ID: 'INVALID_SESSION_ID',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  ALREADY_PLAYED_TODAY: 'ALREADY_PLAYED_TODAY',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  REDIS_ERROR: 'REDIS_ERROR',
} as const;

/**
 * Generate a unique session ID
 */
export function generateSessionId(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${userId}_${timestamp}_${random}`;
}

/**
 * Create a new game session for a user
 */
export async function createGameSession(userId: string): Promise<GameSession> {
  // Validate user ID
  if (!isValidUserId(userId)) {
    throw new SessionError('Invalid user ID format', SESSION_ERROR_CODES.INVALID_USER_ID);
  }

  // Check if user has already played today
  // TEMPORARY: Allow multiple plays for testing (remove in production)
  const isDevelopmentMode = true; // Set to false for production
  const hasPlayedToday = await hasUserPlayedToday(userId);
  if (hasPlayedToday && !isDevelopmentMode) {
    throw new SessionError(
      "User has already completed today's challenge",
      SESSION_ERROR_CODES.ALREADY_PLAYED_TODAY
    );
  }
  
  if (hasPlayedToday && isDevelopmentMode) {
    console.log('Development mode: Bypassing daily session limit for testing');
  }

  // Generate session ID and create session object
  const sessionId = generateSessionId(userId);
  const session: GameSession = {
    userId,
    sessionId,
    startTime: Date.now(),
    rounds: [], // Will be populated when rounds are loaded
    totalScore: 0,
    correctCount: 0,
    totalTimeBonus: 0,
    badge: BadgeType.HUMAN_IN_TRAINING, // Default badge
    completed: false,
  };

  try {
    // Store session in Redis with expiration
    const sessionKey = UserSessionKeys.session(userId, sessionId);
    await redis.set(sessionKey, JSON.stringify(session));
    await redis.expire(sessionKey, KEY_EXPIRATION.USER_SESSION);

    return session;
  } catch (error) {
    console.error('Error creating game session:', error);
    throw new SessionError('Failed to create game session', SESSION_ERROR_CODES.REDIS_ERROR);
  }
}

/**
 * Retrieve a game session by user ID and session ID
 */
export async function getGameSession(
  userId: string,
  sessionId: string
): Promise<GameSession | null> {
  // Validate inputs
  if (!isValidUserId(userId)) {
    throw new SessionError('Invalid user ID format', SESSION_ERROR_CODES.INVALID_USER_ID);
  }

  if (!isValidSessionId(sessionId)) {
    throw new SessionError('Invalid session ID format', SESSION_ERROR_CODES.INVALID_SESSION_ID);
  }

  try {
    const sessionKey = UserSessionKeys.session(userId, sessionId);
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return null;
    }

    const session: GameSession = JSON.parse(sessionData);
    return session;
  } catch (error) {
    console.error('Error retrieving game session:', error);
    throw new SessionError('Failed to retrieve game session', SESSION_ERROR_CODES.REDIS_ERROR);
  }
}

/**
 * Update a game session in Redis
 */
export async function updateGameSession(session: GameSession): Promise<void> {
  // Validate session data
  if (!isValidUserId(session.userId)) {
    throw new SessionError('Invalid user ID in session', SESSION_ERROR_CODES.INVALID_USER_ID);
  }

  if (!isValidSessionId(session.sessionId)) {
    throw new SessionError('Invalid session ID in session', SESSION_ERROR_CODES.INVALID_SESSION_ID);
  }

  try {
    const sessionKey = UserSessionKeys.session(session.userId, session.sessionId);

    // Check if session exists
    const exists = await redis.exists(sessionKey);
    if (!exists) {
      throw new SessionError('Session not found', SESSION_ERROR_CODES.SESSION_NOT_FOUND);
    }

    // Update session with same expiration
    await redis.set(sessionKey, JSON.stringify(session));
    await redis.expire(sessionKey, KEY_EXPIRATION.USER_SESSION);
  } catch (error) {
    if (error instanceof SessionError) {
      throw error;
    }
    console.error('Error updating game session:', error);
    throw new SessionError('Failed to update game session', SESSION_ERROR_CODES.REDIS_ERROR);
  }
}

/**
 * Mark a user's daily challenge as completed
 */
export async function markDailyCompleted(userId: string, session: GameSession): Promise<void> {
  // Validate user ID
  if (!isValidUserId(userId)) {
    throw new SessionError('Invalid user ID format', SESSION_ERROR_CODES.INVALID_USER_ID);
  }

  try {
    const completionKey = UserSessionKeys.dailyCompletion(userId);
    const completionData = {
      sessionId: session.sessionId,
      completedAt: Date.now(),
      totalScore: session.totalScore,
      correctCount: session.correctCount,
      badge: session.badge,
    };

    // Store completion record with expiration
    await redis.set(completionKey, JSON.stringify(completionData));
    await redis.expire(completionKey, KEY_EXPIRATION.DAILY_COMPLETION);

    // Update session to mark as completed
    session.completed = true;
    await updateGameSession(session);
  } catch (error) {
    console.error('Error marking daily completion:', error);
    throw new SessionError('Failed to mark daily completion', SESSION_ERROR_CODES.REDIS_ERROR);
  }
}

/**
 * Check if a user has already played today
 */
export async function hasUserPlayedToday(userId: string, date?: string): Promise<boolean> {
  // Validate user ID
  if (!isValidUserId(userId)) {
    throw new SessionError('Invalid user ID format', SESSION_ERROR_CODES.INVALID_USER_ID);
  }

  try {
    const completionKey = UserSessionKeys.dailyCompletion(userId, date);
    const exists = await redis.exists(completionKey);
    return exists === 1;
  } catch (error) {
    console.error('Error checking daily completion:', error);
    throw new SessionError('Failed to check daily completion', SESSION_ERROR_CODES.REDIS_ERROR);
  }
}

/**
 * Get user's completion data for today (if exists)
 */
export async function getUserDailyCompletion(
  userId: string,
  date?: string
): Promise<unknown | null> {
  // Validate user ID
  if (!isValidUserId(userId)) {
    throw new SessionError('Invalid user ID format', SESSION_ERROR_CODES.INVALID_USER_ID);
  }

  try {
    const completionKey = UserSessionKeys.dailyCompletion(userId, date);
    const completionData = await redis.get(completionKey);

    if (!completionData) {
      return null;
    }

    return JSON.parse(completionData);
  } catch (error) {
    console.error('Error getting daily completion:', error);
    throw new SessionError('Failed to get daily completion', SESSION_ERROR_CODES.REDIS_ERROR);
  }
}

/**
 * Delete a game session (cleanup)
 */
export async function deleteGameSession(userId: string, sessionId: string): Promise<void> {
  // Validate inputs
  if (!isValidUserId(userId)) {
    throw new SessionError('Invalid user ID format', SESSION_ERROR_CODES.INVALID_USER_ID);
  }

  if (!isValidSessionId(sessionId)) {
    throw new SessionError('Invalid session ID format', SESSION_ERROR_CODES.INVALID_SESSION_ID);
  }

  try {
    const sessionKey = UserSessionKeys.session(userId, sessionId);
    await redis.del(sessionKey);
  } catch (error) {
    console.error('Error deleting game session:', error);
    throw new SessionError('Failed to delete game session', SESSION_ERROR_CODES.REDIS_ERROR);
  }
}

/**
 * Get all active sessions for a user (for cleanup/debugging)
 */
export async function getUserActiveSessions(userId: string): Promise<string[]> {
  // Validate user ID
  if (!isValidUserId(userId)) {
    throw new SessionError('Invalid user ID format', SESSION_ERROR_CODES.INVALID_USER_ID);
  }

  try {
    // Note: Devvit Redis doesn't support KEYS pattern matching
    // This is a simplified implementation - in production you'd need to track session IDs separately
    // For now, return empty array as this is primarily for debugging
    console.warn('getUserActiveSessions: Pattern matching not supported in Devvit Redis');
    return [];
  } catch (error) {
    console.error('Error getting user active sessions:', error);
    throw new SessionError('Failed to get user active sessions', SESSION_ERROR_CODES.REDIS_ERROR);
  }
}

/**
 * Cleanup expired sessions (utility function for maintenance)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    // Note: Devvit Redis doesn't support KEYS pattern matching or TTL inspection
    // Redis will automatically expire keys based on the expire settings
    // This function is not needed in Devvit environment
    console.warn(
      'cleanupExpiredSessions: Not supported in Devvit Redis - keys expire automatically'
    );
    return 0;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    throw new SessionError('Failed to cleanup expired sessions', SESSION_ERROR_CODES.REDIS_ERROR);
  }
}
