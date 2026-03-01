import mongoose, { Schema, Document } from 'mongoose';

export interface IDailyStats extends Document {
    userId: mongoose.Types.ObjectId;
    date: string;
    coding: {
        totalMinutes: number;
        projects: string[];
        languages: string[];
    };
    leetcode?: {
        easySolved: number;
        mediumSolved: number;
        hardSolved: number;
        totalSolved: number;
        lastSynced?: Date | null;
    };
}

const DailyStatsSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    date: {type: String, required: true }, // Format: "YYYY-MM-DD"
    coding:{
        totalMinutes: {type: Number, default: 0},
        projects: [String],
        languages: [String]
    },
    leetcode: {
        easySolved: {type: Number, default: 0},
        mediumSolved: {type: Number, default: 0},
        hardSolved: {type: Number, default: 0},
        totalSolved: {type: Number, default: 0},
        lastSynced: {type: Date, default: null} // Track when data was last fetched
    }
}, {timestamps: true});

DailyStatsSchema.index({userId: 1,date: 1}, { unique: true });

export default mongoose.model<IDailyStats>('DailyStats', DailyStatsSchema);