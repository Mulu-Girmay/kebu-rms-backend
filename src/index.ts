import app from './config/express.js';
import { config } from './config/environments.js';
import { connectDB } from './config/mongoose.js';
import logger from './config/winston.js';

const startServer = async () => {
  try {
   
    await connectDB();

    app.listen(config.port, () => {
      logger.info(`Server is listening on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
