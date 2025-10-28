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

  // Since we can't read the file system in a serverless environment,
  // we'll create pairs based on the known uploaded images
  // This should be replaced with a manifest file or database in production
  
  // Create pairs based on known uploaded images
  const knownPairs = getKnownImagePairs(category, config);
  pairs.push(...knownPairs);

  console.log(`Found ${pairs.length} known image pairs for category: ${category}`);

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
 * Gets known image pairs based on uploaded files
 * 
 * This function maps to the actual uploaded images in the public folder.
 * In production, this should be replaced with a manifest file or database.
 */
function getKnownImagePairs(
  category: ImageCategory,
  config: ImageLoaderConfig
): ImagePair[] {
  const pairs: ImagePair[] = [];
  
  // Define known image pairs based on what's actually uploaded
  const knownPairs = getKnownPairsForCategory(category);
  
  for (const pairInfo of knownPairs) {
    const humanImage = createImageAsset(category, pairInfo.pairNumber, false, pairInfo.humanFilename, config);
    const aiImage = createImageAsset(category, pairInfo.pairNumber, true, pairInfo.aiFilename, config);
    
    pairs.push({
      pairNumber: pairInfo.pairNumber,
      category,
      humanImage,
      aiImage,
    });
  }
  
  return pairs;
}

/**
 * Returns known image pairs for each category based on uploaded files
 */
function getKnownPairsForCategory(category: ImageCategory): Array<{
  pairNumber: number;
  humanFilename: string;
  aiFilename: string;
}> {
  switch (category) {
    case ImageCategory.ANIMALS:
      return [
        { pairNumber: 1, humanFilename: 'pair1-human.jpg', aiFilename: 'pair1-ai.jpg' },
        { pairNumber: 2, humanFilename: 'pair2-human.jpg', aiFilename: 'pair2-ai.png' },
        { pairNumber: 3, humanFilename: 'pair3-human.jpg', aiFilename: 'pair3-ai.png' },
      ];
    
    case ImageCategory.ARCHITECTURE:
      return [
        { pairNumber: 1, humanFilename: 'pair1-human.jpg', aiFilename: 'pair1-ai.jpg' },
        { pairNumber: 2, humanFilename: 'pair2-human.jpg', aiFilename: 'pair2-ai.png' },
      ];
    
    case ImageCategory.FOOD:
      return [
        { pairNumber: 1, humanFilename: 'pair1-human.jpg', aiFilename: 'pair1-ai.jpg' },
        { pairNumber: 2, humanFilename: 'pair2-human.jpg', aiFilename: 'pair2-ai.jpg' },
      ];
    
    case ImageCategory.NATURE:
      return [
        { pairNumber: 1, humanFilename: 'pair1-human.jpg', aiFilename: 'pair1-ai.png' },
        { pairNumber: 2, humanFilename: 'pair2-human.jpg', aiFilename: 'pair2-ai.jpg' },
      ];
    
    case ImageCategory.PRODUCTS:
      return [
        { pairNumber: 1, humanFilename: 'pair1-human.jpg', aiFilename: 'pair1-ai.jpg' },
        { pairNumber: 2, humanFilename: 'pair2-human.jpg', aiFilename: 'pair2-ai.png' },
      ];
    
    case ImageCategory.SCIENCE:
      return [
        { pairNumber: 1, humanFilename: 'pair1-human.jpeg', aiFilename: 'pair1-ai.jpeg' },
      ];
    
    default:
      return [];
  }
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
    [ImageCategory.SCIENCE]: [],
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
