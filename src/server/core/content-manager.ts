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
   * Load content from JSON files (using dynamic imports since fs is not available in serverless environment)
   */
  private async loadContentFromFiles(): Promise<ContentFiles> {
    try {
      // Import JSON files directly using dynamic imports
      const [tipsModule, factsModule, inspirationModule] = await Promise.all([
        import('../content/educational-tips.json', { assert: { type: 'json' } }),
        import('../content/ai-facts.json', { assert: { type: 'json' } }),
        import('../content/inspirational-content.json', { assert: { type: 'json' } })
      ]);

      const tips = tipsModule.default;
      const facts = factsModule.default;
      const inspiration = inspirationModule.default;

      // Validate content structure
      this.validateContentStructure(tips, facts, inspiration);

      console.log(`✅ Content loaded successfully: ${tips.tips.length} tips, ${facts.facts.length} facts, ${inspiration.quotes.length} quotes, ${inspiration.jokes.length} jokes`);

      return { tips, facts, inspiration };
    } catch (error) {
      console.error('❌ Error loading content from JSON files:', error);
      console.log('🔄 Falling back to embedded content...');
      return this.getEmbeddedContent();
    }
  }

  /**
   * Load content synchronously from embedded data (fallback method)
   */
  private loadContentFromFilesSync(): ContentFiles {
    try {
      // Try to load from embedded content as fallback
      const tips = this.getEmbeddedTips();
      const facts = this.getEmbeddedFacts();
      const inspiration = this.getEmbeddedInspiration();

      // Validate content structure
      this.validateContentStructure(tips, facts, inspiration);

      console.log('⚠️ Using embedded content as fallback');
      return { tips, facts, inspiration };
    } catch (error) {
      console.error('❌ Error loading embedded content:', error);
      console.log('🆘 Using minimal fallback content...');
      return this.getFallbackContent();
    }
  }

  /**
   * Get educational tips from embedded data
   */
  private getEmbeddedTips(): { tips: string[] } {
    return {
      tips: [
        "Look for 'the smudge.' AI sometimes blurs or smudges details where objects meet, like a ring against a finger.",
        "AI still gets hands wrong. Count the fingers. If it looks like a horror movie monster's hand, you've found your tell.",
        "Check for perfect symmetry. Reality is rarely perfect. If a face or building is flawlessly symmetrical, it's a red flag.",
        "Read the text in the background. If it looks like enchanting table language from Minecraft, it's probably AI.",
        "Examine the eyes. AI can make them look glassy, dead, or have bizarre reflections. Real eyes have life.",
        "Weird patterns are a classic AI glitch. Look for repeating textures in fur, fabric, or bricks that don't feel natural.",
        "Lighting is hard. If shadows are going in the wrong direction or a light source is missing, it's a giveaway.",
        "Look for 'waxy' skin. AI sometimes smooths faces so much they look like they're made of plastic.",
        "Physics are optional for AI. Look for floating objects, impossible architecture, or clothing that defies gravity.",
        "The 'uncanny valley' is your friend. If an image just feels 'off' or creepy for no reason, trust your gut.",
        "AI struggles with complexity. A crowd of people might have duplicate faces or weirdly morphed bodies in the background.",
        "Check the ears. Like hands, AI devs haven't quite patched the ear-generation bug yet. Look for strange shapes.",
        "Zoom in! Small details like mismatched earrings, weirdly shaped teeth, or blurry logos can expose the AI.",
        "Look at the hair. AI often creates hair that's either a perfect helmet or a chaotic, stringy mess.",
        "Reflections don't lie. Check mirrors, windows, or water. If the reflection is distorted or missing, you've got it.",
        "AI loves to 'over-render.' Sometimes an image is just too sharp, too perfect, too detailed to be real.",
        "Look for a lack of story. Real photos usually capture a moment. AI images can feel random and disconnected.",
        "Morphed objects are a dead giveaway. Is that a dog-cat? A car-plane? You're looking at an AI.",
        "Edges can be a problem. Look for blurry or unnaturally sharp lines where two objects meet.",
        "Fabric and clothing can be a weak spot. AI might not understand how a shirt should wrinkle or a dress should drape.",
        "Check for consistent style. Sometimes one part of an AI image looks photorealistic and another looks like a painting.",
        "AI is bad at context. A person wearing a winter coat on a sunny beach? Probably AI.",
        "Look for genericism. AI-generated people can sometimes look like a blend of a thousand faces, but with no unique features.",
        "Strange proportions can be a sign. Is someone's arm a little too long? Is a car's wheel a little too small?",
        "Food that looks too perfect is a common AI trait. Real food has blemishes and imperfections.",
        "AI has a hard time with brand logos. It will often generate something that looks like a logo but is just gibberish.",
        "Lack of 'wear and tear' is a good tell. Real-world objects have scratches, dirt, and dust. AI's world is often pristine.",
        "Pay attention to liquids. Splashes, pours, and ripples can look unnatural or frozen in time.",
        "Animal anatomy is tough. AI might give an animal the wrong number of legs or place its ears in a weird spot.",
        "Depth of field can be a clue. AI sometimes makes everything in an image equally sharp, which is rare in photography.",
        "If you see a watermark, it's a good sign it's a real photo from a stock website. AI rarely adds them.",
        "Impossible camera angles can be a tell. If a shot looks like it was taken from a physically impossible position, question it.",
        "Look for a lack of emotion. AI is getting better, but the emotions on a person's face might not match the scene.",
        "AI can get stuck in loops, creating repeating patterns in the background or on clothing.",
        "Sometimes, the most boring image is the real one. AI tends to create visually spectacular images.",
        "Check for a lack of 'soul.' It's hard to define, but real photos often have an emotional core that AI can't replicate.",
        "AI can struggle with anything that requires a deep understanding of the world, like a complex machine or a cultural ceremony.",
        "Look for a 'digital' feel. Some AI images have a certain clean, crisp, almost sterile quality to them.",
        "If it looks like a 'deep dream' image from a few years ago, with weird eyes and psychedelic patterns, it's definitely AI.",
        "AI doesn't understand 'why.' It only understands 'what.' This can lead to images that are technically correct but logically wrong.",
        "A good strategy is to ignore the main subject and focus only on the background for a few seconds.",
        "AI can create things that don't exist. If you see a species of animal you've never seen before, be suspicious.",
        "Look for a lack of motion blur in action shots. Real photos of fast-moving objects usually have some blur.",
        "AI is trained on existing photos, so it can be bad at imagining truly novel concepts.",
        "If the 'photographer' would have been in extreme danger to take the shot (e.g., inside a lion's mouth), it might be AI.",
        "AI can be too literal. A prompt for 'a mouse on a keyboard' might result in a computer mouse sitting on a keyboard.",
        "Look for a lack of interaction between subjects. People in an AI-generated group might not be looking at each other.",
        "AI art often has a 'center-weighted' composition, with the most interesting thing happening right in the middle.",
        "Check the metadata. Sometimes, the filename or image properties can give you a clue (though not in this game!).",
        "Trust your training. The more you play 'AI or Not?', the better your brain will get at spotting the fakes.",
        "Look for misplaced accessories. Glasses might be floating, or a hat might be merging with someone's hair.",
        "AI sometimes struggles with consistent lighting on multiple people in the same scene.",
        "Check for illogical shadows. A person might cast a shadow, but the tree next to them doesn't.",
        "If an image features a very specific, niche meme, it's more likely to be human-made. AI isn't that culturally savvy yet.",
        "Look for a lack of dust, pollen, or other small particles in the air, especially in outdoor scenes.",
        "AI can create 'impossible' colors that don't exist in nature or photography.",
        "Sometimes the AI will 'hallucinate' details that aren't in the prompt, leading to weird, out-of-place objects.",
        "If you're really stuck, try to imagine taking the photo yourself. Does it feel like a real, plausible moment?",
        "Remember, the AI is always learning. The 'tells' of today might be patched in the AI of tomorrow.",
        "Playing 'AI or Not?' is basically like being a digital detective. Put on your thinking cap and look for clues."
      ]
    };
  }

  /**
   * Get AI facts from embedded data
   */
  private getEmbeddedFacts(): { facts: string[] } {
    return {
      facts: [
        "The term 'AI' was first used at a college conference in 1956. It's older than your parents' vinyl collection.",
        "An AI once created its own language that humans couldn't understand. The researchers had to shut it down. Skynet vibes, anyone?",
        "Some video game NPCs are powered by simple AI, which is why they keep walking into walls.",
        "AI image generators don't 'see' or 'think.' They're just incredibly complex pattern-matching machines.",
        "An AI-generated artwork was sold at an auction for $432,500. It was basically a blurry portrait.",
        "The 'Turing Test' is a famous experiment to see if a human can tell if they're talking to another human or an AI.",
        "AI is used in your favorite games for everything from enemy behavior to generating landscapes.",
        "The AI that powers image generation is often called a 'neural network,' inspired by the structure of the human brain.",
        "AI is getting so good, it can now 'dream' and create psychedelic, surreal images from random noise.",
        "An AI has even written a pop song. It's not a banger, but it's a start.",
        "AI can be used to 'upscale' old video games, making them look sharp and modern on 4K TVs.",
        "The same text prompt given to an AI image generator will create a different image every time. It's like a loot box for art.",
        "'Deepfakes' use the same kind of AI technology to create realistic but fake videos of people.",
        "AI has been taught to play and win complex games like Chess, Go, and even StarCraft II.",
        "Some AI models are trained on literally billions of images scraped from the internet. Your weird old DeviantArt page might be in there.",
        "AI image generation is a 'diffusion' process. The AI starts with digital static and slowly 'sculpts' an image out of it.",
        "There are AI-powered tools that can turn your doodles into photorealistic masterpieces.",
        "AI is even being used to help design new levels for games like DOOM.",
        "The 'uncanny valley' is that weird feeling you get when something looks almost human, but not quite. It's a big challenge for AI.",
        "An AI has been granted citizenship in Saudi Arabia. Her name is Sophia.",
        "AI is being used to help scientists discover new medicines and treatments for diseases.",
        "The first chatbot, ELIZA, was created in the 1960s. It was basically a primitive version of a therapy bot.",
        "AI can now generate realistic human faces of people who don't exist. Check out 'This Person Does Not Exist' online.",
        "Some people are worried about an 'AI singularity,' a future point where AI becomes so smart it surpasses human intelligence.",
        "An AI once beat a team of professional Dota 2 players. It learned the game from scratch in just two weeks.",
        "The movie 'Her' explored the idea of a romantic relationship between a human and an AI operating system.",
        "AI is used in your phone's camera to automatically adjust settings and make your photos look better.",
        "There's a whole genre of music called 'algorave,' where people dance to music generated by live-coded algorithms.",
        "AI can now write news articles, poems, and even computer code.",
        "The 'Loab' phenomenon was an AI-generated horror character that started appearing in multiple images, like a digital ghost.",
        "AI is being used to help farmers monitor their crops and improve their yields.",
        "The first self-driving car was developed in the 1980s, but it was very slow and clumsy.",
        "AI can be used to restore old, damaged photographs and videos with stunning clarity.",
        "Some AI-powered 'virtual influencers' on Instagram have millions of followers.",
        "AI is used by Netflix and Spotify to recommend new movies and music based on what you've liked before.",
        "The popular game 'No Man's Sky' uses procedural generation (a type of AI) to create its massive universe of planets.",
        "An AI has been trained to detect diseases like cancer from medical scans, sometimes more accurately than human doctors.",
        "The 'GAN' (Generative Adversarial Network) is a type of AI where two AIs compete against each other to improve their results.",
        "AI is being used to create more realistic and challenging opponents in racing games.",
        "An AI once wrote a script for a short film. It was... weird.",
        "AI can be used to 'inpaint' images, removing unwanted objects and seamlessly filling in the background.",
        "The term 'robot' comes from the Czech word 'robota,' which means 'forced labor' or 'serfdom.'",
        "AI is being used to help create more realistic and natural-sounding voices for virtual assistants.",
        "An AI has been trained to translate languages in real-time, like the 'Babel Fish' from Hitchhiker's Guide to the Galaxy.",
        "Some AI models are so large that training them requires a huge amount of energy, equivalent to a small town.",
        "AI is being used to help design more efficient and aerodynamic cars and planes.",
        "The 'AI effect' is the phenomenon where once an AI becomes commonplace, people stop considering it 'true' intelligence.",
        "AI can now compose music in the style of famous composers like Bach and Mozart.",
        "An AI has been used to create a new, unofficial 'Harry Potter' chapter.",
        "AI is being used to help power the smart assistants in your home, like Alexa and Google Assistant.",
        "The 'black box' problem refers to the fact that sometimes, even the creators of an AI don't know exactly how it makes its decisions.",
        "AI can be used to generate realistic-looking 3D models for use in video games and movies.",
        "An AI has been trained to lip-read more accurately than human experts.",
        "AI is being used to help moderate online communities and detect toxic behavior.",
        "The 'father of AI,' John McCarthy, was one of the people who coined the term back in 1956.",
        "AI is being used to help create more accessible technology for people with disabilities.",
        "An AI has been used to discover a new, previously unknown pattern in the prime numbers.",
        "AI is being used to help predict the weather and model the effects of climate change.",
        "By playing 'AI or Not?', you're helping to train the most advanced neural network of all: your own brain.",
        "The future of AI is still unwritten. It's up to us to decide how we want to use this powerful technology."
      ]
    };
  }

  /**
   * Get embedded content (matches JSON files exactly - used as fallback)
   */
  private getEmbeddedContent(): ContentFiles {
    return {
      tips: this.getEmbeddedTips(),
      facts: this.getEmbeddedFacts(),
      inspiration: this.getEmbeddedInspiration()
    };
  }

  /**
   * Get embedded inspirational content (matches inspirational-content.json exactly)
   */
  private getEmbeddedInspiration(): { quotes: string[]; jokes: string[] } {
    return {
      quotes: [
        "Every expert was once a beginner. Keep practicing your AI detection skills!",
        "The future belongs to those who can tell the difference between human and artificial creativity.",
        "Your ability to spot AI-generated content is a superpower in the digital age.",
        "Practice makes perfect - each game makes you better at identifying AI images.",
        "In a world of artificial intelligence, your human intuition is more valuable than ever.",
        "Great job exercising your critical thinking skills in the age of AI!",
        "You're developing an important skill for navigating our AI-enhanced world.",
        "Every mistake is a learning opportunity - you're getting better with each attempt!",
        "Your human eye for detail is what makes you special in an AI world.",
        "Keep questioning what you see - that's the key to staying ahead of AI deception."
      ],
      jokes: [
        "Why don't AI images ever win at poker? Because they always have a tell - usually an extra finger!",
        "What's an AI's favorite type of photography? Anything that doesn't require counting fingers correctly!",
        "Why did the AI image go to art school? To learn how to draw hands that don't look like octopi!",
        "What do you call an AI that's really good at generating images? Still not as good as you at spotting them!",
        "Why don't AI images ever become hand models? For obvious reasons... count the fingers!",
        "What's the difference between AI art and human art? About 2.3 extra fingers on average!",
        "Why did the AI image fail its driving test? It couldn't figure out which hand goes on the steering wheel!",
        "What's an AI's least favorite song? 'Give me five!' - it never knows which five to give!",
        "Why don't AI images ever become dentists? They can't count teeth any better than fingers!",
        "What do you call an AI that finally learns to draw hands correctly? Unemployed - because that's when we know it's too good!"
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
          "Look for 'the smudge.' AI sometimes blurs or smudges details where objects meet, like a ring against a finger.",
          "AI still gets hands wrong. Count the fingers. If it looks like a horror movie monster's hand, you've found your tell.",
          "Check for perfect symmetry. Reality is rarely perfect. If a face or building is flawlessly symmetrical, it's a red flag.",
          "Read the text in the background. If it looks like enchanting table language from Minecraft, it's probably AI.",
          "Examine the eyes. AI can make them look glassy, dead, or have bizarre reflections. Real eyes have life."
        ]
      },
      facts: {
        facts: [
          "The term 'AI' was first used at a college conference in 1956. It's older than your parents' vinyl collection.",
          "AI image generators don't 'see' or 'think.' They're just incredibly complex pattern-matching machines.",
          "An AI-generated artwork was sold at an auction for $432,500. It was basically a blurry portrait.",
          "The same text prompt given to an AI image generator will create a different image every time. It's like a loot box for art.",
          "By playing 'AI or Not?', you're helping to train the most advanced neural network of all: your own brain."
        ]
      },
      inspiration: {
        quotes: [
          "Every expert was once a beginner. Keep practicing your AI detection skills!",
          "Your human intuition is valuable in our increasingly digital world.",
          "Practice makes perfect - each game makes you better at spotting AI content.",
          "Trust your instincts - humans have evolved to notice when something feels 'off'.",
          "You're developing a superpower for the digital age - the ability to spot artificial content."
        ],
        jokes: [
          "Why don't AI images win at poker? They always have a tell - extra fingers!",
          "What's an AI's favorite type of photography? Anything without hands in the shot!",
          "Why did the AI go to art school? To learn proper finger counting!",
          "What do you call an AI that's bad at generating text? A spell-wreck generator!",
          "Why don't AI artists ever get tired? Because they never have to lift a finger... or count them!"
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
      // Use synchronous fallback for now since ensureContentLoaded is called synchronously
      const contentFiles = this.loadContentFromFilesSync();
      
      this.contentCache = {
        tips: contentFiles.tips.tips,
        facts: contentFiles.facts.facts,
        quotes: contentFiles.inspiration.quotes,
        jokes: contentFiles.inspiration.jokes
      };
      
      this.lastLoadDate = currentDate;
      console.log(`📚 Content loaded for date: ${currentDate} - ${this.contentCache.tips.length} tips, ${this.contentCache.facts.length} facts, ${this.contentCache.quotes.length} quotes, ${this.contentCache.jokes.length} jokes`);
    }
  }

  /**
   * Async method to preload content from JSON files (call this during server startup)
   */
  public async preloadContent(): Promise<void> {
    try {
      const contentFiles = await this.loadContentFromFiles();
      
      this.contentCache = {
        tips: contentFiles.tips.tips,
        facts: contentFiles.facts.facts,
        quotes: contentFiles.inspiration.quotes,
        jokes: contentFiles.inspiration.jokes
      };
      
      this.lastLoadDate = this.getCurrentDate();
      console.log(`🚀 Content preloaded successfully: ${this.contentCache.tips.length} tips, ${this.contentCache.facts.length} facts, ${this.contentCache.quotes.length} quotes, ${this.contentCache.jokes.length} jokes`);
    } catch (error) {
      console.error('❌ Failed to preload content:', error);
      // Fall back to sync loading
      this.ensureContentLoaded();
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
   * Get current tip for display (daily-based)
   */
  public getCurrentTip(): string {
    const content = this.getDailyEducationalContent();
    return content.tips[content.currentTipIndex] || content.tips[0] || 'No tip available';
  }

  /**
   * Get current fact for display (daily-based)
   */
  public getCurrentFact(): string {
    const content = this.getDailyEducationalContent();
    return content.facts[content.currentFactIndex] || content.facts[0] || 'No fact available';
  }

  /**
   * Get unique tip for a specific session
   */
  public getSessionTip(sessionId: string): string {
    this.ensureContentLoaded();
    
    if (!this.contentCache) {
      return 'No tip available';
    }

    // Use session ID to generate unique tip index
    const sessionHash = this.hashString(sessionId);
    const tipIndex = sessionHash % this.contentCache.tips.length;
    
    return this.contentCache.tips[tipIndex] || this.contentCache.tips[0] || 'No tip available';
  }

  /**
   * Get unique fact for a specific session
   */
  public getSessionFact(sessionId: string): string {
    this.ensureContentLoaded();
    
    if (!this.contentCache) {
      return 'No fact available';
    }

    // Use session ID to generate unique fact index (offset by 1 to avoid same as tip)
    const sessionHash = this.hashString(sessionId);
    const factIndex = (sessionHash + 1) % this.contentCache.facts.length;
    
    return this.contentCache.facts[factIndex] || this.contentCache.facts[0] || 'No fact available';
  }

  /**
   * Get unique inspiration for a specific session
   */
  public getSessionInspiration(sessionId: string): string {
    this.ensureContentLoaded();
    
    if (!this.contentCache) {
      return 'Keep practicing!';
    }

    // Use session ID to determine content type and index
    const sessionHash = this.hashString(sessionId);
    const useQuotes = sessionHash % 2 === 0;
    const contentArray = useQuotes ? this.contentCache.quotes : this.contentCache.jokes;
    const contentIndex = Math.floor(sessionHash / 2) % contentArray.length;
    
    return contentArray[contentIndex] || contentArray[0] || 'Keep practicing!';
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
   * Get a random tip for each game session
   */
  public getRandomTip(): string {
    this.ensureContentLoaded();
    
    if (!this.contentCache || this.contentCache.tips.length === 0) {
      return 'Look for \'the smudge.\' AI sometimes blurs or smudges details where objects meet, like a ring against a finger.';
    }

    const randomIndex = Math.floor(Math.random() * this.contentCache.tips.length);
    return this.contentCache.tips[randomIndex] || 'Look for \'the smudge.\' AI sometimes blurs or smudges details where objects meet, like a ring against a finger.';
  }

  /**
   * Get a random fact for each game session
   */
  public getRandomFact(): string {
    this.ensureContentLoaded();
    
    if (!this.contentCache || this.contentCache.facts.length === 0) {
      return 'AI image generators don\'t \'see\' or \'think.\' They\'re just incredibly complex pattern-matching machines.';
    }

    const randomIndex = Math.floor(Math.random() * this.contentCache.facts.length);
    return this.contentCache.facts[randomIndex] || 'AI image generators don\'t \'see\' or \'think.\' They\'re just incredibly complex pattern-matching machines.';
  }

  /**
   * Get random inspirational content for each game session
   */
  public getRandomInspiration(): string {
    this.ensureContentLoaded();
    
    if (!this.contentCache) {
      return 'Stay positive!';
    }

    // Randomly choose between quotes and jokes
    const useQuotes = Math.random() < 0.5;
    const contentArray = useQuotes ? this.contentCache.quotes : this.contentCache.jokes;
    
    if (contentArray.length === 0) {
      return 'Stay positive!';
    }

    const randomIndex = Math.floor(Math.random() * contentArray.length);
    return contentArray[randomIndex] || 'Stay positive!';
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
