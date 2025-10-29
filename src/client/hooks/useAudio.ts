import { createContext, useContext, useRef, MutableRefObject } from 'react';

// Audio control interface
export interface AudioControls {
  playBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
  playSuccessSound: () => void;
  playFailureSound: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  isAudioEnabled: () => boolean;
  isBackgroundMusicPlaying: () => boolean;
}

// Audio context
export const AudioContext = createContext<MutableRefObject<AudioControls | null> | null>(null);

// Hook to use audio controls
export const useAudio = (): AudioControls | null => {
  const audioRef = useContext(AudioContext);
  return audioRef?.current || null;
};

// Hook to create audio ref
export const useAudioRef = (): MutableRefObject<AudioControls | null> => {
  return useRef<AudioControls | null>(null);
};
