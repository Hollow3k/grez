import type { Response } from 'express';
import DailyStats from '../models/DailyStats.js';

export const logHeartbeat = async (req: any, res: Response) => {
    try{
        const {project,language} = req.body;
        const today = new Date().toISOString().split('T')[0];

        await DailyStats.findOneAndUpdate(
            { userId: req.user, date: today} as any,
            {
            $inc: { "coding.totalMinutes": 2 }, // 2-min heartbeat increment
                $addToSet: { 
                    "coding.projects": project, 
                    "coding.languages": language 
                }
            },
            { upsert: true, new: true }
        );

        res.status(201).json({ success: true });
    }catch (error:any){
        console.error("❌ Heartbeat Sync Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};