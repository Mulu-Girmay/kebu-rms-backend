import mongoose from 'mongoose';
import { config } from './environments.js';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoose.url);
        console.log(`MongoDB Connected Successfully! Host:${conn.connection.host}`)
    } catch (error:any) {
        console.error(`Database connection failed ${error.message}`);
        process.exit(1);
    }
};

