import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import env from '../config/env';

const { JWT_SECRET } = env;
const { JWT_EXPIRATION } = env;
const { COOKIE_EXPIRATION } = env;

export const normalizeHash = (hash: string): string => {
  return hash.replace(/^\$2y\$/, '$2b$');
};

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  } as jwt.SignOptions);
};

export const setAuthCookie = (res: any, token: string) => {
  res.cookie('BEARER', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: COOKIE_EXPIRATION,
  });
};

export const verifyPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  const normalizedHash = normalizeHash(hash);
  return bcrypt.compare(password, normalizedHash);
};

export const verifyGoogleToken = async (token: string, clientId: string) => {
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: clientId,
  });
  return ticket.getPayload();
};
