/**
 * Integration tests for sharing functionality with play limit system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResultsScreen } from '../ResultsScreen.js';
import { BadgeType } from '../../../shared/types/api.js';

// Mock fetch
global.fetch = vi.fn();

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn(),
};

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

// Mock content utility
vi.mock('../../utils/content.js', () => ({
  fetchCurrentContentCached: vi.fn().mockResolvedValue({
    success: true,
    inspiration: 'Test inspirational content',
  }),
}));

// Mock audio hook
vi.mock('../../hooks/useAudio.js', () => ({
  useAudio: () => ({
    playSuccessSound: vi.fn(),
    playFailureSound: vi.fn(),
  }),
}));

// Mock realtime connection
vi.mock('@devvit/web/client', () => ({
  connectRealtime: vi.fn().mockResolvedValue({
    disconnect: vi.fn(),
  }),
}));

describe('Sharing Integration with Play Limits', () => {
  const baseSession = {
    userId: 'user123',
    sessionId: 'session456',
    startTime: Date.now(),
    rounds: [],
    totalScore: 85.5,
    correctCount: 4,
    totalTimeBonus: 5.5,
    badge: BadgeType.GOOD_SAMARITAN,
    completed: true,
    attemptNumber: 1,
    showedEducationalContent: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockClipboard.writeText.mockResolvedValue(undefined);
    // Disable native sharing to force clipboard usage
    Object.defineProperty(navigator, 'share', { value: undefined });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('First Attempt Sharing', () => {
    it('should show appropriate message for first attempt with remaining plays', async () => {
      // Mock API responses for first attempt with remaining plays
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            userRank: 5,
            totalParticipants: 100,
          }),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            remainingAttempts: 1,
            maxAttempts: 2,
            bestScore: 0, // First attempt, no previous best
          }),
        } as any);

      render(<ResultsScreen session={baseSession} />);

      await waitFor(() => {
        const shareButton = screen.getByText(/share results/i);
        fireEvent.click(shareButton);
      });

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('I still have 1 attempt left - going for a higher score!')
        );
        expect(mockClipboard.writeText).not.toHaveBeenCalledWith(
          expect.stringContaining('Improved from')
        );
      });
    });

    it('should show friends challenge message for first attempt', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            userRank: 5,
            totalParticipants: 100,
          }),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            remainingAttempts: 1,
            maxAttempts: 2,
            bestScore: 0,
          }),
        } as any);

      render(<ResultsScreen session={baseSession} />);

      await waitFor(() => {
        const friendsButton = screen.getByText(/challenge friends/i);
        fireEvent.click(friendsButton);
      });

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('I still have 1 more attempt today')
        );
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('Want to see if you can beat me before I get my next try?')
        );
      });
    });
  });

  describe('Second Attempt Sharing - Improved Score', () => {
    it('should show improvement message when second attempt score is higher', async () => {
      const improvedSession = {
        ...baseSession,
        attemptNumber: 2,
        totalScore: 95.0,
      };

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            userRank: 3,
            totalParticipants: 100,
          }),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            remainingAttempts: 0,
            maxAttempts: 2,
            bestScore: 85.5, // Previous best score
          }),
        } as any);

      render(<ResultsScreen session={improvedSession} />);

      await waitFor(() => {
        const shareButton = screen.getByText(/share results/i);
        fireEvent.click(shareButton);
      });

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('🚀 Improved from my previous best: 85.50 points!')
        );
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('📊 Score: 95.00 points (Attempt 2)')
        );
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('Can you beat my score? Try today\'s challenge!')
        );
      });
    });

    it('should show friends improvement message for second attempt', async () => {
      const improvedSession = {
        ...baseSession,
        attemptNumber: 2,
        totalScore: 95.0,
      };

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            userRank: 3,
            totalParticipants: 100,
          }),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            remainingAttempts: 0,
            maxAttempts: 2,
            bestScore: 85.5,
          }),
        } as any);

      render(<ResultsScreen session={improvedSession} />);

      await waitFor(() => {
        const friendsButton = screen.getByText(/challenge friends/i);
        fireEvent.click(friendsButton);
      });

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('🚀 Just improved from 85.50 points - getting better at this!')
        );
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('After using both my daily attempts, this is my final score for today!')
        );
      });
    });
  });

  describe('Second Attempt Sharing - Lower Score', () => {
    it('should show best score context when second attempt is lower', async () => {
      const lowerSession = {
        ...baseSession,
        attemptNumber: 2,
        totalScore: 75.0,
      };

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            userRank: 8,
            totalParticipants: 100,
          }),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            remainingAttempts: 0,
            maxAttempts: 2,
            bestScore: 85.5, // Higher than current score
          }),
        } as any);

      render(<ResultsScreen session={lowerSession} />);

      await waitFor(() => {
        const shareButton = screen.getByText(/share results/i);
        fireEvent.click(shareButton);
      });

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('💪 My best today: 85.50 points')
        );
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('📊 Score: 75.00 points (Attempt 2)')
        );
        expect(mockClipboard.writeText).not.toHaveBeenCalledWith(
          expect.stringContaining('Improved from')
        );
      });
    });

    it('should show friends best score context for lower second attempt', async () => {
      const lowerSession = {
        ...baseSession,
        attemptNumber: 2,
        totalScore: 75.0,
      };

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            userRank: 8,
            totalParticipants: 100,
          }),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            remainingAttempts: 0,
            maxAttempts: 2,
            bestScore: 85.5,
          }),
        } as any);

      render(<ResultsScreen session={lowerSession} />);

      await waitFor(() => {
        const friendsButton = screen.getByText(/challenge friends/i);
        fireEvent.click(friendsButton);
      });

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('💪 My best score today is still 85.50 points though!')
        );
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('📊 Final Score: 75.00 points (Attempt 2)')
        );
      });
    });
  });

  describe('Development Mode vs Production Mode', () => {
    it('should handle development mode with unlimited attempts', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            userRank: 5,
            totalParticipants: 100,
          }),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            remainingAttempts: 998, // Development mode
            maxAttempts: 999,
            bestScore: 75.0,
          }),
        } as any);

      render(<ResultsScreen session={baseSession} />);

      await waitFor(() => {
        const shareButton = screen.getByText(/share results/i);
        fireEvent.click(shareButton);
      });

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('I still have 998 attempts left - going for a higher score!')
        );
      });
    });

    it('should handle production mode with limited attempts', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            userRank: 5,
            totalParticipants: 100,
          }),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            remainingAttempts: 0, // Production mode, no attempts left
            maxAttempts: 2,
            bestScore: 75.0,
          }),
        } as any);

      render(<ResultsScreen session={baseSession} />);

      await waitFor(() => {
        const shareButton = screen.getByText(/share results/i);
        fireEvent.click(shareButton);
      });

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('Can you beat my score? Try today\'s challenge!')
        );
        expect(mockClipboard.writeText).not.toHaveBeenCalledWith(
          expect.stringContaining('I still have')
        );
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing play attempts data', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            userRank: 5,
            totalParticipants: 100,
          }),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: false,
            error: 'Play attempts not found',
          }),
        } as any);

      render(<ResultsScreen session={baseSession} />);

      await waitFor(() => {
        const shareButton = screen.getByText(/share results/i);
        fireEvent.click(shareButton);
      });

      await waitFor(() => {
        // Should still generate share message without play limit context
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('🤖 Spot the Bot - Daily Challenge Results 🤖')
        );
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('📊 Score: 85.50 points')
        );
      });
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            userRank: 5,
            totalParticipants: 100,
          }),
        } as any)
        .mockRejectedValueOnce(new Error('API Error'));

      render(<ResultsScreen session={baseSession} />);

      await waitFor(() => {
        const shareButton = screen.getByText(/share results/i);
        fireEvent.click(shareButton);
      });

      await waitFor(() => {
        // Should still generate share message with fallback content
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('🤖 Spot the Bot - Daily Challenge Results 🤖')
        );
      });
    });

    it('should handle equal scores correctly', async () => {
      const equalSession = {
        ...baseSession,
        attemptNumber: 2,
        totalScore: 85.5, // Same as best score
      };

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            userRank: 5,
            totalParticipants: 100,
          }),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            remainingAttempts: 0,
            maxAttempts: 2,
            bestScore: 85.5, // Same as current score
          }),
        } as any);

      render(<ResultsScreen session={equalSession} />);

      await waitFor(() => {
        const shareButton = screen.getByText(/share results/i);
        fireEvent.click(shareButton);
      });

      await waitFor(() => {
        // Should not show improvement or best score context
        expect(mockClipboard.writeText).not.toHaveBeenCalledWith(
          expect.stringContaining('Improved from')
        );
        expect(mockClipboard.writeText).not.toHaveBeenCalledWith(
          expect.stringContaining('My best today:')
        );
      });
    });

    it('should handle single attempt remaining correctly', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            userRank: 5,
            totalParticipants: 100,
          }),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            remainingAttempts: 1,
            maxAttempts: 2,
            bestScore: 75.0,
          }),
        } as any);

      render(<ResultsScreen session={baseSession} />);

      await waitFor(() => {
        const shareButton = screen.getByText(/share results/i);
        fireEvent.click(shareButton);
      });

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('I still have 1 attempt left') // Singular form
        );
      });
    });

    it('should handle multiple attempts remaining correctly', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            userRank: 5,
            totalParticipants: 100,
          }),
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            remainingAttempts: 5,
            maxAttempts: 999, // Development mode
            bestScore: 75.0,
          }),
        } as any);

      render(<ResultsScreen session={baseSession} />);

      await waitFor(() => {
        const friendsButton = screen.getByText(/challenge friends/i);
        fireEvent.click(friendsButton);
      });

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('I still have 5 more attempts today') // Plural form
        );
      });
    });
  });
});
