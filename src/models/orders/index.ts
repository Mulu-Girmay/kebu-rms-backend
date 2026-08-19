import mongoose from 'mongoose';
import type { InferSchemaType, Model } from 'mongoose';
import { orderSchema, orderItemSchema } from './schema.js';
import './methods.js';
import './statics.js';

export type OrderItem = InferSchemaType<typeof orderItemSchema>;
export type Order = InferSchemaType<typeof orderSchema>;

export interface OrderMethods {
  isCancelable(): boolean;
  isAccepted(): boolean;
}

export interface OrderModel extends Model<Order, {}, OrderMethods> {
  findByUserId(userId: string): Promise<Order[]>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findByStatus(status: string): Promise<Order[]>;
  findByDateRange(start: Date, end: Date): Promise<Order[]>;
  findPendingOrders(): Promise<Order[]>;
  findFavoriteOrders(userId: string): Promise<Order[]>;
}

export const Order = mongoose.model<Order, OrderModel>('Order', orderSchema);
export { orderSchema, orderItemSchema };
