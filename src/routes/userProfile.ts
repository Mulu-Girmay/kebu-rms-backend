import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getProfile,
  updateSettings,
  changePassword,
  updateProfile,
  deleteProfileImage,
} from '../controllers/userProfile.js';
import { requireAuth } from '../middlewares/auth.js';
import {
  updateSelfValidator,
  passwordValidator,
  settingsValidator,
} from '../validators/user.validator.js';
import { createUploadMiddleware } from '../middlewares/upload.js';
import { validateRequest } from '../validators/errors.parser.js';

const upload = createUploadMiddleware({
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize: 5 * 1024 * 1024, // 5MB
});

const router = Router();

/** User profile */
router.get('/', requireAuth, asyncHandler(getProfile));
router.delete('/image', requireAuth, asyncHandler(deleteProfileImage));
router.patch(
  '/',
  requireAuth,
  upload.single('profileImage'),
  ...updateSelfValidator,
  validateRequest,
  asyncHandler(updateProfile)
);
router.post(
  '/password',
  requireAuth,
  ...passwordValidator,
  validateRequest,
  asyncHandler(changePassword)
);
router.patch(
  '/settings',
  requireAuth,
  ...settingsValidator,
  validateRequest,
  asyncHandler(updateSettings)
);

export default router;
