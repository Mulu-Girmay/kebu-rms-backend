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

export interface VerificationEmailProps {
  fullName: string;
  verificationUrl: string;
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({
  fullName,
  verificationUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for Kebu RMS</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Heading style={headingStyle}>Welcome to Kebu RMS!</Heading>
          </Section>
          <Section style={contentStyle}>
            <Text style={textStyle}>Hello {fullName},</Text>
            <Text style={textStyle}>
              Thank you for signing up. Please verify your email address to
              activate your account and get started.
            </Text>
            <Section style={buttonContainerStyle}>
              <Button href={verificationUrl} style={buttonStyle}>
                Verify My Email
              </Button>
            </Section>
            <Text style={subtextStyle}>
              Or copy and paste this link in your browser:
              <br />
              <a href={verificationUrl} style={linkStyle}>
                {verificationUrl}
              </a>
            </Text>
            <Hr style={hrStyle} />
            <Text style={footerStyle}>
              If you didn&apos;t create an account with Kebu RMS, you can safely
              ignore this email.
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
  backgroundColor: '#e63946',
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

export default VerificationEmail;
