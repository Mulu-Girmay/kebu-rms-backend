export const MODEL_NAMES = {
  USER: 'User',
  ROLE: 'Role',
  PERMISSION: 'Permission',
  USER_TOKEN: 'UserToken',
  CATEGORY: 'Category',
  MENU_ITEM: 'MenuItem',
  ORDER: 'Order',
  FAVORITE: 'Favorite',
  RATING: 'Rating',
  NOTIFICATION: 'Notification',
  AUDIT: 'Audit',
  WALLET: 'Wallet',
  WALLET_TRANSACTION: 'WalletTransaction',
  CREDIT_ACCOUNT: 'CreditAccount',
} as const;

export type ModelName = (typeof MODEL_NAMES)[keyof typeof MODEL_NAMES];
