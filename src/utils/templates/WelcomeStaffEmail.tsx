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

export interface WelcomeStaffEmailProps {
  fullName: string;
  email: string;
  temporaryPassword: string;
  roleName: string;
  loginUrl: string;
}

export const WelcomeStaffEmail: React.FC<WelcomeStaffEmailProps> = ({
  fullName,
  email,
  temporaryPassword,
  roleName,
  loginUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Your Kebu RMS staff account has been created</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Heading style={headingStyle}>Welcome to Kebu RMS</Heading>
          </Section>
          <Section style={contentStyle}>
            <Text style={textStyle}>Hello {fullName},</Text>
            <Text style={textStyle}>
              An administrator has created a <strong>{roleName}</strong> account
              for you on Kebu RMS. Please use the credentials below to log in.
            </Text>
            <Section style={credentialsBoxStyle}>
              <Text style={credentialLabelStyle}>Email</Text>
              <Text style={credentialValueStyle}>{email}</Text>
              <Text style={credentialLabelStyle}>Temporary password</Text>
              <Text style={credentialValueStyle}>{temporaryPassword}</Text>
            </Section>
            <Text style={warningStyle}>
              ⚠️ You will be required to change your password on your first login.
            </Text>
            <Text style={textStyle}>
              Log in at: <a href={loginUrl} style={linkStyle}>{loginUrl}</a>
            </Text>
            <Hr style={hrStyle} />
            <Text style={footerStyle}>
              If you did not expect this email, please contact your administrator.
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

const headerStyle: React.CSSProperties = { marginBottom: '24px' };
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

const textStyle: React.CSSProperties = { margin: '0 0 16px' };

const credentialsBoxStyle: React.CSSProperties = {
  backgroundColor: '#f3f4f6',
  padding: '16px',
  borderRadius: '6px',
  margin: '20px 0',
  borderLeft: '4px solid #1d3557',
};

const credentialLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0 0 4px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const credentialValueStyle: React.CSSProperties = {
  fontSize: '15px',
  color: '#1a1a1a',
  fontFamily: 'monospace',
  margin: '0 0 12px',
  fontWeight: '600',
};

const warningStyle: React.CSSProperties = {
  color: '#dc2626',
  fontSize: '14px',
  margin: '16px 0',
  fontWeight: '600',
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

export default WelcomeStaffEmail;