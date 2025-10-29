import React, { useRef, useEffect, useCallback, useState } from 'react';
import { 
  CursorPosition, 
  PerformanceMonitor,
  createPerformanceMonitor,
  updatePerformanceMetrics,
  cleanupCanvasContext,
  cleanupImageResources,
  handleCanvasError,
  loadImageWithRetry
} from '../utils/magnify';

export interface MagnifyOverlayProps {
  imageUrl: string;
  containerRef: React.RefObject<HTMLDivElement>;
  cursorPosition: CursorPosition | null;
  adjustedPosition: { x: number; y: number } | null;
  isVisible: boolean;
  borderColor: string;
  magnificationFactor?: number;
  circleRadius?: number;
  onError?: (error: Error) => void;
  onPerformanceIssue?: (monitor: PerformanceMonitor) => void;
}

/**
 * Canvas-based magnification overlay component that renders a 2.5x magnified circular view
 * of the image area under the cursor with proper error handling and performance optimization
 */
export const MagnifyOverlay: React.FC<MagnifyOverlayProps> = ({
  imageUrl,
  containerRef,
  cursorPosition,
  adjustedPosition,
  isVisible,
  borderColor,
  magnificationFactor = 2.5,
  circleRadius = 60,
  onError,
  onPerformanceIssue,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isFeatureDisabled, setIsFeatureDisabled] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const performanceMonitorRef = useRef<PerformanceMonitor>(createPerformanceMonitor());
  const imageCleanupRef = useRef<(() => void) | null>(null);

  // Load source image for magnification with retry logic and error handling
  useEffect(() => {
    if (!imageUrl || isFeatureDisabled) return;

    // Clean up previous image loading
    if (imageCleanupRef.current) {
      imageCleanupRef.current();
    }

    const handleSuccess = (image: HTMLImageElement) => {
      sourceImageRef.current = image;
      
      // Check if image is too large and should disable magnification
      const imagePixels = image.naturalWidth * image.naturalHeight;
      const isExtremelyLarge = imagePixels > 50000000; // >50MP (very high threshold)
      
      if (isExtremelyLarge) {
        console.info('Magnification disabled for extremely large image:', {
          dimensions: `${image.naturalWidth}x${image.naturalHeight}`,
          pixels: imagePixels
        });
        setIsFeatureDisabled(true);
        return;
      }
      
      setImageLoaded(true);
      setImageError(null);
    };

    const handleError = (error: Error) => {
      setImageError(error.message);
      setImageLoaded(false);
      cleanupImageResources(sourceImageRef);
      
      if (onError) {
        onError(error);
      }
    };

    // Load image with retry logic
    imageCleanupRef.current = loadImageWithRetry(
      imageUrl,
      1, // Max 1 retry
      handleSuccess,
      handleError
    );

    return () => {
      if (imageCleanupRef.current) {
        imageCleanupRef.current();
        imageCleanupRef.current = null;
      }
    };
  }, [imageUrl, isFeatureDisabled, onError]);

  // Render magnified view on canvas with performance monitoring
  const renderMagnifiedView = useCallback(() => {
    const canvas = canvasRef.current;
    const sourceImage = sourceImageRef.current;
    
    if (!canvas || !sourceImage || !cursorPosition || !containerRef.current || !imageLoaded || isFeatureDisabled) {
      return;
    }

    // Check canvas availability and handle errors
    if (!handleCanvasError(canvas, () => setIsFeatureDisabled(true))) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsFeatureDisabled(true);
      return;
    }

    try {
      // Update performance metrics with image size context (disabled in development)
      if (process.env.NODE_ENV !== 'development') {
        const imageSize = sourceImage ? { width: sourceImage.naturalWidth, height: sourceImage.naturalHeight } : undefined;
        performanceMonitorRef.current = updatePerformanceMetrics(performanceMonitorRef.current, imageSize);
      }
      
      // Check if feature should be disabled due to poor performance (skip in development)
      if (process.env.NODE_ENV !== 'development' && performanceMonitorRef.current.shouldDisableFeature) {
        setIsFeatureDisabled(true);
        if (onPerformanceIssue) {
          onPerformanceIssue(performanceMonitorRef.current);
        }
        return;
      }

      // Calculate image size metrics first
      const imagePixels = sourceImage.naturalWidth * sourceImage.naturalHeight;
      const isLargeImage = imagePixels > 2000000; // >2MP
      const isVeryLargeImage = imagePixels > 10000000; // >10MP

      // Handle high-DPI displays with image size optimization
      let devicePixelRatio = window.devicePixelRatio || 1;
      const canvasSize = circleRadius * 2;
      
      // Reduce pixel ratio for very large images to save memory
      if (isVeryLargeImage) {
        devicePixelRatio = Math.min(devicePixelRatio, 1.5);
      } else if (isLargeImage) {
        devicePixelRatio = Math.min(devicePixelRatio, 2);
      }
      
      // Set actual canvas size for high-DPI
      canvas.width = canvasSize * devicePixelRatio;
      canvas.height = canvasSize * devicePixelRatio;
      
      // Scale context for high-DPI
      ctx.scale(devicePixelRatio, devicePixelRatio);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      // Save context state
      ctx.save();

      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(circleRadius, circleRadius, circleRadius, 0, 2 * Math.PI);
      ctx.clip();

      // Get container dimensions for scaling calculations
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      // Calculate source area to magnify (area under cursor)
      const sourceSize = circleRadius / magnificationFactor;
      
      // Calculate source coordinates relative to the original image dimensions
      const scaleX = sourceImage.naturalWidth / containerWidth;
      const scaleY = sourceImage.naturalHeight / containerHeight;
      
      const sourceX = Math.max(0, (cursorPosition.x - sourceSize) * scaleX);
      const sourceY = Math.max(0, (cursorPosition.y - sourceSize) * scaleY);
      const sourceWidth = Math.min(sourceSize * 2 * scaleX, sourceImage.naturalWidth - sourceX);
      const sourceHeight = Math.min(sourceSize * 2 * scaleY, sourceImage.naturalHeight - sourceY);

      // Adjust rendering quality based on performance and image size
      let renderingQuality: ImageSmoothingQuality = 'high';
      if (isVeryLargeImage || !performanceMonitorRef.current.isPerformanceGood) {
        renderingQuality = 'low';
      } else if (isLargeImage) {
        renderingQuality = 'medium';
      }
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = renderingQuality;
      
      ctx.drawImage(
        sourceImage,
        sourceX, sourceY, sourceWidth, sourceHeight, // source rectangle
        0, 0, circleRadius * 2, circleRadius * 2 // destination rectangle
      );

      // Restore context state
      ctx.restore();

      // Draw border around the circle
      ctx.beginPath();
      ctx.arc(circleRadius, circleRadius, circleRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3;
      ctx.stroke();

    } catch (error) {
      console.error('Error rendering magnified view:', error);
      
      // Disable feature on repeated canvas errors
      setIsFeatureDisabled(true);
      
      if (onError) {
        onError(error instanceof Error ? error : new Error('Canvas rendering failed'));
      }
    }
  }, [
    cursorPosition,
    containerRef,
    imageLoaded,
    isFeatureDisabled,
    magnificationFactor,
    circleRadius,
    borderColor,
    onError,
    onPerformanceIssue,
  ]);

  // Handle rendering with animation frame for smooth performance
  useEffect(() => {
    if (isVisible && imageLoaded && cursorPosition && adjustedPosition && !isFeatureDisabled) {
      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Schedule rendering on next frame
      animationFrameRef.current = requestAnimationFrame(renderMagnifiedView);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isVisible, imageLoaded, cursorPosition, adjustedPosition, isFeatureDisabled, renderMagnifiedView]);

  // Comprehensive cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel animation frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Clean up canvas context and memory
      cleanupCanvasContext(canvasRef.current);
      
      // Clean up image resources
      cleanupImageResources(sourceImageRef);
      
      // Clean up image loading
      if (imageCleanupRef.current) {
        imageCleanupRef.current();
        imageCleanupRef.current = null;
      }
    };
  }, []);

  // Don't render if image failed to load, not visible, or feature is disabled
  if (!isVisible || imageError || !imageLoaded || !adjustedPosition || isFeatureDisabled) {
    return null;
  }

  const canvasSize = circleRadius * 2;
  const isMobile = window.innerWidth < 768;

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className="magnify-overlay"
      style={{
        position: 'absolute',
        left: adjustedPosition.x - circleRadius,
        top: adjustedPosition.y - circleRadius,
        width: canvasSize,
        height: canvasSize,
        pointerEvents: 'none',
        zIndex: 10,
        borderRadius: '50%',
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${isMobile ? '0.2s' : '0.15s'} ease-in-out`,
        // Ensure proper rendering on high-DPI displays
        imageRendering: 'auto' as const,
        // Prevent canvas from being selected on mobile
        userSelect: 'none',
        WebkitUserSelect: 'none',
        // Improve touch performance
        touchAction: 'none',
      }}
    />
  );
};
