export const MODEL_NAMES = {
  USER: 'users',
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
  FILE: 'File',
  KITCHEN_SERVICE: 'KitchenService',
} as const;

export type ModelName = (typeof MODEL_NAMES)[keyof typeof MODEL_NAMES];

// Enums and their automatically generated value arrays

export enum OrderStatus {
  PLACED = 'placed',
  REJECTED = 'rejected',
  ACCEPTED = 'accepted',
  PREPARING = 'preparing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
export const ORDER_STATUS_VALUES = Object.values(OrderStatus);

export enum WalletTransactionType {
  MIXED = 'mixed',
  CREDIT = 'credit',
  REFUND = 'refund',
  DEBIT = 'debit',
  WALLET = 'wallet',
}

export const WALLET_TRANSACTION_TYPE_VALUES = Object.values(
  WalletTransactionType
);

export enum CreditAccountStatus {
  ACTIVE = 'active',
  FROZEN = 'frozen',
  CLOSED = 'closed',
}
export const CREDIT_ACCOUNT_STATUS_VALUES = Object.values(CreditAccountStatus);

export enum NotificationType {
  ORDER_UPDATE = 'order_update',
  TRANSACTION = 'transaction',
  SYSTEM = 'system',
}
export const NOTIFICATION_TYPE_VALUES = Object.values(NotificationType);

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}
export const USER_STATUS_VALUES = Object.values(UserStatus);

export enum UserTokenType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
}
export const USER_TOKEN_TYPE_VALUES = Object.values(UserTokenType);

export enum AuditAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
}
export const AUDIT_ACTION_VALUES = Object.values(AuditAction);

// Auth Token & Cookie Constants
export const AUTH_COOKIES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

export const TOKEN_EXPIRATION = {
  ACCESS_TOKEN: '1d',
  REFRESH_TOKEN: '7d',
  ACCESS_TOKEN_MAX_AGE_MS: 1 * 24 * 60 * 60 * 1000, // 1 day in ms
  REFRESH_TOKEN_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  ACCESS_TOKEN_SECONDS: 1 * 24 * 60 * 60, // 1 day in seconds
  REFRESH_TOKEN_SECONDS: 7 * 24 * 60 * 60, // 7 days in seconds
} as const;
export const RESOURCES = {
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  CATEGORIES: 'categories',
  MENU_ITEMS: 'menu_items',
  ORDERS: 'orders',
  WALLETS: 'wallets',
  WALLET_TRANSACTIONS: 'wallet_transactions',
  CREDIT_ACCOUNTS: 'credit_accounts',
  RATINGS: 'ratings',
  NOTIFICATIONS: 'notifications',
  AUDITS: 'audits',
} as const;

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];

export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
} as const;
