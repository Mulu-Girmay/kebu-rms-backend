import { Role } from '../models/role/index.js';
import { ac } from './accessControl.js';
import type { Resource, Action } from '../utils/constants.js';

/**
 * Evaluates if a given role has a specific permission.
 * Fetches the role's permissions from MongoDB, converts them to Better Auth statements,
 * and uses ac.authorize() to evaluate the result.
 */
export async function evaluateRolePermission(
  roleName: string,
  resource: Resource,
  action: Action
): Promise<boolean> {
  const roleDoc = await Role.findOne({ name: roleName }).populate<{
    permissions: any[];
  }>('permissions');
  if (!roleDoc) return false;

  const statements: Record<string, string[]> = {};

  for (const perm of roleDoc.permissions) {
    const res = perm.resource;
    const act = perm.action;

    if (!statements[res]) statements[res] = [];
    if (!statements[res].includes(act)) statements[res].push(act);
  }

  const dynamicRole = ac.newRole(statements);

  const result = dynamicRole.authorize({
    [resource]: [action],
  });

  return result.success === true;
}

/**
 * Shorthand for checking multiple permissions at once (AND logic).
 * Useful for complex routes that require multiple permissions.
 */
export async function evaluateRolePermissions(
  roleName: string,
  permissions: { resource: Resource; action: Action }[]
): Promise<boolean> {
  for (const perm of permissions) {
    const has = await evaluateRolePermission(
      roleName,
      perm.resource,
      perm.action
    );
    if (!has) return false;
  }
  return true;
}
