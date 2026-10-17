import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  port: number;
  env: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  allowedEmailDomains: string[];
  corsOrigin: string;
}

const allowedDomainsRaw = process.env.ALLOWED_EMAIL_DOMAINS || '';
const allowedEmailDomains = allowedDomainsRaw
  ? allowedDomainsRaw.split(',').map((domain) => domain.trim().toLowerCase()).filter(Boolean)
  : [];

export const config: Config = {
  port: parseInt(process.env.PORT || '4000', 10),
  env: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  jwtSecret: process.env.JWT_SECRET || 'campusconnect-dev-fallback-secret-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  allowedEmailDomains,
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
