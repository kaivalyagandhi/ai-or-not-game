import { AUDIO_PATHS, validateAudioFile, getAudioFileExtension, isAudioFormatSupported } from './audio.js';

// Audio file validation results
export interface AudioValidationResult {
  path: string;
  isValid: boolean;
  isSupported: boolean;
  extension: string;
  error?: string;
}

// Audio system health check
export interface AudioSystemHealth {
  isHealthy: boolean;
  validFiles: string[];
  invalidFiles: string[];
  unsupportedFiles: string[];
  missingFiles: string[];
  totalFiles: number;
  validFileCount: number;
}

/**
 * Validate all required audio files
 */
export const validateAllAudioFiles = async (): Promise<AudioValidationResult[]> => {
  const results: AudioValidationResult[] = [];
  
  for (const [key, path] of Object.entries(AUDIO_PATHS)) {
    const extension = getAudioFileExtension(path);
    const isSupported = isAudioFormatSupported(extension);
    
    let isValid = false;
    let error: string | undefined;
    
    if (!isSupported) {
      error = `Audio format '${extension}' is not supported by this browser`;
    } else {
      try {
        isValid = await validateAudioFile(path);
        if (!isValid) {
          error = 'File could not be loaded or is corrupted';
        }
      } catch (err) {
        error = `Validation failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
      }
    }
    
    results.push({
      path,
      isValid,
      isSupported,
      extension,
      error,
    });
  }
  
  return results;
};

/**
 * Get audio system health status
 */
export const getAudioSystemHealth = async (): Promise<AudioSystemHealth> => {
  const validationResults = await validateAllAudioFiles();
  
  const validFiles: string[] = [];
  const invalidFiles: string[] = [];
  const unsupportedFiles: string[] = [];
  const missingFiles: string[] = [];
  
  validationResults.forEach((result) => {
    if (result.isValid && result.isSupported) {
      validFiles.push(result.path);
    } else if (!result.isSupported) {
      unsupportedFiles.push(result.path);
    } else if (result.error?.includes('could not be loaded')) {
      missingFiles.push(result.path);
    } else {
      invalidFiles.push(result.path);
    }
  });
  
  const totalFiles = validationResults.length;
  const validFileCount = validFiles.length;
  const isHealthy = validFileCount > 0; // System is healthy if at least one file works
  
  return {
    isHealthy,
    validFiles,
    invalidFiles,
    unsupportedFiles,
    missingFiles,
    totalFiles,
    validFileCount,
  };
};

/**
 * Generate audio system diagnostic report
 */
export const generateAudioDiagnosticReport = async (): Promise<string> => {
  const health = await getAudioSystemHealth();
  
  let report = '🎵 Audio System Diagnostic Report\n';
  report += '=====================================\n\n';
  
  report += `Overall Status: ${health.isHealthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}\n`;
  report += `Valid Files: ${health.validFileCount}/${health.totalFiles}\n\n`;
  
  if (health.validFiles.length > 0) {
    report += '✅ Valid Audio Files:\n';
    health.validFiles.forEach(file => {
      report += `  - ${file}\n`;
    });
    report += '\n';
  }
  
  if (health.missingFiles.length > 0) {
    report += '❌ Missing Audio Files:\n';
    health.missingFiles.forEach(file => {
      report += `  - ${file}\n`;
    });
    report += '\n';
  }
  
  if (health.invalidFiles.length > 0) {
    report += '⚠️  Invalid Audio Files:\n';
    health.invalidFiles.forEach(file => {
      report += `  - ${file}\n`;
    });
    report += '\n';
  }
  
  if (health.unsupportedFiles.length > 0) {
    report += '🚫 Unsupported Audio Files:\n';
    health.unsupportedFiles.forEach(file => {
      report += `  - ${file}\n`;
    });
    report += '\n';
  }
  
  report += 'Recommendations:\n';
  if (health.missingFiles.length > 0) {
    report += '- Add missing audio files to src/client/public/audio/\n';
  }
  if (health.unsupportedFiles.length > 0) {
    report += '- Convert unsupported files to MP3 or WAV format\n';
  }
  if (health.invalidFiles.length > 0) {
    report += '- Check file integrity and re-upload corrupted files\n';
  }
  if (health.validFileCount === 0) {
    report += '- Audio system will run in silent mode\n';
    report += '- Game functionality will not be affected\n';
  }
  
  return report;
};

/**
 * Log audio system status to console
 */
export const logAudioSystemStatus = async (): Promise<void> => {
  const health = await getAudioSystemHealth();
  
  if (health.isHealthy) {
    console.log('🎵 Audio System: Healthy');
    console.log(`✅ ${health.validFileCount}/${health.totalFiles} audio files loaded successfully`);
    
    if (health.missingFiles.length > 0 || health.invalidFiles.length > 0) {
      console.warn('⚠️  Some audio files have issues but system will continue:');
      [...health.missingFiles, ...health.invalidFiles].forEach(file => {
        console.warn(`  - ${file}`);
      });
    }
  } else {
    console.warn('🔇 Audio System: Running in silent mode');
    console.warn('❌ No valid audio files found');
    
    if (health.missingFiles.length > 0) {
      console.warn('Missing files:');
      health.missingFiles.forEach(file => {
        console.warn(`  - ${file}`);
      });
    }
  }
};

/**
 * Audio file size checker
 */
export const checkAudioFileSizes = async (): Promise<{ [path: string]: number }> => {
  const fileSizes: { [path: string]: number } = {};
  
  for (const path of Object.values(AUDIO_PATHS)) {
    try {
      const response = await fetch(path, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        fileSizes[path] = parseInt(contentLength, 10);
      }
    } catch (error) {
      console.warn(`Could not check size for ${path}:`, error);
      fileSizes[path] = -1; // Indicate error
    }
  }
  
  return fileSizes;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 0) return 'Unknown';
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Check if audio files exceed recommended sizes
 */
export const checkAudioFileSizeRecommendations = async (): Promise<{
  path: string;
  size: number;
  formattedSize: string;
  isWithinRecommendation: boolean;
  recommendedMaxSize: number;
  type: 'background' | 'effect';
}[]> => {
  const fileSizes = await checkAudioFileSizes();
  const results = [];
  
  for (const [path, size] of Object.entries(fileSizes)) {
    const isBackground = path.includes('background-music');
    const recommendedMaxSize = isBackground ? 5 * 1024 * 1024 : 500 * 1024; // 5MB for music, 500KB for effects
    const isWithinRecommendation = size <= recommendedMaxSize && size > 0;
    
    results.push({
      path,
      size,
      formattedSize: formatFileSize(size),
      isWithinRecommendation,
      recommendedMaxSize,
      type: isBackground ? 'background' as const : 'effect' as const,
    });
  }
  
  return results;
};
