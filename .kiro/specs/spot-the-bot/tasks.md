# Implementation Plan

## Gameplay Improvements Overview

This implementation plan covers the enhancement of Spot the Bot with:

- 6 rounds instead of 5 (15 seconds per round instead of 10)
- Educational content after round 3 (tips and AI facts)
- Inspirational/humorous content with results
- Audio system (background music and sound effects)
- Enhanced sharing with friends and play limits (2 attempts per day)
- Science category addition (6 total categories)

## Current Status

The base game is fully implemented with 5 rounds, 10-second timers, and all core functionality including:

- Complete game logic and scoring system
- Redis data layer and session management
- Real-time features and leaderboards
- Client interface components
- Error handling and validation
- Testing suite

## Enhancement Tasks

The following tasks implement the new requirements for enhanced gameplay:

- [x] 1. Update core game configuration for 6 rounds and 15-second timer

  - [x] 1.1 Update shared types and interfaces

    - Add Science category to ImageCategory enum
    - Modify GameSession interface to include attemptNumber and showedEducationalContent
    - Update GameRound interface for 15-second timer
    - Add EducationalContent, InspirationContent, UserPlayLimit, and AudioConfig interfaces
    - Update badge types to include new "AI Detective" badge for 5/6 correct
    - _Requirements: 1.1, 2.1, 6.2, 8.1-8.6, 10.1-10.5, 11.1-11.5, 13.1-13.5_

  - [x] 1.2 Update game logic constants and validation

    - Change round count validation from 5 to 6 rounds in game-logic.ts
    - Update timer validation from 10 to 15 seconds (10000ms to 15000ms)
    - Update correctCount validation from max 5 to max 6
    - Update badge assignment logic for 6-round gameplay
    - _Requirements: 1.1, 2.1, 8.1-8.6_

  - [x] 1.3 Update client components for 6 rounds and 15-second timer

    - Update GameRound component timer from 10 to 15 seconds
    - Update round display from "Round X of 5" to "Round X of 6"
    - Update timer progress bar calculation for 15-second duration
    - Update SplashScreen instructions for 6 rounds and 15-second timer
    - _Requirements: 2.1, 2.3_

  - [x] 1.4 Update server validation and middleware
    - Update API endpoint validation for 6 rounds (roundNumber 1-6)
    - Update timer validation in middleware for 15-second limit
    - Update security validation for new round and timer limits
    - _Requirements: 2.1, 2.3, 9.1-9.5_

- [x] 2. Add Science category support

  - [x] 2.1 Update image management for Science category

    - Add Science category to image-loader.ts
    - Update daily game generation to use all 6 categories
    - Create Science category folder structure documentation
    - Update image validation to include Science category
    - _Requirements: 6.2, 6.3_

  - [x] 2.2 Update daily game state for 6 rounds
    - Modify daily game state to generate 6 rounds instead of 5
    - Update category selection to use all 6 categories (including Science)
    - Ensure proper randomization across 6 categories and 6 rounds
    - Update image pair selection logic for expanded game
    - _Requirements: 6.1, 6.2_

- [x] 3. Implement educational content system

  - [x] 3.1 Create content file structure and management

    - Create content directory structure for educational and inspirational content
    - Design simple text format for easy editing (JSON or plain text with separators)
    - Create sample educational tips about identifying AI images
    - Create sample AI facts in accessible language
    - Create sample inspirational quotes and humorous content
    - _Requirements: 10.3, 11.2, 11.3, 14.1-14.5_

  - [x] 3.2 Implement daily content rotation logic

    - Create content rotation system that reads from config files daily at 00:00 UTC
    - Implement content selection logic for tips, facts, and inspiration from files
    - Add content caching and validation for file-based content
    - Update daily reset job to include content file reading
    - _Requirements: 10.3, 11.4, 14.1-14.3_

  - [x] 3.3 Create content loading utilities
    - Implement file reading utilities for educational and inspirational content
    - Add content parsing and validation for text config files
    - Create content caching system for daily rotation
    - Add error handling for missing or corrupted content files
    - _Requirements: 10.1-10.5, 11.1-11.5_

- [x] 4. Implement educational content display system

  - [x] 4.1 Create educational content component

    - Build EducationalContent component to display after round 3
    - Implement tips display with clear, accessible formatting from config files
    - Add AI facts display with everyday language from config files
    - Create continue button to proceed to remaining rounds
    - _Requirements: 10.1-10.5_

  - [x] 4.2 Integrate educational content into game flow
    - Modify game logic to pause after round 3 completion and load content from files
    - Add educational content display trigger with file-based content
    - Update game state management to track educational content display
    - Ensure smooth transition to rounds 4-6 after content viewing
    - _Requirements: 10.1, 10.5_

- [x] 5. Implement audio system

  - [x] 5.1 Create audio system architecture

    - Design audio file naming conventions and upload instructions
    - Implement AudioSystem component with volume controls
    - Add audio loading and error handling with graceful degradation
    - Create audio configuration management
    - _Requirements: 12.1-12.5_

  - [x] 5.2 Integrate background music and sound effects

    - Add background music playback when game starts
    - Implement click sound effects for image selection
    - Add ending sounds based on game completion
    - Create user controls for audio preferences (volume, mute)
    - _Requirements: 12.1-12.4_

  - [x] 5.3 Create audio file management system
    - Document audio file naming conventions for manual upload
    - Implement audio file validation and loading
    - Add fallback handling for missing or corrupted audio files
    - Create audio asset organization structure
    - _Requirements: 12.4, 12.5_

- [x] 6. Implement play limit system

  - [x] 6.1 Create play limit tracking

    - Implement UserPlayLimit data model and Redis storage
    - Add daily attempt counting and validation
    - Create play limit enforcement (2 attempts in production, unlimited in dev)
    - Add best score tracking across multiple attempts
    - _Requirements: 13.4, 13.5_

  - [x] 6.2 Update game initialization for play limits

    - Modify game initialization to check remaining attempts
    - Add play limit validation before starting new games
    - Update session management to track attempt numbers
    - Display remaining attempts and best scores to users
    - _Requirements: 13.1-13.5_

  - [x] 6.3 Create play limit API endpoints
    - Implement GET /api/game/play-attempts endpoint
    - Add POST /api/game/increment-attempts endpoint
    - Update game initialization endpoints to include play limit data
    - Add play limit validation to all game endpoints
    - _Requirements: 13.4, 13.5_

- [x] 7. Enhance sharing system with friends feature

  - [x] 7.1 Update sharing component and functionality

    - Modify share component to include "share with friends" option
    - Update share message templates to include friend invitations
    - Add logic to update share messages with new scores after replays
    - Implement enhanced clipboard integration with multiple share options
    - _Requirements: 13.1-13.3_

  - [x] 7.2 Integrate sharing with play limit system
    - Connect sharing functionality with multiple attempt tracking
    - Display best scores and improvement in share messages
    - Add replay encouragement in share messages when attempts remain
    - Update share message generation based on attempt number
    - _Requirements: 13.1-13.3_

- [x] 8. Update results screen with inspirational content

  - [x] 8.1 Enhance results screen component

    - Add inspirational content display alongside badge and scores from config files
    - Implement daily rotating quotes and jokes from editable text files
    - Update results layout to accommodate new content
    - Add play again button when attempts remain
    - _Requirements: 11.1-11.5_

  - [x] 8.2 Update badge system for 6 rounds
    - Modify badge assignment logic for 6-round gameplay
    - Add new "AI Detective" badge for 5/6 correct answers
    - Update badge display and descriptions
    - Test badge assignment with new scoring system
    - _Requirements: 8.1-8.6_

- [x] 9. Update all hardcoded references to 5 rounds and 10 seconds

  - [x] 9.1 Update client-side references

    - Update all "5 rounds" references to "6 rounds" in components
    - Update all "10 seconds" references to "15 seconds" in UI text
    - Update progress calculations and display logic
    - Update share messages and result displays
    - _Requirements: 1.1, 2.1_

  - [x] 9.2 Update server-side references
    - Update all validation logic for 6 rounds and 15-second timer
    - Update badge achievement messages for 6-round gameplay
    - Update leaderboard display logic for new scoring
    - Update API documentation and error messages
    - _Requirements: 1.1, 2.1, 8.1-8.6_

- [ ] 10. Create comprehensive testing for enhanced features

  - [ ]\* 10.1 Test educational content system

    - Test content file loading and parsing from text config files
    - Verify daily content rotation functionality with file-based content
    - Test educational content display after round 3
    - Validate content file reading and error handling
    - _Requirements: 10.1-10.5, 14.1-14.5_

  - [ ]\* 10.2 Test audio system functionality

    - Test audio loading and playback across different browsers
    - Verify graceful degradation when audio fails
    - Test user controls and volume management
    - Validate audio file naming conventions and upload process
    - _Requirements: 12.1-12.5_

  - [ ]\* 10.3 Test play limit system

    - Test daily attempt tracking and enforcement
    - Verify play limit validation across all endpoints
    - Test best score tracking and display
    - Validate development vs production mode differences
    - _Requirements: 13.1-13.5_

  - [ ]\* 10.4 Test enhanced sharing functionality

    - Test share with friends feature and message generation
    - Verify share message updates after multiple attempts
    - Test clipboard integration with enhanced sharing
    - Validate sharing integration with play limit system
    - _Requirements: 13.1-13.3_

  - [ ]\* 10.5 Test complete 6-round gameplay with all enhancements
    - Test full game flow with 6 rounds and 15-second timer
    - Verify educational content display after round 3
    - Test audio integration throughout gameplay
    - Validate inspirational content display with results
    - Test Science category integration and randomization
    - _Requirements: All enhanced gameplay requirements_

## Implementation Notes

- **Development Mode**: The current implementation allows multiple plays per day in development mode for testing
- **Production Deployment**: Play limits (2 attempts per day) should be enforced when deploying to production
- **Content Management**: Educational and inspirational content should be stored in easily editable text files
- **Audio Assets**: Audio files will need to be manually uploaded following specific naming conventions
- **Science Category**: Image assets for the Science category will need to be uploaded to complete the 6-category system
- **Backward Compatibility**: Existing game sessions and leaderboard data will remain functional during the transition
