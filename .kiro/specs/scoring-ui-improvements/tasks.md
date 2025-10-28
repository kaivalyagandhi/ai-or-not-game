# Implementation Plan

- [x] 1. Update server-side scoring system to tier-based whole numbers

  - [x] 1.1 Modify calculateRoundScore function in game-logic.ts

    - Replace millisecond-based calculation with tier-based system (7-10s = +5, 4-6s = +3, 1-3s = +1, 0s = +0)
    - Change base correct answer points from 1 to 10
    - Ensure all returned values are whole numbers
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.2 Update score validation logic in validation.ts

    - Modify validateScore method to expect whole number calculations
    - Update validation ranges for new scoring system (max 15 points per round)
    - Remove decimal validation logic
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 1.3 Update leaderboard and session management for whole numbers
    - Modify addScoreToLeaderboards to handle whole number scores
    - Update session storage to use integer values
    - Ensure backward compatibility with existing decimal scores
    - _Requirements: 2.3, 2.5_

- [x] 2. Update client-side scoring and display logic

  - [x] 2.1 Modify useGameState hook for whole number calculations

    - Update calculateFinalScore method to use whole numbers
    - Remove decimal formatting from score calculations
    - Update local score tracking to match server logic
    - _Requirements: 2.1, 2.2, 2.4_

  - [x] 2.2 Update GameRound component points display
    - Remove toFixed(2) formatting from points display
    - Position points text 4 pixels lower than current position
    - Increase font size for better visibility
    - Display points as whole numbers only
    - _Requirements: 2.1, 3.1, 3.2_

- [x] 3. Implement rainbow confetti animation for positive scores

  - [x] 3.1 Create confetti animation utility

    - Implement CSS-based rainbow confetti animation
    - Create animation trigger logic for scores > 0
    - Add animation cleanup and performance optimization
    - Support reduced motion preferences for accessibility
    - _Requirements: 3.3, 3.4, 3.5_

  - [x] 3.2 Integrate confetti animation into GameRound component
    - Add conditional animation rendering for positive scores
    - Ensure animation doesn't block gameplay flow
    - Test animation timing with round transitions
    - _Requirements: 3.3, 3.5_

- [x] 4. Update photo border styling for enhanced visual feedback

  - [x] 4.1 Update CSS classes for enhanced photo borders

    - Change border-width from 3px to 6px for selected and feedback states
    - Add border-radius: 3px to round photo corners
    - Maintain existing color scheme for correct/incorrect feedback
    - Ensure responsive behavior across screen sizes
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.2 Test visual feedback consistency
    - Verify border styling applies correctly during selection
    - Test feedback state transitions with new border thickness
    - Ensure rounded corners display properly on all devices
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 5. Update all score-related tests and validation

  - [x] 5.1 Update server-side scoring tests

    - Modify game-logic.test.ts for new tier-based calculations
    - Update validation tests for whole number expectations
    - Test edge cases (0 seconds, boundary values between tiers)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 5.2 Update client-side scoring tests
    - Modify useGameState.test.ts for whole number calculations
    - Update component tests for new points display formatting
    - Test animation integration and cleanup
    - _Requirements: 2.1, 2.2, 3.3, 3.4_

- [ ] 6. Integration testing and performance validation

  - [x] 6.1 Test complete scoring flow end-to-end

    - Verify server and client scoring calculations match
    - Test leaderboard integration with new scoring system
    - Validate session persistence with whole number scores
    - _Requirements: 1.5, 2.4, 2.5_

  - [x] 6.2 Test UI enhancements across devices and browsers
    - Verify points display positioning and sizing on mobile and desktop
    - Test confetti animation performance and cleanup
    - Validate photo border styling consistency across browsers
    - _Requirements: 3.1, 3.2, 3.5, 4.1, 4.2_
