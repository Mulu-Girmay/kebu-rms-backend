import app from './config/express.js';
import { config } from './config/environments.js';
import { connectDB } from './config/mongoose.js';
import logger from './config/winston.js';

import { createServer } from 'node:http';
import { initializeSocket } from './socket/index.js';
const startServer = async () => {
  try {
    
      await connectDB();
      const server = createServer(app);
      
      initializeSocket(server);

      server.listen(config.port, () => {
        logger.info(`Server is listening on port ${config.port}`);
      });
    }
    catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
  }
};

startServer();
