/**
 * Confetti Animation Utility
 * 
 * Provides CSS-based rainbow confetti animation for positive score feedback.
 * Includes accessibility support and performance optimization.
 */

export interface ConfettiConfig {
  enabled: boolean;
  duration: number; // milliseconds
  colors: string[]; // rainbow colors
  particleCount: number;
  spread: number;
}

const DEFAULT_CONFIG: ConfettiConfig = {
  enabled: true,
  duration: 2000,
  colors: [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F', // Light Yellow
    '#BB8FCE', // Light Purple
    '#85C1E9'  // Light Blue
  ],
  particleCount: 50,
  spread: 60
};

/**
 * Checks if user prefers reduced motion for accessibility
 */
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Creates a single confetti particle element
 */
function createConfettiParticle(config: ConfettiConfig): HTMLElement {
  const particle = document.createElement('div');
  particle.className = 'confetti-particle';
  
  // Random color from rainbow palette
  const color = config.colors[Math.floor(Math.random() * config.colors.length)];
  
  // Random position and animation properties
  const startX = Math.random() * 100;
  const endX = startX + (Math.random() - 0.5) * config.spread;
  const rotation = Math.random() * 360;
  const scale = 0.5 + Math.random() * 0.5;
  const animationDelay = Math.random() * 200;
  
  particle.style.cssText = `
    position: absolute;
    width: 8px;
    height: 8px;
    background-color: ${color};
    border-radius: 2px;
    pointer-events: none;
    z-index: 1000;
    left: ${startX}%;
    top: -10px;
    transform: rotate(${rotation}deg) scale(${scale});
    animation: confetti-fall ${config.duration}ms ease-out ${animationDelay}ms forwards;
    --end-x: ${endX}%;
  `;
  
  return particle;
}

/**
 * Creates and injects confetti animation CSS keyframes
 */
function injectConfettiStyles(): void {
  const styleId = 'confetti-animation-styles';
  
  // Don't inject if already exists
  if (document.getElementById(styleId)) {
    return;
  }
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes confetti-fall {
      0% {
        transform: translateY(0) translateX(0) rotate(0deg) scale(var(--scale, 1));
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) translateX(calc(var(--end-x) - 50%)) rotate(720deg) scale(0);
        opacity: 0;
      }
    }
    
    .confetti-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999;
      overflow: hidden;
    }
    
    .confetti-particle {
      --scale: 1;
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .confetti-particle {
        animation-duration: 0.1s !important;
        animation-delay: 0s !important;
      }
    }
  `;
  
  document.head.appendChild(style);
}

/**
 * Creates confetti animation container
 */
function createConfettiContainer(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  container.setAttribute('aria-hidden', 'true'); // Hide from screen readers
  return container;
}

/**
 * Triggers confetti animation for positive scores
 */
export function triggerConfetti(score: number, customConfig?: Partial<ConfettiConfig>): void {
  // Only trigger for positive scores
  if (score <= 0) {
    return;
  }
  
  // Respect reduced motion preference
  if (prefersReducedMotion()) {
    return;
  }
  
  const config = { ...DEFAULT_CONFIG, ...customConfig };
  
  // Don't animate if disabled
  if (!config.enabled) {
    return;
  }
  
  // Inject CSS styles if not already present
  injectConfettiStyles();
  
  // Create container
  const container = createConfettiContainer();
  document.body.appendChild(container);
  
  // Create particles
  const particles: HTMLElement[] = [];
  for (let i = 0; i < config.particleCount; i++) {
    const particle = createConfettiParticle(config);
    particles.push(particle);
    container.appendChild(particle);
  }
  
  // Cleanup after animation completes
  const cleanup = () => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };
  
  // Set cleanup timer with buffer for animation completion
  setTimeout(cleanup, config.duration + 500);
}

/**
 * Cleans up any existing confetti animations
 */
export function cleanupConfetti(): void {
  const containers = document.querySelectorAll('.confetti-container');
  containers.forEach(container => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });
}

/**
 * Updates confetti configuration
 */
export function updateConfettiConfig(newConfig: Partial<ConfettiConfig>): ConfettiConfig {
  return { ...DEFAULT_CONFIG, ...newConfig };
}

/**
 * Checks if confetti animations are supported
 */
export function isConfettiSupported(): boolean {
  return typeof window !== 'undefined' && 
         typeof document !== 'undefined' && 
         'matchMedia' in window;
}
