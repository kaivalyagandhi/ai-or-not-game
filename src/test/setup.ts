/**
 * Test setup file for Vitest
 * This file is run before all tests
 */

import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Devvit modules for testing
vi.mock('@devvit/web/server', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    expire: vi.fn(),
    zAdd: vi.fn(),
    zRange: vi.fn(),
    zCard: vi.fn(),
    zRem: vi.fn(),
  },
  reddit: {
    getCurrentUsername: vi.fn().mockResolvedValue('testuser'),
  },
  realtime: {
    send: vi.fn(),
  },
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Setup global test utilities
global.createMockGameSession = () => ({
  userId: 'test-user-123',
  sessionId: 'test-session-456',
  startTime: Date.now(),
  rounds: [],
  totalScore: 0,
  correctCount: 0,
  totalTimeBonus: 0,
  badge: 'HUMAN_IN_TRAINING' as const,
  completed: false,
});

global.createMockGameRound = (roundNumber: number = 1) => ({
  roundNumber,
  category: 'Animals' as const,
  imageA: {
    id: 'img-a-1',
    url: 'https://example.com/image-a.jpg',
    category: 'Animals' as const,
    isAI: false,
    metadata: {
      source: 'human',
      description: 'A real photo of a cat',
    },
  },
  imageB: {
    id: 'img-b-1',
    url: 'https://example.com/image-b.jpg',
    category: 'Animals' as const,
    isAI: true,
    metadata: {
      source: 'ai',
      description: 'An AI-generated image of a cat',
    },
  },
  correctAnswer: 'A' as const,
  aiImagePosition: 'B' as const,
});

// Extend global types for TypeScript
declare global {
  function createMockGameSession(): any;
  function createMockGameRound(roundNumber?: number): any;
}
