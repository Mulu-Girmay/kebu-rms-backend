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
}
export const WALLET_TRANSACTION_TYPE_VALUES = Object.values(WalletTransactionType);

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
