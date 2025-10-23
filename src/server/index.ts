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
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost } from './core/post';
import { resetDailyGameState } from './core/daily-game-manager.js';
import { createSampleImageCollection } from './core/image-manager.js';
import { executeSchedulerJob } from './core/scheduler-manager.js';
import { initializeGame, startGame, submitAnswer, getCurrentUsername } from './core/game-logic.js';
import { getAllBadgeDisplayInfo, calculateBadgeProgress } from './core/badge-manager.js';
import { 
  getLeaderboard, 
  getUserRank, 
  getLeaderboardParticipantCount,
  LeaderboardType 
} from './core/leaderboard-manager.js';
import { BadgeType } from '../shared/types/api.js';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

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

// Game API Endpoints

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
      // Get current user ID from Reddit context
      const username = await getCurrentUsername();
      const userId = username; // Use username as user ID

      const { sessionId, roundNumber, userAnswer, timeRemaining } = req.body;

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

    const count = await getLeaderboardParticipantCount(type);

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
      // Create sample image collection (in production, this would load from actual image assets)
      const imageCollection = createSampleImageCollection();

      // Reset daily game state with new randomized content
      const resetResult = await resetDailyGameState(redis, imageCollection);

      if (!resetResult.success) {
        throw new Error(resetResult.error || 'Failed to reset daily game state');
      }

      return {
        date: resetResult.gameState?.date,
        categoryOrder: resetResult.gameState?.categoryOrder,
        roundCount: resetResult.gameState?.imageSet.length,
        participantCount: resetResult.gameState?.participantCount,
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

// Test endpoint for manual daily reset (development only)
router.post('/api/test/daily-reset', async (_req, res): Promise<void> => {
  const jobResult = await executeSchedulerJob(
    'daily-reset-test',
    async () => {
      const imageCollection = createSampleImageCollection();
      const resetResult = await resetDailyGameState(redis, imageCollection);

      if (!resetResult.success) {
        throw new Error(resetResult.error || 'Failed to reset daily game state');
      }

      return {
        date: resetResult.gameState?.date,
        categoryOrder: resetResult.gameState?.categoryOrder,
        roundCount: resetResult.gameState?.imageSet.length,
        participantCount: resetResult.gameState?.participantCount,
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

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
