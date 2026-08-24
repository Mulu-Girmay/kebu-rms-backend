import { EventEmitter } from 'events';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mailTemplate.js';
import logger from './winston.js';

export interface VerifyEmailEventPayload {
  email: string;
  fullName: string;
  token: string;
}

export interface ResetPasswordEventPayload {
  email: string;
  fullName: string;
  token: string;
}

export const appEvents = new EventEmitter();

// Event listener: Trigger email verification
appEvents.on('verifyEmail', async (payload: VerifyEmailEventPayload) => {
  try {
    await sendVerificationEmail(payload.email, payload.fullName, payload.token);
    logger.info(`Verification email event processed for ${payload.email}`);
  } catch (error) {
    logger.error(`Error processing verifyEmail event for ${payload.email}:`, error);
  }
});

// Event listener: Trigger password reset
appEvents.on('resetPassword', async (payload: ResetPasswordEventPayload) => {
  try {
    await sendPasswordResetEmail(payload.email, payload.fullName, payload.token);
    logger.info(`Password reset email event processed for ${payload.email}`);
  } catch (error) {
    logger.error(`Error processing resetPassword event for ${payload.email}:`, error);
  }
});

export default appEvents;
