import type { Response } from 'express';
import { Permission } from '../models/permissions/index.js';
import { Role } from '../models/role/index.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { APIError } from '../errors/APIError.js';
import { User } from '../models/users/index.js';
import { Audit } from '../models/audits/index.js';
import { AuditAction, MODEL_NAMES } from '../utils/constants.js';
import { serializeUser } from '../utils/serializers.js';

const getRouteParam = (param: string | string[] | undefined): string => {
  const value = Array.isArray(param) ? param[0] : param;
  if (!value) {
    throw new APIError('Required route parameter is missing', 400);
  }

  return value;
};

export const createRole = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { name, description } = req.body;
  const normalizedName = name.trim().toLowerCase();

  const existingRole = await Role.findOne({
    name: normalizedName,
  });

  if (existingRole) {
    throw new APIError('A role with this name already exists', 409);
  }

  const role = new Role({
    name: normalizedName,
    description: description ?? null,
    is_system_role: false,
    permissions: [],
  });

  await role.save();

  res.status(201).json({
    success: true,
    data: role,
  });
};

export const listRoles = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const [roles, userCounts] = await Promise.all([
    Role.find().populate('permissions').sort({ name: 1 }),
    User.aggregate<{ _id: string; user_count: number }>([
      { $match: { role_id: { $exists: true, $ne: null } } },
      { $group: { _id: '$role_id', user_count: { $sum: 1 } } },
    ]),
  ]);

  const userCountByRoleId = new Map(
    userCounts.map(({ _id, user_count }) => [String(_id), user_count])
  );

  res.status(200).json({
    success: true,
    data: roles.map((role) => ({
      ...role.toObject(),
      user_count: userCountByRoleId.get(String(role._id)) ?? 0,
    })),
  });
};

export const getRole = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const id = getRouteParam(req.params.id);

  const role = await Role.findById(id).populate('permissions');

  if (!role) {
    throw new APIError('Role not found', 404);
  }

  res.status(200).json({
    success: true,
    data: role,
  });
};

export const updateRole = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const id = getRouteParam(req.params.id);

  const role = await Role.findById(id);

  if (!role) {
    throw new APIError('Role not found', 404);
  }

  if (role.is_system_role) {
    throw new APIError('Cannot update system role', 403);
  }

  const update: {
    name?: string;
    description?: string;
  } = {};

  if (req.body.name !== undefined) {
    update.name = req.body.name.trim().toLowerCase();
  }

  if (req.body.description !== undefined) {
    update.description = req.body.description;
  }

  if (update.name !== undefined) {
    const existingRole = await Role.findOne({
      name: update.name,
      _id: { $ne: id },
    });

    if (existingRole) {
      throw new APIError('A role with this name already exists', 409);
    }
  }

  const updatedRole = await Role.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).populate('permissions');

  if (!updatedRole) {
    throw new APIError('Role not found', 404);
  }

  res.status(200).json({
    success: true,
    data: updatedRole,
  });
};

export const deleteRole = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const id = getRouteParam(req.params.id);

  const role = await Role.findById(id);

  if (!role) {
    throw new APIError('Role not found', 404);
  }

  if (role.is_system_role) {
    throw new APIError('Cannot delete system role', 403);
  }

  const assignedUsersCount = await User.countDocuments({ role_id: id });
  if (assignedUsersCount > 0) {
    throw new APIError(
      `Cannot delete role: ${assignedUsersCount} users currently have this role assigned. Reassign them first.`,
      400
    );
  }

  await Role.deleteOne({
    _id: id,
  });

  res.status(200).json({
    success: true,
    message: 'Role deleted successfully',
  });
};

export const listPermissions = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const permissions = await Permission.find().sort({
    resource: 1,
    action: 1,
  });

  res.status(200).json({
    success: true,
    data: permissions,
  });
};

export const assignPermission = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const id = getRouteParam(req.params.id);
  const permissionId = getRouteParam(req.params.permissionId);

  const role = await Role.findById(id);

  if (!role) {
    throw new APIError('Role not found', 404);
  }

  if (role.is_system_role) {
    throw new APIError('Cannot modify permissions of a system role', 403);
  }

  const permission = await Permission.findById(permissionId);

  if (!permission) {
    throw new APIError('Permission not found', 404);
  }

  role.addPermission(permission._id);
  await role.save();

  const updatedRole = await Role.findById(id).populate('permissions');

  res.status(200).json({
    success: true,
    data: updatedRole,
  });
};

export const revokePermission = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const id = getRouteParam(req.params.id);
  const permissionId = getRouteParam(req.params.permissionId);

  const role = await Role.findById(id);

  if (!role) {
    throw new APIError('Role not found', 404);
  }

  if (role.is_system_role) {
    throw new APIError('Cannot modify permissions of a system role', 403);
  }

  const permission = await Permission.findById(permissionId);

  if (!permission) {
    throw new APIError('Permission not found', 404);
  }

  role.removePermission(permissionId);
  await role.save();

  const updatedRole = await Role.findById(id).populate('permissions');

  res.status(200).json({
    success: true,
    data: updatedRole,
  });
};

export default {
  createRole,
  listRoles,
  getRole,
  updateRole,
  deleteRole,
  listPermissions,
  assignPermission,
  revokePermission,
};
