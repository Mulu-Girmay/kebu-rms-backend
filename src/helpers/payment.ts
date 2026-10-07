import type { ClientSession } from 'mongoose';
import { Wallet } from '../models/wallet/index.js';
import { CreditAccount } from '../models/creditAccount/index.js';
import { APIError } from '../errors/APIError.js';

export async function fetchAccounts(userId: string, session: ClientSession) {
  const wallet = await Wallet.findOne({ user: userId }).session(session).exec();
  const creditAccount = await CreditAccount.findOne({ user: userId })
    .session(session)
    .exec();

  if (!wallet) {
    throw new APIError('Wallet not found for this user', 404);
  }

  if (!creditAccount) {
    throw new APIError('CreditAccount not found for this user', 404);
  }
  return { wallet, creditAccount };
}
