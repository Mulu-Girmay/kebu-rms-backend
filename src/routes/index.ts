import { Router } from 'express';
import rbacTest from './rabac.js';
import userRoutes from './adminUser.js';
import userProfileRoutes from './userProfile.js';
import categoryRoutes from './category.routes.js';
import menuItemRoutes from './menuItem.routes.js';
import orderRoutes from './order.routes.js';
import favoriteRoutes from './favorite.routes.js';
import ratingRoutes from './rating.routes.js';
import rolesRouter from './roles.js';
import walletRoutes from './wallet.js';

const router = Router();

router.use('/test', rbacTest);
router.use('/users', userRoutes);
router.use('/user/me', userProfileRoutes);
router.use('/categories', categoryRoutes);
router.use('/menu-items', menuItemRoutes);
router.use('/orders', orderRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/ratings', ratingRoutes);
router.use('/v1/test', rbacTest);
router.use('/api/v1/users', userRoutes);
router.use('/wallet', walletRoutes);
router.use('/', rolesRouter);
router.use('/test', rbacTest);
router.use('/users', userRoutes);

export default router;
