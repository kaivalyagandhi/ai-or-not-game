/**
 * Unit tests for enhanced sharing functionality in ResultsScreen
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResultsScreen } from '../ResultsScreen.js';
import { BadgeType } from '../../../shared/types/api.js';

// Mock fetch
global.fetch = vi.fn();

// Mock navigator.share and navigator.clipboard
const mockShare = vi.fn();
const mockClipboard = {
  writeText: vi.fn(),
};

Object.defineProperty(navigator, 'share', {
  value: mockShare,
  writable: true,
});

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

describe('ResultsScreen - Enhanced Sharing Functionality', () => {
  const mockSession = {
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
    
    // Mock API responses
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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render both sharing buttons', async () => {
    render(<ResultsScreen session={mockSession} />);

    await waitFor(() => {
      expect(screen.getByText(/share results/i)).toBeInTheDocument();
      expect(screen.getByText(/challenge friends/i)).toBeInTheDocument();
    });
  });

  it('should generate correct general share message', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<ResultsScreen session={mockSession} />);

    await waitFor(() => {
      const shareButton = screen.getByText(/share results/i);
      fireEvent.click(shareButton);
    });

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('🤖 Spot the Bot - Daily Challenge Results 🤖')
      );
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('📊 Score: 85.50 points')
      );
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('✅ Correct: 4/6')
      );
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('🏆 Badge: 👁️ Good Samaritan')
      );
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('📈 Rank: #5 of 100')
      );
    });
  });

  it('should generate correct friends share message', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<ResultsScreen session={mockSession} />);

    await waitFor(() => {
      const friendsButton = screen.getByText(/challenge friends/i);
      fireEvent.click(friendsButton);
    });

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('Hey friends! 👋 Just finished today\'s Spot the Bot challenge:')
      );
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('📊 Final Score: 85.50 points')
      );
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('✅ Correct Guesses: 4/6 images')
      );
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('Think you can spot AI better than me?')
      );
    });
  });

  it('should use native sharing when available', async () => {
    mockShare.mockResolvedValue(undefined);

    render(<ResultsScreen session={mockSession} />);

    await waitFor(() => {
      const shareButton = screen.getByText(/share results/i);
      fireEvent.click(shareButton);
    });

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: 'Spot the Bot - My Results',
        text: expect.stringContaining('🤖 Spot the Bot - Daily Challenge Results 🤖'),
      });
    });
  });

  it('should fallback to clipboard when native sharing fails', async () => {
    mockShare.mockRejectedValue(new Error('Share not supported'));
    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<ResultsScreen session={mockSession} />);

    await waitFor(() => {
      const shareButton = screen.getByText(/share results/i);
      fireEvent.click(shareButton);
    });

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalled();
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });
  });

  it('should show toast notification when copying to clipboard', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);
    // Disable native sharing to force clipboard usage
    Object.defineProperty(navigator, 'share', { value: undefined });

    render(<ResultsScreen session={mockSession} />);

    await waitFor(() => {
      const shareButton = screen.getByText(/share results/i);
      fireEvent.click(shareButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/results copied to clipboard/i)).toBeInTheDocument();
    });

    // Restore native sharing
    Object.defineProperty(navigator, 'share', { value: mockShare });
  });

  it('should handle clipboard errors gracefully', async () => {
    mockClipboard.writeText.mockRejectedValue(new Error('Clipboard not available'));
    Object.defineProperty(navigator, 'share', { value: undefined });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ResultsScreen session={mockSession} />);

    await waitFor(() => {
      const shareButton = screen.getByText(/share results/i);
      fireEvent.click(shareButton);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Clipboard error:', expect.any(Error));
    });

    consoleSpy.mockRestore();
    Object.defineProperty(navigator, 'share', { value: mockShare });
  });

  it('should include attempt number in share message for multiple attempts', async () => {
    const multiAttemptSession = {
      ...mockSession,
      attemptNumber: 2,
      totalScore: 95.0,
    };

    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<ResultsScreen session={multiAttemptSession} />);

    await waitFor(() => {
      const shareButton = screen.getByText(/share results/i);
      fireEvent.click(shareButton);
    });

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('📊 Score: 95.00 points (Attempt 2)')
      );
    });
  });

  it('should show improvement message when score improved', async () => {
    const improvedSession = {
      ...mockSession,
      attemptNumber: 2,
      totalScore: 90.0,
    };

    // Mock API to return lower best score
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
          bestScore: 75.0, // Lower than current score
        }),
      } as any);

    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<ResultsScreen session={improvedSession} />);

    await waitFor(() => {
      const shareButton = screen.getByText(/share results/i);
      fireEvent.click(shareButton);
    });

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('🚀 Improved from my previous best: 75.00 points!')
      );
    });
  });

  it('should show best score context when current score is lower', async () => {
    const lowerScoreSession = {
      ...mockSession,
      attemptNumber: 2,
      totalScore: 70.0,
    };

    // Mock API to return higher best score
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          userRank: 10,
          totalParticipants: 100,
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          remainingAttempts: 0,
          maxAttempts: 2,
          bestScore: 85.0, // Higher than current score
        }),
      } as any);

    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<ResultsScreen session={lowerScoreSession} />);

    await waitFor(() => {
      const shareButton = screen.getByText(/share results/i);
      fireEvent.click(shareButton);
    });

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('💪 My best today: 85.00 points')
      );
    });
  });

  it('should show different challenge text based on remaining attempts', async () => {
    // Test with remaining attempts
    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<ResultsScreen session={mockSession} />);

    await waitFor(() => {
      const shareButton = screen.getByText(/share results/i);
      fireEvent.click(shareButton);
    });

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('I still have 1 attempt left - going for a higher score!')
      );
    });
  });

  it('should show different challenge text when no attempts remain', async () => {
    // Mock API to return no remaining attempts
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
          bestScore: 75.0,
        }),
      } as any);

    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<ResultsScreen session={mockSession} />);

    await waitFor(() => {
      const shareButton = screen.getByText(/share results/i);
      fireEvent.click(shareButton);
    });

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('Can you beat my score? Try today\'s challenge!')
      );
    });
  });

  it('should handle different badge types in share messages', async () => {
    const perfectSession = {
      ...mockSession,
      correctCount: 6,
      totalScore: 106.0,
      badge: BadgeType.AI_WHISPERER,
    };

    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<ResultsScreen session={perfectSession} />);

    await waitFor(() => {
      const shareButton = screen.getByText(/share results/i);
      fireEvent.click(shareButton);
    });

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('🏆 Badge: 🤖 AI Whisperer')
      );
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('✅ Correct: 6/6')
      );
    });
  });

  it('should handle missing leaderboard position gracefully', async () => {
    // Mock API to return no rank
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          userRank: null,
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

    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<ResultsScreen session={mockSession} />);

    await waitFor(() => {
      const shareButton = screen.getByText(/share results/i);
      fireEvent.click(shareButton);
    });

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('📈 Rank: Unranked')
      );
    });
  });

  it('should handle API errors gracefully', async () => {
    // Mock API to fail
    vi.mocked(fetch).mockRejectedValue(new Error('API Error'));

    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<ResultsScreen session={mockSession} />);

    await waitFor(() => {
      const shareButton = screen.getByText(/share results/i);
      fireEvent.click(shareButton);
    });

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('📈 Rank: Unranked')
      );
    });
  });

  it('should show different friends message based on attempts remaining', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<ResultsScreen session={mockSession} />);

    await waitFor(() => {
      const friendsButton = screen.getByText(/challenge friends/i);
      fireEvent.click(friendsButton);
    });

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('I still have 1 more attempt today - going to try to beat this score!')
      );
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('Want to see if you can beat me before I get my next try? 😏')
      );
    });
  });

  it('should show final score message when no attempts remain', async () => {
    // Mock API to return no remaining attempts
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
          bestScore: 75.0,
        }),
      } as any);

    const finalSession = {
      ...mockSession,
      attemptNumber: 2,
    };

    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<ResultsScreen session={finalSession} />);

    await waitFor(() => {
      const friendsButton = screen.getByText(/challenge friends/i);
      fireEvent.click(friendsButton);
    });

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('After using both my daily attempts, this is my final score for today!')
      );
      expect(mockClipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('Think you can spot AI better than me? You get 2 attempts per day - give it a shot! 🎯')
      );
    });
  });

  it('should handle concurrent sharing attempts', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined);

    render(<ResultsScreen session={mockSession} />);

    await waitFor(() => {
      const shareButton = screen.getByText(/share results/i);
      const friendsButton = screen.getByText(/challenge friends/i);
      
      // Click both buttons rapidly
      fireEvent.click(shareButton);
      fireEvent.click(friendsButton);
    });

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalledTimes(2);
    });
  });
});
