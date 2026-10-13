import type { PaymentBreakdown, TopUpResult } from '../types/types.js';
import {
  CreditAccountStatus,
  WalletTransactionType,
} from '../utils/constants.js';
import { WalletTransaction } from '../models/walletTransaction/index.js';
import logger from '../config/winston.js';
import { APIError } from '../errors/APIError.js';
import { fetchAccounts } from '../helpers/payment.js';
import type { ClientSession } from 'mongoose';

export const PaymentService = {
  async chargeOrder(
    userId: string,
    orderId: string,
    total: number,
    session: ClientSession
  ): Promise<PaymentBreakdown> {
    if (total <= 0) {
      throw new APIError('Order total must be greater than zero', 400);
    }

    const { wallet, creditAccount } = await fetchAccounts(userId, session);

    if (!wallet.isActive) {
      throw new APIError('Wallet is not active. Please contact support', 400);
    }

    const walletAmount = Math.min(wallet.balance, total);
    const creditAmount = total - walletAmount;

    if (creditAmount > 0) {
      if (creditAccount.status !== CreditAccountStatus.ACTIVE) {
        throw new APIError(
          `Credit account is ${creditAccount.status}. Cannot use credit.`,
          400
        );
      }
      if (!creditAccount.hasAvailableCredit(creditAmount)) {
        throw new APIError(
          `Insufficient balance. Wallet: ${wallet.balance}, Credit available: ${creditAccount.getAvailableCredit()}, Required: ${total}`,
          400
        );
      }
    }

    const walletBefore = wallet.balance;
    const creditBefore = creditAccount ? creditAccount.usedCredit : 0;

    // Deduct balances
    wallet.balance -= walletAmount;
    await wallet.save({ session });

    if (creditAmount > 0 && creditAccount) {
      creditAccount.usedCredit += creditAmount;
      await creditAccount.save({ session });
    }

    const txnType =
      creditAmount === 0
        ? WalletTransactionType.WALLET
        : walletAmount === 0
          ? WalletTransactionType.CREDIT
          : WalletTransactionType.MIXED;

    await WalletTransaction.create(
      [
        {
          wallet: wallet._id,
          order: orderId,
          amount: total,
          type: txnType,
          balanceBefore: walletBefore,
          balanceAfter: wallet.balance,
          meta: {
            walletAmount,
            creditAmount,
            creditUsedBefore: creditBefore,
            creditUsedAfter: creditAccount ? creditAccount.usedCredit : 0,
            reason: 'order_payment',
          },
        },
      ],
      { session }
    );

    logger.info(
      `Charged order ${orderId}: wallet=${walletAmount}, credit=${creditAmount}`
    );
    return { walletAmount, creditAmount };
  },

  async refundOrder(
    userId: string,
    order: { _id: string; paymentBreakdown: PaymentBreakdown },
    session: ClientSession
  ): Promise<void> {
    const { walletAmount, creditAmount } = order.paymentBreakdown;

    if (walletAmount === 0 && creditAmount === 0) {
      logger.warn(`Order ${order._id} has no payment to refund `);
      return;
    }

    const { wallet, creditAccount } = await fetchAccounts(userId, session);

    if (creditAmount > 0) {
      throw new APIError(
        `Credit account missing for required credit refund of ${creditAmount}`,
        500
      );
    }

    const walletBefore = wallet.balance;
    const creditBefore = creditAccount ? creditAccount.usedCredit : 0;

    // Process wallet refund
    wallet.balance += walletAmount;
    await wallet.save({ session });

    // Process credit refund
    if (creditAmount > 0) {
      creditAccount.usedCredit = Math.max(
        0,
        creditAccount.usedCredit - creditAmount
      );
      await creditAccount.save({ session });
    }

    await WalletTransaction.create(
      [
        {
          wallet: wallet._id,
          order: order._id,
          amount: walletAmount + creditAmount,
          type: WalletTransactionType.REFUND,
          balanceBefore: walletBefore,
          balanceAfter: wallet.balance,
          meta: {
            walletAmount,
            creditAmount,
            creditUsedBefore: creditBefore,
            creditUsedAfter: creditAccount ? creditAccount.usedCredit : 0,
            reason: 'order_refund',
          },
        },
      ],
      { session }
    );

    logger.info(
      `Refunded order ${order._id}: wallet=${walletAmount}, credit=${creditAmount}`
    );
  },

  async topUp(
    userId: string,
    amount: number,
    session: ClientSession
  ): Promise<TopUpResult> {
    console.log('HERE ssssbro');

    const { wallet, creditAccount } = await fetchAccounts(userId, session);
    console.log('HERE 0 bro');

    if (!wallet.isActive) {
      throw new APIError('Wallet is not active', 400);
    }

    // Determine split
    const creditRepaid = Math.min(amount, creditAccount.usedCredit);
    const walletCredited = amount - creditRepaid;

    const walletBefore = wallet.balance;
    const creditBefore = creditAccount.usedCredit;

    creditAccount.usedCredit -= creditRepaid;
    wallet.balance += walletCredited;

    await wallet.save({ session });
    await creditAccount.save({ session });

    //    Log TWO transactions for full audit
    //    Tx#1: The   top-up
    //    Tx#2: The credit repayment (deducted from the top-up)
    const transactions: Record<string, unknown>[] = [];
    console.log('HERE bro');
    if (creditRepaid > 0) {
      transactions.push({
        wallet: wallet._id,
        amount,
        type: WalletTransactionType.CREDIT,
        balanceBefore: walletBefore,
        balanceAfter: walletBefore + amount,
        meta: {
          reason: 'wallet_topup',
          creditRepaid,
          walletCredited,
        },
      });
      console.log('HEREs bro');

      transactions.push({
        wallet: wallet._id,
        amount: creditRepaid,
        type: WalletTransactionType.DEBIT,
        balanceBefore: walletBefore + amount,
        balanceAfter: wallet.balance,
        meta: {
          reason: 'credit_repayment',
          creditUsedBefore: creditBefore,
          creditUsedAfter: creditAccount.usedCredit,
        },
      });
    } else {
      // No credit to repay — single transaction
      transactions.push({
        wallet: wallet._id,
        amount,
        type: WalletTransactionType.CREDIT,
        balanceBefore: walletBefore,
        balanceAfter: wallet.balance,
        meta: {
          reason: 'wallet_topup',
          creditRepaid: 0,
          walletCredited: amount,
        },
      });
    }
    console.log('HERE 6bro');

    await WalletTransaction.insertMany(transactions, { session });
    console.log('HERE b66ro');

    logger.info(
      `Topped up user ${userId}: amount=${amount}, creditRepaid=${creditRepaid}, walletCredited=${walletCredited}`
    );

    return {
      walletCredited,
      creditRepaid,
      walletBalanceAfter: wallet.balance,
      creditUsedAfter: creditAccount.usedCredit,
    };
  },
};
