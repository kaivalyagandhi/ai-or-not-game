# Requirements Document

## Introduction

This specification covers reducing the game round timer from 15 seconds to 10 seconds per round in the Spot the Bot game. This change will make the game more challenging and fast-paced while maintaining the existing 6-round structure.

## Glossary

- **Game_System**: The Spot the Bot game application running on Reddit via Devvit
- **Round_Timer**: The countdown timer that limits how long players have to make their selection in each round
- **Client_Interface**: The React frontend that displays the game to users
- **Server_Logic**: The backend validation and game logic that processes user submissions
- **Timer_Validation**: Server-side verification of timing to prevent cheating

## Requirements

### Requirement 1

**User Story:** As a player, I want each round to have a 10-second timer instead of 15 seconds, so that the game feels more challenging and fast-paced.

#### Acceptance Criteria

1. WHEN a game round starts, THE Game_System SHALL display a 10-second countdown timer
2. WHEN the timer reaches zero, THE Game_System SHALL automatically submit the round with no selection
3. WHEN a player makes a selection, THE Game_System SHALL calculate time bonus based on remaining time out of 10 seconds
4. WHEN validating submissions, THE Server_Logic SHALL enforce a maximum round time of 10 seconds plus network tolerance
5. WHEN displaying round progress, THE Client_Interface SHALL show timer progress based on 10-second duration

### Requirement 2

**User Story:** As a player, I want the game instructions and UI text to reflect the new 10-second timer, so that I have accurate expectations about gameplay timing.

#### Acceptance Criteria

1. WHEN viewing the splash screen, THE Game_System SHALL display "10 seconds per round" in the instructions
2. WHEN sharing game results, THE Game_System SHALL include "10-second rounds" in share messages
3. WHEN displaying help or tutorial content, THE Game_System SHALL reference the 10-second timer duration
4. WHEN showing error messages related to timing, THE Game_System SHALL use 10-second references

### Requirement 3

**User Story:** As a developer, I want all timer-related constants and validation logic updated consistently, so that the system maintains integrity and prevents timing exploits.

#### Acceptance Criteria

1. WHEN processing round submissions, THE Server_Logic SHALL validate against 10-second maximum duration
2. WHEN calculating time bonuses, THE Game_System SHALL use 10 seconds as the base duration
3. WHEN recording round start times, THE Server_Logic SHALL enforce 10-second round limits
4. WHEN handling network delays, THE Server_Logic SHALL allow appropriate tolerance for 10-second rounds
5. WHEN displaying timer progress bars, THE Client_Interface SHALL calculate progress based on 10-second total
