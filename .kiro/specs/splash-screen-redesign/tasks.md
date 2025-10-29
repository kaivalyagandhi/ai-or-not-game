# Splash Screen Redesign Implementation Plan

- [x] 1. Prepare image assets and theme configuration

  - Add golden retriever puppy images to the public assets directory
  - Create optimized versions (WebP with JPEG fallbacks) for web performance
  - Define color theme constants replacing blue with green theme
  - Set up image preloading utilities for smooth loading experience
  - _Requirements: 1.2, 1.4, 5.4_

- [x] 2. Implement split-screen layout structure

  - Create the base split-screen container with 50/50 layout
  - Implement responsive CSS Grid or Flexbox for the two halves
  - Add background image positioning and sizing for both panels
  - Ensure proper aspect ratio maintenance across screen sizes
  - _Requirements: 1.1, 4.2_

- [x] 3. Add colored overlays and visual effects

  - Implement red semi-transparent overlay for the left half
  - Implement teal-green semi-transparent overlay for the right half
  - Add "AI" and "REAL" corner labels with proper styling
  - Create smooth gradient transitions and visual polish
  - _Requirements: 1.3, 1.4, 2.4_

- [x] 4. Redesign typography and text positioning

  - Update main title to "AI or Not?!" with arcade-style typography
  - Update subtitle to "Can you tell AI from reality?"
  - Implement text shadows and contrast for readability over overlays
  - Position text elements in the centered overlay area
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5. Redesign and reposition the start button

  - Style the start button with arcade-game aesthetics
  - Position button prominently in the center of the screen
  - Implement hover and touch interaction animations
  - Ensure button meets mobile touch target size requirements
  - Preserve existing functionality for play limits and disabled states
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Integrate existing functionality with new layout

  - Adapt participant count display to fit the new design
  - Integrate play attempts and best score information compactly
  - Preserve all existing API calls and state management
  - Maintain realtime connection functionality
  - Ensure error handling and offline capabilities work with new layout
  - _Requirements: 5.1, 5.2, 6.1, 6.2, 6.3_

- [x] 7. Implement mobile-first responsive design

  - Optimize layout for mobile devices (320px and up)
  - Ensure proper scaling for tablet and desktop screens
  - Test touch interactions and gesture support
  - Optimize image loading and performance for mobile networks
  - _Requirements: 4.1, 4.3, 4.4, 4.5_

- [x] 8. Add loading states and animations

  - Implement image preloading with loading indicators
  - Add smooth fade-in animations for the split-screen reveal
  - Create subtle hover and interaction animations
  - Ensure animations perform well on lower-end devices
  - _Requirements: 4.5, 3.4_

- [x] 9. Comprehensive testing and accessibility

  - Test across different browsers and devices
  - Verify accessibility compliance (contrast, keyboard navigation)
  - Test with screen readers and assistive technologies
  - Validate performance metrics and loading times
  - _Requirements: 2.5, 6.4_

- [x] 10. Performance optimization and polish
  - Optimize image compression and loading strategies
  - Fine-tune animations and transitions
  - Implement lazy loading for non-critical elements
  - Add error boundary handling for image loading failures
  - _Requirements: 4.5, 6.3_
