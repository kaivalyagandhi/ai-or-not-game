/**
 * Unit tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validateInput,
  gameValidationRules,
  sessionValidation,
  securityValidation,
  antiCheatValidation,
} from '../validation.js';

describe('Game Validation Rules', () => {
  describe('Round Score Validation', () => {
    it('should validate whole number scores within range', () => {
      const validScores = [0, 10, 11, 13, 15];
      
      validScores.forEach(score => {
        const result = validateInput({ score }, gameValidationRules.roundScore);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject decimal scores', () => {
      const decimalScores = [10.5, 12.25, 14.99];
      
      decimalScores.forEach(score => {
        const result = validateInput({ score }, gameValidationRules.roundScore);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Score must be a whole number');
      });
    });

    it('should reject scores outside valid range', () => {
      const invalidScores = [-1, 16, 100];
      
      invalidScores.forEach(score => {
        const result = validateInput({ score }, gameValidationRules.roundScore);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => 
          error.includes('must be at least 0') || error.includes('must be no more than 15')
        )).toBe(true);
      });
    });

    it('should handle edge cases', () => {
      // Test exact boundaries
      expect(validateInput({ score: 0 }, gameValidationRules.roundScore).isValid).toBe(true);
      expect(validateInput({ score: 15 }, gameValidationRules.roundScore).isValid).toBe(true);
    });
  });

  describe('Total Score Validation', () => {
    it('should validate whole number total scores within range', () => {
      const validTotalScores = [0, 30, 60, 90];
      
      validTotalScores.forEach(totalScore => {
        const result = validateInput({ totalScore }, gameValidationRules.totalScore);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject decimal total scores', () => {
      const decimalScores = [45.5, 67.25, 89.99];
      
      decimalScores.forEach(totalScore => {
        const result = validateInput({ totalScore }, gameValidationRules.totalScore);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Total score must be a whole number');
      });
    });

    it('should reject total scores outside valid range', () => {
      const invalidScores = [-1, 91, 200];
      
      invalidScores.forEach(totalScore => {
        const result = validateInput({ totalScore }, gameValidationRules.totalScore);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => 
          error.includes('must be at least 0') || error.includes('must be no more than 90')
        )).toBe(true);
      });
    });

    it('should handle maximum possible score', () => {
      // Maximum possible score: 6 rounds × 15 points = 90
      expect(validateInput({ totalScore: 90 }, gameValidationRules.totalScore).isValid).toBe(true);
    });
  });

  describe('Submit Answer Validation', () => {
    it('should validate time remaining within bounds', () => {
      const validData = {
        sessionId: 'test-session-123',
        roundNumber: 3,
        userAnswer: 'A',
        timeRemaining: 5000,
      };

      const result = validateInput(validData, gameValidationRules.submitAnswer);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject time remaining outside bounds', () => {
      const invalidTimeData = {
        sessionId: 'test-session-123',
        roundNumber: 3,
        userAnswer: 'A',
        timeRemaining: 15000, // Too high
      };

      const result = validateInput(invalidTimeData, gameValidationRules.submitAnswer);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('timeRemaining'))).toBe(true);
    });

    it('should validate round numbers within game bounds', () => {
      const validRounds = [1, 2, 3, 4, 5, 6];
      
      validRounds.forEach(roundNumber => {
        const data = {
          sessionId: 'test-session-123',
          roundNumber,
          userAnswer: 'A',
          timeRemaining: 5000,
        };
        
        const result = validateInput(data, gameValidationRules.submitAnswer);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject invalid round numbers', () => {
      const invalidRounds = [0, 7, -1, 10];
      
      invalidRounds.forEach(roundNumber => {
        const data = {
          sessionId: 'test-session-123',
          roundNumber,
          userAnswer: 'A',
          timeRemaining: 5000,
        };
        
        const result = validateInput(data, gameValidationRules.submitAnswer);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('roundNumber'))).toBe(true);
      });
    });
  });
});

describe('Anti-Cheat Validation', () => {
  describe('Score Validation with Tier-Based System', () => {
    it('should validate correct tier-based score calculations', () => {
      const testRounds = [
        { isCorrect: true, timeRemaining: 8000 }, // 10 + 5 = 15
        { isCorrect: true, timeRemaining: 5000 }, // 10 + 3 = 13
        { isCorrect: true, timeRemaining: 2000 }, // 10 + 1 = 11
        { isCorrect: true, timeRemaining: 0 },    // 10 + 0 = 10
        { isCorrect: false, timeRemaining: 8000 }, // 0
        { isCorrect: true, timeRemaining: 7000 }, // 10 + 5 = 15
      ];
      
      const expectedScore = 15 + 13 + 11 + 10 + 0 + 15; // 64
      const isValid = antiCheatValidation.validateScore(testRounds, expectedScore);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect score calculations', () => {
      const testRounds = [
        { isCorrect: true, timeRemaining: 8000 }, // Should be 15
        { isCorrect: true, timeRemaining: 5000 }, // Should be 13
      ];
      
      const incorrectScore = 30; // Reported higher than actual (28)
      const isValid = antiCheatValidation.validateScore(testRounds, incorrectScore);
      expect(isValid).toBe(false);
    });

    it('should handle boundary cases in tier calculations', () => {
      const boundaryRounds = [
        { isCorrect: true, timeRemaining: 7000 }, // Exactly 7 seconds = tier 1 (15)
        { isCorrect: true, timeRemaining: 6999 }, // Just under 7 seconds = tier 2 (13)
        { isCorrect: true, timeRemaining: 4000 }, // Exactly 4 seconds = tier 2 (13)
        { isCorrect: true, timeRemaining: 3999 }, // Just under 4 seconds = tier 3 (11)
        { isCorrect: true, timeRemaining: 1000 }, // Exactly 1 second = tier 3 (11)
        { isCorrect: true, timeRemaining: 999 },  // Just under 1 second = tier 4 (10)
      ];
      
      const expectedScore = 15 + 13 + 13 + 11 + 11 + 10; // 73
      const isValid = antiCheatValidation.validateScore(boundaryRounds, expectedScore);
      expect(isValid).toBe(true);
    });

    it('should validate all incorrect answers result in zero score', () => {
      const allIncorrectRounds = [
        { isCorrect: false, timeRemaining: 10000 },
        { isCorrect: false, timeRemaining: 8000 },
        { isCorrect: false, timeRemaining: 5000 },
        { isCorrect: false, timeRemaining: 2000 },
        { isCorrect: false, timeRemaining: 1000 },
        { isCorrect: false, timeRemaining: 0 },
      ];
      
      const expectedScore = 0;
      const isValid = antiCheatValidation.validateScore(allIncorrectRounds, expectedScore);
      expect(isValid).toBe(true);
    });

    it('should validate maximum possible score', () => {
      const perfectRounds = Array(6).fill(null).map(() => ({
        isCorrect: true,
        timeRemaining: 10000, // Maximum time = tier 1 bonus
      }));
      
      const maxScore = 6 * 15; // 90 points
      const isValid = antiCheatValidation.validateScore(perfectRounds, maxScore);
      expect(isValid).toBe(true);
    });
  });

  describe('Game Progression Validation', () => {
    it('should validate normal game progression timing', () => {
      const normalRounds = [
        { roundNumber: 1, timeRemaining: 7000 },
        { roundNumber: 2, timeRemaining: 5000 },
        { roundNumber: 3, timeRemaining: 3000 },
        { roundNumber: 4, timeRemaining: 2000 },
        { roundNumber: 5, timeRemaining: 4000 },
        { roundNumber: 6, timeRemaining: 1000 },
      ];
      
      const errors = antiCheatValidation.validateGameProgression(normalRounds);
      expect(errors).toHaveLength(0);
    });

    it('should detect impossible timing patterns', () => {
      const impossibleRounds = [
        { roundNumber: 1, timeRemaining: 15000 }, // Impossible time
        { roundNumber: 2, timeRemaining: 5000 },
      ];
      
      const errors = antiCheatValidation.validateGameProgression(impossibleRounds);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.includes('Impossible time remaining'))).toBe(true);
    });

    it('should detect games completed too quickly', () => {
      const tooFastRounds = Array(6).fill(null).map((_, i) => ({
        roundNumber: i + 1,
        timeRemaining: 9900, // Almost no time used per round
      }));
      
      const errors = antiCheatValidation.validateGameProgression(tooFastRounds);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.includes('completed too quickly'))).toBe(true);
    });

    it('should detect invalid round sequences', () => {
      const invalidSequenceRounds = [
        { roundNumber: 1, timeRemaining: 5000 },
        { roundNumber: 3, timeRemaining: 4000 }, // Skipped round 2
        { roundNumber: 4, timeRemaining: 3000 },
      ];
      
      const errors = antiCheatValidation.validateGameProgression(invalidSequenceRounds);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.includes('Invalid round sequence'))).toBe(true);
    });
  });
});

describe('Session Validation', () => {
  describe('Timing Validation', () => {
    it('should validate reasonable round timing', () => {
      const recentStartTime = Date.now() - 5000; // 5 seconds ago
      const timeRemaining = 5000; // 5 seconds remaining
      
      const isValid = sessionValidation.isValidRoundTiming(recentStartTime, timeRemaining);
      expect(isValid).toBe(true);
    });

    it('should reject timing that exceeds maximum round time', () => {
      const oldStartTime = Date.now() - 25000; // 25 seconds ago (too long)
      const timeRemaining = 5000;
      
      const isValid = sessionValidation.isValidRoundTiming(oldStartTime, timeRemaining);
      expect(isValid).toBe(false);
    });
  });

  describe('ID Format Validation', () => {
    it('should validate proper session ID formats', () => {
      const validIds = [
        'session-123456789', // 18 chars
        'user_456789012345', // 18 chars  
        'abc123def456789012', // 18 chars
        'a'.repeat(10), // Minimum length
        'b'.repeat(100), // Maximum length
      ];
      
      validIds.forEach(id => {
        expect(sessionValidation.isValidSessionId(id)).toBe(true);
      });
    });

    it('should reject invalid session ID formats', () => {
      const invalidIds = [
        '', // Empty
        'a', // Too short (less than 10 chars)
        'short123', // Too short (9 chars)
        'session with spaces', // Contains spaces
        'session@invalid123', // Contains invalid character
        'c'.repeat(101), // Too long (more than 100 chars)
      ];
      
      invalidIds.forEach(id => {
        expect(sessionValidation.isValidSessionId(id)).toBe(false);
      });
    });

    it('should validate proper user ID formats', () => {
      const validIds = ['user123', 'test_user', 'u-456'];
      
      validIds.forEach(id => {
        expect(sessionValidation.isValidUserId(id)).toBe(true);
      });
    });

    it('should reject invalid user ID formats', () => {
      const invalidIds = ['', 'user with spaces', 'user@invalid'];
      
      invalidIds.forEach(id => {
        expect(sessionValidation.isValidUserId(id)).toBe(false);
      });
    });
  });
});

describe('Security Validation', () => {
  describe('Suspicious Pattern Detection', () => {
    it('should detect script injection attempts', () => {
      const maliciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        'onload=alert(1)',
        'eval(malicious_code)',
      ];
      
      maliciousInputs.forEach(input => {
        expect(securityValidation.hasSuspiciousPatterns(input)).toBe(true);
      });
    });

    it('should allow safe input patterns', () => {
      const safeInputs = [
        'normal text',
        'user123',
        'A valid answer',
        '12345',
      ];
      
      safeInputs.forEach(input => {
        expect(securityValidation.hasSuspiciousPatterns(input)).toBe(false);
      });
    });
  });

  describe('Number Safety Validation', () => {
    it('should validate safe number ranges', () => {
      const safeNumbers = [0, 15, 90, 1000, -1000];
      
      safeNumbers.forEach(num => {
        expect(securityValidation.isSafeNumber(num)).toBe(true);
      });
    });

    it('should reject unsafe number values', () => {
      const unsafeNumbers = [NaN, Infinity, -Infinity];
      
      unsafeNumbers.forEach(num => {
        expect(securityValidation.isSafeNumber(num)).toBe(false);
      });
    });
  });

  describe('Request Frequency Validation', () => {
    it('should allow normal request frequencies', () => {
      const normalTimestamps = [1000, 2000, 3500, 5000]; // Normal spacing
      
      expect(securityValidation.isRequestFrequencyNormal(normalTimestamps)).toBe(true);
    });

    it('should detect suspicious rapid requests', () => {
      const rapidTimestamps = [1000, 1050, 1080, 1100]; // Too rapid
      
      expect(securityValidation.isRequestFrequencyNormal(rapidTimestamps)).toBe(false);
    });

    it('should handle single request', () => {
      const singleTimestamp = [1000];
      
      expect(securityValidation.isRequestFrequencyNormal(singleTimestamp)).toBe(true);
    });
  });
});
