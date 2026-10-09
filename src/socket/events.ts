export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  ROOM_JOIN: 'room.join',
  ROOM_LEAVE: 'room.leave',
  SESSION_EXPIRED: 'auth.session_expired',

  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_STATUS_CHANGED: 'order.status_changed',
  SERVICE_PAUSE_TOGGLED: 'service.pause_toggled',

  NOTIFICATION_CREATED: 'notification.created',
} as const;
