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
          ? 'Your Swen Cafe account has been suspended'
          : `Your Swen Cafe account status is now ${newStatus}`}
      </Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Brand header */}
          <Section style={brandSectionStyle}>
            <Text style={brandTextStyle}>Swen Cafe</Text>
            <Text style={taglineStyle}>
             </Text>
          </Section>

          {/* Heading — changes tone based on status */}
          <Section style={headerStyle}>
            <Heading
              style={isSuspended ? headingStyleWarning : headingStyle}
            >
              {isSuspended ? 'Account Suspended' : 'Account Status Update'}
            </Heading>
          </Section>

          {/* Content */}
          <Section style={contentStyle}>
            <Text style={textStyle}>Hello {fullName},</Text>
            <Text style={textStyle}>
              We&apos;re writing to let you know that your account status has
              been updated to <strong style={emphasisStyle}>{newStatus}</strong>.
            </Text>

            {/* Reason callout — only shown if a reason was provided */}
            {reason && (
              <Section
                style={isSuspended ? reasonBoxWarningStyle : reasonBoxStyle}
              >
                <Text style={reasonLabelStyle}>Reason</Text>
                <Text style={reasonTextStyle}>{reason}</Text>
              </Section>
            )}

            <Text style={textStyle}>
              {isSuspended
                ? 'If you believe this was a mistake, please reply to this email to appeal and a member of our team will assist you.'
                : 'Thank you for being part of the Swen Cafe community.'}
            </Text>

            <Hr style={hrStyle} />

            <Text style={footerStyle}>
              Warm regards,
              <br />
              <strong style={footerBrandStyle}>The Swen Cafe Team</strong>
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

// Suspended: warm terracotta instead of harsh red — softer but still alarming
const headingStyleWarning: React.CSSProperties = {
  ...headingStyle,
  color: '#A64B3C',
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

// Default reason callout — neutral/informational
const reasonBoxStyle: React.CSSProperties = {
  backgroundColor: '#F5EFE7',
  padding: '16px 18px',
  borderRadius: '10px',
  margin: '20px 0',
  borderLeft: '4px solid #8B6F47',
};

// Suspended reason callout — same shape, warmer warning color
const reasonBoxWarningStyle: React.CSSProperties = {
  ...reasonBoxStyle,
  backgroundColor: '#FBF1EC',
  borderLeft: '4px solid #A64B3C',
};

const reasonLabelStyle: React.CSSProperties = {
  margin: '0 0 6px',
  color: '#3D2E1F',
  fontSize: '12px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const reasonTextStyle: React.CSSProperties = {
  margin: '0',
  color: '#5A4636',
  fontSize: '14px',
  lineHeight: '22px',
};

const hrStyle: React.CSSProperties = {
  borderColor: '#EFE6D9',
  borderTop: '1px solid #EFE6D9',
  margin: '28px 0 16px',
};

const footerStyle: React.CSSProperties = {
  color: '#9B8978',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
  fontStyle: 'italic',
  fontFamily: 'Georgia, "Times New Roman", serif',
};

const footerBrandStyle: React.CSSProperties = {
  color: '#4A3728',
  fontStyle: 'normal',
  fontWeight: '600',
};

export default StatusChangeEmail;