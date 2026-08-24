import mongoose from 'mongoose';
import type { InferSchemaType, Model } from 'mongoose';

import { fileSchema } from './schema.js';
import { MODEL_NAMES } from '../../utils/constants.js';

import './methods.js';
import './statics.js';

export type File = InferSchemaType<typeof fileSchema>;

export interface FileMethods {
  softDelete(): Promise<File>;
}

export interface FileModel extends Model<File, {}, FileMethods> {
  findActiveById(fileId: string): Promise<File | null>;
  findByUploader(userId: string): Promise<File[]>;
}

export const File = mongoose.model<File, FileModel>(
  MODEL_NAMES.FILE,
  fileSchema
);
