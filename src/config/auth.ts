import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import { config } from './environments.js';
import {
  MODEL_NAMES,
  UserStatus,
  TOKEN_EXPIRATION,
} from '../utils/constants.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/mailTemplate.js';

const client = new MongoClient(config.mongoose.url);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, { client, transaction: false }),
  baseURL: config.auth.baseUrl,
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
    modelName: MODEL_NAMES.USER,
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
        defaultValue: UserStatus.ACTIVE,
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
    expiresIn: TOKEN_EXPIRATION.REFRESH_TOKEN_SECONDS,
    updateAge: TOKEN_EXPIRATION.ACCESS_TOKEN_SECONDS,
  },
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
