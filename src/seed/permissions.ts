import { Permission } from '../models/permissions/index.js';
import { RESOURCES, ACTIONS } from '../utils/constants.js';

const permissionDefinitions = [
  RESOURCES.USERS,
  RESOURCES.ROLES,
  RESOURCES.PERMISSIONS,
  RESOURCES.CATEGORIES,
  RESOURCES.MENU_ITEMS,
  RESOURCES.ORDERS,
  RESOURCES.WALLETS,
  RESOURCES.WALLET_TRANSACTIONS,
  RESOURCES.CREDIT_ACCOUNTS,
  RESOURCES.RATINGS,
  RESOURCES.NOTIFICATIONS,
  RESOURCES.AUDITS,
].flatMap((resource) =>
  [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE].map(
    (action) => ({
      name: `${resource}_${action}`,
      resource,
      action,
    })
  )
);

export const seedPermissions = async (): Promise<void> => {
  for (const permission of permissionDefinitions) {
    await Permission.updateOne(
      {
        resource: permission.resource,
        action: permission.action,
      },
      {
        $setOnInsert: permission,
      },
      {
        upsert: true,
      }
    );
  }

  console.log('Permissions seeded successfully');
};
