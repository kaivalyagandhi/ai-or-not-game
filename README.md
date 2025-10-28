# 🤖 Spot the Bot

**Can you tell AI from reality?**

Spot the Bot is an engaging daily challenge game built on Reddit's Devvit platform where players test their ability to distinguish between real photographs and AI-generated images. Each day brings a fresh set of image pairs across different categories, challenging users to identify which image was created by a human versus artificial intelligence.

This interactive React-based game runs directly within Reddit posts, providing a seamless gaming experience with real-time leaderboards, achievement badges, social sharing features, and immersive audio. Players compete against the clock and each other in a daily test of visual perception and AI detection skills.

## 🎯 What is Spot the Bot?

Spot the Bot is a **daily visual challenge game** that tests your ability to distinguish between real photographs and AI-generated images. Built as a React web application that runs natively within Reddit posts using the Devvit platform, the game presents players with side-by-side image comparisons where they must identify which image is the REAL photograph (not the AI-generated one).

### Core Game Mechanics
- **6 rounds per game** with exactly 15 seconds per round
- **6 image categories**: Animals, Architecture, Nature, Food, Products, and Science
- **Side-by-side comparison**: Two images displayed simultaneously - one real, one AI-generated
- **Time-pressure scoring**: Faster correct answers earn higher scores with time bonuses (0.01 points per millisecond remaining)
- **Multiple attempts per day**: Players can attempt the challenge up to 2 times per day (unlimited in development mode)
- **Educational break**: After round 3, players receive AI detection tips and facts about AI image generation
- **Immediate feedback**: See the correct answer and explanation after each round with visual overlays (📸 Real Photo / 🤖 AI Generated)
- **Audio enhancement**: Background music and sound effects create an immersive gaming experience
- **Progressive difficulty**: Mixed categories and randomized AI placement keep players guessing

## 🎮 What Makes This Game Innovative

### Cutting-Edge AI Detection Challenge
- **Daily Fresh Content**: New image sets generated every day at 00:00 UTC with completely randomized categories, AI placement, and difficulty progression across 6 diverse image categories
- **Real-Time Social Competition**: Live participant counter shows how many players have attempted today's challenge, with real-time updates as new players join via Devvit's Realtime API
- **Intelligent Scoring Algorithm**: Sophisticated time-based scoring system rewards both accuracy (1 point per correct answer) and speed (0.01 bonus points per millisecond remaining), creating strategic tension between careful analysis and quick decisions
- **Educational Integration**: Midgame learning break after round 3 provides AI detection tips and fascinating facts about AI image generation with daily rotating content
- **Immersive Audio Experience**: Background music and contextual sound effects enhance gameplay with user-controlled volume and mute options, gracefully degrading when audio files are unavailable

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

## 🎯 Step-by-Step: How to Plat

### Getting Started
1. **Find the Game**: Look for Spot the Bot posts in participating subreddits or communities where the app is installed
2. **Launch the App**: Click the "Launch App" button in the Reddit post to open the game in full-screen webview mode
3. **Welcome Screen**: You'll see today's date, a live participant counter, your progress tracking, and basic game instructions
4. **Join the Challenge**: Click "Start Playing" to begin your daily challenge

### Complete Game Flow

#### Pre-Game Setup (n)
The splash screen welcomes you with:
- **Daily Challenge Display**: Shows the current date and live participant count with real-time upes
- **Your Progress Tracking**: Displays remaining attempts (out of 2 per day) and your best score from previous attempts
- **Game Rules Overview**: Clear instructions explaining the 6-round format, 15-second time limits, and scoring system

#### Round-by-Round Gameplay (6 Rounds Total)

**Each Round Structure:**
- **Category Display**: See which cacience)
- **Side-by-Side Images**: Two images displayed simultaneously - one real photograph, one AI-generated
- **15-Second Timer**: Color-coded countdown timer with progress bar:
  - **Green** (11-15 seconds): Plenty of time to analyze
  - **Yellow** (6-10 seconds): Time to make a decision  
  - **Red** (1-5 seconds): Choose quickly!

**Making Your Selection:**
s
2. **Click to Choose**: Click on the
3. **Immediate Feedback**: See the correct answer revealerlays:
   - Real photos show 📸 "Real Photo" overlay
   - AI images show 🤖 "AI Generated" overlay
4. **Score Display**: See whether you were correct (✅ Correct! or ❌ Incorrect) and your rounde
5. **Auto-Advance**: Game automatically moves to the next round after 2 seconds

ound 3)
Halfway through the game,ive:
- **AI Detection Tips**: Practical advice for spotting AI-generated images
- **AI Facts**: Fascinating insights about AI image generation technology
- **Daily Rotation**: New educational content provided each day
- **Continue Button**: "Continue to Round 4" to resume gameplay

#### Audio Experience (Optional)
- **Background Music**: Atmospheric music d)
- **Sound Effects**: Click sounds when selecting, success/failure sounds for feedback
- **Audio Controls**: 🎵 button in top-right corner to adjust volume or mute
e

#### Scoring System
- **Base Points**: 1 point for each correct identification
- **Time Bonus**: 0.01 bonus points per millisecond remaining when you answer correctly
- **Maximum Score**: ~16 points per round (1 base + ~15 time bonus for instant corr
- **Final Score**: Cumulative total across all 6 rounds with server-side validation

System
Your final performance determines your badge:
- 🤖 **AI Whisperer** (6/6 correct): "Perfect score! You can spot AI-generateacy"
- 🕵️ **AI Detective** (5/6 correct): "Outstanding! You have excellent skills at detecting AI-generated content"
- 👁️ **Good Samaritan** (4/6 correct): "Excellent work! You have a keen eye for distinguishing real from artificial"
- 👤 **Just Human** (3/6 correct): "Not bad! You're getting the hang of spotting AI-generated images"
- 🎓 **Human in Training** (≤2/6 correct): "Keep practicing! AI detection skill

s

#### Final Results Screen
After completing all 6 rounds:
- **Total Score**: Your final score with decimal precision (e.g., "87.45")
- **Performance Breakdown**: Correct answers (X/6) and total time bonus earned
- **Badge Achievement**: Large badge display with custom emoji, title, and description
s
- **Inspirational Content**: 

#### Social Sharing Options
**📤 Share Results**: Standard performance summary with score, badge, and rank
**👥 Challenge Friends**: Personalized message with friendly challenge invitation

Both modes support:
ile
- **Clipboard Fallback**: Auttification

#### Multi-Tier Leaderboastem
- **Daily Leaderboard**: Compete against all players for today (rese
- **Weekly Rankings**: Top performers over the past 7 days
- **All-Time Champions**: Highest scores since launch
- **Live Updates**: Real-time position changes with green "Live" indicator
- **Detailed Stats**: Username, score, correct count (✅ X/6), time bonus (⚡ +XX.XX), and badge emoji

### Game Rules & Fair Play

nge System
- **Multiple Attempts**: Up to 2 atteode)
- **UTC Reset**: New challenges available aight UTC
splayed
- **Session Persistence**: Must complete starteg)

#### Anti-Cheat Protection
- **Server-Side Timer Validation**: All 
ring
- **Rate Limiting**: Prevents spam and system abuse
- **Input Validation**: All user inputs sanitized andated

### Pro Tips for Success

ques
- **Detail Insp
- **Lighting Consistency**: Look for unnatural lighting, impossible s
- **Geometric Logic**: Check for impossible architecture, floating objects, or perspective errors
- **Human Elements**: Pay special attention to faces, hands, and human interactions -

#### Strategic Gameplay
- **Trust Your Instincts**: The "uncanny valley" feeling is often a reliable AI indicator
- **Balance Speed vs. Accuracy**: Time bonuses are significantre
- **Category-Specific Patterns**: Each category has different AI tells:
  - **Animals**: Unnatural fur patterns, impossible anatomy, weird eyes
  - **Architecture**: Impossible geometry, floating elements, inconsistent perspective
  - **Nature**: Too-perfect landscapes, impossible weather combinations
  - **Food**: Perfect textures, impossible arrangements, unnatural lighting

  - **Science**: Impossiblres

#### Daily Practice Benefits
- **Pattern Recognition**: Regular play helps you develop better AI detection skills over time
- **Speed Improvement**: Practice helps you make faster, more confident decisionsure
- **Category Familiarity**: Learn the specific tells and patterns for each image categor
- **Competitive Edge**: Consistent play helps you climb the weekly and all-time leaderboards



### ✅ Fully Implemented Features
- **Core Gameplay**: 6 rounds with 15-second timers and comprehensive scoring system
- **Educational System**: Midgame learning breaks with daily rotcts
- **Audio Integration**: Background music, sound effects, and user controls witon
- **Real-time Features**: Live participant counting and leaderboard updates via Devvit Realtime API

- **Content Management**: Daily rotatfallbacks
- **Error Handling**: Comprehensive error boundaries, retry logic, and offline support
- **Mobile Optimization**: Touch-friendly responsive design optimized for Reddit's mobile users
- **Session Management**: Secure game state persistence with Redis and local storage caching
- **Play Limit System**: Multiple daily attempts (2 per day) with best score tracking gement

- **Progress Tracking**:

### 🚧 In Development
- **Science Category**: Image content for the 6th category (infrastructure ready, awaiting image uploads)

### 📋 Planned Features
- **Advanced Audio**: Extended sound library and dynamic music system
- **Community Features**: User-generated content and social interactions


## 🚀 Technology Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform f
- **[React](https://react.dev/)**: Modern UI framework with TypeScript and hooks for snt
- **[Vite](https://vite.dev/)**: Fast build tool for client and server bundles
- **[Express](https://expressjs.com/)**: Backend API server with RESTful endpoints
- **[Redis](https://redis.io/)**: Data persistence, session management, andrds
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first styling with respoign
- **[TypeScript](https://www.typescriptlang.org/)**: Full type safety across the entire stack

## 🛠️ Development Setup

### Prerequisites
- **Node.js 22+**: Required for Devvit compatibility
- **Reddit Account**: Connected to Reddit Developers platform
ticated

rt
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
dit
- `npm run launch`: Poval
- `npm run login`: Authenticate Devvit CLI with Reddit account

### Individual Builds
- `npm run build:client`: Build only the React frontend
- `npm run build:server`: Build only the Express backend



re
```
src/
├── client/          # React frontend (runs in Reddit webview)
│   ├── components/  # Game UI components
│   │   ├── SplashScreen.tsx      # Welcome screen with live participant count
│   │   ├── GameRound.tsx         # Image comparison interface with timer
│   │   ├── EducationalContent.tsx # Midgame learning break with tips and facts
ty
│   │   ├── LeaderboardTabs.ts updates
ent
│   │   ├── Loading
│   │   └── ErrorBoundary.tsx     # Error handling and recovery
│   ├── hooks/       # Custom React hooks
│   │   ├── useGameState.ts       # Main game state management
│   │   ├── useErrorHandler.ts    # Error handling with retry logic
ion
│   │   └── useCounterook
es
│   │   ├── network.tdling
│   │   ├── storage.ts            # Local storage and caching
│   │   ├── content.ts            # Educational and inspirational content loading
│   │   ├── audio.ts              # Audio context management
│   │   ├── audioDevTools.ts      # Audio development and debugging tools
│   │   └── audioValidation.ts    # Audio file validation utilities
│   ├── App.tsx      # Main game container with routing
t
├── server/          # Express back
│   ├── core/        # Game logic ant
│   │   ├── game-logic.ts         # Core game mechanics
│   │   ├── leaderboard-manager.ts # Leaderboard operations
│   │   ├── session-manager.ts    # User session handling
│   │   ├── daily-game-manager.ts # Daily content management
│   │   ├── content-manager.ts    # Educational and inspirational content
agement
│   │   ├── image-manager.tsion
ystem
│   ├── middleware/  # Server middleware
│   └── index.ts     # API endpoints and Devvit integration
└── shared/          # TypeScript types used by both client and server
    └── types/       # Game data models and API interfaces
```

### Key Features Implementation

- **Educational System**:ts`
- **Audio Integration**: Comprehensive audio system with background music, sound effec` hook
- **Real-Time Updates**: Realtime connections via Devvit Realtime API for live participant counts and leaderboard updan
- **Timer System**: Client-side countdown with color-coded visual progress bar (green/yellow/red) and sends)
- **Image Handling**: Responsive aspect-square grid layout with hover effects,s
- **Score Calculation**: Time-based bonus system (0.01 pounds
- **Badge Assignment**: Automatic badge calculation bastions
- **Content Management**: Daily rotating ed
- **Social Sharing**: Native sharing API with clipboard fallback and formatted result messages
- **Error Resilience**: Comprehensive error boundaries, network retry logic with exponential backoff, offline drHandler`

- **Session Management
- **Network Optimization**: Smart retry logic with exponential backoff, offline detec
- **Loading States**: Comprehensive loading screens, skeleton states, progress indicators, and ourney
- **Offline Support**: Local caching system for game data, results viewing, cached leaderboards

## 🎨 Design Philosophy

proach
- Responsive grid layouts that work on all scre
- Touch-friendly button sizes and hover states
- Optimized image loading and display for mobile networks

### User Experience Focus
- Clear visual feedback for all interactions
- Smooth transitions and loading states

- Accessible color schemes anhy

### Performance Optimization
- Efficient API calls with proper error handling
- Optimized image loading and caching
- Minimal bundle sizes for fast loading on Reddit

## 🔧 Cursor Integration

This project includes pre-configured Cursor IDE integration. To get started:
1. [Download Cursor](https://www.cursor.com/downloads)
2. Enable the `devvit-mcp` when prompted
3. Enjoy enhanced development experience with AI assistance

 Guide

tegration
2. **Build Verification**uilds
3. **Code Quality**: Execute `npm run check` to validate code standards
4. **Upload**: Deploy with `npm run deploy` to update your Reddit app
5. **Publishing**: Submit for review using `npm run launch`

## 📈 Future Enhancements

- **Science Category Content**: Addition of Science category image pairs to complete the 6-category system
- **Advanced Audio**: Additional sound effects and music tracks for enhanced audio experience

- **Achievement System**: Unlockable s
- **Community Features**: User-generated imy voting
ses
- **Analytics Dashboard**: Detailed performancehts
- **Seasonal Events**: Special themed challenges and limit
- **Advanced Leaderboards**: Category-specific rankings ng trackiand streak
