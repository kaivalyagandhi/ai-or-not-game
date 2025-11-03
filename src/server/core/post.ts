import { Context, RedditClient } from '@devvit/web/server';

export const createPost = async (
  redditClient?: RedditClient,
  contextObj?: Context,
  customTitle?: string,
  customDescription?: string,
  isSchedulerTriggered?: boolean
) => {
  try {
    if (isSchedulerTriggered) {
      console.log('🤖 SCHEDULER-TRIGGERED POST CREATION STARTING...');
      console.log('⏰ This post is being created by the automatic daily scheduler');
    } else {
      console.log('👤 MANUAL POST CREATION STARTING...');
      console.log('🔧 This post is being created manually (menu action or app install)');
    }
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

    // Generate dynamic date for title and description using UTC to avoid timezone issues
    const now = new Date();
    console.log('🕐 Current date object:', now);
    console.log('🕐 Current year:', now.getFullYear());
    console.log('🕐 Current UTC year:', now.getUTCFullYear());
    console.log('🕐 ISO string:', now.toISOString());

    // Use UTC date to ensure consistency across timezones
    const utcMonth = now.getUTCMonth();
    const utcDay = now.getUTCDate();

    // Create month names array for consistent formatting
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthNamesLong = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const finalDateForTitle = `${monthNames[utcMonth]} ${utcDay}`;
    const dateForDescription = `${monthNamesLong[utcMonth]} ${utcDay}`;

    console.log('📅 UTC-based date for title:', finalDateForTitle);
    console.log('📅 UTC-based date for description:', dateForDescription);

    const title = customTitle || `AI or Not? - ${finalDateForTitle} Challenge`;
    const description = customDescription || `Daily Challenge - ${dateForDescription}`;

    console.log('🔍 DEBUG: customTitle provided:', customTitle);
    console.log('🔍 DEBUG: finalDateForTitle:', finalDateForTitle);
    console.log('📅 Final title:', title);
    console.log('📅 Final description:', description);
    console.log('✅ Using UTC-based date to ensure correct year (2025) and consistency');
    
    // Extra verification
    const expectedMonth = monthNames[utcMonth];
    if (!expectedMonth || !title.includes(expectedMonth) || !title.includes(utcDay.toString())) {
      console.error('❌ WARNING: Title does not include current date!');
      console.error('❌ Title:', title);
      console.error('❌ Expected month:', expectedMonth);
      console.error('❌ Expected day:', utcDay);
    } else {
      console.log('✅ Title correctly includes current date:', `${expectedMonth} ${utcDay}`);
    }

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

    if (isSchedulerTriggered) {
      console.log('🎉 SCHEDULER POST CREATED SUCCESSFULLY!');
      console.log('🤖 Post ID:', result.id);
      console.log('📅 Post Title:', title);
      console.log('🔗 Post URL: https://reddit.com/r/' + subredditName + '/comments/' + result.id);
      console.log('⏰ Created at:', new Date().toISOString());
    } else {
      console.log('✅ Manual post created successfully:', result.id);
      console.log('🔗 Post URL: https://reddit.com/r/' + subredditName + '/comments/' + result.id);
    }

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
