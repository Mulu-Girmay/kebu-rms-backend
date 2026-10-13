import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from './environments.js';
import logger from './winston.js';

const baseSmtpConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  tls: { rejectUnauthorized: false },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
};

// 1. Initialize immediately so it is NEVER undefined
export let transporter: Transporter = nodemailer.createTransport({
  ...baseSmtpConfig,
  auth: {
    type: 'OAuth2',
    user: config.email.user,
    clientId: config.email.oauth.clientId,
    clientSecret: config.email.oauth.clientSecret,
    refreshToken: config.email.oauth.refreshToken,
  },
});

export const verifyTransporter = async (): Promise<boolean> => {
  try {
    logger.info('Verifying Gmail OAuth2 transporter...');
    await transporter.verify();
    logger.info('Gmail OAuth2 transporter verified successfully');
    return true;
  } catch (oauthError) {
    logger.warn(
      'Gmail OAuth2 verification failed. Falling back to App Password...'
    );

    try {
      // 2. Overwrite the transporter instance with the password config
      transporter = nodemailer.createTransport({
        ...baseSmtpConfig,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });

      await transporter.verify();
      logger.info(
        'Gmail App Password transporter verified successfully as fallback'
      );
      return true;
    } catch (fallbackError) {
      logger.error(
        'Critical: Both email authentication methods failed:',
        fallbackError
      );
      return false;
    }
  }
};
