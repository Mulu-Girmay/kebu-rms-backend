import type { Request } from 'express';
import multer, { type FileFilterCallback, type StorageEngine } from 'multer';
import { ensureUploadDirectory, getUploadDirectory } from '../utils/upload.js';
import path from 'path';
import { APIError } from '../errors/APIError.js';
import { randomUUID } from 'crypto';

interface UploadOptions {
  allowedTypes?: string[];
  maxFileSize?: number;
}

const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    ensureUploadDirectory();
    cb(null, getUploadDirectory());
  },

  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const fileExtension = path.extname(file.originalname);
    const filename = `${randomUUID()}${fileExtension}`;
    cb(null, filename);
  },
});

const createFileFilter = (allowedTypes?: string[]) => {
  return (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ): void => {
    if (!allowedTypes || allowedTypes.length === 0) {
      cb(null, true);
      return;
    }

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(
      new APIError(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
        400
      )
    );
  };
};

export const createUploadMiddleware = (options: UploadOptions = {}) => {
  const { allowedTypes, maxFileSize } = options;

  return multer({
    storage,
    fileFilter: createFileFilter(allowedTypes),
    limits: {
      fileSize: maxFileSize,
    },
  });
};
