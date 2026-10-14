import { NotificationType } from '../constants.js';

interface TemplateResult {
  type: NotificationType;
  message: string;
  redirectRoute?: string;
  redirectParams?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export const NotificationTemplates = {
  // for Customers
  orderPlaced: (orderNumber: string, totalAmount: number): TemplateResult => ({
    type: NotificationType.ORDER_UPDATE,
    message: `Order ${orderNumber} placed successfully. Total: ${totalAmount}.`,
    redirectRoute: '/orders',
    redirectParams: { orderNumber },
    meta: { triggerStatus: 'placed' },
  }),
  orderAccepted: (orderNumber: string): TemplateResult => ({
    type: NotificationType.ORDER_UPDATE,
    message: `Your order ${orderNumber} has been accepted and is being prepared.`,
    redirectRoute: '/orders',
    redirectParams: { orderNumber },
    meta: { triggerStatus: 'accepted' },
  }),
  orderReady: (orderNumber: string): TemplateResult => ({
    type: NotificationType.ORDER_UPDATE,
    message: `Your order ${orderNumber} is ready for pickup! 🎉`,
    redirectRoute: '/orders',
    redirectParams: { orderNumber },
    meta: { triggerStatus: 'ready' },
  }),
  creditAccountStatusChange: (newStatus: string): TemplateResult => ({
    type: NotificationType.STATUS_UPDATE,
    message: `Your credit Account has been ${newStatus}.For more information please contact the admin.`,
    meta: { status: newStatus },
  }),
  walletStatusChange: (newStatus: string): TemplateResult => ({
    type: NotificationType.STATUS_UPDATE,
    message: `Your wallet Account has been ${newStatus}`,
    meta: { status: newStatus },
  }),
  orderRejected: (orderNumber: string, reason: string): TemplateResult => ({
    type: NotificationType.ORDER_UPDATE,
    message: `Your order ${orderNumber} was rejected: ${reason}`,
    redirectRoute: '/orders',
    redirectParams: { orderNumber },
    meta: { triggerStatus: 'rejected' },
  }),

  orderCompleted: (orderNumber: string): TemplateResult => ({
    type: NotificationType.ORDER_UPDATE,
    message: `Order ${orderNumber} completed. Enjoy your meal!`,
    redirectRoute: '/orders',
    redirectParams: { orderNumber },
    meta: { triggerStatus: 'completed' },
  }),
  orderCancelled: (orderNumber: string, refunded = true): TemplateResult => ({
    type: NotificationType.ORDER_UPDATE,
    message: refunded
      ? `Order ${orderNumber} has been cancelled and refunded.`
      : `Order ${orderNumber} has been cancelled.`,
    redirectRoute: '/orders',
    redirectParams: { orderNumber },
    meta: { triggerStatus: 'cancelled' },
  }),

  // Wallet / Transactions

  walletTopUp: (
    amount: number,
    walletCredited: number,
    creditRepaid: number
  ): TemplateResult => ({
    type: NotificationType.TRANSACTION,
    message:
      creditRepaid > 0
        ? `Wallet topped up with ${amount}. ${creditRepaid} applied to credit, ${walletCredited} added to wallet.`
        : `Wallet topped up with ${amount}.`,
    redirectRoute: '/wallet',
    meta: { amount, walletCredited, creditRepaid },
  }),

  orderCharged: (
    orderNumber: string,
    total: number,
    walletAmount: number,
    creditAmount: number
  ): TemplateResult => ({
    type: NotificationType.TRANSACTION,
    message: `Order ${orderNumber} charged: ${total} (wallet: ${walletAmount}, credit: ${creditAmount}).`,
    redirectRoute: '/wallet',
    redirectParams: { orderNumber },
    meta: { total, walletAmount, creditAmount },
  }),

  orderRefunded: (
    orderNumber: string,
    walletAmount: number,
    creditAmount: number
  ): TemplateResult => ({
    type: NotificationType.TRANSACTION,
    message: `Order ${orderNumber} refunded. Wallet: +${walletAmount}, Credit restored: ${creditAmount}.`,
    redirectRoute: '/wallet',
    redirectParams: { orderNumber },
    meta: { walletAmount, creditAmount },
  }),

  creditLimitChanged: (oldLimit: number, newLimit: number): TemplateResult => ({
    type: NotificationType.TRANSACTION,
    message: `Your credit limit has been updated from ${oldLimit} to ${newLimit}.`,
    redirectRoute: '/wallet',
    meta: { oldLimit, newLimit },
  }),

  creditUsageUpdate: (
    oldCreditUsage: number,
    creditUsage: number
  ): TemplateResult => ({
    type: NotificationType.TRANSACTION,
    message: `Your credit usage has been updated from ${oldCreditUsage} to ${creditUsage}.`,
    redirectRoute: '/wallet',
    meta: { oldCreditUsage, creditUsage },
  }),

  // Staff-
  newOrderForKitchen: (
    orderNumber: string,
    itemCount: number,
    totalAmount: number
  ): TemplateResult => ({
    type: NotificationType.NEW_ORDER,
    message: `New order ${orderNumber}: ${itemCount} item(s), total ${totalAmount}.`,
    redirectRoute: '/admin/orders',
    redirectParams: { orderNumber },
    meta: { orderNumber, itemCount, totalAmount },
  }),

  emailFailure: (
    recipient: string,
    template: string,
    error: string
  ): TemplateResult => ({
    type: NotificationType.EMAIL_FAILURE,
    message: `Email failed: "${template}" to ${recipient} — ${error}`,
    redirectRoute: '/admin/audit',
    meta: { recipient, template, error },
  }),

  paymentIssue: (orderNumber: string, reason: string): TemplateResult => ({
    type: NotificationType.PAYMENT_ISSUE,
    message: `Payment issue on order ${orderNumber}: ${reason}`,
    redirectRoute: '/admin/orders',
    redirectParams: { orderNumber },
    meta: { orderNumber, reason },
  }),

  itemPromotion: (menu_name: string, description: string): TemplateResult => ({
    type: NotificationType.PROMOTION,
    message: `Something delicious just landed on our menu
      Meet ${menu_name}: ${description}. Order now and let us know what you think!"`,
    redirectRoute: '/menu',
    meta: { description },
  }),
  // System
  // ============================================================

  accountSuspended: (reason: string): TemplateResult => ({
    type: NotificationType.SYSTEM,
    message: `Your account has been suspended: ${reason}`,
    meta: { reason },
  }),

  roleChanged: (fromRole: string | null, toRole: string): TemplateResult => ({
    type: NotificationType.SYSTEM,
    message: `Your role changed from "${fromRole}" to "${toRole}".`,
    redirectRoute: '/profile',
    meta: { fromRole, toRole },
  }),

  welcomeStaff: (roleName: string): TemplateResult => ({
    type: NotificationType.SYSTEM,
    message: `Welcome to Kebu RMS! Your ${roleName} account is active.`,
    redirectRoute: '/admin',
    meta: { roleName },
  }),

  passwordChanged: (): TemplateResult => ({
    type: NotificationType.SYSTEM,
    message: 'Your password was changed successfully.',
    redirectRoute: '/profile',
  }),

  systemBroadcast: (message: string): TemplateResult => ({
    type: NotificationType.SYSTEM,
    message,
    meta: { broadcast: true },
  }),
};
