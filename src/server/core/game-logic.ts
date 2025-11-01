/**
 * Core Game Logic and Round Management
 *
 * This module handles game initialization, round progression logic,
 * and validation to ensure proper game flow and prevent cheating.
 */

import { redis, reddit } from '@devvit/web/server';
import {
  GameSession,
  GameRound,
  BadgeType,
  GameInitResponse,
  StartGameResponse,
  SubmitAnswerResponse,
  ImageCategory,
} from '../../shared/types/api.js';
import {
  createGameSession,
  getGameSession,
  updateGameSession,
  hasUserPlayedToday,
  getUserDailyCompletion,
  markDailyCompleted,
  SessionError,
} from './session-manager.js';
import {
  getDailyGameState,
  incrementParticipantCount,
  initializeDailyGameState,
} from './daily-game-manager.js';
import { createImageCollection } from './image-loader.js';
import {
  generateDailyGameRounds,
  generateRandomCategoryOrder,
  GameRoundGenerationOptions,
} from './daily-game-manager.js';
import { addScoreToLeaderboards } from './leaderboard-manager.js';
import { determineBadge } from './badge-manager.js';
import {
  canUserPlay,
  incrementUserAttempts,
  updateBestScore,
  getUserPlayStats,
} from './play-limit-manager.js';

/**
 * Game Logic Errors
 */
export class GameLogicError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'GameLogicError';
  }
}

export const GAME_LOGIC_ERROR_CODES = {
  INVALID_USER_ID: 'INVALID_USER_ID',
  INVALID_SESSION_ID: 'INVALID_SESSION_ID',
  GAME_NOT_INITIALIZED: 'GAME_NOT_INITIALIZED',
  DAILY_GAME_NOT_AVAILABLE: 'DAILY_GAME_NOT_AVAILABLE',
  ALREADY_COMPLETED: 'ALREADY_COMPLETED',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  INVALID_GAME_STATE: 'INVALID_GAME_STATE',
  REDIS_ERROR: 'REDIS_ERROR',
} as const;

/**
 * Initialize game for a user - check if they can play and return appropriate response
 */
export async function initializeGame(userId: string): Promise<GameInitResponse> {
  try {
    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      return {
        success: false,
        error: 'Invalid user ID',
      };
    }

    // Check play limits first
    const playLimitCheck = await canUserPlay(userId);
    if (!playLimitCheck.canPlay && playLimitCheck.remainingAttempts === 0) {
      // User has reached daily limit, return their best results
      const playStats = await getUserPlayStats(userId);
      if (playStats.bestAttempt && playStats.bestScore > 0) {
        return {
          success: true,
          session: playStats.bestAttempt,
        };
      } else {
        return {
          success: false,
          error: 'Daily play limit reached. Try again tomorrow!',
        };
      }
    }

    // Check if user has already played today (legacy check for backward compatibility)
    const hasPlayed = await hasUserPlayedToday(userId);
    if (hasPlayed) {
      // Return their existing completion data
      const completionData = await getUserDailyCompletion(userId);
      if (completionData && typeof completionData === 'object') {
        const data = completionData as {
          sessionId: string;
          completedAt: number;
          totalScore: number;
          correctCount: number;
          badge: BadgeType;
        };

        // Create a mock session object with their results
        const completedSession: GameSession = {
          userId,
          sessionId: data.sessionId,
          startTime: data.completedAt,
          rounds: [], // Don't need to return full rounds for completed games
          totalScore: data.totalScore,
          correctCount: data.correctCount,
          totalTimeBonus: 0, // Will be calculated from totalScore - correctCount
          badge: data.badge,
          completed: true,
          attemptNumber: 1, // Default to first attempt for existing completions
          showedEducationalContent: false, // Default for existing completions
        };

        return {
          success: true,
          session: completedSession,
        };
      }
    }

    // Check if daily game is available, initialize if needed
    let dailyGameResult = await getDailyGameState(redis);

    // Check if existing state uses sample images or mismatched pairs and force refresh if so
    if (dailyGameResult.success && dailyGameResult.gameState) {
      const firstRound = dailyGameResult.gameState.imageSet[0];
      const shouldClearCache =
        firstRound &&
        (firstRound.imageA.url.includes('example.com') || // Sample images
          firstRound.imageB.url.includes('example.com') || // Sample images
          !arePairsMatched(firstRound)); // Mismatched pairs

      if (shouldClearCache) {
        console.log(
          'Detected outdated cached state (sample images or mismatched pairs), clearing cache...'
        );
        const today = new Date().toISOString().split('T')[0];
        const gameStateKey = `daily_game:${today}`;
        const participantCountKey = `daily_participants:${today}`;
        await redis.del(gameStateKey);
        await redis.del(participantCountKey);
        console.log('Cleared cached daily game state');
        dailyGameResult = { success: false, error: 'Cache cleared' };
      }
    }

    if (!dailyGameResult.success || !dailyGameResult.gameState) {
      console.log('Daily game state not found, initializing...');

      // Initialize daily game state with image collection
      try {
        console.log('Creating image collection from uploaded images...');
        const imageCollection = createImageCollection();
        console.log('Image collection created successfully from uploaded images');

        // Log collection stats
        for (const [category, images] of Object.entries(imageCollection)) {
          if (Array.isArray(images)) {
            console.log(`Category ${category}: ${images.length} images`);
          }
        }

        console.log('Initializing daily game state...');
        dailyGameResult = await initializeDailyGameState(redis, imageCollection);

        if (!dailyGameResult.success || !dailyGameResult.gameState) {
          console.error('Daily game state initialization failed:', dailyGameResult.error);
          return {
            success: false,
            error: `Daily game initialization failed: ${dailyGameResult.error}`,
          };
        }

        console.log('Daily game state initialized successfully');
      } catch (error) {
        console.error('Exception during game initialization:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return {
          success: false,
          error: `Game initialization exception: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }

      console.log('Daily game state initialized successfully');
    }

    // User can play - return success with no session (they need to start the game)
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error initializing game:', error);

    if (error instanceof SessionError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Failed to initialize game. Please try again.',
    };
  }
}

/**
 * Start a new game session for a user
 */
export async function startGame(userId: string): Promise<StartGameResponse> {
  try {
    // Validate user ID
    if (!userId || typeof userId !== 'string') {
      return {
        success: false,
        error: 'Invalid user ID',
      };
    }

    // Check play limits
    const playLimitCheck = await canUserPlay(userId);
    if (!playLimitCheck.canPlay) {
      return {
        success: false,
        error: playLimitCheck.reason || 'Cannot start new game',
      };
    }

    // Increment user's attempt count
    try {
      await incrementUserAttempts(userId);
    } catch (error) {
      console.error('Error incrementing user attempts:', error);
      return {
        success: false,
        error: 'Failed to start game. Please try again.',
      };
    }

    // Get daily game state, initialize if needed
    let dailyGameResult = await getDailyGameState(redis);

    // Check if existing state uses sample images or mismatched pairs and force refresh if so
    if (dailyGameResult.success && dailyGameResult.gameState) {
      const firstRound = dailyGameResult.gameState.imageSet[0];
      const shouldClearCache =
        firstRound &&
        (firstRound.imageA.url.includes('example.com') || // Sample images
          firstRound.imageB.url.includes('example.com') || // Sample images
          !arePairsMatched(firstRound)); // Mismatched pairs

      if (shouldClearCache) {
        console.log(
          'Detected outdated cached state during start game (sample images or mismatched pairs), clearing cache...'
        );
        const today = new Date().toISOString().split('T')[0];
        const gameStateKey = `daily_game:${today}`;
        const participantCountKey = `daily_participants:${today}`;
        await redis.del(gameStateKey);
        await redis.del(participantCountKey);
        console.log('Cleared cached daily game state during start game');
        dailyGameResult = { success: false, error: 'Cache cleared' };
      }
    }

    if (!dailyGameResult.success || !dailyGameResult.gameState) {
      console.log('Daily game state not found during start game, initializing...');

      // Initialize daily game state with image collection
      try {
        console.log('Creating image collection from uploaded images during start game...');
        const imageCollection = createImageCollection();
        console.log('Image collection created successfully from uploaded images during start game');

        console.log('Initializing daily game state during start game...');
        dailyGameResult = await initializeDailyGameState(redis, imageCollection);

        if (!dailyGameResult.success || !dailyGameResult.gameState) {
          console.error(
            'Daily game state initialization failed during start game:',
            dailyGameResult.error
          );
          return {
            success: false,
            error: `Daily game initialization failed: ${dailyGameResult.error}`,
          };
        }

        console.log('Daily game state initialized successfully during start game');
      } catch (error) {
        console.error('Exception during start game initialization:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return {
          success: false,
          error: `Start game initialization exception: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }

      console.log('Daily game state initialized successfully during start game');
    }

    const { gameState } = dailyGameResult;

    // Create new game session
    const session = await createGameSession(userId);

    // Generate unique content for this session instead of using daily state
    const uniqueRounds = await generateUniqueSessionRounds(userId, session.sessionId);
    session.rounds = uniqueRounds;

    // Update session in Redis
    await updateGameSession(session);

    // Increment participant count
    await incrementParticipantCount(redis);

    // Return first round
    const firstRound = session.rounds[0];
    if (!firstRound) {
      return {
        success: false,
        error: "No rounds available for today's game",
      };
    }

    // Record start time for the first round
    await recordRoundStart(session.sessionId, 1);

    return {
      success: true,
      sessionId: session.sessionId,
      currentRound: firstRound,
    };
  } catch (error) {
    console.error('Error starting game:', error);

    if (error instanceof SessionError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Failed to start game. Please try again.',
    };
  }
}

/**
 * Get current round for an active session
 */
export async function getCurrentRound(
  userId: string,
  sessionId: string
): Promise<GameRound | null> {
  try {
    // Get session
    const session = await getGameSession(userId, sessionId);
    if (!session) {
      throw new GameLogicError('Session not found', GAME_LOGIC_ERROR_CODES.SESSION_NOT_FOUND);
    }

    // Check if game is completed
    if (session.completed) {
      return null; // Game is finished
    }

    // Find the next unanswered round
    const currentRound = session.rounds.find((round) => round.userAnswer === undefined);
    return currentRound || null;
  } catch (error) {
    console.error('Error getting current round:', error);
    throw error;
  }
}

/**
 * Validate game session state
 */
export function validateGameSession(session: GameSession): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate basic session properties
  if (!session.userId || typeof session.userId !== 'string') {
    errors.push('Invalid user ID');
  }

  if (!session.sessionId || typeof session.sessionId !== 'string') {
    errors.push('Invalid session ID');
  }

  if (!session.startTime || typeof session.startTime !== 'number') {
    errors.push('Invalid start time');
  }

  // Validate rounds
  if (!Array.isArray(session.rounds)) {
    errors.push('Rounds must be an array');
  } else {
    if (session.rounds.length !== 6) {
      errors.push('Session must have exactly 6 rounds');
    }

    // Validate each round
    session.rounds.forEach((round, index) => {
      if (round.roundNumber !== index + 1) {
        errors.push(`Round ${index + 1} has incorrect round number: ${round.roundNumber}`);
      }

      if (!round.imageA || !round.imageB) {
        errors.push(`Round ${index + 1} is missing images`);
      }

      if (!['A', 'B'].includes(round.correctAnswer)) {
        errors.push(`Round ${index + 1} has invalid correct answer: ${round.correctAnswer}`);
      }

      if (!['A', 'B'].includes(round.aiImagePosition)) {
        errors.push(`Round ${index + 1} has invalid AI image position: ${round.aiImagePosition}`);
      }
    });
  }

  // Validate score fields
  if (typeof session.totalScore !== 'number' || session.totalScore < 0) {
    errors.push('Invalid total score');
  }

  if (
    typeof session.correctCount !== 'number' ||
    session.correctCount < 0 ||
    session.correctCount > 6
  ) {
    errors.push('Invalid correct count');
  }

  if (typeof session.totalTimeBonus !== 'number' || session.totalTimeBonus < 0) {
    errors.push('Invalid time bonus');
  }

  // Validate badge
  if (!Object.values(BadgeType).includes(session.badge)) {
    errors.push('Invalid badge type');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a session is in a valid state for gameplay
 */
export function isSessionPlayable(session: GameSession): boolean {
  // Session must not be completed
  if (session.completed) {
    return false;
  }

  // Session must have unanswered rounds
  const unansweredRounds = session.rounds.filter((round) => round.userAnswer === undefined);
  return unansweredRounds.length > 0;
}

/**
 * Get game progress for a session
 */
export function getGameProgress(session: GameSession): {
  currentRoundNumber: number;
  totalRounds: number;
  answeredRounds: number;
  remainingRounds: number;
  isComplete: boolean;
} {
  const totalRounds = session.rounds.length;
  const answeredRounds = session.rounds.filter((round) => round.userAnswer !== undefined).length;
  const remainingRounds = totalRounds - answeredRounds;
  const isComplete = session.completed || remainingRounds === 0;
  const currentRoundNumber = answeredRounds + 1;

  return {
    currentRoundNumber: Math.min(currentRoundNumber, totalRounds),
    totalRounds,
    answeredRounds,
    remainingRounds,
    isComplete,
  };
}

/**
 * Validate that a user can make a move (anti-cheat)
 */
export async function validateUserCanPlay(
  userId: string,
  sessionId: string
): Promise<{
  canPlay: boolean;
  reason?: string;
  session?: GameSession;
}> {
  try {
    // Get session
    const session = await getGameSession(userId, sessionId);
    if (!session) {
      return {
        canPlay: false,
        reason: 'Session not found',
      };
    }

    // Validate session integrity
    const validation = validateGameSession(session);
    if (!validation.isValid) {
      return {
        canPlay: false,
        reason: `Invalid session: ${validation.errors.join(', ')}`,
      };
    }

    // Check if session is playable
    if (!isSessionPlayable(session)) {
      return {
        canPlay: false,
        reason: 'Game session is not in a playable state',
        session,
      };
    }

    // Check session timing (prevent sessions that are too old)
    const sessionAge = Date.now() - session.startTime;
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
    if (sessionAge > maxSessionAge) {
      return {
        canPlay: false,
        reason: 'Session has expired',
      };
    }

    return {
      canPlay: true,
      session,
    };
  } catch (error) {
    console.error('Error validating user can play:', error);
    return {
      canPlay: false,
      reason: 'Validation error occurred',
    };
  }
}

/**
 * Calculate score for a round based on correctness and time remaining
 * Uses tier-based scoring system with whole numbers only
 */
export function calculateRoundScore(isCorrect: boolean, timeRemaining: number): number {
  if (!isCorrect) {
    return 0; // No points for incorrect answers
  }

  const correctnessPoints = 10; // Base points for correct answer

  // Tier-based time bonus (convert milliseconds to seconds)
  const secondsRemaining = Math.floor(timeRemaining / 1000);
  let timeBonus = 0;

  if (secondsRemaining >= 7) {
    timeBonus = 5;
  } else if (secondsRemaining >= 4) {
    timeBonus = 3;
  } else if (secondsRemaining >= 1) {
    timeBonus = 1;
  }
  // 0 seconds remaining = 0 bonus points

  return correctnessPoints + timeBonus;
}

/**
 * Enhanced server-side timer validation
 */
async function validateRoundTiming(
  userId: string,
  sessionId: string,
  roundNumber: number,
  timeRemaining: number
): Promise<{ isValid: boolean; error?: string; adjustedTime?: number }> {
  try {
    // Get round start time from Redis
    const roundStartKey = `round_start:${sessionId}:${roundNumber}`;
    const roundStartTime = await redis.get(roundStartKey);

    if (!roundStartTime) {
      // If no start time recorded, this might be the first submission for this round
      // This can happen after educational content when the client resumes
      console.log(`No start time recorded for round ${roundNumber}, allowing submission`);

      // Record the current time as the start time for future validations
      const currentTime = Date.now();
      await redis.set(roundStartKey, currentTime.toString());
      await redis.expire(roundStartKey, 300); // 5 minute expiry

      // Allow this submission with basic time validation
      if (timeRemaining < 0 || timeRemaining > 10000) {
        return {
          isValid: false,
          error: 'Invalid time remaining',
          adjustedTime: Math.max(0, Math.min(10000, timeRemaining)),
        };
      }

      // Return valid with the submitted time
      return { isValid: true, adjustedTime: timeRemaining };
    }

    const startTime = parseInt(roundStartTime, 10);
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const maxRoundTime = 15000; // 15 seconds max (10 + 5 buffer for network delays)

    // Check if too much time has elapsed
    if (elapsedTime > maxRoundTime) {
      return {
        isValid: false,
        error: 'Round timeout - too much time elapsed',
        adjustedTime: 0,
      };
    }

    // Calculate expected time remaining
    const expectedTimeRemaining = Math.max(0, 10000 - elapsedTime);
    const timeDifference = Math.abs(timeRemaining - expectedTimeRemaining);
    const tolerance = 3000; // 3 second tolerance for network delays and client-server sync

    // If time difference is too large, adjust to server time
    if (timeDifference > tolerance) {
      console.warn(`Timer validation: Large time difference detected`, {
        userId,
        sessionId,
        roundNumber,
        clientTime: timeRemaining,
        serverTime: expectedTimeRemaining,
        difference: timeDifference,
        elapsedTime,
      });

      // Use server-calculated time but don't fail the request
      return {
        isValid: true,
        adjustedTime: expectedTimeRemaining,
      };
    }

    return { isValid: true, adjustedTime: timeRemaining };
  } catch (error) {
    console.error('Timer validation error:', error);
    // On error, allow the submission but use a conservative time
    return { isValid: true, adjustedTime: Math.min(timeRemaining, 5000) };
  }
}

/**
 * Records round start time for server-side validation
 */
export async function recordRoundStart(sessionId: string, roundNumber: number): Promise<void> {
  try {
    const roundStartKey = `round_start:${sessionId}:${roundNumber}`;
    const startTime = Date.now();

    // Store with 5 minute expiry
    await redis.set(roundStartKey, startTime.toString());
    await redis.expire(roundStartKey, 300); // 5 minute expiry
  } catch (error) {
    console.error('Error recording round start:', error);
    // Non-critical error, don't throw
  }
}

/**
 * Submit answer for a round and get immediate feedback
 */
export async function submitAnswer(
  userId: string,
  sessionId: string,
  roundNumber: number,
  userAnswer: 'A' | 'B',
  timeRemaining: number
): Promise<SubmitAnswerResponse> {
  try {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      return {
        success: false,
        error: 'Invalid user ID',
      };
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return {
        success: false,
        error: 'Invalid session ID',
      };
    }

    if (typeof roundNumber !== 'number' || roundNumber < 1 || roundNumber > 6) {
      return {
        success: false,
        error: 'Invalid round number',
      };
    }

    if (!['A', 'B'].includes(userAnswer)) {
      return {
        success: false,
        error: 'Invalid answer. Must be A or B',
      };
    }

    if (typeof timeRemaining !== 'number' || timeRemaining < 0) {
      return {
        success: false,
        error: 'Invalid time remaining',
      };
    }

    // Validate user can play
    const validation = await validateUserCanPlay(userId, sessionId);
    if (!validation.canPlay || !validation.session) {
      return {
        success: false,
        error: validation.reason || 'Cannot submit answer',
      };
    }

    const session = validation.session;

    // Find the round
    const round = session.rounds.find((r) => r.roundNumber === roundNumber);
    if (!round) {
      return {
        success: false,
        error: 'Round not found',
      };
    }

    // Check if round was already answered
    if (round.userAnswer !== undefined) {
      return {
        success: false,
        error: 'Round already answered',
      };
    }

    // Enhanced server-side timer validation
    const timerValidation = await validateRoundTiming(
      userId,
      sessionId,
      roundNumber,
      timeRemaining
    );
    if (!timerValidation.isValid) {
      return {
        success: false,
        error: timerValidation.error || 'Timer validation failed',
      };
    }

    // Use server-validated time
    const validatedTimeRemaining = timerValidation.adjustedTime || timeRemaining;

    // Process the answer
    const isCorrect = userAnswer === round.correctAnswer;
    const roundScore = calculateRoundScore(isCorrect, validatedTimeRemaining);

    // Update round with user's answer (use validated time)
    round.userAnswer = userAnswer;
    round.timeRemaining = validatedTimeRemaining;
    round.isCorrect = isCorrect;

    // Update session scores
    if (isCorrect) {
      session.correctCount += 1;
      // Calculate time bonus using tier-based system
      const secondsRemaining = Math.floor(validatedTimeRemaining / 1000);
      let timeBonus = 0;
      if (secondsRemaining >= 7) {
        timeBonus = 5;
      } else if (secondsRemaining >= 4) {
        timeBonus = 3;
      } else if (secondsRemaining >= 1) {
        timeBonus = 1;
      }
      session.totalTimeBonus += timeBonus;
    }
    session.totalScore += roundScore;

    // Check if game is complete
    const answeredRounds = session.rounds.filter((r) => r.userAnswer !== undefined).length;
    const gameComplete = answeredRounds === 6;

    let finalResults;
    if (gameComplete) {
      // Calculate final badge
      session.badge = determineBadge(session.correctCount);
      session.completed = true;

      finalResults = {
        totalScore: session.totalScore,
        correctCount: session.correctCount,
        timeBonus: session.totalTimeBonus,
        badge: session.badge,
      };

      // Mark daily completion and add to leaderboards
      await markDailyCompleted(userId, session);

      // Update best score in play limit tracking
      try {
        await updateBestScore(userId, session);
      } catch (error) {
        console.error('Error updating best score:', error);
        // Don't fail the game completion if best score update fails
      }

      // Add to leaderboards
      const username = await getCurrentUsername();
      await addScoreToLeaderboards(
        userId,
        username,
        session.totalScore,
        session.correctCount,
        session.totalTimeBonus,
        session.badge,
        Date.now()
      );
    }

    // Update session in Redis
    await updateGameSession(session);

    // Get next round if game is not complete
    let nextRound;
    if (!gameComplete) {
      nextRound = session.rounds.find((r) => r.userAnswer === undefined);

      // Record start time for the next round, but skip round 4 if educational content will be shown
      if (nextRound) {
        const shouldShowEducational =
          roundNumber === 3 && nextRound.roundNumber === 4 && !session.showedEducationalContent;
        if (!shouldShowEducational) {
          await recordRoundStart(session.sessionId, nextRound.roundNumber);
        } else {
          console.log('Skipping round start time recording for round 4 due to educational content');
        }
      }
    }

    const response: SubmitAnswerResponse = {
      success: true,
      isCorrect,
      correctAnswer: round.correctAnswer,
      aiImagePosition: round.aiImagePosition,
      roundScore,
      gameComplete,
    };

    if (nextRound) {
      response.nextRound = nextRound;
    }

    if (finalResults) {
      response.finalResults = finalResults;
    }

    return response;
  } catch (error) {
    console.error('Error submitting answer:', error);

    if (error instanceof SessionError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: 'Failed to submit answer. Please try again.',
    };
  }
}

/**
 * Check if images in a round are from the same pair
 */
function arePairsMatched(round: GameRound): boolean {
  const imageAMatch = round.imageA.url.match(/pair(\d+)-/);
  const imageBMatch = round.imageB.url.match(/pair(\d+)-/);

  if (!imageAMatch || !imageBMatch) {
    return false; // Can't determine pair numbers
  }

  const pairA = imageAMatch[1];
  const pairB = imageBMatch[1];

  return pairA === pairB;
}

/**
 * Get user's current username from Reddit
 */
export async function getCurrentUsername(): Promise<string> {
  try {
    const username = await reddit.getCurrentUsername();
    return username || 'anonymous';
  } catch (error) {
    console.error('Error getting current username:', error);
    return 'anonymous';
  }
}

/**
 * Generate unique rounds for a specific session
 * This ensures each play attempt has different images and content
 */
async function generateUniqueSessionRounds(
  userId: string,
  sessionId: string
): Promise<GameRound[]> {
  try {
    console.log(`🎯 Generating unique rounds with smart rotation for user ${userId}, session ${sessionId}`);

    // Create image collection
    const imageCollection = createImageCollection();

    // Create a unique seed based on user ID and session ID
    const sessionSeed = `${userId}-${sessionId}-${Date.now()}`;
    const seedHash = hashString(sessionSeed);

    // Use the seed to create a deterministic but unique random order
    const randomGen = createSeededRandom(seedHash);

    // Generate unique category order for this session
    const categoryOrder = generateRandomCategoryOrderWithSeed(randomGen);

    console.log(`Generated unique category order for session ${sessionId}:`, categoryOrder);

    // Try to generate rounds with smart image rotation first
    try {
      const { generateSmartGameRounds } = await import('./daily-game-manager.js');
      const smartRounds = await generateSmartGameRounds(imageCollection, userId, sessionId, {
        categoryOrder,
        randomizeAIPlacement: true,
        ensureBalance: true,
      });

      console.log(`✅ Generated ${smartRounds.length} smart unique rounds for session ${sessionId}`);
      return smartRounds;
    } catch (smartError) {
      console.warn('⚠️ Smart image rotation failed, falling back to random selection:', smartError);
      
      // Fallback to regular random generation
      const rounds = generateDailyGameRounds(imageCollection, {
        categoryOrder,
        randomizeAIPlacement: true,
        ensureBalance: true,
      });

      console.log(`📦 Generated ${rounds.length} fallback unique rounds for session ${sessionId}`);
      return rounds;
    }
  } catch (error) {
    console.error('❌ Error generating unique session rounds:', error);

    // Fallback to daily game state if unique generation fails
    console.log('🔄 Falling back to daily game state for session rounds');
    const dailyGameResult = await getDailyGameState(redis);
    if (dailyGameResult.success && dailyGameResult.gameState) {
      return [...dailyGameResult.gameState.imageSet];
    }

    throw new Error('Failed to generate session rounds and no daily state available');
  }
}

/**
 * Simple hash function for strings
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Create a seeded random number generator
 */
function createSeededRandom(seed: number) {
  let state = seed;
  return function () {
    state = (state * 1664525 + 1013904223) % Math.pow(2, 32);
    return state / Math.pow(2, 32);
  };
}

/**
 * Generate random category order with a seeded random function
 */
function generateRandomCategoryOrderWithSeed(randomFn: () => number): ImageCategory[] {
  // Import ImageCategory from the already imported types
  const categories = [...Object.values(ImageCategory)];

  // Fisher-Yates shuffle with seeded random
  for (let i = categories.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    const temp = categories[i]!;
    categories[i] = categories[j]!;
    categories[j] = temp;
  }

  return categories;
}
