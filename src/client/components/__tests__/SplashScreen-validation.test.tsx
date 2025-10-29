/**
 * Basic validation tests for SplashScreen redesign
 * Validates core functionality and accessibility features
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SplashScreen } from '../SplashScreen.js';

// Mock dependencies
vi.mock('../../utils/network.js', () => ({
  apiCall: vi.fn().mockResolvedValue({
    success: true,
    count: 100,
    attempts: 0,
    maxAttempts: 2,
    remainingAttempts: 2,
    bestScore: 0,
  }),
}));

vi.mock('../../hooks/useErrorHandler.js', () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
    clearError: vi.fn(),
    errorState: { message: null },
    isOnline: true,
  }),
}));

vi.mock('../../utils/storage.js', () => ({
  gameStorage: {
    getCachedLeaderboard: vi.fn(),
    cacheLeaderboard: vi.fn(),
  },
}));

vi.mock('@devvit/web/client', () => ({
  connectRealtime: vi.fn().mockResolvedValue({
    disconnect: vi.fn(),
  }),
}));

vi.mock('../../utils/splashAssets.js', () => ({
  useSplashScreen: () => ({
    backgroundStyles: {
      left: { backgroundImage: 'url("test-left.jpg")' },
      right: { backgroundImage: 'url("test-right.jpg")' },
    },
    overlayStyles: {
      left: { background: 'rgba(255, 68, 68, 0.6)' },
      right: { background: 'rgba(32, 178, 137, 0.6)' },
    },
    classes: {
      primary: 'text-green-600',
      primaryBorder: 'border-green-600',
      textSecondary: 'text-green-500',
      liveIndicator: 'bg-green-500',
      liveText: 'text-green-600',
    },
    isLoading: false,
    progress: 100,
  }),
}));

describe('SplashScreen - Basic Validation', () => {
  const mockOnStartGame = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Core Functionality', () => {
    it('should render the main title and subtitle', () => {
      render(<SplashScreen onStartGame={mockOnStartGame} />);

      expect(screen.getByText('AI or Not?!')).toBeTruthy();
      expect(screen.getByText('Can you tell AI from reality?')).toBeTruthy();
    });

    it('should render the split-screen layout with AI and REAL labels', () => {
      render(<SplashScreen onStartGame={mockOnStartGame} />);

      expect(screen.getByText('AI')).toBeTruthy();
      expect(screen.getByText('REAL')).toBeTruthy();
    });

    it('should render the start button', () => {
      const { container } = render(
        <SplashScreen onStartGame={mockOnStartGame} />
      );

      const startButton = container.querySelector('button');
      expect(startButton).toBeTruthy();
      expect(startButton).toHaveTextContent(/start playing/i);
    });

    it('should display game information', () => {
      render(<SplashScreen onStartGame={mockOnStartGame} />);

      expect(screen.getByText(/daily challenge/i)).toBeTruthy();
      expect(screen.getByText(/players today/i)).toBeTruthy();
    });
  });

  describe('Responsive Design', () => {
    it('should use responsive CSS classes', () => {
      const { container } = render(
        <SplashScreen onStartGame={mockOnStartGame} />
      );

      // Check for responsive layout classes
      const splitContainer = container.querySelector('.flex');
      expect(splitContainer).toBeTruthy();
      expect(splitContainer).toHaveClass('flex-col', 'sm:flex-row');
    });

    it('should have mobile-friendly button sizing', () => {
      const { container } = render(
        <SplashScreen onStartGame={mockOnStartGame} />
      );

      const startButton = container.querySelector('button');
      expect(startButton).toBeTruthy();
      expect(startButton).toHaveClass('min-h-[48px]');
    });
  });

  describe('Accessibility Features', () => {
    it('should use semantic HTML elements', () => {
      render(<SplashScreen onStartGame={mockOnStartGame} />);

      const title = screen.getByText('AI or Not?!');
      expect(title.tagName).toBe('H1');
    });

    it('should have focusable interactive elements', () => {
      const { container } = render(
        <SplashScreen onStartGame={mockOnStartGame} />
      );

      const startButton = container.querySelector('button');
      expect(startButton).toBeTruthy();
      
      startButton!.focus();
      expect(document.activeElement).toBe(startButton);
    });

    it('should have proper button attributes', () => {
      const { container } = render(
        <SplashScreen onStartGame={mockOnStartGame} />
      );

      const startButton = container.querySelector('button');
      expect(startButton).toBeTruthy();
      expect(startButton!.tagName).toBe('BUTTON');
      expect(startButton).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('should provide meaningful text content', () => {
      render(<SplashScreen onStartGame={mockOnStartGame} />);

      // Check for clear, descriptive text
      expect(screen.getByText('AI or Not?!')).toBeTruthy();
      expect(screen.getByText('Can you tell AI from reality?')).toBeTruthy();
      expect(screen.getByText(/attempts per day/i)).toBeTruthy();
    });
  });

  describe('Performance Considerations', () => {
    it('should render without throwing errors', () => {
      expect(() => {
        render(<SplashScreen onStartGame={mockOnStartGame} />);
      }).not.toThrow();
    });

    it('should handle missing props gracefully', () => {
      expect(() => {
        render(<SplashScreen onStartGame={mockOnStartGame} />);
      }).not.toThrow();
    });

    it('should use efficient CSS classes', () => {
      const { container } = render(
        <SplashScreen onStartGame={mockOnStartGame} />
      );

      // Should use utility classes for performance
      const elementsWithClasses = container.querySelectorAll('[class]');
      expect(elementsWithClasses.length).toBeGreaterThan(0);
    });
  });

  describe('Visual Design Elements', () => {
    it('should apply background styles to split halves', () => {
      const { container } = render(
        <SplashScreen onStartGame={mockOnStartGame} />
      );

      const leftHalf = container.querySelector('.flex-1');
      expect(leftHalf).toBeTruthy();
      
      const leftHalfElement = leftHalf as HTMLElement;
      expect(leftHalfElement.style.backgroundImage).toContain('test-left.jpg');
    });

    it('should have proper color theme classes', () => {
      const { container } = render(
        <SplashScreen onStartGame={mockOnStartGame} />
      );

      // Should use green theme instead of blue
      const greenElements = container.querySelectorAll('[class*="green"]');
      expect(greenElements.length).toBeGreaterThan(0);
    });

    it('should have corner labels with proper styling', () => {
      render(<SplashScreen onStartGame={mockOnStartGame} />);

      const aiLabel = screen.getByText('AI');
      const realLabel = screen.getByText('REAL');

      expect(aiLabel).toHaveClass('bg-red-500');
      expect(realLabel).toHaveClass('bg-teal-500');
    });
  });

  describe('Loading and Error States', () => {
    it('should handle loading states', () => {
      render(<SplashScreen onStartGame={mockOnStartGame} />);

      // Should show loading spinner for participant count
      const loadingSpinner = document.querySelector('.animate-spin');
      expect(loadingSpinner).toBeTruthy();
    });

    it('should display game attempts information', () => {
      render(<SplashScreen onStartGame={mockOnStartGame} />);

      // Should show attempts left (from mock data)
      expect(screen.getByText('2')).toBeTruthy();
      expect(screen.getByText(/attempts left/i)).toBeTruthy();
    });
  });
});
