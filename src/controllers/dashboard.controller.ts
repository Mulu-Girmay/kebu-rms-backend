import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { APIError } from '../errors/APIError.js';
import { Order } from '../models/orders/index.js';
import { WalletTransaction } from '../models/walletTransaction/index.js';
import { MenuItem } from '../models/menuItems/index.js';
import { Category } from '../models/categories/index.js';
import { User } from '../models/users/index.js';
import { Role } from '../models/role/index.js';
import { Rating } from '../models/ratings/index.js';
import { Audit } from '../models/audits/index.js';
import { UserStatus } from '../utils/constants.js';

interface ChartBucket {
  date: string;
  label: string;
  revenue: number;
  orders: number;
  startTime?: number;
  endTime?: number;
}

const ROLE_COLORS: Record<string, string> = {
  customer: '#322214',
  kitchen_admin: '#C89933',
  finance_admin: '#10B981',
  super_admin: '#6366F1',
};
const DEFAULT_ROLE_COLOR = '#8B5CF6';

const formatHourLabel = (hour: number): string => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h} ${period}`;
};

const calcTrend = (current: number, previous: number): number => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  // 1. RBAC Check: Ensure user is authenticated and not a customer/employee
  if (!req.user?.id) {
    throw new APIError('Unauthorized: Authentication required', 401);
  }

  const currentUser = await User.findById(req.user.id).populate<{
    role_id: any;
  }>('role_id');
  if (!currentUser) {
    throw new APIError('User not found', 404);
  }

  const userRole = currentUser.role_id?.name;
  if (!userRole || userRole === 'customer') {
    throw new APIError(
      'Forbidden: Admin access required for dashboard statistics',
      403
    );
  }

  const period = (req.query.period as 'today' | '7d' | '30d') || 'today';

  // 2. Determine date intervals
  const now = new Date();
  let startDate: Date;
  let prevStartDate: Date;
  let prevEndDate: Date;

  if (period === '7d') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    prevEndDate = new Date(startDate);
    prevStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  } else if (period === '30d') {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    prevEndDate = new Date(startDate);
    prevStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  } else {
    // 'today': from midnight today
    startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    prevEndDate = new Date(startDate);
    prevStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
  }

  // 3. High Performance Single-Level Facet Aggregation on Orders
  const [orderFacetResults, walletResults] = await Promise.all([
    Order.aggregate([
      {
        $facet: {
          // Real-time active queue status across all active orders
          queueCounts: [
            {
              $match: {
                status: { $in: ['placed', 'accepted', 'preparing', 'ready'] },
              },
            },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ],
          // Current period metrics
          currentSummary: [
            {
              $match: {
                createdAt: { $gte: startDate, $lte: now },
              },
            },
            {
              $group: {
                _id: null,
                totalRevenue: {
                  $sum: {
                    $cond: [
                      { $in: ['$status', ['cancelled', 'rejected']] },
                      0,
                      '$totalAmount',
                    ],
                  },
                },
                validOrdersCount: {
                  $sum: {
                    $cond: [
                      { $in: ['$status', ['cancelled', 'rejected']] },
                      0,
                      1,
                    ],
                  },
                },
                allOrdersCount: { $sum: 1 },
                completedCount: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
                  },
                },
              },
            },
          ],
          prepTime: [
            {
              $match: {
                createdAt: { $gte: startDate, $lte: now },
                readyAt: { $ne: null },
                placedAt: { $ne: null },
              },
            },
            {
              $project: {
                prepMinutes: {
                  $divide: [
                    {
                      $subtract: [
                        '$readyAt',
                        { $ifNull: ['$acceptedAt', '$placedAt'] },
                      ],
                    },
                    60000,
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgPrepTimeMin: { $avg: '$prepMinutes' },
              },
            },
          ],
          hourlyDistribution: [
            {
              $match: {
                createdAt: { $gte: startDate, $lte: now },
              },
            },
            {
              $group: {
                _id: { $hour: '$createdAt' },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
          ],
          rawOrders: [
            {
              $match: {
                createdAt: { $gte: startDate, $lte: now },
                status: { $nin: ['cancelled', 'rejected'] },
              },
            },
            {
              $project: {
                createdAt: 1,
                totalAmount: 1,
              },
            },
          ],
          // Previous period for trends
          previousPeriod: [
            {
              $match: {
                createdAt: { $gte: prevStartDate, $lt: prevEndDate },
                status: { $nin: ['cancelled', 'rejected'] },
              },
            },
            {
              $group: {
                _id: null,
                prevRevenue: { $sum: '$totalAmount' },
                prevOrders: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]),

    // Wallet transaction aggregation for period
    WalletTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
          type: { $in: ['credit', 'debit'] },
        },
      },
      {
        $group: {
          _id: null,
          totalDeposits: {
            $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] },
          },
          totalDebits: {
            $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] },
          },
        },
      },
    ]),
  ]);

  const facet = orderFacetResults[0] || {};
  const summary = facet.currentSummary?.[0] || {};
  const prep = facet.prepTime?.[0] || {};
  const previousData = facet.previousPeriod?.[0] || {};

  // Parse queue counts
  const queueMap: Record<string, number> = {};
  for (const q of facet.queueCounts || []) {
    queueMap[q._id] = q.count;
  }
  const pendingCount = (queueMap['placed'] || 0) + (queueMap['accepted'] || 0);
  const preparingCount = queueMap['preparing'] || 0;
  const readyCount = queueMap['ready'] || 0;
  const completedCount = summary.completedCount || 0;

  // Finance calculations
  const totalRevenue = Number((summary.totalRevenue || 0).toFixed(2));
  const prevRevenue = Number((previousData.prevRevenue || 0).toFixed(2));
  const revenueTrendPct = calcTrend(totalRevenue, prevRevenue);

  const totalOrders = summary.validOrdersCount || 0;
  const prevOrders = previousData.prevOrders || 0;
  const ordersTrendPct = calcTrend(totalOrders, prevOrders);

  const avgOrderValue =
    totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

  const totalDeposits = Number(
    (walletResults[0]?.totalDeposits || 0).toFixed(2)
  );
  const totalDebits = Number((walletResults[0]?.totalDebits || 0).toFixed(2));

  // Build Chart Data
  const rawOrders = facet.rawOrders || [];
  let chartData: ChartBucket[] = [];

  if (period === 'today') {
    const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
    chartData = hours.map((h) => ({
      date: `${h.toString().padStart(2, '0')}:00`,
      label: formatHourLabel(h),
      revenue: 0,
      orders: 0,
    }));

    for (const ord of rawOrders) {
      const orderDate = new Date(ord.createdAt);
      const bucketIdx = Math.floor(orderDate.getHours() / 2);
      const targetBucket = chartData[bucketIdx];
      if (targetBucket) {
        targetBucket.revenue = Number(
          (targetBucket.revenue + (ord.totalAmount || 0)).toFixed(2)
        );
        targetBucket.orders += 1;
      }
    }
  } else if (period === '7d') {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dateIndexMap = new Map<string, number>();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0] ?? '';
      const label = dayNames[d.getDay()] ?? '';
      dateIndexMap.set(dateStr, chartData.length);
      chartData.push({
        date: dateStr,
        label,
        revenue: 0,
        orders: 0,
      });
    }

    for (const ord of rawOrders) {
      const dateStr = new Date(ord.createdAt).toISOString().split('T')[0] ?? '';
      const idx = dateIndexMap.get(dateStr);
      if (idx !== undefined && chartData[idx]) {
        chartData[idx]!.revenue = Number(
          (chartData[idx]!.revenue + (ord.totalAmount || 0)).toFixed(2)
        );
        chartData[idx]!.orders += 1;
      }
    }
  } else {
    // 30d: 4 weekly buckets
    const bucketCount = 4;
    const bucketDurationMs = (30 * 24 * 60 * 60 * 1000) / bucketCount;

    for (let i = 0; i < bucketCount; i++) {
      const bStart = new Date(startDate.getTime() + i * bucketDurationMs);
      const dateStr = bStart.toISOString().split('T')[0] ?? '';
      chartData.push({
        date: dateStr,
        label: `Week ${i + 1}`,
        revenue: 0,
        orders: 0,
        startTime: bStart.getTime(),
        endTime: bStart.getTime() + bucketDurationMs,
      });
    }

    for (const ord of rawOrders) {
      const t = new Date(ord.createdAt).getTime();
      for (const bucket of chartData) {
        if (
          bucket.startTime &&
          bucket.endTime &&
          t >= bucket.startTime &&
          t < bucket.endTime
        ) {
          bucket.revenue = Number(
            (bucket.revenue + (ord.totalAmount || 0)).toFixed(2)
          );
          bucket.orders += 1;
          break;
        }
      }
    }

    chartData.forEach((b) => {
      delete b.startTime;
      delete b.endTime;
    });
  }

  // Hourly rush calculation
  const hourlyRushList = (facet.hourlyDistribution || [])
    .slice(0, 5)
    .map((h: any) => ({
      hour: formatHourLabel(h._id),
      count: h.count,
    }));
  const hourlyRush =
    hourlyRushList.length > 0 ? hourlyRushList : [{ hour: '12 PM', count: 0 }];

  const avgPrepTimeMin = Math.round(prep.avgPrepTimeMin || 0);

  // 4. Menu & Category Metrics
  const [
    totalCategories,
    totalItems,
    availableCount,
    outOfStockCount,
    outOfStockDocs,
    topRatings,
  ] = await Promise.all([
    Category.countDocuments({ isActive: true }),
    MenuItem.countDocuments(),
    MenuItem.countDocuments({ isAvailable: true }),
    MenuItem.countDocuments({ isAvailable: false }),
    MenuItem.find({ isAvailable: false })
      .populate('categoryId', 'name')
      .limit(5)
      .lean(),
    Rating.aggregate([
      {
        $group: {
          _id: '$menuItemId',
          avgRating: { $avg: '$score' },
          count: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1, count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const outOfStockItems = outOfStockDocs.map((item: any) => ({
    id: item._id.toString(),
    name: item.name,
    category: item.categoryId?.name || 'Uncategorized',
    price: item.price,
    imageUrl: item.imageUrl || null,
  }));

  // Resolve top rated items
  const ratedItemIds = topRatings.map((r) => r._id);
  const ratedMenuItems =
    ratedItemIds.length > 0
      ? await MenuItem.find({ _id: { $in: ratedItemIds } }).lean()
      : [];
  const menuItemsMap = new Map(
    ratedMenuItems.map((item: any) => [item._id.toString(), item])
  );

  const topRatedItems: any[] = [];
  for (const r of topRatings) {
    const item = menuItemsMap.get(r._id.toString());
    if (item) {
      topRatedItems.push({
        id: item._id.toString(),
        name: item.name,
        rating: Math.round(r.avgRating * 10) / 10,
        price: item.price,
        imageUrl: item.imageUrl || null,
      });
    }
  }

  // Fill fallback for top rated items if fewer than 5 exist
  if (topRatedItems.length < 5) {
    const existingIds = new Set(topRatedItems.map((i) => i.id));
    const fallbackItems = await MenuItem.find({
      isAvailable: true,
      _id: { $nin: Array.from(existingIds) },
    })
      .sort({ favoriteCount: -1 })
      .limit(5 - topRatedItems.length)
      .lean();

    for (const fItem of fallbackItems) {
      topRatedItems.push({
        id: (fItem as any)._id.toString(),
        name: (fItem as any).name,
        rating: 5.0,
        price: (fItem as any).price,
        imageUrl: (fItem as any).imageUrl || null,
      });
    }
  }

  // 5. Users & Roles Distribution
  const [totalUsers, activeUsers, newUsersThisPeriod, roleGroups, allRoles] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: UserStatus.ACTIVE }),
      User.countDocuments({ created_at: { $gte: startDate } }),
      User.aggregate([
        {
          $group: {
            _id: '$role_id',
            count: { $sum: 1 },
          },
        },
      ]),
      Role.find().lean(),
    ]);

  const roleNameMap = new Map(
    allRoles.map((r: any) => [r._id.toString(), r.name])
  );
  const rolesDistribution = roleGroups.map((rg) => {
    const roleKey = rg._id
      ? roleNameMap.get(rg._id.toString()) || 'customer'
      : 'customer';
    return {
      role: roleKey,
      count: rg.count,
      color: ROLE_COLORS[roleKey] || DEFAULT_ROLE_COLOR,
    };
  });

  // 6. Recent Audit Activity Stream
  const [recentAudits, recentOrders] = await Promise.all([
    Audit.find().sort({ createdAt: -1 }).limit(10).lean(),
    Order.find().sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  const auditTypeMap: Record<string, string> = {
    Order: 'order',
    orders: 'order',
    MenuItem: 'menu',
    menu_items: 'menu',
    Category: 'menu',
    categories: 'menu',
    Wallet: 'finance',
    wallets: 'finance',
    WalletTransaction: 'finance',
    wallet_transactions: 'finance',
    users: 'user',
    User: 'user',
  };

  const recentActivity: any[] = [];

  for (const a of recentAudits) {
    const mappedType = auditTypeMap[a.tableName] || 'system';
    const actionLabel = a.action ? a.action.toUpperCase() : 'UPDATE';
    recentActivity.push({
      id: (a as any)._id.toString(),
      type: mappedType,
      title: `${mappedType.charAt(0).toUpperCase() + mappedType.slice(1)} ${actionLabel}`,
      description:
        a.meta && typeof a.meta === 'object' && Object.keys(a.meta).length > 0
          ? JSON.stringify(a.meta).slice(0, 80)
          : `Record in ${a.tableName} modified`,
      timestamp: (a as any).createdAt,
      status: 'success',
    });
  }

  // Complement activity stream with recent orders if audit logs are few
  if (recentActivity.length < 5) {
    for (const ord of recentOrders) {
      recentActivity.push({
        id: (ord as any)._id.toString(),
        type: 'order',
        title: `Order #${(ord as any).orderNumber || (ord as any).displayNumber || 'Placed'}`,
        description: `Total: $${(ord as any).totalAmount} | Status: ${(ord as any).status}`,
        timestamp: (ord as any).createdAt,
        status:
          (ord as any).status === 'cancelled' ||
          (ord as any).status === 'rejected'
            ? 'failed'
            : 'success',
      });
    }
  }

  // Sort activities by timestamp descending and take top 10
  recentActivity.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const trimmedRecentActivity = recentActivity.slice(0, 10);

  // 7. Return Full Response adhering strictly to the contract
  res.status(200).json({
    success: true,
    data: {
      period,
      finance: {
        totalRevenue,
        revenueTrendPct,
        totalDeposits,
        totalDebits,
        avgOrderValue,
        chartData,
      },
      orders: {
        totalOrders,
        ordersTrendPct,
        pendingCount,
        preparingCount,
        readyCount,
        completedCount,
        avgPrepTimeMin,
        hourlyRush,
      },
      menu: {
        totalCategories,
        totalItems,
        availableCount,
        outOfStockCount,
        outOfStockItems,
        topRatedItems,
      },
      users: {
        totalUsers,
        activeUsers,
        newUsersThisPeriod,
        rolesDistribution,
      },
      recentActivity: trimmedRecentActivity,
    },
  });
};
