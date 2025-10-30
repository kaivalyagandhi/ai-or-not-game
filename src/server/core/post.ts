import { Context, RedditClient } from '@devvit/web/server';

export const createPost = async (
  redditClient?: RedditClient, 
  contextObj?: Context, 
  customTitle?: string, 
  customDescription?: string
) => {
  // Use provided clients or import from context
  const { reddit, context } = await import('@devvit/web/server');
  const client = redditClient || reddit;
  const ctx = contextObj || context;
  
  const { subredditName } = ctx;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }
  
  console.log('📝 Creating post in subreddit:', subredditName);

  // Generate dynamic date
  const date = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  const title = customTitle || 'AI or Not?';
  const description = customDescription || `Daily Challenge - ${date}`;

  return await client.submitCustomPost({
    splash: {
      // Splash Screen Configuration
      appDisplayName: 'AI or Not?',
      backgroundUri: 'splash.png',
      buttonLabel: 'Start Challenge',
      description: description,
      heading: 'AI or Not?',
      appIconUri: 'icon.png',
    },
    postData: {
      gameState: 'initial',
      score: 0,
    },
    subredditName: subredditName,
    title: title,
  });
};
