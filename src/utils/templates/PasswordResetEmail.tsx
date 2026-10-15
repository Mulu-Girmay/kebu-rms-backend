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
      <Preview>Reset your Swen Cafe password</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Brand header */}
          <Section style={brandSectionStyle}>
            <Text style={brandTextStyle}>Swen Cafe</Text>
            <Text style={taglineStyle}>
             </Text>
          </Section>

          {/* Heading */}
          <Section style={headerStyle}>
            <Heading style={headingStyle}>Reset your password</Heading>
          </Section>

          {/* Content */}
          <Section style={contentStyle}>
            <Text style={textStyle}>Hello {fullName},</Text>
            <Text style={textStyle}>
              We received a request to reset the password for your Swen Cafe
              account. Click the button below to choose a new password.
            </Text>

            {/* CTA button */}
            <Section style={buttonContainerStyle}>
              <Button href={resetUrl} style={buttonStyle}>
                Reset Password
              </Button>
            </Section>

            {/* Fallback link */}
            <Text style={subtextStyle}>
              Or copy and paste this link into your browser:
            </Text>
            <Text style={linkTextStyle}>
              <a href={resetUrl} style={linkStyle}>
                {resetUrl}
              </a>
            </Text>

            {/* Security notice callout */}
            <Section style={noticeBoxStyle}>
              <Text style={noticeTextStyle}>
                <strong>Didn&apos;t request this?</strong> You can safely ignore
                this email — your password will remain unchanged. If you&apos;re
                concerned, please contact our support team.
              </Text>
            </Section>

            <Hr style={hrStyle} />

            <Text style={footerStyle}>
              This link expires in 1 hour for your security.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// ============================================================
// Styles — Swen Cafe design system
// ============================================================

const mainStyle: React.CSSProperties = {
  backgroundColor: '#F5EFE7',
  fontFamily:
    'Georgia, "Times New Roman", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: '40px 20px',
  margin: 0,
};

const containerStyle: React.CSSProperties = {
  backgroundColor: '#FFFDFB',
  margin: '0 auto',
  padding: '40px 44px',
  borderRadius: '16px',
  maxWidth: '560px',
  border: '1px solid #EFE6D9',
  boxShadow: '0 4px 20px rgba(74, 55, 40, 0.06)',
};

const brandSectionStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '28px',
};

const brandTextStyle: React.CSSProperties = {
  color: '#4A3728',
  fontSize: '28px',
  fontWeight: '700',
  fontStyle: 'italic',
  fontFamily: 'Georgia, "Times New Roman", serif',
  margin: '0 0 6px',
  letterSpacing: '-0.3px',
};

const taglineStyle: React.CSSProperties = {
  color: '#9B8978',
  fontSize: '13px',
  fontStyle: 'italic',
  margin: '0',
  fontFamily: 'Georgia, "Times New Roman", serif',
};

const headerStyle: React.CSSProperties = {
  marginBottom: '20px',
  paddingTop: '24px',
  borderTop: '1px solid #EFE6D9',
};

const headingStyle: React.CSSProperties = {
  color: '#3D2E1F',
  fontSize: '22px',
  fontWeight: '700',
  fontFamily: 'Georgia, "Times New Roman", serif',
  margin: '0',
  textAlign: 'center',
};

const contentStyle: React.CSSProperties = {
  color: '#5A4636',
  fontSize: '15px',
  lineHeight: '24px',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const textStyle: React.CSSProperties = {
  margin: '0 0 16px',
  color: '#5A4636',
};

const buttonContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: '28px 0 20px',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#4A3728',
  color: '#FFFFFF',
  padding: '14px 32px',
  borderRadius: '10px',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
  letterSpacing: '0.2px',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  boxShadow: '0 2px 8px rgba(74, 55, 40, 0.2)',
};

const subtextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#9B8978',
  margin: '20px 0 8px',
  textAlign: 'center',
};

const linkTextStyle: React.CSSProperties = {
  fontSize: '12px',
  textAlign: 'center',
  margin: '0 0 16px',
  wordBreak: 'break-all',
};

const linkStyle: React.CSSProperties = {
  color: '#8B6F47',
  textDecoration: 'underline',
  fontFamily: 'monospace',
};

// Security notice — neutral warm tone, not alarming
const noticeBoxStyle: React.CSSProperties = {
  backgroundColor: '#F5EFE7',
  padding: '14px 18px',
  borderRadius: '10px',
  margin: '24px 0 0',
  borderLeft: '4px solid #8B6F47',
};

const noticeTextStyle: React.CSSProperties = {
  color: '#5A4636',
  fontSize: '13px',
  lineHeight: '21px',
  margin: '0',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const hrStyle: React.CSSProperties = {
  borderColor: '#EFE6D9',
  borderTop: '1px solid #EFE6D9',
  margin: '28px 0 16px',
};

const footerStyle: React.CSSProperties = {
  color: '#B5A594',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
  textAlign: 'center',
  fontStyle: 'italic',
};

export default PasswordResetEmail;