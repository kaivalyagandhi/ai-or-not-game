/**
 * End-to-end tests for complete user workflows
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App.js';
import { BadgeType } from '../../shared/types/api.js';

// Mock network calls
const mockApiCall = vi.fn();
vi.mock('../utils/network.js', () => ({
  apiCall: mockApiCall,
}));

// Mock storage
const mockGameStorage = {
  getSession: vi.fn(),
  saveSession: vi.fn(),
  clearSession: vi.fn(),
  savePendingRequest: vi.fn(),
};
vi.mock('../utils/storage.js', () => ({
  gameStorage: mockGameStorage,
}));

// Mock error handler
vi.mock('../hooks/useErrorHandler.js', () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
    clearError: vi.fn(),
    errorState: { message: null },
    isOnline: true,
  }),
}));

describe('Game Workflow - Complete User Journey', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGameStorage.getSession.mockReturnValue(null);
  });

  it('should complete full game workflow from splash to results', async () => {
    // Mock API responses for complete game flow
    mockApiCall
      // Game initialization
      .mockResolvedValueOnce({
        success: true,
        session: null, // New user
      })
      // Start game
      .mockResolvedValueOnce({
        success: true,
        sessionId: 'test-session-123',
        currentRound: createMockGameRound(1),
      })
      // Submit answers for 5 rounds
      .mockResolvedValueOnce({
        success: true,
        isCorrect: true,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 51,
        gameComplete: false,
        nextRound: createMockGameRound(2),
      })
      .mockResolvedValueOnce({
        success: true,
        isCorrect: false,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 0,
        gameComplete: false,
        nextRound: createMockGameRound(3),
      })
      .mockResolvedValueOnce({
        success: true,
        isCorrect: true,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 41,
        gameComplete: false,
        nextRound: createMockGameRound(4),
      })
      .mockResolvedValueOnce({
        success: true,
        isCorrect: true,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 31,
        gameComplete: false,
        nextRound: createMockGameRound(5),
      })
      .mockResolvedValueOnce({
        success: true,
        isCorrect: true,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 21,
        gameComplete: true,
        finalResults: {
          totalScore: 144,
          correctCount: 4,
          timeBonus: 140,
          badge: BadgeType.GOOD_SAMARITAN,
        },
      });

    render(<App />);

    // 1. Should start on splash screen
    expect(screen.getByText(/spot the bot/i)).toBeInTheDocument();
    expect(screen.getByText(/play/i)).toBeInTheDocument();

    // 2. Click play to start game
    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);

    // Wait for game to initialize and start
    await waitFor(() => {
      expect(screen.getByText(/round 1 of 5/i)).toBeInTheDocument();
    });

    // 3. Play through all 5 rounds
    for (let round = 1; round <= 5; round++) {
      // Should show round info
      expect(screen.getByText(new RegExp(`round ${round} of 5`, 'i'))).toBeInTheDocument();
      expect(screen.getByText(/which image is real/i)).toBeInTheDocument();

      // Should show timer
      expect(screen.getByText('10')).toBeInTheDocument();

      // Should show images
      const imageButtons = screen.getAllByRole('button');
      const imageA = imageButtons.find(btn => btn.textContent?.includes('A'));
      const imageB = imageButtons.find(btn => btn.textContent?.includes('B'));
      
      expect(imageA).toBeInTheDocument();
      expect(imageB).toBeInTheDocument();

      // Click on image A (correct answer)
      fireEvent.click(imageA!);

      // Wait for feedback
      await waitFor(() => {
        if (round < 5) {
          expect(screen.getByText(new RegExp(`round ${round + 1} of 5`, 'i'))).toBeInTheDocument();
        }
      });
    }

    // 4. Should show results screen after completing all rounds
    await waitFor(() => {
      expect(screen.getByText(/game complete/i)).toBeInTheDocument();
      expect(screen.getByText(/144/)).toBeInTheDocument(); // Total score
      expect(screen.getByText(/4.*5/)).toBeInTheDocument(); // 4 out of 5 correct
      expect(screen.getByText(/good samaritan/i)).toBeInTheDocument(); // Badge
    });

    // 5. Should show leaderboard button
    expect(screen.getByText(/view leaderboard/i)).toBeInTheDocument();

    // 6. Should show share button
    expect(screen.getByText(/share/i)).toBeInTheDocument();
  });

  it('should handle returning user who already completed today', async () => {
    // Mock API response for completed user
    mockApiCall.mockResolvedValueOnce({
      success: true,
      session: {
        userId: 'user123',
        sessionId: 'completed-session',
        startTime: Date.now(),
        rounds: [],
        totalScore: 85,
        correctCount: 4,
        totalTimeBonus: 5,
        badge: BadgeType.GOOD_SAMARITAN,
        completed: true,
      },
    });

    render(<App />);

    // Should skip directly to results screen
    await waitFor(() => {
      expect(screen.getByText(/game complete/i)).toBeInTheDocument();
      expect(screen.getByText(/85/)).toBeInTheDocument();
      expect(screen.getByText(/good samaritan/i)).toBeInTheDocument();
    });

    // Should not show play button
    expect(screen.queryByText(/play/i)).not.toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    // Mock network error
    mockApiCall.mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    // Should show error state
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    // Should show retry option
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });

  it('should navigate to leaderboard and back', async () => {
    // Mock completed game state
    mockApiCall.mockResolvedValueOnce({
      success: true,
      session: {
        userId: 'user123',
        sessionId: 'completed-session',
        startTime: Date.now(),
        rounds: [],
        totalScore: 85,
        correctCount: 4,
        totalTimeBonus: 5,
        badge: BadgeType.GOOD_SAMARITAN,
        completed: true,
      },
    });

    // Mock leaderboard data
    mockApiCall.mockResolvedValueOnce({
      success: true,
      leaderboard: [
        {
          userId: 'user1',
          username: 'player1',
          score: 95,
          correctCount: 5,
          timeBonus: 15,
          completedAt: Date.now(),
          badge: BadgeType.AI_WHISPERER,
        },
        {
          userId: 'user123',
          username: 'testuser',
          score: 85,
          correctCount: 4,
          timeBonus: 5,
          completedAt: Date.now(),
          badge: BadgeType.GOOD_SAMARITAN,
        },
      ],
    });

    render(<App />);

    // Wait for results screen
    await waitFor(() => {
      expect(screen.getByText(/game complete/i)).toBeInTheDocument();
    });

    // Click leaderboard button
    const leaderboardButton = screen.getByText(/view leaderboard/i);
    fireEvent.click(leaderboardButton);

    // Should show leaderboard
    await waitFor(() => {
      expect(screen.getByText(/leaderboard/i)).toBeInTheDocument();
      expect(screen.getByText(/player1/i)).toBeInTheDocument();
      expect(screen.getByText(/95/)).toBeInTheDocument();
    });

    // Should show back button
    const backButton = screen.getByText(/back/i);
    fireEvent.click(backButton);

    // Should return to results screen
    await waitFor(() => {
      expect(screen.getByText(/game complete/i)).toBeInTheDocument();
    });
  });
});

describe('Game Workflow - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGameStorage.getSession.mockReturnValue(null);
  });

  it('should handle timeout during round', async () => {
    // Mock game start
    mockApiCall
      .mockResolvedValueOnce({
        success: true,
        session: null,
      })
      .mockResolvedValueOnce({
        success: true,
        sessionId: 'test-session-123',
        currentRound: createMockGameRound(1),
      })
      .mockResolvedValueOnce({
        success: true,
        isCorrect: false,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 0,
        gameComplete: false,
        nextRound: createMockGameRound(2),
      });

    render(<App />);

    // Start game
    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText(/round 1 of 5/i)).toBeInTheDocument();
    });

    // Wait for timer to run down (simulate timeout)
    // Note: In a real test, you might want to mock timers
    await waitFor(() => {
      expect(screen.getByText(/round 2 of 5/i)).toBeInTheDocument();
    }, { timeout: 12000 });
  });

  it('should handle perfect score (5/5 correct)', async () => {
    // Mock perfect game
    mockApiCall
      .mockResolvedValueOnce({
        success: true,
        session: null,
      })
      .mockResolvedValueOnce({
        success: true,
        sessionId: 'test-session-123',
        currentRound: createMockGameRound(1),
      });

    // Mock 5 correct answers
    for (let i = 0; i < 4; i++) {
      mockApiCall.mockResolvedValueOnce({
        success: true,
        isCorrect: true,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 51,
        gameComplete: false,
        nextRound: createMockGameRound(i + 2),
      });
    }

    // Final round
    mockApiCall.mockResolvedValueOnce({
      success: true,
      isCorrect: true,
      correctAnswer: 'A',
      aiImagePosition: 'B',
      roundScore: 51,
      gameComplete: true,
      finalResults: {
        totalScore: 255,
        correctCount: 5,
        timeBonus: 250,
        badge: BadgeType.AI_WHISPERER,
      },
    });

    render(<App />);

    // Play through game
    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText(/round 1 of 5/i)).toBeInTheDocument();
    });

    // Click through all rounds quickly
    for (let round = 1; round <= 5; round++) {
      const imageButtons = screen.getAllByRole('button');
      const imageA = imageButtons.find(btn => btn.textContent?.includes('A'));
      fireEvent.click(imageA!);

      if (round < 5) {
        await waitFor(() => {
          expect(screen.getByText(new RegExp(`round ${round + 1} of 5`, 'i'))).toBeInTheDocument();
        });
      }
    }

    // Should show perfect score results
    await waitFor(() => {
      expect(screen.getByText(/ai whisperer/i)).toBeInTheDocument();
      expect(screen.getByText(/255/)).toBeInTheDocument();
      expect(screen.getByText(/5.*5/)).toBeInTheDocument();
    });
  });

  it('should handle poor score (0/5 correct)', async () => {
    // Mock poor performance game
    mockApiCall
      .mockResolvedValueOnce({
        success: true,
        session: null,
      })
      .mockResolvedValueOnce({
        success: true,
        sessionId: 'test-session-123',
        currentRound: createMockGameRound(1),
      });

    // Mock 5 incorrect answers
    for (let i = 0; i < 4; i++) {
      mockApiCall.mockResolvedValueOnce({
        success: true,
        isCorrect: false,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 0,
        gameComplete: false,
        nextRound: createMockGameRound(i + 2),
      });
    }

    // Final round
    mockApiCall.mockResolvedValueOnce({
      success: true,
      isCorrect: false,
      correctAnswer: 'A',
      aiImagePosition: 'B',
      roundScore: 0,
      gameComplete: true,
      finalResults: {
        totalScore: 0,
        correctCount: 0,
        timeBonus: 0,
        badge: BadgeType.HUMAN_IN_TRAINING,
      },
    });

    render(<App />);

    // Play through game
    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText(/round 1 of 5/i)).toBeInTheDocument();
    });

    // Click wrong answers for all rounds
    for (let round = 1; round <= 5; round++) {
      const imageButtons = screen.getAllByRole('button');
      const imageB = imageButtons.find(btn => btn.textContent?.includes('B'));
      fireEvent.click(imageB!);

      if (round < 5) {
        await waitFor(() => {
          expect(screen.getByText(new RegExp(`round ${round + 1} of 5`, 'i'))).toBeInTheDocument();
        });
      }
    }

    // Should show poor score results
    await waitFor(() => {
      expect(screen.getByText(/human in training/i)).toBeInTheDocument();
      expect(screen.getByText(/0.*5/)).toBeInTheDocument();
    });
  });
});

describe('Game Workflow - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGameStorage.getSession.mockReturnValue(null);
  });

  it('should have proper ARIA labels and roles', async () => {
    mockApiCall.mockResolvedValueOnce({
      success: true,
      session: null,
    });

    render(<App />);

    // Check splash screen accessibility
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    expect(screen.getByText(/spot the bot/i)).toBeInTheDocument();
  });

  it('should support keyboard navigation', async () => {
    mockApiCall
      .mockResolvedValueOnce({
        success: true,
        session: null,
      })
      .mockResolvedValueOnce({
        success: true,
        sessionId: 'test-session-123',
        currentRound: createMockGameRound(1),
      });

    render(<App />);

    // Should be able to navigate with keyboard
    const playButton = screen.getByRole('button', { name: /play/i });
    
    // Focus and activate with keyboard
    playButton.focus();
    expect(playButton).toHaveFocus();
    
    fireEvent.keyDown(playButton, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText(/round 1 of 5/i)).toBeInTheDocument();
    });
  });

  it('should have proper alt text for images', async () => {
    mockApiCall
      .mockResolvedValueOnce({
        success: true,
        session: null,
      })
      .mockResolvedValueOnce({
        success: true,
        sessionId: 'test-session-123',
        currentRound: createMockGameRound(1),
      });

    render(<App />);

    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText(/round 1 of 5/i)).toBeInTheDocument();
    });

    // Check that images have proper alt text
    const images = screen.getAllByRole('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
      expect(img.getAttribute('alt')).not.toBe('');
    });
  });
});
