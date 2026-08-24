import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';
import type { Response, CookieOptions } from 'express';
import { config } from '../config/environments.js';
import { AUTH_COOKIES, TOKEN_EXPIRATION } from './constants.js';

const getCookieOptions = (maxAge: number): CookieOptions => ({
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: 'lax',
  maxAge,
  path: '/',
});

export const generateAccessToken = (
  res: Response,
  id: Types.ObjectId | string,
  username: string,
  email: string
): string => {
  const accessToken: string = jwt.sign(
    { id, username, email },
    config.jwt.secret,
    { expiresIn: TOKEN_EXPIRATION.ACCESS_TOKEN }
  );

  res.cookie(
    AUTH_COOKIES.ACCESS_TOKEN,
    accessToken,
    getCookieOptions(TOKEN_EXPIRATION.ACCESS_TOKEN_MAX_AGE_MS)
  );

  return accessToken;
};

export const generateRefreshToken = (
  res: Response,
  id: Types.ObjectId | string,
  username: string,
  email: string
): string => {
  const refreshToken: string = jwt.sign(
    { id, username, email },
    config.jwt.secret,
    { expiresIn: TOKEN_EXPIRATION.REFRESH_TOKEN }
  );

  res.cookie(
    AUTH_COOKIES.REFRESH_TOKEN,
    refreshToken,
    getCookieOptions(TOKEN_EXPIRATION.REFRESH_TOKEN_MAX_AGE_MS)
  );

  return refreshToken;
};
