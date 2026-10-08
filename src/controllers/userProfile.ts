import fs from 'fs/promises';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../config/auth.js';
import { APIError } from '../errors/APIError.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { User } from '../models/users/index.js';
import type { BetterAuthUser } from '../types/types.js';
import { serializeUser } from '../utils/serializers.js';
import type { Response } from 'express';
import mongoose from 'mongoose';

const populateRole = (query: any) =>
  query.populate('role_id', 'name description is_system_arole');

const updateBetterAuthProfile = async (
  req: AuthenticatedRequest,
  payload: {
    name?: string;
    image?: string | null;
  }
): Promise<BetterAuthUser> => {
  if (!req.user) {
    throw new APIError('Authentication required', 401);
  }

  await auth.api.updateUser({
    headers: fromNodeHeaders(req.headers),
    body: payload,
  });

  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user) {
    throw new APIError('Failed to fetch updated Better Auth user', 500);
  }

  return session.user as BetterAuthUser;
};

/** GET /api/v1/user/me */
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const user = await populateRole(User.findById(req.user!.id));
  if (!user) {
    throw new APIError('User not found', 404);
  }
  res.status(200).json({
    success: true,
    data: serializeUser(user),
  });
};

/** PATCH /api/v1/user/me */
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { fullName } = req.body;
  const file = req.file;

  const payload: { name?: string; image?: string | null } = {};

  if (fullName !== undefined) payload.name = fullName;
  if (file) payload.image = `/uploads/${file.filename}`;

  if (Object.keys(payload).length === 0) {
    if (file) await fs.unlink(file.path).catch(() => {});
    throw new APIError('At least one field must be provided for update', 400);
  }

  try {
    // 1. Update your app-specific fields or validation in Mongo
    const updatedMongoUser = await User.findByIdAndUpdate(
      req.user!.id,
      { $set: payload },
      { new: true, runValidators: true } // No session here
    );

    if (!updatedMongoUser) {
      throw new APIError('User document not found in database', 404);
    }

    // 2. Let Better-Auth handle its own database sync safely
    const updatedAuthUser = await updateBetterAuthProfile(req, payload);

    if (!updatedAuthUser) {
      throw new APIError('Failed to update profile in auth system', 500);
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedAuthUser,
    });
  } catch (error) {
    console.error(error);
    if (file) {
      await fs.unlink(file.path).catch(() => {});
    }
    throw error;
  }
};

/** PATCH /api/v1/user/me/settings */
export const updateSettings = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const {
    orderStatusNotifications,
    promotionalNotifications,
    pushNotificaitons,
  } = req.body;
  const updateData: any = {};
  if (orderStatusNotifications !== undefined) {
    updateData['settings.orderStatusNotifications'] = orderStatusNotifications;
  }
  if (promotionalNotifications !== undefined) {
    updateData['settings.promotionalNotifications'] = promotionalNotifications;
  }
  if (pushNotificaitons !== undefined) {
    updateData['settings.pushNotificaitons'] = pushNotificaitons;
  }
  if (Object.keys(updateData).length === 0) {
    throw new APIError('At least one setting must be provided', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.user!.id,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  if (!user) throw new APIError('User not found', 404);
  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: { settings: user.settings },
  });
};

/**POST /api/v1/user/me/password */
export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { currentPassword, newPassword } = req.body;

  try {
    await auth.api.changePassword({
      headers: fromNodeHeaders(req.headers),
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
    });
    const user = await User.findById(req.user!.id);
    if (!user) throw new APIError('Unable to find the user ', 404);
    user.must_change_password = false;
    user.save();
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    throw new APIError(error.message || 'Failed to change password', 400);
  }
};
