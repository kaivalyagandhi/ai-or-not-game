# 🤖 Spot the Bot

**Can you tell AI from reality?**

Spot the Bot is an engaging daily challenge game built on Reddit's Devvit platform where players test their ability to distinguish between real photographs and AI-generated images. Each day brings a fresh set of image pairs across different categories, challenging users to identify which image was created by a human versus artificial intelligence.

## 🎮 What Makes This Game Unique

- **Daily Fresh Content**: New image challenges every day at 00:00 UTC with randomized categories and AI placement
- **Real-Time Competition**: Live participant counter and leaderboard rankings with immediate feedback
- **Smart Scoring System**: Time-based scoring rewards both accuracy and speed, with bonus points for quick correct answers
- **Achievement Badges**: Earn unique badges based on performance, from "AI Whisperer" (perfect score) to "Human in Training"
- **Social Sharing**: Share your results and challenge friends with detailed performance breakdowns
- **Mobile-Optimized**: Responsive design works seamlessly on both desktop and mobile Reddit

## 🚀 Technology Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform for immersive games
- **[React](https://react.dev/)**: Modern UI framework with TypeScript
- **[Vite](https://vite.dev/)**: Fast build tool for client and server
- **[Express](https://expressjs.com/)**: Backend API server
- **[Redis](https://redis.io/)**: Data persistence and leaderboards
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first styling
- **[TypeScript](https://www.typescriptlang.org/)**: Full type safety across the stack

## 🎯 How to Play

### Game Flow
1. **Welcome Screen**: View today's date, current participant count, and game instructions
2. **Daily Challenge**: Complete 5 rounds of image comparison across different categories
3. **Results & Sharing**: See your score, badge, leaderboard position, and share your results

### Detailed Instructions

#### Round Structure
- **5 Rounds Total**: Each game consists of exactly 5 image comparison rounds
- **Mixed Categories**: Images span animals, architecture, nature, food, and products
- **Side-by-Side Comparison**: Two images displayed - one real photo, one AI-generated
- **10-Second Timer**: You have 10 seconds per round to make your choice

#### Scoring System
- **Base Points**: Earn points for each correct identification
- **Time Bonus**: Faster correct answers earn additional bonus points
- **Maximum Score**: Perfect accuracy with quick responses yields the highest scores

#### Badge System
- 🧙‍♂️ **AI Whisperer**: Perfect score (5/5 correct) - You can spot AI from a mile away
- 😇 **Good Samaritan**: Great performance (4/5 correct) - You got most of them right  
- 🙂 **Just Human**: Solid effort (3/5 correct) - You're getting the hang of this
- 🤖 **Human in Training**: Keep practicing (≤2/5 correct) - AI is getting better every day

#### Leaderboard & Competition
- **Daily Rankings**: Compete against all players for the day
- **Real-Time Updates**: See your position among today's participants
- **Social Sharing**: Share detailed results including score, badge, and rank

### Game Rules
- **One Game Per Day**: Each player can only participate once per 24-hour period
- **No Retries**: Your first attempt is final - choose carefully!
- **Fair Play**: Server-side validation ensures accurate timing and prevents cheating
- **Fresh Content**: New image sets generated daily for consistent challenge

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
│   │   ├── SplashScreen.tsx    # Welcome screen with participant count
│   │   ├── GameRound.tsx       # Image comparison interface
│   │   └── ResultsScreen.tsx   # Score display and sharing
│   ├── App.tsx      # Main game state management
│   └── main.tsx     # React application entry point
├── server/          # Express backend (Reddit integration)
│   ├── core/        # Game logic and data management
│   └── index.ts     # API endpoints and Devvit integration
└── shared/          # TypeScript types used by both client and server
    └── types/       # Game data models and API interfaces
```

### Key Features Implementation
- **Game State Management**: React hooks manage game flow between splash, playing, and results screens
- **Real-Time Updates**: Polling-based participant counter with 5-second refresh intervals
- **Timer System**: Client-side countdown with server-side validation for fair play
- **Image Handling**: Responsive design with hover effects and feedback overlays
- **Score Calculation**: Time-based bonus system rewards quick accurate responses
- **Badge Assignment**: Automatic badge calculation based on correct answer count
- **Social Sharing**: Native sharing API with clipboard fallback for cross-platform compatibility

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
