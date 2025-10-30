/**
 * Unit tests for play limit system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getUserPlayLimit,
  initializeUserPlayLimit,
  canUserPlay,
  incrementUserAttempts,
  updateBestScore,
  getUserPlayStats,
  resetUserPlayLimit,
  validatePlayLimitData,
  PlayLimitError,
  PLAY_LIMIT_ERROR_CODES,
} from '../play-limit-manager.js';
import { BadgeType } from '../../../shared/types/api.js';

// Mock Redis operations
const mockRedis = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  expire: vi.fn(),
}));

vi.mock('@devvit/web/server', () => ({
  redis: mockRedis,
}));

// Mock environment
const originalEnv = process.env.NODE_ENV;

describe('Play Limit Manager - Initialization and Retrieval', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should return null for non-existent play limit', async () => {
    mockRedis.get.mockResolvedValue(null);

    const result = await getUserPlayLimit('user123');

    expect(result).toBeNull();
    expect(mockRedis.get).toHaveBeenCalledWith(expect.stringContaining('user123'));
  });

  it('should return existing play limit data', async () => {
    const mockPlayLimit = {
      userId: 'user123',
      date: '2024-01-01',
      attempts: 1,
      maxAttempts: 2,
      bestScore: 85.5,
      bestAttempt: { totalScore: 85.5 },
    };

    mockRedis.get.mockResolvedValue(JSON.stringify(mockPlayLimit));

    const result = await getUserPlayLimit('user123');

    expect(result).toEqual(mockPlayLimit);
  });

  it('should handle malformed play limit data', async () => {
    mockRedis.get.mockResolvedValue('invalid-json');

    await expect(getUserPlayLimit('user123')).rejects.toThrow(PlayLimitError);
  });

  it('should reject invalid user ID', async () => {
    await expect(getUserPlayLimit('')).rejects.toThrow(PlayLimitError);
    await expect(getUserPlayLimit(null as any)).rejects.toThrow(PlayLimitError);
  });

  it('should initialize new play limit data', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue('OK');
    mockRedis.expire.mockResolvedValue(1);

    const result = await initializeUserPlayLimit('user123');

    expect(result).toEqual({
      userId: 'user123',
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      attempts: 0,
      maxAttempts: 999, // Development mode
      bestScore: 0,
      bestAttempt: {},
    });

    expect(mockRedis.set).toHaveBeenCalled();
    expect(mockRedis.expire).toHaveBeenCalled();
  });

  it('should return existing play limit when initializing', async () => {
    const existingLimit = {
      userId: 'user123',
      date: '2024-01-01',
      attempts: 1,
      maxAttempts: 2,
      bestScore: 50,
      bestAttempt: {},
    };

    mockRedis.get.mockResolvedValue(JSON.stringify(existingLimit));

    const result = await initializeUserPlayLimit('user123');

    expect(result).toEqual(existingLimit);
    expect(mockRedis.set).not.toHaveBeenCalled();
  });

  it('should use custom date when provided', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue('OK');
    mockRedis.expire.mockResolvedValue(1);

    const customDate = '2024-12-25';
    const result = await initializeUserPlayLimit('user123', customDate);

    expect(result.date).toBe(customDate);
  });
});

describe('Play Limit Manager - Play Permission Checking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should allow play when user has remaining attempts', async () => {
    const playLimit = {
      userId: 'user123',
      date: '2024-01-01',
      attempts: 1,
      maxAttempts: 2,
      bestScore: 0,
      bestAttempt: {},
    };

    mockRedis.get.mockResolvedValue(JSON.stringify(playLimit));

    const result = await canUserPlay('user123');

    expect(result).toEqual({
      canPlay: true,
      remainingAttempts: 1,
      maxAttempts: 2,
    });
  });

  it('should deny play when user has no remaining attempts', async () => {
    const playLimit = {
      userId: 'user123',
      date: '2024-01-01',
      attempts: 2,
      maxAttempts: 2,
      bestScore: 0,
      bestAttempt: {},
    };

    mockRedis.get.mockResolvedValue(JSON.stringify(playLimit));

    const result = await canUserPlay('user123');

    expect(result).toEqual({
      canPlay: false,
      remainingAttempts: 0,
      maxAttempts: 2,
      reason: 'Daily play limit reached',
    });
  });

  it('should handle invalid user ID gracefully', async () => {
    const result = await canUserPlay('');

    expect(result).toEqual({
      canPlay: false,
      remainingAttempts: 0,
      maxAttempts: 0,
      reason: 'Invalid user ID',
    });
  });

  it('should handle Redis errors in development mode', async () => {
    mockRedis.get.mockRejectedValue(new Error('Redis error'));
    process.env.NODE_ENV = 'development';

    const result = await canUserPlay('user123');

    expect(result.canPlay).toBe(true);
    expect(result.remainingAttempts).toBe(999);
    expect(result.maxAttempts).toBe(999);
  });

  it('should handle Redis errors in production mode', async () => {
    mockRedis.get.mockRejectedValue(new Error('Redis error'));
    process.env.NODE_ENV = 'production';

    const result = await canUserPlay('user123');

    expect(result.canPlay).toBe(false);
    expect(result.remainingAttempts).toBe(0);
    expect(result.maxAttempts).toBe(2);
    expect(result.reason).toBe('Error checking play limit');
  });
});

describe('Play Limit Manager - Attempt Tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should increment user attempts successfully', async () => {
    const playLimit = {
      userId: 'user123',
      date: '2024-01-01',
      attempts: 0,
      maxAttempts: 2,
      bestScore: 0,
      bestAttempt: {},
    };

    mockRedis.get.mockResolvedValue(JSON.stringify(playLimit));
    mockRedis.set.mockResolvedValue('OK');
    mockRedis.expire.mockResolvedValue(1);

    const result = await incrementUserAttempts('user123');

    expect(result.attempts).toBe(1);
    expect(mockRedis.set).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify({ ...playLimit, attempts: 1 })
    );
  });

  it('should reject increment when limit exceeded', async () => {
    const playLimit = {
      userId: 'user123',
      date: '2024-01-01',
      attempts: 2,
      maxAttempts: 2,
      bestScore: 0,
      bestAttempt: {},
    };

    mockRedis.get.mockResolvedValue(JSON.stringify(playLimit));

    await expect(incrementUserAttempts('user123')).rejects.toThrow(
      new PlayLimitError('Daily play limit exceeded', PLAY_LIMIT_ERROR_CODES.LIMIT_EXCEEDED)
    );
  });

  it('should reject invalid user ID for increment', async () => {
    await expect(incrementUserAttempts('')).rejects.toThrow(
      new PlayLimitError('Invalid user ID', PLAY_LIMIT_ERROR_CODES.INVALID_USER_ID)
    );
  });

  it('should handle Redis errors during increment', async () => {
    mockRedis.get.mockRejectedValue(new Error('Redis error'));

    await expect(incrementUserAttempts('user123')).rejects.toThrow(PlayLimitError);
  });
});

describe('Play Limit Manager - Best Score Tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should update best score when new score is higher', async () => {
    const playLimit = {
      userId: 'user123',
      date: '2024-01-01',
      attempts: 1,
      maxAttempts: 2,
      bestScore: 50,
      bestAttempt: { totalScore: 50 },
    };

    const newSession = {
      userId: 'user123',
      sessionId: 'session456',
      startTime: Date.now(),
      rounds: [],
      totalScore: 85,
      correctCount: 4,
      totalTimeBonus: 5,
      badge: BadgeType.GOOD_SAMARITAN,
      completed: true,
    };

    mockRedis.get.mockResolvedValue(JSON.stringify(playLimit));
    mockRedis.set.mockResolvedValue('OK');
    mockRedis.expire.mockResolvedValue(1);

    const result = await updateBestScore('user123', newSession);

    expect(result.bestScore).toBe(85);
    expect(result.bestAttempt).toEqual(newSession);
    expect(mockRedis.set).toHaveBeenCalled();
  });

  it('should not update best score when new score is lower', async () => {
    const playLimit = {
      userId: 'user123',
      date: '2024-01-01',
      attempts: 1,
      maxAttempts: 2,
      bestScore: 90,
      bestAttempt: { totalScore: 90 },
    };

    const newSession = {
      userId: 'user123',
      sessionId: 'session456',
      startTime: Date.now(),
      rounds: [],
      totalScore: 75,
      correctCount: 3,
      totalTimeBonus: 5,
      badge: BadgeType.JUST_HUMAN,
      completed: true,
    };

    mockRedis.get.mockResolvedValue(JSON.stringify(playLimit));

    const result = await updateBestScore('user123', newSession);

    expect(result.bestScore).toBe(90);
    expect(result.bestAttempt).toEqual({ totalScore: 90 });
    expect(mockRedis.set).not.toHaveBeenCalled();
  });

  it('should reject invalid session data', async () => {
    await expect(updateBestScore('user123', null as any)).rejects.toThrow(
      new PlayLimitError('Invalid session data', PLAY_LIMIT_ERROR_CODES.INVALID_DATA)
    );

    await expect(updateBestScore('user123', 'invalid' as any)).rejects.toThrow(
      new PlayLimitError('Invalid session data', PLAY_LIMIT_ERROR_CODES.INVALID_DATA)
    );
  });

  it('should reject invalid user ID for best score update', async () => {
    const validSession = {
      userId: 'user123',
      sessionId: 'session456',
      totalScore: 85,
      completed: true,
    };

    await expect(updateBestScore('', validSession as any)).rejects.toThrow(
      new PlayLimitError('Invalid user ID', PLAY_LIMIT_ERROR_CODES.INVALID_USER_ID)
    );
  });
});

describe('Play Limit Manager - Statistics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should return complete play statistics', async () => {
    const playLimit = {
      userId: 'user123',
      date: '2024-01-01',
      attempts: 1,
      maxAttempts: 2,
      bestScore: 85,
      bestAttempt: { totalScore: 85, badge: BadgeType.GOOD_SAMARITAN },
    };

    mockRedis.get.mockResolvedValue(JSON.stringify(playLimit));

    const result = await getUserPlayStats('user123');

    expect(result).toEqual({
      attempts: 1,
      maxAttempts: 2,
      remainingAttempts: 1,
      bestScore: 85,
      bestAttempt: { totalScore: 85, badge: BadgeType.GOOD_SAMARITAN },
      canPlayAgain: true,
    });
  });

  it('should not include best attempt when score is zero', async () => {
    const playLimit = {
      userId: 'user123',
      date: '2024-01-01',
      attempts: 0,
      maxAttempts: 2,
      bestScore: 0,
      bestAttempt: {},
    };

    mockRedis.get.mockResolvedValue(JSON.stringify(playLimit));

    const result = await getUserPlayStats('user123');

    expect(result.bestAttempt).toBeUndefined();
    expect(result.bestScore).toBe(0);
  });

  it('should indicate when user cannot play again', async () => {
    const playLimit = {
      userId: 'user123',
      date: '2024-01-01',
      attempts: 2,
      maxAttempts: 2,
      bestScore: 75,
      bestAttempt: { totalScore: 75 },
    };

    mockRedis.get.mockResolvedValue(JSON.stringify(playLimit));

    const result = await getUserPlayStats('user123');

    expect(result.canPlayAgain).toBe(false);
    expect(result.remainingAttempts).toBe(0);
  });

  it('should return safe defaults on error', async () => {
    mockRedis.get.mockRejectedValue(new Error('Redis error'));

    const result = await getUserPlayStats('user123');

    expect(result).toEqual({
      attempts: 0,
      maxAttempts: 999, // Development mode default
      remainingAttempts: 999,
      bestScore: 0,
      canPlayAgain: true,
    });
  });

  it('should return safe defaults for invalid user ID for stats', async () => {
    const result = await getUserPlayStats('');
    expect(result).toEqual({
      attempts: 0,
      maxAttempts: 999, // Development mode default
      remainingAttempts: 999,
      bestScore: 0,
      canPlayAgain: true,
    });
  });
});

describe('Play Limit Manager - Environment Modes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should use production limits in production mode', async () => {
    process.env.NODE_ENV = 'production';
    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue('OK');
    mockRedis.expire.mockResolvedValue(1);

    const result = await initializeUserPlayLimit('user123');

    expect(result.maxAttempts).toBe(2);
  });

  it('should use development limits in development mode', async () => {
    process.env.NODE_ENV = 'development';
    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue('OK');
    mockRedis.expire.mockResolvedValue(1);

    const result = await initializeUserPlayLimit('user123');

    expect(result.maxAttempts).toBe(999);
  });

  it('should use development limits in test mode', async () => {
    process.env.NODE_ENV = 'test';
    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue('OK');
    mockRedis.expire.mockResolvedValue(1);

    const result = await initializeUserPlayLimit('user123');

    expect(result.maxAttempts).toBe(999);
  });

  it('should handle undefined NODE_ENV as development', async () => {
    delete process.env.NODE_ENV;
    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue('OK');
    mockRedis.expire.mockResolvedValue(1);

    const result = await initializeUserPlayLimit('user123');

    expect(result.maxAttempts).toBe(999);
  });
});

describe('Play Limit Manager - Reset and Cleanup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should reset user play limit successfully', async () => {
    mockRedis.del.mockResolvedValue(1);

    await resetUserPlayLimit('user123');

    expect(mockRedis.del).toHaveBeenCalledWith(expect.stringContaining('user123'));
  });

  it('should reject invalid user ID for reset', async () => {
    await expect(resetUserPlayLimit('')).rejects.toThrow(PlayLimitError);
  });

  it('should handle Redis errors during reset', async () => {
    mockRedis.del.mockRejectedValue(new Error('Redis error'));

    await expect(resetUserPlayLimit('user123')).rejects.toThrow(PlayLimitError);
  });

  it('should reset with custom date', async () => {
    mockRedis.del.mockResolvedValue(1);

    await resetUserPlayLimit('user123', '2024-12-25');

    expect(mockRedis.del).toHaveBeenCalledWith(expect.stringContaining('2024-12-25'));
  });
});

describe('Play Limit Manager - Data Validation', () => {
  it('should validate correct play limit data', () => {
    const validData = {
      userId: 'user123',
      date: '2024-01-01',
      attempts: 1,
      maxAttempts: 2,
      bestScore: 85.5,
      bestAttempt: {},
    };

    expect(validatePlayLimitData(validData)).toBe(true);
  });

  it('should reject null or undefined data', () => {
    expect(validatePlayLimitData(null)).toBe(false);
    expect(validatePlayLimitData(undefined)).toBe(false);
  });

  it('should reject non-object data', () => {
    expect(validatePlayLimitData('string')).toBe(false);
    expect(validatePlayLimitData(123)).toBe(false);
    expect(validatePlayLimitData([])).toBe(false);
  });

  it('should reject data missing required fields', () => {
    const incompleteData = {
      userId: 'user123',
      date: '2024-01-01',
      // Missing attempts, maxAttempts, bestScore
    };

    expect(validatePlayLimitData(incompleteData)).toBe(false);
  });

  it('should reject data with wrong field types', () => {
    const invalidData = {
      userId: 123, // Should be string
      date: '2024-01-01',
      attempts: '1', // Should be number
      maxAttempts: 2,
      bestScore: 85.5,
      bestAttempt: {},
    };

    expect(validatePlayLimitData(invalidData)).toBe(false);
  });

  it('should reject data with negative values', () => {
    const negativeData = {
      userId: 'user123',
      date: '2024-01-01',
      attempts: -1, // Should be >= 0
      maxAttempts: 2,
      bestScore: 85.5,
      bestAttempt: {},
    };

    expect(validatePlayLimitData(negativeData)).toBe(false);
  });

  it('should reject data with zero maxAttempts', () => {
    const zeroMaxData = {
      userId: 'user123',
      date: '2024-01-01',
      attempts: 0,
      maxAttempts: 0, // Should be > 0
      bestScore: 85.5,
      bestAttempt: {},
    };

    expect(validatePlayLimitData(zeroMaxData)).toBe(false);
  });
});

describe('Play Limit Manager - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should create PlayLimitError with correct properties', () => {
    const error = new PlayLimitError('Test error', PLAY_LIMIT_ERROR_CODES.INVALID_USER_ID);
    
    expect(error.name).toBe('PlayLimitError');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe(PLAY_LIMIT_ERROR_CODES.INVALID_USER_ID);
  });

  it('should have all required error codes', () => {
    expect(PLAY_LIMIT_ERROR_CODES.INVALID_USER_ID).toBeDefined();
    expect(PLAY_LIMIT_ERROR_CODES.LIMIT_EXCEEDED).toBeDefined();
    expect(PLAY_LIMIT_ERROR_CODES.REDIS_ERROR).toBeDefined();
    expect(PLAY_LIMIT_ERROR_CODES.INVALID_DATA).toBeDefined();
  });

  it('should handle Redis connection failures gracefully', async () => {
    mockRedis.get.mockRejectedValue(new Error('Connection refused'));

    await expect(getUserPlayLimit('user123')).rejects.toThrow(PlayLimitError);
  });

  it('should handle Redis timeout errors', async () => {
    mockRedis.set.mockRejectedValue(new Error('Operation timed out'));

    await expect(initializeUserPlayLimit('user123')).rejects.toThrow(PlayLimitError);
  });

  it('should handle malformed JSON in Redis', async () => {
    mockRedis.get.mockResolvedValue('{invalid json}');

    await expect(getUserPlayLimit('user123')).rejects.toThrow(PlayLimitError);
  });

  it('should handle empty string from Redis', async () => {
    mockRedis.get.mockResolvedValue('');

    const result = await getUserPlayLimit('user123');
    expect(result).toBeNull();
  });
});
