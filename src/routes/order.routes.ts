import { Router } from 'express';
import {
  createOrder,
  getCustomerOrders,
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

const router = Router();

router.post(
  '/',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.CREATE),
  createOrderSchema,
  validateRequest,
  asyncHandler(createOrder)
);

router.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.READ),
  orderQuerySchema,
  validateRequest,
  asyncHandler(getCustomerOrders)
);

/** Kitchen Service / Order Desk routes (placed before /:id) */
router.get(
  '/kitchen',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.READ),
  kitchenOrderQuerySchema,
  validateRequest,
  asyncHandler(getKitchenOrders)
);

router.get('/service/status', requireAuth, asyncHandler(getServiceStatus));

router.patch(
  '/service/pause',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.UPDATE),
  pauseOrdersSchema,
  validateRequest,
  asyncHandler(togglePauseOrders)
);

router.get(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.READ),
  orderIdParamSchema,
  validateRequest,
  asyncHandler(getOrderById)
);

router.patch(
  '/:id/cancel',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.UPDATE),
  orderIdParamSchema,
  cancelOrderSchema,
  validateRequest,
  asyncHandler(cancelOrder)
);

router.post(
  '/:id/reorder',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.CREATE),
  orderIdParamSchema,
  validateRequest,
  asyncHandler(reorder)
);

router.patch(
  '/:id/favorite',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.UPDATE),
  orderIdParamSchema,
  favoriteOrderSchema,
  validateRequest,
  asyncHandler(toggleFavoriteOrder)
);

router.patch(
  '/:id/status',
  requireAuth,
  requirePermission(RESOURCES.ORDERS, ACTIONS.UPDATE),
  orderIdParamSchema,
  updateOrderStatusSchema,
  asyncHandler(updateOrderStatus)
);

export default router;
