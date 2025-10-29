# Implementation Plan

- [x] 1. Update color system and CSS variables

  - Replace all instances of #f7fbff with #e2f0ff in CSS files
  - Update all bg-indigo-600 and related indigo color classes to use #3da8ff and corresponding shades
  - Create consistent color mappings for text, borders, and background elements
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Implement SplashScreen content and layout updates
- [x] 2.1 Remove robot emoji and update header section

  - Remove the robot emoji (🤖) from the SplashScreen component
  - Update header styling to work without the emoji
  - _Requirements: 2.1_

- [x] 2.2 Replace How to Play box with Rankings box

  - Remove the existing "How to Play" content box
  - Create new Rankings component that fetches and displays weekly user rank
  - Add "View Leaderboard" button that calls onViewLeaderboard prop
  - Handle loading and error states for ranking data
  - _Requirements: 2.2, 2.3_

- [x] 2.3 Update Daily Challenge box with date and play count

  - Modify the Daily Challenge box to show today's date without the year
  - Add display of number of plays completed today
  - Fetch daily play count data from the play limit manager
  - _Requirements: 2.4, 2.5_

- [x] 3. Update ResultsScreen sharing functionality
- [x] 3.1 Implement new sharing message template

  - Replace the existing generateShareMessage function with the new template format
  - Include correct guess count, badge information, and daily rank data
  - Format message exactly as specified in requirements
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3.2 Update Rankings box context for daily vs weekly display

  - Ensure ResultsScreen shows daily rank in Rankings box
  - Maintain weekly rank display in SplashScreen Rankings box
  - Update any related UI text and labels accordingly
  - _Requirements: 2.6_

- [x] 4. Add server-side API endpoints for new data requirements
- [x] 4.1 Create weekly user rank endpoint

  - Add GET /api/leaderboard/user-rank/weekly endpoint
  - Return user's weekly rank and total weekly participants
  - Handle cases where user has no weekly rank
  - _Requirements: 2.2, 2.3_

- [x] 4.2 Create daily play count endpoint

  - Add GET /api/game/daily-play-count endpoint
  - Return number of plays completed today for the current user
  - Integrate with existing play limit manager functionality
  - _Requirements: 2.5_

- [x] 5. Update ResultsScreen button styling and layout
- [x] 5.1 Update leaderboard button text

  - Change "View Leaderboard" button text to "Leaderboard"
  - Ensure button functionality remains unchanged
  - _Requirements: 4.1_

- [x] 5.2 Fix time bonus color consistency

  - Update time bonus "+13" text color to match the "3" in correct answers
  - Identify the correct color value used for correct answers number
  - Apply same color to time bonus display
  - _Requirements: 4.2_

- [x] 5.3 Implement vertical button layout

  - Arrange three action buttons vertically with even distribution
  - Match the height of the daily rankings box
  - Position "Post AI tip" button above "Challenge Friends" button
  - Ensure proper spacing and alignment
  - _Requirements: 4.3, 4.4_

- [x] 5.4 Update play again button state handling

  - Change disabled play again button text to "Play Again Tomorrow!"
  - Apply disabled styling (grey background) when no plays remaining
  - Remove emoji from the disabled state text
  - _Requirements: 4.5_

- [x] 6. Implement AI tip posting feature
- [x] 6.1 Create AI tip form component

  - Build modal form component for editing AI tip comments
  - Pre-populate with challenge results message and AI tip
  - Add text area for user editing
  - Include submit and cancel buttons with loading states
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 6.2 Implement comment formatting logic

  - Create function to combine challenge message with AI tip
  - Format comment as specified: "[challenge_results_message]\nHere's my AI detection tip to help you: [ai_tip_text]"
  - Handle edge cases for missing or empty AI tips
  - _Requirements: 5.4_

- [x] 6.3 Add server-side comment posting endpoint

  - Create POST /api/comments/post-ai-tip endpoint
  - Integrate with Devvit Reddit API for comment submission
  - Handle authentication and error cases
  - Return success/failure status with comment ID
  - _Requirements: 5.5_

- [x] 6.4 Connect form to server endpoint

  - Implement form submission logic in ResultsScreen component
  - Handle loading states and error feedback
  - Show success confirmation after successful submission
  - Close form modal after successful submission
  - _Requirements: 5.1, 5.5_

- [x] 7. Update Devvit configuration for Reddit API access
- [x] 7.1 Add required Reddit API permissions

  - Update devvit.json to include reddit.read and reddit.submit permissions
  - Ensure proper scopes for comment posting functionality
  - _Requirements: 5.5_

- [ ] 8. Add comprehensive testing for all new features
  - Write unit tests for AI tip form component
  - Write unit tests for comment formatting logic
  - Write integration tests for comment posting endpoint
  - Test button layout and styling updates
  - Test play again button state changes
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5_
