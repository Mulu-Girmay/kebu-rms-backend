import { Schema } from "mongoose";

export const auditSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: ["create", "read", "update", "delete"],
      required: true,
    },

    tableName: {
      type: String,
      required: true,
    },

    // Polymorphic pointer: tableName tells you which collection recordId
    // belongs to, so it's stored as a plain string rather than a typed
    // ref (Mongoose refs can't target "whichever collection this row says").
    recordId: {
      type: String,
      required: true,
    },

    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps:true
  }
);

auditSchema.index({ tableName: 1, recordId: 1, createdAt: -1 });
