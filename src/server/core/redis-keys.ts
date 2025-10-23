/**
 * Redis Key Schema and Utility Functions
 *
 * This module defines consistent Redis key naming conventions and provides
 * utility functions for generating keys for daily game state, user sessions,
 * and leaderboards.
 */

/**
 * Redis Key Prefixes
 */
export const KEY_PREFIXES = {
  // Daily game state keys
  DAILY_GAME: 'daily_game',
  DAILY_PARTICIPANTS: 'daily_participants',

  // User session keys
  USER_SESSION: 'user_session',
  USER_DAILY_COMPLETION: 'user_daily_completion',

  // Leaderboard keys (using sorted sets)
  LEADERBOARD_DAILY: 'leaderboard_daily',
  LEADERBOARD_WEEKLY: 'leaderboard_weekly',
  LEADERBOARD_ALL_TIME: 'leaderboard_all_time',

  // Participant counting
  PARTICIPANT_COUNT: 'participant_count',
} as const;

/**
 * Key Separators and Formats
 */
export const KEY_SEPARATOR = ':';
export const DATE_FORMAT = 'YYYY-MM-DD';
export const WEEK_FORMAT = 'YYYY-WW'; // Year-Week format

/**
 * Utility Functions for Redis Key Generation
 */

/**
 * Get current date in YYYY-MM-DD format (UTC)
 */
export function getCurrentDateUTC(): string {
  const now = new Date();
  const dateString = now.toISOString().split('T')[0];
  if (!dateString) {
    throw new Error('Failed to get current date');
  }
  return dateString;
}

/**
 * Get current week in YYYY-WW format (UTC)
 */
export function getCurrentWeekUTC(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  const week = Math.ceil(dayOfYear / 7);
  return `${year}-${week.toString().padStart(2, '0')}`;
}

/**
 * Daily Game State Keys
 */
export const DailyGameKeys = {
  /**
   * Key for storing daily game configuration and image set
   * Format: daily_game:YYYY-MM-DD
   */
  gameState: (date?: string): string => {
    const gameDate = date || getCurrentDateUTC();
    return `${KEY_PREFIXES.DAILY_GAME}${KEY_SEPARATOR}${gameDate}`;
  },

  /**
   * Key for tracking daily participant count
   * Format: daily_participants:YYYY-MM-DD
   */
  participantCount: (date?: string): string => {
    const gameDate = date || getCurrentDateUTC();
    return `${KEY_PREFIXES.DAILY_PARTICIPANTS}${KEY_SEPARATOR}${gameDate}`;
  },
};

/**
 * User Session Keys
 */
export const UserSessionKeys = {
  /**
   * Key for storing active user game session
   * Format: user_session:userId:sessionId
   */
  session: (userId: string, sessionId: string): string => {
    return `${KEY_PREFIXES.USER_SESSION}${KEY_SEPARATOR}${userId}${KEY_SEPARATOR}${sessionId}`;
  },

  /**
   * Key for tracking user daily completion status
   * Format: user_daily_completion:userId:YYYY-MM-DD
   */
  dailyCompletion: (userId: string, date?: string): string => {
    const gameDate = date || getCurrentDateUTC();
    return `${KEY_PREFIXES.USER_DAILY_COMPLETION}${KEY_SEPARATOR}${userId}${KEY_SEPARATOR}${gameDate}`;
  },
};

/**
 * Leaderboard Keys (Redis Sorted Sets)
 */
export const LeaderboardKeys = {
  /**
   * Key for daily leaderboard sorted set
   * Format: leaderboard_daily:YYYY-MM-DD
   */
  daily: (date?: string): string => {
    const gameDate = date || getCurrentDateUTC();
    return `${KEY_PREFIXES.LEADERBOARD_DAILY}${KEY_SEPARATOR}${gameDate}`;
  },

  /**
   * Key for weekly leaderboard sorted set
   * Format: leaderboard_weekly:YYYY-WW
   */
  weekly: (week?: string): string => {
    const gameWeek = week || getCurrentWeekUTC();
    return `${KEY_PREFIXES.LEADERBOARD_WEEKLY}${KEY_SEPARATOR}${gameWeek}`;
  },

  /**
   * Key for all-time leaderboard sorted set
   * Format: leaderboard_all_time
   */
  allTime: (): string => {
    return KEY_PREFIXES.LEADERBOARD_ALL_TIME;
  },
};

/**
 * Participant Count Keys
 */
export const ParticipantKeys = {
  /**
   * Key for real-time participant count
   * Format: participant_count:YYYY-MM-DD
   */
  count: (date?: string): string => {
    const gameDate = date || getCurrentDateUTC();
    return `${KEY_PREFIXES.PARTICIPANT_COUNT}${KEY_SEPARATOR}${gameDate}`;
  },
};

/**
 * Key Expiration Times (in seconds)
 */
export const KEY_EXPIRATION = {
  // User sessions expire after 1 hour
  USER_SESSION: 60 * 60,

  // Daily completion tracking expires after 25 hours (to handle timezone edge cases)
  DAILY_COMPLETION: 25 * 60 * 60,

  // Daily game state expires after 25 hours
  DAILY_GAME_STATE: 25 * 60 * 60,

  // Daily participant count expires after 25 hours
  DAILY_PARTICIPANT_COUNT: 25 * 60 * 60,

  // Daily leaderboards expire after 8 days (to allow for weekly rollup)
  DAILY_LEADERBOARD: 8 * 24 * 60 * 60,

  // Weekly leaderboards expire after 32 days (to allow for monthly rollup)
  WEEKLY_LEADERBOARD: 32 * 24 * 60 * 60,

  // All-time leaderboards never expire (no expiration set)
  ALL_TIME_LEADERBOARD: null,
} as const;

/**
 * Validation Functions
 */

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const parsedDate = new Date(date + 'T00:00:00.000Z');
  return parsedDate.toISOString().split('T')[0] === date;
}

/**
 * Validate week format (YYYY-WW)
 */
export function isValidWeekFormat(week: string): boolean {
  const weekRegex = /^\d{4}-\d{2}$/;
  if (!weekRegex.test(week)) return false;

  const parts = week.split('-');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;

  const year = parseInt(parts[0], 10);
  const weekNum = parseInt(parts[1], 10);

  return year >= 2024 && weekNum >= 1 && weekNum <= 53;
}

/**
 * Validate user ID format
 */
export function isValidUserId(userId: string): boolean {
  return typeof userId === 'string' && userId.length > 0 && userId.length <= 100;
}

/**
 * Validate session ID format
 */
export function isValidSessionId(sessionId: string): boolean {
  return typeof sessionId === 'string' && sessionId.length > 0 && sessionId.length <= 100;
}
