# Requirements Document

## Introduction

This specification addresses critical bugs and improvements to the audio system and user interface in the AI or Not? game. The changes focus on simplifying audio controls, ensuring real-time audio state updates, improving sound effect audibility, reorganizing UI labels, and fixing timeout behavior.

## Glossary

- **Audio_System**: The component responsible for managing background music and sound effects
- **Game_Session**: A single continuous play session from game start until the user exits or refreshes
- **Round_Timer**: The countdown mechanism that limits player response time for each round
- **Sound_Toggle**: The audio on/off control button that replaces the current dropdown interface
- **Volume_Control**: The system that manages audio loudness levels
- **Timeout_Logic**: The behavior when a round timer expires without player input

## Requirements

### Requirement 1

**User Story:** As a player, I want a simple audio toggle button so that I can quickly turn sound on or off without navigating through dropdown menus

#### Acceptance Criteria

1. THE Audio_System SHALL provide a single toggle button using the existing music icon
2. WHEN the Sound_Toggle is clicked, THE Audio_System SHALL immediately switch between audio on and audio off states
3. THE Audio_System SHALL display visual feedback indicating the current audio state (on/off)
4. THE Audio_System SHALL remove the existing dropdown menu and separate volume controls
5. THE Audio_System SHALL maintain the audio preference across rounds within the same Game_Session

### Requirement 2

**User Story:** As a player, I want audio changes to take effect immediately so that I can hear the result of my audio settings right away

#### Acceptance Criteria

1. WHEN the Sound_Toggle is activated during gameplay, THE Audio_System SHALL immediately apply the new audio state
2. WHILE a Game_Session is active, THE Audio_System SHALL reflect audio toggle changes without requiring a game restart
3. THE Audio_System SHALL update background music playback state immediately when toggled
4. THE Audio_System SHALL update sound effect playback capability immediately when toggled
5. WHEN a Game_Session starts, THE Audio_System SHALL begin playing background music immediately if the Sound_Toggle is set to on
6. THE Audio_System SHALL start background music at session initialization, not waiting for the first round to begin

### Requirement 3

**User Story:** As a player, I want to clearly hear sound effects for correct and incorrect answers so that I receive proper audio feedback

#### Acceptance Criteria

1. THE Audio_System SHALL increase sound effect volume to three times the current level
2. WHEN a player selects an answer, THE Audio_System SHALL play the appropriate sound effect at the increased volume level
3. IF the Sound_Toggle is set to off, THEN THE Audio_System SHALL not play any sound effects
4. THE Audio_System SHALL ensure sound effects are audible above background music when audio is enabled

### Requirement 4

**User Story:** As a player, I want to see the round number and category information together so that I have a cleaner, more organized interface

#### Acceptance Criteria

1. THE Game_Interface SHALL display round information in the format "Round X of Y (Category: Z)"
2. THE Game_Interface SHALL position this combined label on the left side of the screen
3. THE Game_Interface SHALL remove the separate category label from the right side
4. WHEN each new round begins, THE Game_Interface SHALL update both the round number and category name accurately
5. THE Game_Interface SHALL maintain consistent formatting across all rounds

### Requirement 5

**User Story:** As a player, I want fair scoring when I don't select an answer in time so that I'm not penalized with incorrect animations or unearned points

#### Acceptance Criteria

1. WHEN the Round_Timer expires without player selection, THE Game_System SHALL award zero points for that round
2. IF the Round_Timer expires without player selection, THEN THE Game_System SHALL not trigger any correct answer animations
3. WHEN the Round_Timer expires, THE Game_System SHALL display the correct answer as feedback only
4. THE Game_System SHALL proceed to the next round after showing the correct answer feedback
5. THE Game_System SHALL ensure timeout behavior is consistent across all rounds
