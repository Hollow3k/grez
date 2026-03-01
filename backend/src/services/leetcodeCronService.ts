import cron from 'node-cron';
import User from '../models/User.js';
import { syncLeetcodeStatsForUser } from '../controllers/leetcodeController.js';

/**
 * AUTOMATIC DAILY LEETCODE SYNC SERVICE
 * 
 * This service runs a cron job that automatically syncs LeetCode stats for ALL users
 * every day at 11:59 PM (23:59), regardless of whether they log in or not.
 * 
 * HOW IT WORKS:
 * 1. Cron job triggers daily at 23:59 (11:59 PM)
 * 2. Fetches all users who have set a leetcodeUsername
 * 3. For each user, calls the sync function to fetch and save their current LeetCode stats
 * 4. Stores the data in DailyStats for that day
 * 5. Continues running every day automatically
 * 
 * CRON SCHEDULE EXPLAINED:
 * '59 23 * * *' means:
 * - 59: At minute 59
 * - 23: At hour 23 (11 PM)
 * - *: Every day of the month
 * - *: Every month
 * - *: Every day of the week
 * 
 * WHY 11:59 PM?
 * - Captures the user's final stats for the day before midnight
 * - Ensures we have data for the entire day
 * - Users in different timezones will still get their stats recorded
 * 
 * ALTERNATIVE: You could also run it at midnight (0 0 * * *) to capture
 * the previous day's stats at the start of the new day.
 */

export const startLeetcodeSyncCron = () => {
    // Schedule task to run every day at 11:59 PM
    cron.schedule('59 23 * * *', async () => {
        console.log('🔄 Starting automatic LeetCode sync for all users...');
        
        try {
            // Find all users who have a LeetCode username set
            const users = await User.find({ leetcodeUsername: { $ne: null } });
            
            if (users.length === 0) {
                console.log('⚠️  No users with LeetCode usernames found');
                return;
            }

            console.log(`📊 Syncing LeetCode stats for ${users.length} users...`);

            let successCount = 0;
            let failCount = 0;

            // Sync stats for each user
            // We could use Promise.all for parallel processing, but sequential is safer
            // to avoid rate limiting from the LeetCode API
            for (const user of users) {
                const success = await syncLeetcodeStatsForUser(user._id.toString());
                if (success) {
                    successCount++;
                } else {
                    failCount++;
                }

                // Add a small delay between requests to avoid hitting rate limits
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
            }

            console.log(`✅ LeetCode sync completed: ${successCount} succeeded, ${failCount} failed`);
        } catch (error) {
            console.error('❌ Error during automatic LeetCode sync:', error);
        }
    });

    console.log('⏰ LeetCode automatic sync cron job initialized (runs daily at 11:59 PM)');
};

/**
 * OPTIONAL: Manual trigger for testing or backfilling
 * You can call this function to immediately run the sync for all users
 * without waiting for the scheduled time
 */
export const runImmediateSync = async () => {
    console.log('🔄 Running immediate LeetCode sync for all users...');
    
    try {
        const users = await User.find({ leetcodeUsername: { $ne: null } });
        
        if (users.length === 0) {
            console.log('⚠️  No users with LeetCode usernames found');
            return { success: 0, failed: 0 };
        }

        let successCount = 0;
        let failCount = 0;

        for (const user of users) {
            const success = await syncLeetcodeStatsForUser(user._id.toString());
            if (success) {
                successCount++;
            } else {
                failCount++;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`✅ Immediate sync completed: ${successCount} succeeded, ${failCount} failed`);
        return { success: successCount, failed: failCount };
    } catch (error) {
        console.error('❌ Error during immediate sync:', error);
        return { success: 0, failed: 0 };
    }
};
