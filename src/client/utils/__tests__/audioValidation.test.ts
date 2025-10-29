/**
 * Unit tests for audio validation utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateAllAudioFiles,
  getAudioSystemHealth,
  generateAudioDiagnosticReport,
  checkAudioFileSizes,
  formatFileSize,
  checkAudioFileSizeRecommendations,
} from '../audioValidation.js';

// Mock the audio utilities
vi.mock('../audio.js', () => ({
  AUDIO_PATHS: {
    BACKGROUND_MUSIC: '/audio/background-music.mp3',
    SUCCESS_SOUND: '/audio/success-sound.mp3',
    FAILURE_SOUND: '/audio/failure-sound.mp3',
  },
  validateAudioFile: vi.fn(),
  getAudioFileExtension: vi.fn(),
  isAudioFormatSupported: vi.fn(),
}));

import { validateAudioFile, getAudioFileExtension, isAudioFormatSupported } from '../audio.js';

// Mock fetch for file size checking
global.fetch = vi.fn();

describe('Audio Validation - File Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate all audio files successfully', async () => {
    vi.mocked(getAudioFileExtension).mockReturnValue('mp3');
    vi.mocked(isAudioFormatSupported).mockReturnValue(true);
    vi.mocked(validateAudioFile).mockResolvedValue(true);

    const results = await validateAllAudioFiles();

    expect(results).toHaveLength(4);
    results.forEach(result => {
      expect(result.isValid).toBe(true);
      expect(result.isSupported).toBe(true);
      expect(result.extension).toBe('mp3');
      expect(result.error).toBeUndefined();
    });
  });

  it('should handle unsupported audio formats', async () => {
    vi.mocked(getAudioFileExtension).mockReturnValue('flac');
    vi.mocked(isAudioFormatSupported).mockReturnValue(false);
    vi.mocked(validateAudioFile).mockResolvedValue(false);

    const results = await validateAllAudioFiles();

    expect(results).toHaveLength(4);
    results.forEach(result => {
      expect(result.isValid).toBe(false);
      expect(result.isSupported).toBe(false);
      expect(result.extension).toBe('flac');
      expect(result.error).toContain('not supported by this browser');
    });
  });

  it('should handle file loading failures', async () => {
    vi.mocked(getAudioFileExtension).mockReturnValue('mp3');
    vi.mocked(isAudioFormatSupported).mockReturnValue(true);
    vi.mocked(validateAudioFile).mockResolvedValue(false);

    const results = await validateAllAudioFiles();

    expect(results).toHaveLength(4);
    results.forEach(result => {
      expect(result.isValid).toBe(false);
      expect(result.isSupported).toBe(true);
      expect(result.error).toBe('File could not be loaded or is corrupted');
    });
  });

  it('should handle validation errors', async () => {
    vi.mocked(getAudioFileExtension).mockReturnValue('mp3');
    vi.mocked(isAudioFormatSupported).mockReturnValue(true);
    vi.mocked(validateAudioFile).mockRejectedValue(new Error('Network error'));

    const results = await validateAllAudioFiles();

    expect(results).toHaveLength(4);
    results.forEach(result => {
      expect(result.isValid).toBe(false);
      expect(result.isSupported).toBe(true);
      expect(result.error).toContain('Validation failed: Network error');
    });
  });

  it('should handle mixed validation results', async () => {
    vi.mocked(getAudioFileExtension)
      .mockReturnValueOnce('mp3')
      .mockReturnValueOnce('wav')
      .mockReturnValueOnce('flac')
      .mockReturnValueOnce('mp3');

    vi.mocked(isAudioFormatSupported)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    vi.mocked(validateAudioFile)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const results = await validateAllAudioFiles();

    expect(results[0].isValid).toBe(true);
    expect(results[0].isSupported).toBe(true);
    
    expect(results[1].isValid).toBe(false);
    expect(results[1].isSupported).toBe(true);
    expect(results[1].error).toBe('File could not be loaded or is corrupted');
    
    expect(results[2].isValid).toBe(false);
    expect(results[2].isSupported).toBe(false);
    expect(results[2].error).toContain('not supported by this browser');
    
    expect(results[3].isValid).toBe(true);
    expect(results[3].isSupported).toBe(true);
  });
});

describe('Audio Validation - System Health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should report healthy system with all files valid', async () => {
    vi.mocked(getAudioFileExtension).mockReturnValue('mp3');
    vi.mocked(isAudioFormatSupported).mockReturnValue(true);
    vi.mocked(validateAudioFile).mockResolvedValue(true);

    const health = await getAudioSystemHealth();

    expect(health.isHealthy).toBe(true);
    expect(health.validFiles).toHaveLength(4);
    expect(health.invalidFiles).toHaveLength(0);
    expect(health.unsupportedFiles).toHaveLength(0);
    expect(health.missingFiles).toHaveLength(0);
    expect(health.totalFiles).toBe(4);
    expect(health.validFileCount).toBe(4);
  });

  it('should report unhealthy system with no valid files', async () => {
    vi.mocked(getAudioFileExtension).mockReturnValue('mp3');
    vi.mocked(isAudioFormatSupported).mockReturnValue(true);
    vi.mocked(validateAudioFile).mockResolvedValue(false);

    const health = await getAudioSystemHealth();

    expect(health.isHealthy).toBe(false);
    expect(health.validFiles).toHaveLength(0);
    expect(health.invalidFiles).toHaveLength(4);
    expect(health.validFileCount).toBe(0);
  });

  it('should categorize files correctly', async () => {
    vi.mocked(getAudioFileExtension)
      .mockReturnValueOnce('mp3')
      .mockReturnValueOnce('flac')
      .mockReturnValueOnce('mp3')
      .mockReturnValueOnce('mp3');

    vi.mocked(isAudioFormatSupported)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    vi.mocked(validateAudioFile)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    // Mock the error message for missing files
    vi.mocked(validateAudioFile).mockImplementation(async (path) => {
      if (path === '/audio/success-sound.mp3') {
        throw new Error('File could not be loaded');
      }
      return false;
    });

    const health = await getAudioSystemHealth();

    expect(health.validFiles).toHaveLength(1);
    expect(health.unsupportedFiles).toHaveLength(1);
    expect(health.invalidFiles).toHaveLength(1);
    expect(health.missingFiles).toHaveLength(1);
  });

  it('should consider system healthy with partial file loading', async () => {
    vi.mocked(getAudioFileExtension).mockReturnValue('mp3');
    vi.mocked(isAudioFormatSupported).mockReturnValue(true);
    vi.mocked(validateAudioFile)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    const health = await getAudioSystemHealth();

    expect(health.isHealthy).toBe(true); // At least one file works
    expect(health.validFileCount).toBe(1);
  });
});

describe('Audio Validation - Diagnostic Report', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate healthy system report', async () => {
    vi.mocked(getAudioFileExtension).mockReturnValue('mp3');
    vi.mocked(isAudioFormatSupported).mockReturnValue(true);
    vi.mocked(validateAudioFile).mockResolvedValue(true);

    const report = await generateAudioDiagnosticReport();

    expect(report).toContain('Overall Status: ✅ HEALTHY');
    expect(report).toContain('Valid Files: 4/4');
    expect(report).toContain('✅ Valid Audio Files:');
    expect(report).toContain('/audio/background-music.mp3');
    expect(report).not.toContain('❌ Missing Audio Files:');
  });

  it('should generate unhealthy system report', async () => {
    vi.mocked(getAudioFileExtension).mockReturnValue('mp3');
    vi.mocked(isAudioFormatSupported).mockReturnValue(true);
    vi.mocked(validateAudioFile).mockResolvedValue(false);

    const report = await generateAudioDiagnosticReport();

    expect(report).toContain('Overall Status: ❌ UNHEALTHY');
    expect(report).toContain('Valid Files: 0/4');
    expect(report).toContain('⚠️  Invalid Audio Files:');
    expect(report).toContain('Recommendations:');
    expect(report).toContain('Audio system will run in silent mode');
  });

  it('should generate report with mixed file states', async () => {
    vi.mocked(getAudioFileExtension)
      .mockReturnValueOnce('mp3')
      .mockReturnValueOnce('flac')
      .mockReturnValueOnce('mp3')
      .mockReturnValueOnce('mp3');

    vi.mocked(isAudioFormatSupported)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    vi.mocked(validateAudioFile)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)
      .mockRejectedValueOnce(new Error('File could not be loaded'))
      .mockResolvedValueOnce(false);

    const report = await generateAudioDiagnosticReport();

    expect(report).toContain('✅ Valid Audio Files:');
    expect(report).toContain('🚫 Unsupported Audio Files:');
    expect(report).toContain('❌ Missing Audio Files:');
    expect(report).toContain('⚠️  Invalid Audio Files:');
    expect(report).toContain('Convert unsupported files to MP3 or WAV format');
    expect(report).toContain('Add missing audio files');
  });
});

describe('Audio Validation - File Size Checking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should check audio file sizes successfully', async () => {
    vi.mocked(fetch).mockResolvedValue({
      headers: {
        get: vi.fn().mockReturnValue('1024000'), // 1MB
      },
    } as any);

    const fileSizes = await checkAudioFileSizes();

    expect(fileSizes['/audio/background-music.mp3']).toBe(1024000);
    expect(fileSizes['/audio/click-sound.wav']).toBe(1024000);
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it('should handle missing content-length header', async () => {
    vi.mocked(fetch).mockResolvedValue({
      headers: {
        get: vi.fn().mockReturnValue(null),
      },
    } as any);

    const fileSizes = await checkAudioFileSizes();

    Object.values(fileSizes).forEach(size => {
      expect(size).toBeUndefined();
    });
  });

  it('should handle fetch errors', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    const fileSizes = await checkAudioFileSizes();

    Object.values(fileSizes).forEach(size => {
      expect(size).toBe(-1);
    });
  });

  it('should format file sizes correctly', () => {
    expect(formatFileSize(-1)).toBe('Unknown');
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1048576)).toBe('1.0 MB');
    expect(formatFileSize(1073741824)).toBe('1.0 GB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('should check file size recommendations', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        headers: { get: vi.fn().mockReturnValue('6000000') }, // 6MB background music (over limit)
      } as any)
      .mockResolvedValueOnce({
        headers: { get: vi.fn().mockReturnValue('300000') }, // 300KB click sound (within limit)
      } as any)
      .mockResolvedValueOnce({
        headers: { get: vi.fn().mockReturnValue('600000') }, // 600KB success sound (over limit)
      } as any)
      .mockResolvedValueOnce({
        headers: { get: vi.fn().mockReturnValue('400000') }, // 400KB failure sound (within limit)
      } as any);

    const recommendations = await checkAudioFileSizeRecommendations();

    expect(recommendations).toHaveLength(4);
    
    // Background music (over 5MB limit)
    expect(recommendations[0].isWithinRecommendation).toBe(false);
    expect(recommendations[0].type).toBe('background');
    expect(recommendations[0].recommendedMaxSize).toBe(5 * 1024 * 1024);
    
    // Click sound (within 500KB limit)
    expect(recommendations[1].isWithinRecommendation).toBe(true);
    expect(recommendations[1].type).toBe('effect');
    expect(recommendations[1].recommendedMaxSize).toBe(500 * 1024);
    
    // Success sound (over 500KB limit)
    expect(recommendations[2].isWithinRecommendation).toBe(false);
    expect(recommendations[2].type).toBe('effect');
    
    // Failure sound (within 500KB limit)
    expect(recommendations[3].isWithinRecommendation).toBe(true);
    expect(recommendations[3].type).toBe('effect');
  });

  it('should handle negative file sizes in recommendations', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    const recommendations = await checkAudioFileSizeRecommendations();

    recommendations.forEach(rec => {
      expect(rec.size).toBe(-1);
      expect(rec.isWithinRecommendation).toBe(false);
      expect(rec.formattedSize).toBe('Unknown');
    });
  });
});

describe('Audio Validation - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle empty audio paths', async () => {
    // Mock empty AUDIO_PATHS
    vi.doMock('../audio.js', () => ({
      AUDIO_PATHS: {},
      validateAudioFile: vi.fn(),
      getAudioFileExtension: vi.fn(),
      isAudioFormatSupported: vi.fn(),
    }));

    const results = await validateAllAudioFiles();
    expect(results).toHaveLength(0);
  });

  it('should handle validation timeout scenarios', async () => {
    vi.mocked(validateAudioFile).mockImplementation(() => 
      new Promise((resolve) => {
        setTimeout(() => resolve(false), 10000); // Long timeout
      })
    );

    const startTime = Date.now();
    await validateAllAudioFiles();
    const endTime = Date.now();

    // Should not take too long due to internal timeouts
    expect(endTime - startTime).toBeLessThan(8000);
  });

  it('should handle concurrent validation calls', async () => {
    vi.mocked(getAudioFileExtension).mockReturnValue('mp3');
    vi.mocked(isAudioFormatSupported).mockReturnValue(true);
    vi.mocked(validateAudioFile).mockResolvedValue(true);

    const promises = [
      validateAllAudioFiles(),
      validateAllAudioFiles(),
      validateAllAudioFiles(),
    ];

    const results = await Promise.all(promises);

    results.forEach(result => {
      expect(result).toHaveLength(4);
      result.forEach(fileResult => {
        expect(fileResult.isValid).toBe(true);
      });
    });
  });

  it('should handle malformed fetch responses', async () => {
    vi.mocked(fetch).mockResolvedValue({
      headers: {
        get: vi.fn().mockReturnValue('not-a-number'),
      },
    } as any);

    const fileSizes = await checkAudioFileSizes();

    Object.values(fileSizes).forEach(size => {
      expect(size).toBeNaN();
    });
  });
});
