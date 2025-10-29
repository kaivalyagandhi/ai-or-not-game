# Splash Screen Image Assets

This directory contains the golden retriever puppy images used in the split-screen splash screen design.

## Required Images

### Left Panel (AI Side)
- `golden-retriever-left.webp` - WebP format for modern browsers
- `golden-retriever-left.jpg` - JPEG fallback for older browsers

### Right Panel (REAL Side)
- `golden-retriever-right.webp` - WebP format for modern browsers  
- `golden-retriever-right.jpg` - JPEG fallback for older browsers

## Image Specifications

### Dimensions
- **Minimum**: 800x600 pixels
- **Recommended**: 1200x900 pixels or higher
- **Aspect Ratio**: 4:3 or 16:12 preferred

### Format Requirements
- **WebP**: Optimized for web performance, smaller file sizes
- **JPEG**: Fallback format for browser compatibility
- **Quality**: 85-90% for JPEG, equivalent quality for WebP

### Content Guidelines
- **Subject**: Golden retriever puppies
- **Style**: High-quality, engaging photos that work well with colored overlays
- **Composition**: Images should work well when cropped/positioned as background images
- **Lighting**: Good contrast and clarity for overlay visibility

## Usage

These images are automatically loaded by the `imagePreloader.ts` utility with:
- WebP format detection and fallback to JPEG
- Preloading for smooth user experience
- Error handling for failed loads

## Performance Optimization

- Keep file sizes under 200KB when possible
- Use progressive JPEG encoding
- Optimize WebP with lossless compression where appropriate
- Test loading performance on mobile networks

## Replacement Instructions

1. Replace the placeholder files with actual golden retriever puppy images
2. Ensure both WebP and JPEG versions are provided
3. Test the images in the splash screen to verify they work well with the red and teal-green overlays
4. Verify loading performance across different devices and network conditions
