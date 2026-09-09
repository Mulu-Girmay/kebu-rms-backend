import express from 'express';
import type { Express, Request, Response } from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { config } from './environments.js';
import testRoutes from '../routes/test.js';
import userRoutes from '../routes/adminUser.js';
import rbacTest from '../routes/rabac.js';
import path from 'node:path';
const app: Express = express();

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.get('/api', (_req: Request, res: Response) => {
  res.send('API up and running!');
});
export default app;
