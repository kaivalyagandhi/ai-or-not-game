# 🤖 Spot the Bot

**Can you tell AI from reality?**

Spot the Bot is an engaging daily challenge game built on Reddit's Devvit platform where players test their ability to distinguish between real photographs and AI-generated images. Each day brings a fresh set of image pairs across different categories, challenging users to identify which image was created by a human versus artificial intelligence.

This interactive React-based game runs directly within Reddit posts, providing a seamless gaming experience with real-time leaderboards, achievement badges, social sharing features, and immersive audio. Players compete against the clock and each other in a daily test of visual perception and AI detection skills.

## 🎯 What is Spot the Bot?

Spot the Bot is a **daily visual challenge game** that tests your ability to distinguish between real photographs and AI-generated images. Built as a React web application that runs natively within Reddit posts using the Devvit platform, the game presents players with image comparisons where they must identify which image is the REAL photograph (not the AI-generated one).

### Core Game Mechanics
- **6 rounds per game** with exactly 10 seconds per round
- **6 image categories**: Animals, Architecture, Nature, Food, Products, and Science
- **Responsive layout**: Images displayed in a responsive grid that adapts from vertical stack on mobile to side-by-side on desktop
- **Time-pressure scoring**: Faster correct answers earn higher scores with time bonuses (0.01 points per millisecond remaining)
- **Multiple attempts per day**: Players can attempt the challenge up to 2 times per day (unlimited in development mode)
- **Educational break**: After round 3, players receive AI detection tips and facts about AI image generation
- **Enhanced visual feedback**: Custom overlay indicators with colored circles, icons, and labels show AI vs Human sources
- **Audio enhancement**: Background music and sound effects create an immersive gaming experience with user controls
- **Progressive difficulty**: Mixed categories and randomized AI placement keep players guessing

## 🎮 What Makes This Game Innovative

### Cutting-Edge AI Detection Challenge
- **Daily Fresh Content**: New image sets generated every day at 00:00 UTC with completely randomized categories, AI placement, and difficulty progression across 6 diverse image categories
- **Real-Time Social Competition**: Live participant counter shows how many players have attempted today's challenge, with real-time updates as new players join via Devvit's Realtime API
- **Intelligent Scoring Algorithm**: Sophisticated time-based scoring system rewards both accuracy (1 point per correct answer) and speed (0.01 bonus points per millisecond remaining), creating strategic tension between careful analysis and quick decisions under intense 10-second time pressure
- **Educational Integration**: Midgame learning break after round 3 provides AI detection tips and fascinating facts about AI image generation with daily rotating content loaded from server-managed files
- **Immersive Audio Experience**: Background music and contextual sound effects enhance gameplay with user-controlled volume and mute options, gracefully degrading when audio files are unavailable

### Enhanced Visual Feedback System
- **Custom Overlay Indicators**: Selected images show circular overlays with white icons (✕ for AI, ✓ for Human) and clear labels ("AI" or "Human")
- **Enhanced Border Styling**: Selected images get blue borders during selection, correct answers get green borders (#46E870), incorrect get red borders (#F23C3C) with glow effects
- **Responsive Grid Layout**: Images displayed in a responsive grid that adapts from single column on mobile to side-by-side on desktop, all with consistent 1:1 aspect ratio
- **Smart Visual States**: Clear visual progression from default state → selection state → feedback state with smooth transitions and hover effects

### Advanced Social & Community Features
- **Dynamic Achievement System**: Earn performance-based badges with custom emoji and descriptions from 🤖 AI Whisperer (perfect score) to 🎓 Human in Training (learning mode)
- **Multi-Tier Live Leaderboards**: Real-time daily, weekly, and all-time rankings with live position updates, user highlighting, and total participant tracking
- **Enhanced Social Sharing**: Two sharing modes - general results sharing and friend challenge sharing with personalized messages, attempt tracking, and improvement notifications
- **Community-Driven Competition**: Built natively for Reddit with automatic user authentication, username display, and seamless social features

### Technical Innovation & User Experience
- **Serverless Architecture**: Built on Devvit's modern serverless platform with Redis persistence for game state, session management, and leaderboard data
- **Comprehensive Error Resilience**: Advanced error boundaries, network retry logic with exponential backoff, offline detection, and graceful degradation with local caching
- **Mobile-First Responsive Design**: Touch-optimized interface with adaptive layouts, hover states, and gesture-friendly controls designed for Reddit's mobile-heavy user base
- **Anti-Cheat Protection**: Server-side timer validation with 3-second tolerance, rate limiting, session integrity checks, and comprehensive input validation to ensure fair play
- **Progressive Web App Features**: Offline support with smart caching, pending request queuing, and automatic retry when connection is restored

## 🎯 Step-by-Step: How to Play

### Getting Started
1. **Find the Game**: Look for Spot the Bot posts in participating subreddits or communities where the app is installed
2. **Launch the App**: Click the "Launch App" button in the Reddit post to open the game in full-screen webview mode
3. **Welcome Screen**: You'll see today's date, a live participant counter showing how many players have joined today, your remaining attempts (out of 2 per day), and your best score from previous attempts
4. **Join the Challenge**: Click "Start Playing" to begin your daily challenge (button will be disabled if you've used all daily attempts)

### Complete Game Flow

#### Pre-Game Setup
The splash screen welcomes you with:
- **Daily Challenge Display**: Shows the current date and live participant count with real-time updates
- **Your Progress Tracking**: Displays remaining attempts (out of 2 per day) and your best score from previous attempts
- **Game Rules Overview**: Clear instructions explaining the 6-round format, 10-second time limits, and scoring system

#### Round-by-Round Gameplay (6 Rounds Total)

**Each Round Structure:**
- **Category Display**: See which category you're playing (Animals, Architecture, Nature, Food, Products, or Science)
- **Image Comparison**: Two images displayed - one real photograph, one AI-generated
  - **Mobile Layout**: Images stacked vertically for easy comparison
  - **Desktop Layout**: Images displayed side-by-side
- **10-Second Timer**: Color-coded countdown timer with progress bar:
  - **Green** (7-10 seconds): Plenty of time to analyze
  - **Yellow** (4-6 seconds): Time to make a decision  
  - **Red** (1-3 seconds): Choose quickly!

**Making Your Selection:**
1. **Analyze Both Images**: Look for AI tells like unnatural lighting, impossible geometry, or weird details
2. **Click to Choose**: Click on the image you believe is the REAL photograph (not AI-generated)
3. **Immediate Feedback**: See the correct answer with enhanced visual indicators:
   - **Selected Image Only**: Shows circular overlay with white icon (✕ for AI, ✓ for Human) and label ("AI" or "Human")
   - **Border Colors**: Selected images get blue borders during selection, then show green borders (#46E870) for correct answers or red borders (#F23C3C) for incorrect answers with glow effects
   - **Scale Effects**: Selected images scale up slightly (scale-105) for emphasis during feedback
4. **Score Display**: See your round score with decimal precision (e.g., "+1.23 points")
5. **Auto-Advance**: Game automatically moves to the next round after 2 seconds

#### Educational Break (After Round 3)
Halfway through the game, you'll receive:
- **AI Detection Tips**: Practical advice for spotting AI-generated images
- **AI Facts**: Fascinating insights about AI image generation technology
- **Daily Rotation**: New educational content provided each day
- **Continue Button**: "Continue to Round 4" to resume gameplay

#### Audio Experience (Optional)
- **Background Music**: Atmospheric music during gameplay that starts when you begin playing and stops when the game ends
- **Sound Effects**: Click sounds when selecting images, success sounds for correct answers, failure sounds for incorrect answers
- **Audio Controls**: Integrated audio system with user-controlled volume and mute options accessible throughout gameplay
- **Graceful Degradation**: Game works perfectly even if audio files are unavailable, with comprehensive audio validation and development tools
- **Audio Context Management**: Smart audio unlocking on user interaction to comply with browser autoplay policies

#### Scoring System
- **Base Points**: 1 point for each correct identification
- **Time Bonus**: 0.01 bonus points per millisecond remaining when you answer correctly
- **Maximum Score**: ~11 points per round (1 base + ~10 time bonus for instant correct answers)
- **Final Score**: Cumulative total across all 6 rounds with server-side validation
- **Perfect Game**: Maximum possible score is approximately 66 points (6 correct answers + maximum time bonuses)

#### Badge Achievement System
Your final performance determines your badge:
- 🤖 **AI Whisperer** (6/6 correct): "Perfect score! You can spot AI-generated content with incredible accuracy"
- 🕵️ **AI Detective** (5/6 correct): "Outstanding! You have excellent skills at detecting AI-generated content"
- 👁️ **Good Samaritan** (4/6 correct): "Excellent work! You have a keen eye for distinguishing real from artificial"
- 👤 **Just Human** (3/6 correct): "Not bad! You're getting the hang of spotting AI-generated images"
- 🎓 **Human in Training** (≤2/6 correct): "Keep practicing! AI detection skills take time to develop"

#### Final Results Screen
After completing all 6 rounds:
- **Total Score**: Your final score with decimal precision (e.g., "87.45") and attempt number if multiple attempts
- **Performance Breakdown**: Correct answers (X/6) and total time bonus earned
- **Badge Achievement**: Large badge display with custom emoji, title, and description
- **Leaderboard Position**: Your rank among all daily players with live updates via real-time connection
- **Inspirational Content**: Daily rotating quotes and motivational messages loaded from server content
- **Improvement Tracking**: Shows score improvements from previous attempts and best score context
- **Attempt Status**: Displays remaining attempts and encourages replay if attempts are available

#### Social Sharing Options
**📤 Share Results**: Standard performance summary with score, badge, rank, and attempt context
**👥 Challenge Friends**: Personalized message with friendly challenge invitation and attempt tracking

Both modes support:
- **Native Sharing**: Uses device's built-in sharing API on mobile devices
- **Clipboard Fallback**: Automatic copy-to-clipboard with toast notification confirmation
- **Smart Messaging**: Different messages based on attempt number, score improvements, and remaining attempts
- **Encouragement Context**: Messages adapt based on whether you can still play again or have used all attempts

#### Multi-Tier Leaderboard System
- **Daily Leaderboard**: Compete against all players for today (resets at 00:00 UTC)
- **Weekly Rankings**: Top performers over the past 7 days
- **All-Time Champions**: Highest scores since launch
- **Live Updates**: Real-time position changes with green "Live" indicator
- **Detailed Stats**: Username, score, correct count (✅ X/6), time bonus (⚡ +XX.XX), and badge emoji

### Game Rules & Fair Play

#### Daily Challenge System
- **Multiple Attempts**: Up to 2 attempts per day (unlimited in development mode)
- **UTC Reset**: New challenges available daily at 00:00 UTC with fresh image sets
- **Best Score Tracking**: System remembers your highest score across attempts with improvement notifications
- **Session Persistence**: Must complete started games (can't restart mid-game)
- **Attempt Tracking**: Clear display of remaining attempts and encouragement to replay

#### Anti-Cheat Protection
- **Server-Side Timer Validation**: All timing verified server-side with 3-second tolerance for network delays
- **Rate Limiting**: Prevents spam and system abuse with middleware protection
- **Input Validation**: All user inputs sanitized and validated on both client and server
- **Session Integrity**: Comprehensive session validation and state management
- **Network Resilience**: Retry logic with exponential backoff and offline detection

### Pro Tips for Success

#### Detection Techniques
- **Detail Inspection**: Look closely at fine details like hair, fur, fabric textures
- **Lighting Consistency**: Look for unnatural lighting, impossible shadows, or inconsistent light sources
- **Geometric Logic**: Check for impossible architecture, floating objects, or perspective errors
- **Human Elements**: Pay special attention to faces, hands, and human interactions - AI often struggles here

#### Strategic Gameplay
- **Trust Your Instincts**: The "uncanny valley" feeling is often a reliable AI indicator
- **Balance Speed vs. Accuracy**: Time bonuses are significant, but accuracy is more important
- **Category-Specific Patterns**: Each category has different AI tells:
  - **Animals**: Unnatural fur patterns, impossible anatomy, weird eyes
  - **Architecture**: Impossible geometry, floating elements, inconsistent perspective
  - **Nature**: Too-perfect landscapes, impossible weather combinations
  - **Food**: Perfect textures, impossible arrangements, unnatural lighting
  - **Products**: Too-perfect surfaces, impossible reflections
  - **Science**: Impossible equipment configurations, unnatural lab setups

#### Daily Practice Benefits
- **Pattern Recognition**: Regular play helps you develop better AI detection skills over time
- **Speed Improvement**: Practice helps you make faster, more confident decisions
- **Category Familiarity**: Learn the specific tells and patterns for each image category
- **Competitive Edge**: Consistent play helps you climb the weekly and all-time leaderboards



### ✅ Fully Implemented Features

#### Core Game Systems
- **Complete Gameplay Loop**: 6 rounds with 10-second timers and comprehensive scoring system
- **Educational Integration**: Midgame learning breaks with daily rotating content and fallbacks
- **Audio System**: Background music, sound effects, and user controls with graceful degradation
- **Play Limit Management**: Multiple daily attempts (2 per day) with best score tracking and improvement notifications

#### Real-time & Social Features
- **Live Updates**: Real-time participant counting and leaderboard updates via Devvit Realtime API
- **Multi-tier Leaderboards**: Daily, weekly, and all-time rankings with live position updates
- **Enhanced Sharing**: Two sharing modes (general results and friend challenges) with personalized messages
- **Community Integration**: Built natively for Reddit with automatic user authentication

#### User Experience & Design
- **Enhanced Visual Feedback**: Custom overlay indicators with colored circles, icons, and labels, plus colored borders with glow effects
- **Responsive Design**: Mobile-first approach with adaptive layouts for all screen sizes
- **Error Resilience**: Comprehensive error boundaries, retry logic, and offline support
- **Loading States**: Smooth transitions and progress indicators throughout the experience

#### Technical Infrastructure
- **Session Management**: Secure game state persistence with Redis and local storage caching
- **Content Management**: Daily rotating educational tips, AI facts, and inspirational content
- **Anti-Cheat Protection**: Server-side validation and comprehensive input sanitization
- **Performance Optimization**: Efficient API calls, caching, and bundle optimization

#### Quality Assurance
- **Comprehensive Testing**: Extensive test coverage including:
  - Component testing for all major UI elements
  - Integration testing for complete gameplay workflows
  - Responsive design testing across screen sizes
  - Audio system validation and error handling
  - API endpoint testing with error scenarios
  - Play limit system testing with edge cases

### 🚧 Current Status

#### Production Ready ✅
The game is **fully functional and production-ready** with all core systems implemented:
- Complete 6-round gameplay with 5 active image categories (Animals, Architecture, Nature, Food, Products)
- Full audio system with background music and sound effects
- Real-time leaderboards and participant tracking
- Educational content system with daily rotation
- Comprehensive error handling and offline support
- Mobile-responsive design optimized for Reddit users
- Anti-cheat protection and play limit enforcement

#### In Development 🚧
- **Science Category**: Image content for the 6th category (infrastructure ready, awaiting image uploads)

#### Planned Enhancements 📋
- **Extended Audio Library**: Additional sound effects and dynamic music system
- **Community Features**: User-generated content and enhanced social interactions
- **Advanced Analytics**: Detailed performance insights and player statistics

## 🎨 Recent Updates & Enhancements

### Latest Code Improvements
- **React Hook Optimization**: Updated App.tsx to properly import `useCallback` for optimized audio control handlers
- **Audio System Integration**: Enhanced audio context management with proper lifecycle handling
- **Performance Optimizations**: Improved component re-rendering with proper hook dependencies

### Visual Feedback Enhancements
The game recently received major visual feedback improvements to create a more intuitive and engaging experience:

### Custom Overlay Indicator System
- **Selective Display**: Overlay indicators now appear only on the selected image during feedback
- **Clear Visual Design**: Red circles with white ✕ icon and "AI" label for AI-generated images
- **Human Recognition**: Green circles with white ✓ icon and "Human" label for real photographs
- **Professional Styling**: 80px circular overlays with proper typography and contrast

### Enhanced Border Feedback
- **Selection State**: Blue borders (#3b82f6) appear when images are selected
- **Correct Feedback**: Green borders (#46E870) with subtle glow effects for correct answers
- **Incorrect Feedback**: Red borders (#F23C3C) with subtle glow effects for incorrect answers
- **Non-Selected Images**: Subtle border outlines indicate the source (AI vs Human) without overlays

### Responsive Layout Improvements
- **Mobile-First Design**: Single column layout on mobile devices for easy thumb navigation
- **Desktop Optimization**: Side-by-side layout on larger screens for direct comparison
- **Consistent Aspect Ratios**: All images maintain 1:1 aspect ratio with proper cropping
- **Smooth Transitions**: Scale effects and hover states provide tactile feedback


## 🚀 Technology Stack

### Core Technologies
- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform for building native Reddit apps with serverless architecture
- **[React 19.1.0](https://react.dev/)**: Modern UI framework with TypeScript, hooks, and custom components for game state management
- **[Vite 6.2.4](https://vite.dev/)**: Fast build tool for client and server bundles with hot module replacement and optimized builds
- **[Express 5.1.0](https://expressjs.com/)**: Backend API server with RESTful endpoints, middleware, and comprehensive error handling
- **[TypeScript 5.8.2](https://www.typescriptlang.org/)**: Full type safety across the entire stack with strict configuration and shared type definitions

### Data & Real-time Features
- **[Redis](https://redis.io/)**: Data persistence for game sessions, leaderboards, daily content, and real-time participant tracking
- **[Devvit Realtime API](https://developers.reddit.com/)**: Real-time updates for participant counts and leaderboard positions

### Styling & UI
- **[Tailwind CSS 4.1.6](https://tailwindcss.com/)**: Utility-first styling with responsive design, custom components, and mobile-first approach
- **Custom CSS**: Enhanced visual feedback system with overlay indicators and responsive grid layouts

### Testing & Quality
- **[Vitest 3.1.1](https://vitest.dev/)**: Fast unit testing framework with comprehensive test coverage
- **[Testing Library](https://testing-library.com/)**: React component testing utilities
- **[ESLint](https://eslint.org/)**: Code quality and consistency enforcement
- **[Prettier](https://prettier.io/)**: Automated code formatting

## 🛠️ Development Setup

### Prerequisites
- **Node.js 22.2.0+**: Required for Devvit compatibility
- **Reddit Account**: Connected to Reddit Developers platform
- **Devvit CLI**: Installed and authenticated (`npm install -g devvit`)

### Quick Start
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spot-the-bot-v6
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Authenticate with Devvit**
   ```bash
   npm run login
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   This runs three processes concurrently:
   - Client build watcher (Vite)
   - Server build watcher (Vite)
   - Devvit playtest server

5. **Open the game**
   - Navigate to the provided playtest URL (typically `https://www.reddit.com/r/spot_the_bot_v6_dev?playtest=spot-the-bot-v6`)
   - Click "Launch App" to test the game in full-screen mode

### Development Workflow
- **Live Reloading**: Changes to client code automatically rebuild and refresh
- **Server Updates**: Server changes require manual refresh of the Reddit post
- **Testing**: Run `npm test` for unit tests or `npm run test:watch` for watch mode
- **Code Quality**: Use `npm run check` to run TypeScript, ESLint, and Prettier

## 📋 Available Commands

### Development
- `npm run dev`: Start development server with live Reddit integration
- `npm run build`: Build client and server bundles for production
- `npm run check`: Run type checking, linting, and code formatting

### Deployment
- `npm run deploy`: Upload app to Reddit for testing
- `npm run launch`: Build, deploy, and publish for review
- `npm run login`: Authenticate Devvit CLI with Reddit account

### Individual Builds
- `npm run build:client`: Build only the React frontend
- `npm run build:server`: Build only the Express backend



## 📁 Project Structure

```
src/
├── client/          # React frontend (runs in Reddit webview)
│   ├── components/  # Game UI components
│   │   ├── SplashScreen.tsx      # Welcome screen with live participant count
│   │   ├── GameRound.tsx         # Image comparison interface with timer
│   │   ├── EducationalContent.tsx # Midgame learning break with tips and facts
│   │   ├── ResultsScreen.tsx     # Final results with sharing and leaderboard
│   │   ├── LeaderboardTabs.tsx   # Multi-tier leaderboards with live updates
│   │   ├── LoadingScreen.tsx     # Loading states and progress indicators
│   │   ├── AudioSystem.tsx       # Audio playback and controls
│   │   └── ErrorBoundary.tsx     # Error handling and recovery
│   ├── hooks/       # Custom React hooks
│   │   ├── useGameState.ts       # Main game state management
│   │   ├── useErrorHandler.ts    # Error handling with retry logic
│   │   ├── useAudio.ts           # Audio controls and context
│   │   └── useCounter.ts         # Counter utilities
│   ├── utils/       # Client utilities
│   │   ├── network.ts            # API calls with retry logic and error handling
│   │   ├── storage.ts            # Local storage and caching
│   │   ├── content.ts            # Educational and inspirational content loading
│   │   ├── audio.ts              # Audio context management
│   │   ├── audioDevTools.ts      # Audio development and debugging tools
│   │   └── audioValidation.ts    # Audio file validation utilities
│   ├── App.tsx      # Main game container with routing
│   └── main.tsx     # React app entry point
├── server/          # Express backend (serverless)
│   ├── core/        # Game logic and data management
│   │   ├── game-logic.ts         # Core game mechanics and validation
│   │   ├── leaderboard-manager.ts # Leaderboard operations and rankings
│   │   ├── session-manager.ts    # User session handling and persistence
│   │   ├── daily-game-manager.ts # Daily content management and caching
│   │   ├── content-manager.ts    # Educational and inspirational content
│   │   ├── play-limit-manager.ts # Daily attempt tracking and limits
│   │   ├── badge-manager.ts      # Achievement badge system
│   │   ├── image-manager.ts      # Image loading and validation
│   │   └── scheduler-manager.ts  # Background task scheduling
│   ├── middleware/  # Server middleware
│   │   └── security.ts           # Rate limiting and validation
│   └── index.ts     # API endpoints and Devvit integration
└── shared/          # TypeScript types used by both client and server
    └── types/       # Game data models and API interfaces
        ├── api.ts               # Complete API type definitions
        └── index.ts             # Type exports
```

### Key Features Implementation

- **Educational System**: Midgame learning breaks with daily rotating tips and facts loaded from server content management
- **Audio Integration**: Comprehensive audio system with background music, sound effects, and `useAudio` hook for controls
- **Real-Time Updates**: Realtime connections via Devvit Realtime API for live participant counts and leaderboard updates
- **Timer System**: Client-side countdown with color-coded visual progress bar (green/yellow/red) and server-side validation
- **Image Handling**: Responsive grid layout with 1:1 aspect ratio, custom overlay indicators, and enhanced visual feedback
- **Score Calculation**: Time-based bonus system (0.01 points per millisecond remaining) with server-side validation
- **Badge Assignment**: Automatic badge calculation based on performance with 5 achievement tiers
- **Content Management**: Daily rotating educational tips, AI facts, and inspirational content with caching
- **Social Sharing**: Native sharing API with clipboard fallback and two sharing modes (results and friend challenges)
- **Error Resilience**: Comprehensive error boundaries, network retry logic with exponential backoff, offline detection via `useErrorHandler`
- **Session Management**: Secure Redis-based persistence with local storage caching and session validation
- **Network Optimization**: Smart retry logic with exponential backoff, offline detection, and pending request queuing
- **Loading States**: Comprehensive loading screens, skeleton states, progress indicators, and smooth state transitions
- **Offline Support**: Local caching system for game data, results viewing, cached leaderboards, and graceful degradation

## 🎨 Design Philosophy

### Mobile-First Approach
- Responsive grid layouts that adapt from single column to side-by-side comparison
- Touch-friendly button sizes with hover states and scale effects
- Optimized image loading and display for mobile networks

### User Experience Focus
- Clear visual feedback with custom overlay indicators and colored borders
- Smooth transitions and loading states with comprehensive error handling
- Intuitive game flow with automatic progression and clear visual hierarchy
- Accessible color schemes (#46E870 green, #F23C3C red) with high contrast for visual feedback

### Performance Optimization
- Efficient API calls with proper error handling and retry logic
- Optimized image loading and caching with graceful degradation
- Minimal bundle sizes for fast loading on Reddit's platform

## 🚀 Deployment Guide

### Pre-Deployment Checklist
1. **Code Quality**: Execute `npm run check` to validate TypeScript, linting, and formatting
2. **Build Verification**: Run `npm run build` to ensure clean builds for client and server
3. **Testing**: Verify functionality with `npm run dev` and test in the playtest environment
4. **Audio Setup**: Ensure audio files are properly configured (see `AUDIO_SETUP_GUIDE.md`)

### Deployment Process
1. **Upload**: Deploy with `npm run deploy` to update your Reddit app
2. **Publishing**: Submit for review using `npm run launch`
3. **Monitoring**: Check app performance and user feedback after deployment

## 📈 Future Enhancements

### Planned Features
- **Science Category Content**: Addition of Science category image pairs to complete the 6-category system (infrastructure ready, awaiting image uploads)
- **Advanced Audio**: Extended sound library with additional sound effects and dynamic music system
- **Enhanced Achievement System**: Unlockable achievements and streak tracking
- **Community Features**: User-generated content and social interactions
- **Analytics Dashboard**: Detailed performance insights and statistics
- **Seasonal Events**: Special themed challenges and limited-time content
- **Advanced Leaderboards**: Category-specific rankings and streak tracking
- **Mobile App Integration**: Enhanced mobile experience with native app features
