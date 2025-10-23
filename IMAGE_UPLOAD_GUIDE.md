# Image Upload Guide for Spot the Bot

This guide explains how to upload and organize image pairs for the "Spot the Bot" game.

## Directory Structure

Upload your images to the following directory structure:

```
src/client/public/images/
├── animals/          # Animal-related images
├── architecture/     # Buildings and structures  
├── nature/          # Natural landscapes and scenery
├── food/            # Food and culinary images
└── products/        # Products and manufactured items
```

## Naming Convention

**Critical**: You must follow this exact naming pattern for the game to work:

- `pair{number}-human.{ext}` - Human-created/photographed image
- `pair{number}-ai.{ext}` - AI-generated image

### Examples

```
animals/
├── pair1-human.jpg
├── pair1-ai.jpg
├── pair2-human.png
├── pair2-ai.png
├── pair3-human.webp
└── pair3-ai.webp

architecture/
├── pair1-human.jpg
├── pair1-ai.jpg
├── pair2-human.jpg
└── pair2-ai.jpg
```

## Image Requirements

### Technical Specifications
- **Supported formats**: `.jpg`, `.jpeg`, `.png`, `.webp`
- **File size**: Under 2MB per image (recommended)
- **Resolution**: High quality but web-optimized (1024x1024 or similar)
- **Content**: Appropriate for all audiences

### Content Guidelines
- Images should be challenging but fair to distinguish between AI and human-created
- Similar composition and subject matter between human/AI versions in each pair
- High visual quality with clear details
- Each category should have multiple pairs for variety

## Game Logic Integration

The game works as follows:

1. **Daily Selection**: Each day, the game randomly selects one image pair from each category
2. **Round Structure**: Creates 5 rounds (one per category) in randomized order
3. **AI Placement**: Randomly places AI images on left or right side
4. **Scoring**: Players get points for correctly identifying the human-created image

## Categories Explained

### Animals (`ImageCategory.ANIMALS`)
- Pets, wildlife, domestic animals
- Focus on natural vs artificial-looking animals
- Consider fur texture, eye details, natural poses

### Architecture (`ImageCategory.ARCHITECTURE`) 
- Buildings, bridges, structures
- Look for architectural accuracy, lighting, perspective
- Consider structural feasibility and design coherence

### Nature (`ImageCategory.NATURE`)
- Landscapes, forests, mountains, water scenes
- Focus on natural lighting, realistic weather patterns
- Consider geological accuracy and natural formations

### Food (`ImageCategory.FOOD`)
- Meals, ingredients, culinary creations
- Look for realistic textures, natural food physics
- Consider plating, garnishing, and food photography techniques

### Products (`ImageCategory.PRODUCTS`)
- Manufactured items, gadgets, consumer goods
- Focus on material textures, branding, functionality
- Consider product photography standards and lighting

## Adding New Image Pairs

1. **Choose Category**: Select the appropriate category folder
2. **Number Sequentially**: Use the next available pair number (pair1, pair2, pair3, etc.)
3. **Match Pairs**: Ensure both human and AI versions have the same pair number
4. **Test Loading**: Verify images load correctly in the game
5. **Quality Check**: Ensure the pair provides a fair but challenging comparison

## Development vs Production

### Development Mode
- The system currently uses example/placeholder images
- Upload your real images to replace the placeholders
- Test with `npm run dev` to see your images in action

### Production Deployment
- All images in the `src/client/public/images/` folder will be deployed
- Images are served directly from the `/images/` URL path
- Ensure all image pairs are complete before deployment

## Troubleshooting

### Images Not Loading
- Check file naming exactly matches the pattern: `pair{number}-{human|ai}.{ext}`
- Verify file extensions are lowercase
- Ensure files are in the correct category folder

### Game Shows Errors
- Make sure each category has at least one complete pair
- Verify both human and AI images exist for each pair number
- Check that file formats are supported (.jpg, .jpeg, .png, .webp)

### Performance Issues
- Optimize image file sizes (under 2MB recommended)
- Use appropriate image formats (WebP for best compression)
- Consider image dimensions (1024x1024 is usually sufficient)

## Example Upload Checklist

Before deploying, ensure:

- [ ] Each category folder has at least 3-5 image pairs
- [ ] All pairs follow the exact naming convention
- [ ] Both human and AI images exist for each pair number
- [ ] Images are high quality but web-optimized
- [ ] Content is appropriate and challenging
- [ ] File sizes are reasonable (under 2MB each)
- [ ] Game has been tested with the new images

## Need Help?

If you encounter issues:

1. Check the browser console for error messages
2. Verify the naming convention is exactly correct
3. Test with a small number of pairs first
4. Ensure images are accessible at the expected URLs (e.g., `/images/animals/pair1-human.jpg`)

The game will automatically discover and use any properly named image pairs you upload to the category folders.
