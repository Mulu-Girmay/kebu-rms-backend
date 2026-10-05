import type { Response } from 'express';
import { CreditAccount } from '../models/creditAccount/index.js';
import { Audit } from '../models/audits/index.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import {
  AuditAction,
  CreditAccountStatus,
  MODEL_NAMES,
} from '../utils/constants.js';
import {
  serializeCreditAccount,
  type ICreditAccount,
} from '../utils/serializers.js';
import { APIError } from '../errors/APIError.js';
import mongoose from 'mongoose';

// GET /api/v1/credit-account
export const getMyCreditAccount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const account = await CreditAccount.findOrCreateByUser(req.user!.id);
  res.status(200).json({
    success: true,
    data: serializeCreditAccount(account as ICreditAccount),
  });
};

// GET /api/v1/admin/credit-account
export const listCreditAccounts = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const {
    status,
    hasUsage,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (hasUsage === 'true') filter.usedCredit = { $gt: 0 };
  if (hasUsage === 'false') filter.usedCredit = 0;

  const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const pageNum = Math.max(Number(page) || 1, 1);
  const skip = (pageNum - 1) * limitNum;
  const allowedSort = ['createdAt', 'creditLimit', 'usedCredit', 'updatedAt'];
  const sortField = allowedSort.includes(sortBy ?? '')
    ? (sortBy as string)
    : 'createdAt';
  const sortDirection = order === 'asc' ? 1 : -1;
  const [total, accounts] = await Promise.all([
    CreditAccount.countDocuments(filter),
    CreditAccount.find(filter)
      .populate('user', 'name email image status')
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limitNum)
      .lean<ICreditAccount[]>(),
  ]);

  const totalPages = Math.ceil(total / limitNum);
  res.status(200).json({
    success: true,
    data: accounts.map(serializeCreditAccount),
    pagination: {
      page: pageNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    },
  });
};

//GET /api/v1/admin/credit-account/:id
export const getUserCreditAccount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.params.id!;
  const account = await CreditAccount.findOne({ userid: userId })
    .populate('user', 'name image email status')
    .lean<ICreditAccount | null>();

  if (!account) {
    throw new APIError('Credit Account for this user not found', 404);
  }
  res.status(200).json({
    success: true,
    data: serializeCreditAccount(account),
  });
};

//PATCH /api/v1/admin/credit-account/:id/limit
export const updateCreditLimit = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.params.id!;
  const creditLimit = req.body.creditLimit;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const account = await CreditAccount.findOne({ user: userId }).session(
      session
    );
    if (!account) throw new APIError('credit account not found ', 404);
    if (creditLimit < account.usedCredit) {
      throw new APIError(
        `Credit limit (${creditLimit}) cannot be lower tha usedCredit (${account.usedCredit})`,
        400
      );
    }

    const oldLimit = account.creditLimit;
    account.creditLimit = creditLimit;

    await account.save({ session });

    await Audit.create(
      [
        {
          userId: req.user!.id,
          action: AuditAction.UPDATE,
          tableName: MODEL_NAMES.CREDIT_ACCOUNT,
          recordId: account._id,
          meta: {
            action: 'credit_limit_change',
            from: { creditLImit: oldLimit },
            to: { creditLimit: account.creditLimit },
          },
        },
      ],
      { session }
    );
    res.status(200).json({
      success: true,
      message: 'credit limit updated sucessfully',
      data: serializeCreditAccount(account as ICreditAccount),
    });
    await session.commitTransaction();
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

//PATCH /api/v1/admin/credit-account/:id/used-credit

export const adjustUsedCredit = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.params.id!;
  const { usedCredit, reason } = req.body;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const account = await CreditAccount.findOne({ user: userId }).session(
      session
    );
    if (!account) throw new APIError('Credit account not found ', 404);
    if (account.status === CreditAccountStatus.CLOSED) {
      throw new APIError('Cannot modify a closed credit account', 400);
    }
    if (usedCredit > account.creditLimit) {
      throw new APIError(
        `Credit limit (${usedCredit}) cannot be lower tha usedCredit (${account.usedCredit})`,
        400
      );
    }
    const oldUsed = account.usedCredit;
    account.usedCredit = usedCredit;
    await account.save({ session });

    await Audit.create(
      [
        {
          userId: req.user!.id,
          action: AuditAction.UPDATE,
          tableName: MODEL_NAMES.CREDIT_ACCOUNT,
          recordId: account._id,
          meta: {
            action: 'used_credit_adjustment',
            from: { usedCredit: oldUsed },
            to: { usedCredit: account.usedCredit },
            reason,
          },
        },
      ],
      { session }
    );
    await session.commitTransaction();
    res.status(200).json({
      success: true,
      message: 'used credit adjusted successfully',
      data: serializeCreditAccount(account as ICreditAccount),
    });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

//PATCH /api/v1/admin/credit-account/:id/freeze
export const freezCreditAccount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.params.id!;
  const reason = req.body.reason;

  const account = await CreditAccount.findOne({ user: userId });
  if (!account) throw new APIError('credit account not found', 404);

  if (account.status === CreditAccountStatus.FROZEN) {
    res.status(200).json({
      success: true,
      message: 'credit account is already frozzen',
      data: serializeCreditAccount(account as ICreditAccount),
    });
  }
  const oldStatus = account.status;
  account.status = CreditAccountStatus.FROZEN;
  await account.save();

  await Audit.create({
    userId: req.user!.id,
    action: AuditAction.UPDATE,
    tableName: MODEL_NAMES.CREDIT_ACCOUNT,
    recordId: account._id,
    meta: {
      from: { status: oldStatus },
      to: { status: account.status },
      reason: reason ?? null,
    },
  });
  res.status(200).json({
    success: true,
    message: 'Credit account frozen successfully',
    data: serializeCreditAccount(account as ICreditAccount),
  });
};

//PATCH /api/v1/admin/credit-account/:id/activate
export const activateCreditAccount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.params.id!;
  const reason = req.body.reason;

  const account = await CreditAccount.findOne({ user: userId });
  if (!account) throw new APIError('credit account not found', 404);

  if (account.status === CreditAccountStatus.ACTIVE) {
    res.status(200).json({
      success: true,
      message: 'credit account is already active',
      data: serializeCreditAccount(account as ICreditAccount),
    });
  }
  const oldStatus = account.status;
  account.status = CreditAccountStatus.ACTIVE;
  await account.save();

  await Audit.create({
    userId: req.user!.id,
    action: AuditAction.UPDATE,
    tableName: MODEL_NAMES.CREDIT_ACCOUNT,
    recordId: account._id,
    meta: {
      from: { status: oldStatus },
      to: { status: account.status },
      reason: reason ?? null,
    },
  });
  res.status(200).json({
    success: true,
    message: 'Credit account activated successfully',
    data: serializeCreditAccount(account as ICreditAccount),
  });
};

//PATCH /api/v1/admin/credit-account/:id/close
export const closeCreditAccount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.params.id!;
  const reason = req.body.reason;

  const account = await CreditAccount.findOne({ user: userId });
  if (!account) throw new APIError('credit account not found', 404);

  if (account.status === CreditAccountStatus.CLOSED) {
    res.status(200).json({
      success: true,
      message: 'credit account is already closed',
      data: serializeCreditAccount(account as ICreditAccount),
    });
  }
  const oldStatus = account.status;
  account.status = CreditAccountStatus.CLOSED;
  await account.save();

  await Audit.create({
    userId: req.user!.id,
    action: AuditAction.UPDATE,
    tableName: MODEL_NAMES.CREDIT_ACCOUNT,
    recordId: account._id,
    meta: {
      from: { status: oldStatus },
      to: { status: account.status },
      reason: reason ?? null,
    },
  });
  res.status(200).json({
    success: true,
    message: 'Credit account closed successfully',
    data: serializeCreditAccount(account as ICreditAccount),
  });
};
