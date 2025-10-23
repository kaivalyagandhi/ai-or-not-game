/**
 * Local storage utilities for offline caching and data persistence
 */

export interface StorageOptions {
  prefix?: string;
  ttl?: number; // Time to live in milliseconds
  compress?: boolean;
}

export interface StoredData<T = any> {
  data: T;
  timestamp: number;
  ttl?: number;
}

const DEFAULT_PREFIX = 'spot-the-bot';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Creates a storage key with optional prefix
 */
function createKey(key: string, prefix: string = DEFAULT_PREFIX): string {
  return `${prefix}:${key}`;
}

/**
 * Checks if data has expired based on TTL
 */
function isExpired(storedData: StoredData, defaultTtl?: number): boolean {
  if (!storedData.ttl && !defaultTtl) {
    return false; // No expiration
  }
  
  const ttl = storedData.ttl || defaultTtl || DEFAULT_TTL;
  const age = Date.now() - storedData.timestamp;
  return age > ttl;
}

/**
 * Safely parses JSON with error handling
 */
function safeJsonParse<T>(json: string): T | null {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.warn('Failed to parse JSON from storage:', error);
    return null;
  }
}

/**
 * Safely stringifies data with error handling
 */
function safeJsonStringify(data: any): string | null {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.warn('Failed to stringify data for storage:', error);
    return null;
  }
}

/**
 * Stores data in localStorage with metadata
 */
export function setStorageItem<T>(
  key: string, 
  data: T, 
  options: StorageOptions = {}
): boolean {
  const { prefix = DEFAULT_PREFIX, ttl } = options;
  
  try {
    const storedData: StoredData<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? 0,
    };
    
    const serialized = safeJsonStringify(storedData);
    if (!serialized) {
      return false;
    }
    
    localStorage.setItem(createKey(key, prefix), serialized);
    return true;
  } catch (error) {
    console.warn('Failed to store data:', error);
    return false;
  }
}

/**
 * Retrieves data from localStorage with expiration check
 */
export function getStorageItem<T>(
  key: string, 
  options: StorageOptions = {}
): T | null {
  const { prefix = DEFAULT_PREFIX, ttl } = options;
  
  try {
    const stored = localStorage.getItem(createKey(key, prefix));
    if (!stored) {
      return null;
    }
    
    const storedData = safeJsonParse<StoredData<T>>(stored);
    if (!storedData) {
      return null;
    }
    
    // Check if data has expired
    if (isExpired(storedData, ttl)) {
      removeStorageItem(key, options);
      return null;
    }
    
    return storedData.data;
  } catch (error) {
    console.warn('Failed to retrieve data from storage:', error);
    return null;
  }
}

/**
 * Removes an item from localStorage
 */
export function removeStorageItem(key: string, options: StorageOptions = {}): boolean {
  const { prefix = DEFAULT_PREFIX } = options;
  
  try {
    localStorage.removeItem(createKey(key, prefix));
    return true;
  } catch (error) {
    console.warn('Failed to remove data from storage:', error);
    return false;
  }
}

/**
 * Clears all items with the specified prefix
 */
export function clearStorage(prefix: string = DEFAULT_PREFIX): boolean {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${prefix}:`)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.warn('Failed to clear storage:', error);
    return false;
  }
}

/**
 * Gets the size of stored data in bytes (approximate)
 */
export function getStorageSize(prefix: string = DEFAULT_PREFIX): number {
  try {
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${prefix}:`)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
    }
    
    return totalSize;
  } catch (error) {
    console.warn('Failed to calculate storage size:', error);
    return 0;
  }
}

/**
 * Checks if localStorage is available and working
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Game-specific storage utilities
 */
export const gameStorage = {
  /**
   * Stores game session data for offline recovery
   */
  saveSession(session: any): boolean {
    return setStorageItem('current-session', session, {
      ttl: 2 * 60 * 60 * 1000, // 2 hours
    });
  },

  /**
   * Retrieves saved game session
   */
  getSession(): any | null {
    return getStorageItem('current-session');
  },

  /**
   * Clears saved session
   */
  clearSession(): boolean {
    return removeStorageItem('current-session');
  },

  /**
   * Stores game state for offline play
   */
  saveGameState(gameState: any): boolean {
    return setStorageItem('game-state', gameState, {
      ttl: 24 * 60 * 60 * 1000, // 24 hours
    });
  },

  /**
   * Retrieves saved game state
   */
  getGameState(): any | null {
    return getStorageItem('game-state');
  },

  /**
   * Stores failed API requests for retry when online
   */
  savePendingRequest(requestId: string, requestData: any): boolean {
    return setStorageItem(`pending-request:${requestId}`, requestData, {
      ttl: 60 * 60 * 1000, // 1 hour
    });
  },

  /**
   * Retrieves pending requests
   */
  getPendingRequests(): Array<{ id: string; data: any }> {
    const requests: Array<{ id: string; data: any }> = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('pending-request:')) {
          const requestId = key.split('pending-request:')[1];
          const data = getStorageItem(`pending-request:${requestId}`);
          if (data && requestId) {
            requests.push({ id: requestId, data });
          }
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve pending requests:', error);
    }
    
    return requests;
  },

  /**
   * Removes a pending request
   */
  removePendingRequest(requestId: string): boolean {
    return removeStorageItem(`pending-request:${requestId}`);
  },

  /**
   * Stores user preferences
   */
  savePreferences(preferences: any): boolean {
    return setStorageItem('user-preferences', preferences);
  },

  /**
   * Retrieves user preferences
   */
  getPreferences(): any | null {
    return getStorageItem('user-preferences');
  },

  /**
   * Stores cached leaderboard data
   */
  cacheLeaderboard(type: string, data: any): boolean {
    return setStorageItem(`leaderboard:${type}`, data, {
      ttl: 5 * 60 * 1000, // 5 minutes
    });
  },

  /**
   * Retrieves cached leaderboard data
   */
  getCachedLeaderboard(type: string): any | null {
    return getStorageItem(`leaderboard:${type}`);
  },
};
