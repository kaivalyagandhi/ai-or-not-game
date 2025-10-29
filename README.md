# 🤖 Spot the Bot

**Can you tell AI from reality?**

Spot the Bot is an engaging daily challenge game built on Reddit's Devvit platform where players test their ability to distinguish between real photographs and AI-generated images. Each day brings a fresh set of 6 image pairs across 5 active categories (Animals, Architecture, Nature, Food, Products) with a 6th category (Science) in development, challenging users to identify which image is the REAL photograph (not AI-generated).

This interactive React-based game runs directly within Reddit posts, providing a seamless gaming experience with real-time leaderboards, achievement badges, social sharing features, simplified audio controls, and a revolutionary image magnification system. Players compete against a 10-second timer each round and against each other in a daily test of visual perception and AI detection skills, with up to 2 attempts per day to achieve their best score.

The game features a responsive mobile-first design optimized for Reddit's viewing experience, enhanced visual feedback with custom overlay indicators, simplified audio controls with one-click toggle functionality, comprehensive educational content system with midgame learning breaks, advanced timeout handling with extended learning opportunities, revolutionary image magnification for detailed inspection, and smooth animated transitions throughout the user experience.

## 🎯 What is Spot the Bot?

**Spot the Bot** is a daily AI detection challenge game that tests your ability to distinguish between real photographs and AI-generated images. Built natively for Reddit using the Devvit platform, the game runs directly within Reddit posts and challenges players to identify which of two images is the REAL photograph (not AI-generated) across 6 rounds with 10-second timers.

### What the Game Does
The game presents players with pairs of images - one real photograph and one AI-generated image - across six different categories (Animals, Architecture, Nature, Food, Products, Science). Players must quickly identify which image is real while competing against a 10-second timer. The game features:

- **Interactive Magnification**: Revolutionary 2.5x zoom system allowing detailed inspection of images with Canvas-based rendering and intelligent performance monitoring
- **Educational Integration**: Midgame learning breaks with AI detection tips and fascinating facts about AI technology, randomly selected from comprehensive libraries (50+ tips, 50+ facts)
- **Real-Time Competition**: Live leaderboards and participant tracking with multiple daily attempts (up to 2 per day)
- **Enhanced Audio Experience**: Background music and sound effects with simplified one-click controls and balanced audio levels
- **Responsive Design**: Mobile-first interface optimized for Reddit's viewing experience with 480px breakpoint
- **Social Features**: Enhanced sharing capabilities to challenge friends with personalized messages and improvement tracking

**Key Features:**
- **Daily Fresh Content**: New image pairs generated every day across 5 active categories (Animals, Architecture, Nature, Food, Products) with Science category in development
- **Educational Integration**: Midgame learning breaks with AI detection tips and fascinating facts about AI image generation, randomly selected from comprehensive libraries (50+ tips, 50+ facts)
- **Real-Time Competition**: Live leaderboards with daily, weekly, and all-time rankings, plus up to 2 attempts per day with best score tracking
- **Enhanced Audio Experience**: Background music and sound effects with simple one-click toggle controls (🎵/🔇), enhanced sound effects at 1.8x volume for clarity, balanced background music at 0.15x volume, and smart audio context management
- **Revolutionary Image Magnification**: Hover over images to see a 2.5x magnified circular view that follows your cursor, perfect for examining fine details and AI artifacts with high-performance Canvas rendering and intelligent performance monitoring
- **Reddit-Native Experience**: Seamless integration with Reddit accounts, no external apps or logins required
- **Mobile-Optimized Design**: Responsive layout with vertical image stacking on mobile, transitioning to side-by-side at 480px breakpoint for optimal Reddit feed viewing
- **Custom Visual Feedback**: Overlay indicators with colored circles, icons (✕ for AI, ✓ for Human), and clear labels show image sources
- **Enhanced Border Styling**: Color-coded borders with glow effects - green (#46E870) for correct answers, red (#F23C3C) for incorrect answers

## 🎯 Current Game Status

**Fully Functional & Production Ready** ✅

The game is complete and ready for players with all core systems implemented and recently enhanced with performance optimizations:
- **6-round gameplay** with 10-second timers and tier-based whole-number scoring system
- **5 active image categories** (Animals, Architecture, Nature, Food, Products) with Science category in development
- **Advanced timeout handling** with server-side processing, 3-second animated countdown, and extended learning feedback
- **Optimized audio system** with one-click toggle controls (🎵/🔇), enhanced sound effects at 1.8x volume (recently reduced for better balance), balanced background music at 0.15x volume (recently reduced from 0.3x) for clarity, smart audio context management, and immediate session-start background music
- **Educational content system** with fresh AI detection tips and facts randomly loaded from comprehensive libraries (50+ tips, 50+ facts)
- **Real-time features** including live participant counts, leaderboard updates, and "Live" indicators via Devvit Realtime API
- **Enhanced visual feedback** with loading states during answer processing, prominent score display in header area, custom overlay indicators (✕ for AI, ✓ for Human), colored borders with glow effects, and responsive mobile-first design
- **Revolutionary image magnification** with 2.5x zoom capability, performance-optimized Canvas rendering, intelligent performance monitoring with exponential moving average FPS calculation, and graceful degradation on low-performance devices
- **Smooth animated transitions** with staggered reveal animations on results screen for enhanced user experience
- **Multiple daily attempts** (2 per day) with best score tracking, improvement notifications, and streamlined "Play Again" button
- **Comprehensive error handling** with offline support, retry logic with exponential backoff, and graceful degradation
- **Improved UI organization** with combined round/category labels, cleaner date display, and Reddit-optimized responsive layout

## 🎮 Game Overview

Spot the Bot is a **daily visual challenge game** that tests your ability to distinguish between real photographs and AI-generated images. Built as a React web application that runs natively within Reddit posts using the Devvit platform, the game presents players with image comparisons where they must identify which image is the REAL photograph (not the AI-generated one).

The game features a modern, streamlined interface with dynamic date display that automatically shows the current date in a clean format on both the splash screen and results screen. Players experience enhanced visual feedback throughout their journey, from the initial splash screen through the final results display, with custom overlay indicators, colored borders, smooth loading states, and simplified audio controls that provide immediate feedback on their choices.

### Core Game Mechanics
- **6 rounds per game** with exactly 10 seconds per round and immediate visual feedback
- **5 active image categories**: Animals, Architecture, Nature, Food, Products (with Science category in development)
- **Reddit-optimized responsive design**: Images displayed in a responsive grid that adapts from vertical stack on mobile to horizontal side-by-side at 480px breakpoint for optimal Reddit feed viewing
- **Tier-based scoring system**: 10 points per correct answer + time bonuses (5 points for 7-10 seconds, 3 points for 4-6 seconds, 1 point for 1-3 seconds, 0 points for 0 seconds)
- **Multiple attempts per day**: Players can attempt the challenge up to 2 times per day with best score tracking and improvement notifications (unlimited in development mode)
- **Educational break**: After round 3, players receive fresh AI detection tips and facts randomly selected from comprehensive content libraries (50+ tips, 50+ facts)
- **Enhanced visual feedback**: Custom overlay indicators with colored circles, icons (✕ for AI, ✓ for Human), and labels show image sources, plus colored borders (#46E870 green, #F23C3C red) with 30% opacity glow effects
- **Simplified audio system**: Background music starts immediately when enabled, sound effects at 1.8x volume (recently reduced for better balance), one-click toggle controls (🎵/🔇) with real-time state changes
- **Advanced timeout handling**: Server-side timeout processing with improved countdown display (gray countdown timer), extended learning feedback showing correct answers, and proper game state management
- **Progressive difficulty**: Mixed categories and randomized AI placement keep players guessing across diverse image types

## 🔍 Revolutionary Image Magnification System

Spot the Bot introduces the first-ever interactive magnification system in an AI detection game, allowing players to examine images in unprecedented detail:

### How Magnification Works
- **2.5x Magnification**: Hover over any image to see a circular magnified view at 2.5x zoom level
- **Cursor Following**: The magnified circle smoothly follows your mouse cursor in real-time at 60fps with enhanced performance monitoring
- **Responsive Sizing**: Magnification circle automatically adjusts size based on screen size (70px mobile, 80px desktop)
- **Viewport Awareness**: Smart positioning keeps the magnified circle fully visible even near screen edges with safe margins
- **Performance Optimized**: Smooth rendering with automatic performance monitoring, exponential moving average FPS calculation, and intelligent feature disabling on low-performance devices

### Cross-Device Support
- **Desktop**: Smooth mouse hover activation with instant magnification
- **Mobile**: Touch-and-hold gesture (400ms) activates magnification for mobile users with haptic feedback
- **Touch Tracking**: On mobile, drag your finger to move the magnified view around the image
- **Orientation Support**: Handles device rotation and viewport changes seamlessly

### Technical Innovation
- **Canvas Rendering**: High-performance HTML5 Canvas with circular clipping masks and high-quality image smoothing
- **Real-Time Processing**: Live image processing with throttled updates (16ms intervals) for optimal 60fps performance
- **Advanced Performance Monitoring**: Exponential moving average FPS calculation over 3-second intervals with very conservative thresholds (5fps minimum) to prevent false positives while maintaining smooth operation
- **Memory Management**: Efficient cleanup and resource management prevents memory leaks with automatic canvas context cleanup
- **Browser Compatibility**: Works across all modern browsers with graceful fallbacks and comprehensive error handling
- **Intelligent Degradation**: Automatically disables magnification on catastrophically poor performance (below 5fps) while maintaining game functionality

### Strategic Advantages
- **Detail Detection**: Examine fine textures, skin imperfections, and material properties at pixel level
- **AI Artifact Identification**: Spot subtle AI generation artifacts invisible at normal zoom
- **Texture Analysis**: Analyze fabric weaves, fur patterns, and surface details with precision
- **Edge Inspection**: Check for unnatural edges, blending, or impossible geometry

This magnification system transforms how players approach AI detection, enabling detailed forensic analysis while maintaining the fast-paced, competitive nature of the game. The recent performance optimizations ensure smooth operation across all devices while providing intelligent fallbacks for lower-end hardware.

## 🎮 Current Game Implementation

Based on the latest code analysis, Spot the Bot is a fully functional AI detection game with a modern, polished interface. The game is built as a React application that runs natively within Reddit posts using the Devvit platform, providing a seamless gaming experience with cutting-edge features:

### Complete Game Flow
- **Splash Screen**: Welcome screen with game instructions, current date display, and "Start Playing" button that triggers audio context initialization
- **6-Round Gameplay**: Each round presents two images (one real, one AI-generated) with 10-second timer and combined round/category labels positioned in the top-left
- **Revolutionary Magnification**: Players can hover (desktop) or touch-and-hold (mobile) to see 2.5x magnified circular views with Canvas rendering and performance monitoring
- **Educational Break**: After round 3, players receive fresh AI detection tips and facts randomly selected from comprehensive content libraries (50+ tips, 50+ facts)
- **Results Screen**: Modern results display with "Challenge Complete!" header, dynamic date formatting, final scoring with badge achievement, leaderboard position, inspirational content, enhanced social sharing options, and smooth staggered animations for improved user experience
- **Leaderboard View**: Comprehensive leaderboard with daily, weekly, and all-time rankings featuring top 10 display with smart user positioning

### Enhanced User Experience
- **Loading State Management**: Comprehensive loading indicators during answer processing with spinner animations and status messages
- **Custom Visual Feedback**: Overlay indicators appear only on selected images during feedback, showing colored circles with icons (✕ for AI, ✓ for Human) and clear labels
- **Responsive Image Layout**: Mobile-first design with images stacked vertically on mobile devices, transitioning to side-by-side comparison at 480px breakpoint for optimal Reddit feed viewing
- **Enhanced Border Styling**: Color-coded borders (green #46E870 for correct, red #F23C3C for incorrect) with subtle glow effects and consistent 20px rounded corners
- **Advanced Timeout Handling**: Server-side timeout processing with 3-second animated countdown, "Time's Up!" message, and extended learning feedback showing correct answers
- **Interactive Magnification**: Revolutionary 2.5x zoom system with Canvas rendering, cursor tracking, and intelligent performance monitoring for detailed AI artifact inspection
- **Smooth Animations**: Staggered reveal animations on results screen with header appearing first, followed by score/badge section, then rankings/actions for enhanced visual flow

### Current Visual Design
- **Modern Interface**: Clean, polished design with streamlined visual hierarchy and "Challenge Complete!" header
- **Dynamic Date Display**: Current date shown in clean format using JavaScript's toLocaleDateString for accurate, real-time formatting
- **Enhanced Visual Hierarchy**: Streamlined layout with better spacing and typography
- **Consistent Branding**: Clean, modern theme throughout the interface emphasizing the AI detection challenge
- **Loading State Feedback**: Comprehensive loading indicators during answer processing with spinner and status messages
- **Custom Overlay System**: Selective overlay indicators that appear only on selected images during feedback with clear AI/Human labeling

### Simplified Audio System
- **One-Click Controls**: Simple toggle button (🎵/🔇) positioned in top-right corner for instant audio enable/disable
- **Real-Time Audio Management**: Audio changes take effect immediately during gameplay without requiring restart
- **Enhanced Sound Effects**: Success/failure sounds at 1.8x volume (recently reduced from 3.6x for better balance) for clear audibility above background music
- **Balanced Background Music**: Background music at reduced volume (0.15x, recently reduced from 0.3x) to ensure sound effects are clearly audible
- **Immediate Background Music**: Background music starts automatically when audio system initializes (if enabled) and continues throughout the entire game session
- **Smart Audio Context Management**: Automatic audio context unlocking on user interaction with intelligent retry logic for browser restrictions
- **Graceful Degradation**: Game works perfectly even when audio files are unavailable with comprehensive error handling and fallback mechanisms
- **Persistent Preferences**: Audio settings saved to localStorage and maintained throughout game sessions with real-time synchronization

### Advanced Timeout System
The game features sophisticated timeout handling:
- **Server-Side Processing**: When time expires, the game submits a timeout request to the server using the wrong answer with 0 time remaining to ensure proper incorrect scoring and accurate game state management
- **Extended Visual Feedback**: 3-second animated countdown with "Time's Up!" message displayed prominently, with highlighted correct answer showing overlay indicators for enhanced learning
- **Proper State Management**: Server maintains accurate game session state even during timeout scenarios with comprehensive validation and proper round progression
- **Fair Scoring**: Timeout results in 0 points and counts as incorrect for accurate badge calculations with server-side validation
- **Silent Feedback**: No audio effects during timeout scenarios to avoid misleading players about their performance
- **Learning Enhancement**: Extended viewing time (3 seconds) helps players understand AI detection patterns from missed opportunities with clear visual indicators
- **Error Handling**: Comprehensive fallback mechanisms ensure smooth gameplay during network issues with graceful degradation and proper timeout handling

### Enhanced Visual Feedback System
- **Custom Overlay Indicators**: Selected images show circular overlays with white icons (✕ for AI, ✓ for Human) and clear labels ("AI" or "Human")
- **Enhanced Border Styling**: Color-coded borders (green #46E870 for correct, red #F23C3C for incorrect) with 30% opacity glow effects
- **Mobile-First Responsive Layout**: Images adapt from single column on mobile to side-by-side on desktop with consistent 1:1 aspect ratio
- **Smart Visual States**: Clear progression from default → selection → feedback states with smooth transitions and 20px rounded corners

## 🌟 What Makes This Game Innovative & Unique

Spot the Bot stands out as a pioneering AI detection game that combines entertainment with practical digital literacy skills. Built natively for Reddit using cutting-edge web technologies, it introduces several industry-first features that set it apart from any other AI detection experience:

### 🎯 Revolutionary AI Detection Challenge
- **Daily Fresh Content**: New image sets generated every day with completely randomized categories, AI placement, and difficulty progression across 5 active image categories (Animals, Architecture, Nature, Food, Products) with Science category in development
- **Intelligent Scoring System**: Tier-based scoring rewards both accuracy (10 points per correct answer) and speed (5/3/1/0 bonus points based on remaining time), creating strategic tension between careful analysis and quick decisions under 10-second time pressure
- **Educational Integration**: Midgame learning break after round 3 provides AI detection tips and fascinating facts about AI image generation with fresh content randomly selected from comprehensive libraries (50+ tips, 50+ facts)
- **Real-World Training**: Uses authentic AI-generated images from modern models, providing genuine training for spotting deepfakes and synthetic media in the wild

### 🔍 Revolutionary Image Magnification System
- **First-of-Its-Kind Technology**: Hover magnification system allows players to examine images at 2.5x zoom with a circular magnified view that follows the cursor in real-time
- **High-Performance Rendering**: Canvas-based rendering with 60fps optimization, circular clipping masks, and advanced performance monitoring with exponential moving average FPS calculation
- **Cross-Device Support**: Desktop users get smooth mouse hover magnification, while mobile users can use touch-and-hold gestures (400ms activation) for detailed inspection
- **Smart Positioning**: Magnified circle automatically adjusts position near screen edges to remain fully visible across all screen sizes with viewport boundary detection
- **Intelligent Performance Management**: Automatic performance monitoring with very conservative thresholds (5fps minimum) and graceful degradation on low-performance devices
- **Strategic Advantage**: Enables detailed forensic analysis of AI artifacts, textures, and fine details invisible at normal zoom

### 📱 First Reddit-Native Gaming Experience
- **Revolutionary Platform Integration**: The first comprehensive AI detection game built natively for Reddit using Devvit platform, running directly within Reddit posts
- **Zero-Friction Authentication**: Automatic user authentication through Reddit accounts - no separate login, registration, or account creation required
- **Community-Centric Design**: Purpose-built for Reddit's social environment with integrated sharing, real-time leaderboards, and community competition
- **Mobile-First Optimization**: Responsive design specifically tailored for Reddit's mobile-heavy user base with 480px breakpoint optimized for Reddit feed viewing

### 🎨 Advanced Visual Feedback System
- **Custom Overlay Indicators**: Selected images show circular overlays (80px desktop, 70px mobile) with white icons (✕ for AI, ✓ for Human) and clear labels
- **Enhanced Border Styling**: Color-coded borders with 3px thickness - green (#46E870) for correct, red (#F23C3C) for incorrect, both with 30% opacity glow effects
- **Responsive Layout**: Mobile-first approach with images stacked vertically on mobile, transitioning to side-by-side at 480px breakpoint
- **Smooth Animations**: Staggered reveal animations on results screen create an engaging, professional user experience

### 🎵 Simplified Audio Experience
- **One-Click Controls**: Simple toggle button (🎵/🔇) positioned in top-right corner for instant audio enable/disable
- **Real-Time Management**: Audio changes take effect immediately during gameplay without requiring restart
- **Enhanced Sound Effects**: Success/failure sounds at 1.8x volume (recently reduced from 3.6x for better balance) for clear audibility above background music
- **Balanced Background Music**: Background music at reduced volume (0.15x, recently reduced from 0.3x) to ensure sound effects are clearly audible
- **Smart Audio Context Management**: Automatic audio context unlocking on user interaction with intelligent retry logic for browser restrictions
- **Immediate Session Audio**: Background music starts automatically when the game session begins (if enabled) rather than waiting for user interaction
- **Graceful Degradation**: Game works perfectly even when audio files are unavailable with comprehensive error handling and fallback mechanisms

### 🏆 Advanced Social & Competition Features
- **Dynamic Achievement System**: Earn performance-based badges from 🤖 AI Whisperer (perfect score) to 🎓 Human in Training
- **Multi-Tier Leaderboards**: Daily, weekly, and all-time rankings with smart user positioning and live updates
- **Enhanced Social Sharing**: Friend challenge sharing with personalized messages, attempt tracking, and improvement notifications
- **Multiple Daily Attempts**: Up to 2 attempts per day with best score tracking and improvement notifications

### ⚡ Technical Innovation
- **Serverless Architecture**: Built on Devvit's modern platform with Redis persistence for game state and leaderboard data
- **Advanced Performance Monitoring**: Exponential moving average FPS calculation with intelligent performance thresholds and automatic feature degradation
- **Comprehensive Error Resilience**: Advanced error boundaries, network retry logic, offline detection, and graceful degradation
- **Anti-Cheat Protection**: Server-side timer validation, rate limiting, session integrity checks, and abuse detection
- **Progressive Web App Features**: Offline support with smart caching and automatic retry when connection is restored
- **Intelligent Resource Management**: Canvas context cleanup, memory leak prevention, and performance-based feature scaling

## 🎮 How to Play: Complete Step-by-Step Guide

### 🚀 Getting Started
1. **Find the Game**: Look for Spot the Bot posts in participating subreddits or communities where the app is installed
2. **Launch the App**: Click the "Launch App" button in the Reddit post to open the game in full-screen webview mode
3. **Welcome Screen**: You'll see today's date, game instructions explaining the 6-round format with 10-second timers, and scoring system details
4. **Audio Setup**: Optional - use the audio toggle button (🎵/🔇) in the top-right corner to enable/disable background music and sound effects (audio starts immediately when enabled)
5. **Join the Challenge**: Click "Start Playing!" to begin your daily challenge

### 🎯 Complete Game Flow

#### 📱 Pre-Game Setup (Splash Screen)
The splash screen welcomes you with:
- **Daily Challenge Display**: Shows the current date with the game title "Spot the Bot" and tagline "Can you tell AI from reality?"
- **Game Rules Overview**: Clear instructions explaining:
  1. Pick the REAL photo from 6 pairs
  2. 10 seconds per round
  3. Faster = higher score!
- **Audio Controls**: Optional audio toggle (🎵/🔇) in the top-right corner
- **Start Button**: Large "Start Playing!" button to begin your daily challenge

#### 🎮 Round-by-Round Gameplay (6 Rounds Total)

**Each Round Structure:**
- **Round Info**: Combined display showing "ROUND X OF 6 (Category)" in the top-left header
- **Image Comparison**: Two images displayed - one real photograph, one AI-generated
  - **Mobile Layout**: Images stacked vertically (max-width 400px, centered)
  - **Desktop Layout**: Side-by-side comparison at 480px+ (max-width 600px, centered)
  - **Visual Design**: 1:1 aspect ratio with 20px rounded corners
- **10-Second Timer**: Color-coded countdown with progress bar:
  - 🟢 **Green** (7-10 seconds): Plenty of time to analyze
  - 🟡 **Yellow** (4-6 seconds): Time to make a decision  
  - 🔴 **Red** (1-3 seconds): Choose quickly!

**Making Your Selection:**

1. **🔍 Analyze Both Images**: Look for AI tells like:
   - Unnatural lighting or impossible geometry
   - Extra fingers or distorted hands
   - Weird textures or repetitive patterns
   - Text that looks blurry or nonsensical

2. **🔬 Use Revolutionary Image Magnification**: 
   - **Desktop**: Hover over images to see a 2.5x magnified circular view that follows your cursor
   - **Mobile**: Touch-and-hold (400ms) to activate magnification, then drag to examine areas
   - **High-Performance**: Canvas-based rendering with 60fps optimization and advanced performance monitoring
   - **Detail Inspection**: Perfect for examining AI artifacts and subtle inconsistencies with intelligent performance management

3. **👆 Click to Choose**: Click on the image you believe is the REAL photograph

4. **⏳ Loading State**: See a spinner and "Checking your answer..." message

5. **✅ Visual Feedback**: Enhanced indicators show the results:
   - **Overlay Indicators**: Circular overlays with icons (✕ for AI, ✓ for Human) and labels
   - **Border Feedback**: Green borders for correct, red for incorrect (with glow effects)
   - **Score Display**: See your points (e.g., "+13 points" or "No points")

6. **🔊 Audio Feedback**: Success or failure sounds play (if audio enabled)

7. **➡️ Auto-Advance**: Game moves to the next round after 2 seconds

**⏰ Timeout Handling:**
- **Extended Feedback**: 3-second countdown with "Time's Up!" message
- **Learning Opportunity**: Shows correct answer with visual indicators
- **Fair Scoring**: 0 points for timeout, counts as incorrect

#### 🎓 Educational Break (After Round 3)
Halfway through, you'll get a learning break:
- **💡 AI Detection Tips**: Practical advice (randomly selected from 50+ tips)
- **🤖 AI Facts**: Fascinating insights about AI technology (50+ facts)
- **📊 Progress Indicator**: Shows 3 of 6 rounds complete
- **▶️ Continue Button**: "Continue Playing!" to resume rounds 4-6

#### 🏆 Scoring System
- **Base Points**: 10 points for each correct identification
- **Time Bonus**: Whole number bonuses based on speed:
  - **7-10 seconds**: +5 bonus points
  - **4-6 seconds**: +3 bonus points
  - **1-3 seconds**: +1 bonus point
  - **0 seconds**: +0 bonus points
- **Maximum Score**: 90 points (6 correct × 15 points each)
- **Multiple Attempts**: Up to 2 attempts per day with best score tracking

#### 🏅 Badge Achievement System
Your performance determines your badge:
- **🤖 AI Whisperer** (6/6 correct): Perfect score! Incredible accuracy
- **🕵️ AI Detective** (5/6 correct): Outstanding detection skills!
- **👁️ Good Samaritan** (4/6 correct): Excellent eye for detail!
- **👤 Just Human** (3/6 correct): Getting the hang of it!
- **🎓 Human in Training** (0-2/6 correct): Keep practicing!

#### 🎉 Results & Social Features
After completing all 6 rounds:
- **📊 Final Results**: See your total score, badge, and leaderboard position
- **📈 Improvement Tracking**: Compare with previous attempts
- **👥 Social Sharing**: Challenge friends with personalized messages
- **🏆 Leaderboards**: View daily, weekly, and all-time rankings
- **🔄 Play Again**: Use your second daily attempt (if available)

### 💡 Pro Tips for Success
- **🔍 Use Magnification**: Hover/touch-hold to examine fine details
- **👀 Look for Hands**: AI often struggles with fingers and hand positioning
- **💡 Check Lighting**: Look for inconsistent shadows and lighting
- **📝 Read Text**: AI-generated text is often blurry or nonsensical
- **⚡ Balance Speed vs Accuracy**: Quick decisions earn time bonuses
- **🎓 Learn from Timeouts**: Extended feedback helps you improve Good Samaritan** (4/6 correct): Excellent eye for detail!
- **👤 Just Human** (3/6 correct): Getting the hang of it!
- **🎓 Human in Training** (0-2/6 correct): Keep practicing!

#### Results Screen Experience
After completing your challenge, you'll see:
- **Animated Header**: Modern "Challenge Complete!" title with current date that smoothly fades in first
- **Achievement Celebration**: Your badge and score prominently displayed with improvement tracking and attempt context, appearing in the second animation wave
- **Leaderboard Position**: Your rank among all daily players with total participant count
- **Inspirational Content**: Fresh motivational quotes or humorous content loaded from server libraries
- **Enhanced Sharing Options** (appearing in the final animation wave): 
  - **Challenge Friends**: Share personalized messages with attempt tracking and improvement notifications
  - **View Leaderboard**: See daily, weekly, and all-time rankings
  - **Play Again**: Available if you have remaining attempts (up to 2 per day) with streamlined button text
- **Smooth Transitions**: Staggered animations create a polished, engaging results reveal experience

#### Simplified Audio Experience (Optional)
- **Background Music**: Atmospheric music at balanced volume (0.15x, recently reduced for better balance) that starts immediately when enabled and continues throughout the session
- **Enhanced Sound Effects**: Success/failure sounds for correct/incorrect answers at 1.8x volume (recently reduced from 3.6x for better balance) for clear audibility above background music
- **One-Click Audio Toggle**: Simple music icon button (🎵/🔇) positioned in top-right corner to instantly enable/disable all audio with immediate effect
- **Real-Time Audio Control**: Audio changes take effect immediately during gameplay without requiring restart or page refresh
- **Smart Audio Management**: Automatic audio context unlocking with intelligent retry logic for browser audio restrictions
- **Session-Level Audio**: Audio preference maintained throughout your entire game session with localStorage persistence
- **Graceful Degradation**: Game works perfectly even if audio files are unavailable with comprehensive error handling and fallback mechanisms

### Daily Challenge Features
- **Fresh Content Daily**: New image pairs generated every day across all 5 active categories (with Science category in development)
- **Multiple Attempts**: Up to 2 attempts per day with best score tracking
- **Real-Time Competition**: Live leaderboards with daily, weekly, and all-time rankings
- **Social Sharing**: Challenge friends with personalized messages including your scores and improvement
- **Educational Value**: Learn practical AI detection skills through gameplay and educational content



### Game Rules & Fair Play

#### Daily Challenge System
- **Multiple Attempts**: Up to 2 attempts per day (unlimited in development mode)
- **UTC Reset**: New challenges available daily at 00:00 UTC with fresh image sets
- **Best Score Tracking**: System remembers your highest score across attempts with improvement notifications
- **Session Persistence**: Must complete started games (can't restart mid-game)
- **Attempt Tracking**: Clear display of remaining attempts and encouragement to replay

#### Timeout & Scoring Rules
- **Server-Side Timeout Processing**: When time expires, the game communicates with the server to maintain proper game state
- **Enhanced Timeout Handling**: If time expires without selection, 0 points awarded and counts as incorrect for accurate badge calculation
- **Extended Learning Experience**: Timeout scenarios show correct answer for 3 seconds with animated countdown timer to help learning
- **Clear Visual Feedback**: "Time's Up!" message replaces the round question, with animated countdown and highlighted correct answer
- **Silent Timeout Feedback**: No audio effects during timeouts to avoid misleading players about performance
- **Fair Scoring**: Timeout scenarios are treated as incorrect answers for consistent badge calculation
- **Robust Error Handling**: Comprehensive fallback mechanisms ensure smooth gameplay even during network issues

#### Anti-Cheat Protection
- **Server-Side Timer Validation**: All timing verified server-side with 3-second tolerance for network delays
- **Rate Limiting**: Prevents spam and system abuse with middleware protection
- **Input Validation**: All user inputs sanitized and validated on both client and server
- **Session Integrity**: Comprehensive session validation and state management
- **Network Resilience**: Retry logic with exponential backoff and offline detection

### Pro Tips for Success

#### Detection Techniques
- **Detail Inspection**: Use the magnification feature to examine fine details like hair, fur, fabric textures, and skin imperfections
- **Magnified Analysis**: Hover over suspicious areas to get a 3x magnified view with high-quality Canvas rendering - look for unnatural patterns, impossible geometry, or artifacts that become visible at higher magnification
- **Lighting Consistency**: Look for unnatural lighting, impossible shadows, or inconsistent light sources across the imagessible shadows, or inconsistent light sources
- **Geometric Logic**: Check for impossible architecture, floating objects, or perspective errors
- **Human Elements**: Pay special attention to faces, hands, and human interactions - AI often struggles here

#### Strategic Gameplay
- **Trust Your Instincts**: The "uncanny valley" feeling is often a reliable AI indicator
- **Use Magnification Strategically**: Don't spend too much time magnifying - use it to quickly check suspicious areas like hands, eyes, or complex textures with the smooth cursor-following magnification system
- **Balance Speed vs. Accuracy**: Time bonuses can add up to 30 points total (5 points × 6 rounds), but accuracy is still most important (60 points total for perfect answers)
- **Category-Specific Patterns**: Each category has different AI tells:
  - **Animals**: Unnatural fur patterns, impossible anatomy, weird eyes (magnify to see individual fur strands)
  - **Architecture**: Impossible geometry, floating elements, inconsistent perspective (magnify structural details)
  - **Nature**: Too-perfect landscapes, impossible weather combinations (magnify natural textures)
  - **Food**: Perfect textures, impossible arrangements, unnatural lighting (magnify surface details)
  - **Products**: Too-perfect surfaces, impossible reflections (magnify material textures and reflections)

#### Daily Practice Benefits
- **Pattern Recognition**: Regular play helps you develop better AI detection skills over time
- **Speed Improvement**: Practice helps you make faster, more confident decisions
- **Category Familiarity**: Learn the specific tells and patterns for each image category
- **Competitive Edge**: Consistent play helps you climb the weekly and all-time leaderboards



### ✅ Fully Implemented Features

#### Core Game Systems
- **Complete Gameplay Loop**: 6 rounds with 10-second timers and comprehensive whole-number scoring system
- **Educational Integration**: Midgame learning breaks with fresh content each session from comprehensive content library (50 tips, 50 facts) and fallbacks
- **Audio System**: Background music, sound effects, and user controls with graceful degradation and localStorage persistence
- **Play Limit Management**: Multiple daily attempts (2 per day) with best score tracking and improvement notifications

#### Real-time & Social Features
- **Live Updates**: Real-time participant counting and leaderboard updates via Devvit Realtime API
- **Multi-tier Leaderboards**: Daily, weekly, and all-time rankings with live position updates
- **Enhanced Sharing**: Friend challenge sharing with personalized messages and attempt tracking
- **Community Integration**: Built natively for Reddit with automatic user authentication

#### User Experience & Design
- **Enhanced Visual Feedback**: Custom overlay indicators with colored circles, icons, and labels, plus colored borders with glow effects
- **Interactive Image Magnification**: Fully implemented 2.5x magnification system with Canvas rendering, cursor tracking, and cross-device support
- **Responsive Design**: Mobile-first approach with adaptive layouts for all screen sizes (480px breakpoint)
- **Error Resilience**: Comprehensive error boundaries, retry logic, and offline support
- **Loading States**: Smooth transitions and progress indicators throughout the experience

#### Technical Infrastructure
- **Session Management**: Secure game state persistence with Redis and local storage caching
- **Content Management**: Fresh educational content system with random selection from comprehensive libraries (50 tips, 50 facts)
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
- Modernized whole-number scoring system for better user experience
- Simplified audio system with one-click toggle controls and enhanced sound effects
- Real-time leaderboards and participant tracking
- Educational content system with fresh content each session
- Comprehensive error handling and offline support
- **Reddit-optimized responsive design** with mobile-first approach and 480px breakpoint for optimal Reddit feed viewing
- Anti-cheat protection and play limit enforcement

#### Recent Updates ⏱️
- **Revolutionary Image Magnification System**: Implemented first-ever interactive 2.5x magnification with Canvas rendering, cursor tracking, and cross-device support for detailed AI artifact inspection
- **Advanced Performance Monitoring**: Enhanced magnification system with exponential moving average FPS calculation over 3-second intervals and very conservative performance thresholds (5fps minimum) to prevent false positives, with performance monitoring disabled in development mode to avoid interference from React strict mode and dev tools
- **Enhanced Visual Feedback System**: Improved round feedback display with loading states during answer submission and prominent score display in the header area
- **Educational Content Streamlining**: Simplified midgame learning break with cleaner, more focused presentation and removed redundant instructional text
- **UI Organization Improvements**: Combined round number and category information into a single, cleaner label format (e.g., "Round 1 of 6 (Category: Animals)") positioned on the left side using formatRoundLabel utility
- **Simplified Date Display**: Updated splash screen to show shorter date format (just month and day) for cleaner appearance with toLocaleDateString formatting
- **Audio System Enhancements**: Improved audio toggle functionality with better state management, immediate effect during gameplay, and 1.8x volume sound effects (recently reduced for better balance)
- **Enhanced Timeout Handling**: Added "Time's Up!" message display in place of timer with improved visual layout, 3-second animated countdown for better visual clarity, and proper visual feedback
- **Responsive Layout Optimization**: Updated image container layout with Reddit-optimized breakpoints (480px transition) for better Reddit feed integration and mobile-first design
- **Enhanced Visual Consistency**: Improved spacing and sizing with consistent overlay indicators (80px desktop, 70px mobile) across all screen sizes
- **Modern Icon Updates**: Replaced lightning bolt (⚡) icons with timer emoji (⏱️) for time bonus displays throughout the interface for better visual clarity
- **Whole Number Scoring**: Updated all score displays to show whole numbers without decimal places for cleaner, easier-to-read results

#### In Development 🚧
- **Science Category**: Image content for the 6th category (infrastructure ready, awaiting image uploads)

#### Planned Enhancements 📋
- **Extended Audio Library**: Additional sound effects and dynamic music system
- **Community Features**: User-generated content and enhanced social interactions
- **Advanced Analytics**: Detailed performance insights and player statistics

## 🎨 Recent Updates & Enhancements

### 🔥 Latest Update: Revolutionary Image Magnification System & Performance Optimization
The game recently received a groundbreaking image magnification system and significant performance optimizations. **Most Recent Change**: Enhanced performance monitoring for the magnification system with exponential moving average FPS calculation over 3-second intervals and very conservative performance thresholds (5fps minimum) to prevent false positives while maintaining smooth 60fps rendering. Performance monitoring is now disabled in development mode to prevent false positives during development with React strict mode and dev tools.

**Latest Audio System Improvements:**
- **Simplified Audio Controls**: Replaced complex dropdown controls with simple one-click toggle button (🎵/🔇) positioned in top-right corner
- **Real-Time Audio Control**: Audio changes take effect immediately during gameplay without requiring restart, with synchronous state updates and localStorage persistence
- **Enhanced Sound Effects**: Success and failure sounds at 1.8x volume (recently reduced from 3.6x for better balance) for clear audibility above background music with audio toggle compliance
- **Balanced Background Music**: Background music volume at 0.15x (recently reduced from 0.3x for better balance) to ensure sound effects remain prominent and clear
- **Improved Audio Loop Handling**: Enhanced background music loop management with proper volume respect during loop transitions
- **Immediate Audio Playback**: Background music starts immediately when audio system initializes (if enabled) with proper lifecycle management and initialization tracking
- **Smart Background Music Management**: Improved lifecycle management with initialization guards, automatic playback control, and audio context unlocking on user interaction
- **Graceful Degradation**: Game works perfectly even when audio files are unavailable with comprehensive validation, development tools, and fallback mechanisms
- **Background Music State Tracking**: Added `isBackgroundMusicPlaying` method for better audio control and state management

**Enhanced Visual Feedback System:**
- **Loading State Indicators**: Added loading spinner during answer submission to provide clear feedback that the game is processing the player's choice
- **Prominent Score Display**: Round scores now appear prominently in the header area with color-coded feedback (green for points earned, red for no points)
- **Improved User Experience**: Clear visual progression from selection → loading → feedback → next round for better game flow understanding

**Enhanced Timeout Handling:**
- **Server-Side Processing**: Timeout scenarios now properly communicate with the server using wrong answers with 0 time remaining to maintain accurate game state and scoring
- **Extended Feedback Duration**: Timeout scenarios display correct answer for 3 seconds with animated countdown timer replacing the normal timer display
- **Improved Visual Layout**: "Time's Up!" message displayed prominently with countdown timer for better visual clarity and readability
- **Clear Visual Indication**: Enhanced timeout display with animated countdown and highlighted correct answer for better learning experience
- **Silent Timeout Feedback**: No audio effects during timeout scenarios to avoid misleading players about their performance
- **Fair Scoring System**: Timeout results in 0 points and counts as incorrect for accurate badge calculation with server-side validation
- **Learning Enhancement**: Extended viewing time (3 seconds) helps players understand AI detection patterns from missed opportunities with clear visual indicators
- **Robust Error Handling**: Comprehensive fallback mechanisms ensure smooth gameplay even during network issues

**UI & Visual Improvements:**
- **Modern Interface**: Updated results screen with clean "Challenge Complete!" header and streamlined design
- **Dynamic Date Display**: Results screen now shows current date using JavaScript's toLocaleDateString for accurate, real-time formatting
- **Combined Round Labels**: Round number and category now displayed together (e.g., "Round 1 of 6 (Category: Animals)") positioned on the left side for cleaner organization
- **Enhanced Visual Feedback**: Custom overlay indicators with colored circles, icons (✕ for AI, ✓ for Human), and clear labels
- **Improved Timeout Layout**: "Time's Up!" message and countdown timer now displayed with improved visual clarity for better user experience
- **Responsive Design**: Mobile-first approach with images stacked vertically on mobile, side-by-side on desktop
- **Improved Border Styling**: Color-coded borders (green #46E870 for correct, red #F23C3C for incorrect) with glow effects
- **Consistent Aspect Ratios**: All images maintain 1:1 aspect ratio with 20px rounded corners across all screen sizes

**Fresh Educational Content System:**
- **Dynamic Content Loading**: Fresh educational content loaded for each game session using `fetchRandomContentFresh()` function
- **Comprehensive Content Library**: 50+ AI detection tips and 50+ fascinating AI facts stored in server-managed JSON files
- **No Content Repetition**: Each educational break provides fresh, randomly selected tips and facts from comprehensive libraries
- **Streamlined Presentation**: Clean, focused educational break design with progress indicator and clear visual hierarchy
- **Enhanced Learning Experience**: Players receive varied educational content across multiple game sessions with fallback content for reliability

**Scoring System Modernization:**
- **Simplified Calculations**: Moved from complex decimal-based scoring to clean whole numbers for better user experience
- **Clearer Rewards**: 10 points per correct answer + tier-based time bonuses (5/3/1 points based on remaining time)
- **Better Balance**: Time bonuses provide meaningful rewards without overwhelming the accuracy component
- **User-Friendly Display**: Scores are now easy to understand whole numbers instead of confusing decimals

These improvements make the game more accessible and intuitive while maintaining the strategic balance between speed and accuracy.ameplay even if content loading fails

#### Audio System Simplification & Enhancement ⏱️
The game recently received major audio system improvements:

**Enhanced State Management:**
- Added `isBackgroundMusicPlaying` state tracking for better audio control
- Improved background music lifecycle management throughout game sessions
- Better synchronization between audio controls and actual playback state
- Enhanced audio context unlocking on user interaction for browser compatibility

**Immediate Audio Playback:**
- Background music now starts immediately when audio system loads (if enabled) with initialization tracking
- Removed delays and waiting for user interaction for background music with proper state management
- Improved audio initialization flow with duplicate initialization prevention for better user experience
- Enhanced audio loading and playback management with comprehensive error handling

**Simplified User Interface:**
- Streamlined audio toggle button with clear visual feedback (🎵/🔇)
- Removed complex dropdown controls in favor of one-click audio management
- Real-time audio state updates without requiring game restart
- Persistent audio preferences across game sessions with localStorage integration icon (🎵/🔇)
- One-click audio enable/disable with immediate effect during gameplay
- Real-time audio state changes without requiring game restart
- Audio preference persists throughout entire game session with localStorage

**Enhanced Sound Effects:**
- Success and failure sounds increased to 3x volume for better audibility above background music
- Sound effects now clearly audible and respect the audio toggle state immediately
- Silent feedback during timeout scenarios to avoid misleading players

**Improved Audio Flow:**
- Background music starts immediately when game session begins (not waiting for first round)
- Audio controls remain accessible throughout entire gameplay experience
- Graceful degradation ensures game works perfectly even when audio files are unavailable
- Comprehensive audio validation and development tools for debugging

#### Major Scoring System Overhaul ⏱️
The game recently received a complete scoring system redesign for better user experience:

**Previous System (Decimal-based):**
- 1 point per correct answer + 0.01 points per millisecond remaining
- Complex decimal calculations (e.g., 4.23 points)
- Maximum ~66 points for perfect game

**New System (Whole Numbers):**
- 10 points per correct answer + tier-based time bonuses
- Simple, clear scoring: 5 points (7-10s), 3 points (4-6s), 1 point (1-3s)
- Maximum 90 points for perfect game (6 × 15 points)
- Easier to understand and more rewarding for players

*Note: The scoring logic has been fully updated throughout the application, with both backend calculations and frontend display now using the new whole number system for a consistent user experience.*

#### Visual Design Enhancements
- **Rounded Corner Update**: Game image buttons now feature 20px border radius for a more modern, polished appearance
- **Enhanced Visual Feedback**: Improved border styling with consistent 20px rounded corners across all game states
- **Custom Overlay System**: Selected images show circular overlays with white icons (✕ for AI, ✓ for Human) and clear labels
- **Enhanced Border Feedback**: Blue borders during selection, green borders (#46E870) for correct answers, red borders (#F23C3C) for incorrect answers with glow effects
- **Reddit-Optimized Responsive Layout**: Images adapt from single column on mobile (max-width 400px, centered) to side-by-side at 480px breakpoint (max-width 600px, centered) with consistent 1:1 aspect ratio
- **Responsive Layout Refinements**: Better visual consistency between mobile and desktop layouts with optimized spacing (1rem mobile, 1.5rem desktop) and Reddit feed integration

#### Enhanced Timeout Handling ⏱️
The game recently received major timeout handling improvements for better user experience:

**Latest Timeout Improvements:**
- **Server Integration**: Implemented proper server-side timeout processing using wrong answers to maintain accurate game state and fair scoring
- **Refined Countdown Logic**: Fixed countdown timer to properly display complete sequence (3, 2, 1, 0) before transitioning
- **Smoother State Transitions**: Added precise timing controls with small delays to ensure countdown animations complete before round progression
- **Enhanced Visual Feedback**: Improved countdown display with better state management and cleaner visual transitions
- **Consistent Timing**: Standardized timeout feedback duration at 3 seconds with animated countdown for optimal learning experience
- **Robust Error Handling**: Added comprehensive fallback mechanisms for timeout scenarios with graceful degradation

**Extended Feedback Duration:**
- Timeout scenarios display correct answer for 3 seconds with animated countdown timer
- Clear "Time's Up!" message with countdown animation and highlighted correct answer for better learning
- Silent feedback during timeouts to avoid misleading sound effects about performance
- Fair scoring system where timeout results in 0 points and counts as incorrect for accurate badge calculation
- Server maintains accurate session state even during timeout scenarios

**Improved Learning Experience:**
- Better visual clarity when time expires without selection using enhanced visual indicators
- Extended viewing time helps players learn AI detection patterns from missed opportunities
- Consistent feedback timing across all game scenarios with smooth transitions
- Enhanced learning opportunity through extended correct answer display with overlay indicators
- Proper game progression maintained through server-side timeout processing

#### Other Recent Improvements
- **Server-Side Timeout Processing**: Implemented proper server communication for timeout scenarios to maintain game state integrity
- **Enhanced Timeout System**: Added countdown timer and extended feedback duration for better learning experience with refined countdown logic
- **Improved Round Transitions**: Fixed countdown timer display to show complete sequence (3, 2, 1, 0) before transitioning to next round
- **Better State Management**: Enhanced timeout handling with proper state transitions and timing controls
- **Robust Error Handling**: Added comprehensive fallback mechanisms for timeout scenarios with graceful degradation
- **CSS Modernization**: Migrated from inline styles to Tailwind CSS classes for better maintainability and consistency
- **Audio System Refactoring**: Completely refactored AudioSystem component with simplified one-click toggle controls and enhanced sound effects
- **LocalStorage Integration**: Enhanced audio settings persistence with proper localStorage handling for audio enabled state
- **Audio Context Management**: Improved audio initialization and lifecycle management with better error handling
- **Performance Optimizations**: Streamlined component dependencies and removed unnecessary re-renders
- **Real-Time Audio Updates**: Audio changes now take effect immediately during gameplay without requiring restart

### Visual Feedback Enhancements
The game recently received major visual feedback improvements to create a more intuitive and engaging experience, including enhanced loading states and prominent score display:

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

### Modern CSS Architecture
- **Tailwind CSS Integration**: Consistent spacing and styling using utility-first CSS framework
- **Maintainable Codebase**: Migration from inline styles to Tailwind classes for better code organization
- **Responsive Design System**: Unified approach to breakpoints and responsive behavior across all components


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
- **Custom CSS**: Enhanced visual feedback system with overlay indicators, responsive grid layouts, and audio controls

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
│   │   ├── useMagnify.ts         # Image magnification state and interactions
│   │   └── useCounter.ts         # Counter utilities
│   ├── utils/       # Client utilities
│   │   ├── network.ts            # API calls with retry logic and error handling
│   │   ├── storage.ts            # Local storage and caching
│   │   ├── content.ts            # Educational and inspirational content loading
│   │   ├── audio.ts              # Audio context management
│   │   ├── audioDevTools.ts      # Audio development and debugging tools
│   │   ├── audioValidation.ts    # Audio file validation utilities
│   │   ├── magnify.ts            # Image magnification utilities and calculations
│   │   └── ui.ts                 # UI utility functions
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

- **Educational System**: Midgame learning breaks with fresh content each session from comprehensive libraries (50 tips, 50 facts)
- **Audio Integration**: Simplified audio system with background music, enhanced sound effects, one-click toggle controls, and initialization tracking
- **Image Magnification**: Advanced magnification system with 2.5x zoom, cursor tracking, responsive sizing, and performance optimization
- **Real-Time Updates**: Realtime connections via Devvit Realtime API for live participant counts and leaderboard updates
- **Timer System**: Client-side 10-second countdown with color-coded visual progress bar (green/yellow/red) and server-side validation
- **Image Handling**: Responsive grid layout with 1:1 aspect ratio, custom overlay indicators, enhanced visual feedback, and interactive magnification
- **Score Calculation**: Tier-based bonus system (5/3/1 points based on remaining time) with server-side validation and whole number scoring
- **Badge Assignment**: Automatic badge calculation based on performance with 5 achievement tiers (6 correct = AI Whisperer, 5 = AI Detective, etc.)
- **Content Management**: Fresh educational content system with random selection from comprehensive libraries and caching
- **Social Sharing**: Native sharing API with clipboard fallback for friend challenges
- **Error Resilience**: Comprehensive error boundaries, network retry logic with exponential backoff, offline detection via `useErrorHandler`
- **Session Management**: Secure Redis-based persistence with local storage caching and session validation
- **Network Optimization**: Smart retry logic with exponential backoff, offline detection, and pending request queuing
- **Loading States**: Comprehensive loading screens, skeleton states, progress indicators, and smooth state transitions
- **Offline Support**: Local caching system for game data, results viewing, cached leaderboards, and graceful degradation

## 🎨 Design Philosophy

### Reddit-Optimized Mobile-First Approach
- **Responsive Grid System**: Images adapt from single column layout on mobile (max-width 400px, centered) to side-by-side comparison at 480px breakpoint (max-width 600px, centered)
- **Reddit Feed Integration**: Breakpoint specifically optimized for Reddit's viewing experience with smaller transition point than typical desktop layouts
- **Touch-Friendly Interface**: Button sizes and spacing optimized for mobile interaction with hover states and scale effects (1.02x hover, 1.05x selection)
- **Consistent Visual Design**: 1:1 aspect ratio maintenance across all screen sizes with 20px border radius and proper image cropping
- **Adaptive Spacing**: 1rem gap on mobile devices, 1.5rem gap on larger screens for optimal visual balance
- **Overlay Consistency**: Custom overlay indicators sized appropriately for each screen size (70px mobile, 80px desktop)
- **Color-Coded Feedback**: Intuitive visual feedback system with green/yellow/red timer and enhanced border styling with glow effects

### User Experience Principles
- **Immediate Feedback**: Visual and audio responses to every user action
- **Progressive Disclosure**: Information revealed at the right time (educational content at midgame)
- **Error Resilience**: Graceful handling of network issues and offline scenarios
- **Accessibility**: High contrast colors, clear typography, and keyboard navigation support
- **Performance**: Optimized loading with caching and efficient state managementlay for mobile networks

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
- **Enhanced Magnification**: Additional magnification levels, zoom controls, and magnification history tracking
- **Advanced Audio**: Extended sound library with additional sound effects and dynamic music system
- **Enhanced Achievement System**: Unlockable achievements and streak tracking
- **Community Features**: User-generated content and social interactions
- **Analytics Dashboard**: Detailed performance insights and statistics including magnification usage patterns
- **Seasonal Events**: Special themed challenges and limited-time content
- **Advanced Leaderboards**: Category-specific rankings and streak tracking
- **Mobile App Integration**: Enhanced mobile experience with native app features
