import type {  Request, Response } from 'express';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('API up and running!');
});


app.listen(PORT, () => {
  console.log(`Server is listning on port ${PORT}`);
});
