import { ImageData, ImageCategory } from '../../shared/types/api.js';

/**
 * Image validation and metadata management for the daily game
 */

// Image validation interface
export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
}

// Image asset organization structure
export interface ImageAsset {
  id: string;
  filename: string;
  category: ImageCategory;
  isAI: boolean;
  metadata: {
    source: string;
    description: string;
    dateAdded: string;
    resolution?: string;
    fileSize?: number;
  };
  url: string;
}

// Image collection for daily games
export interface ImageCollection {
  [ImageCategory.ANIMALS]: ImageAsset[];
  [ImageCategory.ARCHITECTURE]: ImageAsset[];
  [ImageCategory.NATURE]: ImageAsset[];
  [ImageCategory.FOOD]: ImageAsset[];
  [ImageCategory.PRODUCTS]: ImageAsset[];
  [ImageCategory.SCIENCE]: ImageAsset[];
}

/**
 * Validates image data structure and metadata
 */
export function validateImageData(imageData: ImageData): ImageValidationResult {
  const errors: string[] = [];

  // Validate required fields
  if (!imageData.id || typeof imageData.id !== 'string') {
    errors.push('Image ID is required and must be a string');
  }

  if (!imageData.url || typeof imageData.url !== 'string') {
    errors.push('Image URL is required and must be a string');
  }

  // Validate URL format
  if (imageData.url && !isValidUrl(imageData.url)) {
    errors.push('Image URL must be a valid URL');
  }

  // Validate category
  if (!Object.values(ImageCategory).includes(imageData.category)) {
    errors.push(`Invalid category. Must be one of: ${Object.values(ImageCategory).join(', ')}`);
  }

  // Validate isAI flag
  if (typeof imageData.isAI !== 'boolean') {
    errors.push('isAI flag must be a boolean');
  }

  // Validate metadata
  if (!imageData.metadata || typeof imageData.metadata !== 'object') {
    errors.push('Metadata is required and must be an object');
  } else {
    if (!imageData.metadata.source || typeof imageData.metadata.source !== 'string') {
      errors.push('Metadata source is required and must be a string');
    }

    if (!imageData.metadata.description || typeof imageData.metadata.description !== 'string') {
      errors.push('Metadata description is required and must be a string');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates image asset structure
 */
export function validateImageAsset(asset: ImageAsset): ImageValidationResult {
  const errors: string[] = [];

  // Validate basic ImageData fields first
  const imageDataResult = validateImageData(asset);
  errors.push(...imageDataResult.errors);

  // Validate additional asset fields
  if (!asset.filename || typeof asset.filename !== 'string') {
    errors.push('Filename is required and must be a string');
  }

  // Validate filename format (should have extension)
  if (asset.filename && !asset.filename.includes('.')) {
    errors.push('Filename should include file extension');
  }

  // Validate metadata extensions
  if (asset.metadata) {
    if (!asset.metadata.dateAdded || typeof asset.metadata.dateAdded !== 'string') {
      errors.push('Metadata dateAdded is required and must be a string');
    }

    // Validate date format (ISO string)
    if (asset.metadata.dateAdded && !isValidISODate(asset.metadata.dateAdded)) {
      errors.push('Metadata dateAdded must be a valid ISO date string');
    }

    // Optional fields validation
    if (asset.metadata.resolution && typeof asset.metadata.resolution !== 'string') {
      errors.push('Metadata resolution must be a string if provided');
    }

    if (asset.metadata.fileSize && typeof asset.metadata.fileSize !== 'number') {
      errors.push('Metadata fileSize must be a number if provided');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an image collection structure
 */
export function validateImageCollection(collection: ImageCollection): ImageValidationResult {
  const errors: string[] = [];

  // Check that all categories are present
  for (const category of Object.values(ImageCategory)) {
    if (!collection[category]) {
      errors.push(`Missing category: ${category}`);
      continue;
    }

    if (!Array.isArray(collection[category])) {
      errors.push(`Category ${category} must be an array`);
      continue;
    }

    // Validate each image in the category
    collection[category].forEach((asset, index) => {
      const assetResult = validateImageAsset(asset);
      if (!assetResult.isValid) {
        errors.push(`Category ${category}, image ${index}: ${assetResult.errors.join(', ')}`);
      }

      // Ensure category matches
      if (asset.category !== category) {
        errors.push(`Category ${category}, image ${index}: asset category mismatch`);
      }
    });

    // Check for minimum images per category (need at least 2 for pairing)
    if (collection[category].length < 2) {
      errors.push(`Category ${category} must have at least 2 images`);
    }

    // Check for balanced AI/human images
    const aiImages = collection[category].filter((img) => img.isAI);
    const humanImages = collection[category].filter((img) => !img.isAI);

    if (aiImages.length === 0) {
      errors.push(`Category ${category} must have at least one AI image`);
    }

    if (humanImages.length === 0) {
      errors.push(`Category ${category} must have at least one human image`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Converts ImageAsset to ImageData for game use
 */
export function assetToImageData(asset: ImageAsset): ImageData {
  return {
    id: asset.id,
    url: asset.url,
    category: asset.category,
    isAI: asset.isAI,
    metadata: {
      source: asset.metadata.source,
      description: asset.metadata.description,
    },
  };
}

/**
 * Gets images by category and type (AI/human)
 */
export function getImagesByCategory(
  collection: ImageCollection,
  category: ImageCategory,
  isAI?: boolean
): ImageAsset[] {
  const categoryImages = collection[category] || [];

  if (typeof isAI === 'boolean') {
    return categoryImages.filter((img) => img.isAI === isAI);
  }

  return categoryImages;
}

/**
 * Creates a sample image collection for testing/development
 */
export function createSampleImageCollection(): ImageCollection {
  const baseUrl = 'https://example.com/images';

  return {
    [ImageCategory.ANIMALS]: [
      {
        id: 'animal_ai_1',
        filename: 'cat_ai.jpg',
        category: ImageCategory.ANIMALS,
        isAI: true,
        url: `${baseUrl}/animals/cat_ai.jpg`,
        metadata: {
          source: 'AI Generated - DALL-E',
          description: 'AI generated image of a fluffy orange cat',
          dateAdded: new Date().toISOString(),
          resolution: '1024x1024',
        },
      },
      {
        id: 'animal_human_1',
        filename: 'dog_real.jpg',
        category: ImageCategory.ANIMALS,
        isAI: false,
        url: `${baseUrl}/animals/dog_real.jpg`,
        metadata: {
          source: 'Photographer: John Doe',
          description: 'Real photograph of a golden retriever',
          dateAdded: new Date().toISOString(),
          resolution: '1920x1080',
        },
      },
    ],
    [ImageCategory.ARCHITECTURE]: [
      {
        id: 'arch_ai_1',
        filename: 'building_ai.jpg',
        category: ImageCategory.ARCHITECTURE,
        isAI: true,
        url: `${baseUrl}/architecture/building_ai.jpg`,
        metadata: {
          source: 'AI Generated - Midjourney',
          description: 'AI generated modern skyscraper',
          dateAdded: new Date().toISOString(),
          resolution: '1024x1024',
        },
      },
      {
        id: 'arch_human_1',
        filename: 'bridge_real.jpg',
        category: ImageCategory.ARCHITECTURE,
        isAI: false,
        url: `${baseUrl}/architecture/bridge_real.jpg`,
        metadata: {
          source: 'Photographer: Jane Smith',
          description: 'Real photograph of Golden Gate Bridge',
          dateAdded: new Date().toISOString(),
          resolution: '2048x1536',
        },
      },
    ],
    [ImageCategory.NATURE]: [
      {
        id: 'nature_ai_1',
        filename: 'landscape_ai.jpg',
        category: ImageCategory.NATURE,
        isAI: true,
        url: `${baseUrl}/nature/landscape_ai.jpg`,
        metadata: {
          source: 'AI Generated - Stable Diffusion',
          description: 'AI generated mountain landscape',
          dateAdded: new Date().toISOString(),
          resolution: '1024x768',
        },
      },
      {
        id: 'nature_human_1',
        filename: 'forest_real.jpg',
        category: ImageCategory.NATURE,
        isAI: false,
        url: `${baseUrl}/nature/forest_real.jpg`,
        metadata: {
          source: 'Photographer: Nature Lover',
          description: 'Real photograph of autumn forest',
          dateAdded: new Date().toISOString(),
          resolution: '1920x1280',
        },
      },
    ],
    [ImageCategory.FOOD]: [
      {
        id: 'food_ai_1',
        filename: 'pizza_ai.jpg',
        category: ImageCategory.FOOD,
        isAI: true,
        url: `${baseUrl}/food/pizza_ai.jpg`,
        metadata: {
          source: 'AI Generated - DALL-E 2',
          description: 'AI generated gourmet pizza',
          dateAdded: new Date().toISOString(),
          resolution: '1024x1024',
        },
      },
      {
        id: 'food_human_1',
        filename: 'burger_real.jpg',
        category: ImageCategory.FOOD,
        isAI: false,
        url: `${baseUrl}/food/burger_real.jpg`,
        metadata: {
          source: 'Food Photographer: Chef Mike',
          description: 'Real photograph of artisan burger',
          dateAdded: new Date().toISOString(),
          resolution: '1600x1200',
        },
      },
    ],
    [ImageCategory.PRODUCTS]: [
      {
        id: 'product_ai_1',
        filename: 'watch_ai.jpg',
        category: ImageCategory.PRODUCTS,
        isAI: true,
        url: `${baseUrl}/products/watch_ai.jpg`,
        metadata: {
          source: 'AI Generated - Midjourney',
          description: 'AI generated luxury watch',
          dateAdded: new Date().toISOString(),
          resolution: '1024x1024',
        },
      },
      {
        id: 'product_human_1',
        filename: 'shoes_real.jpg',
        category: ImageCategory.PRODUCTS,
        isAI: false,
        url: `${baseUrl}/products/shoes_real.jpg`,
        metadata: {
          source: 'Product Photographer: Studio Pro',
          description: 'Real photograph of running shoes',
          dateAdded: new Date().toISOString(),
          resolution: '1800x1200',
        },
      },
    ],
    [ImageCategory.SCIENCE]: [
      {
        id: 'science_ai_1',
        filename: 'molecule_ai.jpg',
        category: ImageCategory.SCIENCE,
        isAI: true,
        url: `${baseUrl}/science/molecule_ai.jpg`,
        metadata: {
          source: 'AI Generated - DALL-E',
          description: 'AI generated molecular structure visualization',
          dateAdded: new Date().toISOString(),
          resolution: '1024x1024',
        },
      },
      {
        id: 'science_human_1',
        filename: 'lab_real.jpg',
        category: ImageCategory.SCIENCE,
        isAI: false,
        url: `${baseUrl}/science/lab_real.jpg`,
        metadata: {
          source: 'Science Photographer: Lab Tech',
          description: 'Real photograph of laboratory equipment',
          dateAdded: new Date().toISOString(),
          resolution: '1920x1080',
        },
      },
    ],
  };
}

// Helper functions
function isValidUrl(url: string): boolean {
  try {
    // Accept relative URLs (starting with /) or absolute URLs
    if (url.startsWith('/')) {
      return true; // Relative URLs are valid in web context
    }
    new URL(url); // Validate absolute URLs
    return true;
  } catch {
    return false;
  }
}

function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && dateString === date.toISOString();
}
