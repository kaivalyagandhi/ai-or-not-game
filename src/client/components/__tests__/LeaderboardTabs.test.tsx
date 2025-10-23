/**
 * Unit tests for LeaderboardTabs component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LeaderboardTabs } from '../LeaderboardTabs.js';
import { BadgeType } from '../../../shared/types/api.js';

// Mock network calls
const mockApiCall = vi.fn();
vi.mock('../../utils/network.js', () => ({
  apiCall: mockApiCall,
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

const mockLeaderboardData = [
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
    userId: 'user2',
    username: 'player2',
    score: 80,
    correctCount: 4,
    timeBonus: 0,
    completedAt: Date.now(),
    badge: BadgeType.GOOD_SAMARITAN,
  },
  {
    userId: 'user3',
    username: 'player3',
    score: 65,
    correctCount: 3,
    timeBonus: 5,
    completedAt: Date.now(),
    badge: BadgeType.JUST_HUMAN,
  },
];

describe('LeaderboardTabs Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render leaderboard tabs', async () => {
    mockApiCall.mockResolvedValue({
      success: true,
      leaderboard: mockLeaderboardData,
    });

    render(<LeaderboardTabs currentUserId="user2" />);

    // Should show tab buttons
    expect(screen.getByText(/daily/i)).toBeInTheDocument();
    expect(screen.getByText(/weekly/i)).toBeInTheDocument();
    expect(screen.getByText(/all-time/i)).toBeInTheDocument();

    // Should load and display leaderboard data
    await waitFor(() => {
      expect(screen.getByText('player1')).toBeInTheDocument();
      expect(screen.getByText('95')).toBeInTheDocument();
    });
  });

  it('should highlight current user in leaderboard', async () => {
    mockApiCall.mockResolvedValue({
      success: true,
      leaderboard: mockLeaderboardData,
    });

    render(<LeaderboardTabs currentUserId="user2" />);

    await waitFor(() => {
      const userRow = screen.getByText('player2').closest('tr');
      expect(userRow).toHaveClass('bg-blue-50'); // Highlighted row
    });
  });

  it('should switch between leaderboard types', async () => {
    mockApiCall
      .mockResolvedValueOnce({
        success: true,
        leaderboard: mockLeaderboardData,
      })
      .mockResolvedValueOnce({
        success: true,
        leaderboard: [
          {
            userId: 'weekly-user1',
            username: 'weeklyplayer1',
            score: 200,
            correctCount: 5,
            timeBonus: 50,
            completedAt: Date.now(),
            badge: BadgeType.AI_WHISPERER,
          },
        ],
      });

    render(<LeaderboardTabs currentUserId="user2" />);

    // Wait for daily leaderboard to load
    await waitFor(() => {
      expect(screen.getByText('player1')).toBeInTheDocument();
    });

    // Click weekly tab
    const weeklyTab = screen.getByText(/weekly/i);
    fireEvent.click(weeklyTab);

    // Should load weekly leaderboard
    await waitFor(() => {
      expect(screen.getByText('weeklyplayer1')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
    });

    // Should highlight active tab
    expect(weeklyTab).toHaveClass('bg-indigo-600');
  });

  it('should display user ranks correctly', async () => {
    mockApiCall.mockResolvedValue({
      success: true,
      leaderboard: mockLeaderboardData,
    });

    render(<LeaderboardTabs currentUserId="user2" />);

    await waitFor(() => {
      // Should show rank numbers
      expect(screen.getByText('1')).toBeInTheDocument(); // First place
      expect(screen.getByText('2')).toBeInTheDocument(); // Second place
      expect(screen.getByText('3')).toBeInTheDocument(); // Third place
    });
  });

  it('should display badges correctly', async () => {
    mockApiCall.mockResolvedValue({
      success: true,
      leaderboard: mockLeaderboardData,
    });

    render(<LeaderboardTabs currentUserId="user2" />);

    await waitFor(() => {
      expect(screen.getByText(/ai whisperer/i)).toBeInTheDocument();
      expect(screen.getByText(/good samaritan/i)).toBeInTheDocument();
      expect(screen.getByText(/just human/i)).toBeInTheDocument();
    });
  });

  it('should handle empty leaderboard', async () => {
    mockApiCall.mockResolvedValue({
      success: true,
      leaderboard: [],
    });

    render(<LeaderboardTabs currentUserId="user2" />);

    await waitFor(() => {
      expect(screen.getByText(/no players yet/i)).toBeInTheDocument();
    });
  });

  it('should handle loading state', () => {
    mockApiCall.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<LeaderboardTabs currentUserId="user2" />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    mockApiCall.mockRejectedValue(new Error('Network error'));

    render(<LeaderboardTabs currentUserId="user2" />);

    await waitFor(() => {
      expect(screen.getByText(/error loading leaderboard/i)).toBeInTheDocument();
    });
  });

  it('should show correct score formatting', async () => {
    const leaderboardWithDecimals = [
      {
        userId: 'user1',
        username: 'player1',
        score: 95.75,
        correctCount: 5,
        timeBonus: 15.75,
        completedAt: Date.now(),
        badge: BadgeType.AI_WHISPERER,
      },
    ];

    mockApiCall.mockResolvedValue({
      success: true,
      leaderboard: leaderboardWithDecimals,
    });

    render(<LeaderboardTabs currentUserId="user1" />);

    await waitFor(() => {
      expect(screen.getByText('95.75')).toBeInTheDocument();
    });
  });

  it('should handle very long usernames', async () => {
    const leaderboardWithLongNames = [
      {
        userId: 'user1',
        username: 'verylongusernamethatmightcauselayoutissues',
        score: 95,
        correctCount: 5,
        timeBonus: 15,
        completedAt: Date.now(),
        badge: BadgeType.AI_WHISPERER,
      },
    ];

    mockApiCall.mockResolvedValue({
      success: true,
      leaderboard: leaderboardWithLongNames,
    });

    render(<LeaderboardTabs currentUserId="user1" />);

    await waitFor(() => {
      expect(screen.getByText('verylongusernamethatmightcauselayoutissues')).toBeInTheDocument();
    });
  });

  it('should be accessible with proper ARIA labels', async () => {
    mockApiCall.mockResolvedValue({
      success: true,
      leaderboard: mockLeaderboardData,
    });

    render(<LeaderboardTabs currentUserId="user2" />);

    // Should have proper tab roles
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);

    await waitFor(() => {
      // Should have table with proper headers
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText(/rank/i)).toBeInTheDocument();
      expect(screen.getByText(/player/i)).toBeInTheDocument();
      expect(screen.getByText(/score/i)).toBeInTheDocument();
    });
  });
});
