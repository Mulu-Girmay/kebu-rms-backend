import { categorySchema } from "./schema.js";

categorySchema.statics.findByName = async function (name: string) {
  return this.findOne({ name: name.trim() });
};

categorySchema.statics.findActive = async function () {
  return this.find({ isActive: true });
};
