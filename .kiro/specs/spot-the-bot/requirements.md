# Requirements Document

## Introduction

Spot the Bot is a daily challenge game built on Reddit's Devvit platform where players test their ability to distinguish AI-generated images from real, human-captured photographs. The game presents players with 5 rounds of image pairs, where they must identify which image is real within a 10-second time limit per round. Players earn scores based on accuracy and speed, compete on leaderboards, and can share their results with the Reddit community.

## Requirements

### Requirement 1

**User Story:** As a Reddit user, I want to play a daily image identification challenge, so that I can test and improve my ability to spot AI-generated content.

#### Acceptance Criteria

1. WHEN a user accesses the game THEN the system SHALL present exactly 5 rounds of image pairs
2. WHEN a new day begins at 00:00 UTC THEN the system SHALL reset with a new set of images
3. WHEN a user completes all 5 rounds THEN the system SHALL calculate and display their final score
4. IF a user has already completed today's challenge THEN the system SHALL show their results and leaderboard position

### Requirement 2

**User Story:** As a player, I want to make quick decisions under time pressure, so that the game remains challenging and engaging.

#### Acceptance Criteria

1. WHEN each round begins THEN the system SHALL display a 10-second countdown timer
2. WHEN the timer reaches zero THEN the system SHALL automatically mark the round as incorrect and proceed to the next round
3. WHEN a user selects an image THEN the system SHALL immediately show feedback and proceed to the next round
4. WHEN a user selects the human image THEN the system SHALL record the remaining time as bonus points

### Requirement 3

**User Story:** As a competitive player, I want to see how I rank against other players, so that I can gauge my performance and stay motivated.

#### Acceptance Criteria

1. WHEN a user completes the daily challenge THEN the system SHALL display their rank on the daily leaderboard
2. WHEN viewing leaderboards THEN the system SHALL provide tabs for daily, weekly, and all-time rankings
3. WHEN the daily leaderboard resets at 00:00 UTC THEN the system SHALL preserve weekly and all-time statistics
4. WHEN displaying leaderboards THEN the system SHALL show username and score for each player
5. WHEN a user views their rank THEN the system SHALL highlight their position in the leaderboard

### Requirement 4

**User Story:** As a player, I want to receive immediate feedback on my choices, so that I can learn to better identify AI-generated content.

#### Acceptance Criteria

1. WHEN a user selects an image THEN the system SHALL immediately highlight which image was AI-generated
2. WHEN a user makes a correct choice THEN the system SHALL increment their correct count by 1
3. WHEN a user makes an incorrect choice THEN the system SHALL show the correct answer without penalty beyond lost time
4. WHEN all rounds are complete THEN the system SHALL display a badge based on total correct answers

### Requirement 5

**User Story:** As a social media user, I want to share my results with friends, so that I can challenge them and discuss the game.

#### Acceptance Criteria

1. WHEN a user completes the challenge THEN the system SHALL generate a shareable message template
2. WHEN a user clicks share THEN the system SHALL provide a "copy to clipboard" function with pre-formatted text
3. WHEN sharing THEN the message SHALL include the user's score and a challenge to beat it
4. WHEN the share message is copied THEN the system SHALL show a confirmation toast

### Requirement 6

**User Story:** As a game administrator, I want the system to automatically manage daily content rotation, so that players always have fresh challenges.

#### Acceptance Criteria

1. WHEN 00:00 UTC occurs THEN the system SHALL automatically load a new set of 5 image pairs
2. WHEN selecting daily images THEN the system SHALL randomize the category order from: Animals, Architecture, Nature, Food, Products
3. WHEN loading images THEN the system SHALL ensure each pair contains exactly one AI-generated and one human-captured image
4. WHEN storing image metadata THEN the system SHALL maintain the correct answer for validation

### Requirement 7

**User Story:** As a player, I want to see real-time engagement metrics, so that I feel part of an active community.

#### Acceptance Criteria

1. WHEN viewing the splash screen THEN the system SHALL display the current number of daily participants
2. WHEN the participant count updates THEN the system SHALL refresh the display in real-time
3. WHEN a new player starts the challenge THEN the system SHALL increment the participant counter
4. WHEN the daily reset occurs THEN the system SHALL reset the participant counter to zero

### Requirement 8

**User Story:** As a player, I want to earn recognition badges based on my performance, so that I have goals to work toward and achievements to display.

#### Acceptance Criteria

1. WHEN a user gets 5 correct answers THEN the system SHALL award the "AI Whisperer" badge
2. WHEN a user gets 4 correct answers THEN the system SHALL award the "Good Samaritan" badge
3. WHEN a user gets 3 correct answers THEN the system SHALL award the "Just Human" badge
4. WHEN a user gets 2 or fewer correct answers THEN the system SHALL award the "Needs More Coffee" badge
5. WHEN displaying results THEN the system SHALL prominently show the earned badge

### Requirement 9

**User Story:** As a player, I want my score to reflect both accuracy and speed, so that quick thinking is rewarded alongside correct identification.

#### Acceptance Criteria

1. WHEN calculating score THEN the system SHALL add 1 point for each correct answer
2. WHEN calculating score THEN the system SHALL add 0.01 points for each millisecond remaining across all rounds
3. WHEN a round completes THEN the system SHALL record the remaining time if the answer was correct
4. WHEN displaying final score THEN the system SHALL show both the correct count and total time bonus
5. WHEN ranking players THEN the system SHALL use the combined score (correctness + time bonus)
