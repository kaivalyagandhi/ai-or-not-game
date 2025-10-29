# Implementation Plan

- [x] 1. Update ResultsScreen component layout for horizontal score and badge display

  - Modify the score and badge sections to use horizontal grid layout instead of vertical stacking
  - Implement responsive grid system that works on mobile and desktop
  - _Requirements: 1.2, 1.3, 1.4_

- [x] 1.1 Redesign badge card with horizontal emoji and title layout

  - Change badge card from vertical center-aligned layout to horizontal flex layout
  - Place emoji and title on the same line with proper spacing
  - _Requirements: 1.3_

- [x] 1.2 Implement single-line badge description with text truncation

  - Add CSS classes to ensure badge descriptions fit in one line
  - Implement text truncation with ellipsis for overflow content
  - _Requirements: 1.4_

- [x] 1.3 Create horizontal layout for rankings section and CTA buttons

  - Modify rankings section and action buttons to display side by side
  - Ensure proper spacing and alignment for mobile touch targets
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Update LeaderboardTabs component for simplified display and navigation

  - Implement top 10 player limit with smart user positioning logic
  - Add back button functionality to header for navigation to Challenge Complete screen
  - _Requirements: 3.1, 3.2, 3.3, 5.2, 5.3, 5.4_

- [x] 2.1 Add back button to leaderboard header

  - Create back button component in top-left position of header
  - Implement navigation callback to return to ResultsScreen
  - _Requirements: 5.3, 5.4_

- [x] 2.2 Center-align leaderboard title and remove Live indicator

  - Update header layout to center the "Leaderboard" title
  - Remove the Live indicator dot and text from the header
  - _Requirements: 5.1, 5.2_

- [x] 2.3 Implement top 10 display logic with user rank positioning

  - Limit leaderboard display to top 10 players by default
  - Add logic to show ellipsis row when user is not in top 10
  - Display user's actual rank row after ellipsis when applicable
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 2.4 Remove footer text from all leaderboard views

  - Remove "Showing top X of Y players" footer text from leaderboard component
  - Clean up footer styling and spacing
  - _Requirements: 4.3_

- [x] 3. Update number formatting and icon replacements throughout components

  - Replace all lightning bolt (⚡) icons with timer emoji (⏱️)
  - Remove decimal places from all score and numerical displays
  - _Requirements: 4.1, 4.2_

- [x] 3.1 Replace lightning bolt icons with timer emoji

  - Find all instances of ⚡ symbol in ResultsScreen and LeaderboardTabs
  - Replace with timer emoji ⏱️ for time bonus displays
  - _Requirements: 4.2_

- [x] 3.2 Remove decimal places from all numerical displays

  - Update score formatting functions to use Math.round() instead of toFixed()
  - Apply integer formatting to time bonus, total score, and leaderboard scores
  - _Requirements: 4.1_

- [ ]\* 3.3 Add responsive design testing for mobile layouts

  - Create test cases for different viewport sizes
  - Verify horizontal layouts work properly on mobile devices
  - Test touch target sizes meet accessibility standards
  - _Requirements: 1.1, 2.3_

- [ ]\* 3.4 Write unit tests for leaderboard display logic
  - Test top 10 filtering logic with various user rank scenarios
  - Test ellipsis display logic when user is outside top 10
  - Verify user highlighting works correctly in all cases
  - _Requirements: 3.1, 3.2, 3.3_
