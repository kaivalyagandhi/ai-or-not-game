# Design Document

## Overview

This design outlines the implementation of comprehensive UI updates to the AI or Not game, focusing on a cohesive blue color palette transition and enhanced content presentation. The changes will improve visual consistency, user engagement, and information accessibility across all game screens.

## Architecture

### Color System Architecture

The color system will be updated using a systematic approach:

1. **Primary Color Mapping**: Replace existing indigo-based colors with the new blue palette
2. **Gradient Updates**: Modify background gradients to use the new color scheme
3. **Component-Level Changes**: Update individual components while maintaining design consistency
4. **Accessibility Preservation**: Ensure text contrast ratios remain compliant

### Component Architecture

The updates will affect three main UI areas:
- **SplashScreen Component**: Starting screen with new rankings and challenge information
- **ResultsScreen Component**: Challenge completion screen with updated sharing functionality
- **Global Styles**: CSS color definitions and utility classes

## Components and Interfaces

### Color Palette Mapping

```typescript
// Current → New Color Mappings
const colorMappings = {
  // Background colors
  '#f7fbff': '#e2f0ff',
  'bg-indigo-600': 'bg-[#3da8ff]',
  'bg-indigo-700': 'bg-[#2d96e6]',
  'bg-indigo-50': 'bg-[#f0f8ff]',
  'bg-indigo-100': 'bg-[#e1f2ff]',
  
  // Text colors
  'text-indigo-600': 'text-[#3da8ff]',
  'text-indigo-700': 'text-[#2d96e6]',
  'text-indigo-500': 'text-[#4db3ff]',
  
  // Border colors
  'border-indigo-600': 'border-[#3da8ff]',
  'border-indigo-500': 'border-[#4db3ff]',
  'border-indigo-100': 'border-[#e1f2ff]',
  
  // Gradients
  'from-indigo-50': 'from-[#f0f8ff]',
  'to-indigo-100': 'to-[#e1f2ff]'
};
```

### SplashScreen Component Updates

```typescript
interface SplashScreenProps {
  onStartGame: () => void;
}

interface SplashScreenState {
  weeklyRank: number | null;
  totalWeeklyPlayers: number | null;
  dailyPlayCount: number;
  loading: boolean;
}
```

**Key Changes:**
1. Remove robot emoji (🤖) from the header
2. Replace "How to Play" box with "Rankings" box showing weekly rank
3. Add "View Leaderboard" button to Rankings box
4. Update Daily Challenge box to show today's date without year and play count
5. Apply new color scheme throughout

### ResultsScreen Component Updates

```typescript
interface ShareMessageData {
  correctGuesses: number;
  totalImages: number;
  badgeName: string;
  badgeEmoji: string;
  dailyRank: number;
  totalDailyPlayers: number;
}

interface AITipFormData {
  aiTip: string;
  challengeMessage: string;
  editableComment: string;
}

interface ResultsScreenState {
  showAITipForm: boolean;
  submittingTip: boolean;
  hasRemainingPlays: boolean;
}
```

**Key Changes:**
1. Update Rankings box to show daily rank (instead of weekly)
2. Implement new sharing message template
3. Apply new color scheme throughout
4. Remove "View" from leaderboard button text
5. Make time bonus color consistent with correct answers color
6. Add "Post AI tip" button above "Challenge Friends"
7. Align three buttons vertically and evenly distributed
8. Change "Play Again" to "Play Again Tomorrow!" when disabled
9. Implement AI tip form functionality

### Sharing Message Template

```typescript
const generateShareMessage = (data: ShareMessageData): string => {
  return `I just finished today's AI or Not? challenge:
✅ Correct Guesses: ${data.correctGuesses}/${data.totalImages} images
🏆 Badge Earned: ${data.badgeEmoji} ${data.badgeName}
📈 Daily Rank: #${data.dailyRank} of ${data.totalDailyPlayers} players
Want to see if you can beat me before I get my next try?`;
};
```

### AI Tip Form Component

```typescript
interface AITipFormProps {
  aiTip: string;
  challengeMessage: string;
  onSubmit: (comment: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const generateAITipComment = (challengeMessage: string, aiTip: string): string => {
  return `${challengeMessage}
Here's my AI detection tip to help you: ${aiTip}`;
};
```

### Button Layout Design

```typescript
interface ButtonLayoutProps {
  hasRemainingPlays: boolean;
  onPostAITip: () => void;
  onChallengeFriends: () => void;
  onPlayAgain: () => void;
}

// Button arrangement: vertically stacked, evenly distributed
// 1. Post AI tip (new)
// 2. Challenge Friends
// 3. Play Again / Play Again Tomorrow!
```

## Data Models

### Weekly Ranking Data

```typescript
interface WeeklyRankingData {
  userRank: number | null;
  totalParticipants: number | null;
  loading: boolean;
  error?: string;
}
```

### Daily Play Count Data

```typescript
interface DailyPlayData {
  playCount: number;
  maxAttempts: number;
  loading: boolean;
}
```

## Error Handling

### API Error Handling

1. **Ranking Data Failures**: Gracefully handle API failures when fetching weekly rankings
2. **Play Count Failures**: Show fallback values when daily play count is unavailable
3. **Network Timeouts**: Implement retry logic with exponential backoff
4. **Fallback Content**: Display placeholder content when data is unavailable

### User Experience Considerations

1. **Loading States**: Show loading indicators while fetching ranking and play count data
2. **Error Messages**: Display user-friendly error messages for failed operations
3. **Offline Handling**: Provide meaningful feedback when network is unavailable

## Testing Strategy

### Visual Regression Testing

1. **Color Consistency**: Verify all color changes are applied correctly across components
2. **Responsive Design**: Test color updates on different screen sizes
3. **Accessibility**: Validate contrast ratios meet WCAG guidelines

### Functional Testing

1. **API Integration**: Test weekly ranking and daily play count data fetching
2. **Sharing Functionality**: Verify new message template generates correctly
3. **User Interactions**: Test all button interactions and navigation flows

### Component Testing

1. **SplashScreen**: Test rankings display, play count display, and color updates
2. **ResultsScreen**: Test daily ranking display, sharing message generation, and color updates
3. **Cross-Component**: Verify consistent color usage across all screens

## Implementation Phases

### Phase 1: Color System Update
- Update CSS variables and Tailwind classes
- Apply new color mappings to all components
- Test visual consistency across screens

### Phase 2: SplashScreen Content Updates
- Remove robot emoji
- Implement weekly rankings display
- Add daily play count to challenge box
- Update layout and styling

### Phase 3: ResultsScreen UI Updates
- Update button text ("Leaderboard" instead of "View Leaderboard")
- Fix time bonus color to match correct answers color
- Implement button layout with even vertical distribution
- Update play again button state and text

### Phase 4: AI Tip Feature Implementation
- Create AI tip form component
- Implement comment posting functionality
- Add server-side Reddit API integration for comments
- Test form submission and error handling

### Phase 5: Integration and Testing
- End-to-end testing of all changes
- Performance optimization
- Accessibility validation
- Cross-browser compatibility testing

## Devvit Integration Requirements

### Reddit API Permissions

The app will need the following Devvit permissions to post comments:
- `reddit.read` - to read post information
- `reddit.submit` - to submit comments on behalf of users

### Comment Posting Implementation

```typescript
// Server-side implementation using Devvit Reddit API
import { Devvit } from '@devvit/public-api';

const postAITipComment = async (
  reddit: Devvit.Context['reddit'],
  postId: string,
  comment: string
): Promise<{ success: boolean; commentId?: string; error?: string }> => {
  try {
    const result = await reddit.submitComment({
      id: postId,
      text: comment,
    });
    
    return {
      success: true,
      commentId: result.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};
```

### Form Component Design

The AI tip form will be a modal overlay with:
1. Pre-populated text area with challenge message + AI tip
2. Editable text area for user modifications
3. Submit and Cancel buttons
4. Loading state during submission
5. Success/error feedback

## API Requirements

### New Endpoints Needed

1. **Weekly User Rank**: `GET /api/leaderboard/user-rank/weekly`
2. **Daily Play Count**: `GET /api/game/daily-play-count`
3. **Post AI Tip Comment**: `POST /api/comments/post-ai-tip`

### Existing Endpoints to Modify

1. **Daily User Rank**: Ensure `GET /api/leaderboard/user-rank/daily` returns total participants
2. **Play Attempts**: Verify `GET /api/game/play-attempts` includes daily count

### AI Tip Comment API

```typescript
interface PostAITipRequest {
  comment: string;
  postId: string;
}

interface PostAITipResponse {
  success: boolean;
  commentId?: string;
  error?: string;
}
```

## Performance Considerations

### Caching Strategy

1. **Weekly Rankings**: Cache for 1 hour to reduce API calls
2. **Daily Play Count**: Cache for 5 minutes for real-time accuracy
3. **Color Assets**: Leverage browser caching for CSS updates

### Loading Optimization

1. **Parallel API Calls**: Fetch ranking and play count data simultaneously
2. **Progressive Loading**: Show UI elements as data becomes available
3. **Fallback Content**: Display meaningful placeholders during loading states
