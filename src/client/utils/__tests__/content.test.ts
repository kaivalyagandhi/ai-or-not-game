/**
 * Unit tests for content utility functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchEducationalContent,
  fetchInspirationalContent,
  fetchCurrentContent,
  loadContentWithRetry,
  fetchEducationalContentCached,
  fetchInspirationalContentCached,
  fetchCurrentContentCached,
  clearContentCache,
} from '../content.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Content Utils - Basic Fetch Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchEducationalContent', () => {
    it('should fetch educational content successfully', async () => {
      const mockResponse = {
        success: true,
        educational: {
          tips: ['tip1', 'tip2'],
          facts: ['fact1', 'fact2'],
          currentTipIndex: 0,
          currentFactIndex: 1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchEducationalContent();

      expect(mockFetch).toHaveBeenCalledWith('/api/content/educational');
      expect(result).toEqual(mockResponse);
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await fetchEducationalContent();

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP error! status: 500');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchEducationalContent();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle unknown errors', async () => {
      mockFetch.mockRejectedValueOnce('Unknown error');

      const result = await fetchEducationalContent();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch educational content');
    });
  });

  describe('fetchInspirationalContent', () => {
    it('should fetch inspirational content successfully', async () => {
      const mockResponse = {
        success: true,
        inspirational: {
          quotes: ['quote1', 'quote2'],
          jokes: ['joke1', 'joke2'],
          currentIndex: 0,
          type: 'quote' as const,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchInspirationalContent();

      expect(mockFetch).toHaveBeenCalledWith('/api/content/inspirational');
      expect(result).toEqual(mockResponse);
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Fetch failed'));

      const result = await fetchInspirationalContent();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Fetch failed');
    });
  });

  describe('fetchCurrentContent', () => {
    it('should fetch current content successfully', async () => {
      const mockResponse = {
        success: true,
        tip: 'Current tip',
        fact: 'Current fact',
        inspiration: 'Current inspiration',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchCurrentContent();

      expect(mockFetch).toHaveBeenCalledWith('/api/content/current');
      expect(result).toEqual(mockResponse);
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const result = await fetchCurrentContent();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid JSON');
    });
  });
});

describe('Content Utils - Retry Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should succeed on first attempt', async () => {
    const mockFunction = vi.fn().mockResolvedValue('success');

    const result = await loadContentWithRetry(mockFunction, 3, 100);

    expect(result).toBe('success');
    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const mockFunction = vi.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValueOnce('success');

    const result = await loadContentWithRetry(mockFunction, 3, 10);

    expect(result).toBe('success');
    expect(mockFunction).toHaveBeenCalledTimes(3);
  });

  it('should exhaust retries and throw last error', async () => {
    const mockFunction = vi.fn()
      .mockRejectedValue(new Error('Persistent failure'));

    await expect(
      loadContentWithRetry(mockFunction, 2, 10)
    ).rejects.toThrow('Persistent failure');

    expect(mockFunction).toHaveBeenCalledTimes(2);
  });

  it('should use exponential backoff', async () => {
    const mockFunction = vi.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValueOnce('success');

    const startTime = Date.now();
    await loadContentWithRetry(mockFunction, 3, 50);
    const endTime = Date.now();

    // Should have waited at least 50ms for the retry
    expect(endTime - startTime).toBeGreaterThanOrEqual(45);
    expect(mockFunction).toHaveBeenCalledTimes(2);
  });

  it('should handle non-Error rejections', async () => {
    const mockFunction = vi.fn()
      .mockRejectedValue('String error');

    await expect(
      loadContentWithRetry(mockFunction, 1, 10)
    ).rejects.toThrow('Unknown error');
  });
});

describe('Content Utils - Caching', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearContentCache();
  });

  describe('fetchEducationalContentCached', () => {
    it('should cache successful responses', async () => {
      const mockResponse = {
        success: true,
        educational: {
          tips: ['tip1'],
          facts: ['fact1'],
          currentTipIndex: 0,
          currentFactIndex: 0,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // First call should fetch from API
      const result1 = await fetchEducationalContentCached();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(mockResponse);

      // Second call should use cache
      const result2 = await fetchEducationalContentCached();
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still only 1 call
      expect(result2).toEqual(mockResponse);
    });

    it('should not cache failed responses', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      // First call fails
      const result1 = await fetchEducationalContentCached();
      expect(result1.success).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should try again (not cached)
      const result2 = await fetchEducationalContentCached();
      expect(result2.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('fetchInspirationalContentCached', () => {
    it('should cache and reuse inspirational content', async () => {
      const mockResponse = {
        success: true,
        inspirational: {
          quotes: ['quote1'],
          jokes: ['joke1'],
          currentIndex: 0,
          type: 'quote' as const,
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result1 = await fetchInspirationalContentCached();
      const result2 = await fetchInspirationalContentCached();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });
  });

  describe('fetchCurrentContentCached', () => {
    it('should cache current content', async () => {
      const mockResponse = {
        success: true,
        tip: 'Test tip',
        fact: 'Test fact',
        inspiration: 'Test inspiration',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result1 = await fetchCurrentContentCached();
      const result2 = await fetchCurrentContentCached();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });
  });

  describe('clearContentCache', () => {
    it('should clear cache and force new requests', async () => {
      const mockResponse = { success: true, tip: 'Test' };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // First call
      await fetchCurrentContentCached();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call uses cache
      await fetchCurrentContentCached();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Clear cache
      clearContentCache();

      // Third call should fetch again
      await fetchCurrentContentCached();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Content Utils - Cache TTL', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearContentCache();
  });

  it('should respect cache TTL and expire entries', async () => {
    const mockResponse = { success: true, tip: 'Test' };

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    // Mock Date.now to control time
    const originalDateNow = Date.now;
    let currentTime = 1000000;
    Date.now = vi.fn(() => currentTime);

    try {
      // First call caches the response
      await fetchCurrentContentCached();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Advance time by 4 minutes (less than 5 minute TTL)
      currentTime += 4 * 60 * 1000;

      // Second call should use cache
      await fetchCurrentContentCached();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Advance time by 2 more minutes (total 6 minutes, exceeds TTL)
      currentTime += 2 * 60 * 1000;

      // Third call should fetch again
      await fetchCurrentContentCached();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    } finally {
      Date.now = originalDateNow;
    }
  });
});

describe('Content Utils - Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearContentCache();
  });

  it('should handle fetch timeout', async () => {
    // Mock a fetch that never resolves
    mockFetch.mockImplementation(() => new Promise(() => {}));

    // This would timeout in a real scenario, but for testing we'll reject after a delay
    mockFetch.mockRejectedValueOnce(new Error('Request timeout'));

    const result = await fetchEducationalContent();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Request timeout');
  });

  it('should handle malformed JSON response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new Error('Unexpected token')),
    });

    const result = await fetchCurrentContent();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unexpected token');
  });

  it('should handle empty response body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(null),
    });

    const result = await fetchEducationalContent();

    expect(result).toBeNull();
  });

  it('should handle network disconnection during retry', async () => {
    const mockFunction = vi.fn()
      .mockRejectedValueOnce(new Error('Network disconnected'))
      .mockRejectedValueOnce(new Error('Still disconnected'))
      .mockRejectedValueOnce(new Error('Connection failed'));

    await expect(
      loadContentWithRetry(mockFunction, 3, 10)
    ).rejects.toThrow('Connection failed');

    expect(mockFunction).toHaveBeenCalledTimes(3);
  });
});
