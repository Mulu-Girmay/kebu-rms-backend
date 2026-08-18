import type { InferSchemaType } from "mongoose";
import { orderSchema } from "./schema.js";

export type Order = InferSchemaType<typeof orderSchema>;

orderSchema.statics.findByUserId = async function (userId: string): Promise<Order[]> {
  return this.find({ userId }).sort({ createdAt: -1 });
};

orderSchema.statics.findByOrderNumber = async function (orderNumber: string): Promise<Order | null> {
  return this.findOne({ orderNumber });
};

orderSchema.statics.findByStatus = async function (status: string): Promise<Order[]> {
   const validStatuses = ["placed", "rejected", "accepted", "preparing", "ready", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
  return this.find({ status }).sort({ createdAt: -1 });
};

orderSchema.statics.findByDateRange = async function (start: Date, end: Date): Promise<Order[]> {
  return this.find({
    createdAt: {
      $gte: start,
      $lt: end,
    },
  }).sort({ createdAt: -1 });
};

orderSchema.statics.findPendingOrders = async function (): Promise<Order[]> {
  return this.find({
    status: { $in: ["placed", "accepted", "preparing"] }
  }).sort({ placedAt: 1 });
};