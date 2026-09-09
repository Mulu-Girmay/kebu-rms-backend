import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Hr,
} from '@react-email/components';

export interface StatusChangeEmailProps {
  fullName: string;
  newStatus: string;
  reason?: string;
  isSuspended: boolean;
}

export const StatusChangeEmail: React.FC<StatusChangeEmailProps> = ({
  fullName,
  newStatus,
  reason = '',
  isSuspended,
}) => {
  return (
    <Html>
      <Head />
      <Preview>
        {isSuspended
          ? 'Your Account Has Been Suspended'
          : `Your Account Status Updated to: ${newStatus}`}
      </Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Heading style={isSuspended ? headingStyleWarning : headingStyle}>
              {isSuspended ? '⚠️ Account Suspended' : '📋 Account Status Update'}
            </Heading>
          </Section>
          <Section style={contentStyle}>
            <Text style={textStyle}>Hello {fullName},</Text>
            <Text style={textStyle}>
              We are writing to inform you that your account status has been
              changed to <strong>{newStatus}</strong>.
            </Text>
            {reason && (
              <Section style={reasonBoxStyle}>
                <Text style={reasonLabelStyle}>
                  <strong>Reason:</strong>
                </Text>
                <Text style={reasonTextStyle}>{reason}</Text>
              </Section>
            )}
            <Text style={textStyle}>
              {isSuspended
                ? 'If you believe this was a mistake, please reply to this email to appeal.'
                : 'Thank you for using our platform.'}
            </Text>
            <Hr style={hrStyle} />
            <Text style={footerStyle}>
              Best regards,
              <br />
              <strong>Kebu RMS Team</strong>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const mainStyle: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: '40px 0',
};

const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '32px 40px',
  borderRadius: '8px',
  maxWidth: '560px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
};

const headerStyle: React.CSSProperties = {
  marginBottom: '24px',
};

const headingStyle: React.CSSProperties = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
};

const headingStyleWarning: React.CSSProperties = {
  ...headingStyle,
  color: '#dc2626',
};

const contentStyle: React.CSSProperties = {
  color: '#4a5568',
  fontSize: '15px',
  lineHeight: '24px',
};

const textStyle: React.CSSProperties = {
  margin: '0 0 16px',
};

const reasonBoxStyle: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  padding: '12px 16px',
  borderRadius: '6px',
  margin: '16px 0',
  borderLeft: '4px solid #3b82f6',
};

const reasonLabelStyle: React.CSSProperties = {
  margin: '0 0 8px',
  color: '#1a1a1a',
};

const reasonTextStyle: React.CSSProperties = {
  margin: '0',
  color: '#4a5568',
};

const hrStyle: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const footerStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0',
};
