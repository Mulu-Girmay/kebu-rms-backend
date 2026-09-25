import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import { config } from './environments.js';
import { Role } from '../models/role/index.js';
import { Wallet } from '../models/wallet/index.js';

import {
  MODEL_NAMES,
  UserStatus,
  TOKEN_EXPIRATION,
} from '../utils/constants.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/mailTemplate.js';
import { Types } from 'mongoose';
import logger from './winston.js';

const client = new MongoClient(config.mongoose.url);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, { client, transaction: false }),

  advanced: {
    disableOriginCheck: true,
    disableCSRFCheck: true,
  },
  baseURL: config.auth.baseUrl,
  secret: config.jwt.secret,
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const userId = `user_${new Types.ObjectId().toString()}`;
          const customerRole = await Role.findOne({ name: 'customer' });
          return {
            data: {
              ...user,
              id: userId, // Better Auth’s internal identifier
              _id: userId,
              role_id: customerRole ? String(customerRole._id) : user.role_id,
            },
          };
        },
        after: async (user) => {
          try {
            await Wallet.create({
              user: user.id,
              balance: 0,
              isActive: true,
            });
          } catch (error) {
            logger.error(
              `Failed to create wallet for user ${user.id} on sign-up`,
              error
            );
          }
        },
      },
    },
  },

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
    },
  },

  session: {
    expiresIn: TOKEN_EXPIRATION.REFRESH_TOKEN_SECONDS,
    updateAge: TOKEN_EXPIRATION.ACCESS_TOKEN_SECONDS,
  },
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
