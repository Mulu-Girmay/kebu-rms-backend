import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  reorder,
  toggleFavoriteOrder,
  updateOrderStatus,
  getKitchenOrders,
  togglePauseOrders,
  getServiceStatus,
} from '../controllers/order.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/authorize.js';
import { validateRequest } from '../validators/errors.parser.js';
import {
  createOrderSchema,
  orderIdParamSchema,
  orderQuerySchema,
  cancelOrderSchema,
  favoriteOrderSchema,
  updateOrderStatusSchema,
  pauseOrdersSchema,
  kitchenOrderQuerySchema,
} from '../validators/order.validator.js';
import { RESOURCES, ACTIONS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const orderAdminRouter = Router();
export const orderCustomerRouter = Router();

//  CUSTOMER ROUTES

orderCustomerRouter.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.READ),
  orderQuerySchema,
  validateRequest,
  asyncHandler(getOrders)
);

// GET /api/v1/orders/service/status
orderCustomerRouter.get(
  '/service/status',
  requireAuth,
  asyncHandler(getServiceStatus)
);

// POST /api/v1/orders
orderCustomerRouter.post(
  '/',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.CREATE),
  createOrderSchema,
  validateRequest,
  asyncHandler(createOrder)
);

// POST /api/v1/orders/:id/reorder
orderCustomerRouter.post(
  '/:id/reorder',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.CREATE),
  orderIdParamSchema,
  validateRequest,
  asyncHandler(reorder)
);

// PATCH /api/v1/orders/:id/cancel
orderCustomerRouter.patch(
  '/:id/cancel',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.UPDATE),
  orderIdParamSchema,
  cancelOrderSchema,
  validateRequest,
  asyncHandler(cancelOrder)
);

// PATCH /api/v1/orders/:id/favourite
orderCustomerRouter.patch(
  '/:id/favorite',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.UPDATE),
  orderIdParamSchema,
  favoriteOrderSchema,
  validateRequest,
  asyncHandler(toggleFavoriteOrder)
);

// GET /api/v1/orders/:id
orderCustomerRouter.get(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.READ),
  orderIdParamSchema,
  validateRequest,
  asyncHandler(getOrderById)
);
// Staff ROutes

// PATCH /api/v1/admin/orders/service/pause
orderAdminRouter.patch(
  '/service/pause',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.UPDATE),
  pauseOrdersSchema,
  validateRequest,
  asyncHandler(togglePauseOrders)
);

// GET /api/v1/admin/orders/kitchen
orderAdminRouter.get(
  '/kitchen',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.READ),
  kitchenOrderQuerySchema,
  validateRequest,
  asyncHandler(getKitchenOrders)
);

// GET /api/v1/admin/orders/:id
orderAdminRouter.get(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.READ),
  orderIdParamSchema,
  validateRequest,
  asyncHandler(getOrderById)
);

// PATCH /api/v1/admin/orders/:id/status
orderAdminRouter.patch(
  '/:id/status',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.UPDATE),
  orderIdParamSchema,
  updateOrderStatusSchema,
  validateRequest,
  asyncHandler(updateOrderStatus)
);
