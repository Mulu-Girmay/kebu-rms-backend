import { fileSchema } from './schema.js';

fileSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();

  return this.save();
};
