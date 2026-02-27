import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js'

import { protect } from './middleware/auth.js';
import { register, login } from './controllers/authController.js';
import { logHeartbeat } from './controllers/activityController.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/auth/signup', register);
app.post('/api/auth/login', login);
app.post('/api/heartbeat', protect, logHeartbeat);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
    👑 GREZ Backend is Live!
    🚀 Port: ${PORT}
    🐘 MongoDB: Connected
    💓 Monitoring pulses...
    `);
});