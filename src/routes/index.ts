import { Router } from 'express';
import rbacTest from './rabac.js';
import userRoutes from './adminUser.js';
import userProfileRoutes from './userProfile.js';
import categoryRoutes from './category.routes.js';
import menuItemRoutes from './menuItem.routes.js';

import clientMenuRoutes from './menuItem.js';
import clientCategoryRoutes from './category.js';
import orderRoutes from './order.routes.js';
import favoriteRoutes from './favorite.routes.js';
import ratingRoutes from './rating.routes.js';
import rolesRouter from './roles.js';
import walletRoutes from './wallet.js';
import {
  creditAccountAdminRouter,
  creditAccountSelfRouter,
} from './creditAccount.js';

const router = Router();

router.use('/test', rbacTest);

router.use('/users', userRoutes);
router.use('/user/me', userProfileRoutes);

router.use('/admin/roles', rolesRouter);
router.use('/admin/categories', categoryRoutes);
router.use('/admin/menu-items', menuItemRoutes);

router.use('/categories', clientCategoryRoutes);
router.use('/menu-items', clientMenuRoutes);

router.use('/orders', orderRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/ratings', ratingRoutes);
router.use('/wallet', walletRoutes);

router.use('/credit-account', creditAccountSelfRouter);
router.use('/admin/credit-accounts', creditAccountAdminRouter);
export default router;
