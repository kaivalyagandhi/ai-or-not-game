# Requirements Document

## Introduction

Spot the Bot is a daily challenge game built on Reddit's Devvit platform where players test their ability to distinguish AI-generated images from real, human-captured photographs. The game presents players with 6 rounds of image pairs, where they must identify which image is real within a 15-second time limit per round. Players earn scores based on accuracy and speed, compete on leaderboards, receive educational content and inspiration, and can share their results with the Reddit community. Players can play up to 2 times per day when not in development mode.

## Glossary

- **Spot_the_Bot_System**: The complete game application including client interface, server logic, and data persistence
- **Game_Round**: A single image pair comparison with timer and scoring
- **Daily_Content**: Educational tips, AI facts, and inspirational quotes that rotate daily
- **Audio_System**: Background music and sound effects that enhance gameplay experience
- **Play_Limit**: Maximum number of game attempts allowed per player per day (2 in production, unlimited in development)
- **Midgame_Education**: Tips and facts displayed after round 3 completion
- **Inspiration_Content**: Motivational quotes or humorous content shown with final results

## Requirements

### Requirement 1

**User Story:** As a Reddit user, I want to play a daily image identification challenge, so that I can test and improve my ability to spot AI-generated content.

#### Acceptance Criteria

1. WHEN a user accesses the game THEN the Spot_the_Bot_System SHALL present exactly 6 rounds of image pairs
2. WHEN a new day begins at 00:00 UTC THEN the system SHALL reset with a new set of images
3. WHEN a user completes all 6 rounds THEN the Spot_the_Bot_System SHALL calculate and display their final score
4. IF a user has already completed their daily play limit THEN the Spot_the_Bot_System SHALL show their best results and leaderboard position

### Requirement 2

**User Story:** As a player, I want to make quick decisions under time pressure, so that the game remains challenging and engaging.

#### Acceptance Criteria

1. WHEN each round begins THEN the Spot_the_Bot_System SHALL display a 15-second countdown timer
2. WHEN each round begins THEN the Spot_the_Bot_System SHALL randomize whether the AI-generated image appears on the left or right side
3. WHEN the timer reaches zero THEN the Spot_the_Bot_System SHALL automatically mark the round as incorrect and proceed to the next round
4. WHEN a user selects an image THEN the Spot_the_Bot_System SHALL immediately show feedback and proceed to the next round
5. WHEN a user selects the human image THEN the Spot_the_Bot_System SHALL record the remaining time as bonus points

### Requirement 3

**User Story:** As a competitive player, I want to see how I rank against other players, so that I can gauge my performance and stay motivated.

#### Acceptance Criteria

1. WHEN a user completes the daily challenge THEN the Spot_the_Bot_System SHALL display their rank on the daily leaderboard
2. WHEN viewing leaderboards THEN the Spot_the_Bot_System SHALL provide tabs for daily, weekly, and all-time rankings
3. WHEN the daily leaderboard resets at 00:00 UTC THEN the Spot_the_Bot_System SHALL preserve weekly and all-time statistics
4. WHEN displaying leaderboards THEN the Spot_the_Bot_System SHALL show username and score for each player
5. WHEN a user views their rank THEN the Spot_the_Bot_System SHALL highlight their position in the leaderboard

### Requirement 4

**User Story:** As a player, I want to receive immediate feedback on my choices, so that I can learn to better identify AI-generated content.

#### Acceptance Criteria

1. WHEN a user selects an image THEN the Spot_the_Bot_System SHALL immediately highlight which image was AI-generated
2. WHEN a user makes a correct choice THEN the Spot_the_Bot_System SHALL increment their correct count by 1
3. WHEN a user makes an incorrect choice THEN the Spot_the_Bot_System SHALL show the correct answer without penalty beyond lost time
4. WHEN all rounds are complete THEN the Spot_the_Bot_System SHALL display a badge based on total correct answers

### Requirement 5

**User Story:** As a social media user, I want to share my results with friends, so that I can challenge them and discuss the game.

#### Acceptance Criteria

1. WHEN a user completes the challenge THEN the Spot_the_Bot_System SHALL generate a shareable message template
2. WHEN a user clicks share THEN the Spot_the_Bot_System SHALL provide a "copy to clipboard" function with pre-formatted text
3. WHEN sharing THEN the message SHALL include the user's score and a challenge to beat it
4. WHEN the share message is copied THEN the Spot_the_Bot_System SHALL show a confirmation toast

### Requirement 6

**User Story:** As a game administrator, I want the system to automatically manage daily content rotation, so that players always have fresh challenges.

#### Acceptance Criteria

1. WHEN 00:00 UTC occurs THEN the Spot_the_Bot_System SHALL automatically load a new set of 6 image pairs
2. WHEN selecting daily images THEN the Spot_the_Bot_System SHALL randomize the category order from: Animals, Architecture, Nature, Food, Products, Science
3. WHEN loading images THEN the Spot_the_Bot_System SHALL ensure each pair contains exactly one AI-generated and one human-captured image
4. WHEN loading images THEN the Spot_the_Bot_System SHALL randomize the left/right placement of the AI-generated image for each round
5. WHEN storing image metadata THEN the Spot_the_Bot_System SHALL maintain the correct answer for validation

### Requirement 7

**User Story:** As a player, I want to see real-time engagement metrics, so that I feel part of an active community.

#### Acceptance Criteria

1. WHEN viewing the splash screen THEN the Spot_the_Bot_System SHALL display the current number of daily participants
2. WHEN the participant count updates THEN the Spot_the_Bot_System SHALL refresh the display in real-time
3. WHEN a new player starts the challenge THEN the Spot_the_Bot_System SHALL increment the participant counter
4. WHEN the daily reset occurs THEN the Spot_the_Bot_System SHALL reset the participant counter to zero

### Requirement 8

**User Story:** As a player, I want to earn recognition badges based on my performance, so that I have goals to work toward and achievements to display.

#### Acceptance Criteria

1. WHEN a user gets 6 correct answers THEN the Spot_the_Bot_System SHALL award the "AI Whisperer" badge
2. WHEN a user gets 5 correct answers THEN the Spot_the_Bot_System SHALL award the "AI Detective" badge
3. WHEN a user gets 4 correct answers THEN the Spot_the_Bot_System SHALL award the "Good Samaritan" badge  
4. WHEN a user gets 3 correct answers THEN the Spot_the_Bot_System SHALL award the "Just Human" badge
5. WHEN a user gets 2 or fewer correct answers THEN the Spot_the_Bot_System SHALL award the "Human in Training" badge
6. WHEN displaying results THEN the Spot_the_Bot_System SHALL prominently show the earned badge

### Requirement 9

**User Story:** As a player, I want my score to reflect both accuracy and speed, so that quick thinking is rewarded alongside correct identification.

#### Acceptance Criteria

1. WHEN calculating score THEN the Spot_the_Bot_System SHALL add 1 point for each correct answer
2. WHEN calculating score THEN the Spot_the_Bot_System SHALL add 0.01 points for each millisecond remaining across all rounds
3. WHEN a round completes THEN the Spot_the_Bot_System SHALL record the remaining time if the answer was correct
4. WHEN displaying final score THEN the Spot_the_Bot_System SHALL show both the correct count and total time bonus
5. WHEN ranking players THEN the Spot_the_Bot_System SHALL use the combined score (correctness + time bonus)

### Requirement 10

**User Story:** As a player, I want to receive educational content during gameplay, so that I can learn to better identify AI-generated images and understand AI technology.

#### Acceptance Criteria

1. WHEN a user completes round 3 THEN the Spot_the_Bot_System SHALL display educational tips about identifying AI images
2. WHEN a user completes round 3 THEN the Spot_the_Bot_System SHALL display fun facts about AI image generation
3. WHEN displaying educational content THEN the Spot_the_Bot_System SHALL rotate tips and facts daily
4. WHEN displaying educational content THEN the Spot_the_Bot_System SHALL present information that everyday people can understand
5. WHEN educational content is displayed THEN the Spot_the_Bot_System SHALL allow users to continue to the next round

### Requirement 11

**User Story:** As a player, I want to receive inspiration and humor with my results, so that I feel motivated and entertained regardless of my performance.

#### Acceptance Criteria

1. WHEN a user completes all rounds THEN the Spot_the_Bot_System SHALL display inspirational quotes or humorous content
2. WHEN displaying inspiration content THEN the Spot_the_Bot_System SHALL rotate quotes and jokes daily
3. WHEN displaying inspiration content THEN the Spot_the_Bot_System SHALL pull content from an editable file
4. WHEN displaying inspiration content THEN the Spot_the_Bot_System SHALL show something new each day
5. WHEN inspiration content is shown THEN the Spot_the_Bot_System SHALL display it alongside the badge and results

### Requirement 12

**User Story:** As a player, I want audio feedback and atmosphere, so that the game feels more engaging and immersive.

#### Acceptance Criteria

1. WHEN the game starts THEN the Audio_System SHALL play background music
2. WHEN a user clicks an image THEN the Audio_System SHALL play a selection sound effect
3. WHEN the game ends THEN the Audio_System SHALL play an appropriate ending sound
4. WHEN audio files are needed THEN the Audio_System SHALL support manual upload with specific naming conventions
5. WHEN audio is playing THEN the Audio_System SHALL provide volume controls for user preference

### Requirement 13

**User Story:** As a player, I want to challenge friends and track my improvement, so that I can compete socially and see my progress over multiple attempts.

#### Acceptance Criteria

1. WHEN a user completes the game THEN the Spot_the_Bot_System SHALL provide a "share with friends" option
2. WHEN sharing with friends THEN the Spot_the_Bot_System SHALL include an invitation to play
3. WHEN a user plays again THEN the Spot_the_Bot_System SHALL update the share message with new scores
4. WHEN in production mode THEN the Spot_the_Bot_System SHALL limit players to 2 attempts per day
5. WHEN in development mode THEN the Spot_the_Bot_System SHALL allow unlimited attempts for testing

### Requirement 14

**User Story:** As a game administrator, I want to manage daily rotating content, so that players receive fresh educational and inspirational content each day.

#### Acceptance Criteria

1. WHEN 00:00 UTC occurs THEN the Spot_the_Bot_System SHALL load new educational tips for midgame display
2. WHEN 00:00 UTC occurs THEN the Spot_the_Bot_System SHALL load new AI facts for midgame display  
3. WHEN 00:00 UTC occurs THEN the Spot_the_Bot_System SHALL load new inspirational content for results display
4. WHEN content files are updated THEN the Spot_the_Bot_System SHALL use the updated content on the next daily reset
5. WHEN managing content THEN the Spot_the_Bot_System SHALL support easy editing of content files
