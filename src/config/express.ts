import express from 'express';
import type { Express, Request, Response } from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { config } from './environments.js';
import routes from '../routes/index.js';
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
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.get('/api', (_req: Request, res: Response) => {
  res.send('API up and running!');
});
app.use('/api/v1', routes);
export default app;
