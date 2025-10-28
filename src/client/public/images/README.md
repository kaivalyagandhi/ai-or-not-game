# Game Images Directory

This directory contains all image pairs used in the "Spot the Bot" game.

## Directory Structure

```
images/
├── animals/          # Animal-related images
├── architecture/     # Buildings and structures
├── nature/          # Natural landscapes and scenery
├── food/            # Food and culinary images
└── products/        # Products and manufactured items
```

## Image Pair Requirements

Each category should contain multiple image pairs following this naming convention:

- `pair{number}-human.{ext}` - Human-created/photographed image
- `pair{number}-ai.{ext}` - AI-generated image

## Game Logic Integration

The game randomly selects one image pair from each category to create a 6-round game. The categories are:

1. **Animals** (`ImageCategory.ANIMALS`)
2. **Architecture** (`ImageCategory.ARCHITECTURE`) 
3. **Nature** (`ImageCategory.NATURE`)
4. **Food** (`ImageCategory.FOOD`)
5. **Products** (`ImageCategory.PRODUCTS`)

## Technical Requirements

- **Supported formats**: `.jpg`, `.jpeg`, `.png`, `.webp`
- **File size**: Under 2MB per image recommended
- **Resolution**: High quality but web-optimized
- **Naming**: Must follow the exact naming convention for the game logic to work

## Adding New Image Pairs

1. Choose the appropriate category folder
2. Number your pairs sequentially (pair1, pair2, pair3, etc.)
3. Ensure both human and AI versions have the same pair number
4. Test that images load correctly in the game

## Image Content Guidelines

- Images should be challenging but fair to distinguish
- Similar composition and subject matter between human/AI versions
- High visual quality and clear details
- Appropriate content for all audiences
