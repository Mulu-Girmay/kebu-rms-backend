import { model } from 'mongoose';
import walletTransactionSchema, {
  type IWalletTransaction,
} from './schema.js';

const WalletTransaction = model<IWalletTransaction>(
  'WalletTransaction',
  walletTransactionSchema,
);

export default WalletTransaction;