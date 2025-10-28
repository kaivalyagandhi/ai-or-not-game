import type { AudioConfig } from '../../shared/types/index.js';

// Audio file naming conventions and paths
export const AUDIO_PATHS = {
  BACKGROUND_MUSIC: '/audio/background-music.mp3',
  CLICK_SOUND: '/audio/click-sound.wav',
  SUCCESS_SOUND: '/audio/success-sound.wav',
  FAILURE_SOUND: '/audio/failure-sound.wav',
} as const;

// Default audio configuration
export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  backgroundMusic: AUDIO_PATHS.BACKGROUND_MUSIC,
  clickSound: AUDIO_PATHS.CLICK_SOUND,
  successSound: AUDIO_PATHS.SUCCESS_SOUND,
  failureSound: AUDIO_PATHS.FAILURE_SOUND,
  enabled: true,
  volume: 0.7,
};

// Local storage keys for audio preferences
const STORAGE_KEYS = {
  VOLUME: 'spot-the-bot-audio-volume',
  MUTED: 'spot-the-bot-audio-muted',
  ENABLED: 'spot-the-bot-audio-enabled',
} as const;

/**
 * Load audio preferences from local storage
 */
export const loadAudioPreferences = (): Partial<AudioConfig> => {
  try {
    const volume = localStorage.getItem(STORAGE_KEYS.VOLUME);
    const muted = localStorage.getItem(STORAGE_KEYS.MUTED);
    const enabled = localStorage.getItem(STORAGE_KEYS.ENABLED);

    return {
      volume: volume ? parseFloat(volume) : DEFAULT_AUDIO_CONFIG.volume,
      enabled: muted === 'true' ? false : (enabled ? enabled === 'true' : DEFAULT_AUDIO_CONFIG.enabled),
    };
  } catch (error) {
    console.warn('Failed to load audio preferences:', error);
    return {};
  }
};

/**
 * Save audio preferences to local storage
 */
export const saveAudioPreferences = (config: Partial<AudioConfig>): void => {
  try {
    if (config.volume !== undefined) {
      localStorage.setItem(STORAGE_KEYS.VOLUME, config.volume.toString());
    }
    if (config.enabled !== undefined) {
      localStorage.setItem(STORAGE_KEYS.MUTED, (!config.enabled).toString());
      localStorage.setItem(STORAGE_KEYS.ENABLED, config.enabled.toString());
    }
  } catch (error) {
    console.warn('Failed to save audio preferences:', error);
  }
};

/**
 * Validate audio file URL
 */
export const validateAudioFile = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    
    const cleanup = () => {
      audio.removeEventListener('canplaythrough', onLoad);
      audio.removeEventListener('error', onError);
    };
    
    const onLoad = () => {
      cleanup();
      resolve(true);
    };
    
    const onError = () => {
      cleanup();
      resolve(false);
    };
    
    audio.addEventListener('canplaythrough', onLoad);
    audio.addEventListener('error', onError);
    
    audio.src = url;
    audio.preload = 'metadata';
    
    // Timeout after 5 seconds
    setTimeout(() => {
      cleanup();
      resolve(false);
    }, 5000);
  });
};

/**
 * Get audio file extension from URL
 */
export const getAudioFileExtension = (url: string): string => {
  const match = url.match(/\.([^.?]+)(\?|$)/);
  return match ? match[1].toLowerCase() : '';
};

/**
 * Check if browser supports audio format
 */
export const isAudioFormatSupported = (extension: string): boolean => {
  const audio = new Audio();
  
  switch (extension) {
    case 'mp3':
      return audio.canPlayType('audio/mpeg') !== '';
    case 'wav':
      return audio.canPlayType('audio/wav') !== '';
    case 'ogg':
      return audio.canPlayType('audio/ogg') !== '';
    case 'm4a':
      return audio.canPlayType('audio/mp4') !== '';
    default:
      return false;
  }
};

/**
 * Create audio configuration with validation
 */
export const createAudioConfig = async (
  customPaths?: Partial<typeof AUDIO_PATHS>
): Promise<AudioConfig> => {
  const paths = { ...AUDIO_PATHS, ...customPaths };
  const preferences = loadAudioPreferences();
  
  // Validate audio files
  const validationResults = await Promise.all([
    validateAudioFile(paths.BACKGROUND_MUSIC),
    validateAudioFile(paths.CLICK_SOUND),
    validateAudioFile(paths.SUCCESS_SOUND),
    validateAudioFile(paths.FAILURE_SOUND),
  ]);
  
  const [bgMusicValid, clickValid, successValid, failureValid] = validationResults;
  
  if (!bgMusicValid) {
    console.warn('Background music file not found or invalid:', paths.BACKGROUND_MUSIC);
  }
  if (!clickValid) {
    console.warn('Click sound file not found or invalid:', paths.CLICK_SOUND);
  }
  if (!successValid) {
    console.warn('Success sound file not found or invalid:', paths.SUCCESS_SOUND);
  }
  if (!failureValid) {
    console.warn('Failure sound file not found or invalid:', paths.FAILURE_SOUND);
  }
  
  return {
    backgroundMusic: paths.BACKGROUND_MUSIC,
    clickSound: paths.CLICK_SOUND,
    successSound: paths.SUCCESS_SOUND,
    failureSound: paths.FAILURE_SOUND,
    enabled: preferences.enabled ?? DEFAULT_AUDIO_CONFIG.enabled,
    volume: preferences.volume ?? DEFAULT_AUDIO_CONFIG.volume,
  };
};

/**
 * Audio context manager for better browser compatibility
 */
export class AudioContextManager {
  private static instance: AudioContextManager;
  private audioContext: AudioContext | null = null;
  private isUnlocked = false;

  static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  /**
   * Initialize audio context (required for some browsers)
   */
  async unlockAudioContext(): Promise<void> {
    if (this.isUnlocked) return;

    try {
      // Create audio context if it doesn't exist
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isUnlocked = true;
    } catch (error) {
      console.warn('Failed to unlock audio context:', error);
    }
  }

  /**
   * Get audio context
   */
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  /**
   * Check if audio context is unlocked
   */
  isAudioUnlocked(): boolean {
    return this.isUnlocked;
  }
}
