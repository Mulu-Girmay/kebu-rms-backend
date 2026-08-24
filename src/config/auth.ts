import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import mongoose from 'mongoose';
import { config } from './environments.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/mailTemplate.js';

export const auth = betterAuth({
  database: mongodbAdapter(mongoose.connection.getClient().db()),
  baseURL: `http://localhost:${config.port}`,
  secret: config.jwt.secret,

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, token }) => {
      await sendPasswordResetEmail(user.email, user.name || 'User', token);
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      await sendVerificationEmail(user.email, user.name || 'User', token);
    },
  },

  user: {
    modelName: 'users',
    additionalFields: {
      fullName: {
        type: 'string',
        required: false,
      },
      role_id: {
        type: 'string',
        required: false,
      },
      status: {
        type: 'string',
        defaultValue: 'active',
        required: false,
      },
      must_change_password: {
        type: 'boolean',
        defaultValue: false,
        required: false,
      },
      profileImage: {
        type: 'string',
        required: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
