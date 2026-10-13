import type { Action, NotificationType, Resource } from '../utils/constants.js';

export interface NotifyUserParams {
  userId: string;
  type: NotificationType;
  message: string;
  redirectRoute?: string;
  redirectParams?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export interface NotifyPermissionParams {
  resource: Resource;
  action: Action;
  type: NotificationType;
  message: string;
  redirectRoute?: string;
  redirectParams?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export interface NotifyRoleParams {
  roleName: string;
  type: NotificationType;
  message: string;
  redirectRoute?: string;
  redirectParams?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}
