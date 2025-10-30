# AI or Not? Subreddit Setup Guide

## Recommended Subreddit Names

Here are some great options for your subreddit name:

### Primary Recommendations:
- **r/AIorNot** - Simple, direct, matches your game name
- **r/AIDetectionGame** - Descriptive and searchable
- **r/SpotTheAI** - Catchy and engaging
- **r/RealOrAI** - Clear and memorable

### Alternative Options:
- **r/AIChallenge** - Broader appeal for AI-related challenges
- **r/AIvsHuman** - Emphasizes the competition aspect
- **r/DetectAI** - Short and to the point
- **r/AIGameChallenge** - Specific to gaming

## Subreddit Creation Steps

### 1. Create the Subreddit
1. Go to [reddit.com/subreddits/create](https://www.reddit.com/subreddits/create)
2. Choose your subreddit name (check availability)
3. Select **Public** community type
4. Choose **Gaming** as the primary topic
5. Add **Technology** and **Education** as additional topics

### 2. Basic Configuration

#### Subreddit Description:
```
🤖 AI or Not? - The Ultimate AI Detection Challenge

Test your ability to distinguish between real photographs and AI-generated images! 
Play our daily 6-round challenge and compete on the leaderboards.

🎯 Daily challenges with fresh content
🏆 Real-time leaderboards and rankings  
🔍 Revolutionary image magnification system
📚 Learn AI detection skills while playing
🎮 Built natively for Reddit with Devvit

Ready to test your AI detection skills? Look for game posts and click "Launch App" to play!
```

#### Community Guidelines:
```
Welcome to AI or Not? - A community dedicated to AI detection challenges and education!

RULES:
1. 🎮 Game-Related Content Only
   - Posts should relate to AI detection, the game, or educational content
   - Share your scores, strategies, and AI detection tips

2. 🤝 Be Respectful and Helpful
   - Help other players improve their AI detection skills
   - No harassment, spam, or off-topic content
   - Constructive feedback and discussion encouraged

3. 🚫 No Cheating or Exploits
   - Play fairly and don't share exploits
   - Report bugs through proper channels
   - Respect daily play limits

4. 📚 Educational Content Welcome
   - Share AI detection tips and techniques
   - Discuss AI technology developments
   - Post interesting real vs AI comparisons

5. 🏆 Celebrate Achievements
   - Share your high scores and badges
   - Congratulate other players' successes
   - Friendly competition encouraged

Have fun and happy AI detecting! 🕵️‍♀️
```

### 3. Subreddit Settings Configuration

#### Community Settings:
- **Community Type**: Public
- **Content Visibility**: Public
- **Restricted Posting**: Moderators and approved users initially
- **Comment Settings**: Anyone can comment
- **Crossposting**: Allow crossposting from this community

#### Post Requirements:
- **Require post flair**: Yes (create flairs for different content types)
- **Require title tags**: No
- **Enable spoiler tags**: Yes
- **Allow image posts**: Yes
- **Allow link posts**: Yes
- **Allow polls**: Yes

### 4. Create Post Flairs

Set up these post flairs for better organization:

```
🎮 Game Post - For official AI or Not? game posts
🏆 High Score - For sharing achievements and scores  
💡 AI Tips - For sharing detection strategies and tips
📊 Leaderboard - For leaderboard discussions and updates
🤖 AI Discussion - For general AI technology discussion
📰 News & Updates - For game updates and announcements
❓ Help & Questions - For player support and questions
🎨 Real vs AI - For sharing interesting image comparisons
```

### 5. Subreddit Appearance

#### Banner Text:
```
🤖 AI or Not? - Test Your AI Detection Skills Daily! 🕵️‍♀️
```

#### Sidebar Widget (About Community):
```
🎯 **What is AI or Not?**
A daily AI detection challenge game built for Reddit! Test your ability to spot AI-generated images across 6 rounds with 10-second timers.

🎮 **How to Play:**
1. Look for game posts in this subreddit
2. Click "Launch App" to start playing
3. Choose the REAL photo (not AI-generated)
4. Compete on daily, weekly, and all-time leaderboards!

🏆 **Features:**
- 6 rounds per daily challenge
- Revolutionary 2.5x image magnification
- Real-time leaderboards
- Educational AI detection tips
- Multiple attempts per day (2 max)

📱 **Mobile Optimized**
Works perfectly on mobile and desktop!

🔗 **Links:**
- [Game Rules & Tips](link-to-rules)
- [Report Issues](link-to-issues)
- [Developer Info](link-to-dev)
```

### 6. Moderator Setup

#### Initial Moderator Team:
- **You** as the primary moderator/creator
- Consider adding 1-2 trusted community members as the subreddit grows
- Set up AutoModerator for basic content filtering

#### Moderator Permissions:
- **Full permissions** for yourself
- **Posts & Comments** + **Flair** permissions for additional mods
- **Config** permissions only for trusted long-term moderators

### 7. AutoModerator Configuration

Create basic AutoModerator rules:

```yaml
# Remove posts without flair after 10 minutes
type: submission
~flair_text (regex): ".+"
action: remove
action_reason: "Post removed: Please add appropriate post flair"
message: |
    Your post has been removed because it doesn't have a post flair. 
    Please add an appropriate flair and your post will be approved.
    
    Available flairs:
    - 🎮 Game Post
    - 🏆 High Score  
    - 💡 AI Tips
    - 📊 Leaderboard
    - And more...

# Welcome message for new posts
type: submission
comment: |
    Welcome to r/AIorNot! 🤖
    
    New to the game? Look for posts with the 🎮 Game Post flair and click "Launch App" to start playing!
    
    **Quick Tips:**
    - You get 2 attempts per day
    - Use the magnification feature to examine details
    - Share your strategies in the comments!
    
    Good luck detecting AI! 🕵️‍♀️
comment_stickied: true
```

## Launch Strategy

### Phase 1: Soft Launch (First Week)
1. **Create the subreddit** with all settings configured
2. **Deploy your game** to the new subreddit
3. **Create initial content**:
   - Welcome post explaining the game
   - Rules and FAQ post
   - First game post to test functionality
4. **Invite beta testers** (friends, colleagues, other developers)

### Phase 2: Community Building (Weeks 2-4)
1. **Post regularly** - Daily game posts and weekly updates
2. **Engage actively** - Respond to all comments and questions
3. **Cross-promote** in relevant subreddits:
   - r/gaming (if allowed)
   - r/MachineLearning (educational angle)
   - r/artificial (AI discussion)
   - r/webdev (technical showcase)
4. **Create engaging content**:
   - AI detection tip posts
   - Behind-the-scenes development posts
   - Player spotlight posts

### Phase 3: Growth (Month 2+)
1. **Community events** - Weekly challenges, tournaments
2. **User-generated content** - Encourage players to share tips
3. **Partnerships** - Collaborate with AI/tech communities
4. **Regular updates** - New features, improvements, content

## Content Calendar Template

### Daily:
- New game post (automated via your app)
- Respond to comments and questions

### Weekly:
- Leaderboard highlights post
- AI detection tip of the week
- Community discussion thread

### Monthly:
- Game updates and new features
- Community stats and growth
- Player achievements showcase

## Promotion Strategy

### Reddit Promotion:
1. **Announce in relevant subreddits** (follow their rules):
   - r/SideProject
   - r/IndieDev  
   - r/WebDev
   - r/artificial
   - r/MachineLearning

2. **Participate in community events**:
   - "Show and Tell" threads
   - Weekly project showcases
   - Developer AMAs

### External Promotion:
1. **Social media** - Twitter, LinkedIn (developer angle)
2. **Developer communities** - Dev.to, Hacker News, Product Hunt
3. **AI/ML communities** - AI newsletters, forums, Discord servers

## Success Metrics to Track

### Community Growth:
- Subscriber count
- Daily active users
- Post engagement (upvotes, comments)
- Game play frequency

### Game Metrics:
- Daily players
- Completion rates
- Average scores
- User retention

### Content Performance:
- Most popular post types
- Best performing flairs
- Community-generated content

## Recommended Subreddit Name Decision

Based on availability and branding, I recommend:

**Primary Choice: r/AIorNot**
- Matches your game name exactly
- Easy to remember and type
- Clear purpose and branding

**Backup Choice: r/SpotTheAI**
- Catchy and engaging
- Broader appeal
- Easy to understand concept

## Next Steps

1. **Check name availability** on Reddit
2. **Create the subreddit** using the settings above
3. **Configure all settings** and appearance
4. **Deploy your game** to the new subreddit
5. **Create initial content** and test everything
6. **Invite initial users** for beta testing
7. **Launch publicly** with promotion strategy

Would you like me to help you with any specific part of this setup process?
