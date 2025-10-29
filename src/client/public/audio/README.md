# Audio Assets Directory

This directory contains audio files for Spot the Bot game.

## Required Files

Place the following audio files in this directory with **exact** names:

```
src/client/public/audio/
├── background-music.mp3    # Background music (loops during gameplay)
├── success-sound.mp3       # Success sound effect
└── failure-sound.mp3       # Failure sound effect
```

## File Specifications

### Background Music (`background-music.mp3`)

- **Format**: MP3
- **Duration**: 2-5 minutes (will loop)
- **Quality**: 128-192 kbps, 44.1kHz
- **Size**: Under 5MB
- **Content**: Upbeat, non-distracting instrumental music

### Sound Effects (`.mp3` files)

- **Format**: MP3
- **Duration**: Under 2 seconds each
- **Size**: Under 500KB each
- **Content**:
  - `success-sound.mp3`: Positive, rewarding sound (chime, ding)
  - `failure-sound.mp3`: Gentle negative sound (soft buzz, low tone)

## Development Tools

When running in development mode, audio development tools are available in the browser console:

```javascript
// Check audio system health
audioDevTools.checkHealth();

// Generate diagnostic report
audioDevTools.generateReport();

// Check file sizes
audioDevTools.checkFileSizes();

// Test file loading
audioDevTools.testAudioFiles();

// Show setup instructions
audioDevTools.showSetupInstructions();
```

## File Validation

The system automatically validates:

- ✅ File existence and accessibility
- ✅ Browser format support
- ✅ File size recommendations
- ✅ Loading capability

## Graceful Degradation

- Game continues normally if audio files are missing
- Console warnings for missing/invalid files
- No error messages shown to users
- Audio controls remain functional (silent mode)

## Testing Your Setup

1. Add your audio files to this directory
2. Start the development server: `npm run dev`
3. Open browser console and run: `audioDevTools.checkHealth()`
4. Look for validation messages and warnings
5. Test in-game audio functionality

## Troubleshooting

### Files Not Loading

- Check file names match exactly (case-sensitive)
- Verify files are in correct directory
- Test file URLs directly: `http://localhost:5173/audio/background-music.mp3`
- Check browser console for error messages

### Poor Performance

- Compress large files (background music <5MB, effects <500KB)
- Use recommended formats (MP3 for all audio files)
- Check file integrity with audio editing software

### Browser Compatibility

- MP3 has excellent cross-browser support
- Avoid exotic formats or high bitrates
- Test on target browsers (Chrome, Firefox, Safari, Edge)

For detailed setup instructions and troubleshooting, see `AUDIO_SETUP_GUIDE.md` in the project root.
