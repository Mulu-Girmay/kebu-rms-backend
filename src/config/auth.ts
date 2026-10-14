import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { customSession } from 'better-auth/plugins';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';
import { config } from './environments.js';
import { Role } from '../models/role/index.js';
import { Wallet } from '../models/wallet/index.js';

import {
  MODEL_NAMES,
  UserStatus,
  TOKEN_EXPIRATION,
  CreditAccountStatus,
} from '../utils/constants.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/mailTemplate.js';
import { Types } from 'mongoose';
import logger from './winston.js';
import { CreditAccount } from '../models/creditAccount/index.js';

const client = new MongoClient(config.mongoose.url);
const db = client.db();
const authOptions = {
  database: mongodbAdapter(db, { client, transaction: false }),

  advanced: {
    disableOriginCheck: true,
    disableCSRFCheck: true,
  },
  trustedOrigins: [new URL(config.clientUrl).origin],
  baseURL: config.auth.baseUrl,
  secret: config.jwt.secret,
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
      requireLocalEmailVerified: true,
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.must_change_password) return;
          const userId = `user_${new Types.ObjectId().toString()}`;
          const customerRole = await Role.findOne({ name: 'customer' });
          return {
            data: {
              ...user,
              id: userId,
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
            await CreditAccount.create({
              user: user.id,
              usedCredit: 0,
              creditLimit: 0,
              status: CreditAccountStatus.ACTIVE,
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
    requireEmailVerification: true,
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

  ...(config.googleOAuth.clientId && config.googleOAuth.clientSecret
    ? {
        socialProviders: {
          google: {
            clientId: config.googleOAuth.clientId,
            clientSecret: config.googleOAuth.clientSecret,
          },
        },
      }
    : {}),

  user: {
    modelName: MODEL_NAMES.USER,
    additionalFields: {
      name: {
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
    },
  },

  session: {
    expiresIn: TOKEN_EXPIRATION.REFRESH_TOKEN_SECONDS,
    updateAge: TOKEN_EXPIRATION.ACCESS_TOKEN_SECONDS,
  },
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...authOptions,
  plugins: [
    customSession(async ({ user, session }) => {
      let populatedRole = null;

      if (user.role_id) {
        const roleDoc = await Role.findById(user.role_id).lean();
        if (roleDoc) {
          populatedRole = {
            ...roleDoc,
            id: String(roleDoc._id),
          };
        }
      }

      return {
        session,
        user: {
          ...user,
          role: populatedRole,
        },
      };
    }, authOptions),
  ],
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
