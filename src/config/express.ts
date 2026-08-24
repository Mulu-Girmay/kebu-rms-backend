import express from 'express';
import type { Express, Request, Response } from 'express';
import cors from 'cors';
import testRoutes from '../routes/test.js';

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api', (_req: Request, res: Response) => {
  res.send('API up and running!');
});

// Test routes (health check, transporter verification, email sending)
app.use('/api/test', testRoutes);

export default app;
