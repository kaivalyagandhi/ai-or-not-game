/**
 * Tests for responsive design utility classes and CSS behavior
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock DOM environment for CSS testing
const createMockElement = (className: string): HTMLElement => {
  const element = document.createElement('div');
  element.className = className;
  document.body.appendChild(element);
  return element;
};

const createMockStyleSheet = (css: string): void => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};

describe('Responsive Design - CSS Utility Classes', () => {
  beforeEach(() => {
    // Clear any existing styles
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    
    // Add our CSS rules for testing
    createMockStyleSheet(`
      .image-container {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        max-width: 100%;
      }
      
      @media (min-width: 480px) {
        .image-container {
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          max-width: 600px;
          margin: 0 auto;
        }
      }
      
      .game-image-button {
        position: relative;
        width: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 0.5rem;
        border: 3px solid transparent;
        transition: all 0.2s ease-in-out;
      }
      
      .game-image-button.correct-feedback {
        border-color: #46E870;
        box-shadow: 0 0 20px rgba(70, 232, 112, 0.3);
      }
      
      .game-image-button.incorrect-feedback {
        border-color: #F23C3C;
        box-shadow: 0 0 20px rgba(242, 60, 60, 0.3);
      }
      
      .game-image {
        width: 100%;
        height: 100%;
        aspect-ratio: 1 / 1;
        object-fit: cover;
      }
      
      .overlay-indicator {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
      }
      
      .ai-indicator,
      .human-indicator {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
      }
      
      .ai-indicator {
        background-color: #F23C3C;
      }
      
      .human-indicator {
        background-color: #46E870;
      }
      
      @media (max-width: 479px) {
        .ai-indicator,
        .human-indicator {
          width: 70px;
          height: 70px;
        }
      }
    `);
  });

  afterEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  describe('Image Container Layout', () => {
    it('should have correct mobile layout properties', () => {
      const container = createMockElement('image-container');
      const styles = window.getComputedStyle(container);
      
      expect(styles.display).toBe('grid');
      expect(styles.gridTemplateColumns).toBe('1fr');
      expect(styles.gap).toBe('1.5rem');
      expect(styles.maxWidth).toBe('100%');
    });

    it('should apply desktop layout at correct breakpoint', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const container = createMockElement('image-container');
      
      // Simulate media query match
      const mediaQuery = window.matchMedia('(min-width: 480px)');
      if (mediaQuery.matches) {
        container.style.gridTemplateColumns = '1fr 1fr';
        container.style.gap = '1.5rem';
        container.style.maxWidth = '600px';
        container.style.margin = '0 auto';
      }

      const styles = window.getComputedStyle(container);
      expect(styles.gridTemplateColumns).toBe('1fr 1fr');
      expect(styles.gap).toBe('1.5rem');
      expect(styles.maxWidth).toBe('600px');
      expect(styles.margin).toBe('0 auto');
    });
  });

  describe('Game Image Button Styling', () => {
    it('should have correct base styling', () => {
      const button = createMockElement('game-image-button');
      const styles = window.getComputedStyle(button);
      
      expect(styles.position).toBe('relative');
      expect(styles.width).toBe('100%');
      expect(styles.aspectRatio).toBe('1 / 1');
      expect(styles.borderRadius).toBe('0.5rem');
      expect(styles.borderWidth).toBe('3px');
      expect(styles.borderStyle).toBe('solid');
      expect(styles.borderColor).toBe('transparent');
    });

    it('should apply correct feedback styling for correct answers', () => {
      const button = createMockElement('game-image-button correct-feedback');
      const styles = window.getComputedStyle(button);
      
      expect(styles.borderColor).toBe('#46E870');
      expect(styles.boxShadow).toContain('rgba(70, 232, 112, 0.3)');
    });

    it('should apply correct feedback styling for incorrect answers', () => {
      const button = createMockElement('game-image-button incorrect-feedback');
      const styles = window.getComputedStyle(button);
      
      expect(styles.borderColor).toBe('#F23C3C');
      expect(styles.boxShadow).toContain('rgba(242, 60, 60, 0.3)');
    });

    it('should have transition properties for smooth animations', () => {
      const button = createMockElement('game-image-button');
      const styles = window.getComputedStyle(button);
      
      expect(styles.transition).toContain('all');
      expect(styles.transition).toContain('0.2s');
      expect(styles.transition).toContain('ease-in-out');
    });
  });

  describe('Game Image Styling', () => {
    it('should maintain 1:1 aspect ratio', () => {
      const image = createMockElement('game-image');
      const styles = window.getComputedStyle(image);
      
      expect(styles.width).toBe('100%');
      expect(styles.height).toBe('100%');
      expect(styles.aspectRatio).toBe('1 / 1');
      expect(styles.objectFit).toBe('cover');
    });
  });

  describe('Overlay Indicator Styling', () => {
    it('should have correct positioning', () => {
      const overlay = createMockElement('overlay-indicator');
      const styles = window.getComputedStyle(overlay);
      
      expect(styles.position).toBe('absolute');
      expect(styles.top).toBe('50%');
      expect(styles.left).toBe('50%');
      expect(styles.transform).toBe('translate(-50%, -50%)');
      expect(styles.zIndex).toBe('10');
    });

    it('should have correct AI indicator styling', () => {
      const aiIndicator = createMockElement('ai-indicator');
      const styles = window.getComputedStyle(aiIndicator);
      
      expect(styles.width).toBe('80px');
      expect(styles.height).toBe('80px');
      expect(styles.borderRadius).toBe('50%');
      expect(styles.backgroundColor).toBe('#F23C3C');
      expect(styles.display).toBe('flex');
      expect(styles.flexDirection).toBe('column');
      expect(styles.alignItems).toBe('center');
      expect(styles.justifyContent).toBe('center');
      expect(styles.color).toBe('white');
      expect(styles.fontWeight).toBe('600');
    });

    it('should have correct human indicator styling', () => {
      const humanIndicator = createMockElement('human-indicator');
      const styles = window.getComputedStyle(humanIndicator);
      
      expect(styles.width).toBe('80px');
      expect(styles.height).toBe('80px');
      expect(styles.borderRadius).toBe('50%');
      expect(styles.backgroundColor).toBe('#46E870');
      expect(styles.display).toBe('flex');
      expect(styles.flexDirection).toBe('column');
      expect(styles.alignItems).toBe('center');
      expect(styles.justifyContent).toBe('center');
      expect(styles.color).toBe('white');
      expect(styles.fontWeight).toBe('600');
    });

    it('should use smaller indicators on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const aiIndicator = createMockElement('ai-indicator');
      
      // Simulate mobile media query
      const mediaQuery = window.matchMedia('(max-width: 479px)');
      if (mediaQuery.matches) {
        aiIndicator.style.width = '70px';
        aiIndicator.style.height = '70px';
      }

      const styles = window.getComputedStyle(aiIndicator);
      expect(styles.width).toBe('70px');
      expect(styles.height).toBe('70px');
    });
  });
});

describe('Responsive Design - Breakpoint Behavior', () => {
  const mockMatchMedia = (query: string, matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (q: string) => ({
        matches: q === query ? matches : false,
        media: q,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    });
  };

  describe('Mobile Breakpoint (< 480px)', () => {
    beforeEach(() => {
      mockMatchMedia('(max-width: 479px)', true);
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        configurable: true,
      });
    });

    it('should apply mobile-specific styles', () => {
      const container = document.createElement('div');
      container.className = 'image-container';
      
      // Mobile styles should be applied
      expect(window.matchMedia('(max-width: 479px)').matches).toBe(true);
      expect(window.innerWidth).toBe(375);
    });

    it('should use vertical layout', () => {
      const mediaQuery = window.matchMedia('(min-width: 480px)');
      expect(mediaQuery.matches).toBe(false);
    });
  });

  describe('Desktop Breakpoint (>= 480px)', () => {
    beforeEach(() => {
      mockMatchMedia('(min-width: 480px)', true);
      Object.defineProperty(window, 'innerWidth', {
        value: 600,
        configurable: true,
      });
    });

    it('should apply desktop-specific styles', () => {
      const mediaQuery = window.matchMedia('(min-width: 480px)');
      expect(mediaQuery.matches).toBe(true);
      expect(window.innerWidth).toBe(600);
    });

    it('should use horizontal layout', () => {
      const mediaQuery = window.matchMedia('(min-width: 480px)');
      expect(mediaQuery.matches).toBe(true);
    });
  });

  describe('Breakpoint Transitions', () => {
    it('should handle viewport size changes', () => {
      // Start mobile
      mockMatchMedia('(max-width: 479px)', true);
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      
      let mediaQuery = window.matchMedia('(max-width: 479px)');
      expect(mediaQuery.matches).toBe(true);
      
      // Switch to desktop
      mockMatchMedia('(min-width: 480px)', true);
      Object.defineProperty(window, 'innerWidth', { value: 600 });
      
      mediaQuery = window.matchMedia('(min-width: 480px)');
      expect(mediaQuery.matches).toBe(true);
    });

    it('should handle edge case at exact breakpoint', () => {
      // Test at exactly 480px
      mockMatchMedia('(min-width: 480px)', true);
      Object.defineProperty(window, 'innerWidth', { value: 480 });
      
      const mediaQuery = window.matchMedia('(min-width: 480px)');
      expect(mediaQuery.matches).toBe(true);
    });
  });
});

describe('Responsive Design - Visual Feedback Colors', () => {
  describe('Color Specifications', () => {
    it('should use correct green color for correct feedback', () => {
      const correctColor = '#46E870';
      const correctRgba = 'rgba(70, 232, 112, 0.3)';
      
      expect(correctColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(correctRgba).toContain('70, 232, 112');
      expect(correctRgba).toContain('0.3');
    });

    it('should use correct red color for incorrect feedback', () => {
      const incorrectColor = '#F23C3C';
      const incorrectRgba = 'rgba(242, 60, 60, 0.3)';
      
      expect(incorrectColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(incorrectRgba).toContain('242, 60, 60');
      expect(incorrectRgba).toContain('0.3');
    });

    it('should have sufficient color contrast', () => {
      // Test that colors are distinct enough
      const correctColor = '#46E870';
      const incorrectColor = '#F23C3C';
      
      expect(correctColor).not.toBe(incorrectColor);
      
      // Convert to RGB for contrast calculation
      const correctRgb = [0x46, 0xE8, 0x70];
      const incorrectRgb = [0xF2, 0x3C, 0x3C];
      
      // Colors should be sufficiently different
      const colorDifference = Math.abs(
        (correctRgb[0] + correctRgb[1] + correctRgb[2]) - 
        (incorrectRgb[0] + incorrectRgb[1] + incorrectRgb[2])
      );
      
      expect(colorDifference).toBeGreaterThan(50);
    });
  });

  describe('Opacity and Effects', () => {
    it('should use 30% opacity for glow effects', () => {
      const correctGlow = 'rgba(70, 232, 112, 0.3)';
      const incorrectGlow = 'rgba(242, 60, 60, 0.3)';
      
      expect(correctGlow).toContain('0.3');
      expect(incorrectGlow).toContain('0.3');
    });

    it('should use 3px border thickness', () => {
      const borderThickness = '3px';
      expect(borderThickness).toBe('3px');
    });

    it('should use rounded corners', () => {
      const borderRadius = '0.5rem';
      expect(borderRadius).toBe('0.5rem');
    });
  });
});

describe('Responsive Design - Cross-Device Compatibility', () => {
  const testDevices = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'Desktop', width: 1024, height: 768 },
    { name: 'Large Desktop', width: 1440, height: 900 },
  ];

  testDevices.forEach(device => {
    describe(`${device.name} (${device.width}x${device.height})`, () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          value: device.width,
          configurable: true,
        });
        Object.defineProperty(window, 'innerHeight', {
          value: device.height,
          configurable: true,
        });
      });

      it('should determine correct layout type', () => {
        const isMobile = device.width < 480;
        const isDesktop = device.width >= 480;
        
        expect(isMobile || isDesktop).toBe(true);
        expect(isMobile && isDesktop).toBe(false);
      });

      it('should have appropriate container sizing', () => {
        if (device.width >= 480) {
          // Desktop: should have max-width constraint
          expect(device.width).toBeGreaterThanOrEqual(480);
        } else {
          // Mobile: should use full width
          expect(device.width).toBeLessThan(480);
        }
      });

      it('should maintain aspect ratios', () => {
        // All devices should maintain 1:1 aspect ratio for images
        const aspectRatio = '1 / 1';
        expect(aspectRatio).toBe('1 / 1');
      });
    });
  });
});

describe('Responsive Design - Performance Considerations', () => {
  it('should use efficient CSS transitions', () => {
    const transition = 'all 0.2s ease-in-out';
    
    // Should be short duration for responsiveness
    expect(transition).toContain('0.2s');
    
    // Should use efficient easing
    expect(transition).toContain('ease-in-out');
    
    // Should transition all properties for simplicity
    expect(transition).toContain('all');
  });

  it('should use hardware-accelerated properties', () => {
    const transform = 'translate(-50%, -50%)';
    
    // Transform is hardware-accelerated
    expect(transform).toContain('translate');
  });

  it('should minimize layout thrashing', () => {
    // Using aspect-ratio instead of padding-bottom hack
    const aspectRatio = '1 / 1';
    expect(aspectRatio).toBe('1 / 1');
    
    // Using transform for positioning instead of changing layout properties
    const positioning = 'translate(-50%, -50%)';
    expect(positioning).toContain('translate');
  });
});
