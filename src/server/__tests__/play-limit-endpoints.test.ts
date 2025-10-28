/**
 * Integration tests for play limit API endpoints
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock the play limit manager
const mockPlayLimitManager = {
  canUserPlay: vi.fn(),
  incrementUserAttempts: vi.fn(),
  getUserPlayStats: vi.fn(),
  resetUserPlayLimit: vi.fn(),
  updateBestScore: vi.fn(),
};

vi.mock('../core/play-limit-manager.js', () => mockPlayLimitManager);

// Mock Reddit API
const mockReddit = {
  getCurrentUsername: vi.fn().mockResolvedValue('testuser'),
};

vi.mock('@devvit/web/server', () => ({
  reddit: mockReddit,
}));

// Import the server after mocking
let app: express.Application;

describe('Play Limit API Endpoints', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    
    // Import and set up routes after mocking
    const { setupRoutes } = await import('../index.js');
    setupRoutes(app);
  });

  describe('GET /api/game/play-attempts', () => {
    it('should return user play statistics successfully', async () => {
      const mockStats = {
        attempts: 1,
        maxAttempts: 2,
        remainingAttempts: 1,
        bestScore: 85.5,
        bestAttempt: {
          totalScore: 85.5,
          correctCount: 4,
          badge: 'GOOD_SAMARITAN',
        },
        canPlayAgain: true,
      };

      mockPlayLimitManager.getUserPlayStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/game/play-attempts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toEqual(mockStats);
      expect(mockPlayLimitManager.getUserPlayStats).toHaveBeenCalledWith('testuser');
    });

    it('should handle play limit manager errors', async () => {
      mockPlayLimitManager.getUserPlayStats.mockRejectedValue(new Error('Redis error'));

      const response = await request(app)
        .get('/api/game/play-attempts')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to get play attempts');
    });

    it('should handle user authentication errors', async () => {
      mockReddit.getCurrentUsername.mockRejectedValue(new Error('Auth error'));

      const response = await request(app)
        .get('/api/game/play-attempts')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/game/increment-attempts', () => {
    it('should increment user attempts successfully', async () => {
      const mockUpdatedLimit = {
        userId: 'testuser',
        date: '2024-01-01',
        attempts: 1,
        maxAttempts: 2,
        bestScore: 0,
        bestAttempt: {},
      };

      mockPlayLimitManager.incrementUserAttempts.mockResolvedValue(mockUpdatedLimit);

      const response = await request(app)
        .post('/api/game/increment-attempts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.playLimit).toEqual(mockUpdatedLimit);
      expect(mockPlayLimitManager.incrementUserAttempts).toHaveBeenCalledWith('testuser');
    });

    it('should handle limit exceeded error', async () => {
      const limitError = new Error('Daily play limit exceeded');
      limitError.name = 'PlayLimitError';
      (limitError as any).code = 'LIMIT_EXCEEDED';

      mockPlayLimitManager.incrementUserAttempts.mockRejectedValue(limitError);

      const response = await request(app)
        .post('/api/game/increment-attempts')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Daily play limit exceeded');
    });

    it('should handle general play limit errors', async () => {
      const playLimitError = new Error('Invalid user ID');
      playLimitError.name = 'PlayLimitError';
      (playLimitError as any).code = 'INVALID_USER_ID';

      mockPlayLimitManager.incrementUserAttempts.mockRejectedValue(playLimitError);

      const response = await request(app)
        .post('/api/game/increment-attempts')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid user ID');
    });

    it('should handle non-play-limit errors', async () => {
      mockPlayLimitManager.incrementUserAttempts.mockRejectedValue(new Error('Redis connection failed'));

      const response = await request(app)
        .post('/api/game/increment-attempts')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to increment attempts');
    });
  });

  describe('GET /api/game/can-play', () => {
    it('should return true when user can play', async () => {
      const mockCanPlay = {
        canPlay: true,
        remainingAttempts: 1,
        maxAttempts: 2,
      };

      mockPlayLimitManager.canUserPlay.mockResolvedValue(mockCanPlay);

      const response = await request(app)
        .get('/api/game/can-play')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.canPlay).toBe(true);
      expect(response.body.remainingAttempts).toBe(1);
      expect(response.body.maxAttempts).toBe(2);
      expect(mockPlayLimitManager.canUserPlay).toHaveBeenCalledWith('testuser');
    });

    it('should return false when user cannot play', async () => {
      const mockCanPlay = {
        canPlay: false,
        remainingAttempts: 0,
        maxAttempts: 2,
        reason: 'Daily play limit reached',
      };

      mockPlayLimitManager.canUserPlay.mockResolvedValue(mockCanPlay);

      const response = await request(app)
        .get('/api/game/can-play')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.canPlay).toBe(false);
      expect(response.body.remainingAttempts).toBe(0);
      expect(response.body.reason).toBe('Daily play limit reached');
    });

    it('should handle play limit check errors', async () => {
      mockPlayLimitManager.canUserPlay.mockRejectedValue(new Error('Redis error'));

      const response = await request(app)
        .get('/api/game/can-play')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to check play permission');
    });
  });

  describe('POST /api/game/update-best-score', () => {
    it('should update best score successfully', async () => {
      const mockSession = {
        userId: 'testuser',
        sessionId: 'session123',
        totalScore: 95.5,
        correctCount: 5,
        badge: 'AI_WHISPERER',
        completed: true,
      };

      const mockUpdatedLimit = {
        userId: 'testuser',
        date: '2024-01-01',
        attempts: 1,
        maxAttempts: 2,
        bestScore: 95.5,
        bestAttempt: mockSession,
      };

      mockPlayLimitManager.updateBestScore.mockResolvedValue(mockUpdatedLimit);

      const response = await request(app)
        .post('/api/game/update-best-score')
        .send({ session: mockSession })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.playLimit).toEqual(mockUpdatedLimit);
      expect(mockPlayLimitManager.updateBestScore).toHaveBeenCalledWith('testuser', mockSession);
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/game/update-best-score')
        .send({}) // Missing session
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Session data is required');
    });

    it('should validate session data structure', async () => {
      const response = await request(app)
        .post('/api/game/update-best-score')
        .send({ session: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid session data');
    });

    it('should handle play limit update errors', async () => {
      const mockSession = {
        userId: 'testuser',
        totalScore: 95.5,
        completed: true,
      };

      mockPlayLimitManager.updateBestScore.mockRejectedValue(new Error('Redis error'));

      const response = await request(app)
        .post('/api/game/update-best-score')
        .send({ session: mockSession })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to update best score');
    });
  });

  describe('POST /api/admin/reset-play-limits', () => {
    it('should reset play limits successfully', async () => {
      mockPlayLimitManager.resetUserPlayLimit.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/admin/reset-play-limits')
        .send({ userId: 'testuser' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Play limits reset successfully');
      expect(mockPlayLimitManager.resetUserPlayLimit).toHaveBeenCalledWith('testuser');
    });

    it('should validate user ID for reset', async () => {
      const response = await request(app)
        .post('/api/admin/reset-play-limits')
        .send({}) // Missing userId
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('User ID is required');
    });

    it('should handle reset errors', async () => {
      mockPlayLimitManager.resetUserPlayLimit.mockRejectedValue(new Error('Redis error'));

      const response = await request(app)
        .post('/api/admin/reset-play-limits')
        .send({ userId: 'testuser' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to reset play limits');
    });

    it('should reset with custom date', async () => {
      mockPlayLimitManager.resetUserPlayLimit.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/admin/reset-play-limits')
        .send({ userId: 'testuser', date: '2024-12-25' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockPlayLimitManager.resetUserPlayLimit).toHaveBeenCalledWith('testuser', '2024-12-25');
    });
  });

  describe('Play Limit Middleware Integration', () => {
    it('should check play limits before starting game', async () => {
      mockPlayLimitManager.canUserPlay.mockResolvedValue({
        canPlay: false,
        remainingAttempts: 0,
        maxAttempts: 2,
        reason: 'Daily play limit reached',
      });

      const response = await request(app)
        .post('/api/game/start')
        .send({ userId: 'testuser' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Daily play limit reached');
    });

    it('should allow game start when user can play', async () => {
      mockPlayLimitManager.canUserPlay.mockResolvedValue({
        canPlay: true,
        remainingAttempts: 1,
        maxAttempts: 2,
      });

      mockPlayLimitManager.incrementUserAttempts.mockResolvedValue({
        userId: 'testuser',
        attempts: 1,
        maxAttempts: 2,
      });

      // Mock other game initialization dependencies
      const mockGameManager = {
        initializeGame: vi.fn().mockResolvedValue({
          sessionId: 'session123',
          currentRound: { roundNumber: 1 },
        }),
      };

      const response = await request(app)
        .post('/api/game/start')
        .send({ userId: 'testuser' })
        .expect(200);

      expect(mockPlayLimitManager.canUserPlay).toHaveBeenCalled();
      expect(mockPlayLimitManager.incrementUserAttempts).toHaveBeenCalled();
    });
  });

  describe('Play Limit Error Handling', () => {
    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/game/update-best-score')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid JSON');
    });

    it('should handle missing authentication', async () => {
      mockReddit.getCurrentUsername.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/game/play-attempts')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Authentication required');
    });

    it('should handle concurrent requests gracefully', async () => {
      mockPlayLimitManager.getUserPlayStats.mockResolvedValue({
        attempts: 1,
        maxAttempts: 2,
        remainingAttempts: 1,
        bestScore: 0,
        canPlayAgain: true,
      });

      // Make multiple concurrent requests
      const requests = Array.from({ length: 5 }, () =>
        request(app).get('/api/game/play-attempts')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      expect(mockPlayLimitManager.getUserPlayStats).toHaveBeenCalledTimes(5);
    });
  });

  describe('Play Limit Development vs Production', () => {
    it('should handle development mode limits', async () => {
      const developmentStats = {
        attempts: 5,
        maxAttempts: 999,
        remainingAttempts: 994,
        bestScore: 85,
        canPlayAgain: true,
      };

      mockPlayLimitManager.getUserPlayStats.mockResolvedValue(developmentStats);

      const response = await request(app)
        .get('/api/game/play-attempts')
        .expect(200);

      expect(response.body.stats.maxAttempts).toBe(999);
      expect(response.body.stats.canPlayAgain).toBe(true);
    });

    it('should handle production mode limits', async () => {
      const productionStats = {
        attempts: 2,
        maxAttempts: 2,
        remainingAttempts: 0,
        bestScore: 85,
        canPlayAgain: false,
      };

      mockPlayLimitManager.getUserPlayStats.mockResolvedValue(productionStats);

      const response = await request(app)
        .get('/api/game/play-attempts')
        .expect(200);

      expect(response.body.stats.maxAttempts).toBe(2);
      expect(response.body.stats.canPlayAgain).toBe(false);
    });
  });

  describe('Play Limit Data Validation', () => {
    it('should validate session data completeness', async () => {
      const incompleteSession = {
        userId: 'testuser',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/game/update-best-score')
        .send({ session: incompleteSession })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid session data');
    });

    it('should validate numeric values in session', async () => {
      const invalidSession = {
        userId: 'testuser',
        totalScore: 'not-a-number',
        completed: true,
      };

      const response = await request(app)
        .post('/api/game/update-best-score')
        .send({ session: invalidSession })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid session data');
    });

    it('should validate boolean values in session', async () => {
      const invalidSession = {
        userId: 'testuser',
        totalScore: 85,
        completed: 'not-a-boolean',
      };

      const response = await request(app)
        .post('/api/game/update-best-score')
        .send({ session: invalidSession })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid session data');
    });
  });
});
