import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { Order } from '../models/orders/index.js';
import { MenuItem } from '../models/menuItems/index.js';
import { User } from '../models/users/index.js';
import { APIError } from '../errors/APIError.js';
import { OrderStatus } from '../utils/constants.js';
import { socketManager } from '../socket/manager.js';
import { SOCKET_EVENTS } from '../socket/events.js';
import logger from '../config/winston.js';

export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new APIError('Unauthorized: User ID not found', 401);
  }

  const { items, customerNotes } = req.body as {
    items: Array<{ menuItemId: string; quantity: number }>;
    customerNotes?: string;
  };

  const menuItemIds = items.map((i) => i.menuItemId);
  const foundMenuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

  const menuItemMap = new Map(
    foundMenuItems.map((item) => [item._id.toString(), item])
  );

  for (const item of items) {
    const menuItem = menuItemMap.get(item.menuItemId);
    if (!menuItem) {
      throw new APIError(
        `Menu item with ID "${item.menuItemId}" not found`,
        404
      );
    }
    if (!menuItem.isAvailable) {
      throw new APIError(
        `Menu item "${menuItem.name}" is currently unavailable`,
        400
      );
    }
  }

  let totalAmount = 0;
  const orderItems = items.map((item) => {
    const menuItem = menuItemMap.get(item.menuItemId)!;
    const unitPrice = menuItem.price;
    totalAmount += unitPrice * item.quantity;

    return {
      menuItemId: menuItem._id,
      name: menuItem.name,
      quantity: item.quantity,
      unitPrice,
    };
  });
  totalAmount = Math.round(totalAmount * 100) / 100;

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
  const orderNumber = `ORD-${dateStr}-${randomStr}`;

  const order = await Order.create({
    userId,
    orderNumber,
    items: orderItems,
    totalAmount,
    customerNotes: customerNotes ? customerNotes.trim() : null,
    status: OrderStatus.PLACED,
    placedAt: now,
  });

  try {
    socketManager.emitToRoom('orders', 'order:placed', order);
  } catch (error) {
    logger.warn('Failed to emit socket event for order:placed', error);
  }

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: order,
  });
};

export const getCustomerOrders = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new APIError('Unauthorized: User ID not found', 401);
  }

  const {
    filter,
    status,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const queryFilter: Record<string, unknown> = { userId };

  if (status && typeof status === 'string') {
    queryFilter.status = status;
  } else if (filter === 'active') {
    queryFilter.status = {
      $in: [
        OrderStatus.PLACED,
        OrderStatus.ACCEPTED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
      ],
    };
  } else if (filter === 'history') {
    queryFilter.status = {
      $in: [OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REJECTED],
    };
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Math.min(100, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortField = typeof sortBy === 'string' ? sortBy : 'createdAt';
  const sort: Record<string, 1 | -1> = { [sortField]: sortDirection };

  const [total, orders] = await Promise.all([
    Order.countDocuments(queryFilter),
    Order.find(queryFilter)
      .populate('items.menuItemId', 'name imageUrl price isAvailable')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    pagination: {
      total,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
    count: orders.length,
    data: orders,
  });
};

export const getOrderById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const orderId = req.params.id as string;

  const order = await Order.findById(orderId).populate(
    'items.menuItemId',
    'name imageUrl price isAvailable'
  );

  if (!order) {
    throw new APIError('Order not found', 404);
  }

  if (order.userId !== userId) {
    throw new APIError('Forbidden: Access to this order is denied', 403);
  }

  res.status(200).json({
    success: true,
    data: order,
  });
};

export const cancelOrder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const orderId = req.params.id as string;
  const { rejectionReason } = req.body || {};

  const order = await Order.findById(orderId);

  if (!order) {
    throw new APIError('Order not found', 404);
  }

  if (order.userId !== userId) {
    throw new APIError('Forbidden: Access to this order is denied', 403);
  }

  if (order.status !== OrderStatus.PLACED) {
    throw new APIError(
      `Order cannot be cancelled because its current status is "${order.status}". Only orders with status "placed" can be cancelled by customer.`,
      400
    );
  }

  order.status = OrderStatus.CANCELLED;
  order.cancelledAt = new Date();
  if (rejectionReason) {
    order.rejectionReason = rejectionReason;
  }

  await order.save();

  try {
    socketManager.emitToRoom('orders', 'order:cancelled', order);
  } catch (error) {
    logger.warn('Failed to emit socket event for order:cancelled', error);
  }

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
};

export const reorder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const orderId = req.params.id as string;

  const previousOrder = await Order.findById(orderId);

  if (!previousOrder) {
    throw new APIError('Order not found', 404);
  }

  if (previousOrder.userId !== userId) {
    throw new APIError('Forbidden: Access to this order is denied', 403);
  }

  const menuItemIds = previousOrder.items.map((i) => i.menuItemId);
  const foundMenuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

  const menuItemMap = new Map(
    foundMenuItems.map((item) => [item._id.toString(), item])
  );

  const reorderItems = previousOrder.items.map((item) => {
    const menuItem = menuItemMap.get(item.menuItemId.toString());
    const isAvailable = menuItem ? menuItem.isAvailable : false;
    const currentPrice = menuItem ? menuItem.price : item.unitPrice;

    return {
      menuItemId: item.menuItemId,
      name: item.name,
      quantity: item.quantity,
      previousUnitPrice: item.unitPrice,
      currentUnitPrice: currentPrice,
      isAvailable,
    };
  });

  const allAvailable = reorderItems.every((item) => item.isAvailable);

  res.status(200).json({
    success: true,
    message: allAvailable
      ? 'All items are available for reorder'
      : 'Some items from this previous order are currently unavailable',
    allAvailable,
    data: {
      originalOrderId: previousOrder._id,
      items: reorderItems,
    },
  });
};

export const toggleFavoriteOrder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const orderId = req.params.id as string;
  const { favoriteLabel } = req.body || {};

  const order = await Order.findById(orderId);

  if (!order) {
    throw new APIError('Order not found', 404);
  }

  if (order.userId !== userId) {
    throw new APIError('Forbidden: Access to this order is denied', 403);
  }

  order.isFavorite = !order.isFavorite;
  if (favoriteLabel !== undefined) {
    order.favoriteLabel = favoriteLabel;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: order.isFavorite
      ? 'Order marked as favorite'
      : 'Order removed from favorites',
    data: order,
  });
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const orderId = req.params.id as string;
  const { status, rejectionReason } = req.body as {
    status: OrderStatus;
    rejectionReason?: string;
  };

  const user = await User.findById(userId).populate<{ role_id: any }>(
    'role_id'
  );
  const roleName = user?.role_id?.name;
  if (roleName === 'customer') {
    throw new APIError(
      'Forbidden: Only kitchen staff or administrators can update order status',
      403
    );
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new APIError('Order not found', 404);
  }

  const terminalStatuses = [
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
    OrderStatus.REJECTED,
  ];
  if (terminalStatuses.includes(order.status as OrderStatus)) {
    throw new APIError(
      `Cannot update order because its current status is "${order.status}". Terminal orders cannot be updated.`,
      400
    );
  }

  const allowedTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
    [OrderStatus.PLACED]: [
      OrderStatus.ACCEPTED,
      OrderStatus.REJECTED,
      OrderStatus.CANCELLED,
    ],

    [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],

    [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],

    [OrderStatus.READY]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  };

  const currentStatus = order.status as OrderStatus;

  if (!allowedTransitions[currentStatus]?.includes(status)) {
    throw new APIError(
      `Invalid order status transition from "${currentStatus}" to "${status}"`,
      400
    );
  }

  const now = new Date();
  order.status = status;

  if (status === OrderStatus.ACCEPTED) {
    order.acceptedAt = now;
  } else if (status === OrderStatus.REJECTED) {
    order.rejectedAt = now;
    if (rejectionReason) {
      order.rejectionReason = rejectionReason.trim();
    }
  } else if (status === OrderStatus.READY) {
    order.readyAt = now;
  } else if (status === OrderStatus.COMPLETED) {
    order.completedAt = now;
  } else if (status === OrderStatus.CANCELLED) {
    order.cancelledAt = now;
    if (rejectionReason) {
      order.rejectionReason = rejectionReason.trim();
    }
  }

  await order.save();

  try {
    socketManager.emitToRoom('orders', 'order:status_changed', order);
    socketManager.emitToRoom(
      'orders',
      SOCKET_EVENTS.ORDER_STATUS_CHANGED,
      order
    );
    if (order.userId) {
      socketManager.emitToUser(order.userId, 'order:status_changed', order);
      socketManager.emitToUser(
        order.userId,
        SOCKET_EVENTS.ORDER_STATUS_CHANGED,
        order
      );
    }
  } catch (error) {
    logger.warn('Failed to emit socket event for order:status_changed', error);
  }

  res.status(200).json({
    success: true,
    message: `Order status updated to "${status}" successfully`,
    data: order,
  });
};
