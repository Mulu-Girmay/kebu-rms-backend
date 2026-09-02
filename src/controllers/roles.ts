import type { Response } from 'express';
import { Types } from 'mongoose';

import { Permission } from '../models/permissions/index.js';
import { Role } from '../models/role/index.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';

const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

const getRouteParam = (
  param: string | string[] | undefined
): string | undefined => {
  return Array.isArray(param) ? param[0] : param;
};

export const createRole = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { name, description } = req.body;

  if (!name || typeof name !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Role name is required',
    });
    return;
  }

  const existingRole = await Role.findOne({
    name: name.trim().toLowerCase(),
  });

  if (existingRole) {
    res.status(409).json({
      success: false,
      message: 'A role with this name already exists',
    });
    return;
  }

  const rolePayload: {
    name: string;
    description: string | null;
    is_system_role: false;
    permissions: Types.ObjectId[];
  } = {
    name,
    description: description ?? null,
    is_system_role: false,
    permissions: [],
  };

  const role = new Role(rolePayload);
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
  const roles = await Role.find().populate('permissions').sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: roles,
  });
};

export const getRole = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const id = getRouteParam(req.params.id);

  if (!id || !isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      message: 'Invalid role id',
    });
    return;
  }

  const role = await Role.findById(id).populate('permissions');

  if (!role) {
    res.status(404).json({
      success: false,
      message: 'Role not found',
    });
    return;
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

  if (!id || !isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      message: 'Invalid role id',
    });
    return;
  }

  const role = await Role.findById(id);

  if (!role) {
    res.status(404).json({
      success: false,
      message: 'Role not found',
    });
    return;
  }

  if (role.is_system_role) {
    res.status(403).json({
      success: false,
      message: 'Cannot update system role',
    });
    return;
  }

  const update: {
    name?: string;
    description?: string;
  } = {};

  if (req.body.name !== undefined) {
    if (typeof req.body.name !== 'string' || !req.body.name.trim()) {
      res.status(400).json({
        success: false,
        message: 'Role name must be a non-empty string',
      });
      return;
    }

    update.name = req.body.name;
  }

  if (req.body.description !== undefined) {
    if (
      req.body.description !== null &&
      typeof req.body.description !== 'string'
    ) {
      res.status(400).json({
        success: false,
        message: 'Description must be a string or null',
      });
      return;
    }

    update.description = req.body.description;
  }

  if (update.name) {
    const existingRole = await Role.findOne({
      name: update.name.trim().toLowerCase(),
      _id: { $ne: id },
    });

    if (existingRole) {
      res.status(409).json({
        success: false,
        message: 'A role with this name already exists',
      });
      return;
    }
  }

  const updatedRole = await Role.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).populate('permissions');

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

  if (!id || !isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      message: 'Invalid role id',
    });
    return;
  }

  const role = await Role.findById(id);

  if (!role) {
    res.status(404).json({
      success: false,
      message: 'Role not found',
    });
    return;
  }

  if (role.is_system_role) {
    res.status(403).json({
      success: false,
      message: 'Cannot delete system role',
    });
    return;
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

  if (!id || !isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      message: 'Invalid role id',
    });
    return;
  }

  if (!permissionId || !isValidObjectId(permissionId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid permission id',
    });
    return;
  }

  const role = await Role.findById(id);

  if (!role) {
    res.status(404).json({
      success: false,
      message: 'Role not found',
    });
    return;
  }

  if (role.is_system_role) {
    res.status(403).json({
      success: false,
      message: 'Cannot modify permissions of a system role',
    });
    return;
  }

  const permission = await Permission.findById(permissionId);

  if (!permission) {
    res.status(404).json({
      success: false,
      message: 'Permission not found',
    });
    return;
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

  if (!id || !isValidObjectId(id)) {
    res.status(400).json({
      success: false,
      message: 'Invalid role id',
    });
    return;
  }

  if (!permissionId || !isValidObjectId(permissionId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid permission id',
    });
    return;
  }

  const role = await Role.findById(id);

  if (!role) {
    res.status(404).json({
      success: false,
      message: 'Role not found',
    });
    return;
  }

  if (role.is_system_role) {
    res.status(403).json({
      success: false,
      message: 'Cannot modify permissions of a system role',
    });
    return;
  }

  const permission = await Permission.findById(permissionId);

  if (!permission) {
    res.status(404).json({
      success: false,
      message: 'Permission not found',
    });
    return;
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
