import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js'

import { protect } from './middleware/auth.js';
import { register, login } from './controllers/authController.js';
import { logHeartbeat } from './controllers/activityController.js';
import { getTodayStats } from "./controllers/vscode_stats.js";
import { syncMyLeetcodeStats } from './controllers/leetcodeController.js';
import { updateLeetcodeUsername, getProfile } from './controllers/userController.js';
import { syncMyGithubStats, updateGithubUsername } from './controllers/githubController.js';
import { startLeetcodeSyncCron } from './services/leetcodeCronService.js';
import { startGithubSyncCron } from './services/githubCronService.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/auth/signup', register);
app.post('/api/auth/login', login);
app.post('/api/heartbeat', protect, logHeartbeat);
app.post('/api/get_stats', protect, getTodayStats);
app.post('/api/leetcode/sync', protect, syncMyLeetcodeStats);
app.get('/api/user/profile', protect, getProfile);
app.put('/api/user/leetcode-username', protect, updateLeetcodeUsername);
app.post('/api/github/sync', protect, syncMyGithubStats);
app.put('/api/user/github-username', protect, updateGithubUsername);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
    👑 GREZ Backend is Live!
    🚀 Port: ${PORT}
    🐘 MongoDB: Connected
    💓 Monitoring pulses...
    `);
    
    // Start the automatic LeetCode sync cron job
    startLeetcodeSyncCron();
    
    // Start the automatic GitHub sync cron job
    startGithubSyncCron();
});