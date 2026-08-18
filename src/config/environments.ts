import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();
const envVarSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  MONGO_URI: Joi.string().uri().required().description('mongoDB connection URI'),
  JWT_SECRET: Joi.string().min(10).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),
  EMAIL_VERIFICATION_EXPIRES_IN: Joi.number().default(30)

}).unknown(true);

const { value: envVars, error } = envVarSchema.validate(process.env, {
  abortEarly: false,
  stripUnknown: true,
});
if (error) throw new Error(`Config validation error: ${error.message}`);


export interface AppConfig {
    env: string;
    port: number;
    mongoose:{
        url: string;
    };
    jwt:{
        secret: string;
        expiresIn: string;
    };
    verification:{
      expiresIn: number;
    }
}
export const config: AppConfig = {
  env: envVars.NODE_ENV,
  port: Number(envVars.PORT),
  mongoose: { url: envVars.MONGO_URI },
  jwt: { secret: envVars.JWT_SECRET, expiresIn: envVars.JWT_EXPIRES_IN },
  verification: {expiresIn:envVars.EMAIL_VERIFICATION_EXPIRES_IN}
};