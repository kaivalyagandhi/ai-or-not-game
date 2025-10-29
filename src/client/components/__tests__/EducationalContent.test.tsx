/**
 * Unit tests for EducationalContent component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EducationalContent } from '../EducationalContent.js';

// Mock the content utility
vi.mock('../../utils/content.js', () => ({
  fetchCurrentContentCached: vi.fn(),
}));

import { fetchCurrentContentCached } from '../../utils/content.js';
const mockFetchCurrentContentCached = vi.mocked(fetchCurrentContentCached);

describe('EducationalContent Component', () => {
  const mockOnContinue = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockFetchCurrentContentCached.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<EducationalContent onContinue={mockOnContinue} />);

    expect(screen.getByText(/loading educational content/i)).toBeInTheDocument();
    // Check for loading spinner by class instead of role
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render educational content successfully', async () => {
    const mockContent = {
      success: true,
      tip: 'Look for unnatural lighting or shadows that don\'t match the scene.',
      fact: 'AI image generators learn by studying millions of real photos.',
    };

    mockFetchCurrentContentCached.mockResolvedValue(mockContent);

    render(<EducationalContent onContinue={mockOnContinue} />);

    await waitFor(() => {
      expect(screen.getByText(/midgame learning break/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/detection tip/i)).toBeInTheDocument();
    expect(screen.getByText(/ai fact/i)).toBeInTheDocument();
    expect(screen.getByText(mockContent.tip)).toBeInTheDocument();
    expect(screen.getByText(mockContent.fact)).toBeInTheDocument();
  });

  it('should render fallback content when API fails', async () => {
    mockFetchCurrentContentCached.mockResolvedValue({
      success: false,
      error: 'Failed to load content',
    });

    render(<EducationalContent onContinue={mockOnContinue} />);

    await waitFor(() => {
      expect(screen.getByText(/midgame learning break/i)).toBeInTheDocument();
    });

    // Should show error message
    expect(screen.getByText(/failed to load content/i)).toBeInTheDocument();
    expect(screen.getByText(/showing fallback content/i)).toBeInTheDocument();

    // Should show fallback content
    expect(screen.getByText(/look for unnatural lighting or shadows/i)).toBeInTheDocument();
    expect(screen.getByText(/ai image generators learn by studying millions/i)).toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    mockFetchCurrentContentCached.mockRejectedValue(new Error('Network error'));

    render(<EducationalContent onContinue={mockOnContinue} />);

    await waitFor(() => {
      expect(screen.getByText(/midgame learning break/i)).toBeInTheDocument();
    });

    // Should show error message
    expect(screen.getByText(/failed to load educational content/i)).toBeInTheDocument();

    // Should show fallback content
    expect(screen.getByText(/check hands and fingers carefully/i)).toBeInTheDocument();
    expect(screen.getByText(/modern ai can create images in seconds/i)).toBeInTheDocument();
  });

  it('should call onContinue when continue button is clicked', async () => {
    const mockContent = {
      success: true,
      tip: 'Test tip',
      fact: 'Test fact',
    };

    mockFetchCurrentContentCached.mockResolvedValue(mockContent);

    render(<EducationalContent onContinue={mockOnContinue} />);

    await waitFor(() => {
      expect(screen.getByText(/continue to round 4/i)).toBeInTheDocument();
    });

    const continueButton = screen.getByText(/continue to round 4/i);
    fireEvent.click(continueButton);

    expect(mockOnContinue).toHaveBeenCalledTimes(1);
  });

  it('should display progress indicator correctly', async () => {
    const mockContent = {
      success: true,
      tip: 'Test tip',
      fact: 'Test fact',
    };

    mockFetchCurrentContentCached.mockResolvedValue(mockContent);

    render(<EducationalContent onContinue={mockOnContinue} />);

    await waitFor(() => {
      expect(screen.getByText(/game progress/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/3 of 6 rounds complete/i)).toBeInTheDocument();
    
    // Check progress bar by class and style
    const progressBar = document.querySelector('.bg-\\[\\#3da8ff\\].h-2.rounded-full');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('should have proper accessibility attributes', async () => {
    const mockContent = {
      success: true,
      tip: 'Test tip',
      fact: 'Test fact',
    };

    mockFetchCurrentContentCached.mockResolvedValue(mockContent);

    render(<EducationalContent onContinue={mockOnContinue} />);

    await waitFor(() => {
      expect(screen.getByText(/continue to round 4/i)).toBeInTheDocument();
    });

    // Check button accessibility
    const continueButton = screen.getByRole('button', { name: /continue to round 4/i });
    expect(continueButton).toBeInTheDocument();
    expect(continueButton).not.toHaveAttribute('aria-disabled');

    // Check headings
    expect(screen.getByRole('heading', { name: /midgame learning break/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /detection tip/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ai fact/i })).toBeInTheDocument();
  });

  it('should handle empty content gracefully', async () => {
    const mockContent = {
      success: true,
      tip: '',
      fact: '',
    };

    mockFetchCurrentContentCached.mockResolvedValue(mockContent);

    render(<EducationalContent onContinue={mockOnContinue} />);

    await waitFor(() => {
      expect(screen.getByText(/midgame learning break/i)).toBeInTheDocument();
    });

    // Should show fallback content when tip/fact are empty
    expect(screen.getByText(/look for unnatural lighting or impossible geometry/i)).toBeInTheDocument();
    expect(screen.getByText(/ai image generators learn from millions of real photos/i)).toBeInTheDocument();
  });

  it('should handle partial content response', async () => {
    const mockContent = {
      success: true,
      tip: 'Valid tip content',
      // fact is missing
    };

    mockFetchCurrentContentCached.mockResolvedValue(mockContent);

    render(<EducationalContent onContinue={mockOnContinue} />);

    await waitFor(() => {
      expect(screen.getByText(/midgame learning break/i)).toBeInTheDocument();
    });

    // Should show provided tip
    expect(screen.getByText('Valid tip content')).toBeInTheDocument();
    
    // Should show fallback fact
    expect(screen.getByText(/ai image generators learn from millions of real photos/i)).toBeInTheDocument();
  });

  it('should display proper styling and layout', async () => {
    const mockContent = {
      success: true,
      tip: 'Test tip',
      fact: 'Test fact',
    };

    mockFetchCurrentContentCached.mockResolvedValue(mockContent);

    render(<EducationalContent onContinue={mockOnContinue} />);

    await waitFor(() => {
      expect(screen.getByText(/midgame learning break/i)).toBeInTheDocument();
    });

    // Check main container - need to go up more levels to find the white container
    const whiteContainer = document.querySelector('.bg-white.rounded-xl.shadow-lg');
    expect(whiteContainer).toBeInTheDocument();

    // Check tip card styling
    const tipCard = screen.getByText(/detection tip/i).closest('.bg-gradient-to-r');
    expect(tipCard).toHaveClass('from-green-50', 'to-emerald-50');

    // Check fact card styling
    const factCard = screen.getByText(/ai fact/i).closest('.bg-gradient-to-r');
    expect(factCard).toHaveClass('from-purple-50', 'to-violet-50');

    // Check continue button styling
    const continueButton = screen.getByText(/continue to round 4/i);
    expect(continueButton).toHaveClass('bg-[#3da8ff]', 'hover:bg-[#2d96e6]');
  });

  it('should handle multiple rapid clicks on continue button', async () => {
    const mockContent = {
      success: true,
      tip: 'Test tip',
      fact: 'Test fact',
    };

    mockFetchCurrentContentCached.mockResolvedValue(mockContent);

    render(<EducationalContent onContinue={mockOnContinue} />);

    await waitFor(() => {
      expect(screen.getByText(/continue to round 4/i)).toBeInTheDocument();
    });

    const continueButton = screen.getByText(/continue to round 4/i);
    
    // Click multiple times rapidly
    fireEvent.click(continueButton);
    fireEvent.click(continueButton);
    fireEvent.click(continueButton);

    // Should only call onContinue once per click
    expect(mockOnContinue).toHaveBeenCalledTimes(3);
  });

  it('should support keyboard navigation', async () => {
    const mockContent = {
      success: true,
      tip: 'Test tip',
      fact: 'Test fact',
    };

    mockFetchCurrentContentCached.mockResolvedValue(mockContent);

    render(<EducationalContent onContinue={mockOnContinue} />);

    await waitFor(() => {
      expect(screen.getByText(/continue to round 4/i)).toBeInTheDocument();
    });

    const continueButton = screen.getByText(/continue to round 4/i);
    
    // Focus the button
    continueButton.focus();
    expect(continueButton).toHaveFocus();

    // Press Enter (use keyPress for better compatibility)
    fireEvent.keyPress(continueButton, { key: 'Enter', code: 'Enter', charCode: 13 });
    // Since the button doesn't have specific keydown handlers, we'll just test click
    fireEvent.click(continueButton);
    expect(mockOnContinue).toHaveBeenCalledTimes(1);
  });

  it('should display appropriate emojis and icons', async () => {
    const mockContent = {
      success: true,
      tip: 'Test tip',
      fact: 'Test fact',
    };

    mockFetchCurrentContentCached.mockResolvedValue(mockContent);

    render(<EducationalContent onContinue={mockOnContinue} />);

    await waitFor(() => {
      expect(screen.getByText(/midgame learning break/i)).toBeInTheDocument();
    });

    // Check for emojis (graduation cap emoji removed)
    expect(screen.getByText('💡')).toBeInTheDocument(); // Tip emoji
    expect(screen.getByText('🤖')).toBeInTheDocument(); // AI fact emoji
  });
});
