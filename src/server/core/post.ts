import { Context, RedditClient } from '@devvit/web/server';

export const createPost = async (
  redditClient?: RedditClient, 
  contextObj?: Context, 
  customTitle?: string, 
  customDescription?: string
) => {
  try {
    console.log('🚀 Starting post creation process...');
    
    // Use provided clients or import from context
    const { reddit, context } = await import('@devvit/web/server');
    const client = redditClient || reddit;
    const ctx = contextObj || context;
    
    console.log('📋 Context available:', !!ctx);
    console.log('📋 Reddit client available:', !!client);
    
    const { subredditName } = ctx;
    if (!subredditName) {
      console.error('❌ No subredditName found in context:', ctx);
      throw new Error('subredditName is required but not found in context');
    }
    
    console.log('📝 Creating post in subreddit:', subredditName);

  // Generate dynamic date
  const date = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
  });

    const title = customTitle || 'AI or Not?';
    const description = customDescription || `Daily Challenge - ${date}`;

    console.log('📋 Post details:', { title, description, subredditName });

    const postConfig = {
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
    };

    console.log('📋 Submitting post with config:', JSON.stringify(postConfig, null, 2));

    const result = await client.submitCustomPost(postConfig);
    
    console.log('✅ Post created successfully:', result.id);
    console.log('🔗 Post URL: https://reddit.com/r/' + subredditName + '/comments/' + result.id);
    
    return result;
    
  } catch (error) {
    console.error('❌ Post creation failed:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
    });
    throw error;
  }
};
