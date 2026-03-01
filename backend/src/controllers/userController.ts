import type { Request, Response } from 'express';
import User from '../models/User.js';

// Update user's LeetCode username
export const updateLeetcodeUsername = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user;
        const { leetcodeUsername } = req.body;

        if (!leetcodeUsername || !leetcodeUsername.trim()) {
            res.status(400).json({ message: 'LeetCode username is required' });
            return;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { leetcodeUsername: leetcodeUsername.trim() },
            { new: true }
        ).select('-password'); // Don't send password back

        res.status(200).json({ 
            message: 'LeetCode username updated successfully',
            user 
        });
    } catch (error) {
        console.error('Error updating LeetCode username:', error);
        res.status(500).json({ message: 'Server error while updating profile' });
    }
};

// Get user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user;
        
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
};
