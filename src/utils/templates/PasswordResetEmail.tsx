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
  Button,
  Hr,
} from '@react-email/components';

export interface PasswordResetEmailProps {
  fullName: string;
  resetUrl: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  fullName,
  resetUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your Kebu RMS password</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Heading style={headingStyle}>Password Reset Request</Heading>
          </Section>
          <Section style={contentStyle}>
            <Text style={textStyle}>Hello {fullName},</Text>
            <Text style={textStyle}>
              We received a request to reset the password for your Kebu RMS
              account. Click the button below to choose a new password:
            </Text>
            <Section style={buttonContainerStyle}>
              <Button href={resetUrl} style={buttonStyle}>
                Reset Password
              </Button>
            </Section>
            <Text style={subtextStyle}>
              Or copy and paste this link in your browser:
              <br />
              <a href={resetUrl} style={linkStyle}>
                {resetUrl}
              </a>
            </Text>
            <Hr style={hrStyle} />
            <Text style={footerStyle}>
              If you didn&apos;t request a password reset, please ignore this
              email. Your password will remain unchanged.
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

const contentStyle: React.CSSProperties = {
  color: '#4a5568',
  fontSize: '15px',
  lineHeight: '24px',
};

const textStyle: React.CSSProperties = {
  margin: '0 0 16px',
};

const buttonContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: '28px 0',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#1d3557',
  color: '#ffffff',
  padding: '12px 28px',
  borderRadius: '6px',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
};

const subtextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#718096',
  margin: '16px 0',
};

const linkStyle: React.CSSProperties = {
  color: '#3182ce',
  wordBreak: 'break-all',
};

const hrStyle: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '24px 0 16px',
};

const footerStyle: React.CSSProperties = {
  color: '#a0aec0',
  fontSize: '12px',
  margin: '0',
};

export default PasswordResetEmail;
