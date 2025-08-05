import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set');
}

if (!process.env.CLERK_WEBHOOK_SIGNING_SECRET) {
  throw new Error('CLERK_WEBHOOK_SIGNING_SECRET is not set');
}

if (!process.env.CLERK_PUBLISHABLE_KEY) {
  throw new Error('CLERK_PUBLISHABLE_KEY is not set');
}

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY is not set');
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID is not set');
}

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  STORE_URL: string;
  GOOGLE_API_KEY: string;
  CLERK_WEBHOOK_SIGNING_SECRET: string;
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  COOKIE_EXPIRATION: number;
  GOOGLE_CLIENT_ID: string;
}

const env: EnvConfig = {
  PORT: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  STORE_URL: process.env.STORE_URL || 'https://store.udruga-liberato.hr',
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
  CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
  COOKIE_EXPIRATION: Number.parseInt(
    process.env.COOKIE_EXPIRATION || '3600000',
    10,
  ),
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
};

export default env;
