import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { Audit } from '../models/audits/index.js';
import { Order } from '../models/orders/index.js';
import { Wallet } from '../models/wallet/index.js';
import { WalletTransaction } from '../models/walletTransaction/index.js';
import { WalletTransactionType } from '../utils/constants.js';
import { Parser } from 'json2csv';

export const getAllAudits = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const {
    userId,
    action,
    tableName,
    recordId,
    from,
    to,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query as {
    userId?: string;
    action?: string;
    tableName?: string;
    recordId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'updatedAt' | 'action' | 'tableName';
    order?: 'asc' | 'desc';
  };

  const filter: Record<string, unknown> = {};

  if (userId) filter.userId = userId;
  if (action) filter.action = action;
  if (tableName) filter.tableName = tableName;
  if (recordId) filter.recordId = recordId;

  if (from || to) {
    const createdAt: { $gte?: Date; $lte?: Date } = {};

    if (from) createdAt.$gte = new Date(from);
    if (to) createdAt.$lte = new Date(to);

    filter.createdAt = createdAt;
  }

  const skip = (page - 1) * limit;
  const sortDirection = order === 'asc' ? 1 : -1;

  const [audits, total] = await Promise.all([
    Audit.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
      .lean(),
    Audit.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  res.status(200).json({
    success: true,
    data: audits,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
};

export const getAuditById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params as { id: string };

  const audit = await Audit.findById(id).lean();

  if (!audit) {
    res.status(404).json({
      success: false,
      message: 'Audit record not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: audit,
  });
};

export const exportAudits = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const {
    userId,
    from,
    to,
    saving = 0,
    change = 0,
    salary = 0,
  } = req.query as {
    userId?: string;
    from?: string;
    to?: string;
    saving?: number;
    change?: number;
    salary?: number;
  };

  const createdAt: { $gte?: Date; $lte?: Date } = {};
  if (from) createdAt.$gte = new Date(from);
  if (to) createdAt.$lte = new Date(to);

  const dateFilter = from || to ? { createdAt } : {};
  const orderFilter: Record<string, unknown> = {
    ...dateFilter,
    status: { $nin: ['cancelled', 'rejected'] },
    paymentStatus: 'paid',
  };
  if (userId) orderFilter.userId = userId;

  const [orders, depositTotals] = await Promise.all([
    Order.find(orderFilter).sort({ createdAt: 1 }).lean(),
    WalletTransaction.aggregate<{ total: number }>([
      {
        $match: {
          type: WalletTransactionType.CREDIT,
          'meta.reason': 'wallet_topup',
          ...dateFilter,
        },
      },
      {
        $lookup: {
          from: Wallet.collection.name,
          localField: 'wallet',
          foreignField: '_id',
          as: 'wallet',
        },
      },
      { $unwind: '$wallet' },
      ...(userId ? [{ $match: { 'wallet.user': userId } }] : []),
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const revenue = orders.reduce((total, order) => total + order.totalAmount, 0);
  const depositsTotal = depositTotals[0]?.total ?? 0;
  const period = from && to ? `${from} to ${to}` : from || to || 'All time';

  type ExportRow = {
    revenue: number;
    period: string;
    order: string;
    depositsTotal: number;
    date: string;
    day: string;
    foodItem: string;
    pricePerItem: string;
    saving: number;
    change: number;
    salary: number;
    total: number;
  };

  const rows: ExportRow[] = orders.map((order) => {
    const date = order.createdAt;
    return {
      revenue,
      period,
      order: order.orderNumber,
      depositsTotal,
      date: date.toISOString().slice(0, 10),
      day: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date),
      foodItem: order.items
        .map((item) => `${item.quantity}x ${item.name}`)
        .join(', '),
      pricePerItem: order.items
        .map((item) => `${item.quantity}x ${item.unitPrice}`)
        .join(', '),
      saving,
      change,
      salary,
      total: order.totalAmount,
    };
  });

  rows.push({
    revenue,
    period,
    order: 'TOTAL',
    depositsTotal,
    date: '',
    day: '',
    foodItem: '',
    pricePerItem: '',
    saving: saving * orders.length,
    change: change * orders.length,
    salary: salary * orders.length,
    total: revenue,
  });

  const parser = new Parser({
    fields: [
      { label: 'Revenue', value: 'revenue' },
      { label: 'Period', value: 'period' },
      { label: 'Order', value: 'order' },
      { label: 'Deposits Total', value: 'depositsTotal' },
      { label: 'Date', value: 'date' },
      { label: 'Day', value: 'day' },
      { label: 'Food Item', value: 'foodItem' },
      { label: 'Price per item', value: 'pricePerItem' },
      { label: 'Saving', value: 'saving' },
      { label: 'Change', value: 'change' },
      { label: 'Salary', value: 'salary' },
      { label: 'Total', value: 'total' },
    ],
    withBOM: true,
  });

  const csv = parser.parse(rows);

  res
    .status(200)
    .setHeader('Content-Type', 'text/csv; charset=utf-8')
    .setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"')
    .send(csv);
};

export const getAuditStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { from, to } = req.query as {
    from?: string;
    to?: string;
  };

  const filter: Record<string, unknown> = {};

  if (from || to) {
    const createdAt: { $gte?: Date; $lte?: Date } = {};

    if (from) createdAt.$gte = new Date(from);
    if (to) createdAt.$lte = new Date(to);

    filter.createdAt = createdAt;
  }

  const [total, byAction, byTable, byUser] = await Promise.all([
    Audit.countDocuments(filter),

    Audit.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    Audit.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$tableName',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    Audit.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      byAction,
      byTable,
      byUser,
    },
  });
};

export const getMyAudits = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const {
    page = 1,
    limit = 10,
    action,
    tableName,
    from,
    to,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query as {
    page?: number;
    limit?: number;
    action?: string;
    tableName?: string;
    from?: string;
    to?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'action' | 'tableName';
    order?: 'asc' | 'desc';
  };

  const filter: Record<string, unknown> = {
    userId: req.user!.id,
  };

  if (action) filter.action = action;
  if (tableName) filter.tableName = tableName;

  if (from || to) {
    const createdAt: { $gte?: Date; $lte?: Date } = {};

    if (from) createdAt.$gte = new Date(from);
    if (to) createdAt.$lte = new Date(to);

    filter.createdAt = createdAt;
  }

  const skip = (page - 1) * limit;
  const sortDirection = order === 'asc' ? 1 : -1;

  const [audits, total] = await Promise.all([
    Audit.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limit)
      .lean(),
    Audit.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  res.status(200).json({
    success: true,
    data: audits,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
};
