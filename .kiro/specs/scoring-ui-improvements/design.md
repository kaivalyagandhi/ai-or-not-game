# Design Document

## Overview

This design document outlines the implementation approach for simplifying the Spot the Bot scoring system and enhancing the user interface. The changes focus on replacing the current millisecond-based scoring with a tier-based system, improving visual feedback with better positioned and animated point displays, and enhancing photo styling for clearer selection feedback.

## Architecture

### Scoring System Architecture

The scoring system will be updated in both client and server components to ensure consistency:

**Server-Side Changes:**
- Update `calculateRoundScore()` function in `src/server/core/game-logic.ts`
- Modify score validation logic in `src/server/utils/validation.ts`
- Update leaderboard storage to handle whole numbers

**Client-Side Changes:**
- Update score calculation in `src/client/hooks/useGameState.ts`
- Modify score display components to show whole numbers
- Update local score tracking and validation

### UI Enhancement Architecture

**Component Updates:**
- Enhance `GameRound.tsx` for improved points display and photo styling
- Update CSS classes in `src/client/index.css` for new visual effects
- Add animation utilities for rainbow confetti effect

## Components and Interfaces

### Scoring Logic Component

**Location:** `src/server/core/game-logic.ts`

**Updated Function:**
```typescript
export function calculateRoundScore(isCorrect: boolean, timeRemaining: number): number {
  if (!isCorrect) {
    return 0; // No points for incorrect answers
  }

  const correctnessPoints = 10; // Base points for correct answer
  
  // Tier-based time bonus (convert milliseconds to seconds)
  const secondsRemaining = Math.floor(timeRemaining / 1000);
  let timeBonus = 0;
  
  if (secondsRemaining >= 7) {
    timeBonus = 5;
  } else if (secondsRemaining >= 4) {
    timeBonus = 3;
  } else if (secondsRemaining >= 1) {
    timeBonus = 1;
  }
  // 0 seconds remaining = 0 bonus points
  
  return correctnessPoints + timeBonus;
}
```

### Points Display Component

**Location:** `src/client/components/GameRound.tsx`

**Enhanced Points Display:**
- Position adjustment: Move 4 pixels down from current position
- Font size increase: Larger text for better visibility
- Animation integration: Rainbow confetti for positive scores

### Photo Styling Component

**Location:** `src/client/index.css`

**Updated CSS Classes:**
```css
.game-image-button.selected,
.game-image-button.correct-feedback,
.game-image-button.incorrect-feedback {
  border-width: 6px; /* Updated from 3px */
  border-radius: 3px; /* Added rounded corners */
}
```

## Data Models

### Score Data Structure

**Updated Score Fields:**
- All score values stored as integers (no decimals)
- Time bonus calculated as discrete tiers (1, 3, 5, or 0)
- Total scores always whole numbers

**Database Schema Impact:**
- No schema changes required (Redis already supports integers)
- Existing decimal scores will be preserved for historical data
- New scores will be whole numbers only

### Animation Data Structure

**Confetti Animation Configuration:**
```typescript
interface ConfettiConfig {
  enabled: boolean;
  duration: number; // milliseconds
  colors: string[]; // rainbow colors
  particleCount: number;
  spread: number;
}
```

## Error Handling

### Scoring Validation

**Server-Side Validation:**
- Validate time remaining is within expected range (0-15000ms)
- Ensure calculated scores are whole numbers
- Verify tier-based bonus calculation accuracy

**Client-Side Validation:**
- Validate score display formatting
- Handle animation state management
- Ensure proper fallback for animation failures

### UI Error Handling

**Animation Failures:**
- Graceful degradation if confetti animation fails
- Fallback to simple score display without animation
- Error logging for debugging animation issues

**Styling Failures:**
- CSS fallbacks for border styling
- Ensure game remains playable if styling fails
- Progressive enhancement approach

## Testing Strategy

### Unit Testing

**Scoring Logic Tests:**
- Test tier-based calculation for all time ranges
- Verify whole number outputs for all scenarios
- Test edge cases (0 seconds, boundary values)

**Component Tests:**
- Test points display positioning and sizing
- Verify animation triggering conditions
- Test photo border styling updates

### Integration Testing

**Score Flow Testing:**
- End-to-end score calculation from client to server
- Leaderboard integration with new scoring system
- Session persistence with whole number scores

**UI Integration Testing:**
- Test complete round flow with new UI elements
- Verify responsive behavior across devices
- Test animation performance and cleanup

### Visual Testing

**Screenshot Comparison:**
- Before/after comparison of points display positioning
- Verify photo border thickness and radius changes
- Confirm animation visual quality

**Cross-Browser Testing:**
- Test confetti animation across different browsers
- Verify CSS styling consistency
- Test performance impact of animations

## Implementation Phases

### Phase 1: Scoring System Update
1. Update server-side scoring calculation
2. Modify client-side score handling
3. Update validation logic
4. Test score calculation accuracy

### Phase 2: Points Display Enhancement
1. Adjust points display positioning
2. Increase font size for better visibility
3. Implement rainbow confetti animation
4. Test animation performance and cleanup

### Phase 3: Photo Styling Updates
1. Update CSS for 6px borders
2. Add 3px border-radius styling
3. Test visual feedback consistency
4. Verify responsive behavior

### Phase 4: Integration and Testing
1. End-to-end testing of all changes
2. Performance testing with animations
3. Cross-browser compatibility testing
4. User acceptance testing

## Performance Considerations

### Animation Performance

**Optimization Strategies:**
- Use CSS animations where possible for better performance
- Implement animation cleanup to prevent memory leaks
- Consider reduced motion preferences for accessibility
- Limit animation duration to maintain game flow

### Scoring Performance

**Calculation Efficiency:**
- Tier-based calculation is more efficient than decimal math
- Reduced floating-point operations improve performance
- Simpler validation logic reduces server load

## Accessibility Considerations

### Animation Accessibility

**Reduced Motion Support:**
- Respect `prefers-reduced-motion` CSS media query
- Provide option to disable animations
- Ensure core functionality works without animations

### Visual Accessibility

**Enhanced Borders:**
- Improved border thickness aids visibility
- Rounded corners provide softer visual experience
- Maintain sufficient color contrast for feedback

## Browser Compatibility

### CSS Features

**Border Radius Support:**
- Supported in all modern browsers
- Graceful degradation for older browsers
- No impact on core functionality

**Animation Support:**
- CSS animations widely supported
- JavaScript fallback for older browsers
- Progressive enhancement approach
