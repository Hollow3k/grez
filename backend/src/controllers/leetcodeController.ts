import type { Request, Response } from 'express';

interface LeetcodeSolvedStats {
    solvedProblem: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
}

export const getLeetcodeStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username } = req.params;

        if (!username) {
            res.status(400).json({ message: 'Username is required' });
            return;
        }

        const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/solved`);
        
        if (!response.ok) {
            res.status(response.status).json({ message: 'Failed to fetch LeetCode stats' });
            return;
        }
        
        const data: LeetcodeSolvedStats = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching LeetCode stats:', error);
        res.status(500).json({ message: 'Server error while fetching LeetCode stats' });
    }
};
