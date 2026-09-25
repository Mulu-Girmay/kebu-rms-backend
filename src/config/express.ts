import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { config } from './environments.js';
import path from 'node:path';
import { getUploadDirectory, ensureUploadDirectory } from '../utils/upload.js';
import routes from '../routes/index.js';
import { errorHandler } from '../middlewares/error.js';

const app: Express = express();

ensureUploadDirectory();

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.get('/api', (_req: Request, res: Response) => {
  res.send('API up and running!');
});
app.use('/api/v1', routes);

// Centralized error handling middleware (always after all routes)
app.use(errorHandler);

export default app;
