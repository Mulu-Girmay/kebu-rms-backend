// src/middlewares/rbac.ts
import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { APIError } from '../errors/APIError.js';
import { User } from '../models/users/index.js';
import type { Resource, Action } from '../utils/constants.js';
import { evaluateRolePermission } from '../config/authorization.js';

/**
 * Middleware factory that checks if the authenticated user has a specific permission.
 * Requires `requireAuth` to be called first (so req.user exists).
 */
export const requirePermission = (resource: Resource, action: Action) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      // 1. Ensure user is authenticated (req.user is set by requireAuth)
      if (!req.user) {
        throw new APIError('Unauthorized: Authentication required', 401);
      }

      // 2. Fetch the full user from MongoDB to get the populated role
      //    req.user from BetterAuth only has basic fields (id, email, name, etc.)

      const user = await User.findOne({ _id: req.user.id }).populate<{
        role_id: any;
      }>('role_id');

      if (!user) {
        throw new APIError('User not found', 404);
      }

      // 3. Extract the role name
      const role = user.role_id;
      if (!role) {
        throw new APIError('User has no role assigned', 403);
      }
      const roleName = role.name;

      // 4. Evaluate the permission
      const hasPermission = await evaluateRolePermission(
        roleName,
        resource,
        action
      );

      if (!hasPermission) {
        throw new APIError(
          `Forbidden: Missing ${resource}:${action} permission`,
          403
        );
      }

      // 5. Permission granted, proceed
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Convenience middleware for checking multiple permissions (AND logic).
 * Example: requirePermissions([{ resource: 'orders', action: 'read' }, { resource: 'users', action: 'read' }])
 */
export const requirePermissions = (
  permissions: { resource: Resource; action: Action }[]
) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new APIError('Unauthorized: Authentication required', 401);
      }

      const user = await User.findById(req.user.id).populate<{ role_id: any }>(
        'role_id'
      );
      if (!user) throw new APIError('User not found', 404);
      const role = user.role_id;
      if (!role) throw new APIError('User has no role assigned', 403);
      const roleName = role.name;

      for (const perm of permissions) {
        const has = await evaluateRolePermission(
          roleName,
          perm.resource,
          perm.action
        );
        if (!has) {
          throw new APIError(
            `Forbidden: Missing ${perm.resource}:${perm.action} permission`,
            403
          );
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
