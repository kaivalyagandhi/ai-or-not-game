# Scheduler Log Verification Guide

## 🔍 How to Check if Scheduler is Working

### **1. Check Recent Scheduler Activity**

```bash
# Check logs from last 24 hours
devvit logs AIorNotGame --since=24h

# Check logs from last week (to see if scheduler ran before)
devvit logs AIorNotGame --since=7d

# Check logs with verbose output (includes timestamps)
devvit logs AIorNotGame --since=24h --verbose
```

### **2. Filter for Scheduler-Specific Logs**

```bash
# Look for scheduler triggers (Linux/Mac)
devvit logs AIorNotGame --since=24h | grep -i "scheduler"

# Look for post creation logs
devvit logs AIorNotGame --since=24h | grep -i "post created"

# Look for daily reset logs
devvit logs AIorNotGame --since=24h | grep -i "daily reset"
```

### **3. Key Log Messages to Look For**

#### **🤖 Scheduler-Triggered Posts:**
```
🚨🚨🚨 SCHEDULER TRIGGERED! 🚨🚨🚨
🕐 SCHEDULER EXECUTION START: 2024-XX-XXTXX:XX:XX.XXXZ
🤖 SCHEDULER-TRIGGERED POST CREATION STARTING...
⏰ This post is being created by the automatic daily scheduler
🎉 SCHEDULER POST CREATED SUCCESSFULLY!
📅 Post Title: AI or Not? - Oct 30, 2024
✅ [SCHEDULER] Created new daily post: POST_ID
```

#### **👤 Manual Posts (Menu Action):**
```
🚨🚨🚨 MENU POST CREATION TRIGGERED 🚨🚨🚨
👤 MANUAL POST CREATION STARTING...
🔧 This post is being created manually (menu action or app install)
✅ Manual post created successfully: POST_ID
```

## 📅 Updated Post Format

### **New Post Title Format:**
- **Before**: "AI or Not?"
- **After**: "AI or Not? - Nov 1, 2025" (includes current date)

### **Description Format:**
- **Format**: "Daily Challenge - October 30"
- **Updates**: Daily with current date

## ⏰ Scheduler Timeline

### **Current Schedule:**
- **Time**: 12:00 PM UTC daily
- **Cron**: `0 12 * * *`
- **Timezone Conversions**:
  - **EST**: 7:00 AM (8:00 AM EDT)
  - **PST**: 4:00 AM (5:00 AM PDT)
  - **GMT**: 12:00 PM
  - **CET**: 1:00 PM

### **Expected Behavior:**
1. **Daily at noon UTC**: Scheduler triggers
2. **Game state resets**: New images and content
3. **New post created**: With current date in title
4. **Participant count resets**: Back to 0

## 🔍 Verification Steps

### **Step 1: Deploy Updated Code**
```bash
npm run deploy
```

### **Step 2: Check Historical Logs**
```bash
# Look for any scheduler activity in the past week
devvit logs AIorNotGame --since=7d --verbose
```

### **Step 3: Test Menu Action**
1. Go to r/AIorNotGame
2. Click "Create a new post" (moderator menu)
3. Check logs immediately:
   ```bash
   devvit logs AIorNotGame --since=5m
   ```

### **Step 4: Monitor Tomorrow at Noon UTC**
```bash
# Start monitoring logs before noon UTC
devvit logs AIorNotGame --follow

# Or check after noon UTC
devvit logs AIorNotGame --since=1h
```

## 📊 Log Analysis Examples

### **✅ Scheduler Working (What to Look For):**
```
[2024-10-30 12:00:01] 🚨🚨🚨 SCHEDULER TRIGGERED! 🚨🚨🚨
[2024-10-30 12:00:01] 🤖 SCHEDULER-TRIGGERED POST CREATION STARTING...
[2024-10-30 12:00:02] 📅 Post Title: AI or Not? - Oct 30, 2024
[2024-10-30 12:00:03] 🎉 SCHEDULER POST CREATED SUCCESSFULLY!
[2024-10-30 12:00:03] Post ID: abc123xyz
```

### **❌ Scheduler Not Working (Missing Logs):**
- No logs around 12:00 PM UTC
- No "SCHEDULER TRIGGERED" messages
- No automatic post creation

### **🔧 Manual Posts (Expected):**
```
[2024-10-30 10:30:15] 🚨🚨🚨 MENU POST CREATION TRIGGERED 🚨🚨🚨
[2024-10-30 10:30:15] 👤 MANUAL POST CREATION STARTING...
[2024-10-30 10:30:16] 📅 Post Title: AI or Not? - Oct 30, 2024
[2024-10-30 10:30:17] ✅ Manual post created successfully: def456ghi
```

## 🎯 Quick Verification Commands

### **Check if Scheduler Ran Today:**
```bash
# Check for scheduler logs from today
devvit logs AIorNotGame --since=24h | grep "SCHEDULER TRIGGERED"
```

### **Check Recent Posts:**
```bash
# Check for any post creation in last 24 hours
devvit logs AIorNotGame --since=24h | grep "Post created successfully"
```

### **Check Post Titles:**
```bash
# Look for posts with dates in titles
devvit logs AIorNotGame --since=24h | grep "Post Title:"
```

## 📍 Subreddit Verification

### **Check r/AIorNotGame Posts:**
1. Visit: https://www.reddit.com/r/AIorNotGame/new
2. Look for posts titled: **"AI or Not? - [Date]"**
3. Check post times (should be around 12:00 PM UTC)
4. Verify dates match when posts were created

### **Post Identification:**
- **Scheduler posts**: Created at 12:00 PM UTC with date in title
- **Manual posts**: Created at various times, also with date in title
- **Old posts**: May have old format "AI or Not?" without date

## 🚨 Troubleshooting

### **If No Scheduler Logs Found:**
1. **Check app deployment**: `devvit apps list`
2. **Verify scheduler config**: Check devvit.json has `"cron": "0 12 * * *"`
3. **Redeploy**: `npm run build && npm run deploy`
4. **Wait for next execution**: Tomorrow at 12:00 PM UTC

### **If Posts Created but No Scheduler Logs:**
- Scheduler might be working but logs not showing
- Check r/AIorNotGame for new posts at 12:00 PM UTC
- Look for posts with current date in title

### **If Manual Posts Work but Scheduler Doesn't:**
- Scheduler configuration issue
- Reddit's scheduler service might have delays
- Check for any error logs around 12:00 PM UTC

---

**Next Steps**: Deploy the updated code and monitor logs tomorrow at 12:00 PM UTC to confirm scheduler is working with the new date-inclusive post titles!
