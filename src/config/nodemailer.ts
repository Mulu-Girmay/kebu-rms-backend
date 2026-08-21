import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from './environments.js';
import logger from './winston.js';

const createTransporter = (): Transporter => {
  // Use Gmail OAuth2 if OAuth2 credentials are configured
  if (config.email.oauth.clientId && config.email.oauth.refreshToken) {
    logger.info('Initializing Nodemailer with Gmail OAuth2 transport');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: config.email.user,
        clientId: config.email.oauth.clientId,
        clientSecret: config.email.oauth.clientSecret,
        refreshToken: config.email.oauth.refreshToken,
      },
    });
  }

  // Fallback to standard SMTP transport (e.g. Mailtrap / custom SMTP)
  logger.info('Initializing Nodemailer with standard SMTP transport');
  return nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.port === 465,
    auth: {
      user: config.email.smtp.auth.user,
      pass: config.email.smtp.auth.pass,
    },
  });
};

export const transporter: Transporter = createTransporter();

export const verifyTransporter = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    logger.info('Email transporter connection verified successfully');
    return true;
  } catch (error) {
    logger.warn('Email transporter verification failed:', error);
    return false;
  }
};
