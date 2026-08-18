import { Schema } from "mongoose";
export const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
    },

    is_system_role: {
      type: Boolean,
      default: true,
    },
     permissions: [{
      type: Schema.Types.ObjectId,
      ref: "Permission"
        }]
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

roleSchema.index({ name: 1 }, { unique: true });