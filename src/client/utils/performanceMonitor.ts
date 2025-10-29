/**
 * Performance monitoring utilities for splash screen optimization
 * Tracks loading times, memory usage, and provides adaptive strategies
 */

export interface PerformanceMetrics {
  imageLoadTime: number;
  totalLoadTime: number;
  memoryUsage: number | undefined;
  networkType: string;
  deviceType: 'low-end' | 'mid-range' | 'high-end';
}

export interface AdaptiveSettings {
  enableAnimations: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  preloadStrategy: 'none' | 'critical' | 'all';
  animationComplexity: 'minimal' | 'standard' | 'enhanced';
}

/**
 * Performance monitor class for tracking and optimizing splash screen performance
 */
export class PerformanceMonitor {
  private startTime: number = 0;
  private metrics: Partial<PerformanceMetrics> = {};
  private settings: AdaptiveSettings;

  constructor() {
    this.startTime = performance.now();
    this.settings = this.calculateAdaptiveSettings();
  }

  /**
   * Calculate adaptive settings based on device capabilities
   */
  private calculateAdaptiveSettings(): AdaptiveSettings {
    // @ts-ignore - navigator.connection
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    // @ts-ignore - navigator.deviceMemory
    const deviceMemory = navigator.deviceMemory || 4;
    // @ts-ignore - navigator.hardwareConcurrency
    const cores = navigator.hardwareConcurrency || 4;

    const effectiveType = connection?.effectiveType || '4g';
    const saveData = connection?.saveData || false;
    
    // Determine device type
    let deviceType: 'low-end' | 'mid-range' | 'high-end' = 'mid-range';
    if (deviceMemory <= 2 || cores <= 2) {
      deviceType = 'low-end';
    } else if (deviceMemory >= 8 && cores >= 8) {
      deviceType = 'high-end';
    }

    // Calculate settings based on capabilities
    const enableAnimations = !saveData && 
      deviceType !== 'low-end' && 
      effectiveType !== 'slow-2g' && 
      effectiveType !== '2g' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const imageQuality = saveData || deviceType === 'low-end' || effectiveType === '2g' 
      ? 'low' 
      : deviceType === 'high-end' && effectiveType === '4g' 
        ? 'high' 
        : 'medium';

    const preloadStrategy = saveData || effectiveType === 'slow-2g' 
      ? 'none' 
      : deviceType === 'low-end' || effectiveType === '2g' 
        ? 'critical' 
        : 'all';

    const animationComplexity = deviceType === 'low-end' || saveData 
      ? 'minimal' 
      : deviceType === 'high-end' && enableAnimations 
        ? 'enhanced' 
        : 'standard';

    return {
      enableAnimations,
      imageQuality,
      preloadStrategy,
      animationComplexity,
    };
  }

  /**
   * Record image loading completion
   */
  recordImageLoad(loadTime: number): void {
    this.metrics.imageLoadTime = loadTime;
  }

  /**
   * Record total loading completion
   */
  recordTotalLoad(): void {
    this.metrics.totalLoadTime = performance.now() - this.startTime;
    
    // Record memory usage if available
    if ('memory' in performance) {
      // @ts-ignore - performance.memory is not in TypeScript types
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    // @ts-ignore - navigator.connection
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    return {
      imageLoadTime: this.metrics.imageLoadTime || 0,
      totalLoadTime: this.metrics.totalLoadTime || 0,
      memoryUsage: this.metrics.memoryUsage,
      networkType: connection?.effectiveType || 'unknown',
      deviceType: this.getDeviceType(),
    };
  }

  /**
   * Get adaptive settings for current device
   */
  getAdaptiveSettings(): AdaptiveSettings {
    return { ...this.settings };
  }

  /**
   * Update settings based on runtime performance
   */
  updateSettings(metrics: Partial<PerformanceMetrics>): void {
    // If loading is taking too long, reduce quality
    if (metrics.imageLoadTime && metrics.imageLoadTime > 3000) {
      this.settings.imageQuality = 'low';
      this.settings.preloadStrategy = 'critical';
      this.settings.animationComplexity = 'minimal';
    }

    // If memory usage is high, reduce complexity
    if (metrics.memoryUsage && metrics.memoryUsage > 50 * 1024 * 1024) { // 50MB
      this.settings.animationComplexity = 'minimal';
      this.settings.enableAnimations = false;
    }
  }

  /**
   * Get device type classification
   */
  private getDeviceType(): 'low-end' | 'mid-range' | 'high-end' {
    // @ts-ignore - navigator.deviceMemory
    const deviceMemory = navigator.deviceMemory || 4;
    // @ts-ignore - navigator.hardwareConcurrency
    const cores = navigator.hardwareConcurrency || 4;

    if (deviceMemory <= 2 || cores <= 2) {
      return 'low-end';
    } else if (deviceMemory >= 8 && cores >= 8) {
      return 'high-end';
    }
    return 'mid-range';
  }

  /**
   * Check if device supports hardware acceleration
   */
  supportsHardwareAcceleration(): boolean {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  }

  /**
   * Get recommended CSS animation settings
   */
  getAnimationSettings(): {
    duration: string;
    easing: string;
    complexity: 'minimal' | 'standard' | 'enhanced';
  } {
    const { animationComplexity, enableAnimations } = this.settings;
    
    if (!enableAnimations) {
      return {
        duration: '0s',
        easing: 'linear',
        complexity: 'minimal',
      };
    }

    switch (animationComplexity) {
      case 'minimal':
        return {
          duration: '0.2s',
          easing: 'ease-out',
          complexity: 'minimal',
        };
      case 'enhanced':
        return {
          duration: '0.6s',
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          complexity: 'enhanced',
        };
      default:
        return {
          duration: '0.3s',
          easing: 'ease-in-out',
          complexity: 'standard',
        };
    }
  }

  /**
   * Log performance metrics for debugging
   */
  logMetrics(): void {
    const metrics = this.getMetrics();
    const settings = this.getAdaptiveSettings();
    
    console.group('🚀 Splash Screen Performance Metrics');
    console.log('📊 Metrics:', metrics);
    console.log('⚙️ Adaptive Settings:', settings);
    console.log('🎨 Animation Settings:', this.getAnimationSettings());
    console.groupEnd();
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for using performance monitoring in React components
 */
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);
  const [settings, setSettings] = React.useState<AdaptiveSettings>(
    performanceMonitor.getAdaptiveSettings()
  );

  React.useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = performanceMonitor.getMetrics();
      setMetrics(currentMetrics);
      
      // Update settings based on performance
      performanceMonitor.updateSettings(currentMetrics);
      setSettings(performanceMonitor.getAdaptiveSettings());
    };

    // Update metrics periodically
    const interval = setInterval(updateMetrics, 1000);
    
    // Initial update
    updateMetrics();

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    settings,
    animationSettings: performanceMonitor.getAnimationSettings(),
    logMetrics: () => performanceMonitor.logMetrics(),
  };
};

// Import React for the hook
import React from 'react';
