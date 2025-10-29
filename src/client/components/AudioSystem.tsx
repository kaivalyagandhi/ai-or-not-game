import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { AudioControls } from '../hooks/useAudio.js';

interface AudioSystemProps {
  onAudioToggle?: (enabled: boolean) => void;
  className?: string;
}

interface AudioFiles {
  backgroundMusic?: HTMLAudioElement | undefined;
  successSound?: HTMLAudioElement | undefined;
  failureSound?: HTMLAudioElement | undefined;
}

export const AudioSystem = forwardRef<AudioControls, AudioSystemProps>(
  ({ onAudioToggle, className = '' }, ref) => {
    // Initialize volume (fixed at 0.7) and audio enabled state from localStorage
    const volume = 0.7; // Fixed volume level
    
    const [audioEnabled, setAudioEnabled] = useState(() => {
      try {
        const saved = localStorage.getItem('spotTheBot_audioEnabled');
        return saved !== null ? saved === 'true' : true; // Default to enabled
      } catch {
        return true;
      }
    });
    
    const [hasError, setHasError] = useState(false);
    
    const audioFiles = useRef<AudioFiles>({});
    const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
    const isInitialized = useRef(false);

    // Audio file paths (static to prevent re-renders)
    const audioFilePaths = {
      backgroundMusic: '/audio/background-music.mp3',
      successSound: '/audio/success-sound.mp3',
      failureSound: '/audio/failure-sound.mp3',
    };

    // Load audio files with error handling
    const loadAudioFile = useCallback((src: string): Promise<HTMLAudioElement | null> => {
      return new Promise((resolve) => {
        const audio = new Audio();
        
        audio.addEventListener('canplaythrough', () => {
          audio.volume = volume;
          resolve(audio);
        });
        
        audio.addEventListener('error', () => {
          console.warn(`Failed to load audio file: ${src}`);
          resolve(null);
        });
        
        audio.src = src;
        audio.preload = 'auto';
      });
    }, [volume]);

    // Initialize audio system
    useEffect(() => {
      const initializeAudio = async () => {
        // Prevent multiple initializations
        if (isInitialized.current) {
          console.log('🎵 Audio system already initialized, skipping');
          return;
        }
        
        isInitialized.current = true;
        setHasError(false);

        try {
          // Load all audio files
          const [backgroundMusic, successSound, failureSound] = await Promise.all([
            loadAudioFile(audioFilePaths.backgroundMusic),
            loadAudioFile(audioFilePaths.successSound),
            loadAudioFile(audioFilePaths.failureSound),
          ]);

          audioFiles.current = {
            backgroundMusic: backgroundMusic ?? undefined,
            successSound: successSound ?? undefined,
            failureSound: failureSound ?? undefined,
          };

          // Set up background music
          if (backgroundMusic) {
            backgroundMusic.loop = true;
            backgroundMusic.volume = audioEnabled ? volume * 0.3 : 0;
            backgroundMusicRef.current = backgroundMusic;
            
            // Add event listeners for debugging
            backgroundMusic.addEventListener('play', () => {
              console.log('🎵 Background music started playing');
            });
            
            backgroundMusic.addEventListener('pause', () => {
              console.log('⏸️ Background music paused');
            });
            
            backgroundMusic.addEventListener('ended', () => {
              console.log('🔚 Background music ended');
            });
            
            // Start background music immediately when loaded (if audio enabled)
            if (audioEnabled) {
              backgroundMusic.play().catch((error) => {
                console.warn('Failed to auto-start background music:', error);
              });
            }
          }

          // Check if any files loaded successfully
          const loadedFiles = Object.values(audioFiles.current).filter(Boolean).length;
          const totalFiles = Object.keys(audioFilePaths).length;
          
          if (loadedFiles === 0) {
            console.warn('🔇 Audio System: No audio files loaded - running in silent mode');
            console.warn('💡 To add audio files, see AUDIO_SETUP_GUIDE.md');
          } else if (loadedFiles < totalFiles) {
            console.warn(`🎵 Audio System: ${loadedFiles}/${totalFiles} audio files loaded`);
          } else {
            console.log(`🎵 Audio System: All ${loadedFiles} audio files loaded successfully`);
          }
        } catch (error) {
          console.error('Error initializing audio system:', error);
          setHasError(true);
        }
      };

      initializeAudio();
      
      // Cleanup function
      return () => {
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.pause();
          backgroundMusicRef.current = null;
        }
        isInitialized.current = false;
      };
    }, [loadAudioFile]); // Only depend on loadAudioFile, which depends on volume

    // Update volume for all audio files
    useEffect(() => {
      Object.values(audioFiles.current).forEach((audio) => {
        if (audio) {
          if (!audioEnabled) {
            audio.volume = 0;
          } else {
            audio.volume = audio === backgroundMusicRef.current ? volume * 0.3 : volume;
          }
        }
      });
      
      // Also update background music if it's playing
      if (backgroundMusicRef.current) {
        if (!audioEnabled) {
          backgroundMusicRef.current.volume = 0;
        } else {
          backgroundMusicRef.current.volume = volume * 0.3;
        }
      }
    }, [volume, audioEnabled]);

    // Set audio enabled state programmatically
    const setAudioEnabledState = useCallback((enabled: boolean) => {
      setAudioEnabled(enabled);
      
      // Save to localStorage immediately
      try {
        localStorage.setItem('spotTheBot_audioEnabled', enabled.toString());
      } catch (error) {
        console.warn('Failed to save audio state to localStorage:', error);
      }
      
      // Update volume for all audio files immediately
      Object.values(audioFiles.current).forEach((audio) => {
        if (audio) {
          audio.volume = enabled ? (audio === backgroundMusicRef.current ? volume * 0.3 : volume) : 0;
        }
      });
      
      // Update background music volume immediately (no play/pause, just volume)
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.volume = enabled ? volume * 0.3 : 0;
      }
      
      onAudioToggle?.(enabled);
    }, [volume, onAudioToggle]);

    // Handle audio toggle (for button clicks)
    const handleAudioToggle = useCallback(() => {
      const newAudioEnabled = !audioEnabled;
      setAudioEnabledState(newAudioEnabled);
    }, [audioEnabled, setAudioEnabledState]);

    // Get current audio enabled state
    const isAudioEnabledState = useCallback(() => {
      return audioEnabled;
    }, [audioEnabled]);

    // Get current background music playing state
    const isBackgroundMusicPlayingState = useCallback(() => {
      return backgroundMusicRef.current ? !backgroundMusicRef.current.paused : false;
    }, []);

    // Public methods for playing sounds
    const playBackgroundMusic = useCallback(() => {
      if (!backgroundMusicRef.current) return;
      
      // Only start if paused AND audio is enabled
      if (backgroundMusicRef.current.paused && audioEnabled) {
        backgroundMusicRef.current.volume = volume * 0.3;
        backgroundMusicRef.current.play().catch((error) => {
          console.warn('Failed to play background music:', error);
        });
      }
    }, [audioEnabled, volume]);

    const stopBackgroundMusic = useCallback(() => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current.currentTime = 0;
      }
    }, []);



    const playSuccessSound = useCallback(() => {
      if (!audioEnabled || !audioFiles.current.successSound) return;
      
      const audio = audioFiles.current.successSound.cloneNode() as HTMLAudioElement;
      // Increase volume for success sound relative to background music (3x multiplier)
      audio.volume = Math.min(volume * 3.6, 1.0);
      audio.play().catch((error) => {
        console.warn('Failed to play success sound:', error);
      });
    }, [audioEnabled, volume]);

    const playFailureSound = useCallback(() => {
      if (!audioEnabled || !audioFiles.current.failureSound) return;
      
      const audio = audioFiles.current.failureSound.cloneNode() as HTMLAudioElement;
      // Increase volume for failure sound relative to background music (3x multiplier)
      audio.volume = Math.min(volume * 3.6, 1.0);
      audio.play().catch((error) => {
        console.warn('Failed to play failure sound:', error);
      });
    }, [audioEnabled, volume]);

    // Expose audio methods via ref
    useImperativeHandle(ref, () => ({
      playBackgroundMusic,
      stopBackgroundMusic,
      playSuccessSound,
      playFailureSound,
      setAudioEnabled: setAudioEnabledState,
      isAudioEnabled: isAudioEnabledState,
      isBackgroundMusicPlaying: isBackgroundMusicPlayingState,
    }), [playBackgroundMusic, stopBackgroundMusic, playSuccessSound, playFailureSound, setAudioEnabledState, isAudioEnabledState, isBackgroundMusicPlayingState]);

    if (hasError) {
      return null; // Graceful degradation - game continues without audio
    }

    return (
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        {/* Simple Audio Toggle Button */}
        <button
          onClick={handleAudioToggle}
          className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors duration-200 text-lg"
          aria-label={audioEnabled ? 'Disable audio' : 'Enable audio'}
          title={audioEnabled ? 'Audio enabled - click to disable' : 'Audio disabled - click to enable'}
        >
          {audioEnabled ? '🎵' : '🔇'}
        </button>
      </div>
    );
  }
);

// Hook for using audio system
export const useAudioSystem = () => {
  const audioRef = useRef<{
    playBackgroundMusic: () => void;
    stopBackgroundMusic: () => void;
    playSuccessSound: () => void;
    playFailureSound: () => void;
    setVolume: (volume: number) => void;
    setMuted: (muted: boolean) => void;
  } | null>(null);

  return audioRef.current;
};
