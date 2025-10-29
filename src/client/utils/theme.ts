/**
 * Theme configuration for the splash screen redesign
 * Replaces the blue theme with a green theme as specified in requirements
 */

export const splashTheme = {
  colors: {
    // Overlay colors for split-screen design
    leftOverlay: '#FF4444',      // Red overlay for AI/left side
    rightOverlay: '#20b289ff',   // Teal-green overlay for REAL/right side
    
    // Primary green theme (replacing blue)
    primary: '#22C55E',          // Green-500 (replacing blue-600)
    primaryHover: '#16A34A',     // Green-600 (replacing blue-700)
    primaryLight: '#86EFAC',     // Green-300 (replacing blue-300)
    primaryDark: '#15803D',      // Green-700 (replacing blue-800)
    
    // Secondary green shades
    secondary: '#16A34A',        // Green-600
    secondaryLight: '#4ADE80',   // Green-400
    secondaryDark: '#14532D',    // Green-900
    
    // Text colors
    text: '#FFFFFF',             // White text for overlays
    textShadow: '#000000',       // Black shadow for contrast
    textPrimary: '#111827',      // Gray-900 for main text
    textSecondary: '#6B7280',    // Gray-500 for secondary text
    
    // Background gradients (green theme)
    gradientFrom: '#ECFDF5',     // Green-50 (replacing blue-50)
    gradientTo: '#D1FAE5',       // Green-100 (replacing indigo-100)
    
    // UI elements
    cardBackground: '#FFFFFF',
    cardShadow: 'rgba(34, 197, 94, 0.1)', // Green shadow
    border: '#D1D5DB',           // Gray-300
    borderHover: '#9CA3AF',      // Gray-400
  },
  
  // Animation settings
  animations: {
    fadeInDuration: 300,         // milliseconds
    scaleHoverEffect: 1.05,      // scale factor for hover
    buttonPulse: true,           // enable button pulse animation
    transitionDuration: '0.2s',  // CSS transition duration
  },
  
  // Overlay opacity settings
  overlays: {
    leftOpacity: 0.6,            // Red overlay opacity
    rightOpacity: 0.6,           // Teal-green overlay opacity
  },
  
  // Typography settings - Arcade Style
  typography: {
    // Main title styling
    title: {
      size: '6xl',               // Extra large title size
      sizeResponsive: {
        mobile: '6xl',           // 60px on mobile
        tablet: '7xl',           // 72px on tablet
        desktop: '8xl',          // 96px on desktop
      },
      fontWeight: 'black',       // Extra bold font weight (900)
      letterSpacing: 'tight',    // Tight letter spacing
      lineHeight: 'none',        // Minimal line height
      textTransform: 'uppercase', // All caps for arcade feel
      fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      textShadow: '4px 4px 0px rgba(0, 0, 0, 0.8), 8px 8px 0px rgba(0, 0, 0, 0.4), 2px 2px 8px rgba(0, 0, 0, 0.6)',
      textStroke: '2px rgba(0, 0, 0, 0.3)', // Text outline for extra contrast
    },
    
    // Subtitle styling
    subtitle: {
      size: '2xl',               // Large subtitle size
      sizeResponsive: {
        mobile: '2xl',           // 24px on mobile
        tablet: '3xl',           // 30px on tablet
        desktop: '4xl',          // 36px on desktop
      },
      fontWeight: 'bold',        // Bold font weight (700)
      letterSpacing: 'wide',     // Wide letter spacing
      fontFamily: 'system-ui, -apple-system, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
      textShadow: '3px 3px 0px rgba(0, 0, 0, 0.7), 6px 6px 0px rgba(0, 0, 0, 0.3), 1px 1px 6px rgba(0, 0, 0, 0.5)',
    },
    
    // Legacy support (deprecated)
    titleSize: '4xl',            // Large title size
    subtitleSize: 'lg',          // Subtitle size
    fontWeight: 'bold',          // Font weight for titles
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Text shadow for contrast
  },
  
  // Responsive breakpoints
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
  },
} as const;

/**
 * CSS custom properties for the green theme
 * These can be used in CSS files or styled components
 */
export const cssVariables = {
  '--color-primary': splashTheme.colors.primary,
  '--color-primary-hover': splashTheme.colors.primaryHover,
  '--color-primary-light': splashTheme.colors.primaryLight,
  '--color-primary-dark': splashTheme.colors.primaryDark,
  '--color-left-overlay': splashTheme.colors.leftOverlay,
  '--color-right-overlay': splashTheme.colors.rightOverlay,
  '--gradient-from': splashTheme.colors.gradientFrom,
  '--gradient-to': splashTheme.colors.gradientTo,
  '--animation-duration': splashTheme.animations.transitionDuration,
} as const;

/**
 * Tailwind CSS class mappings for the green theme
 * Use these instead of hardcoded blue classes
 */
export const tailwindClasses = {
  // Background gradients
  backgroundGradient: 'bg-gradient-to-br from-green-50 to-green-100',
  
  // Primary colors
  primary: 'text-green-600',
  primaryBg: 'bg-green-600',
  primaryBgHover: 'hover:bg-green-700',
  primaryBorder: 'border-green-600',
  
  // Button styles
  primaryButton: 'bg-green-600 hover:bg-green-700 text-white',
  primaryButtonDisabled: 'bg-gray-400 text-gray-600 cursor-not-allowed',
  
  // Text colors
  textPrimary: 'text-green-600',
  textSecondary: 'text-green-500',
  
  // Interactive states
  hover: 'hover:text-green-700',
  focus: 'focus:ring-green-500',
  
  // Status indicators
  liveIndicator: 'bg-green-500',
  liveText: 'text-green-600',
} as const;

export type SplashTheme = typeof splashTheme;
export type TailwindClasses = typeof tailwindClasses;
