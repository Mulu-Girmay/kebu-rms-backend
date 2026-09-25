import { Router } from 'express';
import categoryRoutes from './category.routes.js';
import menuItemRoutes from './menuItem.routes.js';
import orderRoutes from './order.routes.js';
import favoriteRoutes from './favorite.routes.js';
import ratingRoutes from './rating.routes.js';
import rolesRouter from './roles.js';
import rbacTest from './rabac.js';
import userRoutes from './adminUser.js';
const router = Router();

router.use('/categories', categoryRoutes);
router.use('/menu-items', menuItemRoutes);
router.use('/orders', orderRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/ratings', ratingRoutes);
router.use('/v1/test', rbacTest);
router.use('/api/v1/users', userRoutes);
router.use('/', rolesRouter);

export default router;
