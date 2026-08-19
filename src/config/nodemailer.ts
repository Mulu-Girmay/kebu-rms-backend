import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from './environments.js';
import logger from './winston.js';

export const transporter: Transporter = nodemailer.createTransport({
  host: config.email.smtp.host,
  port: config.email.smtp.port,
  secure: config.email.smtp.port === 465,
  auth: {
    user: config.email.smtp.auth.user,
    pass: config.email.smtp.auth.pass,
  },
});

export const verifyTransporter = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    logger.info('SMTP transporter connection verified successfully');
    return true;
  } catch (error) {
    logger.warn('SMTP transporter verification failed:', error);
    return false;
  }
};
