# Requirements Document

## Introduction

This specification defines the requirements for transitioning the AI or Not? game from development mode to production release state. The transition involves updating configuration settings, documentation, licensing, and ensuring all production-ready features are properly configured for public deployment on Reddit.

## Glossary

- **Production_Mode**: The live deployment state where the application runs with production configurations, including play limits and optimized settings
- **Development_Mode**: The testing state where the application runs with relaxed constraints for development and testing purposes
- **OSL**: Open Source License - specifically the Open Software License 3.0
- **Play_Limit_Manager**: The system component that enforces daily play attempt limits
- **Devvit_Platform**: Reddit's developer platform for building native Reddit applications
- **Release_State**: The final production-ready configuration of the application

## Requirements

### Requirement 1

**User Story:** As a developer, I want to transition the application from development mode to production mode, so that the game enforces proper play limits and production configurations when deployed.

#### Acceptance Criteria

1. WHEN the application runs in production mode, THE Play_Limit_Manager SHALL enforce a maximum of 2 daily attempts per user
2. WHEN the application runs in production mode, THE Play_Limit_Manager SHALL use production configuration values instead of development overrides
3. WHEN NODE_ENV is set to 'production', THE Play_Limit_Manager SHALL return PRODUCTION_MAX_ATTEMPTS value
4. THE Play_Limit_Manager SHALL maintain backward compatibility with existing user data during the transition
5. THE application SHALL log appropriate messages indicating production mode activation

### Requirement 2

**User Story:** As a project maintainer, I want to update the project license from BSD-3-Clause to OSL-3.0, so that the project uses the Open Software License for better open source compliance.

#### Acceptance Criteria

1. THE project SHALL replace the existing BSD-3-Clause license with OSL-3.0 license text
2. THE package.json file SHALL reflect the OSL-3.0 license designation
3. THE LICENSE file SHALL contain the complete OSL-3.0 license text with proper copyright attribution
4. THE license change SHALL maintain compatibility with existing dependencies
5. THE README file SHALL reference the updated license information

### Requirement 3

**User Story:** As a user reading the project documentation, I want an updated and comprehensive README file, so that I can understand the project's current state, features, and how to use it effectively.

#### Acceptance Criteria

1. THE README file SHALL accurately reflect the current production-ready state of the application
2. THE README file SHALL include comprehensive installation and deployment instructions
3. THE README file SHALL document all major features and gameplay mechanics
4. THE README file SHALL include proper licensing information and attribution
5. THE README file SHALL provide clear development setup instructions for contributors

### Requirement 4

**User Story:** As a developer deploying the application, I want proper environment configuration management, so that production and development environments are clearly distinguished and properly configured.

#### Acceptance Criteria

1. THE application SHALL detect production environment through NODE_ENV environment variable
2. THE application SHALL provide clear configuration examples for production deployment
3. THE application SHALL include environment-specific configuration documentation
4. THE application SHALL validate environment configurations at startup
5. THE application SHALL provide fallback configurations for missing environment variables

### Requirement 5

**User Story:** As a project contributor, I want clear documentation about the project structure and development workflow, so that I can effectively contribute to the project.

#### Acceptance Criteria

1. THE README file SHALL document the complete project structure and architecture
2. THE README file SHALL include development workflow instructions and best practices
3. THE README file SHALL provide testing and quality assurance guidelines
4. THE README file SHALL document the deployment process and requirements
5. THE README file SHALL include troubleshooting information for common issues
