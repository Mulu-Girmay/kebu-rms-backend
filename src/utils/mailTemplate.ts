import { transporter } from '../config/nodemailer.js';
import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '../config/environments.js';
import logger from '../config/winston.js';
import {
  createMail,
  type EmailTemplateType,
  type EmailTemplateData,
} from './templates/createMail.js';

export interface SendEmailOptions<T extends EmailTemplateType> {
  to: string;
  subject: string;
  template: T;
  data: EmailTemplateData[T];
}

export const sendEmail = async <T extends EmailTemplateType>({
  to,
  subject,
  template,
  data,
}: SendEmailOptions<T>): Promise<void> => {
  try {
    const html = await createMail(template, data);

    const info = await transporter.sendMail({
      from: `"Kebu RMS" <${config.email.user}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email sent to ${to}: ${info.messageId}`);
  } catch (error: any) {
    const errorString = error?.message || '';

    if (
      errorString.includes('invalid_grant') ||
      errorString.includes('Invalid Credentials')
    ) {
      logger.warn(
        'OAuth2 token expired or invalid during sendMail. Hot-swapping to App Password fallback...'
      );

      const baseSmtpConfig = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        tls: { rejectUnauthorized: false },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
      };

      // Force change the global transporter
      const newTransporter: Transporter = nodemailer.createTransport({
        ...baseSmtpConfig,
        auth: {
          user: config.email.user,
          pass: config.email.pass, // Your 16-character Google App Password
        },
      });

      logger.info('Transporter hot-swapped. Retrying email delivery...');
      const html = await createMail(template, data);
      return await newTransporter.sendMail({
        from: `"Kebu RMS" <${config.email.user}>`,
        to,
        subject,
        html,
      });
    }

    // If it's a completely different error (e.g. network issue), throw it normally
    logger.error('Failed to send email:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (
  email: string,
  fullName: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${config.clientUrl}/verify-email?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Verify your Kebu RMS account',
    template: 'verification',
    data: {
      fullName,
      verificationUrl,
    },
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  fullName: string,
  token: string
): Promise<void> => {
  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Reset your Kebu RMS password',
    template: 'password_reset',
    data: {
      fullName,
      resetUrl,
    },
  });
};

export const sendStatusEmail = async (
  userEmail: string,
  fullName: string,
  newStatus: string,
  reason = ''
): Promise<void> => {
  const subject =
    newStatus === 'suspended'
      ? 'Important: Your account has been suspended'
      : `Your account status has been updated to: ${newStatus}`;

  try {
    await sendEmail({
      to: userEmail,
      subject,
      template: 'status_change',
      data: {
        fullName,
        newStatus,
        reason,
        isSuspended: newStatus === 'suspended',
      },
    });
  } catch (error) {
    logger.info(`Failed to send email ${userEmail}: ${error}`);
  }
};

export const sendWelcomeStaffEmail = async (
  email: string,
  fullName: string,
  temporaryPassword: string,
  roleName: string
): Promise<void> => {
  const loginUrl = `${config.clientUrl}/login`;
  await sendEmail({
    to: email,
    subject: 'Your Kebu RMS staff account',
    template: 'welcome_staff',
    data: {
      fullName,
      email,
      temporaryPassword,
      roleName,
      loginUrl,
    },
  });
};
