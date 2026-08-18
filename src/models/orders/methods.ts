import { orderSchema } from "./schema.js";

orderSchema.methods.isCancelable = function (): boolean {
  return this.status === "placed" || this.status === "accepted";
};
