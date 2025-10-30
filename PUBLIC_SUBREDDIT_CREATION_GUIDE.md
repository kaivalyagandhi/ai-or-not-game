# Create r/AIorNot Public Subreddit - Step by Step Guide

## 🎯 **Step 1: Create the Subreddit**

### Go to Reddit's Subreddit Creation Page:
**URL**: https://www.reddit.com/subreddits/create

### Subreddit Name Options (in order of preference):
1. **r/AIorNot** ← Try this first (matches your game perfectly)
2. **r/AIorNotGame** ← Backup if first is taken
3. **r/SpotTheAI** ← Alternative if both above are taken

### Basic Settings:
- **Community Name**: `AIorNot` (or your chosen alternative)
- **Community Type**: **Public**
- **Adult Content**: **No**
- **Community Topics**: 
  - Primary: **Gaming**
  - Secondary: **Technology**
  - Tertiary: **Education**

## 🎨 **Step 2: Configure Subreddit Settings**

### Community Description:
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

### Community Rules:
```
1. 🎮 Game-Related Content Only
   Posts should relate to AI detection, the game, or educational content

2. 🤝 Be Respectful and Helpful
   Help other players improve their AI detection skills

3. 🚫 No Cheating or Exploits
   Play fairly and respect daily play limits

4. 📚 Educational Content Welcome
   Share AI detection tips and techniques

5. 🏆 Celebrate Achievements
   Share your high scores and friendly competition

Have fun and happy AI detecting! 🕵️‍♀️
```

## 📋 **Step 3: Set Up Post Flairs**

Go to **Mod Tools > Post Flair** and create these flairs:

```
🎮 Game Post - For official AI or Not? game posts
🏆 High Score - For sharing achievements and scores  
💡 AI Tips - For sharing detection strategies
📊 Leaderboard - For leaderboard discussions
🤖 AI Discussion - For general AI technology talk
📰 News & Updates - For game updates and announcements
❓ Help & Questions - For player support
🎨 Real vs AI - For interesting image comparisons
```

## 🎨 **Step 4: Customize Appearance**

### Banner/Header:
- **Text**: "🤖 AI or Not? - Test Your AI Detection Skills Daily! 🕵️‍♀️"
- **Background**: Use a tech/AI themed color (blue/purple gradient)

### Sidebar Widget (About Community):
```
🎯 **What is AI or Not?**
A daily AI detection challenge game built for Reddit! Test your ability to spot AI-generated images across 6 rounds with 10-second timers.

🎮 **How to Play:**
1. Look for posts with 🎮 Game Post flair
2. Click "Launch App" to start playing
3. Choose the REAL photo (not AI-generated)
4. Compete on daily, weekly, and all-time leaderboards!

🏆 **Features:**
- 6 rounds per daily challenge
- Revolutionary 2.5x image magnification
- Real-time leaderboards
- Educational AI detection tips
- 2 attempts per day maximum

📱 **Mobile Optimized**
Works perfectly on mobile and desktop!

🔗 **Links:**
- [How to Play Guide](link-to-guide)
- [AI Detection Tips](link-to-tips)
- [Report Issues](link-to-support)
```

## 🤖 **Step 5: Set Up AutoModerator (Optional)**

Create an AutoModerator configuration to help manage the community:

```yaml
# Require post flair
type: submission
~flair_text (regex): ".+"
action: remove
action_reason: "Post removed: Please add appropriate post flair"
message: |
    Your post has been removed because it doesn't have a post flair. 
    Please add an appropriate flair from the available options:
    
    🎮 Game Post | 🏆 High Score | 💡 AI Tips | 📊 Leaderboard
    🤖 AI Discussion | 📰 News & Updates | ❓ Help & Questions | 🎨 Real vs AI

# Welcome message for new posts
type: submission
comment: |
    Welcome to r/AIorNot! 🤖
    
    **New to the game?** Look for posts with the 🎮 Game Post flair and click "Launch App" to start playing!
    
    **Quick Tips:**
    - You get 2 attempts per day
    - Use the magnification feature (hover/touch-hold) to examine details
    - Share your strategies and tips in the comments!
    
    Good luck detecting AI! 🕵️‍♀️
comment_stickied: true
```

## 📝 **Step 6: Create Initial Content**

After creating the subreddit, create these initial posts:

### 1. Welcome Post (Pinned):
**Title**: "🎉 Welcome to r/AIorNot - The Ultimate AI Detection Challenge!"
**Flair**: 📰 News & Updates
**Content**:
```
Welcome to the official subreddit for AI or Not? - the daily AI detection challenge game!

## 🎮 What is AI or Not?
Test your ability to distinguish between real photographs and AI-generated images in our daily 6-round challenge. Built natively for Reddit, this game combines entertainment with practical AI detection skills.

## 🚀 How to Get Started
1. Look for posts with the 🎮 Game Post flair
2. Click "Launch App" to open the game
3. You have 10 seconds per round to choose the REAL photo
4. Compete on our real-time leaderboards!

## 🏆 Game Features
- 6 rounds per daily challenge
- Revolutionary 2.5x image magnification system
- Real-time daily, weekly, and all-time leaderboards
- Educational AI detection tips and facts
- 2 attempts per day to improve your score

## 📱 Mobile Friendly
The game works perfectly on both mobile and desktop - play anywhere!

## 🤝 Community Guidelines
- Share your high scores and achievements
- Post AI detection tips and strategies
- Help other players improve their skills
- Keep discussions friendly and educational

Ready to test your AI detection skills? Look for the daily game posts and start playing!

Happy AI detecting! 🕵️‍♀️
```

### 2. Rules and FAQ Post (Pinned):
**Title**: "📋 Rules, FAQ, and How to Play Guide"
**Flair**: ❓ Help & Questions

### 3. AI Detection Tips Post:
**Title**: "💡 Master AI Detection: Essential Tips and Techniques"
**Flair**: 💡 AI Tips

## 🚀 **Step 7: Deploy Your App to the New Subreddit**

Once your subreddit is created, deploy your app there:

```bash
# Set your new subreddit as the target
export DEVVIT_SUBREDDIT=r/AIorNot  # (or whatever name you got)

# Set production mode
export NODE_ENV=production

# Deploy to your new subreddit
devvit upload --subreddit AIorNot
```

## ✅ **Step 8: Verification Checklist**

After creating and setting up your subreddit:

- [ ] Subreddit created and configured
- [ ] Community description and rules set
- [ ] Post flairs created
- [ ] Appearance customized
- [ ] Initial welcome posts created
- [ ] App deployed to the subreddit
- [ ] Game posts appearing with "Launch App" buttons
- [ ] Game functionality tested and working
- [ ] Leaderboards functioning
- [ ] Production mode active (2 daily attempts)

## 🎯 **Step 9: Launch Strategy**

### Soft Launch (Week 1):
1. **Test everything** thoroughly in your new subreddit
2. **Invite friends/colleagues** to be your first players
3. **Create engaging content** daily
4. **Monitor and fix** any issues that arise

### Public Launch (Week 2+):
1. **Announce in relevant subreddits** (following their rules):
   - r/SideProject
   - r/IndieDev
   - r/WebDev
   - r/artificial
   - r/MachineLearning

2. **Cross-promote** your game in appropriate communities
3. **Engage actively** with your community
4. **Regular updates** and improvements

## 🔧 **Troubleshooting Common Issues**

### If Subreddit Name is Taken:
Try these alternatives in order:
1. r/AIorNotGame
2. r/SpotTheAI
3. r/AIDetectionGame
4. r/RealOrAI
5. r/AIChallenge

### If App Deployment Fails:
```bash
# Check you're a moderator of the subreddit
# Verify subreddit name is correct
devvit upload --subreddit YourSubredditName

# If still failing, try:
devvit login  # Re-authenticate
devvit upload --subreddit YourSubredditName
```

### If Game Posts Don't Appear:
- Check that the app installed successfully
- Verify you have moderator permissions
- Wait a few minutes for Reddit's systems to sync
- Try refreshing the subreddit page

---

## 🎉 **Ready to Create Your Subreddit?**

**Next Steps:**
1. Go to https://www.reddit.com/subreddits/create
2. Try "AIorNot" as your first choice
3. Follow the configuration steps above
4. Let me know when it's created so we can deploy your app there!

**Need Help?** I'm here to guide you through each step of the process!
