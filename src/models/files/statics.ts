import { fileSchema } from './schema.js';

fileSchema.statics.findActiveById = async function (fileId: string) {
  return this.findOne({
    _id: fileId,
    isDeleted: false,
  });
};

fileSchema.statics.findByUploader = async function (userId: string) {
  return this.find({
    uploadedBy: userId,
    isDeleted: false,
  });
};
