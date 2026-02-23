import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string);
        console.log(`🐘 MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
        console.error(`❌ Database Error: ${error.message}`);
        process.exit(1); // Stop the server if DB connection fails
    }
};