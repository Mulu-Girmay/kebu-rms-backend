import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import mongoose from 'mongoose';
import { config } from './environments.js';

export const auth = betterAuth({
  database: mongodbAdapter(mongoose.connection.getClient().db()),
  baseURL: `http://localhost:${config.port}`,
  secret: config.jwt.secret,

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'customer',
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
