/**
 * Splash screen assets and theme integration utilities
 * Combines image preloading with theme configuration
 */

import { splashImageAssets, preloadSplashImages, useImagePreloading, type PreloadResult } from './imagePreloader';
import { splashTheme, tailwindClasses } from './theme';

/**
 * Complete splash screen configuration
 */
export const splashConfig = {
  images: splashImageAssets,
  theme: splashTheme,
  classes: tailwindClasses,
} as const;

/**
 * Generate CSS background image styles for split-screen halves with mobile optimization
 */
export const generateBackgroundStyles = (images: Record<string, PreloadResult>) => {
  const leftImage = images.leftPuppy;
  const rightImage = images.rightPuppy;
  
  // Base styles with mobile-first approach
  const baseStyles = {
    backgroundSize: 'cover' as const,
    backgroundPosition: 'center' as const,
    backgroundRepeat: 'no-repeat' as const,
    // Add image-rendering optimization for mobile
    imageRendering: 'auto' as const,
    // Optimize for mobile performance
    willChange: 'auto' as const,
  };
  
  return {
    left: leftImage?.loaded ? {
      backgroundImage: `url('${leftImage.src}')`,
      ...baseStyles,
    } : {
      backgroundColor: splashTheme.colors.gradientFrom,
      // Add subtle pattern for loading state
      backgroundImage: `linear-gradient(45deg, 
        ${splashTheme.colors.gradientFrom} 25%, 
        transparent 25%, 
        transparent 75%, 
        ${splashTheme.colors.gradientFrom} 75%, 
        ${splashTheme.colors.gradientFrom}), 
        linear-gradient(45deg, 
        ${splashTheme.colors.gradientFrom} 25%, 
        transparent 25%, 
        transparent 75%, 
        ${splashTheme.colors.gradientFrom} 75%, 
        ${splashTheme.colors.gradientFrom})`,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 10px',
      opacity: 0.1,
    },
    right: rightImage?.loaded ? {
      backgroundImage: `url('${rightImage.src}')`,
      ...baseStyles,
    } : {
      backgroundColor: splashTheme.colors.gradientTo,
      // Add subtle pattern for loading state
      backgroundImage: `linear-gradient(45deg, 
        ${splashTheme.colors.gradientTo} 25%, 
        transparent 25%, 
        transparent 75%, 
        ${splashTheme.colors.gradientTo} 75%, 
        ${splashTheme.colors.gradientTo}), 
        linear-gradient(45deg, 
        ${splashTheme.colors.gradientTo} 25%, 
        transparent 25%, 
        transparent 75%, 
        ${splashTheme.colors.gradientTo} 75%, 
        ${splashTheme.colors.gradientTo})`,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 10px 10px',
      opacity: 0.1,
    },
  };
};

/**
 * Get overlay styles for split-screen halves with enhanced gradients
 */
export const getOverlayStyles = () => ({
  left: {
    background: `linear-gradient(135deg, 
      rgba(255, 68, 68, ${splashTheme.overlays.leftOpacity}) 0%, 
      rgba(220, 38, 38, ${splashTheme.overlays.leftOpacity * 0.8}) 50%, 
      rgba(185, 28, 28, ${splashTheme.overlays.leftOpacity * 0.9}) 100%)`,
    transition: 'all 0.3s ease-in-out',
  },
  right: {
    background: `linear-gradient(225deg, 
      rgba(32, 178, 137, ${splashTheme.overlays.rightOpacity}) 0%, 
      rgba(20, 184, 166, ${splashTheme.overlays.rightOpacity * 0.8}) 50%, 
      rgba(13, 148, 136, ${splashTheme.overlays.rightOpacity * 0.9}) 100%)`,
    transition: 'all 0.3s ease-in-out',
  },
});

/**
 * Custom hook for splash screen setup
 */
export const useSplashScreen = () => {
  const imagePreloading = useImagePreloading(splashImageAssets);
  
  const backgroundStyles = generateBackgroundStyles(imagePreloading.images);
  const overlayStyles = getOverlayStyles();
  
  return {
    ...imagePreloading,
    backgroundStyles,
    overlayStyles,
    theme: splashTheme,
    classes: tailwindClasses,
    config: splashConfig,
  };
};

/**
 * Preload all splash assets (can be called before component mount)
 */
export const initializeSplashAssets = async () => {
  try {
    const images = await preloadSplashImages();
    console.log('Splash screen images preloaded:', images);
    return images;
  } catch (error) {
    console.error('Error preloading splash screen images:', error);
    return {};
  }
};

/**
 * Export everything needed for splash screen implementation
 */
export {
  splashImageAssets,
  splashTheme,
  tailwindClasses,
  preloadSplashImages,
  useImagePreloading,
};

export type SplashScreenHookResult = ReturnType<typeof useSplashScreen>;
