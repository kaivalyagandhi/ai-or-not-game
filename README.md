# 🤖 Spot the Bot

**Can you tell AI from reality?**

Spot the Bot is an engaging daily challenge game built on Reddit's Devvit platform where players test their ability to distinguish between real photographs and AI-generated images. Each day brings a fresh set of image pairs across different categories, challenging users to identify which image was created by a human versus artificial intelligence.

## 🎯 Game Overview

This is a **React-based web game** that runs directly within Reddit posts using the Devvit platform. Players are presented with side-by-side image comparisons and must quickly identify which image is real versus AI-generated. The game features:

- **5 rounds per game** with 10-second time limits per round
- **5 image categories**: Animals, Architecture, Nature, Food, and Products  
- **Time-based scoring** that rewards both accuracy and speed
- **Daily challenges** with fresh content that resets at midnight UTC
- **Live leaderboards** with real-time updates and social sharing
- **Achievement system** with 4 different performance badges

## 🎮 What Makes This Game Unique

### Revolutionary AI Detection Challenge
- **Daily Fresh Content**: New image challenges every day at 00:00 UTC with randomized categories and AI placement across 5 different image categories (animals, architecture, nature, food, products)
- **Real-Time Competition**: Live participant counter and leaderboard rankings with immediate feedback using Devvit's Realtime API
- **Smart Scoring System**: Time-based scoring rewards both accuracy and speed, with bonus points for quick correct answers (0.01 points per millisecond remaining)
- **Cross-Platform Gaming**: Seamlessly integrated into Reddit's ecosystem, playable directly in posts on mobile and desktop

### Advanced Social Features
- **Achievement Badges**: Earn unique badges based on performance, from "AI Whisperer" (perfect score) to "Human in Training"
- **Live Leaderboards**: Real-time daily, weekly, and all-time rankings with live position updates
- **Social Sharing**: Share your results and challenge friends with detailed performance breakdowns using native sharing or clipboard
- **Community Integration**: Built natively for Reddit with automatic user authentication and social features

### Technical Innovation
- **Serverless Architecture**: Built on Devvit's modern serverless platform with Redis persistence for game state and leaderboards
- **Error Resilience**: Comprehensive error boundaries, network retry logic, and graceful offline handling with local caching
- **Mobile-First Design**: Responsive interface optimized for Reddit's mobile-heavy user base with touch-friendly controls
- **Real-Time Updates**: Live participant counting and leaderboard updates without page refreshes using WebSocket connections
- **Anti-Cheat Protection**: Server-side timer validation, rate limiting, and comprehensive input validation to ensure fair play
- **Offline Support**: Smart caching system allows viewing results and retrying failed requests when connection is restored
- **Progressive Enhancement**: Game works offline with cached data and gracefully handles network failures
- **Security-First Design**: Rate limiting, input sanitization, and abuse detection protect against cheating and spam

## 🚀 Technology Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform for immersive games
- **[React](https://react.dev/)**: Modern UI framework with TypeScript and hooks for state management
- **[Vite](https://vite.dev/)**: Fast build tool for client and server bundles
- **[Express](https://expressjs.com/)**: Backend API server with RESTful endpoints
- **[Redis](https://redis.io/)**: Data persistence, session management, and leaderboards
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first styling with responsive design
- **[TypeScript](https://www.typescriptlang.org/)**: Full type safety across the entire stack

## 🎯 How to Play

### Getting Started
1. **Find the Game**: Look for Spot the Bot posts in participating subreddits
2. **Launch**: Click the "Launch App" button to open the game in full-screen mode
3. **Welcome Screen**: View today's date, live participant count, and game instructions
4. **Start Playing**: Click "Start Playing" to begin your daily challenge

### Game Flow & Mechanics

#### Round Structure
- **5 Rounds Total**: Each game consists of exactly 5 image comparison rounds
- **Mixed Categories**: Images span animals, architecture, nature, food, and products
- **Side-by-Side Display**: Two images shown simultaneously - one real photo, one AI-generated
- **10-Second Timer**: You have exactly 10 seconds per round to make your choice
- **Visual Feedback**: Immediate feedback shows correct answer and whether you were right

#### Making Your Choice
1. **Study Both Images**: Look carefully at the details, textures, and realism
2. **Click to Select**: Click on the image you believe is the REAL photograph (not AI)
3. **Watch the Timer**: Green progress bar (6+ seconds), yellow (3-6 seconds), red (under 3 seconds)
4. **See Results**: After selection, the correct answer is revealed with visual overlays showing "Real Photo" vs "AI Generated"

#### Scoring System
- **Base Points**: Earn 1 point for each correct identification
- **Time Bonus**: Faster correct answers earn additional bonus points (0.01 points per millisecond remaining)
- **Maximum Score**: Perfect accuracy with quick responses yields the highest scores (up to 101 points per round)
- **Running Total**: Your score accumulates across all 5 rounds for a maximum possible score of 505 points

#### Badge System & Achievements
- 🧙‍♂️ **AI Whisperer**: Perfect score (5/5 correct) - You can spot AI from a mile away
- 😇 **Good Samaritan**: Great performance (4/5 correct) - You got most of them right  
- 🙂 **Just Human**: Solid effort (3/5 correct) - You're getting the hang of this
- 🤖 **Human in Training**: Keep practicing (≤2/5 correct) - AI is getting better every day

### Results & Competition

#### Final Results Screen
- **Score Breakdown**: See your total score, correct answers, and time bonus with detailed breakdown
- **Badge Display**: Your earned badge with description and emoji in a colored badge card
- **Leaderboard Position**: Your rank among all daily participants with live updates
- **Share Results**: Copy formatted results to clipboard or use native sharing with detailed stats

#### Leaderboard Features
- **Daily Rankings**: Compete against all players for the current day
- **Weekly & All-Time**: View broader competition across different time periods with tabbed interface
- **Live Updates**: Real-time position changes as other players complete games (indicated by "Live" status)
- **User Highlighting**: Your position is highlighted with special styling and "(You)" indicator

### Game Rules & Restrictions
- **One Game Per Day**: Each player can only participate once per 24-hour period (resets at 00:00 UTC)
- **No Retries**: Your first attempt is final - choose carefully and trust your instincts!
- **Fair Play**: Server-side validation ensures accurate timing and prevents cheating
- **Fresh Content**: New image sets generated daily for consistent challenge across all players
- **Auto-Save**: Progress is automatically saved, and results persist for sharing

### Tips for Success
- **Look for Details**: AI often struggles with fine details like text, hands, or complex textures
- **Trust Your Instincts**: Sometimes the "uncanny valley" feeling indicates AI generation
- **Work Quickly**: Time bonuses can significantly boost your score
- **Study Patterns**: Each category has different telltale signs of AI generation
- **Practice Daily**: Regular play helps you develop better AI detection skills

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
- **Game State Management**: React hooks with `useGameState` managing flow between splash, playing, results, and leaderboard screens
- **Real-Time Updates**: WebSocket connections via Devvit Realtime API for live participant counts and leaderboard updates
- **Timer System**: Client-side countdown with visual progress bar and server-side validation for fair play
- **Image Handling**: Responsive grid layout with hover effects, selection feedback, and result overlays
- **Score Calculation**: Time-based bonus system (0.01 points per millisecond) rewards quick accurate responses
- **Badge Assignment**: Automatic badge calculation based on correct answer count with visual badge cards
- **Social Sharing**: Native sharing API with clipboard fallback and formatted result messages
- **Error Resilience**: Comprehensive error boundaries, network retry logic, and offline caching via `useErrorHandler`
- **Leaderboard System**: Redis-based sorted sets with real-time updates and user rank tracking
- **Session Management**: Secure session handling with Redis persistence and anti-cheat validation
- **Network Optimization**: Smart retry logic with exponential backoff and offline detection

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

- Weekly and all-time leaderboards
- Real-time multiplayer competitions  
- Expanded image categories and difficulty levels
- Achievement system with unlockable content
- Community-generated image submissions
