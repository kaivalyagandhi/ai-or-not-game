/**
 * Lazy loading utilities for non-critical elements
 * Implements intersection observer for performance optimization
 */

import React from 'react';
import { performanceMonitor } from './performanceMonitor';

export interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  fallbackDelay?: number;
}

export interface LazyLoadResult {
  isVisible: boolean;
  isLoaded: boolean;
  ref: React.RefObject<HTMLElement>;
}

/**
 * Intersection Observer manager for lazy loading
 */
class LazyLoadManager {
  private observers: Map<string, IntersectionObserver> = new Map();
  private callbacks: Map<Element, () => void> = new Map();

  /**
   * Get or create intersection observer with specific options
   */
  private getObserver(options: LazyLoadOptions): IntersectionObserver {
    const key = JSON.stringify(options);
    
    if (!this.observers.has(key)) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const callback = this.callbacks.get(entry.target);
              if (callback) {
                callback();
                
                // Remove from observer if triggerOnce is true
                if (options.triggerOnce !== false) {
                  observer.unobserve(entry.target);
                  this.callbacks.delete(entry.target);
                }
              }
            }
          });
        },
        {
          threshold: options.threshold || 0.1,
          rootMargin: options.rootMargin || '50px',
        }
      );
      
      this.observers.set(key, observer);
    }
    
    return this.observers.get(key)!;
  }

  /**
   * Observe an element for lazy loading
   */
  observe(
    element: Element, 
    callback: () => void, 
    options: LazyLoadOptions = {}
  ): void {
    const observer = this.getObserver(options);
    this.callbacks.set(element, callback);
    observer.observe(element);
  }

  /**
   * Stop observing an element
   */
  unobserve(element: Element): void {
    this.callbacks.delete(element);
    this.observers.forEach(observer => observer.unobserve(element));
  }

  /**
   * Clean up all observers
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.callbacks.clear();
  }
}

// Global lazy load manager instance
const lazyLoadManager = new LazyLoadManager();

/**
 * React hook for lazy loading elements
 */
export const useLazyLoad = (options: LazyLoadOptions = {}): LazyLoadResult => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const ref = React.useRef<HTMLElement>(null);
  const settings = performanceMonitor.getAdaptiveSettings();

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Skip lazy loading on low-end devices or if preload strategy is 'all'
    if (settings.preloadStrategy === 'all' || settings.deviceType === 'low-end') {
      setIsVisible(true);
      setIsLoaded(true);
      return;
    }

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      const fallbackTimeout = setTimeout(() => {
        setIsVisible(true);
        setIsLoaded(true);
      }, options.fallbackDelay || 1000);

      return () => clearTimeout(fallbackTimeout);
    }

    // Set up intersection observer
    const callback = () => {
      setIsVisible(true);
      // Add small delay to ensure smooth loading
      setTimeout(() => setIsLoaded(true), 100);
    };

    lazyLoadManager.observe(element, callback, options);

    return () => {
      lazyLoadManager.unobserve(element);
    };
  }, [options.threshold, options.rootMargin, options.triggerOnce, options.fallbackDelay]);

  return { isVisible, isLoaded, ref };
};

/**
 * React hook for lazy loading images with enhanced error handling
 */
export const useLazyImage = (
  src: string, 
  options: LazyLoadOptions & { 
    placeholder?: string;
    onLoad?: () => void;
    onError?: (error: Error) => void;
  } = {}
) => {
  const { isVisible, isLoaded, ref } = useLazyLoad(options);
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState<Error | null>(null);
  const [imageSrc, setImageSrc] = React.useState(options.placeholder || '');

  React.useEffect(() => {
    if (!isVisible || !src) return;

    const img = new Image();
    const startTime = performance.now();

    img.onload = () => {
      const loadTime = performance.now() - startTime;
      performanceMonitor.recordImageLoad(loadTime);
      
      setImageSrc(src);
      setImageLoaded(true);
      setImageError(null);
      
      if (options.onLoad) {
        options.onLoad();
      }
    };

    img.onerror = () => {
      const error = new Error(`Failed to load image: ${src}`);
      setImageError(error);
      performanceMonitor.recordImageLoad(-1); // Indicate failure
      
      if (options.onError) {
        options.onError(error);
      }
    };

    // Set loading attributes for optimization
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = src;

  }, [isVisible, src, options.onLoad, options.onError]);

  return {
    ref,
    src: imageSrc,
    isVisible,
    isLoaded: isLoaded && imageLoaded,
    error: imageError,
    placeholder: options.placeholder,
  };
};

/**
 * React component for lazy loading content
 */
export const LazyLoad: React.FC<{
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  options?: LazyLoadOptions;
  className?: string;
}> = ({ children, placeholder, options = {}, className }) => {
  const { isVisible, isLoaded, ref } = useLazyLoad(options);

  return React.createElement('div', {
    ref: (el: HTMLElement | null) => { 
      if (ref.current !== el) ref.current = el; 
    },
    className
  }, isLoaded ? children : placeholder);
};

/**
 * React component for lazy loading images
 */
export const LazyImage: React.FC<{
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  options?: LazyLoadOptions & {
    onLoad?: () => void;
    onError?: (error: Error) => void;
  };
}> = ({ src, alt, placeholder, className, options = {} }) => {
  const { ref, src: imageSrc, isLoaded, error } = useLazyImage(src, { 
    placeholder, 
    ...options 
  });

  if (error) {
    return React.createElement('div', {
      ref: (el: HTMLElement | null) => { 
        if (ref.current !== el) ref.current = el; 
      },
      className: `${className} flex items-center justify-center bg-gray-100 text-gray-500`
    }, React.createElement('span', { className: 'text-sm' }, 'Failed to load image'));
  }

  return React.createElement('img', {
    ref: (el: HTMLImageElement | null) => { 
      if (ref.current !== el) ref.current = el; 
    },
    src: imageSrc,
    alt,
    className: `${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`,
    loading: 'lazy',
    decoding: 'async'
  });
};

/**
 * Preload critical images immediately
 */
export const preloadCriticalImages = (urls: string[]): Promise<void[]> => {
  const settings = performanceMonitor.getAdaptiveSettings();
  
  // Skip preloading on save-data mode or low-end devices
  if (settings.preloadStrategy === 'none') {
    return Promise.resolve([]);
  }

  const promises = urls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      const startTime = performance.now();
      
      img.onload = () => {
        const loadTime = performance.now() - startTime;
        performanceMonitor.recordImageLoad(loadTime);
        resolve();
      };
      
      img.onerror = () => {
        performanceMonitor.recordImageLoad(-1);
        reject(new Error(`Failed to preload: ${url}`));
      };
      
      img.src = url;
    });
  });

  return Promise.allSettled(promises).then(results => 
    results.map(result => 
      result.status === 'fulfilled' ? result.value : undefined
    ).filter(Boolean) as void[]
  );
};

/**
 * Clean up lazy load manager on app unmount
 */
export const cleanupLazyLoader = (): void => {
  lazyLoadManager.cleanup();
};

// Clean up on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupLazyLoader);
}
