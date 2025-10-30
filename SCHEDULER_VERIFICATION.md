# Scheduler Verification Guide

## ✅ Changes Made

### 1. **Updated Schedule Time**
- **From**: `0 0 * * *` (midnight UTC) 
- **To**: `0 12 * * *` (noon UTC)

### 2. **Enhanced Logging**
- Added comprehensive scheduler debugging to menu post creation
- Enhanced scheduler endpoint logging with clear markers
- Added scheduler info to app installation

## 🔍 How to Verify Scheduler is Working

### **Step 1: Deploy Updated App**
```bash
npm run build
npm run deploy
```

### **Step 2: Trigger Menu Action for Debugging**
1. Go to your subreddit: https://www.reddit.com/r/AIorNotGame/
2. Click the **"Create a new post"** menu action (moderator only)
3. Check the logs with: `devvit logs AIorNotGame`

**You should see comprehensive scheduler debug info like:**
```
📝 Menu triggered post creation
🕐 ===== SCHEDULER DEBUG INFO =====
📅 Current time: 2024-10-30T...
⏰ SCHEDULER CONFIGURATION:
   - Task Name: daily-reset-and-post
   - Cron Expression: 0 12 * * *
   - Description: Daily at 12:00 PM UTC
   - Endpoint: /internal/scheduler/daily-reset
   - Next Execution: 2024-10-31T12:00:00.000Z
   - Time Until Next: XXX minutes
🏗️ ENVIRONMENT INFO:
   - Subreddit Context: AIorNotGame
🧪 TESTING SCHEDULER COMPONENTS:
   ✓ Content manager accessible
   ✓ Image collection loadable
   ✓ Redis connection active
   ✓ Daily game state accessible
```

### **Step 3: Wait for Automatic Execution**
**Next scheduler execution**: Tomorrow at **12:00 PM UTC**

**Look for these logs at 12:00 PM UTC:**
```
🚨🚨🚨 SCHEDULER TRIGGERED! 🚨🚨🚨
🕐 SCHEDULER EXECUTION START: 2024-XX-XXTXX:XX:XX.XXXZ
🕐 Expected: Daily at 12:00 PM UTC (cron: 0 12 * * *)
🎯 THIS CONFIRMS SCHEDULER IS WORKING!
📅 Executing daily reset job...
✅ [SCHEDULER] Created new daily post: POST_ID
```

### **Step 4: Verify New Post Created**
Check https://www.reddit.com/r/AIorNotGame/new for:
- New post titled **"AI or Not?"**
- Description: **"Daily Challenge - [Current Date]"**
- Posted at approximately **12:00 PM UTC**

## 🕐 Time Zone Reference

**12:00 PM UTC** equals:
- **7:00 AM EST** (8:00 AM EDT)
- **4:00 AM PST** (5:00 AM PDT)  
- **12:00 PM GMT**
- **1:00 PM CET**

## 🔧 Troubleshooting

### **If No Scheduler Logs Appear Tomorrow:**

1. **Check App Deployment Status:**
   ```bash
   devvit apps list
   ```
   Should show `aiornotgame-v1` installed on `AIorNotGame`

2. **Verify devvit.json Configuration:**
   ```json
   "scheduler": {
     "tasks": {
       "daily-reset-and-post": {
         "endpoint": "/internal/scheduler/daily-reset",
         "cron": "0 12 * * *"
       }
     }
   }
   ```

3. **Redeploy if Needed:**
   ```bash
   npm run build
   npm run deploy
   ```

### **If Scheduler Triggers but Post Creation Fails:**
Look for error logs like:
```
❌ [SCHEDULER] Failed to create daily post: ERROR_MESSAGE
```

Common issues:
- **Subreddit permissions**: Ensure app can post to subreddit
- **Reddit API limits**: Temporary Reddit service issues
- **Context missing**: App context not properly available

## 🎯 Success Indicators

### **Scheduler Working Correctly:**
- ✅ Logs show "🚨🚨🚨 SCHEDULER TRIGGERED! 🚨🚨🚨" at 12:00 PM UTC
- ✅ New post appears in r/AIorNotGame daily
- ✅ Post has current date in description
- ✅ Game state resets (new images/content available)

### **Menu Debug Info Shows:**
- ✅ Scheduler configuration is correct
- ✅ All components (Redis, content, images) are accessible
- ✅ Next execution time is calculated correctly
- ✅ Environment context is available

## 📅 Next Steps

1. **Deploy now**: `npm run build && npm run deploy`
2. **Test menu action**: Verify debug logs appear
3. **Wait until tomorrow 12:00 PM UTC**: Check for automatic scheduler execution
4. **Monitor logs**: `devvit logs AIorNotGame --verbose`
5. **Verify new post**: Check r/AIorNotGame for daily post

## 🚨 Key Log Messages to Watch For

### **Menu Action (Available Now):**
```
📝 Menu triggered post creation
🕐 ===== SCHEDULER DEBUG INFO =====
```

### **Automatic Scheduler (Tomorrow at Noon UTC):**
```
🚨🚨🚨 SCHEDULER TRIGGERED! 🚨🚨🚨
🎯 THIS CONFIRMS SCHEDULER IS WORKING!
✅ [SCHEDULER] Created new daily post: POST_ID
```

The enhanced logging will clearly show if the scheduler is configured correctly and working as expected!
