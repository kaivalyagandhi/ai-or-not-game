/**
 * Server-side validation utilities for input validation and security
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => string | null;
}

/**
 * Validates a single field against a rule
 */
function validateField(value: any, rule: ValidationRule): string[] {
  const errors: string[] = [];
  const { field, required, type, minLength, maxLength, min, max, pattern, enum: enumValues, custom } = rule;

  // Check if field is required
  if (required && (value === undefined || value === null || value === '')) {
    errors.push(`${field} is required`);
    return errors;
  }

  // Skip validation if field is not required and empty
  if (!required && (value === undefined || value === null || value === '')) {
    return errors;
  }

  // Type validation
  if (type) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    if (actualType !== type) {
      errors.push(`${field} must be of type ${type}, got ${actualType}`);
      return errors;
    }
  }

  // String validations
  if (type === 'string' && typeof value === 'string') {
    if (minLength !== undefined && value.length < minLength) {
      errors.push(`${field} must be at least ${minLength} characters long`);
    }
    if (maxLength !== undefined && value.length > maxLength) {
      errors.push(`${field} must be no more than ${maxLength} characters long`);
    }
    if (pattern && !pattern.test(value)) {
      errors.push(`${field} format is invalid`);
    }
  }

  // Number validations
  if (type === 'number' && typeof value === 'number') {
    if (min !== undefined && value < min) {
      errors.push(`${field} must be at least ${min}`);
    }
    if (max !== undefined && value > max) {
      errors.push(`${field} must be no more than ${max}`);
    }
    if (isNaN(value)) {
      errors.push(`${field} must be a valid number`);
    }
  }

  // Enum validation
  if (enumValues && !enumValues.includes(value)) {
    errors.push(`${field} must be one of: ${enumValues.join(', ')}`);
  }

  // Custom validation
  if (custom) {
    const customError = custom(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return errors;
}

/**
 * Validates an object against a set of rules
 */
export function validateInput(data: any, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};

  // Validate each rule
  for (const rule of rules) {
    const value = data?.[rule.field];
    const fieldErrors = validateField(value, rule);
    errors.push(...fieldErrors);

    // Add sanitized value if no errors
    if (fieldErrors.length === 0 && value !== undefined) {
      sanitizedData[rule.field] = sanitizeValue(value, rule.type);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: errors.length === 0 ? sanitizedData : undefined,
  };
}

/**
 * Sanitizes a value based on its type
 */
function sanitizeValue(value: any, type?: string): any {
  if (type === 'string' && typeof value === 'string') {
    // Basic HTML/script tag removal
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }
  
  if (type === 'number') {
    return Number(value);
  }
  
  return value;
}

/**
 * Game-specific validation rules
 */
export const gameValidationRules = {
  startGame: [
    {
      field: 'userId',
      required: true,
      type: 'string' as const,
      minLength: 1,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9_-]+$/,
    },
  ],

  submitAnswer: [
    {
      field: 'sessionId',
      required: true,
      type: 'string' as const,
      minLength: 1,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9_-]+$/,
    },
    {
      field: 'roundNumber',
      required: true,
      type: 'number' as const,
      min: 1,
      max: 6,
    },
    {
      field: 'userAnswer',
      required: true,
      type: 'string' as const,
      enum: ['A', 'B'],
    },
    {
      field: 'timeRemaining',
      required: true,
      type: 'number' as const,
      min: 0,
      max: 15000, // 15 seconds in milliseconds
    },
  ],

  leaderboardQuery: [
    {
      field: 'limit',
      required: false,
      type: 'number' as const,
      min: 1,
      max: 1000,
    },
    {
      field: 'offset',
      required: false,
      type: 'number' as const,
      min: 0,
    },
  ],

  leaderboardType: [
    {
      field: 'type',
      required: true,
      type: 'string' as const,
      enum: ['daily', 'weekly', 'all-time'],
    },
  ],
};

/**
 * Session validation utilities
 */
export const sessionValidation = {
  /**
   * Validates session ID format
   */
  isValidSessionId(sessionId: string): boolean {
    return /^[a-zA-Z0-9_-]{10,100}$/.test(sessionId);
  },

  /**
   * Validates user ID format
   */
  isValidUserId(userId: string): boolean {
    return /^[a-zA-Z0-9_-]{1,100}$/.test(userId);
  },

  /**
   * Validates timestamp is within reasonable bounds
   */
  isValidTimestamp(timestamp: number): boolean {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneHourFromNow = now + (60 * 60 * 1000);
    
    return timestamp >= oneHourAgo && timestamp <= oneHourFromNow;
  },

  /**
   * Validates round timing
   */
  isValidRoundTiming(startTime: number, timeRemaining: number): boolean {
    const elapsed = Date.now() - startTime;
    const maxRoundTime = 20000; // 20 seconds max (15 + 5 buffer)
    
    // Check if elapsed time is reasonable
    if (elapsed > maxRoundTime) {
      return false;
    }
    
    // Check if time remaining makes sense
    const expectedTimeRemaining = 15000 - elapsed; // 15 seconds minus elapsed
    const tolerance = 2000; // 2 second tolerance
    
    return Math.abs(timeRemaining - expectedTimeRemaining) <= tolerance;
  },
};

/**
 * Security validation utilities
 */
export const securityValidation = {
  /**
   * Checks for suspicious patterns in input
   */
  hasSuspiciousPatterns(input: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
      /vbscript:/i,
      /data:text\/html/i,
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(input));
  },

  /**
   * Validates that numeric inputs are within safe ranges
   */
  isSafeNumber(value: number): boolean {
    return (
      !isNaN(value) &&
      isFinite(value) &&
      value >= Number.MIN_SAFE_INTEGER &&
      value <= Number.MAX_SAFE_INTEGER
    );
  },

  /**
   * Checks if request frequency is suspicious
   */
  isRequestFrequencyNormal(timestamps: number[]): boolean {
    if (timestamps.length < 2) return true;
    
    // Check for requests that are too frequent (less than 100ms apart)
    for (let i = 1; i < timestamps.length; i++) {
      const current = timestamps[i];
      const previous = timestamps[i - 1];
      if (current && previous && current - previous < 100) {
        return false;
      }
    }
    
    return true;
  },
};

/**
 * Creates a validation middleware for Express routes
 */
export function createValidationMiddleware(rules: ValidationRule[]) {
  return (req: any, res: any, next: any) => {
    const validation = validateInput(req.body, rules);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      });
    }
    
    // Replace request body with sanitized data
    req.body = validation.sanitizedData;
    next();
  };
}

/**
 * Anti-cheat validation for game submissions
 */
export const antiCheatValidation = {
  /**
   * Validates that game progression is natural
   */
  validateGameProgression(rounds: any[]): string[] {
    const errors: string[] = [];
    
    // Check round sequence
    for (let i = 0; i < rounds.length; i++) {
      if (rounds[i].roundNumber !== i + 1) {
        errors.push(`Invalid round sequence: expected round ${i + 1}, got ${rounds[i].roundNumber}`);
      }
    }
    
    // Check for impossible timing
    let totalTime = 0;
    for (const round of rounds) {
      if (round.timeRemaining > 15000) {
        errors.push(`Impossible time remaining: ${round.timeRemaining}ms`);
      }
      totalTime += (15000 - (round.timeRemaining || 0));
    }
    
    // Total game time should be reasonable (at least 6 seconds, at most 90 seconds)
    if (totalTime < 6000) {
      errors.push(`Game completed too quickly: ${totalTime}ms`);
    }
    if (totalTime > 90000) {
      errors.push(`Game took too long: ${totalTime}ms`);
    }
    
    return errors;
  },

  /**
   * Validates score calculation
   */
  validateScore(rounds: any[], reportedScore: number): boolean {
    let calculatedScore = 0;
    
    for (const round of rounds) {
      if (round.isCorrect) {
        calculatedScore += 1; // 1 point for correct answer
        if (round.timeRemaining) {
          calculatedScore += round.timeRemaining * 0.01; // Time bonus
        }
      }
    }
    
    // Allow small floating point differences
    const tolerance = 0.01;
    return Math.abs(calculatedScore - reportedScore) <= tolerance;
  },
};
