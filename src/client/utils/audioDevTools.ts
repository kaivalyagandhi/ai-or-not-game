import { 
  generateAudioDiagnosticReport, 
  logAudioSystemStatus, 
  checkAudioFileSizeRecommendations,
  getAudioSystemHealth 
} from './audioValidation.js';

/**
 * Development tools for audio system management
 * These functions are available in the browser console for debugging
 */

declare global {
  interface Window {
    audioDevTools: {
      checkHealth: () => Promise<void>;
      generateReport: () => Promise<void>;
      checkFileSizes: () => Promise<void>;
      testAudioFiles: () => Promise<void>;
      showSetupInstructions: () => void;
    };
  }
}

/**
 * Check audio system health and log results
 */
const checkHealth = async (): Promise<void> => {
  console.log('🔍 Checking audio system health...');
  await logAudioSystemStatus();
  
  const health = await getAudioSystemHealth();
  console.log('📊 Detailed health report:', health);
};

/**
 * Generate and display diagnostic report
 */
const generateReport = async (): Promise<void> => {
  console.log('📋 Generating audio diagnostic report...');
  const report = await generateAudioDiagnosticReport();
  console.log(report);
};

/**
 * Check audio file sizes and recommendations
 */
const checkFileSizes = async (): Promise<void> => {
  console.log('📏 Checking audio file sizes...');
  const sizeRecommendations = await checkAudioFileSizeRecommendations();
  
  console.table(sizeRecommendations.map(item => ({
    File: item.path.split('/').pop(),
    Size: item.formattedSize,
    Type: item.type,
    'Within Recommendation': item.isWithinRecommendation ? '✅' : '❌',
    'Max Recommended': item.type === 'background' ? '5MB' : '500KB'
  })));
  
  const oversizedFiles = sizeRecommendations.filter(item => !item.isWithinRecommendation && item.size > 0);
  if (oversizedFiles.length > 0) {
    console.warn('⚠️  Files exceeding size recommendations:');
    oversizedFiles.forEach(item => {
      console.warn(`  - ${item.path}: ${item.formattedSize} (max: ${item.type === 'background' ? '5MB' : '500KB'})`);
    });
  }
};

/**
 * Test audio file loading
 */
const testAudioFiles = async (): Promise<void> => {
  console.log('🧪 Testing audio file loading...');
  
  const audioFiles = [
    '/audio/background-music.mp3',
    '/audio/success-sound.mp3',
    '/audio/failure-sound.mp3'
  ];
  
  for (const file of audioFiles) {
    try {
      const audio = new Audio(file);
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve);
        audio.addEventListener('error', reject);
        audio.load();
      });
      console.log(`✅ ${file} - Loaded successfully`);
    } catch (error) {
      console.error(`❌ ${file} - Failed to load:`, error);
    }
  }
};

/**
 * Show setup instructions
 */
const showSetupInstructions = (): void => {
  console.log(`
🎵 Audio Setup Instructions
===========================

1. Create the audio directory:
   mkdir -p src/client/public/audio

2. Add these files to src/client/public/audio/:
   - background-music.mp3 (2-5 minutes, <5MB)
   - success-sound.mp3 (<2 seconds, <500KB)
   - failure-sound.mp3 (<2 seconds, <500KB)

3. File format recommendations:
   - All audio files: MP3, 128-192 kbps

4. Test your setup:
   - Run: audioDevTools.checkHealth()
   - Run: audioDevTools.testAudioFiles()

5. For detailed guidance, see AUDIO_SETUP_GUIDE.md

Need help? Run audioDevTools.generateReport() for diagnostics.
  `);
};

/**
 * Initialize development tools
 */
export const initAudioDevTools = (): void => {
  if (typeof window !== 'undefined') {
    window.audioDevTools = {
      checkHealth,
      generateReport,
      checkFileSizes,
      testAudioFiles,
      showSetupInstructions,
    };
    
    console.log('🛠️  Audio development tools loaded!');
    console.log('Available commands:');
    console.log('  - audioDevTools.checkHealth()');
    console.log('  - audioDevTools.generateReport()');
    console.log('  - audioDevTools.checkFileSizes()');
    console.log('  - audioDevTools.testAudioFiles()');
    console.log('  - audioDevTools.showSetupInstructions()');
  }
};

/**
 * Auto-run health check in development
 */
export const autoCheckAudioHealth = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'development') {
    // Delay to let the app initialize
    setTimeout(async () => {
      console.log('🎵 Auto-checking audio system health...');
      await logAudioSystemStatus();
    }, 2000);
  }
};
