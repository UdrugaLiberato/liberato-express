import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  avatar?: string;
}

export interface AuthResponse {
  role: string;
  name: string;
  email: string | null;
  token: string;
  id: string;
}

export interface RegisterResponse {
  username: string;
  email: string | null;
  avatar?: string | null;
  id: string;
}

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';
const COOKIE_EXPIRATION = Number.parseInt(
  process.env.COOKIE_EXPIRATION || '3600000',
  10,
);

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
