import mongoose from 'mongoose';
import { config } from './environments.js';
import logger from './winston.js';
import dns from 'dns';

export const connectDB = async () => {
  try {
    const servers = dns.getServers();
    if (
      servers.includes('127.0.0.1') ||
      servers.includes('::1') ||
      servers.length === 0
    ) {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    }
    const conn = await mongoose.connect(config.mongoose.url);

    logger.info(
      `MongoDB connected successfully! Host: ${conn.connection.host}`
    );
  } catch (error) {
    logger.error('Database connection failed', { error });

    process.exit(1);
  }
};
