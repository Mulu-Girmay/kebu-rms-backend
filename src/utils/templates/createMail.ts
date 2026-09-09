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
import {
  StatusChangeEmail,
  type StatusChangeEmailProps,
} from './StatusChangeEmail.js';

export type EmailTemplateType =
  'verification' | 'password_reset' | 'status_change';

export interface EmailTemplateData {
  verification: VerificationEmailProps;
  password_reset: PasswordResetEmailProps;
  status_change: StatusChangeEmailProps;
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
    case 'status_change':
      return render(
        React.createElement(StatusChangeEmail, data as StatusChangeEmailProps)
      );
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
};
