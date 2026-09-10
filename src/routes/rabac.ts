import express, { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/authorize.js';
import { RESOURCES, ACTIONS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router: Router = express.Router();

// Public test route (no auth)
router.get('/public', (req, res) => {
  res.json({ message: 'Public route - no permission needed' });
});

// Protected test route (requires 'users:read' permission)
router.get(
  '/protected',
  requireAuth,
  requirePermission(RESOURCES.USERS, ACTIONS.READ),
  asyncHandler(async (req: any, res) => {
    res.json({
      message: 'You have users:read permission!',
      user: req.user,
    });
  })
);

// Admin-only test route (requires 'users:delete' permission)
router.delete(
  '/admin-only',
  requireAuth,
  requirePermission(RESOURCES.USERS, ACTIONS.DELETE),
  asyncHandler(async (req, res) => {
    res.json({
      message: 'You have users:delete permission! Admin access granted.',
    });
  })
);

export default router;
