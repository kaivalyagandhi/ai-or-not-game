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
} from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort, realtime } from '@devvit/web/server';
import { securityErrorHandler } from './middleware/security';
import { trackRequestResult } from './utils/rateLimiter';
import { createPost } from './core/post';
import { resetDailyGameState } from './core/daily-game-manager.js';

import { createImageCollection } from './core/image-loader.js';
import { executeSchedulerJob } from './core/scheduler-manager.js';
import { initializeGame, startGame, submitAnswer, getCurrentUsername } from './core/game-logic.js';
import { getAllBadgeDisplayInfo, calculateBadgeProgress } from './core/badge-manager.js';
import { 
  getLeaderboard, 
  getUserRank, 
  getLeaderboardParticipantCount,
  LeaderboardType 
} from './core/leaderboard-manager.js';
import { BadgeType, ImageCategory } from '../shared/types/api.js';

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
    // Get current user ID from Reddit context
    const username = await getCurrentUsername();
    const userId = username; // Use username as user ID

    const result = await initializeGame(userId);
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
      // Get current user ID from Reddit context
      const username = await getCurrentUsername();
      const userId = username; // Use username as user ID

      const result = await startGame(userId);

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
      
      if (typeof roundNumber !== 'number' || roundNumber < 1 || roundNumber > 5) {
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

    if (isNaN(correctCount) || correctCount < 0 || correctCount > 5) {
      res.status(400).json({
        success: false,
        error: 'Invalid correct count. Must be between 0 and 5.',
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
        rank: null,
        score: null,
        totalParticipants: await getLeaderboardParticipantCount(type),
      });
      return;
    }

    res.json({
      success: true,
      rank: rankData.rank,
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

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/scheduler/daily-reset', async (_req, res): Promise<void> => {
  const jobResult = await executeSchedulerJob(
    'daily-reset',
    async () => {
      // Load image collection from organized folder structure
      const imageCollection = createImageCollection();

      // Reset daily game state with new randomized content
      const resetResult = await resetDailyGameState(redis, imageCollection);

      if (!resetResult.success) {
        throw new Error(resetResult.error || 'Failed to reset daily game state');
      }

      // Reset daily participant count
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const participantKey = `daily:participants:${today}`;
      await redis.del(participantKey);

      // Send realtime update for participant count reset
      await realtime.send('participant_updates', {
        type: 'participant_count_update',
        count: 0,
        timestamp: Date.now(),
      });

      return {
        date: resetResult.gameState?.date,
        categoryOrder: resetResult.gameState?.categoryOrder,
        roundCount: resetResult.gameState?.imageSet.length,
        participantCount: 0, // Reset to 0 for new day
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

// Debug endpoint to test image collection (development only)
router.get('/api/debug/image-collection', async (_req, res): Promise<void> => {
  try {
    console.log('Debug: Testing image collection creation...');
    const imageCollection = createImageCollection();
    
    const stats: Record<string, any> = {};
    for (const category of Object.values(ImageCategory)) {
      const categoryImages = imageCollection[category];
      const humanCount = categoryImages.filter(img => !img.isAI).length;
      const aiCount = categoryImages.filter(img => img.isAI).length;
      
      stats[category] = {
        total: categoryImages.length,
        human: humanCount,
        ai: aiCount,
        images: categoryImages.map(img => ({
          id: img.id,
          filename: img.filename,
          isAI: img.isAI,
          url: img.url
        }))
      };
    }
    
    res.json({
      success: true,
      stats,
      message: 'Image collection created successfully'
    });
  } catch (error) {
    console.error('Debug: Error creating image collection:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// Test endpoint for manual daily reset (development only)
router.post('/api/test/daily-reset', async (_req, res): Promise<void> => {
  const jobResult = await executeSchedulerJob(
    'daily-reset-test',
    async () => {
      const imageCollection = createImageCollection();
      const resetResult = await resetDailyGameState(redis, imageCollection);

      if (!resetResult.success) {
        throw new Error(resetResult.error || 'Failed to reset daily game state');
      }

      // Reset daily participant count
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const participantKey = `daily:participants:${today}`;
      await redis.del(participantKey);

      // Send realtime update for participant count reset
      await realtime.send('participant_updates', {
        type: 'participant_count_update',
        count: 0,
        timestamp: Date.now(),
      });

      return {
        date: resetResult.gameState?.date,
        categoryOrder: resetResult.gameState?.categoryOrder,
        roundCount: resetResult.gameState?.imageSet.length,
        participantCount: 0, // Reset to 0 for new day
      };
    },
    {
      jobName: 'daily-reset-test',
      scheduledTime: 'manual',
      executionTime: new Date().toISOString(),
    }
  );

  if (jobResult.success) {
    res.json({
      status: 'success',
      message: 'Manual daily reset completed successfully',
      data: jobResult.data,
      timestamp: jobResult.timestamp,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Manual daily reset failed',
      error: jobResult.error,
      timestamp: jobResult.timestamp,
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
