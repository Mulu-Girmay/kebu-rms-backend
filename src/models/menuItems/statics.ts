import { menuItemSchema } from "./schema.js";

menuItemSchema.statics.findByCategoryId = async function (categoryId: string) {
  return this.find({ categoryId });
};

menuItemSchema.statics.findAvailableByCategoryId = async function (categoryId: string) {
  return this.find({ categoryId, isAvailable: true });
};

menuItemSchema.statics.findAvailable = async function () {
  return this.find({ isAvailable: true });
};
