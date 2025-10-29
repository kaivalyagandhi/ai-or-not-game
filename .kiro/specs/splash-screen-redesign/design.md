# Splash Screen Redesign Design Document

## Overview

The redesigned splash screen will transform the current single-column layout into an engaging split-screen "Hot or Not" style interface. The design emphasizes visual impact through contrasting colored overlays on golden retriever puppy images, arcade-style typography, and a mobile-first approach that maintains all existing functionality while dramatically improving user engagement.

## Architecture

### Component Structure

The redesigned `SplashScreen` component will maintain its existing React functional component structure while introducing new visual elements:

```
SplashScreen
├── Split Screen Container
│   ├── Left Half (Red Overlay + Golden Retriever Puppy)
│   │   └── "AI" Label
│   └── Right Half (Teal-Green Overlay + Golden Retriever Puppy)
│       └── "REAL" Label
├── Centered Content Overlay
│   ├── Main Title: "AI or Not?!"
│   ├── Subtitle: "Can you tell AI from reality?"
│   ├── Start Button
│   └── Compact Info Panel (attempts, score, participants)
└── Background Elements
    ├── Gradient overlays
    └── Subtle animations
```

### Layout Strategy

- **Split-screen base**: Two 50% width containers with background images
- **Overlay content**: Centered content that floats above the split design
- **Responsive breakpoints**: Mobile-first with tablet and desktop enhancements
- **Z-index layering**: Background images → Color overlays → Content overlay

## Components and Interfaces

### Visual Components

#### Split Screen Background
- **Left Panel**: Golden retriever puppy image with 60% opacity red overlay (#FF4444)
- **Right Panel**: Golden retriever puppy image with 60% opacity teal-green overlay (#20B2AA)
- **Corner Labels**: "AI" and "REAL" badges in contrasting colors
- **Responsive behavior**: Maintains 50/50 split on all screen sizes

#### Typography System
- **Primary Title**: "AI or Not?!" - Large, bold, arcade-style font
- **Subtitle**: "Can you tell AI from reality?" - Medium weight, readable
- **Color scheme**: White text with dark shadows for contrast
- **Font stack**: System fonts optimized for readability and performance

#### Interactive Elements
- **Start Button**: Prominent, rounded, with gradient background
- **Hover/Touch States**: Scale and shadow animations
- **Disabled State**: Grayed out when daily limit reached
- **Loading States**: Spinner integration for network calls

### Data Integration

#### Existing API Preservation
- **Participant Count**: Compact display integrated into design
- **Play Attempts**: Minimized but accessible information
- **Realtime Updates**: Maintained with subtle visual indicators
- **Error Handling**: Graceful degradation with cached data

#### State Management
```typescript
interface SplashScreenState {
  // Existing state preserved
  participantCount: number;
  playAttempts: PlayAttemptsData;
  loading: boolean;
  error: string | null;
  
  // New visual state
  imagesLoaded: boolean;
  animationReady: boolean;
}
```

## Data Models

### Image Assets
```typescript
interface SplashImageAssets {
  leftPuppy: {
    src: string;
    alt: string;
    preloaded: boolean;
  };
  rightPuppy: {
    src: string;
    alt: string;
    preloaded: boolean;
  };
}
```

### Theme Configuration
```typescript
interface SplashTheme {
  colors: {
    leftOverlay: string;    // Red: #FF4444
    rightOverlay: string;   // Teal-Green: #20b289ff
    primary: string;        // Green theme: #22C55E
    secondary: string;      // Dark green: #16A34A
    text: string;          // White: #FFFFFF
    textShadow: string;    // Dark: #000000
  };
  animations: {
    fadeInDuration: number;
    scaleHoverEffect: number;
    buttonPulse: boolean;
  };
}
```

## Error Handling

### Image Loading Failures
- **Fallback Strategy**: Solid color backgrounds if images fail to load
- **Progressive Enhancement**: Core functionality works without images
- **Loading States**: Skeleton screens during image preloading
- **Network Optimization**: Compressed images with multiple formats

### API Failures
- **Graceful Degradation**: Cached data display when APIs fail
- **Retry Logic**: Maintained from existing implementation
- **Offline Mode**: Visual indicators for offline state
- **Error Messages**: Integrated into design without breaking layout

### Performance Considerations
- **Image Preloading**: Background images loaded before component mount
- **Lazy Loading**: Non-critical elements loaded after initial render
- **Memory Management**: Proper cleanup of event listeners and connections
- **Bundle Size**: Optimized CSS and minimal additional dependencies

## Testing Strategy

### Visual Testing
- **Cross-browser Compatibility**: Chrome, Safari, Firefox mobile browsers
- **Device Testing**: iPhone, Android phones, tablets, desktop
- **Accessibility Testing**: Screen readers, keyboard navigation, color contrast
- **Performance Testing**: Load times, animation smoothness, memory usage

### Functional Testing
- **API Integration**: All existing endpoints continue to work
- **State Management**: Proper state updates and error handling
- **User Interactions**: Button clicks, touch events, keyboard navigation
- **Edge Cases**: Network failures, slow connections, disabled JavaScript

### Responsive Testing
```typescript
// Test breakpoints
const breakpoints = {
  mobile: '320px - 768px',
  tablet: '768px - 1024px', 
  desktop: '1024px+'
};

// Key test scenarios
const testScenarios = [
  'Portrait mobile (375x667)',
  'Landscape mobile (667x375)',
  'Tablet portrait (768x1024)',
  'Desktop (1920x1080)'
];
```

### Integration Testing
- **Game Flow**: Splash screen to game transition
- **Data Persistence**: User progress and attempts tracking
- **Realtime Features**: Live participant count updates
- **Error Recovery**: Network reconnection and data refresh

## Implementation Approach

### Phase 1: Core Layout
1. Implement split-screen container structure
2. Add background image positioning and overlays
3. Create responsive grid system
4. Implement basic typography

### Phase 2: Interactive Elements
1. Style and position the start button
2. Add hover and touch animations
3. Integrate existing state management
4. Implement loading states

### Phase 3: Data Integration
1. Preserve all existing API calls
2. Adapt UI elements to new layout
3. Implement error handling
4. Add performance optimizations

### Phase 4: Polish and Testing
1. Fine-tune animations and transitions
2. Optimize for mobile performance
3. Comprehensive testing across devices
4. Accessibility improvements

## Design Decisions and Rationales

### Color Choices
- **Red for AI**: Creates association with "danger" or "artificial"
- **Teal-Green for Real**: Represents "nature" and "authenticity"
- **Green Theme**: Replaces blue theme as requested, maintains brand consistency

### Layout Decisions
- **50/50 Split**: Creates perfect balance and immediate visual impact
- **Centered Overlay**: Ensures content readability across all screen sizes
- **Floating Elements**: Allows background to show through while maintaining functionality

### Typography Decisions
- **Large Title**: Maximizes impact and readability
- **System Fonts**: Ensures fast loading and consistent rendering
- **High Contrast**: White text with shadows ensures readability over any background

### Performance Decisions
- **Image Optimization**: WebP format with JPEG fallbacks
- **CSS-only Animations**: Avoids JavaScript animation overhead
- **Minimal Dependencies**: Leverages existing Tailwind CSS classes where possible
