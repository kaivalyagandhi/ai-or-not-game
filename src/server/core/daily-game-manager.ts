import { DailyGameState, GameRound, ImageCategory } from '../../shared/types/api.js';
import type { RedisClient } from '@devvit/web/server';
import {
  ImageCollection,
  ImageAsset,
  assetToImageData,
  getImagesByCategory,
  validateImageCollection,
} from './image-manager.js';
import { DailyGameKeys, getCurrentDateUTC, KEY_EXPIRATION } from './redis-keys.js';

/**
 * Daily Game State Management
 *
 * Handles initialization, randomization, and persistence of daily game content
 */

export interface DailyGameInitializationResult {
  success: boolean;
  gameState?: DailyGameState;
  error?: string;
}

export interface GameRoundGenerationOptions {
  categoryOrder?: ImageCategory[];
  randomizeAIPlacement?: boolean;
  ensureBalance?: boolean;
}

/**
 * Generates randomized category order for daily game
 */
export function generateRandomCategoryOrder(): ImageCategory[] {
  const categories = [...Object.values(ImageCategory)];

  // Fisher-Yates shuffle algorithm
  for (let i = categories.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = categories[i]!;
    categories[i] = categories[j]!;
    categories[j] = temp;
  }

  return categories;
}

/**
 * Selects random image pair from a category
 */
export function selectRandomImagePair(
  collection: ImageCollection,
  category: ImageCategory
): { aiImage: ImageAsset; humanImage: ImageAsset } | null {
  const aiImages = getImagesByCategory(collection, category, true);
  const humanImages = getImagesByCategory(collection, category, false);

  if (aiImages.length === 0 || humanImages.length === 0) {
    return null;
  }

  // Select random AI and human images
  const aiImage = aiImages[Math.floor(Math.random() * aiImages.length)]!;
  const humanImage = humanImages[Math.floor(Math.random() * humanImages.length)]!;

  return { aiImage, humanImage };
}

/**
 * Generates a single game round with randomized AI placement
 */
export function generateGameRound(
  collection: ImageCollection,
  category: ImageCategory,
  roundNumber: number
): GameRound | null {
  const imagePair = selectRandomImagePair(collection, category);

  if (!imagePair) {
    return null;
  }

  // Randomize AI image placement (left or right)
  const aiOnLeft = Math.random() < 0.5;

  const imageA = aiOnLeft ? imagePair.aiImage : imagePair.humanImage;
  const imageB = aiOnLeft ? imagePair.humanImage : imagePair.aiImage;

  return {
    roundNumber,
    category,
    imageA: assetToImageData(imageA),
    imageB: assetToImageData(imageB),
    correctAnswer: aiOnLeft ? 'B' : 'A', // Human image position
    aiImagePosition: aiOnLeft ? 'A' : 'B', // AI image position
  };
}

/**
 * Generates complete set of game rounds for daily game
 */
export function generateDailyGameRounds(
  collection: ImageCollection,
  options: GameRoundGenerationOptions = {}
): GameRound[] {
  const {
    categoryOrder = generateRandomCategoryOrder(),
    randomizeAIPlacement = true,
    ensureBalance = true,
  } = options;

  const rounds: GameRound[] = [];

  // Generate 5 rounds (one per category)
  for (let i = 0; i < 5 && i < categoryOrder.length; i++) {
    const category = categoryOrder[i]!;
    const round = generateGameRound(collection, category, i + 1);

    if (round) {
      rounds.push(round);
    }
  }

  // Ensure we have exactly 5 rounds
  if (rounds.length < 5) {
    throw new Error(`Failed to generate 5 rounds. Only generated ${rounds.length} rounds.`);
  }

  // Optional: Ensure balanced AI placement across rounds
  if (ensureBalance && randomizeAIPlacement) {
    ensureBalancedAIPlacement(rounds);
  }

  return rounds;
}

/**
 * Ensures AI images are not all on the same side
 */
function ensureBalancedAIPlacement(rounds: GameRound[]): void {
  const aiOnLeftCount = rounds.filter((round) => round.aiImagePosition === 'A').length;
  const aiOnRightCount = rounds.filter((round) => round.aiImagePosition === 'B').length;

  // If too imbalanced (more than 4-1 split), rebalance
  if (Math.abs(aiOnLeftCount - aiOnRightCount) > 3) {
    // Find rounds to swap
    const needsRebalancing = aiOnLeftCount > aiOnRightCount ? 'A' : 'B';
    const targetPosition = needsRebalancing === 'A' ? 'B' : 'A';

    // Swap positions for some rounds to achieve better balance
    const roundsToSwap = rounds.filter((round) => round.aiImagePosition === needsRebalancing);
    const swapCount = Math.floor(Math.abs(aiOnLeftCount - aiOnRightCount) / 2);

    for (let i = 0; i < swapCount && i < roundsToSwap.length; i++) {
      const round = roundsToSwap[i]!;

      // Swap image positions
      const tempImage = round.imageA;
      round.imageA = round.imageB;
      round.imageB = tempImage;

      // Update position indicators
      round.aiImagePosition = targetPosition;
      round.correctAnswer = targetPosition === 'A' ? 'B' : 'A';
    }
  }
}

/**
 * Creates daily game state with generated rounds
 */
export function createDailyGameState(
  collection: ImageCollection,
  date?: string,
  options: GameRoundGenerationOptions = {}
): DailyGameState {
  console.log('createDailyGameState: Starting creation...');
  const gameDate = date || getCurrentDateUTC();
  const categoryOrder = options.categoryOrder || generateRandomCategoryOrder();
  console.log('createDailyGameState: Game date:', gameDate, 'Category order:', categoryOrder);

  // Validate image collection before generating rounds
  console.log('createDailyGameState: Validating image collection...');
  const validationResult = validateImageCollection(collection);
  if (!validationResult.isValid) {
    console.error('createDailyGameState: Image collection validation failed:', validationResult.errors);
    throw new Error(`Invalid image collection: ${validationResult.errors.join(', ')}`);
  }
  console.log('createDailyGameState: Image collection validation passed');

  console.log('createDailyGameState: Generating daily game rounds...');
  const imageSet = generateDailyGameRounds(collection, { ...options, categoryOrder });
  console.log('createDailyGameState: Generated', imageSet.length, 'rounds');

  return {
    date: gameDate,
    imageSet,
    participantCount: 0,
    categoryOrder,
  };
}

/**
 * Initializes daily game state with Redis persistence
 */
export async function initializeDailyGameState(
  redis: RedisClient,
  collection: ImageCollection,
  date?: string,
  options: GameRoundGenerationOptions = {}
): Promise<DailyGameInitializationResult> {
  try {
    console.log('initializeDailyGameState: Starting initialization...');
    const gameDate = date || getCurrentDateUTC();
    console.log('initializeDailyGameState: Game date:', gameDate);
    const gameStateKey = DailyGameKeys.gameState(gameDate);
    console.log('initializeDailyGameState: Game state key:', gameStateKey);

    // Check if daily game state already exists
    console.log('initializeDailyGameState: Checking for existing state...');
    const existingState = await redis.get(gameStateKey);
    if (existingState) {
      console.log('initializeDailyGameState: Found existing state, returning it');
      return {
        success: true,
        gameState: JSON.parse(existingState) as DailyGameState,
      };
    }

    // Create new daily game state
    console.log('initializeDailyGameState: Creating new daily game state...');
    const gameState = createDailyGameState(collection, gameDate, options);
    console.log('initializeDailyGameState: Daily game state created successfully');

    // Store in Redis with expiration
    await redis.set(gameStateKey, JSON.stringify(gameState));
    await redis.expire(gameStateKey, KEY_EXPIRATION.DAILY_GAME_STATE);

    // Initialize participant count
    const participantCountKey = DailyGameKeys.participantCount(gameDate);
    await redis.set(participantCountKey, '0');
    await redis.expire(participantCountKey, KEY_EXPIRATION.DAILY_PARTICIPANT_COUNT);

    return {
      success: true,
      gameState,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Retrieves daily game state from Redis
 */
export async function getDailyGameState(
  redis: RedisClient,
  date?: string
): Promise<DailyGameInitializationResult> {
  try {
    const gameDate = date || getCurrentDateUTC();
    const gameStateKey = DailyGameKeys.gameState(gameDate);

    const gameStateData = await redis.get(gameStateKey);

    if (!gameStateData) {
      return {
        success: false,
        error: 'Daily game state not found',
      };
    }

    const gameState = JSON.parse(gameStateData) as DailyGameState;

    return {
      success: true,
      gameState,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve daily game state',
    };
  }
}

/**
 * Updates participant count for daily game
 */
export async function incrementParticipantCount(
  redis: RedisClient,
  date?: string
): Promise<number> {
  const gameDate = date || getCurrentDateUTC();
  const participantCountKey = DailyGameKeys.participantCount(gameDate);

  // Increment and return new count
  const newCount = await redis.incrBy(participantCountKey, 1);

  // Set expiration if this is the first increment
  if (newCount === 1) {
    await redis.expire(participantCountKey, KEY_EXPIRATION.DAILY_PARTICIPANT_COUNT);
  }

  return newCount;
}

/**
 * Gets current participant count for daily game
 */
export async function getParticipantCount(redis: RedisClient, date?: string): Promise<number> {
  const gameDate = date || getCurrentDateUTC();
  const participantCountKey = DailyGameKeys.participantCount(gameDate);

  const count = await redis.get(participantCountKey);
  return count ? parseInt(count, 10) : 0;
}

/**
 * Resets daily game state (for daily reset job)
 */
export async function resetDailyGameState(
  redis: RedisClient,
  collection: ImageCollection,
  date?: string,
  options: GameRoundGenerationOptions = {}
): Promise<DailyGameInitializationResult> {
  try {
    const gameDate = date || getCurrentDateUTC();

    // Delete existing state
    const gameStateKey = DailyGameKeys.gameState(gameDate);
    const participantCountKey = DailyGameKeys.participantCount(gameDate);

    await redis.del(gameStateKey);
    await redis.del(participantCountKey);

    // Initialize new state
    return await initializeDailyGameState(redis, collection, gameDate, options);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset daily game state',
    };
  }
}

/**
 * Validates that daily game state is properly initialized
 */
export function validateDailyGameState(gameState: DailyGameState): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate date format
  if (!gameState.date || !/^\d{4}-\d{2}-\d{2}$/.test(gameState.date)) {
    errors.push('Invalid date format. Expected YYYY-MM-DD');
  }

  // Validate image set
  if (!gameState.imageSet || !Array.isArray(gameState.imageSet)) {
    errors.push('Image set is required and must be an array');
  } else {
    if (gameState.imageSet.length !== 5) {
      errors.push('Image set must contain exactly 5 rounds');
    }

    // Validate each round
    gameState.imageSet.forEach((round, index) => {
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

  // Validate participant count
  if (typeof gameState.participantCount !== 'number' || gameState.participantCount < 0) {
    errors.push('Participant count must be a non-negative number');
  }

  // Validate category order
  if (!gameState.categoryOrder || !Array.isArray(gameState.categoryOrder)) {
    errors.push('Category order is required and must be an array');
  } else {
    const expectedCategories = Object.values(ImageCategory);
    if (gameState.categoryOrder.length !== expectedCategories.length) {
      errors.push('Category order must contain all image categories');
    }

    const missingCategories = expectedCategories.filter(
      (cat) => !gameState.categoryOrder.includes(cat)
    );
    if (missingCategories.length > 0) {
      errors.push(`Missing categories in category order: ${missingCategories.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
