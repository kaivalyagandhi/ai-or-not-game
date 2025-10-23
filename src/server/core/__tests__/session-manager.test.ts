/**
 * Unit tests for session management and Redis operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createGameSession,
  getGameSession,
  updateGameSession,
  hasUserPlayedToday,
  markDailyCompleted,
  generateSessionId,
  SessionError,
  SESSION_ERROR_CODES,
} from '../session-manager.js';
import { BadgeType } from '../../../shared/types/api.js';

// Mock Redis operations
const mockRedis = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  exists: vi.fn(),
  expire: vi.fn(),
}));

vi.mock('@devvit/web/server', () => ({
  redis: mockRedis,
}));

describe('Session Manager - Session ID Generation', () => {
  it('should generate unique session IDs', () => {
    const id1 = generateSessionId('user123');
    const id2 = generateSessionId('user123');
    
    expect(id1).not.toBe(id2);
    expect(id1).toContain('user123');
    expect(id2).toContain('user123');
  });

  it('should include user ID in session ID', () => {
    const sessionId = generateSessionId('testuser');
    expect(sessionId).toContain('testuser');
  });

  it('should generate session ID with timestamp', () => {
    const beforeTime = Date.now();
    const sessionId = generateSessionId('user123');
    const afterTime = Date.now();
    
    // Extract timestamp from session ID
    const parts = sessionId.split('_');
    const timestamp = parseInt(parts[1]);
    
    expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
    expect(timestamp).toBeLessThanOrEqual(afterTime);
  });
});

describe('Session Manager - Session Creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create new game session successfully', async () => {
    mockRedis.exists.mockResolvedValue(0); // User hasn't played today
    mockRedis.set.mockResolvedValue('OK');
    mockRedis.expire.mockResolvedValue(1);

    const session = await createGameSession('user123');

    expect(session.userId).toBe('user123');
    expect(session.sessionId).toContain('user123');
    expect(session.startTime).toBeCloseTo(Date.now(), -2); // Within 100ms
    expect(session.rounds).toEqual([]);
    expect(session.totalScore).toBe(0);
    expect(session.correctCount).toBe(0);
    expect(session.totalTimeBonus).toBe(0);
    expect(session.badge).toBe(BadgeType.HUMAN_IN_TRAINING);
    expect(session.completed).toBe(false);

    expect(mockRedis.set).toHaveBeenCalled();
    expect(mockRedis.expire).toHaveBeenCalled();
  });

  it('should reject invalid user ID', async () => {
    await expect(createGameSession('')).rejects.toThrow(SessionError);
    await expect(createGameSession(null as any)).rejects.toThrow(SessionError);
  });

  it('should reject if user already played today', async () => {
    mockRedis.exists.mockResolvedValue(1); // User has played today

    await expect(createGameSession('user123')).rejects.toThrow(SessionError);
    expect(mockRedis.set).not.toHaveBeenCalled();
  });

  it('should handle Redis errors during creation', async () => {
    mockRedis.exists.mockResolvedValue(0);
    mockRedis.set.mockRejectedValue(new Error('Redis error'));

    await expect(createGameSession('user123')).rejects.toThrow(SessionError);
  });
});

describe('Session Manager - Session Retrieval', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve existing session successfully', async () => {
    const mockSession = {
      userId: 'user123',
      sessionId: 'session456',
      startTime: Date.now(),
      rounds: [],
      totalScore: 0,
      correctCount: 0,
      totalTimeBonus: 0,
      badge: BadgeType.HUMAN_IN_TRAINING,
      completed: false,
    };

    mockRedis.get.mockResolvedValue(JSON.stringify(mockSession));

    const session = await getGameSession('user123', 'session456');

    expect(session).toEqual(mockSession);
  });

  it('should return null for non-existent session', async () => {
    mockRedis.get.mockResolvedValue(null);

    const session = await getGameSession('user123', 'nonexistent');
    expect(session).toBeNull();
  });

  it('should reject invalid user ID', async () => {
    await expect(getGameSession('', 'session456')).rejects.toThrow(SessionError);
  });

  it('should reject invalid session ID', async () => {
    await expect(getGameSession('user123', '')).rejects.toThrow(SessionError);
  });

  it('should handle Redis errors during retrieval', async () => {
    mockRedis.get.mockRejectedValue(new Error('Redis error'));

    await expect(getGameSession('user123', 'session456')).rejects.toThrow(SessionError);
  });
});

describe('Session Manager - Session Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update existing session successfully', async () => {
    const session = {
      userId: 'user123',
      sessionId: 'session456',
      startTime: Date.now(),
      rounds: [],
      totalScore: 50,
      correctCount: 3,
      totalTimeBonus: 20,
      badge: BadgeType.JUST_HUMAN,
      completed: false,
    };

    mockRedis.exists.mockResolvedValue(1); // Session exists
    mockRedis.set.mockResolvedValue('OK');
    mockRedis.expire.mockResolvedValue(1);

    await updateGameSession(session);

    expect(mockRedis.set).toHaveBeenCalledWith(
      expect.stringContaining('session:user123:session456'),
      JSON.stringify(session)
    );
    expect(mockRedis.expire).toHaveBeenCalled();
  });

  it('should reject update for non-existent session', async () => {
    const session = createMockGameSession();
    mockRedis.exists.mockResolvedValue(0); // Session doesn't exist

    await expect(updateGameSession(session)).rejects.toThrow(SessionError);
  });

  it('should reject session with invalid user ID', async () => {
    const session = createMockGameSession();
    session.userId = '';

    await expect(updateGameSession(session)).rejects.toThrow(SessionError);
  });

  it('should handle Redis errors during update', async () => {
    const session = createMockGameSession();
    mockRedis.exists.mockResolvedValue(1);
    mockRedis.set.mockRejectedValue(new Error('Redis error'));

    await expect(updateGameSession(session)).rejects.toThrow(SessionError);
  });
});

describe('Session Manager - Daily Completion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should check if user played today', async () => {
    mockRedis.exists.mockResolvedValue(1);

    const hasPlayed = await hasUserPlayedToday('user123');
    expect(hasPlayed).toBe(true);
  });

  it('should return false if user has not played today', async () => {
    mockRedis.exists.mockResolvedValue(0);

    const hasPlayed = await hasUserPlayedToday('user123');
    expect(hasPlayed).toBe(false);
  });

  it('should mark daily completion successfully', async () => {
    const session = createMockGameSession();
    session.totalScore = 85;
    session.correctCount = 4;
    session.badge = BadgeType.GOOD_SAMARITAN;

    mockRedis.set.mockResolvedValue('OK');
    mockRedis.expire.mockResolvedValue(1);
    mockRedis.exists.mockResolvedValue(1); // For updateGameSession

    await markDailyCompleted('user123', session);

    expect(mockRedis.set).toHaveBeenCalledTimes(2); // Completion record + session update
    expect(session.completed).toBe(true);
  });

  it('should reject invalid user ID for daily completion', async () => {
    const session = createMockGameSession();

    await expect(markDailyCompleted('', session)).rejects.toThrow(SessionError);
  });
});

describe('Session Manager - Error Handling', () => {
  it('should create SessionError with correct properties', () => {
    const error = new SessionError('Test error', SESSION_ERROR_CODES.INVALID_USER_ID);
    expect(error.name).toBe('SessionError');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe(SESSION_ERROR_CODES.INVALID_USER_ID);
  });

  it('should have all required error codes', () => {
    expect(SESSION_ERROR_CODES.INVALID_USER_ID).toBeDefined();
    expect(SESSION_ERROR_CODES.INVALID_SESSION_ID).toBeDefined();
    expect(SESSION_ERROR_CODES.SESSION_NOT_FOUND).toBeDefined();
    expect(SESSION_ERROR_CODES.ALREADY_PLAYED_TODAY).toBeDefined();
    expect(SESSION_ERROR_CODES.SESSION_EXPIRED).toBeDefined();
    expect(SESSION_ERROR_CODES.REDIS_ERROR).toBeDefined();
  });
});
