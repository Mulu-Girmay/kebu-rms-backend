export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  ROOM_JOIN: 'room.join',
  ROOM_LEAVE: 'room.leave',

  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_STATUS_CHANGED: 'order.status_changed',

  NOTIFICATION_CREATED: 'notification.created',
} as const;
