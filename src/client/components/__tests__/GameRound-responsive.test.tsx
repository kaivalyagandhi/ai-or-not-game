/**
 * Unit tests for responsive UI layout and visual feedback in GameRound
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameRound } from '../GameRound.js';

// Mock API call
vi.mock('../../utils/network.js', () => ({
  apiCall: vi.fn(),
}));

// Mock error handler
vi.mock('../../hooks/useErrorHandler.js', () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
    clearError: vi.fn(),
    errorState: { message: null },
    isOnline: true,
  }),
}));

// Mock audio hook
vi.mock('../../hooks/useAudio.js', () => ({
  useAudio: () => ({
    playSuccessSound: vi.fn(),
    playFailureSound: vi.fn(),
  }),
}));

// Mock window.matchMedia for responsive testing
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('GameRound - Responsive UI Layout', () => {
  const mockRound = {
    roundNumber: 1,
    category: 'Animals' as const,
    imageA: {
      id: 'img-a-1',
      url: 'https://example.com/image-a.jpg',
      category: 'Animals' as const,
      isAI: false,
      metadata: {
        source: 'human',
        description: 'A real photo of an animal',
      },
    },
    imageB: {
      id: 'img-b-1',
      url: 'https://example.com/image-b.jpg',
      category: 'Animals' as const,
      isAI: true,
      metadata: {
        source: 'ai',
        description: 'An AI-generated image of an animal',
      },
    },
    correctAnswer: 'A' as const,
    aiImagePosition: 'B' as const,
  };

  const mockOnRoundComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default to desktop view
    mockMatchMedia.mockReturnValue({
      matches: true,
      media: '(min-width: 768px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Mobile Layout (Vertical Stack)', () => {
    beforeEach(() => {
      // Mock mobile viewport
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(min-width: 768px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      // Mock viewport dimensions
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // iPhone width
      });
    });

    it('should render images in vertical stack on mobile', () => {
      const { container } = render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageContainer = container.querySelector('.image-container');
      expect(imageContainer).toBeInTheDocument();
      
      // Check CSS classes for mobile layout
      const computedStyle = window.getComputedStyle(imageContainer!);
      expect(computedStyle.display).toBe('grid');
    });

    it('should maintain 1:1 aspect ratio on mobile', () => {
      render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveClass('game-image');
        // Check that aspect-ratio is applied via CSS
        const computedStyle = window.getComputedStyle(img);
        expect(computedStyle.aspectRatio).toBe('1 / 1');
      });
    });

    it('should have proper spacing between stacked images on mobile', () => {
      const { container } = render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageContainer = container.querySelector('.image-container');
      const computedStyle = window.getComputedStyle(imageContainer!);
      expect(computedStyle.gap).toBe('1.5rem');
    });

    it('should use smaller overlay indicators on mobile', async () => {
      const { apiCall } = await import('../../utils/network.js');
      vi.mocked(apiCall).mockResolvedValue({
        success: true,
        isCorrect: true,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 51,
      });

      render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageA = screen.getByRole('button', { name: /option a/i });
      fireEvent.click(imageA);

      // Check mobile-specific overlay sizing via CSS
      const overlayElements = document.querySelectorAll('.overlay-indicator');
      overlayElements.forEach(overlay => {
        const computedStyle = window.getComputedStyle(overlay);
        // Mobile overlays should be smaller
        expect(parseInt(computedStyle.width)).toBeLessThanOrEqual(70);
      });
    });
  });

  describe('Desktop Layout (Horizontal Side-by-Side)', () => {
    beforeEach(() => {
      // Mock desktop viewport
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(min-width: 768px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024, // Desktop width
      });
    });

    it('should render images side-by-side on desktop', () => {
      const { container } = render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageContainer = container.querySelector('.image-container');
      expect(imageContainer).toBeInTheDocument();
      
      // Check CSS for desktop layout
      const computedStyle = window.getComputedStyle(imageContainer!);
      expect(computedStyle.display).toBe('grid');
    });

    it('should maintain equal sizing for both images on desktop', () => {
      render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2);

      images.forEach(img => {
        expect(img).toHaveClass('game-image');
        const computedStyle = window.getComputedStyle(img);
        expect(computedStyle.aspectRatio).toBe('1 / 1');
        expect(computedStyle.width).toBe('100%');
        expect(computedStyle.height).toBe('100%');
      });
    });

    it('should have proper spacing between side-by-side images on desktop', () => {
      const { container } = render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageContainer = container.querySelector('.image-container');
      const computedStyle = window.getComputedStyle(imageContainer!);
      expect(computedStyle.gap).toBe('2rem');
    });

    it('should center image pair within available screen space on desktop', () => {
      const { container } = render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageContainer = container.querySelector('.image-container');
      const computedStyle = window.getComputedStyle(imageContainer!);
      expect(computedStyle.maxWidth).toBe('800px');
      expect(computedStyle.margin).toBe('0 auto');
    });
  });

  describe('Responsive Breakpoint Transitions', () => {
    it('should transition from mobile to desktop layout', () => {
      // Start with mobile
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(min-width: 768px)',
      });

      const { container, rerender } = render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      let imageContainer = container.querySelector('.image-container');
      let computedStyle = window.getComputedStyle(imageContainer!);
      expect(computedStyle.gap).toBe('1.5rem'); // Mobile gap

      // Switch to desktop
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(min-width: 768px)',
      });

      rerender(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      imageContainer = container.querySelector('.image-container');
      computedStyle = window.getComputedStyle(imageContainer!);
      expect(computedStyle.gap).toBe('2rem'); // Desktop gap
    });

    it('should maintain aspect ratio across all screen sizes', () => {
      const screenSizes = [320, 375, 768, 1024, 1440];

      screenSizes.forEach(width => {
        Object.defineProperty(window, 'innerWidth', {
          value: width,
          configurable: true,
        });

        const { container } = render(
          <GameRound
            round={mockRound}
            sessionId="test-session"
            onRoundComplete={mockOnRoundComplete}
          />
        );

        const images = container.querySelectorAll('.game-image');
        images.forEach(img => {
          const computedStyle = window.getComputedStyle(img);
          expect(computedStyle.aspectRatio).toBe('1 / 1');
        });
      });
    });
  });
});

describe('GameRound - Visual Feedback System', () => {
  const mockRound = {
    roundNumber: 1,
    category: 'Animals' as const,
    imageA: {
      id: 'img-a-1',
      url: 'https://example.com/image-a.jpg',
      category: 'Animals' as const,
      isAI: false,
      metadata: { source: 'human', description: 'A real photo' },
    },
    imageB: {
      id: 'img-b-1',
      url: 'https://example.com/image-b.jpg',
      category: 'Animals' as const,
      isAI: true,
      metadata: { source: 'ai', description: 'An AI-generated image' },
    },
    correctAnswer: 'A' as const,
    aiImagePosition: 'B' as const,
  };

  const mockOnRoundComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Selection Feedback Borders', () => {
    it('should show green border for correct selection', async () => {
      const { apiCall } = await import('../../utils/network.js');
      vi.mocked(apiCall).mockResolvedValue({
        success: true,
        isCorrect: true,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 51,
      });

      render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageA = screen.getByRole('button', { name: /option a/i });
      fireEvent.click(imageA);

      await waitFor(() => {
        expect(imageA).toHaveClass('correct-feedback');
      });

      // Check CSS properties for green border
      const computedStyle = window.getComputedStyle(imageA);
      expect(computedStyle.borderColor).toBe('#46E870');
      expect(computedStyle.boxShadow).toContain('rgba(70, 232, 112, 0.3)');
    });

    it('should show red border for incorrect selection', async () => {
      const { apiCall } = await import('../../utils/network.js');
      vi.mocked(apiCall).mockResolvedValue({
        success: true,
        isCorrect: false,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 0,
      });

      render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageB = screen.getByRole('button', { name: /option b/i });
      fireEvent.click(imageB);

      await waitFor(() => {
        expect(imageB).toHaveClass('incorrect-feedback');
      });

      // Check CSS properties for red border
      const computedStyle = window.getComputedStyle(imageB);
      expect(computedStyle.borderColor).toBe('#F23C3C');
      expect(computedStyle.boxShadow).toContain('rgba(242, 60, 60, 0.3)');
    });

    it('should use 6px border thickness with 3px rounded corners for selected and feedback states', async () => {
      const { apiCall } = await import('../../utils/network.js');
      vi.mocked(apiCall).mockResolvedValue({
        success: true,
        isCorrect: true,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 51,
      });

      render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageA = screen.getByRole('button', { name: /option a/i });
      fireEvent.click(imageA);

      await waitFor(() => {
        const computedStyle = window.getComputedStyle(imageA);
        expect(computedStyle.borderWidth).toBe('6px');
        expect(computedStyle.borderRadius).toBe('3px');
      });
    });

    it('should add outer glow effect at 30% opacity', async () => {
      const { apiCall } = await import('../../utils/network.js');
      vi.mocked(apiCall).mockResolvedValue({
        success: true,
        isCorrect: true,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 51,
      });

      render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageA = screen.getByRole('button', { name: /option a/i });
      fireEvent.click(imageA);

      await waitFor(() => {
        const computedStyle = window.getComputedStyle(imageA);
        expect(computedStyle.boxShadow).toContain('rgba(70, 232, 112, 0.3)');
      });
    });

    it('should maintain styling until round transitions', async () => {
      const { apiCall } = await import('../../utils/network.js');
      vi.mocked(apiCall).mockResolvedValue({
        success: true,
        isCorrect: true,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 51,
      });

      render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageA = screen.getByRole('button', { name: /option a/i });
      fireEvent.click(imageA);

      await waitFor(() => {
        expect(imageA).toHaveClass('correct-feedback');
      });

      // Should maintain styling for 2 seconds before calling onRoundComplete
      expect(mockOnRoundComplete).not.toHaveBeenCalled();
      
      // Wait for the timeout
      await waitFor(() => {
        expect(mockOnRoundComplete).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Overlay Indicators', () => {
    it('should show red circle with X icon for AI image selection', async () => {
      const { apiCall } = await import('../../utils/network.js');
      vi.mocked(apiCall).mockResolvedValue({
        success: true,
        isCorrect: false,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 0,
      });

      render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageB = screen.getByRole('button', { name: /option b/i });
      fireEvent.click(imageB);

      await waitFor(() => {
        const aiIndicator = document.querySelector('.ai-indicator');
        expect(aiIndicator).toBeInTheDocument();
        expect(aiIndicator).toHaveTextContent('✕');
        expect(aiIndicator).toHaveTextContent('AI');
        
        const computedStyle = window.getComputedStyle(aiIndicator!);
        expect(computedStyle.backgroundColor).toBe('#F23C3C');
      });
    });

    it('should show green circle with checkmark for human image selection', async () => {
      const { apiCall } = await import('../../utils/network.js');
      vi.mocked(apiCall).mockResolvedValue({
        success: true,
        isCorrect: true,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 51,
      });

      render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageA = screen.getByRole('button', { name: /option a/i });
      fireEvent.click(imageA);

      await waitFor(() => {
        const humanIndicator = document.querySelector('.human-indicator');
        expect(humanIndicator).toBeInTheDocument();
        expect(humanIndicator).toHaveTextContent('✓');
        expect(humanIndicator).toHaveTextContent('Human');
        
        const computedStyle = window.getComputedStyle(humanIndicator!);
        expect(computedStyle.backgroundColor).toBe('#46E870');
      });
    });

    it('should show overlay only on selected image', async () => {
      const { apiCall } = await import('../../utils/network.js');
      vi.mocked(apiCall).mockResolvedValue({
        success: true,
        isCorrect: true,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 51,
      });

      render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageA = screen.getByRole('button', { name: /option a/i });
      fireEvent.click(imageA);

      await waitFor(() => {
        // Should have overlay on selected image (A)
        const imageAContainer = imageA.closest('.image-wrapper');
        expect(imageAContainer?.querySelector('.overlay-indicator')).toBeInTheDocument();
        
        // Should not have overlay on non-selected image (B)
        const imageB = screen.getByRole('button', { name: /option b/i });
        const imageBContainer = imageB.closest('.image-wrapper');
        expect(imageBContainer?.querySelector('.overlay-indicator')).not.toBeInTheDocument();
      });
    });

    it('should show colored border outline on non-selected image', async () => {
      const { apiCall } = await import('../../utils/network.js');
      vi.mocked(apiCall).mockResolvedValue({
        success: true,
        isCorrect: true,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 51,
      });

      render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageA = screen.getByRole('button', { name: /option a/i });
      const imageB = screen.getByRole('button', { name: /option b/i });
      
      fireEvent.click(imageA);

      await waitFor(() => {
        // Selected image should have enhanced styling
        expect(imageA).toHaveClass('selected', 'correct-feedback');
        
        // Non-selected image should have subtle border outline
        expect(imageB).toHaveClass('incorrect-feedback');
        expect(imageB).not.toHaveClass('selected');
      });
    });

    it('should not display emoji symbols in overlay', async () => {
      const { apiCall } = await import('../../utils/network.js');
      vi.mocked(apiCall).mockResolvedValue({
        success: true,
        isCorrect: false,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 0,
      });

      render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageB = screen.getByRole('button', { name: /option b/i });
      fireEvent.click(imageB);

      await waitFor(() => {
        const overlayIndicator = document.querySelector('.overlay-indicator');
        expect(overlayIndicator).toBeInTheDocument();
        
        // Should use text symbols, not emojis
        expect(overlayIndicator).toHaveTextContent('✕'); // Text X, not emoji
        expect(overlayIndicator).toHaveTextContent('AI');
        
        // Should not contain emoji characters
        const overlayText = overlayIndicator?.textContent || '';
        expect(overlayText).not.toMatch(/[🤖❌✅]/);
      });
    });
  });

  describe('Visual Feedback Integration', () => {
    it('should combine border styling with overlay indicators', async () => {
      const { apiCall } = await import('../../utils/network.js');
      vi.mocked(apiCall).mockResolvedValue({
        success: true,
        isCorrect: true,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 51,
      });

      render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageA = screen.getByRole('button', { name: /option a/i });
      fireEvent.click(imageA);

      await waitFor(() => {
        // Should have both border styling and overlay
        expect(imageA).toHaveClass('selected', 'correct-feedback');
        
        const overlay = document.querySelector('.human-indicator');
        expect(overlay).toBeInTheDocument();
        
        // Check combined visual effect
        const computedStyle = window.getComputedStyle(imageA);
        expect(computedStyle.borderColor).toBe('#46E870');
        expect(computedStyle.boxShadow).toContain('rgba(70, 232, 112, 0.3)');
      });
    });

    it('should handle rapid selections without visual conflicts', async () => {
      const { apiCall } = await import('../../utils/network.js');
      vi.mocked(apiCall).mockResolvedValue({
        success: true,
        isCorrect: true,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 51,
      });

      render(
        <GameRound
          round={mockRound}
          sessionId="test-session"
          onRoundComplete={mockOnRoundComplete}
        />
      );

      const imageA = screen.getByRole('button', { name: /option a/i });
      const imageB = screen.getByRole('button', { name: /option b/i });
      
      // Try to click both rapidly
      fireEvent.click(imageA);
      fireEvent.click(imageB); // Should be ignored

      await waitFor(() => {
        // Only first selection should be processed
        expect(imageA).toHaveClass('selected');
        expect(imageB).not.toHaveClass('selected');
        expect(imageB).toHaveAttribute('disabled');
      });
    });
  });
});
