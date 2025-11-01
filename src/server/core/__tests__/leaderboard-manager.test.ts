/**
 * Unit tests for leaderboard operations and Redis sorted sets
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  addScoreToLeaderboards,
  getLeaderboard,
  getUserRank,
  getLeaderboardParticipantCount,
  consolidateLeaderboard,
  LeaderboardError,
  LEADERBOARD_ERROR_CODES,
} from '../leaderboard-manager.js';
import { BadgeType } from '../../../shared/types/api.js';

// Mock Redis operations
const mockRedis = vi.hoisted(() => ({
  zAdd: vi.fn(),
  zRange: vi.fn(),
  zCard: vi.fn(),
  zRem: vi.fn(),
  expire: vi.fn(),
}));

const mockRealtime = vi.hoisted(() => ({
  send: vi.fn(),
}));

vi.mock('@devvit/web/server', () => ({
  redis: mockRedis,
  realtime: mockRealtime,
}));

describe('Leaderboard Manager - Score Addition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add score to all leaderboards successfully', async () => {
    mockRedis.zAdd.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);
    mockRedis.zRange.mockResolvedValue([
      { member: JSON.stringify({ userId: 'user1', score: 85 }), score: 85 }
    ]);

    await addScoreToLeaderboards(
      'user123',
      'testuser',
      85.5,
      4,
      5.5,
      BadgeType.GOOD_SAMARITAN,
      Date.now()
    );

    // Should call zAdd for daily, weekly, and all-time leaderboards
    expect(mockRedis.zAdd).toHaveBeenCalledTimes(3);
    expect(mockRedis.expire).toHaveBeenCalledTimes(2); // Daily and weekly only
    expect(mockRealtime.send).toHaveBeenCalled();
  });

  it('should reject invalid user ID', async () => {
    await expect(
      addScoreToLeaderboards('', 'testuser', 85, 4, 5, BadgeType.GOOD_SAMARITAN)
    ).rejects.toThrow(LeaderboardError);
  });

  it('should reject negative score', async () => {
    await expect(
      addScoreToLeaderboards('user123', 'testuser', -10, 4, 5, BadgeType.GOOD_SAMARITAN)
    ).rejects.toThrow(LeaderboardError);
  });

  it('should handle Redis errors gracefully', async () => {
    mockRedis.zAdd.mockRejectedValue(new Error('Redis connection failed'));

    await expect(
      addScoreToLeaderboards('user123', 'testuser', 85, 4, 5, BadgeType.GOOD_SAMARITAN)
    ).rejects.toThrow(LeaderboardError);
  });
});

describe('Leaderboard Manager - Leaderboard Retrieval', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve leaderboard entries successfully', async () => {
    const mockEntries = [
      {
        member: JSON.stringify({
          userId: 'user1',
          username: 'player1',
          score: 95,
          correctCount: 5,
          timeBonus: 15,
          completedAt: Date.now(),
          badge: BadgeType.AI_WHISPERER,
        }),
        score: 95,
      },
      {
        member: JSON.stringify({
          userId: 'user2',
          username: 'player2',
          score: 80,
          correctCount: 4,
          timeBonus: 0,
          completedAt: Date.now(),
          badge: BadgeType.GOOD_SAMARITAN,
        }),
        score: 80,
      },
    ];

    mockRedis.zRange.mockResolvedValue(mockEntries);

    const result = await getLeaderboard('daily', 10, 0);

    expect(result).toHaveLength(2);
    expect(result[0].score).toBe(95);
    expect(result[0].username).toBe('player1');
    expect(result[1].score).toBe(80);
    expect(result[1].username).toBe('player2');
  });

  it('should handle empty leaderboard', async () => {
    mockRedis.zRange.mockResolvedValue([]);

    const result = await getLeaderboard('daily');
    expect(result).toHaveLength(0);
  });

  it('should reject invalid leaderboard type', async () => {
    await expect(
      getLeaderboard('invalid' as any)
    ).rejects.toThrow(LeaderboardError);
  });

  it('should handle malformed entries gracefully', async () => {
    const mockEntries = [
      { member: 'invalid-json', score: 95 },
      {
        member: JSON.stringify({
          userId: 'user2',
          username: 'player2',
          score: 80,
          correctCount: 4,
          timeBonus: 0,
          completedAt: Date.now(),
          badge: BadgeType.GOOD_SAMARITAN,
        }),
        score: 80,
      },
    ];

    mockRedis.zRange.mockResolvedValue(mockEntries);

    const result = await getLeaderboard('daily');
    expect(result).toHaveLength(1); // Should skip malformed entry
    expect(result[0].username).toBe('player2');
  });
});

describe('Leaderboard Manager - User Rank', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should find user rank successfully', async () => {
    const mockEntries = [
      {
        member: JSON.stringify({ userId: 'user1', score: 95 }),
        score: 95,
      },
      {
        member: JSON.stringify({ userId: 'user2', score: 80 }),
        score: 80,
      },
      {
        member: JSON.stringify({ userId: 'target-user', score: 75 }),
        score: 75,
      },
    ];

    mockRedis.zRange.mockResolvedValue(mockEntries);

    const result = await getUserRank('target-user', 'daily');

    expect(result).toEqual({
      rank: 3,
      score: 75,
      totalParticipants: 3,
    });
  });

  it('should return null for user not on leaderboard', async () => {
    const mockEntries = [
      {
        member: JSON.stringify({ userId: 'user1', score: 95 }),
        score: 95,
      },
    ];

    mockRedis.zRange.mockResolvedValue(mockEntries);

    const result = await getUserRank('nonexistent-user', 'daily');
    expect(result).toBeNull();
  });

  it('should reject invalid user ID', async () => {
    await expect(
      getUserRank('', 'daily')
    ).rejects.toThrow(LeaderboardError);
  });

  it('should reject invalid leaderboard type', async () => {
    await expect(
      getUserRank('user123', 'invalid' as any)
    ).rejects.toThrow(LeaderboardError);
  });
});

describe('Leaderboard Manager - Participant Count', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get participant count successfully', async () => {
    mockRedis.zCard.mockResolvedValue(42);

    const count = await getLeaderboardParticipantCount('daily');
    expect(count).toBe(42);
  });

  it('should handle empty leaderboard', async () => {
    mockRedis.zCard.mockResolvedValue(0);

    const count = await getLeaderboardParticipantCount('weekly');
    expect(count).toBe(0);
  });

  it('should reject invalid leaderboard type', async () => {
    await expect(
      getLeaderboardParticipantCount('invalid' as any)
    ).rejects.toThrow(LeaderboardError);
  });
});

describe('Leaderboard Manager - Consolidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should consolidate leaderboard by removing duplicates and keeping best scores', async () => {
    // Mock entries with duplicates - user1 has two entries, user2 has one
    const mockEntries = [
      { member: JSON.stringify({ userId: 'user1', username: 'player1', score: 85, correctCount: 4, timeBonus: 10, completedAt: 1000, badge: 'detective' as BadgeType }), score: 85 },
      { member: JSON.stringify({ userId: 'user2', username: 'player2', score: 90, correctCount: 5, timeBonus: 15, completedAt: 2000, badge: 'expert' as BadgeType }), score: 90 },
      { member: JSON.stringify({ userId: 'user1', username: 'player1', score: 95, correctCount: 5, timeBonus: 20, completedAt: 3000, badge: 'expert' as BadgeType }), score: 95 }, // Better score for user1
    ];

    mockRedis.zRange.mockResolvedValue(mockEntries);
    mockRedis.del.mockResolvedValue(1);
    mockRedis.zAdd.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);

    const result = await consolidateLeaderboard('daily');

    expect(result.originalCount).toBe(3);
    expect(result.consolidatedCount).toBe(2); // Only 2 unique users
    expect(result.duplicatesRemoved).toBe(1);

    // Should delete the old leaderboard
    expect(mockRedis.del).toHaveBeenCalledWith(expect.stringContaining('daily'));

    // Should add back only the best entries (2 calls for 2 unique users)
    expect(mockRedis.zAdd).toHaveBeenCalledTimes(2);
    
    // Should add user1's better score (95) and user2's score (90)
    expect(mockRedis.zAdd).toHaveBeenCalledWith(
      expect.stringContaining('daily'),
      { member: expect.stringContaining('"score":95'), score: 95 }
    );
    expect(mockRedis.zAdd).toHaveBeenCalledWith(
      expect.stringContaining('daily'),
      { member: expect.stringContaining('"score":90'), score: 90 }
    );
  });

  it('should handle leaderboard with no duplicates', async () => {
    const mockEntries = [
      { member: JSON.stringify({ userId: 'user1', username: 'player1', score: 85, correctCount: 4, timeBonus: 10, completedAt: 1000, badge: 'detective' as BadgeType }), score: 85 },
      { member: JSON.stringify({ userId: 'user2', username: 'player2', score: 90, correctCount: 5, timeBonus: 15, completedAt: 2000, badge: 'expert' as BadgeType }), score: 90 },
    ];

    mockRedis.zRange.mockResolvedValue(mockEntries);

    const result = await consolidateLeaderboard('weekly');

    expect(result.originalCount).toBe(2);
    expect(result.consolidatedCount).toBe(2);
    expect(result.duplicatesRemoved).toBe(0);

    // Should not delete or rebuild if no duplicates
    expect(mockRedis.del).not.toHaveBeenCalled();
    expect(mockRedis.zAdd).not.toHaveBeenCalled();
  });

  it('should handle empty leaderboard', async () => {
    mockRedis.zRange.mockResolvedValue([]);

    const result = await consolidateLeaderboard('all-time');

    expect(result.originalCount).toBe(0);
    expect(result.consolidatedCount).toBe(0);
    expect(result.duplicatesRemoved).toBe(0);
  });

  it('should reject invalid leaderboard type', async () => {
    await expect(
      consolidateLeaderboard('invalid' as any)
    ).rejects.toThrow(LeaderboardError);
  });
});

describe('Leaderboard Manager - Best Score Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should only update if new score is better', async () => {
    // Mock existing entry with score 90
    const existingEntry = { 
      member: JSON.stringify({ 
        userId: 'user1', 
        username: 'player1', 
        score: 90, 
        correctCount: 5, 
        timeBonus: 15, 
        completedAt: 1000, 
        badge: 'expert' as BadgeType 
      }), 
      score: 90 
    };

    mockRedis.zRange.mockResolvedValue([existingEntry]);
    mockRedis.zRem.mockResolvedValue(1);
    mockRedis.zAdd.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);

    // Try to add a better score (95)
    await addScoreToLeaderboards(
      'user1',
      'player1',
      95,
      5,
      20,
      'expert',
      2000
    );

    // Should remove old entry and add new one
    expect(mockRedis.zRem).toHaveBeenCalled();
    expect(mockRedis.zAdd).toHaveBeenCalledWith(
      expect.any(String),
      { member: expect.stringContaining('"score":95'), score: 95 }
    );
  });

  it('should not update if new score is worse', async () => {
    // Mock existing entry with score 90
    const existingEntry = { 
      member: JSON.stringify({ 
        userId: 'user1', 
        username: 'player1', 
        score: 90, 
        correctCount: 5, 
        timeBonus: 15, 
        completedAt: 1000, 
        badge: 'expert' as BadgeType 
      }), 
      score: 90 
    };

    mockRedis.zRange.mockResolvedValue([existingEntry]);

    // Try to add a worse score (85)
    await addScoreToLeaderboards(
      'user1',
      'player1',
      85,
      4,
      10,
      'detective',
      2000
    );

    // Should not remove or add anything for worse scores
    expect(mockRedis.zRem).not.toHaveBeenCalled();
    // zAdd should still be called 3 times for the 3 leaderboards, but with no actual updates
    expect(mockRedis.zAdd).toHaveBeenCalledTimes(3);
  });
});

describe('Leaderboard Manager - Error Handling', () => {
  it('should create LeaderboardError with correct properties', () => {
    const error = new LeaderboardError('Test error', LEADERBOARD_ERROR_CODES.INVALID_USER_ID);
    expect(error.name).toBe('LeaderboardError');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe(LEADERBOARD_ERROR_CODES.INVALID_USER_ID);
  });

  it('should have all required error codes', () => {
    expect(LEADERBOARD_ERROR_CODES.INVALID_USER_ID).toBeDefined();
    expect(LEADERBOARD_ERROR_CODES.INVALID_SCORE).toBeDefined();
    expect(LEADERBOARD_ERROR_CODES.INVALID_LEADERBOARD_TYPE).toBeDefined();
    expect(LEADERBOARD_ERROR_CODES.REDIS_ERROR).toBeDefined();
    expect(LEADERBOARD_ERROR_CODES.USER_NOT_FOUND).toBeDefined();
  });
});
