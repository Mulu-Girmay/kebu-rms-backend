import type { Response } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { User } from '../models/users/index.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { APIError } from '../errors/APIError.js';
import { serializeUser } from '../utils/serializers.js';
import { Role } from '../models/role/index.js';
import { auth } from '../config/auth.js';
import { Audit } from '../models/audits/index.js';
import {
  AuditAction,
  CreditAccountStatus,
  MODEL_NAMES,
} from '../utils/constants.js';
import { Order } from '../models/orders/index.js';
import { Wallet } from '../models/wallet/index.js';
import { WalletTransaction } from '../models/walletTransaction/index.js';
import { CreditAccount } from '../models/creditAccount/index.js';
import { Permission } from '../models/permissions/index.js';
import type { BetterAuthUser } from '../types/types.js';
import {
  sendStatusEmail,
  sendWelcomeStaffEmail,
} from '../utils/mailTemplate.js';
import mongoose, { mongo } from 'mongoose';
import logger from '../config/winston.js';
import { Types } from 'mongoose';
import { NotificationService } from '../services/notification.js';
import { NotificationTemplates } from '../utils/templates/notification.templates.js';

const populateRole = (query: any) =>
  query.populate('role_id', 'name description is_system_role');

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
        name: { $regex: search, $options: 'i' },
      },
      { email: { $regex: search, $options: 'i' } },
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

/** POST /api/v1/users/create */
export const createStaffaccount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { name, email, password, role_id } = req.body as {
    name: string;
    email: string;
    password: string;
    role_id: string;
  };

  const role = await Role.findById(role_id);
  if (!role) throw new APIError('Role not found', 404);

  if (role.name.toLowerCase() === 'customer') {
    throw new APIError(
      'Admins cannot create accounts with Customer role. Customers must register through the standard onboarding flow.',
      400
    );
  }

  if (req.user!.role?.name !== 'super_admin') {
    throw new APIError('Only super admins can create other super admins', 403);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new APIError('Email already registered', 409);
  }

  const ctx = await auth.$context;

  const userId = `user_${new Types.ObjectId().toString()}`;
  const hashedPassword = await ctx.password.hash(password);

  let createdUserId: string | null = null;
  try {
    const user = await ctx.internalAdapter.createUser(
      {
        id: userId,
        _id: userId,
        name,
        email: email.toLowerCase(),
        emailVerified: true,
        role_id: role._id.toString(),
        status: 'active',
        must_change_password: true,
        settings: {
          orderStatusNotifications: 'all',
          promotionalNotifications: false,
          pushNotificaitons: false,
        },
      },
      { method: 'signup' }
    );
    createdUserId = user.id;

    await ctx.internalAdapter.createAccount({
      userId: user.id,
      accountId: user.id,
      issuer: 'local:credential',
      providerId: 'credential',
      password: hashedPassword,
    });

    await Audit.create({
      userId: req.user!.id,
      action: AuditAction.CREATE,
      tableName: 'User',
      recordId: user.id,
      meta: {
        name,
        email,
        role: role.name,
        createdBy: 'admin',
      },
    });

    try {
      await sendWelcomeStaffEmail(email, name, password, role.name);
    } catch (error) {
      try {
        const template = 'The email is not sent to the newly created user ';
        const to = name;
        await NotificationService.notifyUser({
          userId: req.user!.id,
          ...NotificationTemplates.emailFailure(
            to,
            template,
            error instanceof Error ? error.message : 'unknown error'
          ),
        });
      } catch (notifyErr) {
        logger.error('Failed to notify staff about email failure', notifyErr);
      }
      logger.error('Failed to send welcome staff email', error);
    }

    try {
      await NotificationService.notifyUser({
        userId: user.id,
        ...NotificationTemplates.welcomeStaff(role.name),
      });
    } catch (error) {
      logger.error('Failed to send staff welcome notification', error);
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully. Credentials sent via email.',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: {
          id: role._id,
          name: role.name,
        },
        status: user.status,
        emailVerified: true,
        mustChangePassword: true,
      },
    });
  } catch (error) {
    if (createdUserId) {
      try {
        await ctx.internalAdapter.deleteUser(createdUserId);
        await Wallet.deleteOne({ user: createdUserId });
        await CreditAccount.deleteOne({ user: createdUserId });
        logger.warn(`Rolled back user creation for ${createdUserId}`);
      } catch (cleanupError) {
        logger.error(
          `Failed to clean up after user creation failure for ${createdUserId}`,
          cleanupError
        );
      }
    }

    throw new APIError(
      error instanceof Error ? error.message : 'Failed to create user',
      500
    );
  }
};
/**
 * DELETE /api/v1/users/:id
 * @deprecated Hard deletes are phased out. Accounts should be deactivated instead.
 */
export const deleteUser = async (
  _req: AuthenticatedRequest,
  _res: Response
) => {
  throw new APIError(
    'User deletion endpoint is deprecated and deactivated. Hard deletes are no longer supported. Please deactivate the user account instead.',
    400
  );
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
  const session = await mongoose.startSession();

  const updatedUser = await user.activate();
  await Audit.create({
    userId: req.user!.id,
    action: AuditAction.UPDATE,
    tableName: 'User',
    recordId: user._id,
    meta: {
      action: 'activate',
    },
  });

  try {
    await sendStatusEmail(user.email, user.name, user.status);
  } catch (err) {
    logger.error(`Failed to send status email to ${user.email}:`, err);
  }

  res.status(200).json({
    success: true,
    message: 'User activated successfully',
  });
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
  const updatedUser = await user.deactivate();
  await Audit.create({
    userId: req.user!.id,
    action: AuditAction.UPDATE,
    tableName: 'User',
    recordId: user._id,
    meta: {
      action: 'deactivate',
    },
  });
  try {
    await sendStatusEmail(user.email, user.name, user.status);
  } catch (err) {
    logger.error(`Failed to send status email to ${user.email}:`, err);
  }
  res.status(200).json({
    success: true,
    message: 'User deactivated successfully',
  });
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
  const updatedUser = await user.suspend();
  await Audit.create({
    userId: req.user!.id,
    action: AuditAction.UPDATE,
    tableName: 'User',
    recordId: user._id,
    meta: {
      action: 'suspend',
    },
  });
  try {
    await sendStatusEmail(user.email, user.name, user.status);
  } catch (err) {
    logger.error(`Failed to send status email to ${user.email}:`, err);
  }
  try {
    await NotificationService.notifyUser({
      userId: user._id.toString(),
      ...NotificationTemplates.accountSuspended(
        req.body.reason?.toString().trim() ||
          'Please contact support for details.'
      ),
    });
  } catch (error) {
    logger.error(`Failed to notify suspended user ${user._id}:`, error);
  }
  res.status(200).json({
    success: true,
    message: 'User suspended successfully',
  });
};

/**PATCH /api/v1/users/:id/role */
export const changeUserRole = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const targetUserId: any = req.params.id!;
  const { role_id } = req.body as { role_id: string };
  if (targetUserId === req.user!.id) {
    throw new APIError('You cannot change your own role', 400);
  }

  const user = await User.findById(targetUserId);
  if (!user) throw new APIError('User not found', 404);

  const newRole = await Role.findById(role_id);
  if (!newRole) throw new APIError('ROle not found', 404);

  if (user.role_id?.toString() == role_id.toString())
    throw new APIError('User already has this role', 400);
  const oldRole = user.role_id ? await Role.findById(user.role_id) : null;
  if (oldRole?.name === 'customer')
    throw new APIError(
      `Cannot change customere role to admin (user is ${oldRole.name})`
    );

  const isDemotingSuperAdmin =
    oldRole?.name === 'super_admin' && newRole.name !== 'super_admin';

  if (isDemotingSuperAdmin) {
    const remaining = await User.countDocuments({
      role_id: oldRole!._id,
      _id: { $ne: user._id },
    });

    if (remaining === 0) {
      throw new APIError('Cannot demote the last super admin', 403);
    }
  }

  const oldRoleId = user.role_id;
  user.role_id = newRole._id;
  await user.save();
  await Audit.create({
    userId: req.user!.id,
    action: AuditAction.UPDATE,
    tableName: MODEL_NAMES.USER,
    recordId: user._id.toString(),
    meta: {
      action: 'role_change',
      from: { id: oldRoleId?.toString(), name: oldRole?.name },
      to: { id: newRole._id.toString(), name: newRole.name },
    },
  });
  const updatedUser = await User.findById(targetUserId).populate(
    'role_id',
    'name description category is_system_role'
  );

  if (!updatedUser) {
    throw new APIError('Failed to fetch updated user', 500);
  }
  try {
    const role = oldRole?.name ? oldRole?.name : 'Unspecefied';
    await NotificationService.notifyUser({
      userId: targetUserId,
      ...NotificationTemplates.roleChanged(role, newRole.name),
    });
  } catch (error) {
    logger.error('Failed to notify staff about email failure', error);
  }

  res.status(200).json({
    success: true,
    message: `User role changed from '${oldRole?.name ?? 'unknown'}' to '${newRole.name}' successfully`,
    data: serializeUser(updatedUser),
  });
};
