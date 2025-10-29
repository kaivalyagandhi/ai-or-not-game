# Design Document

## Overview

This design covers the implementation approach for reducing the game round timer from 15 seconds to 10 seconds across the AI or Not? application. The change involves updating timer constants, validation logic, UI components, and user-facing text to ensure consistency throughout the system.

## Architecture

The timer change affects three main layers of the application:

1. **Client Layer** (`src/client/`): React components that display the timer and handle user interactions
2. **Server Layer** (`src/server/`): Backend validation and game logic that enforces timing rules
3. **Shared Layer** (`src/shared/`): Type definitions and constants used by both client and server

## Components and Interfaces

### Client Components Affected

**GameRound Component** (`src/client/components/GameRound.tsx`)
- Timer display and countdown logic
- Progress bar calculations
- Auto-submission when timer expires
- Visual timer feedback

**SplashScreen Component** (`src/client/components/SplashScreen.tsx`)
- Game instructions mentioning round duration
- Tutorial text referencing timing

**ResultsScreen Component** (`src/client/components/ResultsScreen.tsx`)
- Share message generation with timing references
- Game summary text

### Server Components Affected

**Game Logic** (`src/server/core/game-logic.ts`)
- Timer validation constants
- Round timeout enforcement
- Time bonus calculations
- Network delay tolerance settings

**Session Manager** (`src/server/core/session-manager.ts`)
- Round timing validation
- Score calculation based on time remaining

### Shared Types

**API Types** (`src/shared/types/api.ts`)
- Constants for timer duration
- Validation parameters

## Data Models

No changes to data models are required. The existing `GameRound` interface already supports flexible timing through the `timeRemaining` field.

## Error Handling

### Timer Validation Errors
- Update error messages to reference 10-second limits
- Adjust network tolerance calculations for shorter rounds
- Maintain existing timeout handling but with updated thresholds

### Client-Side Handling
- Ensure timer display handles edge cases with 10-second duration
- Update auto-submission logic for 10-second rounds
- Maintain smooth progress bar animations

## Testing Strategy

### Unit Tests
- Update timer validation tests with new 10-second constants
- Test time bonus calculations with 10-second base
- Verify progress bar calculations for 10-second duration

### Integration Tests
- Test complete round flow with 10-second timer
- Verify server-side validation with new timing
- Test edge cases around network delays and timing tolerance

### Manual Testing
- Play through complete games to verify timer behavior
- Test on different devices and network conditions
- Verify all UI text reflects 10-second timing

## Implementation Approach

### Phase 1: Update Constants and Core Logic
1. Update timer constants in shared types
2. Modify server-side validation logic
3. Update time bonus calculation formulas

### Phase 2: Update Client Components
1. Modify GameRound component timer logic
2. Update progress bar calculations
3. Adjust auto-submission timing

### Phase 3: Update User-Facing Text
1. Update splash screen instructions
2. Modify share message templates
3. Update any help or tutorial text

### Phase 4: Testing and Validation
1. Run existing test suite with updates
2. Perform manual testing across devices
3. Verify timing accuracy and consistency

## Configuration Changes

### Timer Constants
- Base round duration: 15000ms → 10000ms
- Maximum round time (with tolerance): 20000ms → 15000ms
- Network delay tolerance: Adjust proportionally for shorter rounds

### Validation Thresholds
- Client-server time sync tolerance: Maintain 3000ms or adjust to 2000ms
- Auto-submission timing: Update to trigger at 10-second mark
- Progress calculation: Update to use 10000ms as 100% duration

## Backward Compatibility

This change affects active gameplay but maintains compatibility with:
- Existing completed game sessions (historical data unchanged)
- Leaderboard entries (scoring remains proportional)
- User statistics and badges (criteria unchanged)

## Performance Considerations

- Shorter rounds may increase server load due to faster submission rates
- Timer update frequency remains unchanged (client-side optimization)
- Network validation tolerance may need fine-tuning for shorter duration

## Security Considerations

- Maintain existing anti-cheat measures with updated timing thresholds
- Ensure server-side validation prevents timing exploits
- Update rate limiting if necessary for faster gameplay pace
