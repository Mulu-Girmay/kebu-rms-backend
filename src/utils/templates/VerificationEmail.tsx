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
      <Preview>Verify your email to begin your Swen Cafe journey</Preview>
      <Body style={mainStyle}>













































                <Container style={containerStyle}>
          <Section style={containerInnerStyle}>
            {/* Brand header */}
            <Section style={brandSectionStyle}>
              <Text style={brandTextStyle}>Swen Cafe</Text>
              <Text style={taglineStyle}></Text>
            </Section>

            {/* Heading */}
            <Section style={headerStyle}>
              <Heading style={headingStyle}>Verify your email</Heading>
            </Section>

            {/* Content */}
            <Section style={contentStyle}>
              <Text style={textStyle}>Hello {fullName},</Text>
              <Text style={textStyle}>
                Thank you for joining Swen Cafe. Please verify your email
                address to activate your account and begin your journey with us.
              </Text>

              {/* Button */}
              <Section style={buttonContainerStyle}>
                <Button href={verificationUrl} style={buttonStyle}>
                  Verify My Email
                </Button>
              </Section>

              {/* Fallback link */}
              <Text style={subtextStyle}>
                Or copy and paste this link into your browser:
              </Text>
              <Text style={linkTextStyle}>
                <a href={verificationUrl} style={linkStyle}>
                  {verificationUrl}
                </a>
              </Text>

              <Hr style={hrStyle} />

              <Text style={footerStyle}>
                If you didn&apos;t create an account with Swen Cafe, you can
                safely ignore this email.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// ============================================================
// Styles — matched to the Swen Cafe design system
// ============================================================

const mainStyle: React.CSSProperties = {
  backgroundColor: '#F5EFE7', // warm cream
  fontFamily:
    'Georgia, "Times New Roman", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: '40px 20px',
  margin: 0,
};

const containerStyle: React.CSSProperties = {
  backgroundColor: '#FFFDFB', // soft off-white, warmer than pure white
  margin: '0 auto',
  borderRadius: '16px',
  maxWidth: '560px',
  border: '1px solid #EFE6D9',
  boxShadow: '0 4px 20px rgba(74, 55, 40, 0.06)',
};

const containerInnerStyle: React.CSSProperties = {
  padding: '40px 44px',
};

const brandSectionStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '28px',
};

const brandTextStyle: React.CSSProperties = {
  color: '#4A3728', // dark brown
  fontSize: '28px',
  fontWeight: '700',
  fontStyle: 'italic',
  fontFamily: 'Georgia, "Times New Roman", serif',
  margin: '0 0 6px',
  letterSpacing: '-0.3px',
};

const taglineStyle: React.CSSProperties = {
  color: '#9B8978', // muted warm brown
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
  color: '#3D2E1F', // deepest brown
  fontSize: '22px',
  fontWeight: '700',
  fontFamily: 'Georgia, "Times New Roman", serif',
  margin: '0',
  textAlign: 'center',
};

const contentStyle: React.CSSProperties = {
  color: '#5A4636', // warm brown body text
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
  margin: '32px 0',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#4A3728', // matches Sign In button
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
  color: '#8B6F47', // warm brown link
  textDecoration: 'underline',
  fontFamily: 'monospace',
};

const hrStyle: React.CSSProperties = {
  borderColor: '#EFE6D9',
  borderTop: '1px solid #EFE6D9',
  margin: '28px 0 16px',
};

const footerStyle: React.CSSProperties = {
  color: '#B5A594', // lightest brown
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
  textAlign: 'center',
  fontStyle: 'italic',
};

export default VerificationEmail;