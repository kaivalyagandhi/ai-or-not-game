/**
 * Integration tests for complete 6-round gameplay with all enhancements
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App.js';
import { BadgeType } from '../../shared/types/api.js';

// Mock all external dependencies
global.fetch = vi.fn();

// Mock navigator APIs
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: vi.fn() },
  writable: true,
});

Object.defineProperty(navigator, 'share', {
  value: vi.fn(),
  writable: true,
});

// Mock audio context
global.AudioContext = vi.fn(() => ({
  state: 'running',
  resume: vi.fn(),
})) as any;

global.Audio = vi.fn(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  volume: 0.7,
  currentTime: 0,
  loop: false,
})) as any;

// Mock storage
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockStorage });

// Mock realtime connection
vi.mock('@devvit/web/client', () => ({
  connectRealtime: vi.fn().mockResolvedValue({
    disconnect: vi.fn(),
  }),
}));

// Mock content utilities
vi.mock('../utils/content.js', () => ({
  fetchCurrentContentCached: vi.fn().mockResolvedValue({
    success: true,
    tip: 'Look for unnatural lighting or shadows.',
    fact: 'AI image generators learn from millions of photos.',
    inspiration: 'Every expert was once a beginner.',
  }),
}));

describe('Complete 6-Round Gameplay Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createMockGameRound = (roundNumber: number) => ({
    roundNumber,
    category: 'Animals' as const,
    imageA: {
      id: `img-a-${roundNumber}`,
      url: `https://example.com/image-a-${roundNumber}.jpg`,
      category: 'Animals' as const,
      isAI: false,
      metadata: {
        source: 'human',
        description: `A real photo - round ${roundNumber}`,
      },
    },
    imageB: {
      id: `img-b-${roundNumber}`,
      url: `https://example.com/image-b-${roundNumber}.jpg`,
      category: 'Animals' as const,
      isAI: true,
      metadata: {
        source: 'ai',
        description: `An AI-generated image - round ${roundNumber}`,
      },
    },
    correctAnswer: 'A' as const,
    aiImagePosition: 'B' as const,
  });

  const setupCompleteGameplayMocks = () => {
    vi.mocked(fetch)
      // Game initialization
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          session: null,
        }),
      } as any)
      // Start game
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          sessionId: 'test-session-123',
          currentRound: createMockGameRound(1),
        }),
      } as any)
      // Round 1 submission
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          isCorrect: true,
          correctAnswer: 'A',
          aiImagePosition: 'B',
          roundScore: 51,
          gameComplete: false,
          nextRound: createMockGameRound(2),
        }),
      } as any)
      // Round 2 submission
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          isCorrect: false,
          correctAnswer: 'A',
          aiImagePosition: 'B',
          roundScore: 0,
          gameComplete: false,
          nextRound: createMockGameRound(3),
        }),
      } as any)
      // Round 3 submission
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          isCorrect: true,
          correctAnswer: 'A',
          aiImagePosition: 'B',
          roundScore: 41,
          gameComplete: false,
          nextRound: createMockGameRound(4),
        }),
      } as any)
      // Round 4 submission (after educational content)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          isCorrect: true,
          correctAnswer: 'A',
          aiImagePosition: 'B',
          roundScore: 31,
          gameComplete: false,
          nextRound: createMockGameRound(5),
        }),
      } as any)
      // Round 5 submission
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          isCorrect: true,
          correctAnswer: 'A',
          aiImagePosition: 'B',
          roundScore: 21,
          gameComplete: false,
          nextRound: createMockGameRound(6),
        }),
      } as any)
      // Round 6 submission (final)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          isCorrect: true,
          correctAnswer: 'A',
          aiImagePosition: 'B',
          roundScore: 11,
          gameComplete: true,
          finalResults: {
            totalScore: 155,
            correctCount: 5,
            timeBonus: 150,
            badge: BadgeType.AI_DETECTIVE,
          },
        }),
      } as any)
      // Leaderboard position
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          userRank: 3,
          totalParticipants: 50,
        }),
      } as any)
      // Play attempts
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          remainingAttempts: 1,
          maxAttempts: 2,
          bestScore: 0,
        }),
      } as any);
  };

  it('should complete full 6-round gameplay with all enhancements', async () => {
    setupCompleteGameplayMocks();

    render(<App />);

    // 1. Start from splash screen
    expect(screen.getByText(/ai or not/i)).toBeInTheDocument();
    
    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);

    // 2. Round 1 - should show 6-round progression
    await waitFor(() => {
      expect(screen.getByText(/round 1 of 6/i)).toBeInTheDocument();
      expect(screen.getByText(/which image is not ai/i)).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // 10-second timer
    });

    // Play round 1
    const round1ImageA = screen.getAllByRole('button')[0];
    fireEvent.click(round1ImageA);

    // 3. Round 2
    await waitFor(() => {
      expect(screen.getByText(/round 2 of 6/i)).toBeInTheDocument();
    });

    const round2ImageB = screen.getAllByRole('button')[1];
    fireEvent.click(round2ImageB);

    // 4. Round 3
    await waitFor(() => {
      expect(screen.getByText(/round 3 of 6/i)).toBeInTheDocument();
    });

    const round3ImageA = screen.getAllByRole('button')[0];
    fireEvent.click(round3ImageA);

    // 5. Educational content should appear after round 3
    await waitFor(() => {
      expect(screen.getByText(/midgame learning break/i)).toBeInTheDocument();
      expect(screen.getByText(/detection tip/i)).toBeInTheDocument();
      expect(screen.getByText(/ai fact/i)).toBeInTheDocument();
      expect(screen.getByText(/3 of 6 rounds complete/i)).toBeInTheDocument();
    });

    // Continue to round 4
    const continueButton = screen.getByText(/continue to round 4/i);
    fireEvent.click(continueButton);

    // 6. Round 4 (after educational content)
    await waitFor(() => {
      expect(screen.getByText(/round 4 of 6/i)).toBeInTheDocument();
    });

    const round4ImageA = screen.getAllByRole('button')[0];
    fireEvent.click(round4ImageA);

    // 7. Round 5
    await waitFor(() => {
      expect(screen.getByText(/round 5 of 6/i)).toBeInTheDocument();
    });

    const round5ImageA = screen.getAllByRole('button')[0];
    fireEvent.click(round5ImageA);

    // 8. Round 6 (final round)
    await waitFor(() => {
      expect(screen.getByText(/round 6 of 6/i)).toBeInTheDocument();
    });

    const round6ImageA = screen.getAllByRole('button')[0];
    fireEvent.click(round6ImageA);

    // 9. Results screen with all enhancements
    await waitFor(() => {
      expect(screen.getByText(/challenge complete/i)).toBeInTheDocument();
      expect(screen.getByText('155.00')).toBeInTheDocument(); // Total score
      expect(screen.getByText(/5.*6/)).toBeInTheDocument(); // 5 out of 6 correct
      expect(screen.getByText(/ai detective/i)).toBeInTheDocument(); // Badge for 5/6
      expect(screen.getByText(/#3/)).toBeInTheDocument(); // Leaderboard position
    });

    // 10. Enhanced sharing options
    expect(screen.getByText(/share results/i)).toBeInTheDocument();
    expect(screen.getByText(/challenge friends/i)).toBeInTheDocument();

    // 11. Play again option (with remaining attempts)
    expect(screen.getByText(/play again.*1 left/i)).toBeInTheDocument();

    // 12. Inspirational content
    expect(screen.getByText(/every expert was once a beginner/i)).toBeInTheDocument();
  }, 30000); // Extended timeout for full gameplay

  it('should handle Science category in 6-round gameplay', async () => {
    const scienceRound = {
      ...createMockGameRound(1),
      category: 'Science' as const,
      imageA: {
        ...createMockGameRound(1).imageA,
        category: 'Science' as const,
      },
      imageB: {
        ...createMockGameRound(1).imageB,
        category: 'Science' as const,
      },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, session: null }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          sessionId: 'test-session',
          currentRound: scienceRound,
        }),
      } as any);

    render(<App />);

    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText(/category: science/i)).toBeInTheDocument();
    });
  });

  it('should show correct badge for perfect 6/6 score', async () => {
    // Mock perfect game (all 6 correct)
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, session: null }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          sessionId: 'test-session',
          currentRound: createMockGameRound(1),
        }),
      } as any);

    // Mock 6 correct answers
    for (let i = 0; i < 5; i++) {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          isCorrect: true,
          correctAnswer: 'A',
          aiImagePosition: 'B',
          roundScore: 51,
          gameComplete: false,
          nextRound: createMockGameRound(i + 2),
        }),
      } as any);
    }

    // Final round with perfect score
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        isCorrect: true,
        correctAnswer: 'A',
        aiImagePosition: 'B',
        roundScore: 51,
        gameComplete: true,
        finalResults: {
          totalScore: 306,
          correctCount: 6,
          timeBonus: 300,
          badge: BadgeType.AI_WHISPERER,
        },
      }),
    } as any);

    // Mock results screen APIs
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          userRank: 1,
          totalParticipants: 50,
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

    render(<App />);

    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);

    // Play through all 6 rounds quickly
    for (let round = 1; round <= 6; round++) {
      await waitFor(() => {
        expect(screen.getByText(new RegExp(`round ${round} of 6`, 'i'))).toBeInTheDocument();
      });

      if (round === 3) {
        // Handle educational content after round 3
        const imageA = screen.getAllByRole('button')[0];
        fireEvent.click(imageA);

        await waitFor(() => {
          expect(screen.getByText(/midgame learning break/i)).toBeInTheDocument();
        });

        const continueButton = screen.getByText(/continue to round 4/i);
        fireEvent.click(continueButton);
      } else {
        const imageA = screen.getAllByRole('button')[0];
        fireEvent.click(imageA);
      }
    }

    // Should show AI Whisperer badge for perfect score
    await waitFor(() => {
      expect(screen.getByText(/ai whisperer/i)).toBeInTheDocument();
      expect(screen.getByText('306.00')).toBeInTheDocument();
      expect(screen.getByText(/6.*6/)).toBeInTheDocument();
    });
  }, 30000);

  it('should handle responsive layout throughout complete gameplay', async () => {
    setupCompleteGameplayMocks();

    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      value: 375,
      configurable: true,
    });

    render(<App />);

    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);

    // Check responsive layout in round 1
    await waitFor(() => {
      expect(screen.getByText(/round 1 of 6/i)).toBeInTheDocument();
    });

    const imageContainer = document.querySelector('.image-container');
    expect(imageContainer).toBeInTheDocument();

    // Play through to educational content
    const round1ImageA = screen.getAllByRole('button')[0];
    fireEvent.click(round1ImageA);

    await waitFor(() => {
      const round2ImageB = screen.getAllByRole('button')[1];
      fireEvent.click(round2ImageB);
    });

    await waitFor(() => {
      const round3ImageA = screen.getAllByRole('button')[0];
      fireEvent.click(round3ImageA);
    });

    // Educational content should be responsive
    await waitFor(() => {
      expect(screen.getByText(/midgame learning break/i)).toBeInTheDocument();
      const educationalContainer = screen.getByText(/midgame learning break/i).closest('div');
      expect(educationalContainer).toHaveClass('max-w-2xl');
    });
  }, 30000);

  it('should integrate audio system throughout complete gameplay', async () => {
    setupCompleteGameplayMocks();

    const mockAudio = {
      play: vi.fn(),
      pause: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      volume: 0.7,
      currentTime: 0,
      loop: false,
      cloneNode: vi.fn(),
    };

    mockAudio.cloneNode.mockReturnValue(mockAudio);
    global.Audio = vi.fn(() => mockAudio) as any;

    render(<App />);

    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText(/round 1 of 6/i)).toBeInTheDocument();
    });

    // Audio system should be present
    const audioButton = screen.getByRole('button', { name: /toggle audio controls/i });
    expect(audioButton).toBeInTheDocument();

    // Click should trigger audio
    const round1ImageA = screen.getAllByRole('button')[0];
    fireEvent.click(round1ImageA);

    // Audio should be initialized
    expect(global.Audio).toHaveBeenCalled();
  }, 30000);

  it('should handle play limit integration throughout gameplay', async () => {
    setupCompleteGameplayMocks();

    render(<App />);

    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);

    // Complete full gameplay
    for (let round = 1; round <= 6; round++) {
      await waitFor(() => {
        expect(screen.getByText(new RegExp(`round ${round} of 6`, 'i'))).toBeInTheDocument();
      });

      if (round === 3) {
        const imageA = screen.getAllByRole('button')[0];
        fireEvent.click(imageA);

        await waitFor(() => {
          const continueButton = screen.getByText(/continue to round 4/i);
          fireEvent.click(continueButton);
        });
      } else {
        const imageA = screen.getAllByRole('button')[0];
        fireEvent.click(imageA);
      }
    }

    // Results should show play limit integration
    await waitFor(() => {
      expect(screen.getByText(/challenge complete/i)).toBeInTheDocument();
      expect(screen.getByText(/play again.*1 left/i)).toBeInTheDocument();
    });
  }, 30000);

  it('should handle visual feedback throughout complete gameplay', async () => {
    setupCompleteGameplayMocks();

    render(<App />);

    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText(/round 1 of 6/i)).toBeInTheDocument();
    });

    // Test visual feedback on selection
    const round1ImageA = screen.getAllByRole('button')[0];
    fireEvent.click(round1ImageA);

    await waitFor(() => {
      // Should show visual feedback
      expect(round1ImageA).toHaveClass('selected');
    });

    // Continue through gameplay to test consistent feedback
    await waitFor(() => {
      expect(screen.getByText(/round 2 of 6/i)).toBeInTheDocument();
    });

    const round2ImageB = screen.getAllByRole('button')[1];
    fireEvent.click(round2ImageB);

    await waitFor(() => {
      expect(round2ImageB).toHaveClass('selected');
    });
  }, 30000);

  it('should handle error scenarios during complete gameplay', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, session: null }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          sessionId: 'test-session',
          currentRound: createMockGameRound(1),
        }),
      } as any)
      // Simulate network error during round 1
      .mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText(/round 1 of 6/i)).toBeInTheDocument();
    });

    const round1ImageA = screen.getAllByRole('button')[0];
    fireEvent.click(round1ImageA);

    // Should handle error gracefully and continue
    await waitFor(() => {
      // Game should continue despite network error
      expect(screen.getByText(/checking your answer/i)).toBeInTheDocument();
    });
  }, 30000);
});

describe('Complete Gameplay - Performance and Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle rapid user interactions during gameplay', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, session: null }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          sessionId: 'test-session',
          currentRound: createMockGameRound(1),
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          isCorrect: true,
          correctAnswer: 'A',
          aiImagePosition: 'B',
          roundScore: 51,
          gameComplete: false,
          nextRound: createMockGameRound(2),
        }),
      } as any);

    render(<App />);

    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText(/round 1 of 6/i)).toBeInTheDocument();
    });

    const imageA = screen.getAllByRole('button')[0];
    const imageB = screen.getAllByRole('button')[1];

    // Rapid clicks should be handled properly
    fireEvent.click(imageA);
    fireEvent.click(imageB); // Should be ignored
    fireEvent.click(imageA); // Should be ignored

    await waitFor(() => {
      expect(imageA).toHaveClass('selected');
      expect(imageB).not.toHaveClass('selected');
    });
  });

  it('should handle timer expiration during gameplay', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, session: null }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          sessionId: 'test-session',
          currentRound: createMockGameRound(1),
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          isCorrect: false,
          correctAnswer: 'A',
          aiImagePosition: 'B',
          roundScore: 0,
          gameComplete: false,
          nextRound: createMockGameRound(2),
        }),
      } as any);

    render(<App />);

    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText(/round 1 of 6/i)).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    // Wait for timer to count down (mocked to be faster)
    await waitFor(() => {
      expect(screen.getByText(/round 2 of 6/i)).toBeInTheDocument();
    }, { timeout: 20000 });
  });

  it('should maintain state consistency throughout complete gameplay', async () => {
    const gameState = {
      currentRound: 1,
      totalScore: 0,
      correctCount: 0,
    };

    // Mock consistent state updates
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, session: null }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          sessionId: 'test-session',
          currentRound: createMockGameRound(1),
        }),
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          isCorrect: true,
          correctAnswer: 'A',
          aiImagePosition: 'B',
          roundScore: 51,
          gameComplete: false,
          nextRound: createMockGameRound(2),
        }),
      } as any);

    render(<App />);

    const playButton = screen.getByText(/play/i);
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByText(/round 1 of 6/i)).toBeInTheDocument();
    });

    // State should be consistent
    expect(screen.getByText(/round 1 of 6/i)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    const imageA = screen.getAllByRole('button')[0];
    fireEvent.click(imageA);

    await waitFor(() => {
      expect(screen.getByText(/round 2 of 6/i)).toBeInTheDocument();
    });
  });
});

const createMockGameRound = (roundNumber: number) => ({
  roundNumber,
  category: 'Animals' as const,
  imageA: {
    id: `img-a-${roundNumber}`,
    url: `https://example.com/image-a-${roundNumber}.jpg`,
    category: 'Animals' as const,
    isAI: false,
    metadata: {
      source: 'human',
      description: `A real photo - round ${roundNumber}`,
    },
  },
  imageB: {
    id: `img-b-${roundNumber}`,
    url: `https://example.com/image-b-${roundNumber}.jpg`,
    category: 'Animals' as const,
    isAI: true,
    metadata: {
      source: 'ai',
      description: `An AI-generated image - round ${roundNumber}`,
    },
  },
  correctAnswer: 'A' as const,
  aiImagePosition: 'B' as const,
});
