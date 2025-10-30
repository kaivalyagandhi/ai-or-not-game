# Environment Configuration Guide

## Problem: Can't Set NODE_ENV Environment Variable

If you're deploying to a platform where you can't control environment variables (like some managed hosting services), this app has multiple fallback methods to ensure production mode is activated.

## Current Configuration ✅

Your app is currently configured to **automatically detect and enforce production mode** using multiple methods:

### Detection Methods (in order of priority):

1. **🔒 FORCED PRODUCTION MODE** (Currently Active)
   - Set via `FORCE_PRODUCTION_MODE = true` in the code
   - **Always enforces 2 daily play limits**
   - Cannot be overridden by environment variables

2. **🏭 NODE_ENV Detection**
   - Checks if `NODE_ENV=production`
   - Standard environment variable method

3. **🧪 Devvit Playtest Detection**
   - Checks if `DEVVIT_PLAYTEST=true`
   - Indicates development/testing environment

4. **📡 Reddit Context Detection**
   - Checks for `REDDIT_CONTEXT` or `DEVVIT_EXECUTION_ID`
   - Indicates production Reddit environment

5. **🌐 Hostname Detection**
   - Checks if hostname contains 'reddit.com' or 'devvit'
   - Indicates production deployment

6. **🚨 Safe Default**
   - **Defaults to production mode when uncertain**
   - Ensures play limits are always enforced

## How to Verify Your Environment

After deployment, you can check which mode is active by visiting:
```
https://your-app-url/api/debug/environment
```

This will show you:
- Current mode (development/production)
- Max daily attempts (2 for production, 999 for development)
- Detection method used
- All environment variables

## Configuration Options

### Option 1: Keep Current Setup (Recommended) ✅
**No changes needed** - your app will always run in production mode with 2 daily play limits.

### Option 2: Allow Environment Variable Control
If you want to allow environment variable control when available:

1. Edit `src/server/core/play-limit-manager.ts`
2. Change `FORCE_PRODUCTION_MODE = true` to `FORCE_PRODUCTION_MODE = false`
3. Rebuild and redeploy

### Option 3: Custom Configuration
You can modify the detection logic in the `isDevelopmentMode()` function to suit your specific hosting environment.

## Deployment Steps

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Deploy to your platform**:
   ```bash
   npm run deploy
   ```

3. **Verify production mode**:
   - Visit `/api/debug/environment` endpoint
   - Check logs for "Production mode" messages
   - Test that users are limited to 2 plays per day

## Expected Behavior

### ✅ Production Mode (Current Setup)
- **Play Limit**: 2 attempts per day per user
- **Logging**: "🔒 FORCED PRODUCTION MODE - Play limits: 2 attempts per day"
- **Scheduler**: Creates daily posts at midnight UTC
- **Leaderboards**: Full functionality with proper limits

### ⚠️ Development Mode (If Enabled)
- **Play Limit**: 999 attempts per day (unlimited)
- **Logging**: "🧪 Development mode detected"
- **Scheduler**: Still works but with unlimited play
- **Leaderboards**: Works but may have inflated scores

## Troubleshooting

### Problem: Users can play more than 2 times per day
**Solution**: Check the `/api/debug/environment` endpoint to verify production mode is active.

### Problem: App not working after deployment
**Solution**: Check application logs for environment detection messages and any errors.

### Problem: Need to temporarily allow unlimited play
**Solution**: 
1. Set `FORCE_PRODUCTION_MODE = false` in the code
2. Ensure `DEVVIT_PLAYTEST=true` is set in your environment
3. Rebuild and redeploy

## Security Note

The current configuration **prioritizes security and fair play** by defaulting to production mode when environment detection is uncertain. This ensures that:

- Play limits are always enforced
- The game remains fair for all players
- No accidental unlimited play in production

## Support

If you need help with environment configuration:
1. Check the `/api/debug/environment` endpoint
2. Review application logs for environment detection messages
3. Verify the scheduler is creating daily posts at midnight UTC
