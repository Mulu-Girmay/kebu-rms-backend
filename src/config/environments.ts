import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envVarSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5000),
  API_URL: Joi.string().default('http://localhost:5000'),
  MONGO_URI: Joi.string()
    .uri()
    .required()
    .description('mongoDB connection URI'),
  JWT_SECRET: Joi.string().min(10).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  EMAIL_VERIFICATION_EXPIRES_IN: Joi.number().default(30),
  EMAIL_FROM: Joi.string().default('Kebu RMS <noreply@kebu.com>'),
  EMAIL_USER: Joi.string()
    .email()
    .required()
    .description('Gmail sender address'),
  EMAIL_PASSWORD: Joi.string().description(
    'email  password nodmailer fallback '
  ),
  OAUTH_CLIENT_ID: Joi.string()
    .required()
    .description('Google OAuth2 Client ID'),
  OAUTH_CLIENT_SECRET: Joi.string()
    .required()
    .description('Google OAuth2 Client Secret'),
  OAUTH_REFRESH_TOKEN: Joi.string()
    .required()
    .description('Google OAuth2 Refresh Token'),
  GOOGLE_CLIENT_ID: Joi.string().allow('').default(''),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').default(''),
  APP_CLIENT_URL: Joi.string().default('http://localhost:3000'),
}).unknown(true);

const { value: envVars, error } = envVarSchema.validate(process.env, {
  abortEarly: false,
  stripUnknown: true,
});
if (error) throw new Error(`Config validation error: ${error.message}`);

const mongoUri = new URL(envVars.MONGO_URI);
mongoUri.searchParams.set('retryWrites', 'false');

export interface AppConfig {
  env: string;
  port: number;
  apiUrl: string;
  auth: {
    baseUrl: string;
  };
  mongoose: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  verification: {
    expiresIn: number;
  };
  email: {
    from: string;
    user: string;
    pass: string;
    oauth: {
      clientId: string;
      clientSecret: string;
      refreshToken: string;
    };
  };
  googleOAuth: {
    clientId: string;
    clientSecret: string;
  };
  clientUrl: string;
}

export const config: AppConfig = {
  env: envVars.NODE_ENV,
  port: Number(envVars.PORT),
  apiUrl: envVars.API_URL,
  auth: {
    baseUrl: envVars.API_URL,
  },
  mongoose: { url: mongoUri.toString() },
  jwt: { secret: envVars.JWT_SECRET, expiresIn: envVars.JWT_EXPIRES_IN },
  verification: { expiresIn: envVars.EMAIL_VERIFICATION_EXPIRES_IN },
  email: {
    from: envVars.EMAIL_FROM,
    user: envVars.EMAIL_USER,
    pass: envVars.EMAIL_PASSWORD,
    oauth: {
      clientId: envVars.OAUTH_CLIENT_ID,
      clientSecret: envVars.OAUTH_CLIENT_SECRET,
      refreshToken: envVars.OAUTH_REFRESH_TOKEN,
    },
  },
  googleOAuth: {
    clientId: envVars.GOOGLE_CLIENT_ID,
    clientSecret: envVars.GOOGLE_CLIENT_SECRET,
  },
  clientUrl: envVars.APP_CLIENT_URL,
};
