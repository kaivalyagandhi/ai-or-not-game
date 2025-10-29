import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useMagnify } from '../hooks/useMagnify';
import { MagnifyOverlay } from './MagnifyOverlay';
import { getResponsiveCircleRadius, handleOrientationChange } from '../utils/magnify';

export interface MagnifyContainerProps {
  children: React.ReactNode;
  imageUrl: string;
  isActive: boolean; // Only active during gameplay, not during feedback
  borderColor?: string; // Matches pre-selection border color
  className?: string;
}

/**
 * Container component that wraps game images with magnification functionality.
 * Provides hover and touch interactions without interfering with click events.
 */
export const MagnifyContainer: React.FC<MagnifyContainerProps> = ({
  children,
  imageUrl,
  isActive,
  borderColor = '#d1d5db', // Default gray-300 to match game's default border
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [circleRadius, setCircleRadius] = useState(60); // Default radius
  
  // Update circle radius responsively
  useEffect(() => {
    const updateRadius = () => {
      if (containerRef.current) {
        const newRadius = getResponsiveCircleRadius(containerRef.current.offsetWidth);
        setCircleRadius(newRadius);
      }
    };
    
    // Initial calculation
    updateRadius();
    
    // Set up responsive updates
    const cleanup = handleOrientationChange(updateRadius);
    
    // Also update on container resize (using ResizeObserver if available)
    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver && containerRef.current) {
      resizeObserver = new ResizeObserver(updateRadius);
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      cleanup();
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);
  
  // Use magnify hook for state and event handling
  const [magnifyState, magnifyHandlers] = useMagnify(
    containerRef as React.RefObject<HTMLDivElement>,
    isActive,
    circleRadius
  );
  
  // Click events are handled by child components (buttons)
  // No need for container-level click handling
  
  // Handle error from magnification overlay
  const handleMagnifyError = useCallback((error: Error) => {
    // Log errors only in development to avoid console noise in production
    if (process.env.NODE_ENV === 'development') {
      console.info('Magnification gracefully disabled:', error.message);
    }
    // Gracefully degrade - magnification will be disabled but game continues
  }, []);
  
  // Handle performance issues
  const handlePerformanceIssue = useCallback((_monitor: any) => {
    // Performance monitoring is handled internally by the magnification system
    // No additional logging needed here to avoid console noise
  }, []);
  
  return (
    <div
      ref={containerRef}
      className={`magnify-container ${className}`}
      style={{ position: 'relative' }}
      onMouseEnter={magnifyHandlers.handleMouseEnter}
      onMouseMove={magnifyHandlers.handleMouseMove}
      onMouseLeave={magnifyHandlers.handleMouseLeave}
      onTouchStart={magnifyHandlers.handleTouchStart}
      onTouchMove={magnifyHandlers.handleTouchMove}
      onTouchEnd={magnifyHandlers.handleTouchEnd}
    >
      {/* Original content (game image button) */}
      {children}
      
      {/* Magnification overlay - only renders when visible and not disabled */}
      {isActive && !magnifyState.isFeatureDisabled && (
        <MagnifyOverlay
          imageUrl={imageUrl}
          containerRef={containerRef as React.RefObject<HTMLDivElement>}
          cursorPosition={magnifyState.cursorPosition}
          adjustedPosition={magnifyState.adjustedPosition}
          isVisible={magnifyState.isVisible}
          borderColor={borderColor}
          magnificationFactor={2.5}
          circleRadius={circleRadius}
          onError={handleMagnifyError}
          onPerformanceIssue={handlePerformanceIssue}
        />
      )}
    </div>
  );
};
