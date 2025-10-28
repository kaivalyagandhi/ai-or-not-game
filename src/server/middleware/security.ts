/**
 * Security middleware for the game server
 */

import { Request, Response, NextFunction } from 'express';
import { 
  validateInput, 
  gameValidationRules, 
  sessionValidation, 
  securityValidation
} from '../utils/validation';
import { 
  createRateLimitMiddleware, 
  rateLimitConfigs, 
  abuseDetector 
} from '../utils/rateLimiter';

/**
 * Enhanced request interface with security context
 */
export interface SecureRequest extends Request {
  userId?: string;
  sessionId?: string;
  securityContext?: {
    isValidated: boolean;
    riskScore: number;
    flags: string[];
  };
  rateLimitInfo?: any;
  abuseDetectionKey?: string;
}

/**
 * Security response helper
 */
function sendSecurityError(res: Response, message: string, statusCode: number = 400): void {
  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

/**
 * Input validation middleware factory
 */
export function validateGameInput(rules: any[]) {
  return (req: SecureRequest, res: Response, next: NextFunction) => {
    const validation = validateInput(req.body, rules);
    
    if (!validation.isValid) {
      // Record suspicious activity for validation failures
      if (req.abuseDetectionKey) {
        abuseDetector.recordSuspiciousActivity(
          req.abuseDetectionKey, 
          'validation_failure', 
          2
        );
      }
      
      return sendSecurityError(res, `Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Replace request body with sanitized data
    req.body = validation.sanitizedData;
    next();
  };
}

/**
 * Session security middleware
 */
export function validateSession() {
  return (req: SecureRequest, res: Response, next: NextFunction) => {
    const { sessionId, userId } = req.body;
    
    // Validate session ID format
    if (sessionId && !sessionValidation.isValidSessionId(sessionId)) {
      if (req.abuseDetectionKey) {
        abuseDetector.recordSuspiciousActivity(
          req.abuseDetectionKey, 
          'invalid_session_id', 
          3
        );
      }
      return sendSecurityError(res, 'Invalid session ID format');
    }
    
    // Validate user ID format
    if (userId && !sessionValidation.isValidUserId(userId)) {
      if (req.abuseDetectionKey) {
        abuseDetector.recordSuspiciousActivity(
          req.abuseDetectionKey, 
          'invalid_user_id', 
          3
        );
      }
      return sendSecurityError(res, 'Invalid user ID format');
    }
    
    // Store validated IDs
    req.userId = userId;
    req.sessionId = sessionId;
    
    next();
  };
}

/**
 * Timer validation middleware for answer submissions
 */
export function validateGameTiming() {
  return (req: SecureRequest, res: Response, next: NextFunction) => {
    const { timeRemaining } = req.body;
    
    // Basic time validation
    if (timeRemaining < 0 || timeRemaining > 10000) {
      if (req.abuseDetectionKey) {
        abuseDetector.recordSuspiciousActivity(
          req.abuseDetectionKey, 
          'invalid_timing', 
          4
        );
      }
      return sendSecurityError(res, 'Invalid time remaining');
    }
    
    // Store timing info for pattern analysis
    req.securityContext = {
      isValidated: true,
      riskScore: 0,
      flags: [],
    };
    
    next();
  };
}

/**
 * Anti-cheat middleware for game submissions
 */
export function antiCheatValidation() {
  return async (req: SecureRequest, res: Response, next: NextFunction) => {
    const { roundNumber, timeRemaining, userAnswer } = req.body;
    
    try {
      // Get session data from Redis to validate progression
      // This would typically fetch from your game state storage
      // For now, we'll do basic validation
      
      const flags: string[] = [];
      let riskScore = 0;
      
      // Check for rapid submissions
      // In a real implementation, you'd track submission timestamps
      
      // Validate round progression
      if (roundNumber < 1 || roundNumber > 6) {
        flags.push('invalid_round_number');
        riskScore += 5;
      }
      
      // Check for impossible timing
      if (timeRemaining > 10000) {
        flags.push('impossible_timing');
        riskScore += 10;
      }
      
      // Check answer format
      if (!['A', 'B'].includes(userAnswer)) {
        flags.push('invalid_answer_format');
        riskScore += 3;
      }
      
      // Record suspicious activity if risk score is high
      if (riskScore >= 5 && req.abuseDetectionKey) {
        abuseDetector.recordSuspiciousActivity(
          req.abuseDetectionKey, 
          'anti_cheat_flags', 
          Math.min(riskScore, 10)
        );
      }
      
      // Block if risk score is too high
      if (riskScore >= 10) {
        return sendSecurityError(res, 'Suspicious activity detected', 429);
      }
      
      // Update security context
      req.securityContext = {
        isValidated: true,
        riskScore,
        flags,
      };
      
      next();
    } catch (error) {
      console.error('Anti-cheat validation error:', error);
      return sendSecurityError(res, 'Security validation failed', 500);
    }
  };
}

/**
 * Content Security Policy middleware
 */
export function contentSecurityPolicy() {
  return (_req: Request, res: Response, next: NextFunction) => {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Basic CSP for API endpoints
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; frame-ancestors 'none';"
    );
    
    next();
  };
}

/**
 * Request sanitization middleware
 */
export function sanitizeRequest() {
  return (req: SecureRequest, res: Response, next: NextFunction) => {
    // Check for suspicious patterns in all string inputs
    const checkForSuspiciousContent = (obj: any): boolean => {
      if (typeof obj === 'string') {
        return securityValidation.hasSuspiciousPatterns(obj);
      }
      
      if (typeof obj === 'object' && obj !== null) {
        return Object.values(obj).some(checkForSuspiciousContent);
      }
      
      return false;
    };
    
    // Check request body
    if (req.body && checkForSuspiciousContent(req.body)) {
      if (req.abuseDetectionKey) {
        abuseDetector.recordSuspiciousActivity(
          req.abuseDetectionKey, 
          'suspicious_content', 
          5
        );
      }
      return sendSecurityError(res, 'Invalid request content', 400);
    }
    
    // Check query parameters
    if (req.query && checkForSuspiciousContent(req.query)) {
      if (req.abuseDetectionKey) {
        abuseDetector.recordSuspiciousActivity(
          req.abuseDetectionKey, 
          'suspicious_query', 
          3
        );
      }
      return sendSecurityError(res, 'Invalid query parameters', 400);
    }
    
    next();
  };
}

/**
 * Game-specific security middleware combinations
 */
export const gameSecurityMiddleware = {
  // For game initialization
  gameInit: [
    abuseDetector.createMiddleware(8),
    createRateLimitMiddleware(rateLimitConfigs.gameInit),
    contentSecurityPolicy(),
    sanitizeRequest(),
    validateGameInput(gameValidationRules.startGame),
    validateSession(),
  ],
  
  // For answer submission
  submitAnswer: [
    abuseDetector.createMiddleware(10),
    createRateLimitMiddleware(rateLimitConfigs.submitAnswer),
    contentSecurityPolicy(),
    sanitizeRequest(),
    validateGameInput(gameValidationRules.submitAnswer),
    validateSession(),
    validateGameTiming(),
    antiCheatValidation(),
  ],
  
  // For leaderboard queries
  leaderboard: [
    abuseDetector.createMiddleware(5),
    createRateLimitMiddleware(rateLimitConfigs.leaderboard),
    contentSecurityPolicy(),
    sanitizeRequest(),
  ],
  
  // For participant count
  participantCount: [
    createRateLimitMiddleware(rateLimitConfigs.participantCount),
    contentSecurityPolicy(),
  ],
  
  // General API protection
  general: [
    abuseDetector.createMiddleware(5),
    createRateLimitMiddleware(rateLimitConfigs.general),
    contentSecurityPolicy(),
    sanitizeRequest(),
  ],
};

/**
 * Error handling middleware for security errors
 */
export function securityErrorHandler() {
  return (err: any, req: SecureRequest, res: Response, next: NextFunction) => {
    // Log security-related errors
    if (err.name === 'ValidationError' || err.name === 'SecurityError') {
      console.warn('Security error:', {
        error: err.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });
      
      // Record as suspicious activity
      if (req.abuseDetectionKey) {
        abuseDetector.recordSuspiciousActivity(
          req.abuseDetectionKey, 
          'security_error', 
          3
        );
      }
      
      return sendSecurityError(res, 'Security validation failed', 400);
    }
    
    // Pass other errors to default handler
    next(err);
  };
}
