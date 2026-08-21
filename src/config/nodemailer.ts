import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from './environments.js';
import logger from './winston.js';

export const transporter: Transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: 'OAuth2',
    user: config.email.user,
    clientId: config.email.oauth.clientId,
    clientSecret: config.email.oauth.clientSecret,
    refreshToken: config.email.oauth.refreshToken,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

export const verifyTransporter = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    logger.info('Gmail OAuth2 transporter verified successfully');
    return true;
  } catch (error) {
    logger.warn('Gmail OAuth2 transporter verification failed:', error);
    return false;
  }
};
