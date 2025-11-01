/**
 * Smart Image Rotation Manager
 * 
 * Manages image selection to maximize freshness and uniqueness across:
 * - Daily challenges (different images each day)
 * - Multiple user sessions (different images per play attempt)
 * - Cross-user experiences (balanced usage across all images)
 * 
 * Future-ready for API integration to generate images in real-time.
 */

import { redis } from '@devvit/web/server';
import { ImageCategory } from '../../shared/types/api.js';
import { ImageCollection, ImageAsset } from './image-manager.js';
import { getCurrentDateUTC } from './redis-keys.js';

/**
 * Redis keys for image rotation tracking
 */
export const ImageRotationKeys = {
  // Daily image usage tracking
  dailyUsedImages: (date: string) => `daily_used_images:${date}`,
  dailyImagePool: (date: string) => `daily_image_pool:${date}`,
  
  // User session image tracking
  userSessionImages: (userId: string, sessionId: string) => `user_session_images:${userId}:${sessionId}`,
  
  // Global image usage statistics
  globalImageStats: () => 'global_image_stats',
  
  // Image pool management (using hashes instead of sets)
  availableImagePool: (date: string, category: ImageCategory) => `available_pool:${date}:${category}`,
  exhaustedImagePool: (date: string, category: ImageCategory) => `exhausted_pool:${date}:${category}`,
} as const;

/**
 * Image usage statistics
 */
export interface ImageUsageStats {
  imageId: string;
  category: ImageCategory;
  totalUsage: number;
  lastUsed: string; // ISO date
  dailyUsage: { [date: string]: number };
}

/**
 * Image selection result
 */
export interface ImageSelectionResult {
  success: boolean;
  imagePair?: { aiImage: ImageAsset; humanImage: ImageAsset };
  pairId?: string;
  freshness: 'fresh' | 'recent' | 'recycled';
  error?: string;
}

/**
 * Daily image pool configuration
 */
export interface DailyImagePoolConfig {
  maxImagesPerCategory: number; // Max images to use per category per day
  minFreshnessDays: number; // Minimum days before reusing an image
  balanceUsage: boolean; // Whether to balance usage across all images
  prioritizeFreshness: boolean; // Whether to prioritize never-used images
}

export const DEFAULT_POOL_CONFIG: DailyImagePoolConfig = {
  maxImagesPerCategory: 8, // Use up to 8 different image pairs per category per day
  minFreshnessDays: 7, // Don't reuse images for at least 7 days
  balanceUsage: true,
  prioritizeFreshness: true,
};

/**
 * Smart Image Rotation Manager
 */
export class ImageRotationManager {
  private static instance: ImageRotationManager;
  private config: DailyImagePoolConfig;

  private constructor(config: DailyImagePoolConfig = DEFAULT_POOL_CONFIG) {
    this.config = config;
  }

  public static getInstance(config?: DailyImagePoolConfig): ImageRotationManager {
    if (!ImageRotationManager.instance) {
      ImageRotationManager.instance = new ImageRotationManager(config);
    }
    return ImageRotationManager.instance;
  }

  /**
   * Initialize daily image pools for all categories
   */
  public async initializeDailyImagePools(
    collection: ImageCollection,
    date: string = getCurrentDateUTC()
  ): Promise<void> {
    console.log(`🎯 Initializing daily image pools for ${date}`);

    for (const category of Object.values(ImageCategory)) {
      await this.initializeCategoryPool(collection, category, date);
    }

    console.log(`✅ Daily image pools initialized for ${date}`);
  }

  /**
   * Initialize image pool for a specific category
   */
  private async initializeCategoryPool(
    collection: ImageCollection,
    category: ImageCategory,
    date: string
  ): Promise<void> {
    const availablePoolKey = ImageRotationKeys.availableImagePool(date, category);
    const exhaustedPoolKey = ImageRotationKeys.exhaustedImagePool(date, category);

    // Check if pool already exists
    const poolExists = await redis.exists(availablePoolKey);
    if (poolExists) {
      console.log(`📦 Pool already exists for ${category} on ${date}`);
      return;
    }

    // Get all image pairs for this category
    const categoryImages = collection[category] || [];
    const imagePairs = this.extractImagePairs(categoryImages);

    if (imagePairs.length === 0) {
      console.warn(`⚠️ No image pairs found for category ${category}`);
      return;
    }

    // Get usage statistics to determine freshness
    const freshnessSortedPairs = await this.sortPairsByFreshness(imagePairs, date);

    // Select images for today's pool based on configuration
    const selectedPairs = this.selectDailyImagePairs(freshnessSortedPairs);

    // Store available pool using hash (key = pairId, value = timestamp)
    const availablePairIds = selectedPairs.map(pair => pair.pairId);
    if (availablePairIds.length > 0) {
      const poolData: { [key: string]: string } = {};
      availablePairIds.forEach(pairId => {
        poolData[pairId] = Date.now().toString();
      });
      await redis.hSet(availablePoolKey, poolData);
      await redis.expire(availablePoolKey, 25 * 60 * 60); // 25 hours
    }

    // Initialize empty exhausted pool
    await redis.hSet(exhaustedPoolKey, { '_initialized': Date.now().toString() });
    await redis.hDel(exhaustedPoolKey, ['_initialized']);
    await redis.expire(exhaustedPoolKey, 25 * 60 * 60); // 25 hours

    console.log(`📦 Initialized pool for ${category}: ${selectedPairs.length} pairs available`);
  }

  /**
   * Extract image pairs from category images
   */
  private extractImagePairs(categoryImages: ImageAsset[]): Array<{
    pairId: string;
    pairNumber: number;
    aiImage: ImageAsset;
    humanImage: ImageAsset;
  }> {
    const pairs: Array<{
      pairId: string;
      pairNumber: number;
      aiImage: ImageAsset;
      humanImage: ImageAsset;
    }> = [];

    const aiImages = categoryImages.filter(img => img.isAI);
    const humanImages = categoryImages.filter(img => !img.isAI);

    for (const aiImage of aiImages) {
      const aiPairMatch = aiImage.filename.match(/pair(\d+)-ai\./);
      if (!aiPairMatch) continue;

      const pairNumber = parseInt(aiPairMatch[1]!, 10);
      const matchingHuman = humanImages.find(humanImage =>
        humanImage.filename.includes(`pair${pairNumber}-human.`)
      );

      if (matchingHuman) {
        pairs.push({
          pairId: `${aiImage.category}_pair${pairNumber}`,
          pairNumber,
          aiImage,
          humanImage: matchingHuman,
        });
      }
    }

    return pairs;
  }

  /**
   * Sort image pairs by freshness (least recently used first)
   */
  private async sortPairsByFreshness(
    pairs: Array<{
      pairId: string;
      pairNumber: number;
      aiImage: ImageAsset;
      humanImage: ImageAsset;
    }>,
    currentDate: string
  ): Promise<Array<{
    pairId: string;
    pairNumber: number;
    aiImage: ImageAsset;
    humanImage: ImageAsset;
    freshness: 'fresh' | 'recent' | 'stale';
    lastUsed?: string;
    daysSinceUsed?: number;
  }>> {
    const globalStatsKey = ImageRotationKeys.globalImageStats();
    const statsData = await redis.hGetAll(globalStatsKey);

    return pairs.map(pair => {
      const stats = statsData[pair.pairId];
      if (!stats) {
        return { ...pair, freshness: 'fresh' as const };
      }

      const parsedStats: ImageUsageStats = JSON.parse(stats);
      const daysSinceUsed = this.calculateDaysSince(parsedStats.lastUsed, currentDate);

      let freshness: 'fresh' | 'recent' | 'stale';
      if (daysSinceUsed >= this.config.minFreshnessDays) {
        freshness = 'fresh';
      } else if (daysSinceUsed >= 3) {
        freshness = 'recent';
      } else {
        freshness = 'stale';
      }

      return {
        ...pair,
        freshness,
        lastUsed: parsedStats.lastUsed,
        daysSinceUsed,
      };
    }).sort((a, b) => {
      // Sort by freshness priority: fresh > recent > stale
      const freshnessOrder = { fresh: 0, recent: 1, stale: 2 };
      const freshnessCompare = freshnessOrder[a.freshness] - freshnessOrder[b.freshness];
      
      if (freshnessCompare !== 0) return freshnessCompare;
      
      // Within same freshness level, sort by days since used (more days = higher priority)
      const aDays = 'daysSinceUsed' in a ? a.daysSinceUsed || 999 : 999;
      const bDays = 'daysSinceUsed' in b ? b.daysSinceUsed || 999 : 999;
      return bDays - aDays;
    });
  }

  /**
   * Select image pairs for daily pool based on configuration
   */
  private selectDailyImagePairs(
    sortedPairs: Array<{
      pairId: string;
      pairNumber: number;
      aiImage: ImageAsset;
      humanImage: ImageAsset;
      freshness: 'fresh' | 'recent' | 'stale';
    }>
  ): Array<{
    pairId: string;
    pairNumber: number;
    aiImage: ImageAsset;
    humanImage: ImageAsset;
  }> {
    const maxPairs = Math.min(this.config.maxImagesPerCategory, sortedPairs.length);
    
    if (this.config.prioritizeFreshness) {
      // Prioritize fresh images, then recent, then stale
      const fresh = sortedPairs.filter(p => p.freshness === 'fresh');
      const recent = sortedPairs.filter(p => p.freshness === 'recent');
      const stale = sortedPairs.filter(p => p.freshness === 'stale');
      
      const selected = [
        ...fresh.slice(0, maxPairs),
        ...recent.slice(0, Math.max(0, maxPairs - fresh.length)),
        ...stale.slice(0, Math.max(0, maxPairs - fresh.length - recent.length))
      ];
      
      return selected.slice(0, maxPairs);
    } else {
      // Just take the first N pairs (already sorted by freshness)
      return sortedPairs.slice(0, maxPairs);
    }
  }

  /**
   * Select a unique image pair for a user session
   */
  public async selectImagePairForSession(
    collection: ImageCollection,
    category: ImageCategory,
    userId: string,
    sessionId: string,
    date: string = getCurrentDateUTC()
  ): Promise<ImageSelectionResult> {
    try {
      // Initialize pools if they don't exist
      await this.initializeCategoryPool(collection, category, date);

      const availablePoolKey = ImageRotationKeys.availableImagePool(date, category);
      const exhaustedPoolKey = ImageRotationKeys.exhaustedImagePool(date, category);
      const userSessionKey = ImageRotationKeys.userSessionImages(userId, sessionId);

      // Get user's already used images for this session
      const userUsedImagesHash = await redis.hGetAll(userSessionKey);
      const userUsedImages = Object.keys(userUsedImagesHash);

      // Get available images from pool
      const availableImagesHash = await redis.hGetAll(availablePoolKey);
      let availableImages = Object.keys(availableImagesHash);
      
      // Filter out images already used by this user in this session
      availableImages = availableImages.filter((pairId: string) => !userUsedImages.includes(pairId));

      let selectedPairId: string;
      let freshness: 'fresh' | 'recent' | 'recycled' = 'fresh';

      if (availableImages.length > 0) {
        // Select random image from available pool
        selectedPairId = availableImages[Math.floor(Math.random() * availableImages.length)]!;
        freshness = 'fresh';
      } else {
        // Pool exhausted, try exhausted pool (recycled content)
        const exhaustedImagesHash = await redis.hGetAll(exhaustedPoolKey);
        const exhaustedImages = Object.keys(exhaustedImagesHash);
        const recycledOptions = exhaustedImages.filter((pairId: string) => !userUsedImages.includes(pairId));

        if (recycledOptions.length > 0) {
          selectedPairId = recycledOptions[Math.floor(Math.random() * recycledOptions.length)]!;
          freshness = 'recycled';
        } else {
          // Fallback: select any image from collection (shouldn't happen with proper pool sizing)
          const categoryImages = collection[category] || [];
          const imagePairs = this.extractImagePairs(categoryImages);
          
          if (imagePairs.length === 0) {
            return {
              success: false,
              error: `No image pairs available for category ${category}`,
              freshness: 'recycled'
            };
          }

          const fallbackPair = imagePairs[Math.floor(Math.random() * imagePairs.length)]!;
          selectedPairId = fallbackPair.pairId;
          freshness = 'recycled';
        }
      }

      // Find the actual image pair
      const categoryImages = collection[category] || [];
      const imagePairs = this.extractImagePairs(categoryImages);
      const selectedPair = imagePairs.find(pair => pair.pairId === selectedPairId);

      if (!selectedPair) {
        return {
          success: false,
          error: `Selected image pair ${selectedPairId} not found in collection`,
          freshness
        };
      }

      // Move image from available to exhausted pool
      if (freshness === 'fresh') {
        await redis.hDel(availablePoolKey, [selectedPairId]);
        await redis.hSet(exhaustedPoolKey, { [selectedPairId]: Date.now().toString() });
      }

      // Track image usage for this user session
      await redis.hSet(userSessionKey, { [selectedPairId]: Date.now().toString() });
      await redis.expire(userSessionKey, 24 * 60 * 60); // 24 hours

      // Update global usage statistics
      await this.updateImageUsageStats(selectedPairId, category, date);

      console.log(`🎯 Selected ${freshness} image pair for ${category}: ${selectedPairId}`);

      return {
        success: true,
        imagePair: {
          aiImage: selectedPair.aiImage,
          humanImage: selectedPair.humanImage
        },
        pairId: selectedPairId,
        freshness
      };

    } catch (error) {
      console.error('Error selecting image pair for session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        freshness: 'recycled'
      };
    }
  }

  /**
   * Update global image usage statistics
   */
  private async updateImageUsageStats(
    pairId: string,
    category: ImageCategory,
    date: string
  ): Promise<void> {
    const globalStatsKey = ImageRotationKeys.globalImageStats();
    
    try {
      const existingStats = await redis.hGet(globalStatsKey, pairId);
      
      let stats: ImageUsageStats;
      if (existingStats) {
        stats = JSON.parse(existingStats);
        stats.totalUsage += 1;
        stats.lastUsed = date;
        stats.dailyUsage[date] = (stats.dailyUsage[date] || 0) + 1;
      } else {
        stats = {
          imageId: pairId,
          category,
          totalUsage: 1,
          lastUsed: date,
          dailyUsage: { [date]: 1 }
        };
      }

      await redis.hSet(globalStatsKey, { [pairId]: JSON.stringify(stats) });
      
      // Set expiration on the hash (renew each time)
      await redis.expire(globalStatsKey, 30 * 24 * 60 * 60); // 30 days
    } catch (error) {
      console.error('Error updating image usage stats:', error);
    }
  }

  /**
   * Calculate days between two dates
   */
  private calculateDaysSince(fromDate: string, toDate: string): number {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get image usage statistics for monitoring
   */
  public async getImageUsageStats(category?: ImageCategory): Promise<ImageUsageStats[]> {
    const globalStatsKey = ImageRotationKeys.globalImageStats();
    const allStats = await redis.hGetAll(globalStatsKey);
    
    const stats: ImageUsageStats[] = Object.values(allStats).map(stat => JSON.parse(stat));
    
    if (category) {
      return stats.filter(stat => stat.category === category);
    }
    
    return stats;
  }

  /**
   * Reset daily pools (called by daily scheduler)
   */
  public async resetDailyPools(date: string = getCurrentDateUTC()): Promise<void> {
    console.log(`🔄 Resetting daily image pools for ${date}`);
    
    for (const category of Object.values(ImageCategory)) {
      const availablePoolKey = ImageRotationKeys.availableImagePool(date, category);
      const exhaustedPoolKey = ImageRotationKeys.exhaustedImagePool(date, category);
      
      await redis.del(availablePoolKey);
      await redis.del(exhaustedPoolKey);
    }
    
    console.log(`✅ Daily image pools reset for ${date}`);
  }

  /**
   * Get pool status for monitoring
   */
  public async getPoolStatus(date: string = getCurrentDateUTC()): Promise<{
    [category: string]: {
      available: number;
      exhausted: number;
      total: number;
    }
  }> {
    const status: { [category: string]: { available: number; exhausted: number; total: number } } = {};
    
    for (const category of Object.values(ImageCategory)) {
      const availablePoolKey = ImageRotationKeys.availableImagePool(date, category);
      const exhaustedPoolKey = ImageRotationKeys.exhaustedImagePool(date, category);
      
      const available = await redis.hLen(availablePoolKey);
      const exhausted = await redis.hLen(exhaustedPoolKey);
      
      status[category] = {
        available,
        exhausted,
        total: available + exhausted
      };
    }
    
    return status;
  }
}

// Export singleton instance
export const imageRotationManager = ImageRotationManager.getInstance();
