import { context, reddit } from '@devvit/web/server';

export const createPost = async (customTitle?: string, customDescription?: string) => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  // Generate dynamic date
  const date = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  const title = customTitle || 'AI or Not?';
  const description = customDescription || `Daily Challenge - ${date}`;

  return await reddit.submitCustomPost({
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
