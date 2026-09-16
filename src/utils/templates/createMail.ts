import React from 'react';
import { render } from '@react-email/render';
import {
  VerificationEmail,
  type VerificationEmailProps,
} from './VerificationEmail.js';
import {
  PasswordResetEmail,
  type PasswordResetEmailProps,
} from './PasswordResetEmail.js';

export type EmailTemplateType = 'verification' | 'password_reset';

export interface EmailTemplateData {
  verification: VerificationEmailProps;
  password_reset: PasswordResetEmailProps;
}

export const createMail = async <T extends EmailTemplateType>(
  template: T,
  data: EmailTemplateData[T]
): Promise<string> => {
  switch (template) {
    case 'verification':
      return render(
        React.createElement(VerificationEmail, data as VerificationEmailProps)
      );
    case 'password_reset':
      return render(
        React.createElement(PasswordResetEmail, data as PasswordResetEmailProps)
      );
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
};
