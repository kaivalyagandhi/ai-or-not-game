# Design Document

## Overview

This design focuses on creating a more compact, mobile-optimized layout for the scoring system and leaderboard components. The primary goal is to eliminate vertical scrolling while maintaining all functionality and improving information density through strategic horizontal layouts and simplified displays.

## Architecture

### Component Structure

The design will modify two main components:
- **ResultsScreen**: The Challenge Complete screen showing player results
- **LeaderboardTabs**: The leaderboard display with rankings

### Layout Strategy

The design employs a horizontal-first approach to maximize screen real estate:
1. **Horizontal Pairing**: Related elements are placed side-by-side
2. **Single-line Text**: Multi-line descriptions are condensed to single lines
3. **Simplified Displays**: Remove unnecessary footer text and indicators
4. **Top 10 Focus**: Limit leaderboard to essential entries with smart user positioning

## Components and Interfaces

### ResultsScreen Layout Changes

#### Score and Badge Horizontal Layout
```typescript
// Current: Vertical stacking
<ScoreCard />
<BadgeCard />

// New: Horizontal layout
<div className="grid grid-cols-2 gap-4">
  <ScoreCard />
  <BadgeCard />
</div>
```

#### Badge Card Redesign
```typescript
// Current: Vertical badge layout
<div className="text-center">
  <div className="emoji" />
  <h3 className="title" />
  <p className="description" />
</div>

// New: Horizontal badge layout with single-line description
<div className="flex items-center gap-3">
  <span className="emoji" />
  <div>
    <h3 className="title" />
    <p className="description truncate" />
  </div>
</div>
```

#### Rankings and CTA Horizontal Layout
```typescript
// Current: Vertical stacking
<RankingsSection />
<CTAButtons />

// New: Horizontal layout
<div className="grid grid-cols-2 gap-4">
  <RankingsSection />
  <CTAButtons />
</div>
```

### LeaderboardTabs Enhancements

#### Header Redesign
```typescript
// Current: Left-aligned with Live indicator
<div className="flex items-center gap-3">
  <h2>Leaderboard</h2>
  <LiveIndicator />
</div>

// New: Center-aligned with back button
<div className="flex items-center justify-between">
  <BackButton />
  <h2 className="text-center flex-1">Leaderboard</h2>
  <div /> {/* Spacer for balance */}
</div>
```

#### Top 10 with Smart User Positioning
```typescript
interface LeaderboardDisplay {
  entries: LeaderboardEntry[];
  userRank?: number;
  showEllipsis: boolean;
}

// Logic for user positioning
const getDisplayEntries = (entries: LeaderboardEntry[], userRank?: number) => {
  const top10 = entries.slice(0, 10);
  
  if (!userRank || userRank <= 10) {
    return { entries: top10, showEllipsis: false };
  }
  
  const userEntry = entries.find(e => e.userId === currentUserId);
  return {
    entries: [...top10, userEntry].filter(Boolean),
    showEllipsis: true
  };
};
```

## Data Models

### Updated Display Formatting

#### Number Formatting
```typescript
// Remove decimals from all numerical displays
const formatScore = (score: number): string => Math.round(score).toString();
const formatTimeBonus = (bonus: number): string => `+${Math.round(bonus)}`;
```

#### Icon Updates
```typescript
// Replace lightning bolt with timer emoji
const TIMER_ICON = '⏱️'; // Instead of '⚡'
```

### Responsive Grid System

```typescript
// Responsive breakpoints for horizontal layouts
const layoutClasses = {
  scoreAndBadge: "grid grid-cols-1 md:grid-cols-2 gap-4",
  rankingsAndCTA: "grid grid-cols-1 md:grid-cols-2 gap-4",
  ctaButtons: "grid grid-cols-2 gap-3"
};
```

## Error Handling

### Layout Overflow Protection
- Implement text truncation for long badge descriptions
- Add responsive breakpoints to stack elements vertically on very small screens
- Ensure minimum touch target sizes for mobile interaction

### Data Fallbacks
- Handle cases where user rank is not available
- Provide fallback content for empty leaderboards
- Graceful degradation when realtime connection fails

## Testing Strategy

### Layout Testing
1. **Viewport Testing**: Verify layouts work across different screen sizes
2. **Content Length Testing**: Test with various username and description lengths
3. **Data State Testing**: Test with different user ranking scenarios

### Responsive Design Testing
```typescript
// Test cases for responsive behavior
const testCases = [
  { viewport: '320px', description: 'Mobile portrait' },
  { viewport: '768px', description: 'Tablet portrait' },
  { viewport: '1024px', description: 'Desktop' }
];
```

### User Experience Testing
1. **Navigation Flow**: Test back button functionality from leaderboard
2. **Touch Targets**: Verify button sizes meet accessibility standards
3. **Information Density**: Ensure all content remains readable in compact layout

## Implementation Approach

### Phase 1: ResultsScreen Layout
1. Implement horizontal score and badge layout
2. Redesign badge card with inline emoji and title
3. Create horizontal rankings and CTA section
4. Update number formatting throughout

### Phase 2: LeaderboardTabs Enhancement
1. Add back button to header
2. Center-align leaderboard title
3. Implement top 10 display logic
4. Add ellipsis and user rank positioning
5. Remove footer text

### Phase 3: Icon and Text Updates
1. Replace lightning bolt icons with timer emoji
2. Remove Live indicator from header
3. Ensure all numbers display without decimals
4. Test single-line text truncation

### Phase 4: Mobile Optimization
1. Add responsive breakpoints
2. Test touch interaction areas
3. Verify no vertical scrolling required
4. Optimize for common mobile screen sizes

## Design Decisions and Rationales

### Horizontal Layout Choice
- **Rationale**: Maximizes use of available screen width, especially important on mobile devices where vertical space is limited
- **Trade-off**: May require responsive stacking on very narrow screens

### Top 10 Leaderboard Limit
- **Rationale**: Reduces cognitive load and focuses attention on top performers while still showing user position
- **Implementation**: Smart ellipsis system maintains user context without overwhelming the display

### Single-line Badge Descriptions
- **Rationale**: Maintains information while reducing vertical space usage
- **Implementation**: CSS truncation with ellipsis for overflow text

### Removal of Decimal Places
- **Rationale**: Cleaner visual appearance and easier mental processing of scores
- **Implementation**: Math.round() for all score displays while maintaining precision in calculations
