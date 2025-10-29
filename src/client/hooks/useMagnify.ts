import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  CursorPosition, 
  getCursorPosition, 
  calculateViewportConstraints,
  throttle,
  handleOrientationChange,
  isTouchDevice,
  getTouchGestureConfig,
  PerformanceMonitor,
  createPerformanceMonitor,
  updatePerformanceMetrics
} from '../utils/magnify';

export interface MagnifyState {
  isHovering: boolean;
  cursorPosition: CursorPosition | null;
  isVisible: boolean;
  adjustedPosition: { x: number; y: number } | null;
  isFeatureDisabled: boolean;
  performanceMonitor: PerformanceMonitor;
}

export interface MagnifyHandlers {
  handleMouseEnter: (event: React.MouseEvent) => void;
  handleMouseMove: (event: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  handleTouchStart: (event: React.TouchEvent) => void;
  handleTouchMove: (event: React.TouchEvent) => void;
  handleTouchEnd: () => void;
}

/**
 * Custom hook for managing magnification state and interactions with performance monitoring
 * @param containerRef Reference to the container element
 * @param isActive Whether magnification is currently active
 * @param circleRadius Radius of the magnified circle
 * @returns Tuple of [state, handlers]
 */
export const useMagnify = (
  containerRef: React.RefObject<HTMLDivElement>,
  isActive: boolean = true,
  circleRadius: number = 60
): [MagnifyState, MagnifyHandlers] => {
  const [isHovering, setIsHovering] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
  const [adjustedPosition, setAdjustedPosition] = useState<{ x: number; y: number } | null>(null);
  const [isFeatureDisabled, setIsFeatureDisabled] = useState(false);
  
  // Touch state management
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTouchActiveRef = useRef(false);
  const touchStartPositionRef = useRef<{ x: number; y: number } | null>(null);
  
  // Performance monitoring
  const performanceMonitorRef = useRef<PerformanceMonitor>(createPerformanceMonitor());
  const errorCountRef = useRef(0);
  const maxErrorsBeforeDisable = 5;
  
  // Responsive state
  const orientationCleanupRef = useRef<(() => void) | null>(null);
  
  // Calculate if magnification should be visible
  const isVisible = isActive && isHovering && cursorPosition !== null && !isFeatureDisabled;
  
  // Throttled position update function with enhanced performance monitoring
  const updatePosition = useCallback(
    throttle((position: CursorPosition) => {
      if (isFeatureDisabled) return;
      
      try {
        // Update performance metrics (disabled in development to avoid false positives)
        if (process.env.NODE_ENV !== 'development') {
          performanceMonitorRef.current = updatePerformanceMetrics(performanceMonitorRef.current);
        }
        
        // Check if feature should be disabled due to poor performance
        if (performanceMonitorRef.current.shouldDisableFeature) {
          console.info('Magnification feature disabled due to performance constraints');
          setIsFeatureDisabled(true);
          return;
        }
        
        setCursorPosition(position);
        
        // Calculate viewport constraints and adjusted position
        const constraints = calculateViewportConstraints(
          { x: position.x, y: position.y },
          containerRef,
          circleRadius
        );
        
        setAdjustedPosition(constraints.adjustedPosition);
        
        // Reset error count on successful operation
        errorCountRef.current = 0;
        
      } catch (error) {
        console.error('Error updating magnification position:', error);
        
        // Increment error count and disable feature if too many errors
        errorCountRef.current++;
        if (errorCountRef.current >= maxErrorsBeforeDisable) {
          console.warn('Magnification feature disabled due to repeated errors');
          setIsFeatureDisabled(true);
        }
      }
    }, 16), // ~60fps
    [containerRef, circleRadius, isFeatureDisabled]
  );
  
  // Mouse event handlers with error handling
  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    if (!isActive || isFeatureDisabled) return;
    
    try {
      setIsHovering(true);
      const position = getCursorPosition(event, containerRef);
      if (position) {
        updatePosition(position);
      }
    } catch (error) {
      console.error('Error in mouse enter handler:', error);
      errorCountRef.current++;
      if (errorCountRef.current >= maxErrorsBeforeDisable) {
        setIsFeatureDisabled(true);
      }
    }
  }, [isActive, isFeatureDisabled, containerRef, updatePosition]);
  
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isActive || !isHovering || isFeatureDisabled) return;
    
    try {
      const position = getCursorPosition(event, containerRef);
      if (position) {
        updatePosition(position);
      }
    } catch (error) {
      console.error('Error in mouse move handler:', error);
      errorCountRef.current++;
      if (errorCountRef.current >= maxErrorsBeforeDisable) {
        setIsFeatureDisabled(true);
      }
    }
  }, [isActive, isHovering, isFeatureDisabled, containerRef, updatePosition]);
  
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setCursorPosition(null);
    setAdjustedPosition(null);
  }, []);
  
  // Touch event handlers for mobile support with error handling
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (!isActive || !isTouchDevice() || isFeatureDisabled) return;
    
    try {
      const touchConfig = getTouchGestureConfig();
      
      // Store initial touch position for movement threshold detection
      const position = getCursorPosition(event, containerRef);
      if (position) {
        touchStartPositionRef.current = { x: position.x, y: position.y };
      }
      
      // Prevent default scrolling if configured
      if (touchConfig.preventScrolling) {
        event.preventDefault();
      }
      
      // Clear any existing timeout
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      
      // Set touch and hold timeout with device-specific duration
      touchTimeoutRef.current = setTimeout(() => {
        if (isFeatureDisabled) return;
        
        isTouchActiveRef.current = true;
        setIsHovering(true);
        
        // Haptic feedback if supported
        if (touchConfig.enableHapticFeedback && navigator.vibrate) {
          try {
            navigator.vibrate(50);
          } catch (vibrateError) {
            // Ignore vibration errors
          }
        }
        
        if (position) {
          updatePosition(position);
        }
      }, touchConfig.holdDuration);
    } catch (error) {
      console.error('Error in touch start handler:', error);
      errorCountRef.current++;
      if (errorCountRef.current >= maxErrorsBeforeDisable) {
        setIsFeatureDisabled(true);
      }
    }
  }, [isActive, isFeatureDisabled, containerRef, updatePosition]);
  
  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!isActive || !isTouchDevice() || isFeatureDisabled) return;
    
    try {
      const touchConfig = getTouchGestureConfig();
      const position = getCursorPosition(event, containerRef);
      
      if (!position) return;
      
      // Check if touch has moved beyond threshold before activating magnification
      if (!isTouchActiveRef.current && touchStartPositionRef.current) {
        const deltaX = Math.abs(position.x - touchStartPositionRef.current.x);
        const deltaY = Math.abs(position.y - touchStartPositionRef.current.y);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // If moved beyond threshold, cancel touch and hold
        if (distance > touchConfig.movementThreshold) {
          if (touchTimeoutRef.current) {
            clearTimeout(touchTimeoutRef.current);
            touchTimeoutRef.current = null;
          }
          touchStartPositionRef.current = null;
          return;
        }
      }
      
      // Only update position if magnification is active
      if (isTouchActiveRef.current) {
        // Prevent scrolling during magnification
        if (touchConfig.preventScrolling) {
          event.preventDefault();
        }
        
        updatePosition(position);
      }
    } catch (error) {
      console.error('Error in touch move handler:', error);
      errorCountRef.current++;
      if (errorCountRef.current >= maxErrorsBeforeDisable) {
        setIsFeatureDisabled(true);
      }
    }
  }, [isActive, isFeatureDisabled, containerRef, updatePosition]);
  
  const handleTouchEnd = useCallback(() => {
    // Clear timeout if touch ends before hold duration
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    
    // Reset touch state
    isTouchActiveRef.current = false;
    touchStartPositionRef.current = null;
    setIsHovering(false);
    setCursorPosition(null);
    setAdjustedPosition(null);
  }, []);
  
  // Handle orientation changes and responsive updates with error handling
  useEffect(() => {
    const handleResponsiveUpdate = () => {
      try {
        // Reset magnification state on orientation change to avoid positioning issues
        if (isHovering) {
          setIsHovering(false);
          setCursorPosition(null);
          setAdjustedPosition(null);
          isTouchActiveRef.current = false;
          
          if (touchTimeoutRef.current) {
            clearTimeout(touchTimeoutRef.current);
            touchTimeoutRef.current = null;
          }
        }
        
        // Reset performance monitor on orientation change
        performanceMonitorRef.current = createPerformanceMonitor();
        
      } catch (error) {
        console.error('Error handling orientation change:', error);
        setIsFeatureDisabled(true);
      }
    };
    
    // Set up orientation change listener
    orientationCleanupRef.current = handleOrientationChange(handleResponsiveUpdate);
    
    return () => {
      if (orientationCleanupRef.current) {
        orientationCleanupRef.current();
      }
    };
  }, [isHovering]);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
      if (orientationCleanupRef.current) {
        orientationCleanupRef.current();
      }
    };
  }, []);
  
  // Reset state when inactive or feature is disabled
  useEffect(() => {
    if (!isActive || isFeatureDisabled) {
      setIsHovering(false);
      setCursorPosition(null);
      setAdjustedPosition(null);
      isTouchActiveRef.current = false;
      
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
        touchTimeoutRef.current = null;
      }
    }
  }, [isActive, isFeatureDisabled]);
  
  const state: MagnifyState = {
    isHovering,
    cursorPosition,
    isVisible,
    adjustedPosition,
    isFeatureDisabled,
    performanceMonitor: performanceMonitorRef.current,
  };
  
  const handlers: MagnifyHandlers = {
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
  
  return [state, handlers];
};
