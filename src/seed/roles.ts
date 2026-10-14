import { Permission } from '../models/permissions/index.js';

import { Role } from '../models/role/index.js';

import { RESOURCES, ACTIONS } from '../utils/constants.js';

const permissionMap = async (): Promise<Record<string, any>> => {
  const permissions = await Permission.find();

  return Object.fromEntries(
    permissions.map((permission) => [
      `${permission.resource}:${permission.action}`,
      permission._id,
    ])
  );
};

const getPermissions = (
  map: Record<string, any>,
  resource: string,
  actions: string[]
) => actions.map((action) => map[`${resource}:${action}`]);

export const seedRoles = async (): Promise<void> => {
  const permissions = await permissionMap();

  /*
   * Super Admin
   * Full application access.
   */
  await Role.findOneAndUpdate(
    {
      name: 'super_admin',
    },
    {
      $set: {
        description: 'Full system access',
        is_system_role: true,
        permissions: Object.values(permissions),
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  /*
   * Kitchen/Ops Admin
   */
  await Role.findOneAndUpdate(
    {
      name: 'kitchen_admin',
    },
    {
      $set: {
        description: 'Manages cafeteria operations and orders',
        is_system_role: true,
        permissions: [
          ...getPermissions(permissions, RESOURCES.ORDERS, [
            ACTIONS.READ,
            ACTIONS.UPDATE,
          ]),
          ...getPermissions(permissions, RESOURCES.MENU_ITEMS, [
            ACTIONS.READ,
            ACTIONS.UPDATE,
          ]),
          ...getPermissions(permissions, RESOURCES.CATEGORIES, [ACTIONS.READ]),
        ],
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  /*
   * Finance Admin
   */
  await Role.findOneAndUpdate(
    {
      name: 'finance_admin',
    },
    {
      $set: {
        description: 'Manages financial operations',
        is_system_role: true,
        permissions: [
          ...getPermissions(permissions, RESOURCES.USERS, [ACTIONS.READ]),
          ...getPermissions(permissions, RESOURCES.WALLETS, [
            ACTIONS.READ,
            ACTIONS.UPDATE,
          ]),
          ...getPermissions(permissions, RESOURCES.WALLET_TRANSACTIONS, [
            ACTIONS.READ,
          ]),
          ...getPermissions(permissions, RESOURCES.CREDIT_ACCOUNTS, [
            ACTIONS.READ,
            ACTIONS.UPDATE,
          ]),
        ],
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  /*
   * Customer
   */
  await Role.findOneAndUpdate(
    {
      name: 'customer',
    },
    {
      $set: {
        description: 'Employee customer',
        is_system_role: true,
        permissions: [
          ...getPermissions(permissions, RESOURCES.CATEGORIES, [ACTIONS.READ]),
          ...getPermissions(permissions, RESOURCES.MENU_ITEMS, [ACTIONS.READ]),
          ...getPermissions(permissions, RESOURCES.ORDERS, [
            ACTIONS.CREATE,
            ACTIONS.READ,
            ACTIONS.UPDATE,
          ]),
          ...getPermissions(permissions, RESOURCES.CREDIT_ACCOUNTS, [
            ACTIONS.READ,
          ]),
          ...getPermissions(permissions, RESOURCES.WALLETS, [ACTIONS.READ]),
          ...getPermissions(permissions, RESOURCES.WALLET_TRANSACTIONS, [
            ACTIONS.READ,
          ]),
          ...getPermissions(permissions, RESOURCES.RATINGS, [
            ACTIONS.CREATE,
            ACTIONS.READ,
            ACTIONS.UPDATE,
          ]),
          ...getPermissions(permissions, RESOURCES.NOTIFICATIONS, [
            ACTIONS.READ,
            ACTIONS.UPDATE,
          ]),
        ],
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  console.log('System roles seeded successfully');
};
