import express, { Router } from 'express';
import type { Request, Response } from 'express';

import { createUploadMiddleware } from '../middlewares/upload.js';

const route: Router = express.Router();

route.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Idea tracker API is up and running' });
});

const imageUpload = createUploadMiddleware({
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxFileSize: 5 * 1024 * 1024,
});

route.post(
  '/upload',
  imageUpload.single('file'),
  (req: Request, res: Response) => {
    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: req.file,
    });
  }
);

route.post(
  '/uploads',
  imageUpload.array('files', 10),
  (req: Request, res: Response) => {
    res.status(201).json({
      success: true,
      message: 'Files uploaded successfully',
      files: req.files,
    });
  }
);

export default route;
