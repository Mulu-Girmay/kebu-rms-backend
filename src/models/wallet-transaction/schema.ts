import { Schema } from 'mongoose';

export type WalletTransactionType =
  | 'mixed'
  | 'credit'
  | 'refund'
  | 'debit';

export interface IWalletTransaction {
  wallet: Schema.Types.ObjectId;
  order: Schema.Types.ObjectId;
  amount: number;
  type: WalletTransactionType;
  balanceBefore: number;
  balanceAfter: number;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      required: true,
      enum: ['mixed', 'credit', 'refund', 'debit'],
      index: true,
    },

    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

export default walletTransactionSchema;