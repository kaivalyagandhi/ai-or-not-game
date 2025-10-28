# Implementation Plan

- [x] 1. Simplify AudioSystem component to use toggle button

  - Replace dropdown controls with single toggle button using music icon
  - Remove volume slider and dropdown container elements
  - Update button to show 🎵 for enabled and 🔇 for disabled states
  - Modify component props to use `onAudioToggle` instead of separate volume/mute handlers
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Implement real-time audio state management

  - [x] 2.1 Update audio toggle logic for immediate state changes

    - Modify `handleMuteToggle` to `handleAudioToggle` with synchronous state updates
    - Ensure all audio elements (background music, sound effects) update immediately
    - Update localStorage persistence to use `spotTheBot_audioEnabled` key
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 2.2 Implement session-start background music playback
    - Modify App.tsx to start background music immediately when session begins
    - Update audio initialization to respect initial audio state
    - Ensure background music plays at session start, not just when first round begins
    - _Requirements: 2.5, 2.6_

- [x] 3. Enhance sound effect volume and toggle compliance

  - [x] 3.1 Increase sound effect volume levels

    - Update `playSuccessSound` and `playFailureSound` to use 3x volume multiplier
    - Change volume calculation from `volume * 1.2` to `volume * 3.6`
    - Test sound effect audibility above background music
    - _Requirements: 3.1, 3.4_

  - [x] 3.2 Ensure sound effects respect audio toggle state
    - Update sound effect methods to check audio enabled state before playing
    - Modify audio toggle to immediately affect sound effect playback capability
    - Add audio state validation to all sound effect triggers
    - _Requirements: 3.2, 3.3_

- [x] 4. Reorganize round and category UI labels

  - Create utility function to format combined round label as "Round X of Y (Category: Z)"
  - Update GameRound component header to use single combined label on left side
  - Remove separate category label from right side of the interface
  - Ensure label updates correctly for each round with accurate round number and category
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 5. Fix timeout logic to prevent incorrect scoring and animations

  - [x] 5.1 Update timer countdown to handle timeout scenarios

    - Modify timer effect to detect when time expires without user selection
    - Prevent `submitAnswer` call with user selection when timeout occurs
    - Create timeout-specific handling that shows correct answer without scoring
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 5.2 Ensure consistent timeout behavior across all rounds
    - Add timeout flag to prevent success animations and confetti on timeout
    - Update feedback display to show correct answer only (no points celebration)
    - Verify smooth progression to next round after timeout feedback
    - _Requirements: 5.4, 5.5_

- [ ]\* 6. Add comprehensive testing for audio and timeout improvements

  - [ ]\* 6.1 Write unit tests for audio toggle functionality

    - Test immediate state changes when audio toggle is clicked
    - Verify localStorage persistence of audio preferences
    - Test sound effect volume levels and toggle compliance
    - _Requirements: 1.1, 2.1, 3.1, 3.2_

  - [ ]\* 6.2 Write integration tests for timeout logic

    - Test zero points awarded when timer expires without selection
    - Verify no animations trigger on timeout scenarios
    - Test correct answer feedback display on timeout
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]\* 6.3 Write UI tests for label reorganization
    - Test combined round label formatting and positioning
    - Verify label updates correctly between rounds
    - Test responsive layout with new label structure
    - _Requirements: 4.1, 4.2, 4.4_
