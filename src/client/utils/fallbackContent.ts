/**
 * Shared fallback content to ensure consistency across components
 * when content fetching fails or returns empty results
 */

export const FALLBACK_CONTENT = {
  // Primary fallback tip (when response succeeds but tip is empty)
  primaryTip: 'Look for \'the smudge.\' AI sometimes blurs or smudges details where objects meet, like a ring against a finger.',
  
  // Secondary fallback tip (when response fails)
  secondaryTip: 'AI still gets hands wrong. Count the fingers. If it looks like a horror movie monster\'s hand, you\'ve found your tell.',
  
  // Tertiary fallback tip (when there's a catch error)
  tertiaryTip: 'Check for perfect symmetry. Reality is rarely perfect. If a face or building is flawlessly symmetrical, it\'s a red flag.',
  
  // Primary fallback fact
  primaryFact: 'AI image generators don\'t \'see\' or \'think.\' They\'re just incredibly complex pattern-matching machines.',
  
  // Secondary fallback fact
  secondaryFact: 'The term \'AI\' was first used at a college conference in 1956. It\'s older than your parents\' vinyl collection.',
  
  // Tertiary fallback fact
  tertiaryFact: 'An AI-generated artwork was sold at an auction for $432,500. It was basically a blurry portrait.',
  
  // Primary fallback inspiration
  primaryInspiration: 'Every expert was once a beginner. Keep practicing!',
  
  // Secondary fallback inspiration
  secondaryInspiration: 'Practice makes perfect - each game makes you better!',
} as const;

/**
 * Get fallback tip based on error type
 */
export function getFallbackTip(errorType: 'empty' | 'failed' | 'error' = 'empty'): string {
  switch (errorType) {
    case 'empty':
      return FALLBACK_CONTENT.primaryTip;
    case 'failed':
      return FALLBACK_CONTENT.secondaryTip;
    case 'error':
      return FALLBACK_CONTENT.tertiaryTip;
    default:
      return FALLBACK_CONTENT.primaryTip;
  }
}

/**
 * Get fallback fact based on error type
 */
export function getFallbackFact(errorType: 'empty' | 'failed' | 'error' = 'empty'): string {
  switch (errorType) {
    case 'empty':
      return FALLBACK_CONTENT.primaryFact;
    case 'failed':
      return FALLBACK_CONTENT.secondaryFact;
    case 'error':
      return FALLBACK_CONTENT.tertiaryFact;
    default:
      return FALLBACK_CONTENT.primaryFact;
  }
}

/**
 * Get fallback inspiration based on error type
 */
export function getFallbackInspiration(errorType: 'empty' | 'failed' = 'empty'): string {
  switch (errorType) {
    case 'empty':
      return FALLBACK_CONTENT.primaryInspiration;
    case 'failed':
      return FALLBACK_CONTENT.secondaryInspiration;
    default:
      return FALLBACK_CONTENT.primaryInspiration;
  }
}
