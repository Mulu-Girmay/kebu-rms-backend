import { walletTransactionSchema } from './schema.js';
import { Wallet } from '../wallet/index.js';
import { User } from '../users/index.js';
import { Order } from '../orders/index.js';
import { type PipelineStage } from 'mongoose';

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
  dateRange,
}: {
  page: number;
  limit: number;
  dateRange?: number;
}) {
  const skip = (page - 1) * limit;

  const match: Record<string, any> = {};

  if (dateRange) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    match.createdAt = {
      $gte: startDate,
    };
  }

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

    {
      $facet: {
        transactions: [
          {
            $sort: {
              createdAt: -1,
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
      },
    },
  ];

  const [result] = await this.aggregate(pipeline);

  return {
    transactions: result?.transactions ?? [],
    total: result?.total[0]?.count ?? 0,
  };
};
