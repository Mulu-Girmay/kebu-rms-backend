import { walletTransactionSchema } from './schema.js';
import { Wallet } from '../wallet/index.js';
import { User } from '../users/index.js';
import { Order } from '../orders/index.js';
import { type PipelineStage } from 'mongoose';
import type {
  WalletTransactionDateRange,
  WalletTransactionSortBy,
  WalletTransactionSortOrder,
  WalletTransactionType,
} from '../../types/types.js';

walletTransactionSchema.statics.findByUserId = async function (userId: string) {
  const wallet = await Wallet.findOne({
    user: userId,
  });

  if (!wallet) {
    return [];
  }

  return this.find({
    wallet: wallet._id,
  }).sort({ createdAt: -1 });
};

walletTransactionSchema.statics.findByOrderId = async function (
  orderId: string
) {
  return this.find({
    order: orderId,
  }).sort({ createdAt: -1 });
};

walletTransactionSchema.statics.findAllWithDetails = async function ({
  page,
  limit,
  search,
  type,
  dateRange,
  startDate,
  endDate,
  userId,
  sortBy,
  sortOrder,
}: {
  page: number;
  limit: number;
  search?: string;
  type?: WalletTransactionType;
  dateRange?: WalletTransactionDateRange;
  startDate?: string;
  endDate?: string;
  userId?: string;
  sortBy?: WalletTransactionSortBy;
  sortOrder?: WalletTransactionSortOrder;
}) {
  const skip = (page - 1) * limit;

  const match: Record<string, any> = {};

  if (type && type !== 'all') {
    switch (type) {
      case 'credit':
      case 'top_up':
        match.type = {
          $in: ['credit', 'top_up', 'topup'],
        };
        break;

      case 'debit':
        match.type = {
          $in: ['debit', 'payment'],
        };
        break;

      case 'refund':
        match.type = 'refund';
        break;

      case 'mixed':
        match.type = 'mixed';
        break;
    }
  }

  if (startDate || endDate) {
    match.createdAt = {};

    if (startDate) {
      match.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      match.createdAt.$lte = new Date(endDate);
    }
  } else if (dateRange && dateRange !== 'all') {
    const now = new Date();

    if (dateRange === 'today') {
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      match.createdAt = {
        $gte: startOfToday,
      };
    }

    if (dateRange === '7days') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      match.createdAt = {
        $gte: sevenDaysAgo,
      };
    }

    if (dateRange === '30days') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      match.createdAt = {
        $gte: thirtyDaysAgo,
      };
    }
  }

  const sortField = sortBy === 'amount' ? 'amount' : 'createdAt';
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const pipeline: PipelineStage[] = [
    {
      $match: match,
    },

    {
      $lookup: {
        from: Wallet.collection.name,
        localField: 'wallet',
        foreignField: '_id',
        as: 'wallet',
      },
    },

    {
      $unwind: '$wallet',
    },

    ...(userId
      ? [
          {
            $match: {
              'wallet.user': userId,
            },
          },
        ]
      : []),

    {
      $lookup: {
        from: User.collection.name,
        localField: 'wallet.user',
        foreignField: '_id',
        as: 'user',
      },
    },

    {
      $unwind: '$user',
    },

    {
      $lookup: {
        from: Order.collection.name,
        localField: 'order',
        foreignField: '_id',
        as: 'order',
      },
    },

    {
      $unwind: {
        path: '$order',
        preserveNullAndEmptyArrays: true,
      },
    },

    ...(search
      ? [
          {
            $match: {
              $or: [
                {
                  'user.name': {
                    $regex: search.trim(),
                    $options: 'i',
                  },
                },
                {
                  'user.email': {
                    $regex: search.trim(),
                    $options: 'i',
                  },
                },
                {
                  'order.orderNumber': {
                    $regex: search.trim(),
                    $options: 'i',
                  },
                },
              ],
            },
          },
        ]
      : []),

    {
      $facet: {
        transactions: [
          {
            $sort: {
              [sortField]: sortDirection,
            },
          },

          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
          {
            $project: {
              id: '$_id',
              date: '$createdAt',

              amount: 1,
              type: 1,
              balanceBefore: 1,
              balanceAfter: 1,

              user: {
                id: '$user._id',
                name: '$user.name',
                email: '$user.email',
                image: '$user.image',
              },

              order: {
                $cond: [
                  {
                    $ifNull: ['$order._id', false],
                  },
                  {
                    id: '$order._id',
                    orderNumber: '$order.orderNumber',
                    status: '$order.status',
                    items: '$order.items',
                    totalAmount: '$order.totalAmount',
                    placedAt: '$order.placedAt',
                  },
                  null,
                ],
              },
            },
          },
        ],

        total: [
          {
            $count: 'count',
          },
        ],

        stats: [
          {
            $group: {
              _id: null,
              totalAmount: {
                $sum: '$amount',
              },
              successfulDepositsCount: {
                $sum: {
                  $cond: [
                    {
                      $in: ['$type', ['credit', 'top_up', 'topup']],
                    },
                    1,
                    0,
                  ],
                },
              },
              pendingCount: {
                $sum: {
                  $cond: [
                    {
                      $eq: ['$order.status', 'placed'],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ],
      },
    },
  ];

  const [result] = await this.aggregate(pipeline);

  return {
    transactions: result?.transactions ?? [],
    total: result?.total[0]?.count ?? 0,
    stats: {
      totalAmount: result?.stats[0]?.totalAmount ?? 0,
      successfulDepositsCount: result?.stats[0]?.successfulDepositsCount ?? 0,
      pendingCount: result?.stats[0]?.pendingCount ?? 0,
    },
  };
};
