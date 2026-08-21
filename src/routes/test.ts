import express from 'express';
import type { Router, Request, Response } from 'express';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/mailTemplate.js';
import { verifyTransporter } from '../config/nodemailer.js';

const route: Router = express.Router();

// Health check
route.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API is up and running' });
});

// Verify SMTP / OAuth2 connection status
route.get('/verify-transporter', async (_req: Request, res: Response) => {
  try {
    await verifyTransporter();
    res.json({
      success: true,
      message: 'Nodemailer transporter connected successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Nodemailer transporter connection failed',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Send a test email (Verification or Password Reset)
// Query params: ?to=user@example.com&type=verification or ?to=user@example.com&type=reset
route.all('/send-email', async (req: Request, res: Response) => {
  const to = (req.query.to || req.body?.to || 'test@example.com') as string;
  const type = (req.query.type || req.body?.type || 'verification') as string;
  const name = (req.query.name || req.body?.name || 'Test User') as string;

  try {
    if (type === 'reset') {
      await sendPasswordResetEmail(to, name, 'sample_reset_token_456');
      res.json({
        success: true,
        message: `Password reset test email sent to ${to}`,
      });
    } else {
      await sendVerificationEmail(to, name, 'sample_verification_token_123');
      res.json({
        success: true,
        message: `Verification test email sent to ${to}`,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export default route;
