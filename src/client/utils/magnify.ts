/**
 * Magnification utility functions for responsive sizing and viewport calculations
 */

export interface CursorPosition {
  x: number; // Relative to image container
  y: number; // Relative to image container
  clientX: number; // Absolute screen position
  clientY: number; // Absolute screen position
  timestamp: number; // For performance monitoring
}

export interface ViewportConstraints {
  containerBounds: DOMRect;
  viewportBounds: DOMRect;
  circleRadius: number;
  adjustedPosition: { x: number; y: number };
  isWithinBounds: boolean;
}

export interface MagnifyConfig {
  magnificationFactor: number; // Always 3
  circleRadius: number; // Responsive based on screen size
  borderWidth: number; // Matches game design (3px)
  borderColor: string; // Matches pre-selection border
  animationDuration: number; // Fade in/out timing
  performanceMode: 'high' | 'balanced' | 'low'; // Auto-detected based on device
}

/**
 * Calculate responsive circle radius based on container and screen dimensions
 * @param containerWidth Width of the image container
 * @returns Calculated circle radius in pixels
 */
export const getResponsiveCircleRadius = (containerWidth: number): number => {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isLandscape = screenWidth > screenHeight;
  
  // Base radius as percentage of container width with device-specific adjustments
  let basePercentage = 0.15; // 15% of container width
  
  // Adjust base percentage for different device types
  if (isMobile) {
    basePercentage = isLandscape ? 0.12 : 0.18; // Smaller in landscape, larger in portrait
  } else if (isTablet) {
    basePercentage = 0.14;
  }
  
  const baseRadius = Math.min(containerWidth * basePercentage, 100); // Max 100px
  
  // Device-specific sizing with orientation awareness
  if (isMobile) {
    const minRadius = isLandscape ? 50 : 65; // Smaller minimum in landscape
    const maxRadius = isLandscape ? 75 : 90; // Smaller maximum in landscape
    return Math.max(Math.min(baseRadius * 1.3, maxRadius), minRadius);
  } else if (isTablet) {
    return Math.max(Math.min(baseRadius * 1.1, 85), 55);
  } else {
    // Desktop
    return Math.max(Math.min(baseRadius, 80), 50);
  }
};

/**
 * Calculate viewport boundary constraints to keep magnified circle fully visible
 * @param cursorPosition Current cursor position
 * @param containerRef Reference to the image container element
 * @param circleRadius Radius of the magnified circle
 * @returns Viewport constraints with adjusted position
 */
export const calculateViewportConstraints = (
  cursorPosition: { x: number; y: number },
  containerRef: React.RefObject<HTMLDivElement>,
  circleRadius: number
): ViewportConstraints => {
  if (!containerRef.current) {
    return {
      containerBounds: new DOMRect(),
      viewportBounds: new DOMRect(),
      circleRadius,
      adjustedPosition: cursorPosition,
      isWithinBounds: false,
    };
  }

  const containerBounds = containerRef.current.getBoundingClientRect();
  const viewportBounds = new DOMRect(0, 0, window.innerWidth, window.innerHeight);
  
  // Add safe margins to prevent circle from touching viewport edges
  const isMobile = window.innerWidth < 768;
  const safeMargin = isMobile ? 10 : 5; // Larger margin on mobile for touch targets
  
  // Calculate absolute position of cursor
  const absoluteX = containerBounds.left + cursorPosition.x;
  const absoluteY = containerBounds.top + cursorPosition.y;
  
  // Calculate adjusted position to keep circle within viewport with safe margins
  let adjustedX = cursorPosition.x;
  let adjustedY = cursorPosition.y;
  
  // Check left boundary with safe margin
  if (absoluteX - circleRadius < safeMargin) {
    adjustedX = circleRadius + safeMargin - containerBounds.left;
  }
  
  // Check right boundary with safe margin
  if (absoluteX + circleRadius > viewportBounds.width - safeMargin) {
    adjustedX = viewportBounds.width - circleRadius - safeMargin - containerBounds.left;
  }
  
  // Check top boundary with safe margin (account for mobile browser UI)
  const topMargin = isMobile ? Math.max(safeMargin, 20) : safeMargin;
  if (absoluteY - circleRadius < topMargin) {
    adjustedY = circleRadius + topMargin - containerBounds.top;
  }
  
  // Check bottom boundary with safe margin (account for mobile browser UI)
  const bottomMargin = isMobile ? Math.max(safeMargin, 30) : safeMargin;
  if (absoluteY + circleRadius > viewportBounds.height - bottomMargin) {
    adjustedY = viewportBounds.height - circleRadius - bottomMargin - containerBounds.top;
  }
  
  // Ensure adjusted position stays within container bounds
  adjustedX = Math.max(circleRadius, Math.min(adjustedX, containerBounds.width - circleRadius));
  adjustedY = Math.max(circleRadius, Math.min(adjustedY, containerBounds.height - circleRadius));
  
  // Additional check to ensure the circle doesn't go outside the container
  if (adjustedX < 0) adjustedX = circleRadius;
  if (adjustedY < 0) adjustedY = circleRadius;
  if (adjustedX > containerBounds.width) adjustedX = containerBounds.width - circleRadius;
  if (adjustedY > containerBounds.height) adjustedY = containerBounds.height - circleRadius;
  
  const isWithinBounds = 
    Math.abs(adjustedX - cursorPosition.x) < 1 && 
    Math.abs(adjustedY - cursorPosition.y) < 1;
  
  return {
    containerBounds,
    viewportBounds,
    circleRadius,
    adjustedPosition: { x: adjustedX, y: adjustedY },
    isWithinBounds,
  };
};

/**
 * Get cursor position relative to container from mouse or touch event
 * @param event Mouse or touch event
 * @param containerRef Reference to the container element
 * @returns Cursor position relative to container
 */
export const getCursorPosition = (
  event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent,
  containerRef: React.RefObject<HTMLDivElement>
): CursorPosition | null => {
  if (!containerRef.current) return null;
  
  const rect = containerRef.current.getBoundingClientRect();
  let clientX: number;
  let clientY: number;
  
  // Handle touch events
  if ('touches' in event) {
    const touch = event.touches[0] || event.changedTouches[0];
    if (!touch) return null;
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else {
    // Handle mouse events
    clientX = event.clientX;
    clientY = event.clientY;
  }
  
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
    clientX,
    clientY,
    timestamp: Date.now(),
  };
};

/**
 * Throttle function for performance optimization
 * @param func Function to throttle
 * @param delay Delay in milliseconds (default 16ms for ~60fps)
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = 16
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      // Clear existing timeout and set a new one
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
        timeoutId = null;
      }, delay - (now - lastCall));
    }
  };
};

/**
 * Detect device performance mode based on hardware capabilities
 * @returns Performance mode setting
 */
export const detectPerformanceMode = (): 'high' | 'balanced' | 'low' => {
  // Check for hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2;
  
  // Check for device memory (if available)
  const memory = (navigator as any).deviceMemory || 4;
  
  // Check if it's a mobile device
  const isMobile = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
  
  // Determine performance mode
  if (cores >= 8 && memory >= 8 && !isMobile) {
    return 'high';
  } else if (cores >= 4 && memory >= 4) {
    return 'balanced';
  } else {
    return 'low';
  }
};

/**
 * Handle orientation change and responsive updates
 * @param callback Function to call when orientation changes
 * @returns Cleanup function to remove event listeners
 */
export const handleOrientationChange = (callback: () => void): (() => void) => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  const handleResize = () => {
    // Debounce orientation changes to avoid excessive updates
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      callback();
    }, 150);
  };
  
  // Listen for both resize and orientation change events
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
  
  // Cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
  };
};

/**
 * Check if device supports touch interactions
 * @returns True if device supports touch
 */
export const isTouchDevice = (): boolean => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

/**
 * Get touch gesture configuration based on device capabilities
 * @returns Touch gesture configuration
 */
export const getTouchGestureConfig = () => {
  const isMobile = window.innerWidth < 768;
  
  return {
    holdDuration: isMobile ? 400 : 500, // Shorter hold time on mobile
    movementThreshold: isMobile ? 15 : 10, // Larger threshold on mobile for finger precision
    preventScrolling: isMobile, // Prevent scrolling on mobile during magnification
    enableHapticFeedback: isMobile && 'vibrate' in navigator, // Haptic feedback on mobile
  };
};

/**
 * Performance monitoring interface for tracking magnification performance
 */
export interface PerformanceMonitor {
  frameCount: number;
  lastFrameTime: number;
  averageFps: number;
  memoryUsage: number;
  isPerformanceGood: boolean;
  shouldDisableFeature: boolean;
  isTabActive: boolean;
}

/**
 * Create a performance monitor for tracking magnification performance
 * @returns Performance monitor instance
 */
export const createPerformanceMonitor = (): PerformanceMonitor => {
  return {
    frameCount: 0,
    lastFrameTime: Date.now(),
    averageFps: 60,
    memoryUsage: 0,
    isPerformanceGood: true,
    shouldDisableFeature: false,
    isTabActive: !document.hidden,
  };
};

/**
 * Update performance metrics and determine if feature should be disabled
 * @param monitor Performance monitor instance
 * @param imageSize Optional image size for context-aware performance monitoring
 * @returns Updated performance monitor
 */
export const updatePerformanceMetrics = (
  monitor: PerformanceMonitor, 
  imageSize?: { width: number; height: number }
): PerformanceMonitor => {
  const now = Date.now();
  const deltaTime = now - monitor.lastFrameTime;
  
  monitor.frameCount++;
  
  // Calculate FPS every 4 seconds for very stable readings (longer for large images)
  const measurementInterval = imageSize && (imageSize.width * imageSize.height > 2000000) ? 5000 : 4000;
  
  if (deltaTime >= measurementInterval) {
    const currentFps = (monitor.frameCount * 1000) / deltaTime;
    
    // Use exponential moving average for smoother FPS calculation
    if (monitor.averageFps === 60) {
      // First measurement
      monitor.averageFps = currentFps;
    } else {
      // Smooth the FPS with exponential moving average (alpha = 0.15 for more stability)
      monitor.averageFps = monitor.averageFps * 0.85 + currentFps * 0.15;
    }
    
    monitor.frameCount = 0;
    monitor.lastFrameTime = now;
    
    // Check memory usage if available
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      monitor.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
    
    // Update tab visibility status
    monitor.isTabActive = !document.hidden;
    
    // Always mark performance as good - let users decide if they want magnification
    monitor.isPerformanceGood = true;
    
    // Never auto-disable the feature - users should have control
    monitor.shouldDisableFeature = false;
    
    // Optional: Log performance metrics for debugging without disabling
    if (process.env.NODE_ENV === 'development') {
      console.debug('Magnification performance metrics:', {
        fps: monitor.averageFps.toFixed(1),
        memoryUsage: (monitor.memoryUsage * 100).toFixed(1) + '%',
        tabActive: monitor.isTabActive,
        imageSize: imageSize ? `${imageSize.width}x${imageSize.height}` : 'unknown'
      });
    }
  }
  
  return monitor;
};

/**
 * Canvas context cleanup utility for memory management
 * @param canvas Canvas element to clean up
 */
export const cleanupCanvasContext = (canvas: HTMLCanvasElement | null): void => {
  if (!canvas) return;
  
  try {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Reset canvas size to free memory
      canvas.width = 0;
      canvas.height = 0;
      
      // Reset context state
      ctx.restore();
      ctx.save();
    }
  } catch (error) {
    console.warn('Error during canvas cleanup:', error);
  }
};

/**
 * Memory management utility for image resources
 * @param imageRef Image reference to clean up
 */
export const cleanupImageResources = (imageRef: React.MutableRefObject<HTMLImageElement | null>): void => {
  if (imageRef.current) {
    try {
      // Remove event listeners
      imageRef.current.onload = null;
      imageRef.current.onerror = null;
      
      // Clear image source to free memory
      imageRef.current.src = '';
      imageRef.current = null;
    } catch (error) {
      console.warn('Error during image cleanup:', error);
    }
  }
};

/**
 * Error recovery utility for canvas operations
 * @param canvas Canvas element
 * @param fallbackCallback Callback to execute on error
 * @returns True if canvas is usable, false if fallback should be used
 */
export const handleCanvasError = (
  canvas: HTMLCanvasElement | null,
  fallbackCallback?: () => void
): boolean => {
  if (!canvas) {
    fallbackCallback?.();
    return false;
  }
  
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Canvas 2D context not available, disabling magnification');
      fallbackCallback?.();
      return false;
    }
    
    // Test basic canvas operations
    ctx.save();
    ctx.restore();
    
    return true;
  } catch (error) {
    console.warn('Canvas error detected, falling back gracefully:', error);
    fallbackCallback?.();
    return false;
  }
};

/**
 * Image loading error handler with retry logic
 * @param imageUrl URL of the image to load
 * @param maxRetries Maximum number of retry attempts
 * @param onSuccess Success callback
 * @param onError Error callback
 * @returns Cleanup function
 */
export const loadImageWithRetry = (
  imageUrl: string,
  maxRetries: number = 1,
  onSuccess: (image: HTMLImageElement) => void,
  onError: (error: Error) => void
): (() => void) => {
  let retryCount = 0;
  let currentImage: HTMLImageElement | null = null;
  
  const attemptLoad = () => {
    if (currentImage) {
      currentImage.onload = null;
      currentImage.onerror = null;
    }
    
    currentImage = new Image();
    currentImage.crossOrigin = 'anonymous';
    
    currentImage.onload = () => {
      if (currentImage) {
        onSuccess(currentImage);
      }
    };
    
    currentImage.onerror = () => {
      retryCount++;
      
      if (retryCount <= maxRetries) {
        console.warn(`Image load failed, retrying (${retryCount}/${maxRetries}):`, imageUrl);
        setTimeout(attemptLoad, 1000 * retryCount); // Exponential backoff
      } else {
        const error = new Error(`Failed to load image after ${maxRetries} retries: ${imageUrl}`);
        onError(error);
      }
    };
    
    currentImage.src = imageUrl;
  };
  
  attemptLoad();
  
  // Return cleanup function
  return () => {
    if (currentImage) {
      currentImage.onload = null;
      currentImage.onerror = null;
      currentImage.src = '';
      currentImage = null;
    }
  };
};

/**
 * Get default magnification configuration based on device capabilities
 * @param containerWidth Width of the image container
 * @param borderColor Border color for the magnified circle
 * @returns Default magnification configuration
 */
export const getDefaultMagnifyConfig = (
  containerWidth: number,
  borderColor: string = '#007bff'
): MagnifyConfig => {
  const performanceMode = detectPerformanceMode();
  
  return {
    magnificationFactor: 2.5,
    circleRadius: getResponsiveCircleRadius(containerWidth),
    borderWidth: 3,
    borderColor,
    animationDuration: performanceMode === 'low' ? 300 : 150,
    performanceMode,
  };
};
