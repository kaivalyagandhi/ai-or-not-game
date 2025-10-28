# Implementation Plan

- [ ] 1. Update server-side timer constants and validation logic
  - Update timer validation constants from 15000ms to 10000ms in game-logic.ts
  - Modify maximum round time from 20000ms to 15000ms (10 seconds + 5 second buffer)
  - Update time bonus calculation to use 10-second base duration
  - Adjust network delay tolerance for shorter round duration
  - _Requirements: 1.4, 3.1, 3.2, 3.4_

- [ ] 2. Update client-side timer display and logic
  - Modify GameRound component timer from 15 seconds to 10 seconds
  - Update timer progress bar calculation to use 10000ms as 100% duration
  - Adjust auto-submission timing to trigger at 10-second mark
  - Update timer display formatting for 10-second countdown
  - _Requirements: 1.1, 1.2, 3.5_

- [ ] 3. Update user-facing text and instructions
  - Update SplashScreen component to show "10 seconds per round" in instructions
  - Modify share message templates to reference "10-second rounds"
  - Update any help text or tutorial content mentioning round duration
  - Update error messages to reference 10-second timing limits
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4. Update and run tests for timer changes
  - Update timer validation tests to use 10-second constants
  - Modify time bonus calculation tests for new duration
  - Update progress bar calculation tests
  - Run complete test suite to verify no regressions
  - _Requirements: 3.1, 3.2, 3.5_
