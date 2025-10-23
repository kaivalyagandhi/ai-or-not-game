/**
 * Rate limiting utilities for API endpoints
 */

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: any) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

export interface RateLimitInfo {
  totalHits: number;
  totalHitsInWindow: number;
  remainingPoints: number;
  msBeforeNext: number;
  isBlocked: boolean;
}

/**
 * In-memory rate limiter using Redis-like operations
 */
class InMemoryRateLimiter {
  private store = new Map<string, Array<{ timestamp: number; success?: boolean }>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up old entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Cleans up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [key, entries] of this.store.entries()) {
      const validEntries = entries.filter(entry => now - entry.timestamp < maxAge);
      if (validEntries.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, validEntries);
      }
    }
  }

  /**
   * Records a request
   */
  hit(key: string, success?: boolean): void {
    const entries = this.store.get(key) || [];
    entries.push({ timestamp: Date.now(), success: success ?? false });
    this.store.set(key, entries);
  }

  /**
   * Gets rate limit info for a key
   */
  getInfo(key: string, config: RateLimitConfig): RateLimitInfo {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const entries = this.store.get(key) || [];
    
    // Filter entries within the current window
    const entriesInWindow = entries.filter(entry => {
      const inWindow = entry.timestamp >= windowStart;
      
      if (!inWindow) return false;
      
      // Apply skip rules
      if (config.skipSuccessfulRequests && entry.success === true) return false;
      if (config.skipFailedRequests && entry.success === false) return false;
      
      return true;
    });
    
    const totalHitsInWindow = entriesInWindow.length;
    const remainingPoints = Math.max(0, config.maxRequests - totalHitsInWindow);
    const isBlocked = totalHitsInWindow >= config.maxRequests;
    
    // Calculate time until next request is allowed
    let msBeforeNext = 0;
    if (isBlocked && entriesInWindow.length > 0) {
      const oldestInWindow = Math.min(...entriesInWindow.map(e => e.timestamp));
      msBeforeNext = Math.max(0, (oldestInWindow + config.windowMs) - now);
    }
    
    return {
      totalHits: entries.length,
      totalHitsInWindow,
      remainingPoints,
      msBeforeNext,
      isBlocked,
    };
  }

  /**
   * Destroys the rate limiter and cleans up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Global rate limiter instance
const rateLimiter = new InMemoryRateLimiter();

/**
 * Default key generator using IP address and user agent
 */
function defaultKeyGenerator(req: any): string {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  return `${ip}:${userAgent}`;
}

/**
 * Creates a rate limiting middleware
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const keyGenerator = config.keyGenerator || defaultKeyGenerator;
  
  return (req: any, res: any, next: any) => {
    const key = keyGenerator(req);
    const info = rateLimiter.getInfo(key, config);
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': info.remainingPoints.toString(),
      'X-RateLimit-Reset': new Date(Date.now() + info.msBeforeNext).toISOString(),
    });
    
    if (info.isBlocked) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil(info.msBeforeNext / 1000),
      });
    }
    
    // Record the request (we'll update with success/failure later)
    rateLimiter.hit(key);
    
    // Store info for potential success/failure tracking
    req.rateLimitInfo = { key, config };
    
    next();
  };
}

/**
 * Middleware to track request success/failure for rate limiting
 */
export function trackRequestResult() {
  return (req: any, res: any, next: any) => {
    const originalSend = res.send;
    
    res.send = function(data: any) {
      // Determine if request was successful based on status code
      const success = res.statusCode >= 200 && res.statusCode < 400;
      
      // Update rate limit record if tracking is enabled
      if (req.rateLimitInfo) {
        const { key, config } = req.rateLimitInfo;
        if (config.skipSuccessfulRequests || config.skipFailedRequests) {
          rateLimiter.hit(key, success);
        }
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}

/**
 * Predefined rate limit configurations
 */
export const rateLimitConfigs = {
  // General API endpoints
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
  },
  
  // Game initialization (less frequent)
  gameInit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 game inits per minute
  },
  
  // Answer submission (during gameplay)
  submitAnswer: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 submissions per minute (allows for retries)
    keyGenerator: (req: any) => {
      // Use user ID for game-specific rate limiting
      const userId = req.body?.userId || req.user?.id || defaultKeyGenerator(req);
      return `submit:${userId}`;
    },
  },
  
  // Leaderboard queries
  leaderboard: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 leaderboard requests per minute
  },
  
  // Participant count (frequently accessed)
  participantCount: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 1 request per second on average
  },
  
  // Strict rate limiting for sensitive operations
  strict: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 requests per minute
  },
};

/**
 * Anti-abuse detection
 */
export class AntiAbuseDetector {
  private suspiciousActivity = new Map<string, Array<{ timestamp: number; type: string; severity: number }>>();
  
  /**
   * Records suspicious activity
   */
  recordSuspiciousActivity(key: string, type: string, severity: number = 1): void {
    const activities = this.suspiciousActivity.get(key) || [];
    activities.push({ timestamp: Date.now(), type, severity });
    
    // Keep only last 24 hours of activity
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const recentActivities = activities.filter(a => a.timestamp >= oneDayAgo);
    
    this.suspiciousActivity.set(key, recentActivities);
  }
  
  /**
   * Calculates abuse score for a key
   */
  getAbuseScore(key: string): number {
    const activities = this.suspiciousActivity.get(key) || [];
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    // Calculate score based on recent activity
    const recentActivities = activities.filter(a => a.timestamp >= oneHourAgo);
    return recentActivities.reduce((score, activity) => score + activity.severity, 0);
  }
  
  /**
   * Checks if a key should be blocked due to abuse
   */
  shouldBlock(key: string, threshold: number = 10): boolean {
    return this.getAbuseScore(key) >= threshold;
  }
  
  /**
   * Creates middleware for abuse detection
   */
  createMiddleware(threshold: number = 10) {
    return (req: any, res: any, next: any) => {
      const key = defaultKeyGenerator(req);
      
      if (this.shouldBlock(key, threshold)) {
        return res.status(429).json({
          success: false,
          error: 'Suspicious activity detected. Please try again later.',
        });
      }
      
      // Store key for potential abuse recording
      req.abuseDetectionKey = key;
      next();
    };
  }
}

// Global abuse detector instance
export const abuseDetector = new AntiAbuseDetector();

/**
 * Utility functions for common abuse patterns
 */
export const abusePatterns = {
  /**
   * Detects rapid-fire requests
   */
  detectRapidFire(timestamps: number[]): boolean {
    if (timestamps.length < 3) return false;
    
    // Check if 3 or more requests within 1 second
    const oneSecondAgo = Date.now() - 1000;
    const recentRequests = timestamps.filter(t => t >= oneSecondAgo);
    return recentRequests.length >= 3;
  },
  
  /**
   * Detects impossible game completion times
   */
  detectImpossibleTiming(gameStartTime: number, gameEndTime: number): boolean {
    const gameDuration = gameEndTime - gameStartTime;
    const minGameTime = 5000; // 5 seconds minimum
    const maxGameTime = 120000; // 2 minutes maximum
    
    return gameDuration < minGameTime || gameDuration > maxGameTime;
  },
  
  /**
   * Detects suspicious score patterns
   */
  detectSuspiciousScores(scores: number[]): boolean {
    if (scores.length < 5) return false;
    
    // Check for identical scores (suspicious)
    const uniqueScores = new Set(scores);
    if (uniqueScores.size === 1) return true;
    
    // Check for perfect scores too frequently
    const perfectScores = scores.filter(s => s >= 5.0);
    return perfectScores.length / scores.length > 0.8; // More than 80% perfect
  },
};
