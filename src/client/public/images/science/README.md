# Science Category Images

This directory contains image pairs for the Science category in AI or Not?.

## Folder Structure

```
science/
├── README.md (this file)
├── pair1-human.jpg    # Real science/lab/research image
├── pair1-ai.jpg       # AI-generated science image
├── pair2-human.jpg    # Real science/lab/research image
├── pair2-ai.jpg       # AI-generated science image
└── ...                # Additional pairs as needed
```

## Image Requirements

### File Naming Convention
- Human images: `pair{N}-human.{ext}`
- AI images: `pair{N}-ai.{ext}`
- Supported extensions: `.jpg`, `.jpeg`, `.png`, `.webp`

### Content Guidelines
- **Human images**: Real photographs of scientific equipment, laboratories, research facilities, experiments, microscopy images, astronomical photos, etc.
- **AI images**: AI-generated images of similar scientific content using tools like DALL-E, Midjourney, or Stable Diffusion

### Technical Requirements
- Resolution: Minimum 800x600, recommended 1024x1024 or higher
- File size: Keep under 2MB per image for optimal loading
- Format: JPEG preferred for photographs, PNG for images with transparency

## Current Status

⚠️ **No image pairs uploaded yet**

To complete the Science category implementation:

1. Upload image pairs following the naming convention above
2. Ensure each pair has one human-created and one AI-generated image
3. Update the `getKnownPairsForCategory` function in `src/server/core/image-loader.ts` to include the uploaded pairs

## Example Pair Entry

Once images are uploaded, add entries like this to the image loader:

```typescript
case ImageCategory.SCIENCE:
  return [
    { pairNumber: 1, humanFilename: 'pair1-human.jpg', aiFilename: 'pair1-ai.jpg' },
    { pairNumber: 2, humanFilename: 'pair2-human.jpg', aiFilename: 'pair2-ai.png' },
    // Add more pairs as needed
  ];
```

## Content Ideas

### Human Images
- Laboratory equipment and setups
- Microscopy images (cells, bacteria, crystals)
- Astronomical photographs (planets, galaxies, nebulae)
- Scientific instruments and devices
- Research facilities and clean rooms
- Chemical reactions and experiments
- Medical imaging (X-rays, MRI scans)
- Geological formations and minerals

### AI Generated Images
- Similar scientific content generated using AI tools
- Should match the style and subject matter of human counterparts
- Can include futuristic or conceptual scientific visualizations
