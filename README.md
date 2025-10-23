# 🤖 Spot the Bot

**Can you tell AI from reality?**

Spot the Bot is an engaging daily challenge game built on Reddit's Devvit platform where players test their ability to distinguish between real photographs and AI-generated images. Each day brings a fresh set of image pairs across different categories, challenging users to identify which image was created by a human versus artificial intelligence.

This interactive React-based game runs directly within Reddit posts, providing a seamless gaming experience with real-time leaderboards, achievement badges, and social sharing features. Players compete against the clock and each other in a daily test of visual perception and AI detection skills.

## 🎯 What is Spot the Bot?

Spot the Bot is a **daily visual challenge game** that tests your ability to distinguish between real photographs and AI-generated images. Built as a React web application that runs natively within Reddit posts using the Devvit platform, the game presents players with side-by-side image comparisons where they must identify which image is authentic.

### Core Game Mechanics
- **5 rounds per game** with exactly 10 seconds per round
- **5 image categories**: Animals, Architecture, Nature, Food, and Products
- **Side-by-side comparison**: Two images displayed simultaneously - one real, one AI-generated
- **Time-pressure scoring**: Faster correct answers earn higher scores with time bonuses (0.01 points per millisecond remaining)
- **One attempt per day**: Each player gets exactly one chance per 24-hour period (resets at 00:00 UTC)
- **Immediate feedback**: See the correct answer and explanation after each round with visual overlays
- **Progressive difficulty**: Mixed categories and randomized AI placement keep players guessing

## 🎮 What Makes This Game Revolutionary

### Cutting-Edge AI Detection Challenge
- **Daily Fresh Content**: New image sets generated every day at 00:00 UTC with completely randomized categories, AI placement, and difficulty progression across 5 diverse image categories
- **Real-Time Social Competition**: Live participant counter shows how many players have attempted today's challenge, with real-time updates as new players join via Devvit's Realtime API
- **Intelligent Scoring Algorithm**: Sophisticated time-based scoring system rewards both accuracy (1 point per correct answer) and speed (0.01 bonus points per millisecond remaining), creating strategic tension between careful analysis and quick decisions
- **Cross-Platform Integration**: Seamlessly embedded within Reddit's ecosystem, playable directly in posts on mobile and desktop with responsive design optimized for touch and mouse interactions

### Advanced Social & Community Features
- **Dynamic Achievement System**: Earn performance-based badges with custom emoji and descriptions:
  - 🧙‍♂️ **AI Whisperer** (5/5 correct): "Perfect score! You can spot AI from a mile away"
  - 😇 **Good Samaritan** (4/5 correct): "Great job! You got most of them right"
  - 🙂 **Just Human** (3/5 correct): "Not bad! You're getting the hang of this"
  - 🤖 **Human in Training** (≤2/5 correct): "Keep practicing! AI is getting better every day"
- **Multi-Tier Live Leaderboards**: Real-time daily, weekly, and all-time rankings with live position updates, user highlighting, and total participant tracking
- **Smart Social Sharing**: Native sharing API integration with clipboard fallback, generating formatted result messages with detailed performance breakdowns for social media
- **Community-Driven Competition**: Built natively for Reddit with automatic user authentication, username display, and seamless social features

### Technical Innovation & User Experience
- **Serverless Architecture**: Built on Devvit's modern serverless platform with Redis persistence for game state, session management, and leaderboard data
- **Comprehensive Error Resilience**: Advanced error boundaries, network retry logic with exponential backoff, offline detection, and graceful degradation with local caching
- **Mobile-First Responsive Design**: Touch-optimized interface with adaptive layouts, hover states, and gesture-friendly controls designed for Reddit's mobile-heavy user base
- **Real-Time Updates**: Live participant counting, leaderboard position changes, and rank updates without page refreshes using Devvit's Realtime API
- **Anti-Cheat Protection**: Server-side timer validation, rate limiting, session integrity checks, and comprehensive input validation to ensure fair play
- **Progressive Web App Features**: Offline support with smart caching, pending request queuing, and automatic retry when connection is restored
- **Accessibility & Performance**: Optimized loading states, skeleton screens, error recovery, and comprehensive keyboard navigation support

## 🚀 Technology Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform for immersive games
- **[React](https://react.dev/)**: Modern UI framework with TypeScript and hooks for state management
- **[Vite](https://vite.dev/)**: Fast build tool for client and server bundles
- **[Express](https://expressjs.com/)**: Backend API server with RESTful endpoints
- **[Redis](https://redis.io/)**: Data persistence, session management, and leaderboards
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first styling with responsive design
- **[TypeScript](https://www.typescriptlang.org/)**: Full type safety across the entire stack

## 🎯 How to Play Spot the Bot

### Getting Started
1. **Find the Game**: Look for Spot the Bot posts in participating subreddits or communities where the app is installed
2. **Launch the App**: Click the "Launch App" button in the Reddit post to open the game in full-screen webview mode
3. **Welcome Screen**: You'll see today's date, a live participant counter showing how many players have attempted today's challenge, and basic game instructions
4. **Join the Challenge**: Click "Start Playing" to begin your daily challenge and join the live participant count

### Complete Game Flow

#### Pre-Game Setup (Splash Screen)
- **Daily Challenge Display**: The splash screen shows the current date formatted as "Wednesday, October 23, 2025" and live participant count with real-time updates via Devvit's Realtime API
- **Live Participant Counter**: Real-time counter showing total players who have attempted today's challenge, with a green "Live" indicator when connected
- **Game Rules Overview**: Clear instructions explaining the 5-round format, 10-second time limits, and scoring system
- **One-Time Daily Access**: The game automatically checks if you've already played today - if so, you'll see your previous results instead of starting a new game

#### Round-by-Round Gameplay

**Round Structure (5 Total Rounds)**
- Each game consists of exactly 5 image comparison rounds
- Categories are mixed across: Animals, Architecture, Nature, Food, and Products
- Category labels are displayed at the top of each round (e.g., "Category: animals")
- Images are presented side-by-side in a responsive grid layout with aspect-square containers
- One image is a real photograph, one is AI-generated (positions are randomized between A and B)
- Round progress is shown as "Round X of 5" at the top

**Making Your Selection**
1. **Analyze Both Images**: You have exactly 10 seconds to study both images carefully
2. **Look for AI Tells**: Check for unnatural lighting, impossible geometry, weird textures, or uncanny valley effects
3. **Click to Choose**: Click on the image you believe is the REAL photograph (not the AI-generated one)
4. **Timer Pressure**: Watch the color-coded countdown timer and progress bar:
   - **Green** (7-10 seconds): Plenty of time to analyze
   - **Yellow** (4-6 seconds): Time to make a decision
   - **Red** (1-3 seconds): Choose quickly!
5. **Automatic Timeout**: If time runs out, the game automatically selects option A as default

**Immediate Feedback**
- After selection, the correct answer is revealed with visual overlays on both images
- Real photos show 📸 "Real Photo" overlay with white text on black semi-transparent background
- AI images show 🤖 "AI Generated" overlay with white text on black semi-transparent background
- You see whether you were correct (✅ Correct! or ❌ Incorrect) and your round score
- Selected images get a blue border and scale effect, correct answers get green borders
- The game automatically advances to the next round after 2 seconds

#### Scoring System Explained
- **Base Points**: 1 point for each correct identification
- **Time Bonus**: 0.01 bonus points per millisecond remaining when you answer correctly
- **Maximum Possible**: ~101 points per round (1 base + ~100 time bonus for instant correct answers)
- **Running Total**: Your cumulative score is tracked across all 5 rounds
- **Server Validation**: All timing is validated server-side with tolerance for network delays to prevent cheating

#### Achievement Badge System
Your final performance determines your badge with custom colors and descriptions:
- 🧙‍♂️ **AI Whisperer** (5/5 correct): "Perfect score! You can spot AI from a mile away" - Purple badge
- 😇 **Good Samaritan** (4/5 correct): "Great job! You got most of them right" - Blue badge
- 🙂 **Just Human** (3/5 correct): "Not bad! You're getting the hang of this" - Green badge
- 🤖 **Human in Training** (≤2/5 correct): "Keep practicing! AI is getting better every day" - Gray badge

### Results & Social Features

#### Final Results Screen
After completing all 5 rounds, you'll see a celebration screen with:
- **Total Score**: Your final score displayed prominently with decimal precision (e.g., "87.45")
- **Performance Breakdown**: Grid showing correct answers (X/5) and total time bonus earned (+XX.XX)
- **Badge Achievement**: Large badge display with custom emoji, title, and personalized description
- **Live Leaderboard Position**: Your current rank among all daily participants with real-time updates and "Live" indicator
- **Action Buttons**: Share Results, View Leaderboard, and Back to Home options

#### Multi-Tier Leaderboard System
- **Daily Leaderboard**: Compete against all players for the current day (resets at 00:00 UTC)
- **Weekly Rankings**: See top performers over the past 7 days
- **All-Time Champions**: View the highest scores since the game launched
- **Live Updates**: Real-time position changes as other players complete games with green "Live" indicator
- **User Highlighting**: Your position is highlighted with indigo background and "(You)" label
- **Detailed Stats**: Each entry shows username, score, correct count (✅ X/5), time bonus (⚡ +XX.XX), and badge emoji
- **Rank Display**: Top 3 get medal emojis (🥇🥈🥉), others show numerical rank

#### Social Sharing Features
- **Native Sharing**: Uses device's built-in sharing API on mobile devices
- **Clipboard Fallback**: Automatically copies formatted results if native sharing isn't available
- **Formatted Share Messages**: Generated text includes:
  ```
  🤖 Spot the Bot - Daily Challenge Results 🤖
  
  📊 Score: 87.45 points
  ✅ Correct: 4/5
  ⚡ Time Bonus: +37.45
  🏆 Badge: 😇 Good Samaritan
  📈 Rank: #15 of 1,247 players
  
  Can you beat my score? Try today's challenge!
  #SpotTheBot #AIChallenge
  ```
- **Toast Notifications**: "Results copied to clipboard!" confirmation with checkmark

### Game Rules & Fair Play

#### Daily Challenge Restrictions
- **One Attempt Per Day**: Each Reddit user can play exactly once per 24-hour period
- **UTC Reset Schedule**: New challenges become available at 00:00 UTC (midnight)
- **No Retries**: Your first and only attempt is final - make it count!
- **Session Persistence**: If you start a game, you must complete it (no abandoning and restarting)
- **Automatic Resume**: If you've already played today, the game shows your completed results

#### Anti-Cheat & Fair Play Systems
- **Server-Side Timer Validation**: All timing is verified on the server with 3-second tolerance for network delays
- **Session Integrity Checks**: Game state is validated to prevent tampering with rounds or scores
- **Rate Limiting**: Prevents spam and abuse of the game systems
- **Input Validation**: All user inputs are sanitized and validated server-side
- **Network Resilience**: Game handles network issues gracefully with retry logic and fallback responses

#### Technical Features for Fair Play
- **Offline Support**: View previous results and cached data when offline with "Using cached data (offline)" indicators
- **Error Recovery**: Comprehensive error handling with retry logic, exponential backoff, and fallback mechanisms
- **Session Management**: Game state is preserved in local storage and Redis across browser refreshes
- **Progressive Enhancement**: Core functionality works even with limited connectivity

### Pro Tips for Success

#### Visual Analysis Techniques
- **Detail Inspection**: AI often struggles with fine details like text, hands, reflections, or complex textures
- **Lighting Consistency**: Look for unnatural lighting, impossible shadows, or inconsistent light sources
- **Geometric Logic**: Check for impossible architecture, floating objects, or perspective errors
- **Texture Realism**: AI-generated textures can appear too perfect or have subtle repetitive patterns
- **Human Elements**: Pay special attention to faces, hands, and human interactions - AI's biggest weakness

#### Strategic Gameplay
- **Trust Your Instincts**: The "uncanny valley" feeling is often a reliable indicator of AI generation
- **Balance Speed vs. Accuracy**: Time bonuses are significant, but accuracy is more important for overall score
- **Category-Specific Patterns**: Each image category has different AI tells:
  - **Animals**: Unnatural fur patterns, impossible anatomy, weird eyes or expressions
  - **Architecture**: Impossible geometry, floating elements, inconsistent perspective
  - **Nature**: Too-perfect landscapes, impossible weather combinations, unnatural colors
  - **Food**: Perfect textures, impossible arrangements, unnatural lighting
  - **Products**: Too-perfect surfaces, impossible reflections, uncanny branding

#### Daily Practice Benefits
- **Pattern Recognition**: Regular play helps you develop better AI detection skills over time
- **Speed Improvement**: Practice helps you make faster, more confident decisions under time pressure
- **Category Familiarity**: Learn the specific tells and patterns for each image category
- **Competitive Edge**: Consistent play helps you climb the weekly and all-time leaderboards

## 🛠️ Development Setup

### Prerequisites
- **Node.js 22+**: Required for Devvit compatibility
- **Reddit Account**: Connected to Reddit Developers platform
- **Devvit CLI**: Installed and authenticated

### Quick Start
1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start development server
4. Open the provided playtest URL in your browser

## 📋 Available Commands

### Development
- `npm run dev`: Start development server with live Reddit integration
- `npm run build`: Build client and server bundles for production
- `npm run check`: Run type checking, linting, and code formatting

### Deployment
- `npm run deploy`: Upload new version to Reddit
- `npm run launch`: Publish app for Reddit review and approval
- `npm run login`: Authenticate Devvit CLI with Reddit account

### Individual Builds
- `npm run build:client`: Build only the React frontend
- `npm run build:server`: Build only the Express backend

## 🏗️ Project Architecture

### Folder Structure
```
src/
├── client/          # React frontend (runs in Reddit webview)
│   ├── components/  # Game UI components
│   │   ├── SplashScreen.tsx      # Welcome screen with live participant count
│   │   ├── GameRound.tsx         # Image comparison interface with timer
│   │   ├── ResultsScreen.tsx     # Score display and sharing functionality
│   │   ├── LeaderboardTabs.tsx   # Tabbed leaderboard with live updates
│   │   ├── LoadingScreen.tsx     # Loading states and error boundaries
│   │   └── ErrorBoundary.tsx     # Error handling and recovery
│   ├── hooks/       # Custom React hooks
│   │   ├── useGameState.ts       # Main game state management
│   │   ├── useErrorHandler.ts    # Error handling with retry logic
│   │   └── useCounter.ts         # Utility counter hook
│   ├── utils/       # Client utilities
│   │   ├── network.ts            # Network requests with retry and error handling
│   │   └── storage.ts            # Local storage and caching
│   ├── App.tsx      # Main game container with routing
│   └── main.tsx     # React application entry point
├── server/          # Express backend (Reddit integration)
│   ├── core/        # Game logic and data management
│   │   ├── game-logic.ts         # Core game mechanics
│   │   ├── leaderboard-manager.ts # Leaderboard operations
│   │   ├── session-manager.ts    # User session handling
│   │   ├── daily-game-manager.ts # Daily content management
│   │   └── badge-manager.ts      # Achievement system
│   ├── middleware/  # Server middleware
│   └── index.ts     # API endpoints and Devvit integration
└── shared/          # TypeScript types used by both client and server
    └── types/       # Game data models and API interfaces
```

### Key Features Implementation
- **Game State Management**: React hooks with `useGameState` managing flow between splash, playing, results, and leaderboard screens with comprehensive state validation and automatic session recovery
- **Real-Time Updates**: Realtime connections via Devvit Realtime API for live participant counts and leaderboard updates with connection status indicators and automatic reconnection
- **Timer System**: Client-side countdown with color-coded visual progress bar (green/yellow/red) and server-side validation with 3-second tolerance for network delays
- **Image Handling**: Responsive aspect-square grid layout with hover effects, selection feedback, visual result overlays (📸/🤖), and mobile-optimized touch controls
- **Score Calculation**: Time-based bonus system (0.01 points per millisecond) rewards quick accurate responses with server-side validation and fallback scoring
- **Badge Assignment**: Automatic badge calculation based on correct answer count with visual badge cards, custom colors, emoji, and personalized descriptions
- **Social Sharing**: Native sharing API with clipboard fallback and formatted result messages including detailed performance breakdown and challenge invitation
- **Error Resilience**: Comprehensive error boundaries, network retry logic with exponential backoff, offline detection, and graceful degradation via `useErrorHandler`
- **Leaderboard System**: Redis-based sorted sets with real-time updates, user rank tracking, live position changes, and multi-tier rankings (daily/weekly/all-time)
- **Session Management**: Secure session handling with Redis persistence, local storage caching, anti-cheat validation, and automatic cleanup
- **Network Optimization**: Smart retry logic with exponential backoff, offline detection, pending request queuing, and graceful degradation
- **Loading States**: Comprehensive loading screens, skeleton states, progress indicators, and smooth transitions throughout the user journey
- **Offline Support**: Local caching system for game data, results viewing, cached leaderboards, and pending request queuing for when connection is restored

## 🎨 Design Philosophy

### Mobile-First Approach
- Responsive grid layouts that work on all screen sizes
- Touch-friendly button sizes and hover states
- Optimized image loading and display for mobile networks

### User Experience Focus
- Clear visual feedback for all interactions
- Smooth transitions and loading states
- Intuitive navigation flow from start to finish
- Accessible color schemes and typography

### Performance Optimization
- Efficient API calls with proper error handling
- Optimized image loading and caching
- Minimal bundle sizes for fast loading on Reddit

## 🔧 Cursor Integration

This project includes pre-configured Cursor IDE integration. To get started:
1. [Download Cursor](https://www.cursor.com/downloads)
2. Enable the `devvit-mcp` when prompted
3. Enjoy enhanced development experience with AI assistance

## 🚀 Deployment Guide

1. **Development Testing**: Use `npm run dev` for local testing with Reddit integration
2. **Build Verification**: Run `npm run build` to ensure clean production builds
3. **Code Quality**: Execute `npm run check` to validate code standards
4. **Upload**: Deploy with `npm run deploy` to update your Reddit app
5. **Publishing**: Submit for review using `npm run launch`

## 📈 Future Enhancements

- Expanded image categories and difficulty levels
- Real-time multiplayer competitions  
- Achievement system with unlockable content
- Community-generated image submissions
- Advanced AI detection tutorials and training modes
