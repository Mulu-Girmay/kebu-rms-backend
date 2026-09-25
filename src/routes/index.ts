import { Router } from 'express';
import rbacTest from './rabac.js';
import userRoutes from './adminUser.js';
import userProfileRoutes from './userProfile.js';
const router = Router();

router.use('/test', rbacTest);
router.use('/users', userRoutes);
router.use('/user/me', userProfileRoutes);

export default router;
