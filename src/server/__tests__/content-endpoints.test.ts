/**
 * Integration tests for content API endpoints
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock the content manager
const mockContentManager = {
  getDailyEducationalContent: vi.fn(),
  getDailyInspirationContent: vi.fn(),
  getCurrentTip: vi.fn(),
  getCurrentFact: vi.fn(),
  getCurrentInspiration: vi.fn(),
  getAllContent: vi.fn(),
  forceReload: vi.fn(),
};

vi.mock('../core/content-manager.js', () => ({
  contentManager: mockContentManager,
}));

// Import the server after mocking
let app: express.Application;

describe('Content API Endpoints', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    
    // Import and set up routes after mocking
    const { setupRoutes } = await import('../index.js');
    setupRoutes(app);
  });

  describe('GET /api/content/educational', () => {
    it('should return educational content successfully', async () => {
      const mockEducationalContent = {
        tips: [
          'Look for unnatural lighting or shadows.',
          'Check hands and fingers carefully.',
          'Examine text in images for blurriness.',
        ],
        facts: [
          'AI learns from millions of photos.',
          'Modern AI creates images in seconds.',
          'AI uses neural networks.',
        ],
        currentTipIndex: 1,
        currentFactIndex: 2,
      };

      mockContentManager.getDailyEducationalContent.mockReturnValue(mockEducationalContent);

      const response = await request(app)
        .get('/api/content/educational')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.educational).toEqual(mockEducationalContent);
      expect(mockContentManager.getDailyEducationalContent).toHaveBeenCalledTimes(1);
    });

    it('should handle content manager errors', async () => {
      mockContentManager.getDailyEducationalContent.mockImplementation(() => {
        throw new Error('Content loading failed');
      });

      const response = await request(app)
        .get('/api/content/educational')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to get educational content');
    });

    it('should handle empty content gracefully', async () => {
      mockContentManager.getDailyEducationalContent.mockReturnValue({
        tips: [],
        facts: [],
        currentTipIndex: 0,
        currentFactIndex: 0,
      });

      const response = await request(app)
        .get('/api/content/educational')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.educational.tips).toEqual([]);
      expect(response.body.educational.facts).toEqual([]);
    });
  });

  describe('GET /api/content/inspirational', () => {
    it('should return inspirational content successfully', async () => {
      const mockInspirationalContent = {
        quotes: [
          'Every expert was once a beginner.',
          'Practice makes perfect.',
          'Trust your instincts.',
        ],
        jokes: [
          'Why don\'t AI images win at poker? Extra fingers!',
          'What\'s an AI\'s favorite photography? No hands!',
          'Why did AI go to art school? Finger counting!',
        ],
        currentIndex: 0,
        type: 'quote' as const,
      };

      mockContentManager.getDailyInspirationContent.mockReturnValue(mockInspirationalContent);

      const response = await request(app)
        .get('/api/content/inspirational')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.inspirational).toEqual(mockInspirationalContent);
      expect(mockContentManager.getDailyInspirationContent).toHaveBeenCalledTimes(1);
    });

    it('should handle joke type content', async () => {
      const mockInspirationalContent = {
        quotes: ['Quote 1', 'Quote 2'],
        jokes: ['Joke 1', 'Joke 2'],
        currentIndex: 1,
        type: 'joke' as const,
      };

      mockContentManager.getDailyInspirationContent.mockReturnValue(mockInspirationalContent);

      const response = await request(app)
        .get('/api/content/inspirational')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.inspirational.type).toBe('joke');
      expect(response.body.inspirational.currentIndex).toBe(1);
    });

    it('should handle content manager errors', async () => {
      mockContentManager.getDailyInspirationContent.mockImplementation(() => {
        throw new Error('Inspiration loading failed');
      });

      const response = await request(app)
        .get('/api/content/inspirational')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to get inspirational content');
    });
  });

  describe('GET /api/content/current', () => {
    it('should return current day\'s selected content', async () => {
      mockContentManager.getCurrentTip.mockReturnValue('Current tip for today');
      mockContentManager.getCurrentFact.mockReturnValue('Current fact for today');
      mockContentManager.getCurrentInspiration.mockReturnValue('Current inspiration for today');

      const response = await request(app)
        .get('/api/content/current')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tip).toBe('Current tip for today');
      expect(response.body.fact).toBe('Current fact for today');
      expect(response.body.inspiration).toBe('Current inspiration for today');

      expect(mockContentManager.getCurrentTip).toHaveBeenCalledTimes(1);
      expect(mockContentManager.getCurrentFact).toHaveBeenCalledTimes(1);
      expect(mockContentManager.getCurrentInspiration).toHaveBeenCalledTimes(1);
    });

    it('should handle partial content failures', async () => {
      mockContentManager.getCurrentTip.mockReturnValue('Valid tip');
      mockContentManager.getCurrentFact.mockImplementation(() => {
        throw new Error('Fact loading failed');
      });
      mockContentManager.getCurrentInspiration.mockReturnValue('Valid inspiration');

      const response = await request(app)
        .get('/api/content/current')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to get current content');
    });

    it('should handle empty content strings', async () => {
      mockContentManager.getCurrentTip.mockReturnValue('');
      mockContentManager.getCurrentFact.mockReturnValue('');
      mockContentManager.getCurrentInspiration.mockReturnValue('');

      const response = await request(app)
        .get('/api/content/current')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tip).toBe('');
      expect(response.body.fact).toBe('');
      expect(response.body.inspiration).toBe('');
    });
  });

  describe('GET /api/content/all', () => {
    it('should return all content types', async () => {
      const mockAllContent = {
        educational: {
          tips: ['tip1', 'tip2'],
          facts: ['fact1', 'fact2'],
          currentTipIndex: 0,
          currentFactIndex: 1,
        },
        inspirational: {
          quotes: ['quote1', 'quote2'],
          jokes: ['joke1', 'joke2'],
          currentIndex: 0,
          type: 'quote' as const,
        },
      };

      mockContentManager.getAllContent.mockReturnValue(mockAllContent);

      const response = await request(app)
        .get('/api/content/all')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.content).toEqual(mockAllContent);
      expect(mockContentManager.getAllContent).toHaveBeenCalledTimes(1);
    });

    it('should handle content manager errors', async () => {
      mockContentManager.getAllContent.mockImplementation(() => {
        throw new Error('All content loading failed');
      });

      const response = await request(app)
        .get('/api/content/all')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to get all content');
    });
  });

  describe('POST /api/content/reload', () => {
    it('should force reload content successfully', async () => {
      mockContentManager.forceReload.mockReturnValue(undefined);

      const response = await request(app)
        .post('/api/content/reload')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Content reloaded successfully');
      expect(mockContentManager.forceReload).toHaveBeenCalledTimes(1);
    });

    it('should handle reload errors', async () => {
      mockContentManager.forceReload.mockImplementation(() => {
        throw new Error('Reload failed');
      });

      const response = await request(app)
        .post('/api/content/reload')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Failed to reload content');
    });
  });

  describe('Content API Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .post('/api/content/educational') // Wrong method
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should handle content manager null responses', async () => {
      mockContentManager.getDailyEducationalContent.mockReturnValue(null);

      const response = await request(app)
        .get('/api/content/educational')
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    it('should handle content manager undefined responses', async () => {
      mockContentManager.getCurrentTip.mockReturnValue(undefined);
      mockContentManager.getCurrentFact.mockReturnValue('Valid fact');
      mockContentManager.getCurrentInspiration.mockReturnValue('Valid inspiration');

      const response = await request(app)
        .get('/api/content/current')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tip).toBeUndefined();
    });
  });

  describe('Content API Performance', () => {
    it('should handle concurrent requests efficiently', async () => {
      const mockEducationalContent = {
        tips: ['tip1'],
        facts: ['fact1'],
        currentTipIndex: 0,
        currentFactIndex: 0,
      };

      mockContentManager.getDailyEducationalContent.mockReturnValue(mockEducationalContent);

      // Make multiple concurrent requests
      const requests = Array.from({ length: 5 }, () =>
        request(app).get('/api/content/educational')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Content manager should be called for each request
      expect(mockContentManager.getDailyEducationalContent).toHaveBeenCalledTimes(5);
    });

    it('should handle rapid sequential requests', async () => {
      mockContentManager.getCurrentTip.mockReturnValue('Test tip');
      mockContentManager.getCurrentFact.mockReturnValue('Test fact');
      mockContentManager.getCurrentInspiration.mockReturnValue('Test inspiration');

      // Make rapid sequential requests
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .get('/api/content/current')
          .expect(200);

        expect(response.body.success).toBe(true);
      }

      expect(mockContentManager.getCurrentTip).toHaveBeenCalledTimes(3);
      expect(mockContentManager.getCurrentFact).toHaveBeenCalledTimes(3);
      expect(mockContentManager.getCurrentInspiration).toHaveBeenCalledTimes(3);
    });
  });

  describe('Content API Validation', () => {
    it('should validate content structure in responses', async () => {
      const mockEducationalContent = {
        tips: ['tip1', 'tip2'],
        facts: ['fact1', 'fact2'],
        currentTipIndex: 0,
        currentFactIndex: 1,
      };

      mockContentManager.getDailyEducationalContent.mockReturnValue(mockEducationalContent);

      const response = await request(app)
        .get('/api/content/educational')
        .expect(200);

      expect(response.body.educational).toHaveProperty('tips');
      expect(response.body.educational).toHaveProperty('facts');
      expect(response.body.educational).toHaveProperty('currentTipIndex');
      expect(response.body.educational).toHaveProperty('currentFactIndex');

      expect(Array.isArray(response.body.educational.tips)).toBe(true);
      expect(Array.isArray(response.body.educational.facts)).toBe(true);
      expect(typeof response.body.educational.currentTipIndex).toBe('number');
      expect(typeof response.body.educational.currentFactIndex).toBe('number');
    });

    it('should validate inspirational content structure', async () => {
      const mockInspirationalContent = {
        quotes: ['quote1'],
        jokes: ['joke1'],
        currentIndex: 0,
        type: 'quote' as const,
      };

      mockContentManager.getDailyInspirationContent.mockReturnValue(mockInspirationalContent);

      const response = await request(app)
        .get('/api/content/inspirational')
        .expect(200);

      expect(response.body.inspirational).toHaveProperty('quotes');
      expect(response.body.inspirational).toHaveProperty('jokes');
      expect(response.body.inspirational).toHaveProperty('currentIndex');
      expect(response.body.inspirational).toHaveProperty('type');

      expect(Array.isArray(response.body.inspirational.quotes)).toBe(true);
      expect(Array.isArray(response.body.inspirational.jokes)).toBe(true);
      expect(typeof response.body.inspirational.currentIndex).toBe('number');
      expect(['quote', 'joke']).toContain(response.body.inspirational.type);
    });
  });
});
