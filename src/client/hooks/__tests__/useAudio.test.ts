/**
 * Unit tests for useAudio hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createContext, useContext } from 'react';
import { useAudio, useAudioRef, AudioContext, AudioControls } from '../useAudio.js';

describe('useAudio Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when no audio context is provided', () => {
    const { result } = renderHook(() => useAudio());
    
    expect(result.current).toBeNull();
  });

  it('should return null when audio ref is null', () => {
    const mockAudioRef = { current: null };
    
    const TestComponent = () => {
      return (
        <AudioContext.Provider value={mockAudioRef}>
          <div />
        </AudioContext.Provider>
      );
    };

    const { result } = renderHook(() => useAudio(), {
      wrapper: ({ children }) => (
        <AudioContext.Provider value={mockAudioRef}>
          {children}
        </AudioContext.Provider>
      ),
    });

    expect(result.current).toBeNull();
  });

  it('should return audio controls when provided', () => {
    const mockAudioControls: AudioControls = {
      playBackgroundMusic: vi.fn(),
      stopBackgroundMusic: vi.fn(),
      playClickSound: vi.fn(),
      playSuccessSound: vi.fn(),
      playFailureSound: vi.fn(),
    };

    const mockAudioRef = { current: mockAudioControls };

    const { result } = renderHook(() => useAudio(), {
      wrapper: ({ children }) => (
        <AudioContext.Provider value={mockAudioRef}>
          {children}
        </AudioContext.Provider>
      ),
    });

    expect(result.current).toBe(mockAudioControls);
  });

  it('should provide all required audio control methods', () => {
    const mockAudioControls: AudioControls = {
      playBackgroundMusic: vi.fn(),
      stopBackgroundMusic: vi.fn(),
      playClickSound: vi.fn(),
      playSuccessSound: vi.fn(),
      playFailureSound: vi.fn(),
    };

    const mockAudioRef = { current: mockAudioControls };

    const { result } = renderHook(() => useAudio(), {
      wrapper: ({ children }) => (
        <AudioContext.Provider value={mockAudioRef}>
          {children}
        </AudioContext.Provider>
      ),
    });

    const audioControls = result.current;
    expect(audioControls).not.toBeNull();
    
    if (audioControls) {
      expect(typeof audioControls.playBackgroundMusic).toBe('function');
      expect(typeof audioControls.stopBackgroundMusic).toBe('function');
      expect(typeof audioControls.playClickSound).toBe('function');
      expect(typeof audioControls.playSuccessSound).toBe('function');
      expect(typeof audioControls.playFailureSound).toBe('function');
    }
  });

  it('should call audio control methods correctly', () => {
    const mockAudioControls: AudioControls = {
      playBackgroundMusic: vi.fn(),
      stopBackgroundMusic: vi.fn(),
      playClickSound: vi.fn(),
      playSuccessSound: vi.fn(),
      playFailureSound: vi.fn(),
    };

    const mockAudioRef = { current: mockAudioControls };

    const { result } = renderHook(() => useAudio(), {
      wrapper: ({ children }) => (
        <AudioContext.Provider value={mockAudioRef}>
          {children}
        </AudioContext.Provider>
      ),
    });

    const audioControls = result.current;
    
    if (audioControls) {
      audioControls.playBackgroundMusic();
      audioControls.stopBackgroundMusic();
      audioControls.playClickSound();
      audioControls.playSuccessSound();
      audioControls.playFailureSound();

      expect(mockAudioControls.playBackgroundMusic).toHaveBeenCalledTimes(1);
      expect(mockAudioControls.stopBackgroundMusic).toHaveBeenCalledTimes(1);
      expect(mockAudioControls.playClickSound).toHaveBeenCalledTimes(1);
      expect(mockAudioControls.playSuccessSound).toHaveBeenCalledTimes(1);
      expect(mockAudioControls.playFailureSound).toHaveBeenCalledTimes(1);
    }
  });
});

describe('useAudioRef Hook', () => {
  it('should create a ref with null initial value', () => {
    const { result } = renderHook(() => useAudioRef());
    
    expect(result.current.current).toBeNull();
  });

  it('should allow setting audio controls', () => {
    const { result } = renderHook(() => useAudioRef());
    
    const mockAudioControls: AudioControls = {
      playBackgroundMusic: vi.fn(),
      stopBackgroundMusic: vi.fn(),
      playClickSound: vi.fn(),
      playSuccessSound: vi.fn(),
      playFailureSound: vi.fn(),
    };

    result.current.current = mockAudioControls;
    
    expect(result.current.current).toBe(mockAudioControls);
  });

  it('should persist ref value across re-renders', () => {
    const { result, rerender } = renderHook(() => useAudioRef());
    
    const mockAudioControls: AudioControls = {
      playBackgroundMusic: vi.fn(),
      stopBackgroundMusic: vi.fn(),
      playClickSound: vi.fn(),
      playSuccessSound: vi.fn(),
      playFailureSound: vi.fn(),
    };

    result.current.current = mockAudioControls;
    
    rerender();
    
    expect(result.current.current).toBe(mockAudioControls);
  });
});

describe('AudioContext', () => {
  it('should be created with correct default value', () => {
    const TestComponent = () => {
      const context = useContext(AudioContext);
      return <div data-testid="context-value">{context ? 'has-context' : 'no-context'}</div>;
    };

    const { getByTestId } = renderHook(() => ({}), {
      wrapper: ({ children }) => (
        <TestComponent />
      ),
    });

    // AudioContext should default to null
    expect(getByTestId('context-value')).toHaveTextContent('no-context');
  });

  it('should provide context value to consumers', () => {
    const mockAudioRef = { current: null };
    
    const TestComponent = () => {
      const context = useContext(AudioContext);
      return <div data-testid="context-value">{context ? 'has-context' : 'no-context'}</div>;
    };

    const { getByTestId } = renderHook(() => ({}), {
      wrapper: ({ children }) => (
        <AudioContext.Provider value={mockAudioRef}>
          <TestComponent />
        </AudioContext.Provider>
      ),
    });

    expect(getByTestId('context-value')).toHaveTextContent('has-context');
  });
});

describe('Audio Hook Integration', () => {
  it('should work with multiple consumers', () => {
    const mockAudioControls: AudioControls = {
      playBackgroundMusic: vi.fn(),
      stopBackgroundMusic: vi.fn(),
      playClickSound: vi.fn(),
      playSuccessSound: vi.fn(),
      playFailureSound: vi.fn(),
    };

    const mockAudioRef = { current: mockAudioControls };

    const { result: result1 } = renderHook(() => useAudio(), {
      wrapper: ({ children }) => (
        <AudioContext.Provider value={mockAudioRef}>
          {children}
        </AudioContext.Provider>
      ),
    });

    const { result: result2 } = renderHook(() => useAudio(), {
      wrapper: ({ children }) => (
        <AudioContext.Provider value={mockAudioRef}>
          {children}
        </AudioContext.Provider>
      ),
    });

    expect(result1.current).toBe(mockAudioControls);
    expect(result2.current).toBe(mockAudioControls);
    expect(result1.current).toBe(result2.current);
  });

  it('should handle context updates', () => {
    const initialAudioControls: AudioControls = {
      playBackgroundMusic: vi.fn(),
      stopBackgroundMusic: vi.fn(),
      playClickSound: vi.fn(),
      playSuccessSound: vi.fn(),
      playFailureSound: vi.fn(),
    };

    const updatedAudioControls: AudioControls = {
      playBackgroundMusic: vi.fn(),
      stopBackgroundMusic: vi.fn(),
      playClickSound: vi.fn(),
      playSuccessSound: vi.fn(),
      playFailureSound: vi.fn(),
    };

    const mockAudioRef = { current: initialAudioControls };

    const { result, rerender } = renderHook(() => useAudio(), {
      wrapper: ({ children }) => (
        <AudioContext.Provider value={mockAudioRef}>
          {children}
        </AudioContext.Provider>
      ),
    });

    expect(result.current).toBe(initialAudioControls);

    // Update the ref
    mockAudioRef.current = updatedAudioControls;
    rerender();

    expect(result.current).toBe(updatedAudioControls);
  });

  it('should handle null context gracefully in nested components', () => {
    const NestedComponent = () => {
      const audio = useAudio();
      return audio ? 'has-audio' : 'no-audio';
    };

    const { result } = renderHook(() => <NestedComponent />);
    
    expect(result.current).toBe('no-audio');
  });
});

describe('Audio Hook Error Handling', () => {
  it('should handle undefined context provider', () => {
    // Test without any provider
    const { result } = renderHook(() => useAudio());
    
    expect(result.current).toBeNull();
  });

  it('should handle context with undefined ref', () => {
    const { result } = renderHook(() => useAudio(), {
      wrapper: ({ children }) => (
        <AudioContext.Provider value={undefined as any}>
          {children}
        </AudioContext.Provider>
      ),
    });

    expect(result.current).toBeNull();
  });

  it('should handle context with malformed ref', () => {
    const malformedRef = {} as any; // Missing 'current' property

    const { result } = renderHook(() => useAudio(), {
      wrapper: ({ children }) => (
        <AudioContext.Provider value={malformedRef}>
          {children}
        </AudioContext.Provider>
      ),
    });

    expect(result.current).toBeNull();
  });
});
