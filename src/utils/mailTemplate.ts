import { transporter } from '../config/nodemailer.js';
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
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
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
