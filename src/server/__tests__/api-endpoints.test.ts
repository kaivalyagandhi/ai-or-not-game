/**
 * Integration tests for API endpoints
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock Devvit modules for testing
const mockRedis = {
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  exists: vi.fn(),
  expire: vi.fn(),
  zAdd: vi.fn(),
  zRange: vi.fn(),
  zCard: vi.fn(),
  zRem: vi.fn(),
};

const mockRealtime = {
  send: vi.fn(),
};

const mockReddit = {
  getCurrentUsername: vi.fn().mockResolvedValue('testuser'),
};

vi.mock('@devvit/web/server', () => ({
  redis: mockRedis,
  realtime: mockRealtime,
  reddit: mockReddit,
}));

// Import the server after mocking
let app: express.Application;

describe('API Endpoints - Game Management', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    
    // Import and set up routes after mocking
    const { setupRoutes } = await import('../index.js');
    setupRoutes(app);
  });

  describe('GET /api/game/init', () => {
    it('should initialize game for new user', async () => {
      // Mock user hasn't played today
      mockRedis.exists.mockResolvedValue(0);
      
      // Mock daily game state exists
      mockRedis.get.mockResolvedValue(JSON.stringify({
        date: '2024-01-01',
        imageSet: [
          createMockGameRound(1),
          createMockGameRound(2),
          createMockGameRound(3),
          createMockGameRound(4),
          createMockGameRound(5),
        ],
        participantCount: 42,
        categoryOrder: ['Animals', 'Architecture', 'Nature', 'Food', 'Products'],
      }));

      const response = await request(app)
        .get('/api/game/init')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.session).toBeUndefined(); // New user, no existing session
    });

    it('should return existing completion for user who already played', async () => {
      // Mock user has played today
      mockRedis.exists.mockResolvedValue(1);
      
      // Mock completion data
      const completionData = {
        sessionId: 'completed-session-123',
        completedAt: Date.now(),
        totalScore: 85.5,
        correctCount: 4,
        badge: 'GOOD_SAMARITAN',
      };
      
      mockRedis.get.mockResolvedValue(JSON.stringify(completionData));

      const response = await request(app)
        .get('/api/game/init')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.session).toBeDefined();
      expect(response.body.session.completed).toBe(true);
      expect(response.body.session.totalScore).toBe(85.5);
    });

    it('should handle missing daily game state', async () => {
      // Mock user hasn't played today
      mockRedis.exists.mockResolvedValue(0);
      
      // Mock no daily game state
      mockRedis.get.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/game/init')
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Daily game not available');
    });
  });

  describe('POST /api/game/start', () => {
    it('should start new game successfully', async () => {
      // Mock user hasn't played today
      mockRedis.exists.mockResolvedValue(0);
      
      // Mock daily game state
      const dailyGameState = {
        date: '2024-01-01',
        imageSet: [
          createMockGameRound(1),
          createMockGameRound(2),
          createMockGameRound(3),
          createMockGameRound(4),
          createMockGameRound(5),
        ],
        participantCount: 42,
        categoryOrder: ['Animals', 'Architecture', 'Nature', 'Food', 'Products'],
      };
      
      mockRedis.get.mockResolvedValue(JSON.stringify(dailyGameState));
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.expire.mockResolvedValue(1);

      const response = await request(app)
        .post('/api/game/start')
        .send({ userId: 'test-user-123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sessionId).toBeDefined();
      expect(response.body.currentRound).toBeDefined();
      expect(response.body.currentRound.roundNumber).toBe(1);
    });

    it('should reject user who already played today', async () => {
      // Mock user has played today
      mockRedis.exists.mockResolvedValue(1);

      const response = await request(app)
        .post('/api/game/start')
        .send({ userId: 'test-user-123' })
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already completed');
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/game/start')
        .send({}) // Missing userId
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid user ID');
    });
  });

  describe('POST /api/game/submit-answer', () => {
    beforeEach(() => {
      // Mock existing session
      const mockSession = {
        userId: 'test-user-123',
        sessionId: 'test-session-456',
        startTime: Date.now(),
        rounds: [
          { ...createMockGameRound(1), userAnswer: undefined },
          createMockGameRound(2),
          createMockGameRound(3),
          createMockGameRound(4),
          createMockGameRound(5),
        ],
        totalScore: 0,
        correctCount: 0,
        totalTimeBonus: 0,
        badge: 'HUMAN_IN_TRAINING',
        completed: false,
      };
      
      mockRedis.get.mockResolvedValue(JSON.stringify(mockSession));
      mockRedis.exists.mockResolvedValue(1); // Session exists
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.expire.mockResolvedValue(1);
    });

    it('should submit correct answer successfully', async () => {
      const response = await request(app)
        .post('/api/game/submit-answer')
        .send({
          sessionId: 'test-session-456',
          roundNumber: 1,
          userAnswer: 'A',
          timeRemaining: 5000,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.isCorrect).toBe(true);
      expect(response.body.correctAnswer).toBe('A');
      expect(response.body.roundScore).toBeGreaterThan(1);
      expect(response.body.gameComplete).toBe(false);
      expect(response.body.nextRound).toBeDefined();
    });

    it('should submit incorrect answer', async () => {
      const response = await request(app)
        .post('/api/game/submit-answer')
        .send({
          sessionId: 'test-session-456',
          roundNumber: 1,
          userAnswer: 'B', // Incorrect answer
          timeRemaining: 5000,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.isCorrect).toBe(false);
      expect(response.body.correctAnswer).toBe('A');
      expect(response.body.roundScore).toBe(0);
    });

    it('should validate request parameters', async () => {
      const response = await request(app)
        .post('/api/game/submit-answer')
        .send({
          sessionId: 'test-session-456',
          roundNumber: 'invalid', // Invalid round number
          userAnswer: 'A',
          timeRemaining: 5000,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid round number');
    });

    it('should reject invalid answer values', async () => {
      const response = await request(app)
        .post('/api/game/submit-answer')
        .send({
          sessionId: 'test-session-456',
          roundNumber: 1,
          userAnswer: 'C', // Invalid answer
          timeRemaining: 5000,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid answer');
    });

    it('should handle negative time remaining', async () => {
      const response = await request(app)
        .post('/api/game/submit-answer')
        .send({
          sessionId: 'test-session-456',
          roundNumber: 1,
          userAnswer: 'A',
          timeRemaining: -1000, // Negative time
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid time remaining');
    });
  });
});

describe('API Endpoints - Leaderboard Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/leaderboard/daily', () => {
    it('should return daily leaderboard', async () => {
      const mockLeaderboardEntries = [
        {
          member: JSON.stringify({
            userId: 'user1',
            username: 'player1',
            score: 95,
            correctCount: 5,
            timeBonus: 15,
            completedAt: Date.now(),
            badge: 'AI_WHISPERER',
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
            badge: 'GOOD_SAMARITAN',
          }),
          score: 80,
        },
      ];

      mockRedis.zRange.mockResolvedValue(mockLeaderboardEntries);

      const response = await request(app)
        .get('/api/leaderboard/daily')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.leaderboard).toHaveLength(2);
      expect(response.body.leaderboard[0].score).toBe(95);
      expect(response.body.leaderboard[0].username).toBe('player1');
    });

    it('should handle empty leaderboard', async () => {
      mockRedis.zRange.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/leaderboard/daily')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.leaderboard).toHaveLength(0);
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.zRange.mockRejectedValue(new Error('Redis connection failed'));

      const response = await request(app)
        .get('/api/leaderboard/daily')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to get leaderboard');
    });
  });

  describe('GET /api/leaderboard/user-rank', () => {
    it('should return user rank successfully', async () => {
      const mockEntries = [
        {
          member: JSON.stringify({ userId: 'user1', score: 95 }),
          score: 95,
        },
        {
          member: JSON.stringify({ userId: 'target-user', score: 80 }),
          score: 80,
        },
        {
          member: JSON.stringify({ userId: 'user3', score: 75 }),
          score: 75,
        },
      ];

      mockRedis.zRange.mockResolvedValue(mockEntries);

      const response = await request(app)
        .get('/api/leaderboard/user-rank')
        .query({ userId: 'target-user', type: 'daily' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.rank).toBe(2);
      expect(response.body.score).toBe(80);
      expect(response.body.totalParticipants).toBe(3);
    });

    it('should handle user not found on leaderboard', async () => {
      mockRedis.zRange.mockResolvedValue([
        {
          member: JSON.stringify({ userId: 'other-user', score: 95 }),
          score: 95,
        },
      ]);

      const response = await request(app)
        .get('/api/leaderboard/user-rank')
        .query({ userId: 'nonexistent-user', type: 'daily' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.rank).toBeNull();
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/leaderboard/user-rank')
        .query({ type: 'daily' }) // Missing userId
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('User ID is required');
    });
  });

  describe('POST /api/leaderboard/consolidate/:type', () => {
    it('should consolidate leaderboard successfully', async () => {
      // Mock entries with duplicates
      const mockEntries = [
        { member: JSON.stringify({ userId: 'user1', score: 85 }), score: 85 },
        { member: JSON.stringify({ userId: 'user2', score: 90 }), score: 90 },
        { member: JSON.stringify({ userId: 'user1', score: 95 }), score: 95 }, // Duplicate user1 with better score
      ];

      mockRedis.zRange.mockResolvedValue(mockEntries);
      mockRedis.del.mockResolvedValue(1);
      mockRedis.zAdd.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const response = await request(app)
        .post('/api/leaderboard/consolidate/daily')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.originalCount).toBe(3);
      expect(response.body.consolidatedCount).toBe(2);
      expect(response.body.duplicatesRemoved).toBe(1);
      expect(response.body.message).toContain('Successfully consolidated daily leaderboard');
    });

    it('should validate leaderboard type', async () => {
      const response = await request(app)
        .post('/api/leaderboard/consolidate/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid leaderboard type');
    });

    it('should handle consolidation errors', async () => {
      mockRedis.zRange.mockRejectedValue(new Error('Redis error'));

      const response = await request(app)
        .post('/api/leaderboard/consolidate/weekly')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Internal server error');
    });
  });
});

describe('API Endpoints - Real-time Features', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/participants/count', () => {
    it('should return current participant count', async () => {
      mockRedis.get.mockResolvedValue('42');

      const response = await request(app)
        .get('/api/participants/count')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(42);
    });

    it('should return zero for no participants', async () => {
      mockRedis.get.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/participants/count')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(0);
    });
  });

  describe('POST /api/participants/join', () => {
    it('should increment participant count', async () => {
      mockRedis.get.mockResolvedValue('41');
      mockRedis.set.mockResolvedValue('OK');
      mockRedis.expire.mockResolvedValue(1);

      const response = await request(app)
        .post('/api/participants/join')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.newCount).toBe(42);
      expect(mockRealtime.send).toHaveBeenCalledWith(
        'participant_updates',
        expect.objectContaining({
          type: 'participant_count_update',
          count: 42,
        })
      );
    });
  });
});

describe('API Endpoints - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle malformed JSON requests', async () => {
    const response = await request(app)
      .post('/api/game/start')
      .set('Content-Type', 'application/json')
      .send('invalid json')
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Invalid JSON');
  });

  it('should handle missing Content-Type header', async () => {
    const response = await request(app)
      .post('/api/game/start')
      .send('some data')
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('should handle Redis connection failures', async () => {
    mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

    const response = await request(app)
      .get('/api/game/init')
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Internal server error');
  });

  it('should return 404 for unknown endpoints', async () => {
    const response = await request(app)
      .get('/api/nonexistent')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Not found');
  });
});
