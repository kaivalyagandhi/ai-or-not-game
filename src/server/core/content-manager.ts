import { EducationalContent, InspirationContent } from '../../shared/types/index.js';

export interface ContentFiles {
  tips: { tips: string[] };
  facts: { facts: string[] };
  inspiration: { quotes: string[]; jokes: string[] };
}

export class ContentManager {
  private static instance: ContentManager;
  private contentCache: {
    tips: string[];
    facts: string[];
    quotes: string[];
    jokes: string[];
  } | null = null;
  private lastLoadDate: string | null = null;

  private constructor() {}

  public static getInstance(): ContentManager {
    if (!ContentManager.instance) {
      ContentManager.instance = new ContentManager();
    }
    return ContentManager.instance;
  }

  /**
   * Load content from embedded data (since fs is not available in serverless environment)
   */
  private loadContentFromFiles(): ContentFiles {
    try {
      // Import content directly since we can't use fs in serverless environment
      const tips = this.getEmbeddedTips();
      const facts = this.getEmbeddedFacts();
      const inspiration = this.getEmbeddedInspiration();

      // Validate content structure
      this.validateContentStructure(tips, facts, inspiration);

      return { tips, facts, inspiration };
    } catch (error) {
      console.error('Error loading content:', error);
      return this.getFallbackContent();
    }
  }

  /**
   * Get embedded educational tips (replaces file reading)
   */
  private getEmbeddedTips(): { tips: string[] } {
    return {
      tips: [
        "Look for unnatural lighting or shadows that don't match the scene.",
        "Check hands and fingers carefully - AI often generates extra fingers or distorted anatomy.",
        "Examine text in images - AI-generated text is often blurry, nonsensical, or has impossible characters.",
        "Watch for impossible reflections or shadows that don't match the lighting.",
        "Look for repetitive patterns or textures that seem too perfect or artificial.",
        "Check for anatomical inconsistencies in people and animals.",
        "Notice if small details like jewelry, buttons, or accessories look warped or impossible.",
        "AI often struggles with complex scenes - look for objects that don't make physical sense.",
        "Check if the image has an 'uncanny valley' feeling - something that looks almost right but feels off.",
        "Look for inconsistent perspective or impossible geometry in architectural elements."
      ]
    };
  }

  /**
   * Get embedded AI facts (replaces file reading)
   */
  private getEmbeddedFacts(): { facts: string[] } {
    return {
      facts: [
        "AI image generators learn by studying millions of real photos to understand patterns and styles.",
        "Modern AI can create photorealistic images in seconds that would take human artists hours or days.",
        "AI image generators use neural networks inspired by how human brains process visual information.",
        "The most advanced AI models can generate images at resolutions up to 1024x1024 pixels or higher.",
        "AI struggles most with generating realistic hands, text, and complex human interactions.",
        "Some AI models are trained on over 5 billion image-text pairs from the internet.",
        "AI-generated images often have subtle tells like impossible lighting or physics-defying elements.",
        "The technology behind AI art uses something called 'diffusion models' that gradually build images from noise.",
        "AI can now generate images in specific artistic styles by learning from famous artists' works.",
        "Each AI-generated image is unique - the same prompt will produce different results every time."
      ]
    };
  }

  /**
   * Get embedded inspirational content (replaces file reading)
   */
  private getEmbeddedInspiration(): { quotes: string[]; jokes: string[] } {
    return {
      quotes: [
        "Every expert was once a beginner. Keep practicing your AI detection skills!",
        "Your human intuition is valuable in our increasingly digital world.",
        "Practice makes perfect - each game makes you better at spotting AI content.",
        "Trust your instincts - humans have evolved to notice when something feels 'off'.",
        "The future belongs to those who can work alongside AI while maintaining their human judgment.",
        "Every mistake is a learning opportunity to sharpen your visual perception.",
        "You're developing a superpower for the digital age - the ability to spot artificial content.",
        "Remember: AI is a tool created by humans, and humans can learn to understand it.",
        "Your curiosity and attention to detail are your greatest assets in this challenge.",
        "The more you play, the more you're training your brain to see what others might miss."
      ],
      jokes: [
        "Why don't AI images win at poker? They always have a tell - extra fingers!",
        "What's an AI's favorite type of photography? Anything without hands in the shot!",
        "Why did the AI go to art school? To learn proper finger counting!",
        "What do you call an AI that's bad at generating text? A spell-wreck generator!",
        "Why don't AI artists ever get tired? Because they never have to lift a finger... or count them!",
        "What's the difference between AI art and human art? About 2.7 extra fingers per hand!",
        "Why did the AI image fail the driving test? It couldn't handle the wheel properly!",
        "What's an AI's least favorite game? Rock, paper, scissors... it always generates rock, paper, scissors, thumb, pinky!",
        "Why don't AI models make good comedians? Their timing is always a bit off by a few milliseconds!",
        "What did the AI say when it finally generated perfect hands? 'I've got to hand it to myself!'"
      ]
    };
  }

  /**
   * Validate that loaded content has the expected structure
   */
  private validateContentStructure(tips: any, facts: any, inspiration: any): void {
    if (!tips.tips || !Array.isArray(tips.tips)) {
      throw new Error('Invalid tips structure: expected { tips: string[] }');
    }
    if (!facts.facts || !Array.isArray(facts.facts)) {
      throw new Error('Invalid facts structure: expected { facts: string[] }');
    }
    if (!inspiration.quotes || !Array.isArray(inspiration.quotes) ||
        !inspiration.jokes || !Array.isArray(inspiration.jokes)) {
      throw new Error('Invalid inspiration structure: expected { quotes: string[], jokes: string[] }');
    }
  }

  /**
   * Provide fallback content if files fail to load
   */
  private getFallbackContent(): ContentFiles {
    return {
      tips: {
        tips: [
          "Look for unnatural lighting or shadows that don't match the scene.",
          "Check hands and fingers carefully - AI often generates extra fingers.",
          "Examine text in images - AI-generated text is often blurry or nonsensical."
        ]
      },
      facts: {
        facts: [
          "AI image generators learn by studying millions of real photos.",
          "Modern AI can create images in seconds that would take human artists hours.",
          "AI image generators use neural networks inspired by human brains."
        ]
      },
      inspiration: {
        quotes: [
          "Every expert was once a beginner. Keep practicing!",
          "Your human intuition is valuable in the digital age.",
          "Practice makes perfect - each game makes you better."
        ],
        jokes: [
          "Why don't AI images win at poker? They always have a tell - extra fingers!",
          "What's an AI's favorite photography? Anything without hands!",
          "Why did the AI go to art school? To learn proper finger counting!"
        ]
      }
    };
  }

  /**
   * Get current date in YYYY-MM-DD format
   */
  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0] || new Date().toISOString().substring(0, 10);
  }

  /**
   * Load and cache content, refreshing daily
   */
  private ensureContentLoaded(): void {
    const currentDate = this.getCurrentDate();
    
    if (!this.contentCache || this.lastLoadDate !== currentDate) {
      const contentFiles = this.loadContentFromFiles();
      
      this.contentCache = {
        tips: contentFiles.tips.tips,
        facts: contentFiles.facts.facts,
        quotes: contentFiles.inspiration.quotes,
        jokes: contentFiles.inspiration.jokes
      };
      
      this.lastLoadDate = currentDate;
      console.log(`Content loaded for date: ${currentDate}`);
    }
  }

  /**
   * Get educational content for the current day
   */
  public getDailyEducationalContent(): EducationalContent {
    this.ensureContentLoaded();
    
    if (!this.contentCache) {
      throw new Error('Failed to load educational content');
    }

    // Use date-based rotation for consistent daily content
    const currentDate = this.getCurrentDate();
    const dateHash = this.hashString(currentDate);
    
    const tipIndex = dateHash % this.contentCache.tips.length;
    const factIndex = (dateHash + 1) % this.contentCache.facts.length;

    return {
      tips: this.contentCache.tips,
      facts: this.contentCache.facts,
      currentTipIndex: tipIndex,
      currentFactIndex: factIndex
    };
  }

  /**
   * Get inspirational content for the current day
   */
  public getDailyInspirationContent(): InspirationContent {
    this.ensureContentLoaded();
    
    if (!this.contentCache) {
      throw new Error('Failed to load inspirational content');
    }

    // Use date-based rotation for consistent daily content
    const currentDate = this.getCurrentDate();
    const dateHash = this.hashString(currentDate);
    
    // Alternate between quotes and jokes based on date
    const useQuotes = dateHash % 2 === 0;
    const contentArray = useQuotes ? this.contentCache.quotes : this.contentCache.jokes;
    const contentIndex = Math.floor(dateHash / 2) % contentArray.length;

    return {
      quotes: this.contentCache.quotes,
      jokes: this.contentCache.jokes,
      currentIndex: contentIndex,
      type: useQuotes ? 'quote' : 'joke'
    };
  }

  /**
   * Simple string hash function for consistent daily rotation
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get current tip for display
   */
  public getCurrentTip(): string {
    const content = this.getDailyEducationalContent();
    return content.tips[content.currentTipIndex] || content.tips[0] || 'No tip available';
  }

  /**
   * Get current fact for display
   */
  public getCurrentFact(): string {
    const content = this.getDailyEducationalContent();
    return content.facts[content.currentFactIndex] || content.facts[0] || 'No fact available';
  }

  /**
   * Get current inspirational content for display
   */
  public getCurrentInspiration(): string {
    const content = this.getDailyInspirationContent();
    const contentArray = content.type === 'quote' ? content.quotes : content.jokes;
    return contentArray[content.currentIndex] || contentArray[0] || 'Stay positive!';
  }

  /**
   * Force reload content (useful for testing or manual refresh)
   */
  public forceReload(): void {
    this.contentCache = null;
    this.lastLoadDate = null;
    this.ensureContentLoaded();
  }

  /**
   * Get all available content for API responses
   */
  public getAllContent(): {
    educational: EducationalContent;
    inspirational: InspirationContent;
  } {
    return {
      educational: this.getDailyEducationalContent(),
      inspirational: this.getDailyInspirationContent()
    };
  }
}

export const contentManager = ContentManager.getInstance();
