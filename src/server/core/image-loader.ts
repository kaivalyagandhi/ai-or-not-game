/**
 * Dynamic Image Loader
 *
 * Loads image pairs from the organized folder structure and creates
 * ImageCollection objects for use in the daily game system.
 */

import { ImageCategory } from '../../shared/types/api.js';
import { ImageAsset, ImageCollection } from './image-manager.js';

/**
 * Configuration for image loading
 */
export interface ImageLoaderConfig {
  baseUrl: string; // Base URL for serving images (e.g., '/images')
  supportedExtensions: string[];
  maxPairsPerCategory?: number;
}

/**
 * Default configuration
 */
export const DEFAULT_IMAGE_CONFIG: ImageLoaderConfig = {
  baseUrl: '/images',
  supportedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  maxPairsPerCategory: 50, // Reasonable limit
};

/**
 * Represents a discovered image pair
 */
export interface ImagePair {
  pairNumber: number;
  category: ImageCategory;
  humanImage: ImageAsset;
  aiImage: ImageAsset;
}

/**
 * Result of image discovery process
 */
export interface ImageDiscoveryResult {
  success: boolean;
  pairs: ImagePair[];
  errors: string[];
  warnings: string[];
}

/**
 * Creates an ImageAsset from file information
 */
function createImageAsset(
  category: ImageCategory,
  pairNumber: number,
  isAI: boolean,
  filename: string,
  config: ImageLoaderConfig
): ImageAsset {
  const categoryPath = category.toLowerCase();
  const url = `${config.baseUrl}/${categoryPath}/${filename}`;
  const imageType = isAI ? 'ai' : 'human';

  return {
    id: `${category}_${imageType}_pair${pairNumber}`,
    filename,
    category,
    isAI,
    url,
    metadata: {
      source: isAI ? 'AI Generated' : 'Human Created',
      description: `${isAI ? 'AI generated' : 'Human created'} ${category} image - pair ${pairNumber}`,
      dateAdded: new Date().toISOString(),
    },
  };
}

/**
 * Parses filename to extract pair information
 */
export function parseImageFilename(filename: string): {
  pairNumber: number;
  isAI: boolean;
  isValid: boolean;
} {
  // Expected format: pair{number}-{human|ai}.{ext}
  const match = filename.match(/^pair(\d+)-(human|ai)\.(jpg|jpeg|png|webp)$/i);

  if (!match) {
    return { pairNumber: 0, isAI: false, isValid: false };
  }

  const pairNumber = parseInt(match[1]!, 10);
  const type = match[2]!.toLowerCase();
  const isAI = type === 'ai';

  return {
    pairNumber,
    isAI,
    isValid: true,
  };
}

/**
 * Discovers image pairs from the expected folder structure
 *
 * This function simulates file system discovery. In a real implementation,
 * you would scan the actual file system or have a manifest file.
 */
export function discoverImagePairs(
  category: ImageCategory,
  config: ImageLoaderConfig = DEFAULT_IMAGE_CONFIG
): ImageDiscoveryResult {
  const pairs: ImagePair[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log(`Discovering image pairs for category: ${category}`);

  // For now, we'll create a placeholder structure that expects
  // users to upload files following the naming convention

  // This is a placeholder - in a real implementation, you would:
  // 1. Read the actual file system
  // 2. Or maintain a manifest file
  // 3. Or use a database to track uploaded images

  // For development, let's create some example pairs
  const examplePairs = generateExamplePairs(category, config);
  pairs.push(...examplePairs);

  console.log(`Generated ${pairs.length} example pairs for category: ${category}`);

  if (pairs.length === 0) {
    warnings.push(`No image pairs found for category: ${category}`);
  }

  return {
    success: errors.length === 0,
    pairs,
    errors,
    warnings,
  };
}

/**
 * Generates example image pairs for development/testing
 *
 * This creates placeholder pairs that follow the expected structure.
 * Replace this with actual file discovery in production.
 */
function generateExamplePairs(category: ImageCategory, config: ImageLoaderConfig): ImagePair[] {
  const pairs: ImagePair[] = [];

  // Create 3 example pairs per category for development
  for (let i = 1; i <= 3; i++) {
    const humanFilename = `pair${i}-human.jpg`;
    const aiFilename = `pair${i}-ai.jpg`;

    const humanImage = createImageAsset(category, i, false, humanFilename, config);
    const aiImage = createImageAsset(category, i, true, aiFilename, config);

    pairs.push({
      pairNumber: i,
      category,
      humanImage,
      aiImage,
    });
  }

  return pairs;
}

/**
 * Loads all image pairs for all categories
 */
export function loadAllImagePairs(
  config: ImageLoaderConfig = DEFAULT_IMAGE_CONFIG
): ImageCollection {
  const collection: ImageCollection = {
    [ImageCategory.ANIMALS]: [],
    [ImageCategory.ARCHITECTURE]: [],
    [ImageCategory.NATURE]: [],
    [ImageCategory.FOOD]: [],
    [ImageCategory.PRODUCTS]: [],
  };

  // Discover pairs for each category
  for (const category of Object.values(ImageCategory)) {
    const discovery = discoverImagePairs(category, config);

    if (discovery.success && discovery.pairs.length > 0) {
      // Add all images from pairs to the collection
      for (const pair of discovery.pairs) {
        collection[category].push(pair.humanImage);
        collection[category].push(pair.aiImage);
      }
    } else {
      console.warn(`Failed to load images for category ${category}:`, discovery.errors);
    }
  }

  return collection;
}

/**
 * Validates that image pairs are properly matched
 */
export function validateImagePairs(pairs: ImagePair[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  for (const pair of pairs) {
    // Check that both images exist
    if (!pair.humanImage || !pair.aiImage) {
      errors.push(`Pair ${pair.pairNumber} in ${pair.category} is missing images`);
      continue;
    }

    // Check that categories match
    if (pair.humanImage.category !== pair.category || pair.aiImage.category !== pair.category) {
      errors.push(`Pair ${pair.pairNumber} has category mismatch`);
    }

    // Check that AI flags are correct
    if (pair.humanImage.isAI !== false) {
      errors.push(`Pair ${pair.pairNumber} human image has incorrect AI flag`);
    }

    if (pair.aiImage.isAI !== true) {
      errors.push(`Pair ${pair.pairNumber} AI image has incorrect AI flag`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a production-ready image collection
 *
 * This function should be called during app initialization to load
 * all available image pairs from the file system.
 */
export function createImageCollection(
  config: ImageLoaderConfig = DEFAULT_IMAGE_CONFIG
): ImageCollection {
  console.log('Loading image collection from:', config.baseUrl);

  const collection = loadAllImagePairs(config);

  // Log statistics and validate
  for (const category of Object.values(ImageCategory)) {
    const categoryImages = collection[category];
    const humanCount = categoryImages.filter((img) => !img.isAI).length;
    const aiCount = categoryImages.filter((img) => img.isAI).length;

    console.log(
      `Category ${category}: ${humanCount} human, ${aiCount} AI images (total: ${categoryImages.length})`
    );

    if (categoryImages.length === 0) {
      console.warn(`Warning: No images found for category ${category}`);
    }
    if (humanCount === 0) {
      console.warn(`Warning: No human images found for category ${category}`);
    }
    if (aiCount === 0) {
      console.warn(`Warning: No AI images found for category ${category}`);
    }
  }

  return collection;
}

/**
 * Utility function to get available pair numbers for a category
 */
export function getAvailablePairs(
  category: ImageCategory,
  config: ImageLoaderConfig = DEFAULT_IMAGE_CONFIG
): number[] {
  const discovery = discoverImagePairs(category, config);
  return discovery.pairs.map((pair) => pair.pairNumber).sort((a, b) => a - b);
}

/**
 * Utility function to check if a specific pair exists
 */
export function pairExists(
  category: ImageCategory,
  pairNumber: number,
  config: ImageLoaderConfig = DEFAULT_IMAGE_CONFIG
): boolean {
  const availablePairs = getAvailablePairs(category, config);
  return availablePairs.includes(pairNumber);
}
