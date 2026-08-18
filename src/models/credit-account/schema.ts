import { Schema } from 'mongoose';

export type CreditAccountStatus = 'active' | 'frozen' | 'closed';

export interface ICreditAccount {
  user: Schema.Types.ObjectId;
  creditLimit: number;
  usedCredit: number;
  status: CreditAccountStatus;
}

const creditAccountSchema = new Schema<ICreditAccount>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    creditLimit: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    usedCredit: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ['active', 'frozen', 'closed'],
      default: 'active',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export default creditAccountSchema;