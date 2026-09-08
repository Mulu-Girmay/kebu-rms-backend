import type { Response } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { User } from '../models/users/index.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { APIError } from '../errors/APIError.js';
import { serializeUser } from '../utils/serializers.js';
import { Role } from '../models/role/index.js';
import { auth } from '../config/auth.js';
import { Audit } from '../models/audits/index.js';
import { AuditAction } from '../utils/constants.js';
import { Order } from '../models/orders/index.js';
import { Wallet } from '../models/wallet/index.js';
import { WalletTransaction } from '../models/walletTransaction/index.js';
import { CreditAccount } from '../models/creditAccount/index.js';
import { Permission } from '../models/permissions/index.js';
import type { BetterAuthUser } from '../types/types.js';
import { sendStatusEmail } from '../utils/mailTemplate.js';

const populateRole = (query: any) =>
  query.populate('role_id', 'name description is_system_role');

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

/** GET /api/v1/users/me */
export const getMyProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
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

/** PATCH /api/v1/users/me */
export const updateMyProfile = async (
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

  const updatedAuthUser = await updateBetterAuthProfile(req, betterAuthPayload);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedAuthUser,
  });
};

/** GET /api/v1/users */
export const listUsers = async (req: AuthenticatedRequest, res: Response) => {
  const {
    page = 1,
    limit = 10,
    status,
    role_id,
    search,
    sortBy = 'created_at',
    order = 'desc',
  } = req.query as {
    page?: number;
    limit?: number;
    status?: string;
    role_id?: string;
    search?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  };

  const filter: Record<string, any> = {};

  if (status) filter.status = status;

  if (role_id) filter.role_id = role_id;

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: 'i',
        },
      },
      {
        email: {
          $regex: search,
          $options: 'i',
        },
      },
    ];
  }

  const skip = (page - 1) * limit;
  const sortDirection = order === 'asc' ? 1 : -1;
  const sort: Record<string, 1 | -1> = { [sortBy]: sortDirection };

  const [users, total] = await Promise.all([
    populateRole(
      User.find(filter).select('-password').sort(sort).skip(skip).limit(limit)
    ),
    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: users.map(serializeUser),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
};

/** GET /api/v1/users/:id */
export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  const user = await populateRole(User.findById(req.params.id));

  if (!user) {
    throw new APIError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: serializeUser(user),
  });
};

/** PATCH /api/v1/users/:id */
export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  const { status, role_id } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new APIError('user not found', 404);
  }
  if (String(user._id) === req.user!.id) {
    if (
      role_id !== undefined &&
      role_id.toString() !== user.role_id?.toString()
    ) {
      throw new APIError(
        'Alert: You cannot modify your own administrative role. Have another admin change it.',
        403
      );
    }
    if (status !== undefined && status !== user.status) {
      throw new APIError(
        'Alert: You cannot deactivate or suspend your own account.',
        403
      );
    }
  }
  const updateData: Record<string, any> = {};
  if (req.body.role_id) {
    const role = await Role.findById(req.body.role_id);
    if (!role) throw new APIError('Role not found', 404);
  }

  if (status !== undefined) {
    updateData.status = status;
  }

  if (role_id !== undefined) {
    updateData.role_id = role_id;
  }
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('role_id');
  if (!updatedUser) {
    throw new APIError('Failed to execute database profile update', 500);
  }
  await Audit.create({
    userId: req.user!.id,
    action: AuditAction.UPDATE,
    tableName: 'User',
    recordId: user._id,
    meta: {
      fields: Object.keys(req.body),
    },
  });

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: serializeUser(updatedUser),
  });
  if (updatedUser.status) {
    sendStatusEmail(user.email, user.name, user.status);
  }
};

/** DELETE /api/v1/users/:id */
export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const targetId: any = req.params!.id;
  if (targetId === req.user!.id) {
    throw new APIError('You cannot delete your own account', 400);
  }

  const user = await User.findById(targetId);
  if (!user) {
    throw new APIError('User not found', 404);
  }

  const [orderCount, wallet] = await Promise.all([
    Order.countDocuments({ userId: targetId }),
    Wallet.findByUser(targetId),
  ]);
  let transactionCount = 0;
  if (wallet) {
    transactionCount = await WalletTransaction.countDocuments({
      wallet: (wallet as any)._id,
    });
  }
  if (orderCount > 0 || transactionCount > 0) {
    throw new APIError(
      'User cannot be permanently deleted because historical orders or financial transactions exist. Deactivate the account instead.',
      409
    );
  }
  await Promise.all([
    CreditAccount.deleteOne({ user: targetId }),
    Wallet.deleteOne({ user: targetId }),
    User.deleteOne({ _id: targetId }),
  ]);

  await Audit.create({
    userId: req.user!.id,
    action: AuditAction.DELETE,
    tableName: 'User',
    recordId: targetId,
    meta: {
      reason: 'administrative deletion',
    },
  });

  res.status(204).send();
};

/**PATCH /api/v1/users/:id/activate */
export const activateUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new APIError('User not found', 404);
  }
  if (String(user._id) === req.user!.id) {
    throw new APIError('You cannot activate your own account');
  }
  await user.activate();
  await Audit.create({
    userId: req.user!.id,
    action: AuditAction.UPDATE,
    tableName: 'User',
    recordId: user._id,
    meta: {
      action: 'activate',
    },
  });

  res.status(200).json({
    success: true,
    message: 'User activated successfully',
  });
  sendStatusEmail(user.email, user.name, user.status);
};

/**PATCH /api/v1/users/:id/deactivate */
export const deactivateUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new APIError('User not found', 404);
  }
  if (String(user._id) === req.user!.id) {
    throw new APIError('You cannot Deactivate your own account');
  }
  await user.deactivate();
  await Audit.create({
    userId: req.user!.id,
    action: AuditAction.UPDATE,
    tableName: 'User',
    recordId: user._id,
    meta: {
      action: 'deactivate',
    },
  });

  res.status(200).json({
    success: true,
    message: 'User deactivated successfully',
  });
  sendStatusEmail(user.email, user.name, user.status);
};

/**PATCH /api/v1/users/:id/suspend */
export const suspendUser = async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new APIError('User not found', 404);
  }
  if (String(user._id) === req.user!.id) {
    throw new APIError('You cannot suspend your own account');
  }
  await user.suspend();
  await Audit.create({
    userId: req.user!.id,
    action: AuditAction.UPDATE,
    tableName: 'User',
    recordId: user._id,
    meta: {
      action: 'suspend',
    },
  });

  res.status(200).json({
    success: true,
    message: 'User suspended successfully',
  });
  sendStatusEmail(user.email, user.name, user.status);
};

/**PATCH /api/v1/users/:id/role */
export const updateRole = async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new APIError('User not found', 404);
  }
  if (String(user._id) === req.user!.id) {
    throw new APIError('You cannot change your own role');
  }
  const role = await Role.findById(req.body.role_id);
  if (!role) {
    throw new APIError('Role not found', 404);
  }
  const oldRole = user.role_id;
  user.role_id = role._id;
  await user.save();

  await Audit.create({
    userId: req.user!.id,
    action: AuditAction.UPDATE,
    tableName: 'User',
    recordId: user._id,
    meta: {
      action: 'role_change',
      from: oldRole?.toString(),
      to: role._id.toString(),
    },
  });

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
  });
};
