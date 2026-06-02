import jwt from 'jsonwebtoken';
import { env } from './env';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  warehouseId?: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenFamily: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'],
    issuer: 'inventrack-pro',
    audience: 'inventrack-client',
  });
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES as jwt.SignOptions['expiresIn'],
    issuer: 'inventrack-pro',
    audience: 'inventrack-client',
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'inventrack-pro',
    audience: 'inventrack-client',
  }) as TokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'inventrack-pro',
    audience: 'inventrack-client',
  }) as RefreshTokenPayload;
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
};
