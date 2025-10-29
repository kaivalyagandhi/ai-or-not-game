# Audio Setup Guide for AI or Not?

## Overview

AI or Not? includes an audio system that provides background music and sound effects to enhance the gaming experience. This guide explains how to set up and manage audio files for the game.

## Audio File Requirements

### File Formats
- **Recommended**: MP3 for music, WAV for sound effects
- **Supported**: MP3, WAV, OGG, M4A
- **Browser Compatibility**: MP3 and WAV have the best cross-browser support

### File Size Guidelines
- **Background Music**: Maximum 5MB (recommended 2-3MB)
- **Sound Effects**: Maximum 500KB each (recommended 100-200KB)
- **Total Audio Assets**: Keep under 10MB for optimal loading

### Audio Quality
- **Background Music**: 128-192 kbps MP3, 44.1kHz sample rate
- **Sound Effects**: 16-bit WAV or 128 kbps MP3, 44.1kHz sample rate
- **Duration**: Background music 2-5 minutes (will loop), sound effects under 2 seconds

## File Naming Convention

### Required File Names
The audio system expects these exact file names in the `/src/client/public/audio/` directory:

```
src/client/public/audio/
├── background-music.mp3    # Main background music (loops during gameplay)
├── click-sound.wav         # Sound when user clicks an image
├── success-sound.wav       # Sound when user gets correct answer
└── failure-sound.wav       # Sound when user gets wrong answer or time runs out
```

### File Naming Rules
- Use lowercase letters only
- Use hyphens (-) instead of spaces or underscores
- Include appropriate file extensions (.mp3, .wav, etc.)
- Do not change the base names (background-music, click-sound, etc.)

## Audio File Setup Instructions

### Step 1: Create Audio Directory
```bash
mkdir -p src/client/public/audio
```

### Step 2: Add Audio Files
Place your audio files in the directory with the exact names specified above:

```bash
# Example file structure
src/client/public/audio/
├── background-music.mp3    # Your background music file
├── click-sound.wav         # Your click sound effect
├── success-sound.wav       # Your success sound effect
└── failure-sound.wav       # Your failure sound effect
```

### Step 3: Verify File Placement
Ensure files are accessible at these URLs when the app is running:
- `http://localhost:5173/audio/background-music.mp3`
- `http://localhost:5173/audio/click-sound.wav`
- `http://localhost:5173/audio/success-sound.wav`
- `http://localhost:5173/audio/failure-sound.wav`

## Audio Behavior

### Background Music
- Starts playing when the game begins
- Loops continuously during gameplay
- Volume is automatically set to 30% of user's volume setting
- Stops when game ends or user mutes audio

### Sound Effects
- **Click Sound**: Plays when user selects an image
- **Success Sound**: Plays when user gets a correct answer
- **Failure Sound**: Plays when user gets wrong answer or time runs out
- Volume matches user's volume setting

### User Controls
- Volume slider (0-100%)
- Mute/unmute toggle
- Settings persist in browser local storage
- Audio controls accessible via music note button (🎵)

## Graceful Degradation

The audio system is designed to fail gracefully:

### Missing Files
- Game continues to function normally if audio files are missing
- Console warnings logged for missing files
- No error messages shown to users

### Browser Compatibility
- Automatically detects supported audio formats
- Falls back to silent operation if audio is not supported
- Works without audio context in older browsers

### Loading Failures
- Individual audio files that fail to load are skipped
- Other audio files continue to work normally
- Loading indicators shown while audio files are being loaded

## Development vs Production

### Development Mode
- Audio files served from `src/client/public/audio/`
- Hot reloading supported for audio file changes
- Console warnings for missing or invalid files

### Production Mode
- Audio files bundled with the application
- Optimized loading and caching
- Compressed file sizes for faster loading

## Troubleshooting

### Common Issues

#### Audio Not Playing
1. Check browser console for error messages
2. Verify file names match exactly (case-sensitive)
3. Ensure files are in correct directory
4. Test file URLs directly in browser
5. Check if user has muted audio in game controls

#### Poor Audio Quality
1. Check file format and bitrate
2. Ensure sample rate is 44.1kHz
3. Avoid over-compression
4. Test on different devices/browsers

#### Large File Sizes
1. Compress audio files appropriately
2. Use shorter loops for background music
3. Optimize sound effects duration
4. Consider using OGG format for smaller sizes

#### Browser Compatibility Issues
1. Provide multiple format options if needed
2. Test on target browsers (Chrome, Firefox, Safari, Edge)
3. Check console for format support warnings

### File Validation
The system includes built-in validation:
- Checks if files exist and are loadable
- Validates audio format support
- Provides console warnings for issues
- Gracefully handles missing files

## Audio Asset Recommendations

### Background Music
- Upbeat, non-distracting instrumental music
- 2-3 minute loops to avoid repetition fatigue
- Medium tempo (120-140 BPM)
- Avoid sudden volume changes or jarring transitions

### Sound Effects
- **Click Sound**: Subtle, pleasant click or tap sound
- **Success Sound**: Positive, rewarding sound (chime, ding)
- **Failure Sound**: Gentle, non-harsh negative sound (soft buzz, low tone)
- Keep effects brief (0.1-0.5 seconds)

## Legal Considerations

### Copyright
- Ensure you have rights to use all audio files
- Use royalty-free or Creative Commons licensed audio
- Consider creating original audio content
- Document audio sources and licenses

### Attribution
If using Creative Commons or other licensed audio:
- Include attribution in your app documentation
- Follow specific license requirements
- Consider adding credits section to the game

## Testing Audio

### Manual Testing
1. Start the game and verify background music plays
2. Click images and verify click sounds
3. Complete rounds and verify success/failure sounds
4. Test volume controls and mute functionality
5. Test on different browsers and devices

### Automated Testing
The audio system includes validation functions:
- File existence checking
- Format support detection
- Loading error handling
- Graceful degradation testing

## Performance Optimization

### Loading Strategy
- Audio files are preloaded during game initialization
- Background music starts only when game begins
- Sound effects are cloned for simultaneous playback
- Failed loads don't block game functionality

### Memory Management
- Audio objects are reused when possible
- Proper cleanup when component unmounts
- Efficient cloning for sound effects
- Automatic garbage collection of temporary audio objects

## Future Enhancements

### Potential Improvements
- Multiple background music tracks with random selection
- Category-specific sound effects
- Audio visualization during gameplay
- Advanced audio settings (bass, treble, etc.)
- Dynamic volume based on game events

### Extensibility
The audio system is designed to be easily extended:
- Add new sound types by updating `AudioConfig` interface
- Modify file paths in `AUDIO_PATHS` constant
- Extend `AudioSystem` component for new features
- Add new audio utility functions as needed
