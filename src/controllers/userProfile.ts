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
  if (!req.user) {
    throw new APIError('Authentication required', 401);
  }
  const user = await populateRole(User.findById(req.user.id));
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

  const betterAuthPayload: { name?: string; image?: string | null } = {};

  if (fullName !== undefined) {
    betterAuthPayload.name = fullName;
  }
  if (file) {
    const imageUrl = `/uploads/${file.filename}`;
    betterAuthPayload.image = imageUrl;
  }

  if (Object.keys(betterAuthPayload).length === 0) {
    throw new APIError('At least one field must be provided for update', 400);
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const updatedMongoUser = await User.findByIdAndUpdate(
      req.user!.id,
      { $set: betterAuthPayload },
      { new: true, runValidators: true, session } // critical: bind query to this session
    );

    if (!updatedMongoUser) {
      throw new APIError('User document not found in database', 404);
    }
    const updatedAuthUser = await updateBetterAuthProfile(
      req,
      betterAuthPayload
    );

    await session.commitTransaction();
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedAuthUser,
    });
  } catch (error) {
    await session.abortTransaction();

    throw error;
  } finally {
    await session.endSession();
  }
};

/** PATCH /api/v1/user/me/settings */
export const updateSettings = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { orderStatusNotifications, promotionalNotifications } = req.body;
  const updateData: any = {};
  if (orderStatusNotifications !== undefined) {
    updateData['settings.orderStatusNotifications'] = orderStatusNotifications;
  }
  if (promotionalNotifications !== undefined) {
    updateData['settings.promotionalNotifications'] = promotionalNotifications;
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
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    throw new APIError(error.message || 'Failed to change password', 400);
  }
};
