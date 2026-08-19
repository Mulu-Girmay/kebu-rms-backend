import express from 'express';
import type { Express, Request, Response } from 'express';
import cors from 'cors';

const app: Express = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req: Request, res: Response) => {
  res.send('API up and running!');
});

export default app;
