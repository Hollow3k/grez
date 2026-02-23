import mongoose, { Schema, Document } from 'mongoose';

const DailyStatsSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    date: {type: String, required: true }, // Format: "YYYY-MM-DD"
    coding:{
        totalMinutes: {type: Number, default: 0},
        projects: [String],
        languages: [String]
    }
}, {timestamps: true});

DailyStatsSchema.index({userId: 1,date: 1}, { unique: true });

export default mongoose.model('DailyStats', DailyStatsSchema);