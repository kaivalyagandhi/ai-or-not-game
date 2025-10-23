/**
 * Network utility functions with error handling and retry logic
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: Error) => boolean;
}

export interface NetworkError extends Error {
  status?: number;
  isNetworkError: boolean;
  isRetryable: boolean;
  originalError: Error | null;
}

/**
 * Creates a network error with additional metadata
 */
export function createNetworkError(
  message: string,
  status?: number,
  originalError?: Error
): NetworkError {
  const error = new Error(message) as NetworkError;
  error.name = 'NetworkError';
  error.status = status ?? 0;
  error.isNetworkError = true;
  error.originalError = originalError ?? null;
  
  // Determine if error is retryable
  error.isRetryable = isRetryableError(status, originalError);
  
  return error;
}

/**
 * Determines if an error is retryable based on status code and error type
 */
function isRetryableError(status?: number, originalError?: Error): boolean {
  // Network errors (no response received)
  if (!status && originalError) {
    const errorMessage = originalError.message.toLowerCase();
    return (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('offline')
    );
  }
  
  // HTTP status codes that are retryable
  if (status) {
    return (
      status >= 500 || // Server errors
      status === 408 || // Request timeout
      status === 429 || // Too many requests
      status === 502 || // Bad gateway
      status === 503 || // Service unavailable
      status === 504    // Gateway timeout
    );
  }
  
  return false;
}

/**
 * Calculates delay for exponential backoff
 */
function calculateDelay(attempt: number, options: RetryOptions): number {
  const { baseDelay = 1000, maxDelay = 30000, backoffMultiplier = 2 } = options;
  
  const delay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);
  const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
  
  return Math.min(delay + jitter, maxDelay);
}

/**
 * Sleeps for the specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Default retry condition - retries on network errors and retryable HTTP status codes
 */
const defaultRetryCondition = (error: Error): boolean => {
  if ('isRetryable' in error) {
    return (error as NetworkError).isRetryable;
  }
  return false;
};

/**
 * Executes a fetch request with retry logic and exponential backoff
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options: RetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    retryCondition = defaultRetryCondition,
  } = options;
  
  let lastError: NetworkError;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const response = await fetch(url, init);
      
      // Check if response indicates a retryable error
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        const error = createNetworkError(
          `HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`,
          response.status
        );
        
        // If this is the last attempt or error is not retryable, throw immediately
        if (attempt > maxRetries || !retryCondition(error)) {
          throw error;
        }
        
        lastError = error;
      } else {
        // Success - return the response
        return response;
      }
    } catch (error) {
      const networkError = error instanceof Error && 'isNetworkError' in error
        ? error as NetworkError
        : createNetworkError(
            `Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            undefined,
            error instanceof Error ? error : undefined
          );
      
      // If this is the last attempt or error is not retryable, throw immediately
      if (attempt > maxRetries || !retryCondition(networkError)) {
        throw networkError;
      }
      
      lastError = networkError;
    }
    
    // Wait before retrying (except on last attempt)
    if (attempt <= maxRetries) {
      const delay = calculateDelay(attempt, options);
      console.warn(`Request failed (attempt ${attempt}/${maxRetries + 1}), retrying in ${delay}ms:`, lastError.message);
      await sleep(delay);
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw lastError!;
}

/**
 * Wrapper for JSON API calls with retry logic
 */
export async function apiCall<T = any>(
  url: string,
  init?: RequestInit,
  options: RetryOptions = {}
): Promise<T> {
  try {
    const response = await fetchWithRetry(url, {
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      ...init,
    }, options);
    
    const data = await response.json();
    return data;
  } catch (error) {
    // Re-throw network errors as-is
    if (error instanceof Error && 'isNetworkError' in error) {
      throw error;
    }
    
    // Wrap other errors
    throw createNetworkError(
      `API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Gets a user-friendly error message for display
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && 'isNetworkError' in error) {
    const networkError = error as NetworkError;
    
    if (networkError.status) {
      switch (networkError.status) {
        case 400:
          return 'Invalid request. Please try again.';
        case 401:
          return 'Authentication required. Please refresh the page.';
        case 403:
          return 'Access denied. You may not have permission for this action.';
        case 404:
          return 'The requested resource was not found.';
        case 408:
          return 'Request timed out. Please check your connection and try again.';
        case 429:
          return 'Too many requests. Please wait a moment and try again.';
        case 500:
          return 'Server error. Please try again in a few moments.';
        case 502:
        case 503:
        case 504:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return `Server error (${networkError.status}). Please try again.`;
      }
    } else {
      // Network connectivity issues
      return 'Connection problem. Please check your internet connection and try again.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Gets recovery suggestions based on error type
 */
export function getRecoverySuggestions(error: unknown): string[] {
  if (error instanceof Error && 'isNetworkError' in error) {
    const networkError = error as NetworkError;
    
    if (networkError.status) {
      switch (networkError.status) {
        case 401:
          return ['Refresh the page to re-authenticate'];
        case 403:
          return ['Contact support if you believe this is an error'];
        case 408:
        case 504:
          return ['Check your internet connection', 'Try again in a few moments'];
        case 429:
          return ['Wait a few seconds before trying again'];
        case 500:
        case 502:
        case 503:
          return ['Try again in a few minutes', 'Contact support if the problem persists'];
        default:
          return ['Try again', 'Refresh the page if the problem continues'];
      }
    } else {
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Make sure you\'re not in offline mode'
      ];
    }
  }
  
  return ['Try again', 'Refresh the page if the problem continues'];
}

/**
 * Checks if the browser is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Creates a promise that listens for online/offline events
 */
export function createOnlineListener(): {
  isOnline: boolean;
  onOnline: (callback: () => void) => () => void;
  onOffline: (callback: () => void) => () => void;
} {
  let isOnlineState = navigator.onLine;
  
  const onOnline = (callback: () => void) => {
    const handler = () => {
      isOnlineState = true;
      callback();
    };
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  };
  
  const onOffline = (callback: () => void) => {
    const handler = () => {
      isOnlineState = false;
      callback();
    };
    window.addEventListener('offline', handler);
    return () => window.removeEventListener('offline', handler);
  };
  
  return {
    get isOnline() { return isOnlineState; },
    onOnline,
    onOffline,
  };
}
