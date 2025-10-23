/**
 * Unit tests for network utilities and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchWithRetry,
  apiCall,
  createNetworkError,
  getErrorMessage,
  getRecoverySuggestions,
  isOnline,
  createOnlineListener,
} from '../network.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('Network Utils - Error Creation', () => {
  it('should create network error with correct properties', () => {
    const error = createNetworkError('Test error', 404);
    
    expect(error.name).toBe('NetworkError');
    expect(error.message).toBe('Test error');
    expect(error.status).toBe(404);
    expect(error.isNetworkError).toBe(true);
    expect(error.isRetryable).toBe(false); // 404 is not retryable
  });

  it('should mark server errors as retryable', () => {
    const error = createNetworkError('Server error', 500);
    expect(error.isRetryable).toBe(true);
  });

  it('should mark network errors as retryable', () => {
    const originalError = new Error('Network connection failed');
    const error = createNetworkError('Network error', undefined, originalError);
    expect(error.isRetryable).toBe(true);
  });

  it('should mark client errors as non-retryable', () => {
    const error = createNetworkError('Bad request', 400);
    expect(error.isRetryable).toBe(false);
  });
});

describe('Network Utils - Fetch with Retry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should succeed on first attempt', async () => {
    const mockResponse = new Response('{"success": true}', { status: 200 });
    mockFetch.mockResolvedValueOnce(mockResponse);

    const response = await fetchWithRetry('/api/test');
    
    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on server error and eventually succeed', async () => {
    const errorResponse = new Response('Server Error', { status: 500 });
    const successResponse = new Response('{"success": true}', { status: 200 });
    
    mockFetch
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(successResponse);

    const response = await fetchWithRetry('/api/test', {}, { maxRetries: 2, baseDelay: 10 });
    
    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should not retry on client error', async () => {
    const errorResponse = new Response('Bad Request', { status: 400 });
    mockFetch.mockResolvedValueOnce(errorResponse);

    await expect(fetchWithRetry('/api/test')).rejects.toThrow('HTTP 400');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on network error', async () => {
    const networkError = new Error('Network connection failed');
    const successResponse = new Response('{"success": true}', { status: 200 });
    
    mockFetch
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce(successResponse);

    const response = await fetchWithRetry('/api/test', {}, { maxRetries: 2, baseDelay: 10 });
    
    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should exhaust retries and throw error', async () => {
    const errorResponse = new Response('Server Error', { status: 500 });
    mockFetch.mockResolvedValue(errorResponse);

    await expect(
      fetchWithRetry('/api/test', {}, { maxRetries: 2, baseDelay: 10 })
    ).rejects.toThrow('HTTP 500');
    
    expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('should respect custom retry condition', async () => {
    const errorResponse = new Response('Server Error', { status: 500 });
    mockFetch.mockResolvedValue(errorResponse);

    const customRetryCondition = () => false; // Never retry

    await expect(
      fetchWithRetry('/api/test', {}, { maxRetries: 2, retryCondition: customRetryCondition })
    ).rejects.toThrow('HTTP 500');
    
    expect(mockFetch).toHaveBeenCalledTimes(1); // No retries
  });
});

describe('Network Utils - API Call', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should make successful API call and parse JSON', async () => {
    const mockData = { success: true, data: 'test' };
    const mockResponse = new Response(JSON.stringify(mockData), { status: 200 });
    mockFetch.mockResolvedValueOnce(mockResponse);

    const result = await apiCall('/api/test');
    
    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledWith('/api/test', {
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('should include custom headers in request', async () => {
    const mockResponse = new Response('{"success": true}', { status: 200 });
    mockFetch.mockResolvedValueOnce(mockResponse);

    await apiCall('/api/test', {
      headers: { 'Authorization': 'Bearer token' },
    });
    
    const callArgs = mockFetch.mock.calls[0];
    const headers = callArgs[1]?.headers;
    
    expect(headers).toHaveProperty('Authorization', 'Bearer token');
    // Note: Content-Type header merging depends on implementation details
  });

  it('should handle JSON parsing errors', async () => {
    const mockResponse = new Response('invalid json', { status: 200 });
    mockFetch.mockResolvedValueOnce(mockResponse);

    await expect(apiCall('/api/test')).rejects.toThrow('API call failed');
  });
});

describe('Network Utils - Error Messages', () => {
  it('should return user-friendly message for 400 error', () => {
    const error = createNetworkError('Bad Request', 400);
    const message = getErrorMessage(error);
    expect(message).toBe('Invalid request. Please try again.');
  });

  it('should return user-friendly message for 401 error', () => {
    const error = createNetworkError('Unauthorized', 401);
    const message = getErrorMessage(error);
    expect(message).toBe('Authentication required. Please refresh the page.');
  });

  it('should return user-friendly message for 500 error', () => {
    const error = createNetworkError('Internal Server Error', 500);
    const message = getErrorMessage(error);
    expect(message).toBe('Server error. Please try again in a few moments.');
  });

  it('should return connection message for network error', () => {
    const error = createNetworkError('Network error');
    const message = getErrorMessage(error);
    expect(message).toBe('Connection problem. Please check your internet connection and try again.');
  });

  it('should handle regular errors', () => {
    const error = new Error('Regular error');
    const message = getErrorMessage(error);
    expect(message).toBe('Regular error');
  });

  it('should handle unknown errors', () => {
    const message = getErrorMessage('string error');
    expect(message).toBe('An unexpected error occurred. Please try again.');
  });
});

describe('Network Utils - Recovery Suggestions', () => {
  it('should provide suggestions for 401 error', () => {
    const error = createNetworkError('Unauthorized', 401);
    const suggestions = getRecoverySuggestions(error);
    expect(suggestions).toContain('Refresh the page to re-authenticate');
  });

  it('should provide suggestions for 429 error', () => {
    const error = createNetworkError('Too Many Requests', 429);
    const suggestions = getRecoverySuggestions(error);
    expect(suggestions).toContain('Wait a few seconds before trying again');
  });

  it('should provide suggestions for network error', () => {
    const error = createNetworkError('Network error');
    const suggestions = getRecoverySuggestions(error);
    expect(suggestions).toContain('Check your internet connection');
  });

  it('should provide default suggestions for unknown errors', () => {
    const error = new Error('Unknown error');
    const suggestions = getRecoverySuggestions(error);
    expect(suggestions).toContain('Try again');
  });
});

describe('Network Utils - Online Detection', () => {
  it('should detect online status', () => {
    navigator.onLine = true;
    expect(isOnline()).toBe(true);
    
    navigator.onLine = false;
    expect(isOnline()).toBe(false);
  });

  it('should create online listener', () => {
    const listener = createOnlineListener();
    expect(typeof listener.onOnline).toBe('function');
    expect(typeof listener.onOffline).toBe('function');
    expect(typeof listener.isOnline).toBe('boolean');
  });

  it('should handle online/offline events', () => {
    const listener = createOnlineListener();
    const onlineCallback = vi.fn();
    const offlineCallback = vi.fn();
    
    const removeOnline = listener.onOnline(onlineCallback);
    const removeOffline = listener.onOffline(offlineCallback);
    
    // Simulate online event
    window.dispatchEvent(new Event('online'));
    expect(onlineCallback).toHaveBeenCalled();
    
    // Simulate offline event
    window.dispatchEvent(new Event('offline'));
    expect(offlineCallback).toHaveBeenCalled();
    
    // Cleanup
    removeOnline();
    removeOffline();
  });
});
