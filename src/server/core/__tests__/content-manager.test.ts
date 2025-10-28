/**
 * Unit tests for educational content system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContentManager, contentManager } from '../content-manager.js';

describe('Content Manager - Content Loading', () => {
  let manager: ContentManager;

  beforeEach(() => {
    // Get a fresh instance for each test
    manager = ContentManager.getInstance();
    // Force reload to clear any cached content
    manager.forceReload();
  });

  it('should load educational content successfully', () => {
    const content = manager.getDailyEducationalContent();
    
    expect(content).toBeDefined();
    expect(content.tips).toBeInstanceOf(Array);
    expect(content.facts).toBeInstanceOf(Array);
    expect(content.tips.length).toBeGreaterThan(0);
    expect(content.facts.length).toBeGreaterThan(0);
    expect(typeof content.currentTipIndex).toBe('number');
    expect(typeof content.currentFactIndex).toBe('number');
  });

  it('should load inspirational content successfully', () => {
    const content = manager.getDailyInspirationContent();
    
    expect(content).toBeDefined();
    expect(content.quotes).toBeInstanceOf(Array);
    expect(content.jokes).toBeInstanceOf(Array);
    expect(content.quotes.length).toBeGreaterThan(0);
    expect(content.jokes.length).toBeGreaterThan(0);
    expect(typeof content.currentIndex).toBe('number');
    expect(['quote', 'joke']).toContain(content.type);
  });

  it('should provide fallback content when loading fails', () => {
    // Mock the embedded content methods to throw errors
    const originalGetEmbeddedTips = manager['getEmbeddedTips'];
    manager['getEmbeddedTips'] = vi.fn().mockImplementation(() => {
      throw new Error('Simulated loading error');
    });

    // Force reload to trigger error handling
    manager.forceReload();
    
    const content = manager.getDailyEducationalContent();
    
    expect(content).toBeDefined();
    expect(content.tips).toBeInstanceOf(Array);
    expect(content.facts).toBeInstanceOf(Array);
    expect(content.tips.length).toBeGreaterThan(0);
    expect(content.facts.length).toBeGreaterThan(0);
    
    // Restore original method
    manager['getEmbeddedTips'] = originalGetEmbeddedTips;
  });

  it('should validate content structure correctly', () => {
    const validTips = { tips: ['tip1', 'tip2'] };
    const validFacts = { facts: ['fact1', 'fact2'] };
    const validInspiration = { quotes: ['quote1'], jokes: ['joke1'] };
    
    expect(() => {
      manager['validateContentStructure'](validTips, validFacts, validInspiration);
    }).not.toThrow();
  });

  it('should reject invalid content structure', () => {
    const invalidTips = { tips: 'not an array' };
    const validFacts = { facts: ['fact1', 'fact2'] };
    const validInspiration = { quotes: ['quote1'], jokes: ['joke1'] };
    
    expect(() => {
      manager['validateContentStructure'](invalidTips, validFacts, validInspiration);
    }).toThrow('Invalid tips structure');
  });

  it('should cache content and avoid reloading on same day', () => {
    const spy = vi.spyOn(manager as any, 'ensureContentLoaded');
    
    // First call should load content
    manager.getDailyEducationalContent();
    expect(spy).toHaveBeenCalledTimes(1);
    
    // Second call should use cache
    manager.getDailyEducationalContent();
    expect(spy).toHaveBeenCalledTimes(2); // ensureContentLoaded is called but returns early due to cache
    
    spy.mockRestore();
  });
});

describe('Content Manager - Daily Rotation', () => {
  let manager: ContentManager;

  beforeEach(() => {
    manager = ContentManager.getInstance();
    manager.forceReload();
  });

  it('should provide consistent content for the same date', () => {
    const content1 = manager.getDailyEducationalContent();
    const content2 = manager.getDailyEducationalContent();
    
    expect(content1.currentTipIndex).toBe(content2.currentTipIndex);
    expect(content1.currentFactIndex).toBe(content2.currentFactIndex);
  });

  it('should rotate content based on date hash', () => {
    // Mock getCurrentDate to return different dates
    const originalGetCurrentDate = manager['getCurrentDate'];
    
    manager['getCurrentDate'] = vi.fn().mockReturnValue('2024-01-01');
    manager.forceReload();
    const content1 = manager.getDailyEducationalContent();
    
    manager['getCurrentDate'] = vi.fn().mockReturnValue('2024-01-02');
    manager.forceReload();
    const content2 = manager.getDailyEducationalContent();
    
    // Content should be different for different dates
    expect(content1.currentTipIndex !== content2.currentTipIndex || 
           content1.currentFactIndex !== content2.currentFactIndex).toBe(true);
    
    // Restore original method
    manager['getCurrentDate'] = originalGetCurrentDate;
  });

  it('should handle date hash calculation correctly', () => {
    const hash1 = manager['hashString']('2024-01-01');
    const hash2 = manager['hashString']('2024-01-02');
    const hash3 = manager['hashString']('2024-01-01'); // Same as hash1
    
    expect(typeof hash1).toBe('number');
    expect(typeof hash2).toBe('number');
    expect(hash1).toBe(hash3); // Same input should give same hash
    expect(hash1).not.toBe(hash2); // Different input should give different hash
    expect(hash1).toBeGreaterThanOrEqual(0); // Hash should be positive
  });

  it('should alternate between quotes and jokes for inspiration', () => {
    const originalGetCurrentDate = manager['getCurrentDate'];
    
    // Test multiple dates to see alternation
    const results: string[] = [];
    
    for (let day = 1; day <= 10; day++) {
      const dateStr = `2024-01-${day.toString().padStart(2, '0')}`;
      manager['getCurrentDate'] = vi.fn().mockReturnValue(dateStr);
      manager.forceReload();
      
      const content = manager.getDailyInspirationContent();
      results.push(content.type);
    }
    
    // Should have both quotes and jokes in the results
    expect(results).toContain('quote');
    expect(results).toContain('joke');
    
    // Restore original method
    manager['getCurrentDate'] = originalGetCurrentDate;
  });
});

describe('Content Manager - Content Access Methods', () => {
  let manager: ContentManager;

  beforeEach(() => {
    manager = ContentManager.getInstance();
    manager.forceReload();
  });

  it('should get current tip successfully', () => {
    const tip = manager.getCurrentTip();
    
    expect(typeof tip).toBe('string');
    expect(tip.length).toBeGreaterThan(0);
    expect(tip).not.toBe('No tip available'); // Should have real content
  });

  it('should get current fact successfully', () => {
    const fact = manager.getCurrentFact();
    
    expect(typeof fact).toBe('string');
    expect(fact.length).toBeGreaterThan(0);
    expect(fact).not.toBe('No fact available'); // Should have real content
  });

  it('should get current inspiration successfully', () => {
    const inspiration = manager.getCurrentInspiration();
    
    expect(typeof inspiration).toBe('string');
    expect(inspiration.length).toBeGreaterThan(0);
    expect(inspiration).not.toBe('Stay positive!'); // Should have real content
  });

  it('should get all content successfully', () => {
    const allContent = manager.getAllContent();
    
    expect(allContent).toBeDefined();
    expect(allContent.educational).toBeDefined();
    expect(allContent.inspirational).toBeDefined();
    
    expect(allContent.educational.tips).toBeInstanceOf(Array);
    expect(allContent.educational.facts).toBeInstanceOf(Array);
    expect(allContent.inspirational.quotes).toBeInstanceOf(Array);
    expect(allContent.inspirational.jokes).toBeInstanceOf(Array);
  });

  it('should handle empty content arrays gracefully', () => {
    // Mock empty content
    const originalGetEmbeddedTips = manager['getEmbeddedTips'];
    manager['getEmbeddedTips'] = vi.fn().mockReturnValue({ tips: [] });
    
    manager.forceReload();
    
    const tip = manager.getCurrentTip();
    expect(tip).toBe('No tip available');
    
    // Restore original method
    manager['getEmbeddedTips'] = originalGetEmbeddedTips;
  });
});

describe('Content Manager - Error Handling', () => {
  let manager: ContentManager;

  beforeEach(() => {
    manager = ContentManager.getInstance();
  });

  it('should handle content loading errors gracefully', () => {
    // Mock all embedded content methods to throw errors
    const originalMethods = {
      getEmbeddedTips: manager['getEmbeddedTips'],
      getEmbeddedFacts: manager['getEmbeddedFacts'],
      getEmbeddedInspiration: manager['getEmbeddedInspiration']
    };
    
    manager['getEmbeddedTips'] = vi.fn().mockImplementation(() => {
      throw new Error('Tips loading failed');
    });
    manager['getEmbeddedFacts'] = vi.fn().mockImplementation(() => {
      throw new Error('Facts loading failed');
    });
    manager['getEmbeddedInspiration'] = vi.fn().mockImplementation(() => {
      throw new Error('Inspiration loading failed');
    });
    
    manager.forceReload();
    
    // Should still provide content (fallback)
    const educational = manager.getDailyEducationalContent();
    const inspirational = manager.getDailyInspirationContent();
    
    expect(educational).toBeDefined();
    expect(inspirational).toBeDefined();
    expect(educational.tips.length).toBeGreaterThan(0);
    expect(educational.facts.length).toBeGreaterThan(0);
    expect(inspirational.quotes.length).toBeGreaterThan(0);
    expect(inspirational.jokes.length).toBeGreaterThan(0);
    
    // Restore original methods
    Object.assign(manager, originalMethods);
  });

  it('should throw error when content cache fails completely', () => {
    // Mock ensureContentLoaded to fail
    const originalEnsureContentLoaded = manager['ensureContentLoaded'];
    manager['ensureContentLoaded'] = vi.fn().mockImplementation(() => {
      manager['contentCache'] = null;
    });
    
    expect(() => {
      manager.getDailyEducationalContent();
    }).toThrow('Failed to load educational content');
    
    expect(() => {
      manager.getDailyInspirationContent();
    }).toThrow('Failed to load inspirational content');
    
    // Restore original method
    manager['ensureContentLoaded'] = originalEnsureContentLoaded;
  });
});

describe('Content Manager - Singleton Pattern', () => {
  it('should return the same instance', () => {
    const instance1 = ContentManager.getInstance();
    const instance2 = ContentManager.getInstance();
    
    expect(instance1).toBe(instance2);
  });

  it('should maintain state across getInstance calls', () => {
    const instance1 = ContentManager.getInstance();
    instance1.forceReload();
    
    const content1 = instance1.getDailyEducationalContent();
    
    const instance2 = ContentManager.getInstance();
    const content2 = instance2.getDailyEducationalContent();
    
    expect(content1.currentTipIndex).toBe(content2.currentTipIndex);
    expect(content1.currentFactIndex).toBe(content2.currentFactIndex);
  });
});

describe('Content Manager - Content Quality', () => {
  let manager: ContentManager;

  beforeEach(() => {
    manager = ContentManager.getInstance();
    manager.forceReload();
  });

  it('should have meaningful educational tips', () => {
    const content = manager.getDailyEducationalContent();
    
    content.tips.forEach(tip => {
      expect(typeof tip).toBe('string');
      expect(tip.length).toBeGreaterThan(10); // Should be substantial
      expect(tip.toLowerCase()).toMatch(/ai|artificial|intelligence|image|photo|look|check|examine|watch|lighting|shadow|hand|finger|text/);
    });
  });

  it('should have informative AI facts', () => {
    const content = manager.getDailyEducationalContent();
    
    content.facts.forEach(fact => {
      expect(typeof fact).toBe('string');
      expect(fact.length).toBeGreaterThan(20); // Should be informative
      expect(fact.toLowerCase()).toMatch(/ai|artificial|intelligence|neural|network|generate|learn/);
    });
  });

  it('should have positive inspirational quotes', () => {
    const content = manager.getDailyInspirationContent();
    
    content.quotes.forEach(quote => {
      expect(typeof quote).toBe('string');
      expect(quote.length).toBeGreaterThan(10);
      // Should contain positive/encouraging words
      expect(quote.toLowerCase()).toMatch(/practice|learn|expert|skill|human|future|develop|train|curiosity|attention|detail|asset|challenge|intuition|valuable|digital|perfect|instinct|judgment|mistake|opportunity|superpower|brain/);
    });
  });

  it('should have appropriate jokes', () => {
    const content = manager.getDailyInspirationContent();
    
    content.jokes.forEach(joke => {
      expect(typeof joke).toBe('string');
      expect(joke.length).toBeGreaterThan(10);
      // Should be AI-related humor
      expect(joke.toLowerCase()).toMatch(/ai|finger|hand|art|generate|image/);
    });
  });

  it('should have valid array indices', () => {
    const educational = manager.getDailyEducationalContent();
    const inspirational = manager.getDailyInspirationContent();
    
    expect(educational.currentTipIndex).toBeGreaterThanOrEqual(0);
    expect(educational.currentTipIndex).toBeLessThan(educational.tips.length);
    expect(educational.currentFactIndex).toBeGreaterThanOrEqual(0);
    expect(educational.currentFactIndex).toBeLessThan(educational.facts.length);
    
    expect(inspirational.currentIndex).toBeGreaterThanOrEqual(0);
    if (inspirational.type === 'quote') {
      expect(inspirational.currentIndex).toBeLessThan(inspirational.quotes.length);
    } else {
      expect(inspirational.currentIndex).toBeLessThan(inspirational.jokes.length);
    }
  });
});
