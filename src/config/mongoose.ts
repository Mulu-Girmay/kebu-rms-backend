import mongoose from 'mongoose';
import { config } from './environments.js';
import logger from './winston.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoose.url);

    logger.info(
      `MongoDB connected successfully! Host: ${conn.connection.host}`,
    );
  } catch (error) {
    logger.error('Database connection failed', { error });

    process.exit(1);
  }
};