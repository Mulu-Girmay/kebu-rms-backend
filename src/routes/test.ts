import express, { Router } from 'express';
import type { Request, Response } from 'express';

const route: Router = express.Router();

route.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Idea tracker API is up and running' });
});

export default route;
