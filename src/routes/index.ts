import { Router } from 'express';
import rbacTest from './rabac.js';
import userRoutes from './adminUser.js';
import userProfileRoutes from './userProfile.js';
import categoryRoutes from './category.routes.js';
import menuItemRoutes from './menuItem.routes.js';

import clientMenuRoutes from './menuItem.js';
import clientCategoryRoutes from './category.js';
import { orderAdminRouter, orderCustomerRouter } from './order.routes.js';
import favoriteRoutes from './favorite.routes.js';
import ratingRoutes from './rating.routes.js';
import rolesRouter from './roles.js';
import { walletAdminRouter, walletSelfRouter } from './wallet.js';
import {
  creditAccountAdminRouter,
  creditAccountSelfRouter,
} from './creditAccount.js';
import dashboardRoutes from './dashboard.routes.js';
import {
  transactionAdminRouter,
  transactionSelfRouter,
} from './transaction.js';
import { auditAdminRouter } from './audit.js';

const router = Router();

router.use('/test', rbacTest);

router.use('/admin/users', userRoutes);

router.use('/admin/dashboard', dashboardRoutes);
router.use('/admin/roles', rolesRouter);
router.use('/admin/categories', categoryRoutes);
router.use('/admin/menu-items', menuItemRoutes);

router.use('/admin/orders', orderAdminRouter);
router.use('/admin/wallet', walletAdminRouter);
router.use('/admin/transactions', transactionAdminRouter);
router.use('/admin/audit', auditAdminRouter);

router.use('/user/me', userProfileRoutes);
router.use('/categories', clientCategoryRoutes);
router.use('/menu-items', clientMenuRoutes);

router.use('/orders', orderCustomerRouter);
router.use('/favorites', favoriteRoutes);
router.use('/ratings', ratingRoutes);

router.use('/wallet', walletSelfRouter);
router.use('/transactions', transactionSelfRouter);

router.use('/credit-account', creditAccountSelfRouter);
router.use('/admin/credit-accounts', creditAccountAdminRouter);
export default router;
