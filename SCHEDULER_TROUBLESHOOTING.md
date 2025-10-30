# Scheduler Troubleshooting Guide

## Changes Made ✅

### 1. **Updated Schedule Time** 
- **Changed from**: `0 0 * * *` (midnight UTC)
- **Changed to**: `0 12 * * *` (noon UTC)
- **Location**: `devvit.json` scheduler configuration

### 2. **Enhanced Debugging**
- Added comprehensive logging to scheduler endpoint
- Added manual trigger endpoint for testing
- Added scheduler health check endpoint
- Enhanced post creation logging

## Troubleshooting Steps

### **Step 1: Check Scheduler Status**
Visit this URL to check scheduler configuration:
```
https://developers.reddit.com/apps/aiornotgame-v1/api/debug/scheduler-status
```

Expected response:
```json
{
  "success": true,
  "scheduler": {
    "taskName": "daily-reset-and-post",
    "cronExpression": "0 12 * * *",
    "description": "Daily at noon UTC (12:00 UTC)",
    "nextExecution": "2024-XX-XXTXX:XX:XX.XXXZ"
  }
}
```

### **Step 2: Manual Trigger Test**
Test the scheduler manually by calling:
```bash
curl -X POST https://developers.reddit.com/apps/aiornotgame-v1/api/debug/trigger-scheduler
```

This will:
- Execute the same logic as the automatic scheduler
- Create a new daily post immediately
- Show detailed logs of the process
- Return the post ID and URL if successful

### **Step 3: Check Logs**
Monitor real-time logs using Devvit CLI:
```bash
devvit logs AIorNotGame
```

Look for these log messages:
- `🕐 SCHEDULER TRIGGERED: Daily reset starting at`
- `✅ [SCHEDULER] Created new daily post: POST_ID`
- `🔗 Post URL: https://reddit.com/r/AIorNotGame/comments/POST_ID`

### **Step 4: Verify App Installation**
Ensure the app is properly installed:
```bash
devvit apps list
```

Should show `aiornotgame-v1` installed on `r/AIorNotGame`

## Common Issues & Solutions

### **Issue 1: Scheduler Not Triggering**

**Possible Causes:**
- App not properly deployed
- Scheduler configuration not updated
- Reddit's scheduler service issues

**Solutions:**
1. **Redeploy the app**:
   ```bash
   npm run build
   npm run deploy
   ```

2. **Check deployment status**:
   ```bash
   devvit apps list
   ```

3. **Use manual trigger** to test functionality:
   ```bash
   curl -X POST [APP_URL]/api/debug/trigger-scheduler
   ```

### **Issue 2: Posts Not Being Created**

**Possible Causes:**
- Missing subreddit context
- Reddit API permissions
- Post creation errors

**Solutions:**
1. **Check subreddit context** in logs
2. **Verify app permissions** include `submit` for Reddit API
3. **Test manual post creation** via menu action
4. **Check error logs** for specific Reddit API errors

### **Issue 3: Wrong Schedule Time**

**Current Schedule**: Daily at **12:00 PM UTC** (noon)
- **EST**: 7:00 AM (8:00 AM during DST)
- **PST**: 4:00 AM (5:00 AM during DST)
- **GMT**: 12:00 PM

**To Change Schedule:**
1. Edit `devvit.json` cron expression
2. Rebuild and redeploy: `npm run build && npm run deploy`

## Debug Endpoints

### **Scheduler Status Check**
```
GET /api/debug/scheduler-status
```
Returns scheduler configuration and next execution time.

### **Manual Scheduler Trigger**
```
POST /api/debug/trigger-scheduler
```
Manually executes scheduler logic and creates a post immediately.

### **Environment Check**
```
GET /api/debug/environment
```
Shows environment variables and system status.

## Expected Scheduler Behavior

### **Daily at 12:00 PM UTC:**
1. **Game State Reset**: Clears previous day's game data
2. **Content Refresh**: Loads new tips, facts, and inspiration
3. **Image Randomization**: Generates new daily image combinations
4. **Post Creation**: Creates new "AI or Not? - Daily Challenge" post
5. **Participant Reset**: Resets daily participant count to 0

### **Post Details:**
- **Title**: "AI or Not?"
- **Description**: "Daily Challenge - [Month Day]" (e.g., "Daily Challenge - October 30")
- **Location**: Posted to r/AIorNotGame
- **Type**: Custom post with splash screen

## Monitoring Commands

### **Real-time Logs**
```bash
# Monitor all logs
devvit logs AIorNotGame

# Monitor logs from last hour
devvit logs AIorNotGame --since=1h

# Monitor logs with timestamps
devvit logs AIorNotGame --verbose
```

### **Check Recent Posts**
Visit: https://www.reddit.com/r/AIorNotGame/new

Look for posts titled "AI or Not?" created around 12:00 PM UTC daily.

## Next Steps

### **Immediate Actions:**
1. **Deploy updated app**: `npm run build && npm run deploy`
2. **Test manual trigger**: Call `/api/debug/trigger-scheduler`
3. **Monitor logs**: `devvit logs AIorNotGame`
4. **Wait for next scheduled execution**: 12:00 PM UTC tomorrow

### **If Still Not Working:**
1. **Check Reddit Developer Console** for any app-level issues
2. **Verify subreddit permissions** - ensure app can post
3. **Contact Reddit Devvit Support** if scheduler service issues persist

## Success Indicators

### **Scheduler Working Correctly:**
- ✅ New posts appear daily at 12:00 PM UTC
- ✅ Posts have current date in description
- ✅ Game state resets daily (new images/content)
- ✅ Participant counts reset to 0 daily
- ✅ Logs show successful scheduler execution

### **Manual Trigger Success:**
```json
{
  "success": true,
  "message": "Manual scheduler execution completed successfully",
  "data": {
    "newPostId": "abc123",
    "postUrl": "https://reddit.com/r/AIorNotGame/comments/abc123"
  }
}
```

## Cron Schedule Reference

Current: `0 12 * * *` = Daily at 12:00 PM UTC

Other options:
- `0 0 * * *` = Daily at midnight UTC
- `0 6 * * *` = Daily at 6:00 AM UTC  
- `0 18 * * *` = Daily at 6:00 PM UTC
- `0 12 * * 1` = Weekly on Monday at noon UTC

---

**Note**: After deploying these changes, the scheduler should create daily posts at 12:00 PM UTC. Use the manual trigger endpoint to test immediately without waiting for the scheduled time.
