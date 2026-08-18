import { orderSchema } from "./schema.js";

orderSchema.methods.isCancelable = function (): boolean {
  return this.status === "placed" || this.status === "accepted";
};

orderSchema.methods.isAccepted = function (): boolean {
  return this.status === "accepted" || ["accepted", "preparing", "ready", "completed"].includes(this.status);
};