import { useState, useCallback, useEffect } from 'react';
import { 
  NetworkError, 
  getErrorMessage, 
  getRecoverySuggestions, 
  createOnlineListener 
} from '../utils/network';

export interface ErrorState {
  error: Error | null;
  message: string;
  suggestions: string[];
  isRetryable: boolean;
  isNetworkError: boolean;
  canRetry: boolean;
}

export interface ErrorHandlerOptions {
  enableOfflineDetection?: boolean;
  enableAutoRetry?: boolean;
  autoRetryDelay?: number;
  maxAutoRetries?: number;
}

export interface ErrorHandler {
  errorState: ErrorState;
  handleError: (error: unknown, context?: string) => void;
  clearError: () => void;
  retry: (retryFn: () => Promise<void> | void) => Promise<void>;
  isOnline: boolean;
}

const defaultErrorState: ErrorState = {
  error: null,
  message: '',
  suggestions: [],
  isRetryable: false,
  isNetworkError: false,
  canRetry: false,
};

export const useErrorHandler = (options: ErrorHandlerOptions = {}): ErrorHandler => {
  const {
    enableOfflineDetection = true,
    enableAutoRetry = false,
    autoRetryDelay = 5000,
    maxAutoRetries = 2,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>(defaultErrorState);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [retryFn, setRetryFn] = useState<(() => Promise<void> | void) | null>(null);

  // Handle online/offline detection
  useEffect(() => {
    if (!enableOfflineDetection) return;

    const onlineListener = createOnlineListener();
    
    const handleOnline = () => {
      setIsOnline(true);
      
      // If we have a pending retry and auto-retry is enabled, execute it
      if (enableAutoRetry && retryFn && errorState.isNetworkError) {
        console.log('Connection restored, attempting auto-retry...');
        retry(retryFn);
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      
      // If we're currently showing a network error, update the message
      if (errorState.isNetworkError) {
        setErrorState(prev => ({
          ...prev,
          message: 'You appear to be offline. Please check your internet connection.',
          suggestions: ['Check your internet connection', 'Try again when back online'],
        }));
      }
    };

    const cleanupOnline = onlineListener.onOnline(handleOnline);
    const cleanupOffline = onlineListener.onOffline(handleOffline);

    return () => {
      cleanupOnline();
      cleanupOffline();
    };
  }, [enableOfflineDetection, enableAutoRetry, retryFn, errorState.isNetworkError]);

  // Auto-retry logic
  useEffect(() => {
    if (!enableAutoRetry || !retryFn || !errorState.isNetworkError || retryCount >= maxAutoRetries) {
      return;
    }

    const timer = setTimeout(() => {
      console.log(`Auto-retry attempt ${retryCount + 1}/${maxAutoRetries}...`);
      retry(retryFn);
    }, autoRetryDelay);

    return () => clearTimeout(timer);
  }, [enableAutoRetry, retryFn, errorState.isNetworkError, retryCount, maxAutoRetries, autoRetryDelay]);

  const handleError = useCallback((error: unknown, context?: string) => {
    console.error('Error handled:', error, context ? `Context: ${context}` : '');
    
    let processedError: Error;
    let isNetworkError = false;
    let isRetryable = false;

    // Process the error
    if (error instanceof Error && 'isNetworkError' in error) {
      processedError = error;
      isNetworkError = true;
      isRetryable = (error as NetworkError).isRetryable;
    } else if (error instanceof Error) {
      processedError = error;
      // Check if it looks like a network error
      const errorMessage = error.message.toLowerCase();
      isNetworkError = (
        errorMessage.includes('network') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('offline')
      );
      isRetryable = isNetworkError;
    } else {
      processedError = new Error(typeof error === 'string' ? error : 'Unknown error occurred');
      isRetryable = false;
    }

    const message = getErrorMessage(processedError);
    const suggestions = getRecoverySuggestions(processedError);

    setErrorState({
      error: processedError,
      message: context ? `${context}: ${message}` : message,
      suggestions,
      isRetryable,
      isNetworkError,
      canRetry: true,
    });

    // Reset retry count when a new error occurs
    setRetryCount(0);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(defaultErrorState);
    setRetryFn(null);
    setRetryCount(0);
  }, []);

  const retry = useCallback(async (newRetryFn: () => Promise<void> | void) => {
    if (!errorState.canRetry) {
      console.warn('Retry attempted but error is not retryable');
      return;
    }

    // Store the retry function for potential auto-retry
    setRetryFn(() => newRetryFn);
    
    try {
      // Clear the error state before retrying
      clearError();
      
      // Execute the retry function
      const result = newRetryFn();
      if (result instanceof Promise) {
        await result;
      }
      
      // If successful, clear retry function and count
      setRetryFn(null);
      setRetryCount(0);
      
      console.log('Retry successful');
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      
      // Increment retry count
      setRetryCount(prev => prev + 1);
      
      // Handle the retry error
      handleError(retryError, 'Retry failed');
    }
  }, [errorState.canRetry, clearError, handleError]);

  return {
    errorState,
    handleError,
    clearError,
    retry,
    isOnline,
  };
};
