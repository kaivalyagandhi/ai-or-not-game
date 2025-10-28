import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { AudioControls } from '../hooks/useAudio.js';

interface AudioSystemProps {
  onVolumeChange?: (volume: number) => void;
  onMuteToggle?: (muted: boolean) => void;
  className?: string;
}

interface AudioFiles {
  backgroundMusic?: HTMLAudioElement | undefined;
  clickSound?: HTMLAudioElement | undefined;
  successSound?: HTMLAudioElement | undefined;
  failureSound?: HTMLAudioElement | undefined;
}

export const AudioSystem = forwardRef<AudioControls, AudioSystemProps>(
  ({ onVolumeChange, onMuteToggle, className = '' }, ref) => {
    // Initialize volume and mute state from localStorage
    const [volume, setVolume] = useState(() => {
      try {
        const saved = localStorage.getItem('spotTheBot_audioVolume');
        return saved ? parseFloat(saved) : 0.7;
      } catch {
        return 0.7;
      }
    });
    
    const [muted, setMuted] = useState(() => {
      try {
        const saved = localStorage.getItem('spotTheBot_audioMuted');
        return saved === 'true';
      } catch {
        return false;
      }
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [showControls, setShowControls] = useState(false);
    
    const audioFiles = useRef<AudioFiles>({});
    const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

    // Audio file paths (static to prevent re-renders)
    const audioFilePaths = {
      backgroundMusic: '/audio/background-music.mp3',
      clickSound: '/audio/click-sound.wav',
      successSound: '/audio/success-sound.wav',
      failureSound: '/audio/failure-sound.wav',
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
        setIsLoading(true);
        setHasError(false);

        try {
          // Load all audio files
          const [backgroundMusic, clickSound, successSound, failureSound] = await Promise.all([
            loadAudioFile(audioFilePaths.backgroundMusic),
            loadAudioFile(audioFilePaths.clickSound),
            loadAudioFile(audioFilePaths.successSound),
            loadAudioFile(audioFilePaths.failureSound),
          ]);

          audioFiles.current = {
            backgroundMusic: backgroundMusic ?? undefined,
            clickSound: clickSound ?? undefined,
            successSound: successSound ?? undefined,
            failureSound: failureSound ?? undefined,
          };

          // Set up background music
          if (backgroundMusic) {
            backgroundMusic.loop = true;
            backgroundMusic.volume = volume * 0.3; // Background music at lower volume
            backgroundMusicRef.current = backgroundMusic;
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

          setIsLoading(false);
        } catch (error) {
          console.error('Error initializing audio system:', error);
          setHasError(true);
          setIsLoading(false);
        }
      };

      initializeAudio();
    }, [loadAudioFile]); // Only depend on loadAudioFile, which depends on volume

    // Update volume for all audio files
    useEffect(() => {
      Object.values(audioFiles.current).forEach((audio) => {
        if (audio) {
          if (muted || volume === 0) {
            audio.volume = 0;
          } else {
            audio.volume = audio === backgroundMusicRef.current ? volume * 0.3 : volume;
          }
        }
      });
      
      // Also update background music if it's playing
      if (backgroundMusicRef.current) {
        if (muted || volume === 0) {
          backgroundMusicRef.current.volume = 0;
        } else {
          backgroundMusicRef.current.volume = volume * 0.3;
        }
      }
    }, [volume, muted]);

    // Handle volume change
    const handleVolumeChange = useCallback((newVolume: number) => {
      setVolume(newVolume);
      onVolumeChange?.(newVolume);
    }, [onVolumeChange]);

    // Handle mute toggle
    const handleMuteToggle = useCallback(() => {
      const newMuted = !muted;
      setMuted(newMuted);
      
      // Update volume for all audio files immediately
      Object.values(audioFiles.current).forEach((audio) => {
        if (audio) {
          audio.volume = newMuted ? 0 : (audio === backgroundMusicRef.current ? volume * 0.3 : volume);
        }
      });
      
      // Update background music volume if it's playing
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.volume = newMuted ? 0 : volume * 0.3;
      }
      
      onMuteToggle?.(newMuted);
    }, [muted, volume, onMuteToggle]);

    // Public methods for playing sounds
    const playBackgroundMusic = useCallback(() => {
      if (muted || volume === 0 || !backgroundMusicRef.current) return;
      
      backgroundMusicRef.current.volume = volume * 0.3;
      backgroundMusicRef.current.currentTime = 0;
      backgroundMusicRef.current.play().catch((error) => {
        console.warn('Failed to play background music:', error);
      });
    }, [muted, volume]);

    const stopBackgroundMusic = useCallback(() => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current.currentTime = 0;
      }
    }, []);

    const playClickSound = useCallback(() => {
      if (muted || volume === 0 || !audioFiles.current.clickSound) return;
      
      const audio = audioFiles.current.clickSound.cloneNode() as HTMLAudioElement;
      audio.volume = volume;
      audio.play().catch((error) => {
        console.warn('Failed to play click sound:', error);
      });
    }, [muted, volume]);

    const playSuccessSound = useCallback(() => {
      if (muted || volume === 0 || !audioFiles.current.successSound) return;
      
      const audio = audioFiles.current.successSound.cloneNode() as HTMLAudioElement;
      // Increase volume for success sound relative to background music (1.2x multiplier)
      audio.volume = Math.min(volume * 1.2, 1.0);
      audio.play().catch((error) => {
        console.warn('Failed to play success sound:', error);
      });
    }, [muted, volume]);

    const playFailureSound = useCallback(() => {
      if (muted || volume === 0 || !audioFiles.current.failureSound) return;
      
      const audio = audioFiles.current.failureSound.cloneNode() as HTMLAudioElement;
      // Increase volume for failure sound relative to background music (1.2x multiplier)
      audio.volume = Math.min(volume * 1.2, 1.0);
      audio.play().catch((error) => {
        console.warn('Failed to play failure sound:', error);
      });
    }, [muted, volume]);

    // Expose audio methods via ref
    useImperativeHandle(ref, () => ({
      playBackgroundMusic,
      stopBackgroundMusic,
      playClickSound,
      playSuccessSound,
      playFailureSound,
    }), [playBackgroundMusic, stopBackgroundMusic, playClickSound, playSuccessSound, playFailureSound]);

    if (hasError) {
      return null; // Graceful degradation - game continues without audio
    }

    return (
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        {/* Audio Controls */}
        <div className="relative">
          <button
            onClick={() => setShowControls(!showControls)}
            className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors duration-200 text-lg"
            aria-label="Toggle audio controls"
          >
            🎵
          </button>
          
          {showControls && (
            <div className="absolute top-12 right-0 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 min-w-48 border border-gray-200">
              {/* Mute Toggle */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Audio</span>
                <button
                  onClick={handleMuteToggle}
                  className={`p-1 rounded transition-colors duration-200 ${
                    muted 
                      ? 'text-red-500 hover:bg-red-50' 
                      : 'text-green-500 hover:bg-green-50'
                  }`}
                  aria-label={muted ? 'Unmute audio' : 'Mute audio'}
                >
                  {muted ? '🔇' : '🔊'}
                </button>
              </div>
              
              {/* Volume Slider */}
              <div className="space-y-2">
                <label htmlFor="volume-slider" className="sr-only">
                  Volume
                </label>
                <input
                  id="volume-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={muted}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span className="font-medium text-gray-700">{Math.round(volume * 100)}%</span>
                  <span>100%</span>
                </div>
              </div>
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="mt-3 text-xs text-gray-500 text-center">
                  Loading audio...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

// Hook for using audio system
export const useAudioSystem = () => {
  const audioRef = useRef<{
    playBackgroundMusic: () => void;
    stopBackgroundMusic: () => void;
    playClickSound: () => void;
    playSuccessSound: () => void;
    playFailureSound: () => void;
    setVolume: (volume: number) => void;
    setMuted: (muted: boolean) => void;
  } | null>(null);

  return audioRef.current;
};
