import fs from 'fs';
import path from 'path';
import { APIError } from '../errors/APIError.js';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

export const ensureUploadDirectory = (): void => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

export const getUploadPath = (filename: string): string => {
  return path.join(UPLOAD_DIR, filename);
};

export const deleteUploadedFile = (filename: string): void => {
  const filePath = getUploadPath(filename);

  if (!fs.existsSync(filePath)) {
    throw new APIError('File not found', 404);
  }

  fs.unlinkSync(filePath);
};

export const downloadUploadedFile = (filename: string): fs.ReadStream => {
  const filePath = getUploadPath(filename);

  if (!fs.existsSync(filePath)) {
    throw new APIError('File not found', 404);
  }

  return fs.createReadStream(filePath);
};

export const getUploadDirectory = (): string => {
  return UPLOAD_DIR;
};
