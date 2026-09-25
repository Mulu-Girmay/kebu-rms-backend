import { Schema } from 'mongoose';
import { MODEL_NAMES, AUDIT_ACTION_VALUES } from '../../utils/constants.js';

export const auditSchema = new Schema(
  {
    userId: {
      type: String,
      ref: MODEL_NAMES.USER,
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: AUDIT_ACTION_VALUES,
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
      type: Schema.Types.Mixed,
      required: true,
    },

    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

auditSchema.index({ tableName: 1, recordId: 1, createdAt: -1 });
