import { Router } from 'express';
import {
  createOrder,
  getCustomerOrders,
  getOrderById,
  cancelOrder,
  reorder,
  toggleFavoriteOrder,
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
} from '../validators/order.validator.js';
import { RESOURCES, ACTIONS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const orderAdminRouter = Router();
export const orderCustomerRouter = Router();

orderAdminRouter.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.READ),
  orderQuerySchema,
  validateRequest,
  asyncHandler(getCustomerOrders)
);

orderCustomerRouter.post(
  '/',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.CREATE),
  createOrderSchema,
  validateRequest,
  asyncHandler(createOrder)
);

orderAdminRouter.get(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.READ),
  orderIdParamSchema,
  validateRequest,
  asyncHandler(getOrderById)
);

orderCustomerRouter.get(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.READ),
  orderIdParamSchema,
  validateRequest,
  asyncHandler(getOrderById)
);

orderCustomerRouter.patch(
  '/:id/cancel',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.UPDATE),
  orderIdParamSchema,
  cancelOrderSchema,
  validateRequest,
  asyncHandler(cancelOrder)
);

orderCustomerRouter.post(
  '/:id/reorder',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.CREATE),
  orderIdParamSchema,
  validateRequest,
  asyncHandler(reorder)
);

orderCustomerRouter.patch(
  '/:id/favorite',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.UPDATE),
  orderIdParamSchema,
  favoriteOrderSchema,
  validateRequest,
  asyncHandler(toggleFavoriteOrder)
);
