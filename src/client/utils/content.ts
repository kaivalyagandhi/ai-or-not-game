import { 
  EducationalContentResponse, 
  InspirationalContentResponse, 
  CurrentContentResponse 
} from '../../shared/types/api.js';

/**
 * Fetch educational content (tips and facts) for the current day
 */
export async function fetchEducationalContent(): Promise<EducationalContentResponse> {
  try {
    const response = await fetch('/api/content/educational');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching educational content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch educational content',
    };
  }
}

/**
 * Fetch inspirational content (quotes and jokes) for the current day
 */
export async function fetchInspirationalContent(): Promise<InspirationalContentResponse> {
  try {
    const response = await fetch('/api/content/inspirational');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching inspirational content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch inspirational content',
    };
  }
}

/**
 * Fetch current day's selected content (one tip, one fact, one inspiration)
 */
export async function fetchCurrentContent(): Promise<CurrentContentResponse> {
  try {
    const response = await fetch('/api/content/current');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching current content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch current content',
    };
  }
}

/**
 * Fetch random content for each game session (one tip, one fact, one inspiration)
 */
export async function fetchRandomContent(): Promise<CurrentContentResponse> {
  try {
    const response = await fetch('/api/content/random');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching random content:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch random content',
    };
  }
}

/**
 * Content loading utility with retry logic
 */
export async function loadContentWithRetry<T>(
  fetchFunction: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFunction();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < maxRetries) {
        console.warn(`Content loading attempt ${attempt} failed, retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay *= 2; // Exponential backoff
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

/**
 * Cache for content to avoid repeated API calls
 */
class ContentCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const contentCache = new ContentCache();

/**
 * Cached version of fetchEducationalContent
 */
export async function fetchEducationalContentCached(): Promise<EducationalContentResponse> {
  const cacheKey = 'educational-content';
  const cached = contentCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const content = await loadContentWithRetry(fetchEducationalContent);
  
  if (content.success) {
    contentCache.set(cacheKey, content);
  }
  
  return content;
}

/**
 * Cached version of fetchInspirationalContent
 */
export async function fetchInspirationalContentCached(): Promise<InspirationalContentResponse> {
  const cacheKey = 'inspirational-content';
  const cached = contentCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const content = await loadContentWithRetry(fetchInspirationalContent);
  
  if (content.success) {
    contentCache.set(cacheKey, content);
  }
  
  return content;
}

/**
 * Cached version of fetchCurrentContent
 */
export async function fetchCurrentContentCached(): Promise<CurrentContentResponse> {
  const cacheKey = 'current-content';
  const cached = contentCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const content = await loadContentWithRetry(fetchCurrentContent);
  
  if (content.success) {
    contentCache.set(cacheKey, content);
  }
  
  return content;
}

/**
 * Fetch random content without caching (for fresh content each game session)
 */
export async function fetchRandomContentFresh(): Promise<CurrentContentResponse> {
  return await loadContentWithRetry(fetchRandomContent);
}

/**
 * Clear content cache (useful when day changes)
 */
export function clearContentCache(): void {
  contentCache.clear();
}
