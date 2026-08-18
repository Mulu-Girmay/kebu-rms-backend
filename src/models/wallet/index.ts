import { model } from 'mongoose';

import walletSchema, { type IWallet } from './schema.js';
import { walletMethods } from './methods.js';
walletSchema.method(walletMethods);


const Wallet = model<IWallet>(
  'Wallet',
  walletSchema,
);

export default Wallet;