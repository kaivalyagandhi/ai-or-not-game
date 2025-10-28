# Educational Content Management

This directory contains the content files for Spot the Bot's educational and inspirational features.

## File Structure

- `educational-tips.json` - Tips for identifying AI-generated images
- `ai-facts.json` - Fun facts about AI image generation
- `inspirational-content.json` - Quotes and jokes for results screen

## Content Format

### Educational Tips (`educational-tips.json`)
```json
{
  "tips": [
    "Look for unnatural lighting or shadows that don't match the scene...",
    "Check hands and fingers carefully - AI often generates extra fingers..."
  ]
}
```

### AI Facts (`ai-facts.json`)
```json
{
  "facts": [
    "AI image generators learn by studying millions of real photos...",
    "Modern AI can create images in seconds that would take human artists hours..."
  ]
}
```

### Inspirational Content (`inspirational-content.json`)
```json
{
  "quotes": [
    "Every expert was once a beginner. Keep practicing!",
    "Your human intuition is valuable in the digital age."
  ],
  "jokes": [
    "Why don't AI images win at poker? They always have a tell - extra fingers!",
    "What's an AI's favorite photography? Anything without hands!"
  ]
}
```

## Daily Rotation

Content rotates daily at 00:00 UTC using a date-based hash function to ensure:
- Consistent content for all players on the same day
- Different content each day
- Predictable rotation through all available content

## Content Guidelines

### Educational Tips
- Focus on practical, observable differences
- Use accessible language for general audiences
- Keep tips concise but informative
- Cover various aspects: lighting, anatomy, text, patterns, etc.

### AI Facts
- Present information in everyday language
- Focus on interesting, non-technical aspects
- Keep facts engaging and accessible
- Avoid overly technical jargon

### Inspirational Content
- **Quotes**: Motivational and encouraging
- **Jokes**: Light-hearted and AI-themed
- Keep content appropriate for all audiences
- Balance humor with encouragement

## Editing Content

1. Edit the JSON files directly
2. Ensure valid JSON syntax
3. Test locally using `/api/test/daily-reset` endpoint
4. Content updates take effect on the next daily reset (00:00 UTC)

## API Endpoints

- `GET /api/content/educational` - All educational content
- `GET /api/content/inspirational` - All inspirational content  
- `GET /api/content/current` - Current day's selected content

## Error Handling

The system includes fallback content if files fail to load:
- Basic tips about AI detection
- Simple facts about AI image generation
- Generic motivational content

This ensures the game continues to function even if content files are corrupted or missing.
