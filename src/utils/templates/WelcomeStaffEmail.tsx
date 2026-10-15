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
      <Preview>Your Swen Cafe staff account has been created</Preview>
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
            <Heading style={headingStyle}>Welcome aboard</Heading>
          </Section>

          {/* Content */}
          <Section style={contentStyle}>
            <Text style={textStyle}>Hello {fullName},</Text>
            <Text style={textStyle}>
              An administrator has created a{' '}
              <strong style={emphasisStyle}>{roleName}</strong> account for you
              at Swen Cafe. Below are your temporary credentials to sign in.
            </Text>

            {/* Credentials card */}
            <Section style={credentialsBoxStyle}>
              <Text style={credentialLabelStyle}>Email</Text>
              <Text style={credentialValueStyle}>{email}</Text>

              <Text style={credentialLabelStyle}>Temporary password</Text>
              <Text style={credentialValueStyle}>{temporaryPassword}</Text>
            </Section>

            {/* Warning callout */}
            <Section style={warningBoxStyle}>
              <Text style={warningTextStyle}>
                <strong>Important:</strong> You&apos;ll be required to change
                this password on your first sign-in.
              </Text>
            </Section>

            {/* Login button */}
            <Section style={buttonContainerStyle}>
              <Button href={loginUrl} style={buttonStyle}>
                Sign In to Your Account
              </Button>
            </Section>

            <Text style={subtextStyle}>
              Or copy and paste this link into your browser:
            </Text>
            <Text style={linkTextStyle}>
              <a href={loginUrl} style={linkStyle}>
                {loginUrl}
              </a>
            </Text>

            <Hr style={hrStyle} />

            <Text style={footerStyle}>
              If you weren&apos;t expecting this email, please contact your
              administrator right away.
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

const emphasisStyle: React.CSSProperties = {
  color: '#3D2E1F',
  fontWeight: '600',
};

// Credentials card — warm cream, brown accent border
const credentialsBoxStyle: React.CSSProperties = {
  backgroundColor: '#F5EFE7',
  padding: '20px 22px',
  borderRadius: '10px',
  margin: '24px 0',
  borderLeft: '4px solid #8B6F47',
};

const credentialLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#9B8978',
  margin: '0 0 6px',
  textTransform: 'uppercase',
  letterSpacing: '0.7px',
  fontWeight: '700',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const credentialValueStyle: React.CSSProperties = {
  fontSize: '15px',
  color: '#3D2E1F',
  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
  margin: '0 0 16px',
  fontWeight: '600',
  letterSpacing: '0.3px',
  wordBreak: 'break-all',
};

// Warning callout — warm terracotta, consistent with StatusChangeEmail's suspension
const warningBoxStyle: React.CSSProperties = {
  backgroundColor: '#FBF1EC',
  padding: '14px 18px',
  borderRadius: '10px',
  margin: '20px 0',
  borderLeft: '4px solid #A64B3C',
};

const warningTextStyle: React.CSSProperties = {
  color: '#7A3A2D',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

// Primary CTA — same visual weight as the "Sign In" button on the login page
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

export default WelcomeStaffEmail;