# Requirements Document

## Introduction

This specification covers improvements to the Spot the Bot game's scoring system and user interface. The changes include simplifying the scoring logic to use tier-based time bonuses instead of millisecond-based calculations, enhancing the visual feedback with improved point displays and animations, and updating photo styling for better visual clarity after selection.

## Glossary

- **Spot_the_Bot_System**: The complete game application including client interface, server logic, and data persistence
- **Tier_Based_Scoring**: A simplified scoring system that awards points based on time remaining ranges rather than exact milliseconds
- **Points_Display**: The visual element that shows points earned after each round
- **Rainbow_Confetti**: An animated visual effect that plays when points are awarded
- **Photo_Borders**: The visual outline around images that indicates selection and feedback state
- **Border_Radius**: The rounded corner styling applied to image containers

## Requirements

### Requirement 1

**User Story:** As a player, I want a simplified scoring system that awards points in whole numbers, so that I can easily understand my performance without dealing with decimal calculations.

#### Acceptance Criteria

1. WHEN a player answers correctly with 7-10 seconds remaining THEN the Spot_the_Bot_System SHALL award 5 time bonus points
2. WHEN a player answers correctly with 4-6 seconds remaining THEN the Spot_the_Bot_System SHALL award 3 time bonus points  
3. WHEN a player answers correctly with 1-3 seconds remaining THEN the Spot_the_Bot_System SHALL award 1 time bonus point
4. WHEN a player answers correctly with 0 seconds remaining THEN the Spot_the_Bot_System SHALL award 0 time bonus points
5. WHEN a player answers correctly THEN the Spot_the_Bot_System SHALL award 10 points for the correct answer plus the applicable time bonus

### Requirement 2

**User Story:** As a player, I want all scores displayed as whole numbers, so that the scoring feels clean and professional without confusing decimal places.

#### Acceptance Criteria

1. WHEN displaying round scores THEN the Spot_the_Bot_System SHALL show only whole number values
2. WHEN displaying total scores THEN the Spot_the_Bot_System SHALL show only whole number values
3. WHEN displaying leaderboard scores THEN the Spot_the_Bot_System SHALL show only whole number values
4. WHEN calculating final scores THEN the Spot_the_Bot_System SHALL use only whole number arithmetic
5. WHEN storing scores in the database THEN the Spot_the_Bot_System SHALL store only whole number values

### Requirement 3

**User Story:** As a player, I want the points display to be positioned properly and visually appealing, so that I can clearly see my score without it interfering with the game images.

#### Acceptance Criteria

1. WHEN displaying points after a round THEN the Spot_the_Bot_System SHALL position the points text 4 pixels lower than the current position
2. WHEN displaying points after a round THEN the Spot_the_Bot_System SHALL use a larger font size than the current implementation
3. WHEN points are greater than 0 THEN the Spot_the_Bot_System SHALL display a rainbow confetti animation
4. WHEN points equal 0 THEN the Spot_the_Bot_System SHALL display the points without animation
5. WHEN the confetti animation plays THEN the Spot_the_Bot_System SHALL ensure it enhances the experience without blocking gameplay

### Requirement 4

**User Story:** As a player, I want enhanced visual feedback on selected photos, so that I can clearly see which image I chose and understand the game state better.

#### Acceptance Criteria

1. WHEN a player selects a photo THEN the Spot_the_Bot_System SHALL apply a 6-pixel border instead of the current 3-pixel border
2. WHEN displaying photo borders THEN the Spot_the_Bot_System SHALL apply a 3-pixel border-radius to round the corners
3. WHEN showing feedback borders THEN the Spot_the_Bot_System SHALL maintain the enhanced 6-pixel thickness
4. WHEN applying border styling THEN the Spot_the_Bot_System SHALL preserve the existing color scheme for correct and incorrect feedback
5. WHEN photos are in their default state THEN the Spot_the_Bot_System SHALL maintain the original border styling until selection occurs
