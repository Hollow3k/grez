# LeetCode Stats Tracking - Implementation Guide

## 📋 Overview
LeetCode stats are now automatically tracked day-wise in your database with automatic daily syncing.

---

## 🏗️ Architecture

### Database Schema

#### User Model (Updated)
```typescript
{
  username: string,
  password: string,
  leetcodeUsername: string | null  // NEW: User's LeetCode handle
}
```

#### DailyStats Model (Updated)
```typescript
{
  userId: ObjectId,
  date: "YYYY-MM-DD",
  coding: { ... },  // Existing VSCode stats
  leetcode: {        // NEW: LeetCode stats for the day
    easySolved: number,
    mediumSolved: number,
    hardSolved: number,
    totalSolved: number,
    lastSynced: Date
  }
}
```

---

## 🔄 How Automatic Daily Syncing Works

### 1. Cron Job Service (`leetcodeCronService.ts`)
- **Schedule**: Runs every day at **11:59 PM**
- **Process**:
  1. Queries database for all users with `leetcodeUsername` set
  2. For each user:
     - Fetches current LeetCode stats from alfa-leetcode-api
     - Saves to DailyStats for today's date
     - Adds 1-second delay between users (rate limit protection)
  3. Logs success/failure counts

### 2. Why It Works Even if User Doesn't Log In
The cron job runs **server-side** on a schedule, independent of user activity:
- Server starts → Cron job initializes
- Every day at 23:59 → Job triggers automatically
- Fetches data for **ALL** users with leetcodeUsername
- No user login required!

### 3. What Gets Stored
- **Absolute counts** (not deltas): Total problems solved as of that day
- Historical tracking: Each day's stats are preserved
- You can calculate daily progress: `today.totalSolved - yesterday.totalSolved`

---

## 🔌 API Endpoints

### User Profile
```
GET  /api/user/profile              - Get user profile (includes leetcodeUsername)
PUT  /api/user/leetcode-username    - Set LeetCode username
     Body: { "leetcodeUsername": "your_leetcode_handle" }
```

### LeetCode Stats
```
GET  /api/leetcode/:username        - Fetch stats for any username (not saved)
POST /api/leetcode/sync             - Manually sync authenticated user's stats
```

---

## 📱 Frontend Integration

### Available Functions (`leetcode_api.ts`)
```typescript
// Display stats for any user (just fetches, doesn't save)
getLeetcodeSolved(username: string)

// Manually trigger sync for logged-in user
syncMyLeetcodeStats()

// Set user's LeetCode username
updateLeetcodeUsername(leetcodeUsername: string)

// Get user profile (includes leetcodeUsername)
getUserProfile()
```

---

## 🚀 Usage Flow

### First Time Setup
1. User signs up/logs in
2. User sets their LeetCode username:
   ```typescript
   await updateLeetcodeUsername("john_doe_leetcode");
   ```
3. User can manually sync immediately:
   ```typescript
   await syncMyLeetcodeStats();
   ```

### Daily Operation
1. **User does nothing** - cron handles it!
2. At 11:59 PM daily, server automatically:
   - Fetches user's latest LeetCode stats
   - Saves to DailyStats for that day
3. Frontend can display historical data from DailyStats

---

## 📊 Data Access Patterns

### Get Today's Stats
```typescript
// Frontend calls existing endpoint
const stats = await getTodayStats();
// stats.leetcode contains { easySolved, mediumSolved, hardSolved, totalSolved }
```

### Calculate Daily Progress
```javascript
const today = stats.today.leetcode.totalSolved;
const yesterday = stats.yesterday.leetcode.totalSolved;
const solvedToday = today - yesterday;
```

---

## ⚙️ Configuration

### Change Sync Time
Edit `leetcodeCronService.ts`:
```typescript
cron.schedule('59 23 * * *', ...) // Currently 11:59 PM

// Examples:
// '0 0 * * *'    → Midnight
// '0 9 * * *'    → 9 AM
// '30 14 * * *'  → 2:30 PM
```

### Adjust Rate Limiting
```typescript
await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second
// Increase if hitting API rate limits
```

---

## 🧪 Testing

### Manual Immediate Sync (Optional)
Add this route in `index.ts` for testing:
```typescript
import { runImmediateSync } from './services/leetcodeCronService.js';

app.post('/api/admin/sync-all', async (req, res) => {
  const result = await runImmediateSync();
  res.json(result);
});
```

---

## 🛡️ Error Handling

### What Happens If:
- **User has no leetcodeUsername**: Skipped in cron job
- **LeetCode API is down**: That user's sync fails, others continue
- **Invalid username**: Sync fails but logged, doesn't crash server
- **Rate limiting**: 1-second delay between users prevents this

---

## 📝 Key Files Modified/Created

### Backend
- ✅ `models/User.ts` - Added leetcodeUsername field
- ✅ `models/DailyStats.ts` - Added leetcode stats section
- ✅ `controllers/leetcodeController.ts` - Sync logic
- ✅ `controllers/userController.ts` - Profile management
- ✅ `services/leetcodeCronService.ts` - **AUTOMATIC DAILY SYNC** ⭐
- ✅ `index.ts` - Routes and cron initialization

### Frontend
- ✅ `api/leetcode_api.ts` - Updated to call backend

---

## 🎯 Summary

**Manual Sync**: User can trigger anytime via `POST /api/leetcode/sync`  
**Automatic Sync**: Happens daily at 11:59 PM for ALL users  
**Storage**: Day-wise in DailyStats collection  
**Independence**: Works even if user doesn't log in that day  

The key innovation is the **cron job running server-side**, making it completely independent of user login behavior!
