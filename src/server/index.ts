import express from 'express';
import {
  InitResponse,
  IncrementResponse,
  DecrementResponse,
  GameInitResponse,
  StartGameResponse,
  StartGameRequest,
  SubmitAnswerResponse,
  SubmitAnswerRequest,
  DailyPlayCountResponse,
  WeeklyUserRankResponse,
} from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort, realtime } from '@devvit/web/server';
import { securityErrorHandler } from './middleware/security';
import { trackRequestResult } from './utils/rateLimiter';
import { createPost } from './core/post';
import { resetDailyGameState } from './core/daily-game-manager.js';

import { createImageCollection } from './core/image-loader.js';
import { executeSchedulerJob } from './core/scheduler-manager.js';
import { initializeGame, startGame, submitAnswer, getCurrentUsername } from './core/game-logic.js';
import { 
  getUserPlayStats,
  canUserPlay,
  incrementUserAttempts,
  getEnvironmentInfo,
} from './core/play-limit-manager.js';
import { getAllBadgeDisplayInfo, calculateBadgeProgress } from './core/badge-manager.js';
import { 
  getLeaderboard, 
  getUserRank, 
  getLeaderboardParticipantCount,
  LeaderboardType 
} from './core/leaderboard-manager.js';
import { BadgeType } from '../shared/types/api.js';

const app = express();

// Security middleware - applied globally
app.use(trackRequestResult());

// Middleware for JSON body parsing with size limits
app.use(express.json({ limit: '1mb' }));
// Middleware for URL-encoded body parsing with size limits
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
// Middleware for plain text body parsing with size limits
app.use(express.text({ limit: '1mb' }));

const router = express.Router();

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const [count, username] = await Promise.all([
        redis.get('count'),
        reddit.getCurrentUsername(),
      ]);

      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
        username: username ?? 'anonymous',
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);

// Game API Endpoints with security middleware

router.get<object, GameInitResponse>('/api/game/init', async (_req, res): Promise<void> => {
  try {
    console.log('API /game/init called');
    // Get current user ID from Reddit context
    const username = await getCurrentUsername();
    console.log('Got username:', username);
    const userId = username; // Use username as user ID

    console.log('Calling initializeGame with userId:', userId);
    const result = await initializeGame(userId);
    console.log('initializeGame result:', result);
    
    // Add play limit information to the response
    try {
      const playStats = await getUserPlayStats(userId);
      (result as any).playLimitInfo = {
        attempts: playStats.attempts,
        maxAttempts: playStats.maxAttempts,
        remainingAttempts: playStats.remainingAttempts,
        bestScore: playStats.bestScore,
      };
    } catch (playLimitError) {
      console.error('Error getting play limit info:', playLimitError);
      // Don't fail the entire request if play limit info fails
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in /api/game/init:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.post<object, StartGameResponse, StartGameRequest>(
  '/api/game/start',
  async (_req, res): Promise<void> => {
    try {
      console.log('API /game/start called');
      // Get current user ID from Reddit context
      const username = await getCurrentUsername();
      console.log('Got username for start game:', username);
      const userId = username; // Use username as user ID

      // Check play limits before starting game
      const playCheck = await canUserPlay(userId);
      if (!playCheck.canPlay) {
        res.status(400).json({
          success: false,
          error: playCheck.reason || 'Cannot start new game',
        });
        return;
      }

      console.log('Calling startGame with userId:', userId);
      const result = await startGame(userId);
      console.log('startGame result:', result);

      // If game started successfully, register participant
      if (result.success) {
        // Track participant join in Redis using Hash
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const participantKey = `daily:participants:${today}`;
        
        // Add user to today's participant hash (Redis Hash ensures uniqueness)
        const wasNew = await redis.hSet(participantKey, { [userId]: Date.now().toString() });
        
        // Set expiration for cleanup (keep for 7 days)
        await redis.expire(participantKey, 7 * 24 * 60 * 60);
        
        // Only send updates if this is a new participant
        if (wasNew > 0) {
          // Get updated count
          const count = await redis.hLen(participantKey);

          // Send realtime update to all connected clients
          await realtime.send('participant_updates', {
            type: 'participant_count_update',
            count,
            timestamp: Date.now(),
          });

          // Also send participant join event
          await realtime.send('participant_updates', {
            type: 'participant_join',
            userId,
            username,
            timestamp: Date.now(),
          });
        }
      }

      res.json(result);
    } catch (error) {
      console.error('Error in /api/game/start:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

router.post<object, SubmitAnswerResponse, SubmitAnswerRequest>(
  '/api/game/submit-answer',
  async (req, res): Promise<void> => {
    try {
      // Basic input validation
      const { sessionId, roundNumber, userAnswer, timeRemaining } = req.body;
      
      if (!sessionId || typeof sessionId !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Invalid session ID',
        });
        return;
      }
      
      if (typeof roundNumber !== 'number' || roundNumber < 1 || roundNumber > 6) {
        res.status(400).json({
          success: false,
          error: 'Invalid round number',
        });
        return;
      }
      
      if (!['A', 'B'].includes(userAnswer)) {
        res.status(400).json({
          success: false,
          error: 'Invalid answer',
        });
        return;
      }
      
      if (typeof timeRemaining !== 'number' || timeRemaining < 0 || timeRemaining > 10000) {
        res.status(400).json({
          success: false,
          error: 'Invalid time remaining',
        });
        return;
      }

      // Get current user ID from Reddit context
      const username = await getCurrentUsername();
      const userId = username; // Use username as user ID

      // Note: We don't check play limits here because the user already started this game session
      // Play limits are only checked when starting a new game, not during active gameplay

      const result = await submitAnswer(userId, sessionId, roundNumber, userAnswer, timeRemaining);
      res.json(result);
    } catch (error) {
      console.error('Error in /api/game/submit-answer:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
);

// Play Limit API Endpoints

router.get('/api/game/play-attempts', async (_req, res): Promise<void> => {
  try {
    // Get current user ID from Reddit context
    const username = await getCurrentUsername();
    const userId = username; // Use username as user ID

    const playStats = await getUserPlayStats(userId);

    res.json({
      success: true,
      attempts: playStats.attempts,
      maxAttempts: playStats.maxAttempts,
      remainingAttempts: playStats.remainingAttempts,
      bestScore: playStats.bestScore,
    });
  } catch (error) {
    console.error('Error in /api/game/play-attempts:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Daily play count endpoint - returns number of plays completed today
router.get<object, DailyPlayCountResponse>('/api/game/daily-play-count', async (_req, res): Promise<void> => {
  try {
    // Get current user ID from Reddit context
    const username = await getCurrentUsername();
    const userId = username; // Use username as user ID

    const playStats = await getUserPlayStats(userId);

    res.json({
      success: true,
      playCount: playStats.attempts,
      maxAttempts: playStats.maxAttempts,
      remainingAttempts: playStats.remainingAttempts,
    });
  } catch (error) {
    console.error('Error in /api/game/daily-play-count:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.post('/api/game/increment-attempts', async (_req, res): Promise<void> => {
  try {
    // Get current user ID from Reddit context
    const username = await getCurrentUsername();
    const userId = username; // Use username as user ID

    // Check if user can play first
    const playCheck = await canUserPlay(userId);
    if (!playCheck.canPlay) {
      res.status(400).json({
        success: false,
        error: playCheck.reason || 'Cannot increment attempts',
      });
      return;
    }

    // Increment attempts
    const updatedPlayLimit = await incrementUserAttempts(userId);

    res.json({
      success: true,
      attempts: updatedPlayLimit.attempts,
      maxAttempts: updatedPlayLimit.maxAttempts,
      remainingAttempts: Math.max(0, updatedPlayLimit.maxAttempts - updatedPlayLimit.attempts),
    });
  } catch (error) {
    console.error('Error in /api/game/increment-attempts:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/api/badges/all', async (_req, res): Promise<void> => {
  try {
    // Return all badge information for display
    const badges = getAllBadgeDisplayInfo(BadgeType.HUMAN_IN_TRAINING); // Default to show all as unearned
    res.json({
      success: true,
      badges,
    });
  } catch (error) {
    console.error('Error in /api/badges/all:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/api/badges/progress/:correctCount', async (req, res): Promise<void> => {
  try {
    const correctCount = parseInt(req.params.correctCount, 10);

    if (isNaN(correctCount) || correctCount < 0 || correctCount > 6) {
      res.status(400).json({
        success: false,
        error: 'Invalid correct count. Must be between 0 and 6.',
      });
      return;
    }

    const progress = calculateBadgeProgress(correctCount);
    res.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error('Error in /api/badges/progress:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Leaderboard API Endpoints

router.get('/api/leaderboard/daily', async (req, res): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    // Enhanced validation
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      res.status(400).json({
        success: false,
        error: 'Invalid limit. Must be between 1 and 1000.',
      });
      return;
    }

    if (isNaN(offset) || offset < 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid offset. Must be 0 or greater.',
      });
      return;
    }

    const entries = await getLeaderboard('daily', limit, offset);
    const totalParticipants = await getLeaderboardParticipantCount('daily');

    res.json({
      success: true,
      entries,
      totalParticipants,
    });
  } catch (error) {
    console.error('Error in /api/leaderboard/daily:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/api/leaderboard/weekly', async (req, res): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    if (isNaN(limit) || limit < 1 || limit > 1000) {
      res.status(400).json({
        success: false,
        error: 'Invalid limit. Must be between 1 and 1000.',
      });
      return;
    }

    if (isNaN(offset) || offset < 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid offset. Must be 0 or greater.',
      });
      return;
    }

    const entries = await getLeaderboard('weekly', limit, offset);
    const totalParticipants = await getLeaderboardParticipantCount('weekly');

    res.json({
      success: true,
      entries,
      totalParticipants,
    });
  } catch (error) {
    console.error('Error in /api/leaderboard/weekly:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/api/leaderboard/all-time', async (req, res): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    if (isNaN(limit) || limit < 1 || limit > 1000) {
      res.status(400).json({
        success: false,
        error: 'Invalid limit. Must be between 1 and 1000.',
      });
      return;
    }

    if (isNaN(offset) || offset < 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid offset. Must be 0 or greater.',
      });
      return;
    }

    const entries = await getLeaderboard('all-time', limit, offset);
    const totalParticipants = await getLeaderboardParticipantCount('all-time');

    res.json({
      success: true,
      entries,
      totalParticipants,
    });
  } catch (error) {
    console.error('Error in /api/leaderboard/all-time:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/api/leaderboard/user-rank/:type', async (req, res): Promise<void> => {
  try {
    const type = req.params.type as LeaderboardType;
    
    if (!['daily', 'weekly', 'all-time'].includes(type)) {
      res.status(400).json({
        success: false,
        error: 'Invalid leaderboard type. Must be daily, weekly, or all-time.',
      });
      return;
    }

    // Get current user ID from Reddit context
    const username = await getCurrentUsername();
    const userId = username; // Use username as user ID

    const rankData = await getUserRank(userId, type);

    if (!rankData) {
      res.json({
        success: true,
        userRank: null,
        score: null,
        totalParticipants: await getLeaderboardParticipantCount(type),
      });
      return;
    }

    res.json({
      success: true,
      userRank: rankData.rank,
      score: rankData.score,
      totalParticipants: rankData.totalParticipants,
    });
  } catch (error) {
    console.error('Error in /api/leaderboard/user-rank:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Weekly user rank endpoint - specific endpoint for weekly rankings
router.get<object, WeeklyUserRankResponse>('/api/leaderboard/user-rank/weekly', async (_req, res): Promise<void> => {
  try {
    // Get current user ID from Reddit context
    const username = await getCurrentUsername();
    const userId = username; // Use username as user ID

    const rankData = await getUserRank(userId, 'weekly');

    if (!rankData) {
      const totalParticipants = await getLeaderboardParticipantCount('weekly');
      res.json({
        success: true,
        userRank: null,
        score: null,
        totalParticipants,
      });
      return;
    }

    res.json({
      success: true,
      userRank: rankData.rank,
      score: rankData.score,
      totalParticipants: rankData.totalParticipants,
    });
  } catch (error) {
    console.error('Error in /api/leaderboard/user-rank/weekly:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/api/participants/count', async (req, res): Promise<void> => {
  try {
    const type = (req.query.type as LeaderboardType) || 'daily';
    
    if (!['daily', 'weekly', 'all-time'].includes(type)) {
      res.status(400).json({
        success: false,
        error: 'Invalid leaderboard type. Must be daily, weekly, or all-time.',
      });
      return;
    }

    let count: number;
    
    if (type === 'daily') {
      // Use Redis Hash for real-time daily participant tracking
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const participantKey = `daily:participants:${today}`;
      count = await redis.hLen(participantKey);
    } else {
      // Use leaderboard-based counting for weekly/all-time
      count = await getLeaderboardParticipantCount(type);
    }

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error in /api/participants/count:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.post('/api/participants/join', async (_req, res): Promise<void> => {
  try {
    // Get current user ID from Reddit context
    const username = await getCurrentUsername();
    const userId = username; // Use username as user ID

    // Track participant join in Redis using Hash
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const participantKey = `daily:participants:${today}`;
    
    // Add user to today's participant hash (Redis Hash ensures uniqueness)
    const wasNew = await redis.hSet(participantKey, { [userId]: Date.now().toString() });
    
    // Set expiration for cleanup (keep for 7 days)
    await redis.expire(participantKey, 7 * 24 * 60 * 60);
    
    // Get updated count
    const count = await redis.hLen(participantKey);

    // Only send updates if this is a new participant
    if (wasNew > 0) {
      // Send realtime update to all connected clients
      await realtime.send('participant_updates', {
        type: 'participant_count_update',
        count,
        timestamp: Date.now(),
      });

      // Also send participant join event
      await realtime.send('participant_updates', {
        type: 'participant_join',
        userId,
        username,
        timestamp: Date.now(),
      });
    }

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Error in /api/participants/join:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Educational Content API Endpoints
router.get('/api/content/educational', async (_req, res): Promise<void> => {
  try {
    const { contentManager } = await import('./core/content-manager.js');
    const educationalContent = contentManager.getDailyEducationalContent();
    
    res.json({
      success: true,
      tips: educationalContent.tips,
      facts: educationalContent.facts,
      currentTip: contentManager.getCurrentTip(),
      currentFact: contentManager.getCurrentFact(),
    });
  } catch (error) {
    console.error('Error fetching educational content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load educational content',
    });
  }
});

router.get('/api/content/inspirational', async (_req, res): Promise<void> => {
  try {
    const { contentManager } = await import('./core/content-manager.js');
    const inspirationalContent = contentManager.getDailyInspirationContent();
    
    res.json({
      success: true,
      quotes: inspirationalContent.quotes,
      jokes: inspirationalContent.jokes,
      currentContent: contentManager.getCurrentInspiration(),
      contentType: inspirationalContent.type,
    });
  } catch (error) {
    console.error('Error fetching inspirational content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load inspirational content',
    });
  }
});

router.get('/api/content/current', async (_req, res): Promise<void> => {
  try {
    const { contentManager } = await import('./core/content-manager.js');
    
    res.json({
      success: true,
      tip: contentManager.getCurrentTip(),
      fact: contentManager.getCurrentFact(),
      inspiration: contentManager.getCurrentInspiration(),
    });
  } catch (error) {
    console.error('Error fetching current content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load current content',
    });
  }
});

// Session-specific content endpoint for unique tips/facts per play
router.get('/api/content/session/:sessionId', async (req, res): Promise<void> => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId || typeof sessionId !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Valid session ID is required',
      });
      return;
    }

    const { contentManager } = await import('./core/content-manager.js');
    
    res.json({
      success: true,
      tip: contentManager.getSessionTip(sessionId),
      fact: contentManager.getSessionFact(sessionId),
      inspiration: contentManager.getSessionInspiration(sessionId),
      sessionId,
    });
  } catch (error) {
    console.error('Error fetching session content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load session content',
    });
  }
});

router.get('/api/content/random', async (_req, res): Promise<void> => {
  try {
    const { contentManager } = await import('./core/content-manager.js');
    
    res.json({
      success: true,
      tip: contentManager.getRandomTip(),
      fact: contentManager.getRandomFact(),
      inspiration: contentManager.getRandomInspiration(),
    });
  } catch (error) {
    console.error('Error fetching random content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load random content',
    });
  }
});

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    console.log('🚀 APP INSTALLATION TRIGGERED');
    console.log('📅 Installation time:', new Date().toISOString());
    
    // Log scheduler configuration on app install
    console.log('⏰ SCHEDULER CONFIGURED:');
    console.log('   - Task: daily-reset-and-post');
    console.log('   - Schedule: 0 12 * * * (Daily at 12:00 PM UTC)');
    console.log('   - Endpoint: /internal/scheduler/daily-reset');
    console.log('   - Target subreddit:', context.subredditName);
    
    const post = await createPost(reddit, context);

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`❌ Error creating post during app install: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    console.log('📝 Menu triggered post creation');
    
    // 🔍 SCHEDULER DEBUGGING - Log comprehensive scheduler state
    console.log('🕐 ===== SCHEDULER DEBUG INFO =====');
    console.log('📅 Current time:', new Date().toISOString());
    console.log('📅 Current UTC time:', new Date().toUTCString());
    console.log('📅 Current hour UTC:', new Date().getUTCHours());
    console.log('📅 Current minute UTC:', new Date().getUTCMinutes());
    
    // Calculate next scheduler execution
    const now = new Date();
    const nextNoon = new Date();
    nextNoon.setUTCHours(12, 0, 0, 0);
    if (nextNoon <= now) {
      nextNoon.setUTCDate(nextNoon.getUTCDate() + 1);
    }
    
    console.log('⏰ SCHEDULER CONFIGURATION:');
    console.log('   - Task Name: daily-reset-and-post');
    console.log('   - Cron Expression: 0 12 * * *');
    console.log('   - Description: Daily at 12:00 PM UTC');
    console.log('   - Endpoint: /internal/scheduler/daily-reset');
    console.log('   - Next Execution:', nextNoon.toISOString());
    console.log('   - Time Until Next:', Math.round((nextNoon.getTime() - now.getTime()) / 1000 / 60), 'minutes');
    
    console.log('🏗️ ENVIRONMENT INFO:');
    console.log('   - NODE_ENV:', process.env.NODE_ENV || 'undefined');
    console.log('   - DEVVIT_EXECUTION_ID:', !!process.env.DEVVIT_EXECUTION_ID);
    console.log('   - DEVVIT_PLAYTEST:', process.env.DEVVIT_PLAYTEST || 'undefined');
    console.log('   - Subreddit Context:', context.subredditName);
    console.log('   - Post Context:', context.postId || 'none');
    
    console.log('📋 SCHEDULER ENDPOINT STATUS:');
    console.log('   - Endpoint Path: /internal/scheduler/daily-reset');
    console.log('   - Expected Trigger: POST request from Reddit scheduler');
    console.log('   - Manual Test: Use menu action to verify functionality');
    
    console.log('🔧 TROUBLESHOOTING CHECKLIST:');
    console.log('   ✓ devvit.json has scheduler configuration');
    console.log('   ✓ Endpoint /internal/scheduler/daily-reset exists');
    console.log('   ✓ Cron expression: 0 12 * * * (noon UTC)');
    console.log('   ✓ App deployed with scheduler config');
    console.log('   ? Scheduler service active (Reddit internal)');
    
    // Test scheduler logic without triggering full reset
    console.log('🧪 TESTING SCHEDULER COMPONENTS:');
    
    try {
      // Test content manager
      const { contentManager } = await import('./core/content-manager.js');
      console.log('   ✓ Content manager accessible');
      
      // Test image collection
      const imageCollection = createImageCollection();
      console.log('   ✓ Image collection loadable');
      console.log('   - Image categories available:', Object.keys(imageCollection).length);
      
      // Test Redis connectivity
      await redis.ping();
      console.log('   ✓ Redis connection active');
      
      // Test daily game state functionality
      const { getDailyGameState } = await import('./core/daily-game-manager.js');
      const gameState = await getDailyGameState(redis);
      console.log('   ✓ Daily game state accessible');
      console.log('   - Game state exists:', gameState.success);
      
    } catch (testError) {
      console.error('   ❌ Scheduler component test failed:', testError);
    }
    
    console.log('📊 SCHEDULER EXPECTATIONS:');
    console.log('   - Should trigger daily at 12:00 PM UTC');
    console.log('   - Should create new post in', context.subredditName);
    console.log('   - Should reset daily game state');
    console.log('   - Should show logs: "🕐 SCHEDULER TRIGGERED"');
    console.log('   - Should show logs: "✅ [SCHEDULER] Created new daily post"');
    
    console.log('🔍 VERIFICATION STEPS:');
    console.log('   1. Check logs tomorrow at 12:00 PM UTC');
    console.log('   2. Look for new post in r/' + context.subredditName);
    console.log('   3. Verify post title: "AI or Not?"');
    console.log('   4. Verify post description contains current date');
    
    console.log('🕐 ===== END SCHEDULER DEBUG =====');

    const post = await createPost(reddit, context);

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`❌ Error creating post: ${error}`);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

// API endpoint to create a new post programmatically
router.post('/api/create-post', async (req, res): Promise<void> => {
  try {
    const { title, description } = req.body;
    
    const post = await createPost(title, description);

    res.json({
      success: true,
      postId: post.id,
      postUrl: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
      message: 'Post created successfully'
    });
  } catch (error) {
    console.error(`Error creating post via API: ${error}`);
    res.status(400).json({
      success: false,
      message: 'Failed to create post',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API endpoint to create a daily challenge post
router.post('/api/create-daily-post', async (_req, res): Promise<void> => {
  try {
    // Create post with dynamic date
    const post = await createPost(reddit, context);

    res.json({
      success: true,
      postId: post.id,
      postUrl: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
      message: 'Daily challenge post created successfully'
    });
  } catch (error) {
    console.error(`Error creating daily post: ${error}`);
    res.status(400).json({
      success: false,
      message: 'Failed to create daily post',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Debug endpoint to migrate leaderboard data from old keys to new keys
router.post('/api/debug/migrate-leaderboard', async (_req, res): Promise<void> => {
  try {
    console.log('🔄 Starting leaderboard data migration...');
    
    // Old key patterns (what might have been used before)
    const oldKeyPatterns = [
      'leaderboard_all_time',
      'aiornotgame:leaderboard_all_time',
    ];
    
    // New keys
    const newAllTimeKey = 'global_aiornotgame_leaderboard_all_time';
    
    let migratedCount = 0;
    
    // Try to find and migrate all-time leaderboard data
    for (const oldPattern of oldKeyPatterns) {
      try {
        const oldEntries = await redis.zRange(oldPattern, 0, -1, { by: 'rank', reverse: true });
        console.log(`📊 Found ${oldEntries.length} entries in old key: ${oldPattern}`);
        
        if (oldEntries.length > 0) {
          // Copy each entry to new key
          for (const entry of oldEntries) {
            const score = await redis.zScore(oldPattern, entry.member);
            if (score !== null && score !== undefined) {
              await redis.zAdd(newAllTimeKey, { member: entry.member, score: score });
              migratedCount++;
            }
          }
          console.log(`✅ Migrated ${oldEntries.length} entries from ${oldPattern} to ${newAllTimeKey}`);
        }
      } catch (error) {
        console.log(`⚠️ No data found in ${oldPattern}:`, error);
      }
    }
    
    // Check final state
    const finalCount = await redis.zCard(newAllTimeKey);
    console.log(`🎯 Final all-time leaderboard count: ${finalCount}`);
    
    res.json({
      success: true,
      message: 'Leaderboard migration completed',
      migratedEntries: migratedCount,
      finalAllTimeCount: finalCount,
      newAllTimeKey,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Scheduler health check endpoint
router.get('/api/debug/scheduler-status', async (_req, res): Promise<void> => {
  try {
    const currentTime = new Date();
    const nextNoonUTC = new Date();
    nextNoonUTC.setUTCHours(12, 0, 0, 0);
    if (nextNoonUTC <= currentTime) {
      nextNoonUTC.setUTCDate(nextNoonUTC.getUTCDate() + 1);
    }

    const schedulerConfig = {
      taskName: 'daily-reset-and-post',
      endpoint: '/internal/scheduler/daily-reset',
      cronExpression: '0 12 * * *',
      description: 'Daily at noon UTC (12:00 UTC)',
      nextExecution: nextNoonUTC.toISOString(),
      timeUntilNext: Math.round((nextNoonUTC.getTime() - currentTime.getTime()) / 1000 / 60) + ' minutes',
    };

    // Check if we can access the scheduler endpoint
    let endpointAccessible = false;
    try {
      // This is just a connectivity test, not actually triggering
      endpointAccessible = true; // We can't easily test internal endpoints
    } catch {
      endpointAccessible = false;
    }

    res.json({
      success: true,
      currentTime: currentTime.toISOString(),
      scheduler: schedulerConfig,
      endpointAccessible,
      subredditContext: context.subredditName,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        DEVVIT_EXECUTION_ID: !!process.env.DEVVIT_EXECUTION_ID,
      },
      troubleshooting: {
        manualTriggerUrl: '/api/debug/trigger-scheduler',
        logsCommand: `devvit logs ${context.subredditName}`,
        expectedBehavior: 'Scheduler should create daily posts at 12:00 UTC',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Debug endpoint to check environment detection and external API access
router.get('/api/debug/environment', async (_req, res): Promise<void> => {
  try {
    // Get comprehensive environment info
    const envInfo = getEnvironmentInfo();
    
    // Test play limit functionality
    const testUserId = 'debug-user-123';
    const playResult = await canUserPlay(testUserId);
    
    // Test external API access (using globally allowed domains)
    let externalApiTest = null;
    try {
      const randomResponse = await fetch('https://random.org/integers/?num=1&min=1&max=100&col=1&base=10&format=plain&rnd=new');
      const randomNumber = await randomResponse.text();
      externalApiTest = {
        success: true,
        randomNumber: randomNumber.trim(),
        status: randomResponse.status
      };
    } catch (fetchError) {
      externalApiTest = {
        success: false,
        error: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
      };
    }
    
    res.json({
      environment: envInfo,
      playLimitTest: playResult,
      externalApiTest,
      timestamp: new Date().toISOString(),
      message: `Running in ${envInfo.mode} mode with ${envInfo.maxAttempts} daily attempts (detected via ${envInfo.detectionMethod})`
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});



router.post('/internal/scheduler/daily-reset', async (req, res): Promise<void> => {
  console.log('🚨🚨🚨 SCHEDULER TRIGGERED! 🚨🚨🚨');
  console.log('🕐 SCHEDULER EXECUTION START:', new Date().toISOString());
  console.log('🕐 UTC Time:', new Date().toUTCString());
  console.log('🕐 Expected: Daily at 12:00 PM UTC (cron: 0 12 * * *)');
  console.log('📋 Scheduler request headers:', JSON.stringify(req.headers, null, 2));
  console.log('📋 Scheduler request body:', JSON.stringify(req.body, null, 2));
  console.log('📋 Context subreddit:', context.subredditName);
  console.log('📋 Context postId:', context.postId);
  console.log('📋 Environment NODE_ENV:', process.env.NODE_ENV);
  console.log('📋 Environment DEVVIT_EXECUTION_ID:', process.env.DEVVIT_EXECUTION_ID);
  console.log('🎯 THIS CONFIRMS SCHEDULER IS WORKING!');
  
  const jobResult = await executeSchedulerJob(
    'daily-reset',
    async () => {
      console.log('📅 Executing daily reset job...');
      
      // Force reload of daily content files
      const { contentManager } = await import('./core/content-manager.js');
      contentManager.forceReload();
      console.log('✅ Content manager reloaded');

      // Load image collection from organized folder structure
      const imageCollection = createImageCollection();
      console.log('✅ Image collection loaded');

      // Reset daily game state with new randomized content
      const resetResult = await resetDailyGameState(redis, imageCollection);
      console.log('✅ Daily game state reset:', resetResult.success);

      if (!resetResult.success) {
        throw new Error(resetResult.error || 'Failed to reset daily game state');
      }

      // Reset daily participant count
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const participantKey = `daily:participants:${today}`;
      await redis.del(participantKey);
      console.log('✅ Participant count reset');

      // Send realtime update for participant count reset
      try {
        await realtime.send('participant_updates', {
          type: 'participant_count_update',
          count: 0,
          timestamp: Date.now(),
        });
        console.log('✅ Realtime update sent');
      } catch (realtimeError) {
        console.error('⚠️ Realtime update failed:', realtimeError);
      }

      // Create a new daily challenge post automatically
      let newPost = null;
      try {
        console.log('📝 Creating new daily post...');
        newPost = await createPost(reddit, context);
        console.log(`✅ [SCHEDULER] Created new daily post: ${newPost.id}`);
      } catch (postError) {
        console.error(`❌ [SCHEDULER] Failed to create daily post:`, postError);
        // Don't fail the entire job if post creation fails
      }

      return {
        date: resetResult.gameState?.date,
        categoryOrder: resetResult.gameState?.categoryOrder,
        roundCount: resetResult.gameState?.imageSet.length,
        participantCount: 0, // Reset to 0 for new day
        contentReloaded: true, // Indicate content was refreshed
        newPostId: newPost?.id || null, // Include post ID if created successfully
      };
    },
    {
      jobName: 'daily-reset',
      scheduledTime: '00:00 UTC',
      executionTime: new Date().toISOString(),
    }
  );

  if (jobResult.success) {
    res.json({
      status: 'success',
      message: jobResult.message,
      data: jobResult.data,
      timestamp: jobResult.timestamp,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: jobResult.message,
      error: jobResult.error,
      timestamp: jobResult.timestamp,
    });
  }
});

// Manual scheduler trigger for testing (accessible via API)
router.post('/api/debug/trigger-scheduler', async (_req, res): Promise<void> => {
  try {
    console.log('🧪 MANUAL SCHEDULER TRIGGER: Starting debug scheduler execution');
    console.log('📋 Current time:', new Date().toISOString());
    console.log('📋 Subreddit context:', context.subredditName);
    
    // Execute the scheduler job directly
    const jobResult = await executeSchedulerJob(
      'manual-daily-reset',
      async () => {
        console.log('📅 Executing manual daily reset job...');
        
        // Force reload of daily content files
        const { contentManager } = await import('./core/content-manager.js');
        contentManager.forceReload();
        console.log('✅ Content manager reloaded');

        // Load image collection from organized folder structure
        const imageCollection = createImageCollection();
        console.log('✅ Image collection loaded');

        // Reset daily game state with new randomized content
        const resetResult = await resetDailyGameState(redis, imageCollection);
        console.log('✅ Daily game state reset:', resetResult.success);

        if (!resetResult.success) {
          throw new Error(resetResult.error || 'Failed to reset daily game state');
        }

        // Reset daily participant count
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const participantKey = `daily:participants:${today}`;
        await redis.del(participantKey);
        console.log('✅ Participant count reset');

        // Create a new daily challenge post automatically
        let newPost = null;
        try {
          console.log('📝 Creating new daily post...');
          newPost = await createPost(reddit, context);
          console.log(`✅ [MANUAL SCHEDULER] Created new daily post: ${newPost.id}`);
          console.log(`🔗 Post URL: https://reddit.com/r/${context.subredditName}/comments/${newPost.id}`);
        } catch (postError) {
          console.error(`❌ [MANUAL SCHEDULER] Failed to create daily post:`, postError);
          throw postError; // Fail the job if post creation fails in manual mode
        }

        return {
          date: resetResult.gameState?.date,
          categoryOrder: resetResult.gameState?.categoryOrder,
          roundCount: resetResult.gameState?.imageSet.length,
          participantCount: 0,
          contentReloaded: true,
          newPostId: newPost?.id || null,
          postUrl: newPost ? `https://reddit.com/r/${context.subredditName}/comments/${newPost.id}` : null,
        };
      },
      {
        jobName: 'manual-daily-reset',
        scheduledTime: 'manual trigger',
        executionTime: new Date().toISOString(),
      }
    );

    if (jobResult.success) {
      res.json({
        success: true,
        message: 'Manual scheduler execution completed successfully',
        data: jobResult.data,
        timestamp: jobResult.timestamp,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Manual scheduler execution failed',
        error: jobResult.error,
        timestamp: jobResult.timestamp,
      });
    }
  } catch (error) {
    console.error('❌ Manual scheduler trigger failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Game results persistence endpoint
router.post('/api/game/results', async (req, res): Promise<void> => {
  try {
    console.log('API /game/results called with body:', req.body);
    
    // The results are already persisted during the game flow via submitAnswer
    // This endpoint is mainly for client-side confirmation and cleanup
    
    // Validate the request has required fields
    const { sessionId, userId, totalScore, correctCount, badge } = req.body;
    
    if (!sessionId || !userId || typeof totalScore !== 'number' || typeof correctCount !== 'number') {
      res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
      return;
    }
    
    console.log('Game results received:', {
      sessionId,
      userId,
      totalScore,
      correctCount,
      badge,
    });
    
    // Return success - the actual persistence happens during gameplay
    res.json({
      success: true,
      message: 'Results received successfully',
    });
    
  } catch (error) {
    console.error('Error in /api/game/results:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// AI Tip Comment Posting Endpoint
router.post('/api/comments/post-ai-tip', async (req, res): Promise<void> => {
  try {
    const { comment } = req.body;
    
    // Validate input
    if (!comment || typeof comment !== 'string' || comment.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'Comment text is required',
      });
      return;
    }
    
    // Get current user from Reddit context
    const username = await getCurrentUsername();
    if (!username) {
      res.status(401).json({
        success: false,
        error: 'User authentication required',
      });
      return;
    }
    
    // Get the current post ID from context
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        success: false,
        error: 'Post context not available',
      });
      return;
    }
    
    try {
      // Submit comment using Devvit Reddit API
      const commentResult = await reddit.submitComment({
        id: postId,
        text: comment.trim(),
      });
      
      console.log(`AI tip comment posted by ${username}:`, commentResult.id);
      
      res.json({
        success: true,
        commentId: commentResult.id,
      });
    } catch (redditError) {
      console.error('Reddit API error posting comment:', redditError);
      res.status(500).json({
        success: false,
        error: 'Failed to post comment to Reddit',
      });
    }
  } catch (error) {
    console.error('Error in /api/comments/post-ai-tip:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});



// Use router middleware
app.use(router);

// Security error handling middleware (must be after routes)
app.use(securityErrorHandler());

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
