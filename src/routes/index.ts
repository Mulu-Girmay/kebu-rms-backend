import { Router } from 'express';
import categoryRoutes from './category.routes.js';
import menuItemRoutes from './menuItem.routes.js';
import rbacTest from './rabac.js';

const router = Router();

router.use('/categories', categoryRoutes);
router.use('/menu-items', menuItemRoutes);
router.use('/v1/test', rbacTest);

export default router;
