import { model } from 'mongoose';
import type { IWallet } from './schema.js';
import walletSchema from './schema.js';


const Wallet = model<IWallet>('Wallet', walletSchema);

export default Wallet;