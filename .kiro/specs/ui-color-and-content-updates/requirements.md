# Requirements Document

## Introduction

This specification covers comprehensive UI updates to the AI or Not game, including a new color palette implementation and content modifications to the starting screen and challenge sharing functionality. The changes aim to improve visual cohesion and enhance user engagement through better information presentation.

## Glossary

- **Game_System**: The AI or Not game application running on Reddit via Devvit
- **Starting_Screen**: The initial splash screen users see before beginning gameplay
- **Challenge_Completed_Page**: The results screen shown after completing a daily challenge
- **Rankings_Box**: A UI component displaying leaderboard information and player rankings
- **Challenge_Friends_Message**: The shareable text template users can send to invite others
- **Post_AI_Tip_Button**: A button that allows players to share AI detection tips as comments
- **AI_Tip_Form**: A form interface for editing and submitting AI detection tips as comments
- **Daily_Game_Post**: The Reddit post where the daily AI or Not challenge is hosted
- **Time_Bonus_Display**: The UI element showing bonus points earned for quick responses

## Requirements

### Requirement 1

**User Story:** As a player, I want the game to have a cohesive blue color scheme, so that the visual experience feels polished and consistent.

#### Acceptance Criteria

1. WHEN the Game_System renders any UI element using #f7fbff, THE Game_System SHALL display the element using #e2f0ff instead
2. WHEN the Game_System renders any UI element using bg-indigo-600 or similar indigo shades, THE Game_System SHALL display the element using corresponding shades of #3da8ff
3. THE Game_System SHALL update all related color variations and shades to maintain visual harmony with the new primary colors
4. THE Game_System SHALL ensure all text remains readable against the new background colors
5. THE Game_System SHALL maintain consistent color usage across all game screens and components

### Requirement 2

**User Story:** As a player, I want to see my weekly ranking and play count on the starting screen, so that I can quickly assess my progress before playing.

#### Acceptance Criteria

1. THE Starting_Screen SHALL remove the robot emoji from the interface
2. WHEN displaying the Starting_Screen, THE Game_System SHALL show a Rankings_Box containing the player's weekly rank
3. THE Rankings_Box SHALL include a "View Leaderboard" button that navigates to the full leaderboard
4. THE Starting_Screen SHALL display a Daily Challenge box showing today's date without the year
5. THE Daily Challenge box SHALL display the number of plays completed today
6. WHILE on the Challenge_Completed_Page, THE Game_System SHALL show the player's daily rank in the Rankings_Box

### Requirement 3

**User Story:** As a player, I want to share my results with friends using a detailed message template, so that I can showcase my performance and encourage others to play.

#### Acceptance Criteria

1. WHEN a player completes a challenge, THE Game_System SHALL generate a Challenge_Friends_Message using the specified template format
2. THE Challenge_Friends_Message SHALL include the player's correct guess count out of total images
3. THE Challenge_Friends_Message SHALL display the badge earned during the session
4. THE Challenge_Friends_Message SHALL show the player's daily rank and total daily players
5. THE Challenge_Friends_Message SHALL use the exact format: "I just finished today's AI or Not? challenge:\n✅ Correct Guesses: X/6 images\n🏆 Badge Earned: [badge_name]\n📈 Daily Rank: #X of Y players\nWant to see if you can beat me before I get my next try?"

### Requirement 4

**User Story:** As a player, I want the results screen buttons and text to have consistent styling and clear labeling, so that the interface feels polished and intuitive.

#### Acceptance Criteria

1. THE Game_System SHALL display the leaderboard button text as "Leaderboard" without the word "View"
2. WHEN displaying the time bonus score, THE Game_System SHALL render the "+13" text using the same color as the "3" in correct answers
3. THE Game_System SHALL display three action buttons vertically aligned and evenly distributed to match the height of the daily rankings box
4. THE Game_System SHALL position the "Post AI tip" button above the "Challenge Friends" button
5. WHILE the player has no remaining plays for the day, THE Game_System SHALL disable the play again button and display "Play Again Tomorrow!" text

### Requirement 5

**User Story:** As a player, I want to share AI detection tips with the community through comments, so that I can help educate other players and contribute to the discussion.

#### Acceptance Criteria

1. WHEN a player clicks the "Post AI tip" button, THE Game_System SHALL display a form with the AI tip from their recent gameplay session
2. THE Game_System SHALL pre-populate the comment form with the challenge results message followed by the AI tip
3. THE Game_System SHALL allow the player to edit the comment text before submission
4. THE Game_System SHALL format the comment as: "[challenge_results_message]\nHere's my AI detection tip to help you: [ai_tip_text]"
5. WHEN the player submits the form, THE Game_System SHALL post the comment to the daily game post on behalf of the player
