/**
 * Image preloading utilities for smooth loading experience
 * Supports WebP with JPEG fallbacks for optimal performance
 * Enhanced with compression detection and lazy loading strategies
 */

import React from 'react';

export interface ImageAsset {
  webp: string;
  jpeg: string;
  alt: string;
}

export interface PreloadResult {
  src: string;
  loaded: boolean;
  error?: string;
}

/**
 * Splash screen image assets configuration
 */
export const splashImageAssets: Record<string, ImageAsset> = {
  leftPuppy: {
    webp: '/images/splash/golden-retriever-left.webp',
    jpeg: '/images/splash/golden-retriever-left.jpg',
    alt: 'Golden retriever puppy for AI side',
  },
  rightPuppy: {
    webp: '/images/splash/golden-retriever-right.webp',
    jpeg: '/images/splash/golden-retriever-right.jpg',
    alt: 'Golden retriever puppy for REAL side',
  },
};

/**
 * Check if browser supports WebP format
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Check network connection quality for mobile optimization
 */
export const getNetworkInfo = (): { 
  effectiveType: string; 
  saveData: boolean; 
  downlink?: number;
  rtt?: number;
} => {
  // @ts-ignore - navigator.connection is not in TypeScript types but exists in modern browsers
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  return {
    effectiveType: connection?.effectiveType || '4g',
    saveData: connection?.saveData || false,
    downlink: connection?.downlink, // Mbps
    rtt: connection?.rtt, // Round trip time in ms
  };
};

/**
 * Detect device performance capabilities
 */
export const getDeviceCapabilities = (): {
  isLowEndDevice: boolean;
  memoryStatus: 'low' | 'medium' | 'high';
  supportsWebP: boolean;
  supportsAvif: boolean;
} => {
  // @ts-ignore - navigator.deviceMemory is experimental
  const deviceMemory = navigator.deviceMemory || 4;
  // @ts-ignore - navigator.hardwareConcurrency
  const cores = navigator.hardwareConcurrency || 4;
  
  const isLowEndDevice = deviceMemory <= 2 || cores <= 2;
  const memoryStatus = deviceMemory <= 2 ? 'low' : deviceMemory <= 4 ? 'medium' : 'high';
  
  return {
    isLowEndDevice,
    memoryStatus,
    supportsWebP: false, // Will be set asynchronously
    supportsAvif: false, // Will be set asynchronously
  };
};

/**
 * Check if browser supports AVIF format (next-gen compression)
 */
export const supportsAvif = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
};

/**
 * Determine optimal image format based on network conditions and device capabilities
 */
export const getOptimalFormat = async (asset: ImageAsset): Promise<string> => {
  const { effectiveType, saveData, downlink } = getNetworkInfo();
  const { isLowEndDevice, memoryStatus } = getDeviceCapabilities();
  const isWebPSupported = await supportsWebP();
  
  // On very slow connections or save-data mode, prefer JPEG
  if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g' || (downlink && downlink < 0.5)) {
    return asset.jpeg;
  }
  
  // On low-end devices, prefer JPEG to reduce processing overhead
  if (isLowEndDevice || memoryStatus === 'low') {
    return asset.jpeg;
  }
  
  // On fast connections and capable devices, prefer WebP if supported
  return isWebPSupported ? asset.webp : asset.jpeg;
};

/**
 * Preload a single image with enhanced optimization and error handling
 */
export const preloadImage = (asset: ImageAsset, priority: 'high' | 'low' = 'high'): Promise<PreloadResult> => {
  return new Promise(async (resolve) => {
    const { saveData, effectiveType, rtt } = getNetworkInfo();
    const { isLowEndDevice } = getDeviceCapabilities();
    
    // Skip preloading on save-data mode or very slow connections
    if (saveData || effectiveType === 'slow-2g') {
      const optimalSrc = await getOptimalFormat(asset);
      resolve({
        src: optimalSrc,
        loaded: false,
        error: 'Skipped preloading due to network conditions',
      });
      return;
    }
    
    const imageSrc = await getOptimalFormat(asset);
    const img = new Image();
    
    // Adaptive timeout based on network conditions
    let timeoutDuration = 10000; // Default 10 seconds
    if (effectiveType === '2g') timeoutDuration = 15000;
    if (effectiveType === '3g') timeoutDuration = 8000;
    if (rtt && rtt > 1000) timeoutDuration = 15000; // High latency
    if (isLowEndDevice) timeoutDuration = 12000; // Extra time for processing
    
    const timeout = setTimeout(() => {
      resolve({
        src: imageSrc,
        loaded: false,
        error: `Image loading timeout after ${timeoutDuration}ms`,
      });
    }, timeoutDuration);
    
    img.onload = () => {
      clearTimeout(timeout);
      resolve({
        src: imageSrc,
        loaded: true,
      });
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      // Enhanced fallback strategy
      if (imageSrc === asset.webp) {
        const fallbackImg = new Image();
        const fallbackTimeout = setTimeout(() => {
          resolve({
            src: asset.jpeg,
            loaded: false,
            error: 'Fallback image loading timeout',
          });
        }, Math.min(timeoutDuration / 2, 5000));
        
        fallbackImg.onload = () => {
          clearTimeout(fallbackTimeout);
          resolve({
            src: asset.jpeg,
            loaded: true,
          });
        };
        
        fallbackImg.onerror = () => {
          clearTimeout(fallbackTimeout);
          resolve({
            src: asset.jpeg,
            loaded: false,
            error: 'Failed to load both WebP and JPEG versions',
          });
        };
        
        // Set fallback image properties
        fallbackImg.loading = priority === 'high' ? 'eager' : 'lazy';
        fallbackImg.decoding = 'async';
        fallbackImg.src = asset.jpeg;
      } else {
        resolve({
          src: imageSrc,
          loaded: false,
          error: 'Failed to load image',
        });
      }
    };
    
    // Optimize loading based on priority and device capabilities
    img.loading = priority === 'high' ? 'eager' : 'lazy';
    img.decoding = isLowEndDevice ? 'sync' : 'async'; // Sync decoding on low-end devices
    img.fetchPriority = priority as any; // Modern browsers support this
    
    // Add error recovery
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
  });
};

/**
 * Preload multiple images concurrently
 */
export const preloadImages = async (assets: Record<string, ImageAsset>): Promise<Record<string, PreloadResult>> => {
  const preloadPromises = Object.entries(assets).map(async ([key, asset]) => {
    const result = await preloadImage(asset);
    return [key, result] as const;
  });
  
  const results = await Promise.all(preloadPromises);
  return Object.fromEntries(results);
};

/**
 * Preload all splash screen images
 */
export const preloadSplashImages = (): Promise<Record<string, PreloadResult>> => {
  return preloadImages(splashImageAssets);
};

/**
 * Get the optimal image source for an asset
 */
export const getOptimalImageSrc = async (asset: ImageAsset): Promise<string> => {
  const isWebPSupported = await supportsWebP();
  return isWebPSupported ? asset.webp : asset.jpeg;
};

/**
 * Create CSS background image with WebP fallback
 */
export const createBackgroundImageCSS = (asset: ImageAsset): string => {
  return `
    background-image: url('${asset.jpeg}');
    background-image: url('${asset.webp}');
  `;
};

/**
 * Hook for managing image preloading state
 */
export interface UseImagePreloadingResult {
  images: Record<string, PreloadResult>;
  isLoading: boolean;
  hasErrors: boolean;
  loadedCount: number;
  totalCount: number;
  progress: number; // 0-100
}

/**
 * React hook for image preloading with mobile optimization
 */
export const useImagePreloading = (assets: Record<string, ImageAsset>): UseImagePreloadingResult => {
  const [images, setImages] = React.useState<Record<string, PreloadResult>>({});
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    let isMounted = true;
    
    const loadImages = async () => {
      try {
        const { effectiveType } = getNetworkInfo();
        
        // On very slow connections, skip preloading entirely
        if (effectiveType === 'slow-2g') {
          console.log('Skipping image preloading on slow connection');
          const fallbackResults: Record<string, PreloadResult> = {};
          
          for (const [key, asset] of Object.entries(assets)) {
            fallbackResults[key] = {
              src: asset.jpeg, // Use JPEG as fallback
              loaded: false,
              error: 'Skipped due to slow connection',
            };
          }
          
          if (isMounted) {
            setImages(fallbackResults);
            setIsLoading(false);
          }
          return;
        }
        
        // Progressive loading: load images one by one on mobile
        if (effectiveType === '2g' || effectiveType === '3g') {
          console.log('Using progressive loading for mobile connection');
          const progressiveResults: Record<string, PreloadResult> = {};
          
          for (const [key, asset] of Object.entries(assets)) {
            if (!isMounted) break;
            
            try {
              const result = await preloadImage(asset);
              progressiveResults[key] = result;
              
              // Update state after each image loads
              if (isMounted) {
                setImages({ ...progressiveResults });
              }
            } catch (error) {
              console.error(`Error loading image ${key}:`, error);
              progressiveResults[key] = {
                src: asset.jpeg,
                loaded: false,
                error: `Failed to load ${key}`,
              };
            }
          }
          
          if (isMounted) {
            setIsLoading(false);
          }
        } else {
          // Fast connection: load all images concurrently
          const results = await preloadImages(assets);
          if (isMounted) {
            setImages(results);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error preloading images:', error);
        if (isMounted) {
          // Provide fallback images even on error
          const fallbackResults: Record<string, PreloadResult> = {};
          for (const [key, asset] of Object.entries(assets)) {
            fallbackResults[key] = {
              src: asset.jpeg,
              loaded: false,
              error: 'Preloading failed, using fallback',
            };
          }
          setImages(fallbackResults);
          setIsLoading(false);
        }
      }
    };
    
    loadImages();
    
    return () => {
      isMounted = false;
    };
  }, [assets]);
  
  const loadedCount = Object.values(images).filter(img => img.loaded).length;
  const totalCount = Object.keys(assets).length;
  const hasErrors = Object.values(images).some(img => img.error);
  const progress = totalCount > 0 ? (loadedCount / totalCount) * 100 : 0;
  
  return {
    images,
    isLoading,
    hasErrors,
    loadedCount,
    totalCount,
    progress,
  };
};

/**
 * Lazy load an image on demand (for save-data mode)
 */
export const lazyLoadImage = async (asset: ImageAsset): Promise<PreloadResult> => {
  try {
    const optimalSrc = await getOptimalFormat(asset);
    
    return new Promise((resolve) => {
      const img = new Image();
      
      const timeout = setTimeout(() => {
        resolve({
          src: optimalSrc,
          loaded: false,
          error: 'Lazy loading timeout',
        });
      }, 5000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve({
          src: optimalSrc,
          loaded: true,
        });
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve({
          src: asset.jpeg, // Fallback to JPEG
          loaded: false,
          error: 'Lazy loading failed',
        });
      };
      
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = optimalSrc;
    });
  } catch (error) {
    return {
      src: asset.jpeg,
      loaded: false,
      error: 'Lazy loading error',
    };
  }
};
