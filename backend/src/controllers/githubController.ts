import type { Request, Response } from 'express';
import DailyStats from '../models/DailyStats.js';
import User from '../models/User.js';
import { fetchGithubStats } from '../services/githubService.js';

// Sync GitHub stats for the authenticated user
export const syncMyGithubStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user; // From auth middleware

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (!user.githubUsername) {
            res.status(400).json({ message: 'GitHub username not set. Please update your profile first.' });
            return;
        }

        // Fetch current stats from GitHub API
        console.log(`🔍 Fetching GitHub stats for username: ${user.githubUsername}`);
        
        try {
            const githubData = await fetchGithubStats(user.githubUsername);
            console.log(`✅ GitHub data fetched:`, githubData);
            
            // Get today's date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];

            // Update or create today's stats
            const dailyStats = await DailyStats.findOneAndUpdate(
                { userId, date: today } as any,
                {
                    $set: {
                        'github.commits': githubData.commits,
                        'github.topRepo': githubData.topRepo,
                        'github.lastSynced': new Date()
                    }
                },
                { upsert: true, new: true }
            );

            res.status(200).json({ 
                message: 'GitHub stats synced successfully',
                stats: dailyStats?.github || null
            });
        } catch (apiError: any) {
            console.error('❌ GitHub API Error:', apiError.message);
            res.status(500).json({ message: `Failed to fetch GitHub stats: ${apiError.message}` });
            return;
        }
    } catch (error: any) {
        console.error('❌ Error syncing GitHub stats:', error);
        res.status(500).json({ message: 'Server error while syncing GitHub stats' });
    }
};

// Helper function to sync GitHub stats for a specific user (used by cron job)
export const syncGithubStatsForUser = async (userId: string, date?: string): Promise<boolean> => {
    let user;
    try {
        user = await User.findById(userId);
        if (!user || !user.githubUsername) {
            return false;
        }

        console.log(`🔍 [Cron] Fetching GitHub stats for user: ${user.githubUsername}`);
        
        const githubData = await fetchGithubStats(user.githubUsername);

        // Use provided date or today's date
        const targetDate = date || new Date().toISOString().split('T')[0];

        await DailyStats.findOneAndUpdate(
            { userId, date: targetDate } as any,
            {
                $set: {
                    'github.commits': githubData.commits,
                    'github.topRepo': githubData.topRepo,
                    'github.lastSynced': new Date()
                }
            },
            { upsert: true }
        );

        console.log(`✅ [Cron] GitHub stats synced for ${user.githubUsername}: ${githubData.commits} commits`);
        return true;
    } catch (error: any) {
        console.error(`❌ [Cron] Failed to sync GitHub stats for user ${user?.githubUsername || userId}:`, error.message);
        return false;
    }
};

// Update user's GitHub username
export const updateGithubUsername = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user;
        const { githubUsername } = req.body;

        if (!githubUsername || !githubUsername.trim()) {
            res.status(400).json({ message: 'GitHub username is required' });
            return;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { githubUsername: githubUsername.trim() },
            { new: true }
        ).select('-password'); // Don't send password back

        res.status(200).json({ 
            message: 'GitHub username updated successfully',
            user 
        });
    } catch (error) {
        console.error('Error updating GitHub username:', error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
};
