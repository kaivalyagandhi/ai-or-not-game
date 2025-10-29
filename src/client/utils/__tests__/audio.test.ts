/**
 * Unit tests for audio utility functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AUDIO_PATHS,
  DEFAULT_AUDIO_CONFIG,
  loadAudioPreferences,
  saveAudioPreferences,
  validateAudioFile,
  getAudioFileExtension,
  isAudioFormatSupported,
  createAudioConfig,
  AudioContextManager,
} from '../audio.js';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock Audio constructor
const mockAudio = {
  canPlayType: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  src: '',
  preload: 'auto',
};
global.Audio = vi.fn(() => mockAudio) as any;

// Mock AudioContext
const mockAudioContext = {
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
};
global.AudioContext = vi.fn(() => mockAudioContext) as any;
(global as any).webkitAudioContext = vi.fn(() => mockAudioContext);

describe('Audio Utils - Constants and Configuration', () => {
  it('should have correct audio file paths', () => {
    expect(AUDIO_PATHS.BACKGROUND_MUSIC).toBe('/audio/background-music.mp3');
    expect(AUDIO_PATHS.SUCCESS_SOUND).toBe('/audio/success-sound.mp3');
    expect(AUDIO_PATHS.FAILURE_SOUND).toBe('/audio/failure-sound.mp3');
  });

  it('should have correct default audio configuration', () => {
    expect(DEFAULT_AUDIO_CONFIG).toEqual({
      backgroundMusic: '/audio/background-music.mp3',
      successSound: '/audio/success-sound.mp3',
      failureSound: '/audio/failure-sound.mp3',
      enabled: true,
      volume: 0.7,
    });
  });
});

describe('Audio Utils - Local Storage Preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load audio preferences from localStorage', () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce('0.5') // volume
      .mockReturnValueOnce('false') // muted
      .mockReturnValueOnce('true'); // enabled

    const preferences = loadAudioPreferences();

    expect(preferences).toEqual({
      volume: 0.5,
      enabled: true,
    });
  });

  it('should return default values when localStorage is empty', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    const preferences = loadAudioPreferences();

    expect(preferences).toEqual({
      volume: DEFAULT_AUDIO_CONFIG.volume,
      enabled: DEFAULT_AUDIO_CONFIG.enabled,
    });
  });

  it('should handle localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const preferences = loadAudioPreferences();

    expect(preferences).toEqual({});
  });

  it('should save audio preferences to localStorage', () => {
    const config = { volume: 0.8, enabled: false };

    saveAudioPreferences(config);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('spot-the-bot-audio-volume', '0.8');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('spot-the-bot-audio-muted', 'true');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('spot-the-bot-audio-enabled', 'false');
  });

  it('should handle partial preference saving', () => {
    const config = { volume: 0.3 }; // Only volume, no enabled

    saveAudioPreferences(config);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('spot-the-bot-audio-volume', '0.3');
    expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith('spot-the-bot-audio-enabled', expect.anything());
  });

  it('should handle localStorage save errors gracefully', () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage save error');
    });

    expect(() => saveAudioPreferences({ volume: 0.5 })).not.toThrow();
  });
});

describe('Audio Utils - File Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate audio file successfully', async () => {
    mockAudio.addEventListener.mockImplementation((event, callback) => {
      if (event === 'canplaythrough') {
        setTimeout(callback, 0);
      }
    });

    const isValid = await validateAudioFile('/audio/test.mp3');

    expect(isValid).toBe(true);
    expect(mockAudio.src).toBe('/audio/test.mp3');
    expect(mockAudio.preload).toBe('metadata');
  });

  it('should handle audio file validation failure', async () => {
    mockAudio.addEventListener.mockImplementation((event, callback) => {
      if (event === 'error') {
        setTimeout(callback, 0);
      }
    });

    const isValid = await validateAudioFile('/audio/invalid.mp3');

    expect(isValid).toBe(false);
  });

  it('should timeout audio file validation', async () => {
    // Mock audio that never loads
    mockAudio.addEventListener.mockImplementation(() => {});

    const isValid = await validateAudioFile('/audio/slow.mp3');

    expect(isValid).toBe(false);
  });

  it('should extract audio file extension correctly', () => {
    expect(getAudioFileExtension('/audio/music.mp3')).toBe('mp3');
    expect(getAudioFileExtension('/audio/sound.wav')).toBe('wav');
    expect(getAudioFileExtension('/audio/file.ogg?v=1')).toBe('ogg');
    expect(getAudioFileExtension('/audio/noextension')).toBe('');
  });

  it('should check audio format support', () => {
    mockAudio.canPlayType
      .mockReturnValueOnce('probably') // mp3
      .mockReturnValueOnce('maybe') // wav
      .mockReturnValueOnce('') // ogg
      .mockReturnValueOnce('probably'); // m4a

    expect(isAudioFormatSupported('mp3')).toBe(true);
    expect(isAudioFormatSupported('wav')).toBe(true);
    expect(isAudioFormatSupported('ogg')).toBe(false);
    expect(isAudioFormatSupported('m4a')).toBe(true);
    expect(isAudioFormatSupported('unknown')).toBe(false);
  });
});

describe('Audio Utils - Configuration Creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should create audio configuration with default paths', async () => {
    mockAudio.addEventListener.mockImplementation((event, callback) => {
      if (event === 'canplaythrough') {
        setTimeout(callback, 0);
      }
    });

    const config = await createAudioConfig();

    expect(config).toEqual({
      backgroundMusic: AUDIO_PATHS.BACKGROUND_MUSIC,
      clickSound: AUDIO_PATHS.CLICK_SOUND,
      successSound: AUDIO_PATHS.SUCCESS_SOUND,
      failureSound: AUDIO_PATHS.FAILURE_SOUND,
      enabled: DEFAULT_AUDIO_CONFIG.enabled,
      volume: DEFAULT_AUDIO_CONFIG.volume,
    });
  });

  it('should create audio configuration with custom paths', async () => {
    mockAudio.addEventListener.mockImplementation((event, callback) => {
      if (event === 'canplaythrough') {
        setTimeout(callback, 0);
      }
    });

    const customPaths = {
      BACKGROUND_MUSIC: '/custom/music.mp3',
      CLICK_SOUND: '/custom/click.wav',
    };

    const config = await createAudioConfig(customPaths);

    expect(config.backgroundMusic).toBe('/custom/music.mp3');
    expect(config.clickSound).toBe('/custom/click.wav');
    expect(config.successSound).toBe(AUDIO_PATHS.SUCCESS_SOUND); // Default
    expect(config.failureSound).toBe(AUDIO_PATHS.FAILURE_SOUND); // Default
  });

  it('should apply saved preferences to configuration', async () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce('0.3') // volume
      .mockReturnValueOnce('true') // muted
      .mockReturnValueOnce('false'); // enabled

    mockAudio.addEventListener.mockImplementation((event, callback) => {
      if (event === 'canplaythrough') {
        setTimeout(callback, 0);
      }
    });

    const config = await createAudioConfig();

    expect(config.volume).toBe(0.3);
    expect(config.enabled).toBe(false);
  });

  it('should warn about invalid audio files during configuration', async () => {
    const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    mockAudio.addEventListener.mockImplementation((event, callback) => {
      if (event === 'error') {
        setTimeout(callback, 0);
      }
    });

    await createAudioConfig();

    expect(mockConsoleWarn).toHaveBeenCalledWith(
      'Background music file not found or invalid:',
      AUDIO_PATHS.BACKGROUND_MUSIC
    );
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      'Click sound file not found or invalid:',
      AUDIO_PATHS.CLICK_SOUND
    );

    mockConsoleWarn.mockRestore();
  });
});

describe('Audio Utils - AudioContextManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be a singleton', () => {
    const instance1 = AudioContextManager.getInstance();
    const instance2 = AudioContextManager.getInstance();

    expect(instance1).toBe(instance2);
  });

  it('should unlock audio context successfully', async () => {
    const manager = AudioContextManager.getInstance();

    await manager.unlockAudioContext();

    expect(manager.isAudioUnlocked()).toBe(true);
    expect(manager.getAudioContext()).toBeTruthy();
  });

  it('should handle suspended audio context', async () => {
    mockAudioContext.state = 'suspended';
    const manager = AudioContextManager.getInstance();

    await manager.unlockAudioContext();

    expect(mockAudioContext.resume).toHaveBeenCalled();
    expect(manager.isAudioUnlocked()).toBe(true);
  });

  it('should handle audio context creation failure', async () => {
    const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    global.AudioContext = vi.fn(() => {
      throw new Error('AudioContext not supported');
    }) as any;

    const manager = AudioContextManager.getInstance();
    await manager.unlockAudioContext();

    expect(mockConsoleWarn).toHaveBeenCalledWith(
      'Failed to unlock audio context:',
      expect.any(Error)
    );
    expect(manager.isAudioUnlocked()).toBe(false);

    mockConsoleWarn.mockRestore();
  });

  it('should not unlock twice', async () => {
    const manager = AudioContextManager.getInstance();

    await manager.unlockAudioContext();
    await manager.unlockAudioContext(); // Second call

    // Should only create one audio context
    expect(global.AudioContext).toHaveBeenCalledTimes(1);
  });

  it('should handle webkit audio context fallback', async () => {
    global.AudioContext = undefined as any;
    
    const manager = AudioContextManager.getInstance();
    await manager.unlockAudioContext();

    expect((global as any).webkitAudioContext).toHaveBeenCalled();
  });
});

describe('Audio Utils - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle malformed localStorage data', () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce('invalid-number') // volume
      .mockReturnValueOnce('not-boolean') // muted
      .mockReturnValueOnce('also-not-boolean'); // enabled

    const preferences = loadAudioPreferences();

    expect(preferences.volume).toBeNaN();
    expect(preferences.enabled).toBe(false); // 'not-boolean' !== 'true'
  });

  it('should handle empty file paths', async () => {
    const isValid = await validateAudioFile('');
    expect(isValid).toBe(false);
  });

  it('should handle null/undefined file paths', async () => {
    const isValid1 = await validateAudioFile(null as any);
    const isValid2 = await validateAudioFile(undefined as any);
    
    expect(isValid1).toBe(false);
    expect(isValid2).toBe(false);
  });

  it('should handle audio context without webkit fallback', async () => {
    global.AudioContext = undefined as any;
    (global as any).webkitAudioContext = undefined;

    const manager = AudioContextManager.getInstance();
    await manager.unlockAudioContext();

    expect(manager.getAudioContext()).toBeNull();
    expect(manager.isAudioUnlocked()).toBe(false);
  });

  it('should handle concurrent audio context unlock attempts', async () => {
    const manager = AudioContextManager.getInstance();

    // Start multiple unlock attempts simultaneously
    const promises = [
      manager.unlockAudioContext(),
      manager.unlockAudioContext(),
      manager.unlockAudioContext(),
    ];

    await Promise.all(promises);

    expect(manager.isAudioUnlocked()).toBe(true);
    // Should only create one audio context despite multiple calls
    expect(global.AudioContext).toHaveBeenCalledTimes(1);
  });
});
