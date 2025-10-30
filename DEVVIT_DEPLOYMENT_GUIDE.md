# Devvit Deployment Guide for AI or Not?

## Prerequisites Check

Before deploying, ensure you have:
- ✅ Node.js 22.2.0 or higher
- ✅ Devvit CLI installed globally
- ✅ Reddit account with developer access
- ✅ Target subreddit created (or use development subreddit)

## Step 1: Verify Devvit CLI Installation

```bash
# Check if Devvit CLI is installed
devvit --version

# If not installed, install it globally
npm install -g devvit
```

## Step 2: Login to Devvit

```bash
# Login to your Reddit account through Devvit
devvit login

# This will open a browser window for Reddit authentication
# Follow the prompts to authorize Devvit access
```

## Step 3: Pre-Deployment Validation

```bash
# Ensure you're in the project root directory
pwd
# Should show: /path/to/ai-or-not-game

# Clean any previous builds
npm run clean

# Run full validation (this will catch any issues)
npm run validate
```

**Note**: If validation fails due to TypeScript errors, you can still deploy since the core functionality works, but it's recommended to fix them first.

## Step 4: Build the Application

```bash
# Build both client and server bundles
npm run build

# Verify build artifacts exist
ls -la dist/
# Should show:
# dist/client/ (contains index.html and assets)
# dist/server/ (contains index.cjs)
```

## Step 5: Configure Target Subreddit

### Option A: Deploy to Development Subreddit (Recommended for first deployment)
```bash
# This uses the default development subreddit
npm run deploy
```

### Option B: Deploy to Specific Subreddit
```bash
# Deploy to your custom subreddit
devvit upload --subreddit your_subreddit_name

# Or set environment variable
export DEVVIT_SUBREDDIT=r/your_subreddit_name
npm run deploy
```

## Step 6: Deploy the Application

```bash
# Deploy using the npm script (recommended)
npm run deploy

# This runs: npm run build && devvit upload
```

### What happens during deployment:
1. **Build Verification**: Ensures all assets are built
2. **Upload Process**: Uploads your app to Reddit's servers
3. **Installation**: Installs the app in the target subreddit
4. **Post Creation**: Automatically creates initial game posts

### Expected Output:
```
✅ Building client bundle...
✅ Building server bundle...
✅ Uploading to Reddit...
✅ Installing app in subreddit...
✅ App deployed successfully!

🎮 Your app is now live at: https://www.reddit.com/r/your_subreddit
```

## Step 7: Verify Deployment

### Check App Installation:
1. **Visit your subreddit**: `https://www.reddit.com/r/your_subreddit`
2. **Look for game posts**: Should see "AI or Not? - Daily Challenge" posts
3. **Test the app**: Click "Launch App" button on any game post
4. **Verify functionality**: 
   - Game loads properly
   - Images display correctly
   - Scoring system works
   - Leaderboards function

### Test Core Features:
```bash
# You can also test locally while deployed
npm run dev

# This creates a playtest environment at:
# https://www.reddit.com/r/your_subreddit_dev?playtest=ai-or-not
```

## Step 8: Publish for Public Access (If Needed)

If your target subreddit has >200 members, you need Reddit review:

```bash
# Submit for Reddit review
npm run launch

# This runs: npm run build && npm run deploy && devvit publish
```

### Review Process:
- **Automatic approval**: Subreddits with <200 members
- **Manual review**: Subreddits with >200 members (can take 1-3 days)
- **Email notification**: You'll receive approval/rejection notice

## Step 9: Post-Deployment Configuration

### Set Production Environment:
```bash
# Ensure production mode is active
export NODE_ENV=production

# Redeploy with production settings
npm run deploy
```

### Verify Production Mode:
- Check that daily play limits are enforced (2 attempts per user)
- Verify leaderboards are working
- Test real-time features
- Confirm Redis data persistence

## Troubleshooting Common Issues

### 1. Build Failures
```bash
# If TypeScript errors prevent build
npm run type-check
# Fix errors or deploy with existing build

# If missing dependencies
npm install
npm run build
```

### 2. Upload Failures
```bash
# Check Devvit authentication
devvit whoami

# Re-login if needed
devvit login

# Check subreddit permissions
# Ensure you're a moderator of the target subreddit
```

### 3. App Not Appearing
```bash
# Check app installation status
devvit apps list

# Reinstall if needed
devvit install --subreddit your_subreddit_name
```

### 4. Game Not Loading
- **Check browser console** for JavaScript errors
- **Verify assets**: Ensure all images and audio files are accessible
- **Test in incognito**: Rule out browser cache issues
- **Check Reddit status**: Verify Reddit platform is operational

## Deployment Commands Reference

### Development Deployment:
```bash
npm run dev          # Local development with hot reload
npm run deploy       # Deploy to development/specified subreddit
```

### Production Deployment:
```bash
npm run validate     # Full validation check
npm run build        # Build production bundles
npm run deploy       # Deploy to subreddit
npm run launch       # Deploy + submit for review
```

### Utility Commands:
```bash
devvit login         # Authenticate with Reddit
devvit whoami        # Check current user
devvit apps list     # List your deployed apps
devvit logs          # View app logs
devvit --help        # Full command reference
```

## Environment-Specific Deployment

### Development Environment:
```bash
# Deploy to development subreddit
NODE_ENV=development npm run deploy
```

### Production Environment:
```bash
# Deploy with production settings
NODE_ENV=production npm run deploy
```

## Monitoring Your Deployed App

### Check App Status:
```bash
# View deployment logs
devvit logs --subreddit your_subreddit_name

# Monitor real-time activity
devvit logs --subreddit your_subreddit_name --follow
```

### Key Metrics to Monitor:
- **Daily active users**: Check game post engagement
- **Play completion rates**: Monitor through leaderboards
- **Error rates**: Watch for JavaScript/server errors
- **Performance**: Monitor load times and responsiveness

## Updating Your Deployed App

### For Minor Updates:
```bash
# Make your changes, then redeploy
npm run build
npm run deploy
```

### For Major Updates:
```bash
# Full validation and deployment
npm run validate
npm run deploy
```

### Rolling Back:
If you need to revert to a previous version:
```bash
# Devvit doesn't have built-in rollback
# You'll need to redeploy the previous code version
git checkout previous-commit
npm run deploy
```

## Success Checklist

After deployment, verify:
- ✅ App appears in target subreddit
- ✅ Game posts are created automatically
- ✅ "Launch App" button works
- ✅ Game loads and plays correctly
- ✅ Scoring and leaderboards function
- ✅ Daily play limits are enforced (production mode)
- ✅ Real-time features work
- ✅ Mobile compatibility confirmed
- ✅ Audio system functions (if enabled)

## Next Steps After Deployment

1. **Create initial content** in your subreddit
2. **Test all game features** thoroughly
3. **Invite beta users** to test and provide feedback
4. **Monitor performance** and user engagement
5. **Iterate and improve** based on user feedback
6. **Promote your subreddit** to grow the community

## Getting Help

If you encounter issues:
- **Check Devvit docs**: [developers.reddit.com](https://developers.reddit.com)
- **Reddit Developer Community**: r/redditdev
- **Devvit GitHub**: Issues and discussions
- **Reddit Developer Support**: Through official channels

---

**Ready to deploy?** Start with Step 1 and work through each step systematically. The entire process typically takes 5-10 minutes for a successful deployment!
