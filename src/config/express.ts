import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { config } from './environments.js';
import { getUploadDirectory, ensureUploadDirectory } from '../utils/upload.js';
import categoryRoutes from '../routes/category.routes.js';
import menuItemRoutes from '../routes/menuItem.routes.js';
import rbacTest from '../routes/rabac.js';

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

// Serve static uploads
app.use('/uploads', express.static(getUploadDirectory()));

// Base health check
app.get('/api', (_req: Request, res: Response) => {
  res.send('API up and running!');
});

app.use('/api/categories', categoryRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/v1/test', rbacTest);

// Centralized error handling middleware (always after all routes)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode =
    err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
    },
  });
});

export default app;
