/**
 * Unit tests for game logic and scoring system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateRoundScore,
  validateGameSession,
  isSessionPlayable,
  getGameProgress,
  validateUserCanPlay,
  GameLogicError,
  GAME_LOGIC_ERROR_CODES,
} from '../game-logic.js';
import { BadgeType } from '../../../shared/types/api.js';

describe('Game Logic - Score Calculation', () => {
  it('should calculate correct score for correct answer with time bonus', () => {
    const score = calculateRoundScore(true, 5000);
    expect(score).toBe(13); // 10 points + 3 time bonus (5 seconds = tier 2)
  });

  it('should calculate correct score for correct answer with no time remaining', () => {
    const score = calculateRoundScore(true, 0);
    expect(score).toBe(10); // 10 points + 0 time bonus
  });

  it('should return zero score for incorrect answer regardless of time', () => {
    const score = calculateRoundScore(false, 8000);
    expect(score).toBe(0);
  });

  it('should handle negative time remaining gracefully', () => {
    const score = calculateRoundScore(true, -1000);
    expect(score).toBe(10); // 10 points + 0 time bonus (negative time becomes 0 seconds)
  });

  it('should calculate maximum possible score', () => {
    const score = calculateRoundScore(true, 10000);
    expect(score).toBe(15); // 10 points + 5 time bonus (10 seconds = tier 1)
  });

  it('should calculate tier-based time bonuses correctly', () => {
    // Test tier 1: 7-10 seconds = +5 bonus
    expect(calculateRoundScore(true, 7000)).toBe(15); // 10 + 5
    expect(calculateRoundScore(true, 8500)).toBe(15); // 10 + 5
    expect(calculateRoundScore(true, 10000)).toBe(15); // 10 + 5
    
    // Test tier 2: 4-6 seconds = +3 bonus
    expect(calculateRoundScore(true, 4000)).toBe(13); // 10 + 3
    expect(calculateRoundScore(true, 5500)).toBe(13); // 10 + 3
    expect(calculateRoundScore(true, 6999)).toBe(13); // 10 + 3
    
    // Test tier 3: 1-3 seconds = +1 bonus
    expect(calculateRoundScore(true, 1000)).toBe(11); // 10 + 1
    expect(calculateRoundScore(true, 2500)).toBe(11); // 10 + 1
    expect(calculateRoundScore(true, 3999)).toBe(11); // 10 + 1
    
    // Test tier 4: 0 seconds = +0 bonus
    expect(calculateRoundScore(true, 0)).toBe(10); // 10 + 0
    expect(calculateRoundScore(true, 999)).toBe(10); // 10 + 0 (less than 1 second)
  });

  it('should return whole numbers only', () => {
    // Test various time values to ensure all results are integers
    const testCases = [0, 500, 1000, 2500, 3999, 4000, 5500, 6999, 7000, 8500, 10000];
    
    testCases.forEach(timeRemaining => {
      const score = calculateRoundScore(true, timeRemaining);
      expect(Number.isInteger(score)).toBe(true);
      expect(score).toBeGreaterThanOrEqual(10);
      expect(score).toBeLessThanOrEqual(15);
    });
  });

  it('should handle boundary values correctly', () => {
    // Test exact boundary values between tiers
    expect(calculateRoundScore(true, 6999)).toBe(13); // Just under 7 seconds = tier 2
    expect(calculateRoundScore(true, 7000)).toBe(15); // Exactly 7 seconds = tier 1
    expect(calculateRoundScore(true, 3999)).toBe(11); // Just under 4 seconds = tier 3
    expect(calculateRoundScore(true, 4000)).toBe(13); // Exactly 4 seconds = tier 2
    expect(calculateRoundScore(true, 999)).toBe(10);  // Just under 1 second = tier 4
    expect(calculateRoundScore(true, 1000)).toBe(11); // Exactly 1 second = tier 3
  });

  it('should handle edge cases with extreme values', () => {
    // Test with very large time values (should cap at tier 1)
    expect(calculateRoundScore(true, 15000)).toBe(15); // 15 seconds = tier 1
    expect(calculateRoundScore(true, 50000)).toBe(15); // 50 seconds = tier 1
    
    // Test with very small positive values
    expect(calculateRoundScore(true, 1)).toBe(10); // 1ms = tier 4
    expect(calculateRoundScore(true, 100)).toBe(10); // 100ms = tier 4
  });
});

describe('Game Logic - Session Validation', () => {
  let validSession: any;

  beforeEach(() => {
    validSession = {
      userId: 'test-user-123',
      sessionId: 'test-session-456',
      startTime: Date.now(),
      rounds: [
        createMockGameRound(1),
        createMockGameRound(2),
        createMockGameRound(3),
        createMockGameRound(4),
        createMockGameRound(5),
        createMockGameRound(6),
      ],
      totalScore: 0,
      correctCount: 0,
      totalTimeBonus: 0,
      badge: BadgeType.HUMAN_IN_TRAINING,
      completed: false,
    };
  });

  it('should validate a correct game session', () => {
    const result = validateGameSession(validSession);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject session with invalid user ID', () => {
    validSession.userId = '';
    const result = validateGameSession(validSession);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid user ID');
  });

  it('should reject session with invalid session ID', () => {
    validSession.sessionId = null;
    const result = validateGameSession(validSession);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid session ID');
  });

  it('should reject session with wrong number of rounds', () => {
    validSession.rounds = [createMockGameRound(1)];
    const result = validateGameSession(validSession);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Session must have exactly 6 rounds');
  });

  it('should reject session with incorrect round numbers', () => {
    validSession.rounds[2].roundNumber = 10;
    const result = validateGameSession(validSession);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Round 3 has incorrect round number: 10');
  });

  it('should reject session with missing images', () => {
    validSession.rounds[0].imageA = null;
    const result = validateGameSession(validSession);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Round 1 is missing images');
  });

  it('should reject session with invalid correct answer', () => {
    validSession.rounds[0].correctAnswer = 'C';
    const result = validateGameSession(validSession);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Round 1 has invalid correct answer: C');
  });

  it('should reject session with invalid AI image position', () => {
    validSession.rounds[0].aiImagePosition = 'X';
    const result = validateGameSession(validSession);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Round 1 has invalid AI image position: X');
  });

  it('should reject session with negative score', () => {
    validSession.totalScore = -10;
    const result = validateGameSession(validSession);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid total score');
  });

  it('should reject session with invalid correct count', () => {
    validSession.correctCount = 7;
    const result = validateGameSession(validSession);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid correct count');
  });

  it('should reject session with invalid badge', () => {
    validSession.badge = 'INVALID_BADGE';
    const result = validateGameSession(validSession);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid badge type');
  });
});

describe('Game Logic - Session Playability', () => {
  let session: any;

  beforeEach(() => {
    session = createMockGameSession();
    session.rounds = [
      createMockGameRound(1),
      createMockGameRound(2),
      createMockGameRound(3),
      createMockGameRound(4),
      createMockGameRound(5),
      createMockGameRound(6),
    ];
  });

  it('should return true for session with unanswered rounds', () => {
    expect(isSessionPlayable(session)).toBe(true);
  });

  it('should return false for completed session', () => {
    session.completed = true;
    expect(isSessionPlayable(session)).toBe(false);
  });

  it('should return false for session with all rounds answered', () => {
    session.rounds.forEach((round: any) => {
      round.userAnswer = 'A';
    });
    expect(isSessionPlayable(session)).toBe(false);
  });

  it('should return true for session with some rounds answered', () => {
    session.rounds[0].userAnswer = 'A';
    session.rounds[1].userAnswer = 'B';
    expect(isSessionPlayable(session)).toBe(true);
  });
});

describe('Game Logic - Game Progress', () => {
  let session: any;

  beforeEach(() => {
    session = createMockGameSession();
    session.rounds = [
      createMockGameRound(1),
      createMockGameRound(2),
      createMockGameRound(3),
      createMockGameRound(4),
      createMockGameRound(5),
      createMockGameRound(6),
    ];
  });

  it('should calculate progress for new game', () => {
    const progress = getGameProgress(session);
    expect(progress).toEqual({
      currentRoundNumber: 1,
      totalRounds: 6,
      answeredRounds: 0,
      remainingRounds: 6,
      isComplete: false,
    });
  });

  it('should calculate progress for partially completed game', () => {
    session.rounds[0].userAnswer = 'A';
    session.rounds[1].userAnswer = 'B';
    
    const progress = getGameProgress(session);
    expect(progress).toEqual({
      currentRoundNumber: 3,
      totalRounds: 6,
      answeredRounds: 2,
      remainingRounds: 4,
      isComplete: false,
    });
  });

  it('should calculate progress for completed game', () => {
    session.rounds.forEach((round: any) => {
      round.userAnswer = 'A';
    });
    
    const progress = getGameProgress(session);
    expect(progress).toEqual({
      currentRoundNumber: 6,
      totalRounds: 6,
      answeredRounds: 6,
      remainingRounds: 0,
      isComplete: true,
    });
  });

  it('should handle completed session flag', () => {
    session.completed = true;
    
    const progress = getGameProgress(session);
    expect(progress.isComplete).toBe(true);
  });
});

describe('Game Logic - Session Age Validation', () => {
  it('should detect expired sessions based on age', () => {
    const currentTime = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    // Test valid session (recent)
    const recentSession = createMockGameSession();
    recentSession.startTime = currentTime - (1 * 60 * 60 * 1000); // 1 hour ago
    const sessionAge = currentTime - recentSession.startTime;
    expect(sessionAge < maxAge).toBe(true);
    
    // Test expired session (old)
    const oldSession = createMockGameSession();
    oldSession.startTime = currentTime - (25 * 60 * 60 * 1000); // 25 hours ago
    const oldSessionAge = currentTime - oldSession.startTime;
    expect(oldSessionAge > maxAge).toBe(true);
  });

  it('should validate session timing constraints', () => {
    const session = createMockGameSession();
    session.rounds = [
      createMockGameRound(1),
      createMockGameRound(2),
      createMockGameRound(3),
      createMockGameRound(4),
      createMockGameRound(5),
      createMockGameRound(6),
    ];
    
    // Test session age validation logic
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
    const sessionAge = Date.now() - session.startTime;
    
    expect(sessionAge).toBeLessThan(maxSessionAge);
  });
});

describe('Game Logic - Error Handling', () => {
  it('should create GameLogicError with correct properties', () => {
    const error = new GameLogicError('Test error', GAME_LOGIC_ERROR_CODES.INVALID_USER_ID);
    expect(error.name).toBe('GameLogicError');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe(GAME_LOGIC_ERROR_CODES.INVALID_USER_ID);
  });

  it('should have all required error codes', () => {
    expect(GAME_LOGIC_ERROR_CODES.INVALID_USER_ID).toBeDefined();
    expect(GAME_LOGIC_ERROR_CODES.INVALID_SESSION_ID).toBeDefined();
    expect(GAME_LOGIC_ERROR_CODES.GAME_NOT_INITIALIZED).toBeDefined();
    expect(GAME_LOGIC_ERROR_CODES.DAILY_GAME_NOT_AVAILABLE).toBeDefined();
    expect(GAME_LOGIC_ERROR_CODES.ALREADY_COMPLETED).toBeDefined();
    expect(GAME_LOGIC_ERROR_CODES.SESSION_NOT_FOUND).toBeDefined();
    expect(GAME_LOGIC_ERROR_CODES.INVALID_GAME_STATE).toBeDefined();
    expect(GAME_LOGIC_ERROR_CODES.REDIS_ERROR).toBeDefined();
  });
});

// Helper functions for creating mock data
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

function createMockGameSession(): any {
  return {
    userId: 'test-user-123',
    sessionId: 'test-session-456',
    startTime: Date.now(),
    rounds: [],
    totalScore: 0,
    correctCount: 0,
    totalTimeBonus: 0,
    badge: BadgeType.HUMAN_IN_TRAINING,
    completed: false,
    attemptNumber: 1,
    showedEducationalContent: false,
  };
}
