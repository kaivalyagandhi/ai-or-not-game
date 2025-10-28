/**
 * Unit tests for useGameState hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../useGameState.js';
import { BadgeType } from '../../../shared/types/api.js';

// Mock dependencies
vi.mock('../useErrorHandler.js', () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
    clearError: vi.fn(),
    errorState: { message: null },
    isOnline: true,
  }),
}));

vi.mock('../../utils/network.js', () => ({
  apiCall: vi.fn(),
}));

vi.mock('../../utils/storage.js', () => ({
  gameStorage: {
    getSession: vi.fn(),
    saveSession: vi.fn(),
    clearSession: vi.fn(),
    savePendingRequest: vi.fn(),
  },
}));

const mockApiCall = vi.mocked(await import('../../utils/network.js')).apiCall;
const mockGameStorage = vi.mocked(await import('../../utils/storage.js')).gameStorage;

describe('useGameState Hook - Initial State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useGameState());
    
    expect(result.current.gameState).toBe('splash');
    expect(result.current.session).toBeNull();
    expect(result.current.currentRound).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should provide all required methods', () => {
    const { result } = renderHook(() => useGameState());
    
    expect(typeof result.current.setGameState).toBe('function');
    expect(typeof result.current.setSession).toBe('function');
    expect(typeof result.current.setCurrentRound).toBe('function');
    expect(typeof result.current.setError).toBe('function');
    expect(typeof result.current.setLoading).toBe('function');
    expect(typeof result.current.initializeGame).toBe('function');
    expect(typeof result.current.startGame).toBe('function');
    expect(typeof result.current.handleRoundComplete).toBe('function');
    expect(typeof result.current.resetGame).toBe('function');
    expect(typeof result.current.goToSplash).toBe('function');
    expect(typeof result.current.goToLeaderboard).toBe('function');
    expect(typeof result.current.goBackFromLeaderboard).toBe('function');
    expect(typeof result.current.validateSession).toBe('function');
    expect(typeof result.current.calculateFinalScore).toBe('function');
    expect(typeof result.current.persistSession).toBe('function');
    expect(typeof result.current.cleanupSession).toBe('function');
  });
});

describe('useGameState Hook - Session Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate valid session', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.setSession({
        userId: 'user123',
        sessionId: 'session456',
        startTime: Date.now(),
        rounds: [],
        totalScore: 0,
        correctCount: 0,
        totalTimeBonus: 0,
        badge: BadgeType.HUMAN_IN_TRAINING,
        completed: false,
      });
    });
    
    expect(result.current.validateSession()).toBe(true);
  });

  it('should reject session without user ID', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.setSession({
        userId: '',
        sessionId: 'session456',
        startTime: Date.now(),
        rounds: [],
        totalScore: 0,
        correctCount: 0,
        totalTimeBonus: 0,
        badge: BadgeType.HUMAN_IN_TRAINING,
        completed: false,
      });
    });
    
    expect(result.current.validateSession()).toBe(false);
  });

  it('should reject expired session', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.setSession({
        userId: 'user123',
        sessionId: 'session456',
        startTime: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
        rounds: [],
        totalScore: 0,
        correctCount: 0,
        totalTimeBonus: 0,
        badge: BadgeType.HUMAN_IN_TRAINING,
        completed: false,
      });
    });
    
    expect(result.current.validateSession()).toBe(false);
  });

  it('should reject null session', () => {
    const { result } = renderHook(() => useGameState());
    
    expect(result.current.validateSession()).toBe(false);
  });
});

describe('useGameState Hook - Score Calculation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate final score correctly with tier-based system', () => {
    const { result } = renderHook(() => useGameState());
    
    const mockRounds = [
      { ...createMockGameRound(1), isCorrect: true, timeRemaining: 5000 }, // 5 seconds = tier 2 = 3 bonus points
      { ...createMockGameRound(2), isCorrect: true, timeRemaining: 3000 }, // 3 seconds = tier 3 = 1 bonus point
      { ...createMockGameRound(3), isCorrect: false, timeRemaining: 0 },   // incorrect = 0 points
      { ...createMockGameRound(4), isCorrect: true, timeRemaining: 7000 }, // 7 seconds = tier 1 = 5 bonus points
      { ...createMockGameRound(5), isCorrect: false, timeRemaining: 0 },   // incorrect = 0 points
      { ...createMockGameRound(6), isCorrect: true, timeRemaining: 1000 }, // 1 second = tier 3 = 1 bonus point
    ];
    
    act(() => {
      result.current.setSession({
        userId: 'user123',
        sessionId: 'session456',
        startTime: Date.now(),
        rounds: mockRounds,
        totalScore: 0,
        correctCount: 0,
        totalTimeBonus: 0,
        badge: BadgeType.HUMAN_IN_TRAINING,
        completed: false,
      });
    });
    
    act(() => {
      result.current.calculateFinalScore();
    });
    
    const session = result.current.session;
    expect(session?.correctCount).toBe(4); // 4 correct answers
    expect(session?.totalTimeBonus).toBe(10); // 3 + 1 + 5 + 1 = 10 bonus points
    expect(session?.totalScore).toBe(50); // (4 correct * 10) + 10 bonus = 50
    expect(session?.badge).toBe(BadgeType.GOOD_SAMARITAN); // 4 correct = GOOD_SAMARITAN
    expect(session?.completed).toBe(true);
  });

  it('should calculate scores as whole numbers only', () => {
    const { result } = renderHook(() => useGameState());
    
    const mockRounds = [
      { ...createMockGameRound(1), isCorrect: true, timeRemaining: 8500 }, // 8.5 seconds = tier 1 = 5 bonus
      { ...createMockGameRound(2), isCorrect: true, timeRemaining: 4500 }, // 4.5 seconds = tier 2 = 3 bonus
      { ...createMockGameRound(3), isCorrect: true, timeRemaining: 2500 }, // 2.5 seconds = tier 3 = 1 bonus
      { ...createMockGameRound(4), isCorrect: true, timeRemaining: 500 },  // 0.5 seconds = tier 4 = 0 bonus
      { ...createMockGameRound(5), isCorrect: true, timeRemaining: 0 },    // 0 seconds = tier 4 = 0 bonus
      { ...createMockGameRound(6), isCorrect: true, timeRemaining: 10000 }, // 10 seconds = tier 1 = 5 bonus
    ];
    
    act(() => {
      result.current.setSession({
        userId: 'user123',
        sessionId: 'session456',
        startTime: Date.now(),
        rounds: mockRounds,
        totalScore: 0,
        correctCount: 0,
        totalTimeBonus: 0,
        badge: BadgeType.HUMAN_IN_TRAINING,
        completed: false,
      });
    });
    
    act(() => {
      result.current.calculateFinalScore();
    });
    
    const session = result.current.session;
    expect(session?.correctCount).toBe(6); // All correct
    expect(session?.totalTimeBonus).toBe(14); // 5 + 3 + 1 + 0 + 0 + 5 = 14
    expect(session?.totalScore).toBe(74); // (6 * 10) + 14 = 74
    expect(Number.isInteger(session?.totalScore)).toBe(true);
    expect(Number.isInteger(session?.totalTimeBonus)).toBe(true);
  });

  it('should handle boundary values in tier calculations', () => {
    const { result } = renderHook(() => useGameState());
    
    const mockRounds = [
      { ...createMockGameRound(1), isCorrect: true, timeRemaining: 7000 }, // Exactly 7 seconds = tier 1
      { ...createMockGameRound(2), isCorrect: true, timeRemaining: 6999 }, // Just under 7 seconds = tier 2
      { ...createMockGameRound(3), isCorrect: true, timeRemaining: 4000 }, // Exactly 4 seconds = tier 2
      { ...createMockGameRound(4), isCorrect: true, timeRemaining: 3999 }, // Just under 4 seconds = tier 3
      { ...createMockGameRound(5), isCorrect: true, timeRemaining: 1000 }, // Exactly 1 second = tier 3
      { ...createMockGameRound(6), isCorrect: true, timeRemaining: 999 },  // Just under 1 second = tier 4
    ];
    
    act(() => {
      result.current.setSession({
        userId: 'user123',
        sessionId: 'session456',
        startTime: Date.now(),
        rounds: mockRounds,
        totalScore: 0,
        correctCount: 0,
        totalTimeBonus: 0,
        badge: BadgeType.HUMAN_IN_TRAINING,
        completed: false,
      });
    });
    
    act(() => {
      result.current.calculateFinalScore();
    });
    
    const session = result.current.session;
    expect(session?.correctCount).toBe(6);
    expect(session?.totalTimeBonus).toBe(13); // 5 + 3 + 3 + 1 + 1 + 0 = 13
    expect(session?.totalScore).toBe(73); // (6 * 10) + 13 = 73
  });

  it('should assign correct badges based on score', () => {
    const { result } = renderHook(() => useGameState());
    
    // Test AI_WHISPERER badge (6 correct for 6-round gameplay)
    const perfectRounds = Array.from({ length: 6 }, (_, i) => ({
      ...createMockGameRound(i + 1),
      isCorrect: true,
      timeRemaining: 1000,
    }));
    
    act(() => {
      result.current.setSession({
        userId: 'user123',
        sessionId: 'session456',
        startTime: Date.now(),
        rounds: perfectRounds,
        totalScore: 0,
        correctCount: 0,
        totalTimeBonus: 0,
        badge: BadgeType.HUMAN_IN_TRAINING,
        completed: false,
        attemptNumber: 1,
        showedEducationalContent: false,
      });
    });
    
    act(() => {
      result.current.calculateFinalScore();
    });
    
    expect(result.current.session?.badge).toBe(BadgeType.AI_WHISPERER);
  });
});

describe('useGameState Hook - Game Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize game successfully', async () => {
    mockApiCall.mockResolvedValueOnce({
      success: true,
      session: null, // New game
    });
    
    mockApiCall.mockResolvedValueOnce({
      success: true,
      sessionId: 'new-session',
      currentRound: createMockGameRound(1),
    });
    
    const { result } = renderHook(() => useGameState());
    
    await act(async () => {
      await result.current.initializeGame();
    });
    
    expect(result.current.gameState).toBe('playing');
    expect(result.current.currentRound).toBeDefined();
  });

  it('should handle completed game initialization', async () => {
    const completedSession = {
      userId: 'user123',
      sessionId: 'completed-session',
      startTime: Date.now(),
      rounds: [],
      totalScore: 53, // Whole number score
      correctCount: 4,
      totalTimeBonus: 13, // Whole number time bonus
      badge: BadgeType.GOOD_SAMARITAN,
      completed: true,
    };
    
    mockApiCall.mockResolvedValueOnce({
      success: true,
      session: completedSession,
    });
    
    const { result } = renderHook(() => useGameState());
    
    await act(async () => {
      await result.current.initializeGame();
    });
    
    expect(result.current.gameState).toBe('results');
    expect(result.current.session).toEqual(completedSession);
  });

  it('should handle round completion', () => {
    const { result } = renderHook(() => useGameState());
    
    const mockSession = {
      userId: 'user123',
      sessionId: 'session456',
      startTime: Date.now(),
      rounds: [createMockGameRound(1), createMockGameRound(2)],
      totalScore: 0,
      correctCount: 0,
      totalTimeBonus: 0,
      badge: BadgeType.HUMAN_IN_TRAINING,
      completed: false,
    };
    
    act(() => {
      result.current.setSession(mockSession);
      result.current.setCurrentRound(mockSession.rounds[0]);
    });
    
    const roundResponse = {
      success: true,
      isCorrect: true,
      correctAnswer: 'A' as const,
      aiImagePosition: 'B' as const,
      roundScore: 15, // Whole number score (10 base + 5 time bonus)
      gameComplete: false,
      nextRound: mockSession.rounds[1],
    };
    
    act(() => {
      result.current.handleRoundComplete(roundResponse);
    });
    
    expect(result.current.currentRound).toEqual(mockSession.rounds[1]);
    expect(result.current.session?.correctCount).toBe(1);
  });

  it('should handle game completion', () => {
    const { result } = renderHook(() => useGameState());
    
    const mockSession = {
      userId: 'user123',
      sessionId: 'session456',
      startTime: Date.now(),
      rounds: [createMockGameRound(1)],
      totalScore: 0,
      correctCount: 0,
      totalTimeBonus: 0,
      badge: BadgeType.HUMAN_IN_TRAINING,
      completed: false,
    };
    
    act(() => {
      result.current.setSession(mockSession);
      result.current.setCurrentRound(mockSession.rounds[0]);
    });
    
    const finalResponse = {
      success: true,
      isCorrect: true,
      correctAnswer: 'A' as const,
      aiImagePosition: 'B' as const,
      roundScore: 13, // Whole number score (10 base + 3 time bonus)
      gameComplete: true,
      finalResults: {
        totalScore: 53, // Whole number total score
        correctCount: 4,
        timeBonus: 13, // Whole number time bonus
        badge: BadgeType.GOOD_SAMARITAN,
      },
    };
    
    act(() => {
      result.current.handleRoundComplete(finalResponse);
    });
    
    expect(result.current.gameState).toBe('results');
    expect(result.current.currentRound).toBeNull();
    expect(result.current.session?.completed).toBe(true);
    expect(result.current.session?.totalScore).toBe(53);
  });
});

describe('useGameState Hook - Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should navigate to splash screen', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.setGameState('playing');
      result.current.goToSplash();
    });
    
    expect(result.current.gameState).toBe('splash');
    expect(result.current.session).toBeNull();
  });

  it('should navigate to leaderboard', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.goToLeaderboard();
    });
    
    expect(result.current.gameState).toBe('leaderboard');
  });

  it('should navigate back from leaderboard to results if game completed', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.setSession({
        userId: 'user123',
        sessionId: 'session456',
        startTime: Date.now(),
        rounds: [],
        totalScore: 53, // Whole number score
        correctCount: 4,
        totalTimeBonus: 13, // Whole number time bonus
        badge: BadgeType.GOOD_SAMARITAN,
        completed: true,
      });
      result.current.setGameState('leaderboard');
      result.current.goBackFromLeaderboard();
    });
    
    expect(result.current.gameState).toBe('results');
  });

  it('should navigate back from leaderboard to splash if game not completed', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.setGameState('leaderboard');
      result.current.goBackFromLeaderboard();
    });
    
    expect(result.current.gameState).toBe('splash');
  });
});

// Helper function for creating mock game rounds
function createMockGameRound(roundNumber: number): any {
  return {
    roundNumber,
    imageA: {
      url: `https://example.com/pair${roundNumber}-human.jpg`,
      category: 'test',
      isAI: false,
    },
    imageB: {
      url: `https://example.com/pair${roundNumber}-ai.jpg`,
      category: 'test',
      isAI: true,
    },
    correctAnswer: 'A' as const,
    aiImagePosition: 'B' as const,
  };
}
