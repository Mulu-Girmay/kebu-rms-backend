import app from './config/express.js';
import { config } from './config/environments.js';
import { connectDB } from './config/mongoose.js';
import logger from './config/winston.js';
import { verifyTransporter } from './config/nodemailer.js';

import { createServer } from 'node:http';
import { initializeSocket } from './socket/index.js';
const startServer = async () => {
  try {
    await connectDB();
    const emailReady = await verifyTransporter();
    if (!emailReady) {
      logger.warn(
        'Email delivery is unavailable. Password reset and verification emails will not be sent until mail credentials are corrected.'
      );
    }
    const server = createServer(app);

    initializeSocket(server);

    server.listen(config.port, () => {
      logger.info(`Server is listening on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
