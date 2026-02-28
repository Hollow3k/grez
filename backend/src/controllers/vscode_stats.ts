import DailyStats from '../models/DailyStats.js';

export const getTodayStats = async (req: any, res: any) => {
    const today = new Date().toISOString().split('T')[0] as string; // "2026-02-28"
    
    const dailyStats = await DailyStats.findOne({ 
        userId: req.user, 
        date: today 
    });
    
    if (!dailyStats) {
        return res.json({
            coding: {
                totalMinutes: 0,
                projects: [],
                languages: []
            }
        });
    }
    
    res.json(dailyStats);
};