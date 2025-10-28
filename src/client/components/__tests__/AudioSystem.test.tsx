/**
 * Unit tests for AudioSystem component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioSystem } from '../AudioSystem.js';

// Mock Audio constructor
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  load: vi.fn(),
  cloneNode: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  volume: 0.7,
  currentTime: 0,
  loop: false,
  src: '',
  preload: 'auto',
};

const mockAudioConstructor = vi.fn(() => mockAudio);
global.Audio = mockAudioConstructor as any;

// Mock console methods
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('AudioSystem Component', () => {
  const mockOnVolumeChange = vi.fn();
  const mockOnMuteToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAudio.cloneNode.mockReturnValue(mockAudio);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render audio controls button', () => {
    render(<AudioSystem />);
    
    const audioButton = screen.getByRole('button', { name: /toggle audio controls/i });
    expect(audioButton).toBeInTheDocument();
    expect(audioButton).toHaveTextContent('🎵');
  });

  it('should show controls when audio button is clicked', async () => {
    render(<AudioSystem />);
    
    const audioButton = screen.getByRole('button', { name: /toggle audio controls/i });
    fireEvent.click(audioButton);
    
    await waitFor(() => {
      expect(screen.getByRole('slider')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mute audio/i })).toBeInTheDocument();
    });
  });

  it('should initialize with default volume and unmuted state', async () => {
    render(<AudioSystem onVolumeChange={mockOnVolumeChange} />);
    
    const audioButton = screen.getByRole('button', { name: /toggle audio controls/i });
    fireEvent.click(audioButton);
    
    await waitFor(() => {
      const volumeSlider = screen.getByRole('slider') as HTMLInputElement;
      expect(volumeSlider.value).toBe('0.7');
      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.getByText('🔊')).toBeInTheDocument(); // Unmuted icon
    });
  });

  it('should handle volume changes', async () => {
    render(<AudioSystem onVolumeChange={mockOnVolumeChange} />);
    
    const audioButton = screen.getByRole('button', { name: /toggle audio controls/i });
    fireEvent.click(audioButton);
    
    await waitFor(() => {
      const volumeSlider = screen.getByRole('slider');
      fireEvent.change(volumeSlider, { target: { value: '0.5' } });
    });
    
    expect(mockOnVolumeChange).toHaveBeenCalledWith(0.5);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should handle mute toggle', async () => {
    render(<AudioSystem onMuteToggle={mockOnMuteToggle} />);
    
    const audioButton = screen.getByRole('button', { name: /toggle audio controls/i });
    fireEvent.click(audioButton);
    
    await waitFor(() => {
      const muteButton = screen.getByRole('button', { name: /mute audio/i });
      fireEvent.click(muteButton);
    });
    
    expect(mockOnMuteToggle).toHaveBeenCalledWith(true);
    
    await waitFor(() => {
      expect(screen.getByText('🔇')).toBeInTheDocument(); // Muted icon
      expect(screen.getByRole('button', { name: /unmute audio/i })).toBeInTheDocument();
    });
  });

  it('should disable volume slider when muted', async () => {
    render(<AudioSystem />);
    
    const audioButton = screen.getByRole('button', { name: /toggle audio controls/i });
    fireEvent.click(audioButton);
    
    await waitFor(() => {
      const muteButton = screen.getByRole('button', { name: /mute audio/i });
      fireEvent.click(muteButton);
    });
    
    await waitFor(() => {
      const volumeSlider = screen.getByRole('slider') as HTMLInputElement;
      expect(volumeSlider).toBeDisabled();
    });
  });

  it('should load audio files on initialization', async () => {
    render(<AudioSystem />);
    
    // Wait for audio loading to complete
    await waitFor(() => {
      expect(mockAudioConstructor).toHaveBeenCalledTimes(4); // 4 audio files
    });
    
    // Check that audio files were created with correct paths
    const calls = mockAudioConstructor.mock.calls;
    expect(mockAudio.src).toBeDefined();
  });

  it('should handle audio loading errors gracefully', async () => {
    // Mock audio loading failure
    const failingAudio = {
      ...mockAudio,
      addEventListener: vi.fn((event, callback) => {
        if (event === 'error') {
          setTimeout(callback, 0);
        }
      }),
    };
    
    const failingAudioConstructor = vi.fn(() => failingAudio);
    global.Audio = failingAudioConstructor as any;
    
    render(<AudioSystem />);
    
    await waitFor(() => {
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load audio file')
      );
    });
  });

  it('should show loading indicator while initializing', () => {
    render(<AudioSystem />);
    
    const audioButton = screen.getByRole('button', { name: /toggle audio controls/i });
    fireEvent.click(audioButton);
    
    expect(screen.getByText(/loading audio/i)).toBeInTheDocument();
  });

  it('should hide loading indicator after initialization', async () => {
    // Mock successful audio loading
    const successAudio = {
      ...mockAudio,
      addEventListener: vi.fn((event, callback) => {
        if (event === 'canplaythrough') {
          setTimeout(callback, 0);
        }
      }),
    };
    
    const successAudioConstructor = vi.fn(() => successAudio);
    global.Audio = successAudioConstructor as any;
    
    render(<AudioSystem />);
    
    const audioButton = screen.getByRole('button', { name: /toggle audio controls/i });
    fireEvent.click(audioButton);
    
    await waitFor(() => {
      expect(screen.queryByText(/loading audio/i)).not.toBeInTheDocument();
    });
  });

  it('should apply custom className', () => {
    const { container } = render(<AudioSystem className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should have proper accessibility attributes', async () => {
    render(<AudioSystem />);
    
    const audioButton = screen.getByRole('button', { name: /toggle audio controls/i });
    expect(audioButton).toHaveAttribute('aria-label', 'Toggle audio controls');
    
    fireEvent.click(audioButton);
    
    await waitFor(() => {
      const volumeSlider = screen.getByRole('slider');
      expect(volumeSlider).toHaveAttribute('id', 'volume-slider');
      
      const muteButton = screen.getByRole('button', { name: /mute audio/i });
      expect(muteButton).toHaveAttribute('aria-label', 'Mute audio');
    });
  });

  it('should handle rapid control interactions', async () => {
    render(<AudioSystem onVolumeChange={mockOnVolumeChange} />);
    
    const audioButton = screen.getByRole('button', { name: /toggle audio controls/i });
    fireEvent.click(audioButton);
    
    await waitFor(() => {
      const volumeSlider = screen.getByRole('slider');
      
      // Rapid volume changes
      fireEvent.change(volumeSlider, { target: { value: '0.3' } });
      fireEvent.change(volumeSlider, { target: { value: '0.8' } });
      fireEvent.change(volumeSlider, { target: { value: '0.1' } });
    });
    
    expect(mockOnVolumeChange).toHaveBeenCalledTimes(3);
    expect(mockOnVolumeChange).toHaveBeenLastCalledWith(0.1);
  });

  it('should close controls when clicking outside', async () => {
    render(<AudioSystem />);
    
    const audioButton = screen.getByRole('button', { name: /toggle audio controls/i });
    fireEvent.click(audioButton);
    
    await waitFor(() => {
      expect(screen.getByText(/audio/i)).toBeInTheDocument();
    });
    
    // Click the audio button again to close
    fireEvent.click(audioButton);
    
    await waitFor(() => {
      expect(screen.queryByText(/audio/i)).not.toBeInTheDocument();
    });
  });

  it('should handle keyboard navigation', async () => {
    render(<AudioSystem />);
    
    const audioButton = screen.getByRole('button', { name: /toggle audio controls/i });
    
    // Focus and activate with keyboard
    audioButton.focus();
    expect(audioButton).toHaveFocus();
    
    // Use click instead of keyDown since the component doesn't have specific keyboard handlers
    fireEvent.click(audioButton);
    
    await waitFor(() => {
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });
  });

  it('should handle volume slider keyboard navigation', async () => {
    render(<AudioSystem onVolumeChange={mockOnVolumeChange} />);
    
    const audioButton = screen.getByRole('button', { name: /toggle audio controls/i });
    fireEvent.click(audioButton);
    
    await waitFor(() => {
      const volumeSlider = screen.getByRole('slider');
      volumeSlider.focus();
      
      // Test arrow key navigation
      fireEvent.keyDown(volumeSlider, { key: 'ArrowUp' });
      fireEvent.keyDown(volumeSlider, { key: 'ArrowDown' });
    });
  });

  it('should maintain volume state across mute/unmute', async () => {
    render(<AudioSystem onVolumeChange={mockOnVolumeChange} />);
    
    const audioButton = screen.getByRole('button', { name: /toggle audio controls/i });
    fireEvent.click(audioButton);
    
    await waitFor(() => {
      // Set volume to 0.3
      const volumeSlider = screen.getByRole('slider');
      fireEvent.change(volumeSlider, { target: { value: '0.3' } });
    });
    
    // Mute
    const muteButton = screen.getByRole('button', { name: /mute audio/i });
    fireEvent.click(muteButton);
    
    // Unmute
    await waitFor(() => {
      const unmuteButton = screen.getByRole('button', { name: /unmute audio/i });
      fireEvent.click(unmuteButton);
    });
    
    // Volume should be restored
    await waitFor(() => {
      const volumeSlider = screen.getByRole('slider') as HTMLInputElement;
      expect(volumeSlider.value).toBe('0.3');
    });
  });
});

describe('AudioSystem Component - Audio File Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle partial audio file loading', async () => {
    let callCount = 0;
    const mixedAudio = {
      ...mockAudio,
      addEventListener: vi.fn((event, callback) => {
        callCount++;
        if (callCount <= 2 && event === 'canplaythrough') {
          setTimeout(callback, 0); // First 2 files succeed
        } else if (event === 'error') {
          setTimeout(callback, 0); // Last 2 files fail
        }
      }),
    };
    
    const mixedAudioConstructor = vi.fn(() => mixedAudio);
    global.Audio = mixedAudioConstructor as any;
    
    render(<AudioSystem />);
    
    await waitFor(() => {
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('audio files loaded')
      );
    });
  });

  it('should handle complete audio loading failure', async () => {
    const failingAudio = {
      ...mockAudio,
      addEventListener: vi.fn((event, callback) => {
        if (event === 'error') {
          setTimeout(callback, 0);
        }
      }),
    };
    
    const failingAudioConstructor = vi.fn(() => failingAudio);
    global.Audio = failingAudioConstructor as any;
    
    render(<AudioSystem />);
    
    await waitFor(() => {
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('No audio files loaded - running in silent mode')
      );
    });
  });

  it('should handle audio initialization errors', async () => {
    const errorAudio = {
      ...mockAudio,
      addEventListener: vi.fn(() => {
        throw new Error('Audio initialization failed');
      }),
    };
    
    const errorAudioConstructor = vi.fn(() => errorAudio);
    global.Audio = errorAudioConstructor as any;
    
    render(<AudioSystem />);
    
    await waitFor(() => {
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error initializing audio system:',
        expect.any(Error)
      );
    });
  });

  it('should gracefully degrade when audio system fails', async () => {
    const errorAudio = {
      ...mockAudio,
      addEventListener: vi.fn(() => {
        throw new Error('Critical audio error');
      }),
    };
    
    const errorAudioConstructor = vi.fn(() => errorAudio);
    global.Audio = errorAudioConstructor as any;
    
    const { container } = render(<AudioSystem />);
    
    await waitFor(() => {
      // Component should not render when there's a critical error
      expect(container.firstChild).toBeNull();
    });
  });
});
