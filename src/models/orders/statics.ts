import { orderSchema } from "./schema.js";

orderSchema.statics.findByUserId = async function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

orderSchema.statics.findByOrderNumber = async function (orderNumber: string) {
  return this.findOne({ orderNumber });
};

orderSchema.statics.findByStatus = async function (status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};
