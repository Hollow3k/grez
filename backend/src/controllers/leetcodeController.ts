import type { Request, Response } from 'express';
import DailyStats from '../models/DailyStats.js';
import User from '../models/User.js';
import axios from 'axios';

interface LeetcodeSolvedStats {
    solvedProblem: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
}

// Sync LeetCode stats for the authenticated user
export const syncMyLeetcodeStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user; // From auth middleware

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (!user.leetcodeUsername) {
            res.status(400).json({ message: 'LeetCode username not set. Please update your profile first.' });
            return;
        }

        // Fetch current stats from LeetCode API
        console.log(`🔍 Fetching LeetCode stats for username: ${user.leetcodeUsername}`);
        
        try {
            const response = await axios.get(`https://alfa-leetcode-api.onrender.com/${user.leetcodeUsername}/solved`);
            const leetcodeData: LeetcodeSolvedStats = response.data;
            console.log(`✅ LeetCode data fetched:`, leetcodeData);
            
            // Get today's date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];

            // Update or create today's stats
            const dailyStats = await DailyStats.findOneAndUpdate(
                { userId, date: today } as any,
                {
                    $set: {
                        'leetcode.easySolved': leetcodeData.easySolved,
                        'leetcode.mediumSolved': leetcodeData.mediumSolved,
                        'leetcode.hardSolved': leetcodeData.hardSolved,
                        'leetcode.totalSolved': leetcodeData.solvedProblem,
                        'leetcode.lastSynced': new Date()
                    }
                },
                { upsert: true, new: true }
            );

            res.status(200).json({ 
                message: 'LeetCode stats synced successfully',
                stats: dailyStats?.leetcode || null
            });
        } catch (apiError: any) {
            console.error('❌ LeetCode API Error:', apiError.message);
            
            if (apiError.response?.status === 404) {
                res.status(404).json({ message: `LeetCode username "${user.leetcodeUsername}" not found. Please check and update your username.` });
            } else if (apiError.code === 'ENOTFOUND' || apiError.code === 'ECONNREFUSED') {
                res.status(503).json({ message: 'Unable to reach LeetCode API. Please try again later.' });
            } else {
                res.status(500).json({ message: `Failed to fetch LeetCode stats: ${apiError.message}` });
            }
            return;
        }
    } catch (error: any) {
        console.error('❌ Error syncing LeetCode stats:', error);
        res.status(500).json({ message: 'Server error while syncing LeetCode stats' });
    }
};

// Helper function to sync LeetCode stats for a specific user (used by cron job)
export const syncLeetcodeStatsForUser = async (userId: string, date?: string): Promise<boolean> => {
    let user;
    try {
        user = await User.findById(userId);
        if (!user || !user.leetcodeUsername) {
            return false;
        }

        console.log(`🔍 [Cron] Fetching LeetCode stats for user: ${user.leetcodeUsername}`);
        
        const response = await axios.get(`https://alfa-leetcode-api.onrender.com/${user.leetcodeUsername}/solved`);
        const leetcodeData: LeetcodeSolvedStats = response.data;

        // Use provided date or today's date
        const targetDate = date || new Date().toISOString().split('T')[0];

        await DailyStats.findOneAndUpdate(
            { userId, date: targetDate } as any,
            {
                $set: {
                    'leetcode.easySolved': leetcodeData.easySolved,
                    'leetcode.mediumSolved': leetcodeData.mediumSolved,
                    'leetcode.hardSolved': leetcodeData.hardSolved,
                    'leetcode.totalSolved': leetcodeData.solvedProblem,
                    'leetcode.lastSynced': new Date()
                }
            },
            { upsert: true, new: true }
        );

        console.log(`✅ Synced LeetCode stats for user ${userId} (${user.leetcodeUsername})`);
        return true;
    } catch (error: any) {
        console.error(`❌ Error syncing LeetCode stats for user ${userId}:`, error.message);
        if (error.response?.status === 404) {
            console.error(`  → LeetCode username "${user?.leetcodeUsername || 'unknown'}" not found`);
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            console.error(`  → Unable to reach LeetCode API`);
        }
        return false;
    }
};
