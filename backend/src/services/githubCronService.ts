import cron from 'node-cron';
import User from '../models/User.js';
import { syncGithubStatsForUser } from '../controllers/githubController.js';

/**
 * AUTOMATIC DAILY GITHUB SYNC SERVICE
 * 
 * This service runs a cron job that automatically syncs GitHub stats for ALL users
 * every day at 11:59 PM (23:59), regardless of whether they log in or not.
 * 
 * HOW IT WORKS:
 * 1. Cron job triggers daily at 23:59 (11:59 PM)
 * 2. Fetches all users who have set a githubUsername
 * 3. For each user, calls the sync function to fetch and save their current GitHub stats
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
 */

export const startGithubSyncCron = () => {
    // Schedule task to run every day at 11:59 PM
    cron.schedule('59 23 * * *', async () => {
        console.log('🔄 Starting automatic GitHub sync for all users...');
        
        try {
            // Find all users who have a GitHub username set
            const users = await User.find({ githubUsername: { $ne: null } });
            
            if (users.length === 0) {
                console.log('⚠️  No users with GitHub usernames found');
                return;
            }

            console.log(`📊 Syncing GitHub stats for ${users.length} users...`);

            let successCount = 0;
            let failCount = 0;

            // Sync stats for each user
            // Sequential processing to avoid rate limiting from the GitHub API
            for (const user of users) {
                const success = await syncGithubStatsForUser(user._id.toString());
                if (success) {
                    successCount++;
                } else {
                    failCount++;
                }

                // Add a small delay between requests to avoid hitting rate limits
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
            }

            console.log(`✅ GitHub sync completed: ${successCount} succeeded, ${failCount} failed`);
        } catch (error) {
            console.error('❌ Error during automatic GitHub sync:', error);
        }
    });

    console.log('⏰ GitHub automatic sync cron job initialized (runs daily at 11:59 PM)');
};

/**
 * OPTIONAL: Manual trigger for testing or backfilling
 * You can call this function to immediately run the sync for all users
 * without waiting for the scheduled time
 */
export const runImmediateGithubSync = async () => {
    console.log('🔄 Running immediate GitHub sync for all users...');
    
    try {
        const users = await User.find({ githubUsername: { $ne: null } });
        
        if (users.length === 0) {
            console.log('⚠️  No users with GitHub usernames found');
            return { success: 0, failed: 0 };
        }

        let successCount = 0;
        let failCount = 0;

        for (const user of users) {
            const success = await syncGithubStatsForUser(user._id.toString());
            if (success) {
                successCount++;
            } else {
                failCount++;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`✅ Immediate GitHub sync completed: ${successCount} succeeded, ${failCount} failed`);
        return { success: successCount, failed: failCount };
    } catch (error) {
        console.error('❌ Error during immediate GitHub sync:', error);
        return { success: 0, failed: 0 };
    }
};
