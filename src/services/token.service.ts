import jwt from 'jsonwebtoken';
import { config } from '../config';
import { InternalServerError } from '../middleware/error';

export interface AccessTokenResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number; // in seconds
}

export interface TokenPayload {
  sub: string;
  email: string;
  iss: string;
  aud: string;
}

/**
 * Default access token lifespan: 1800 seconds (30 minutes).
 */
export const DEFAULT_ACCESS_TOKEN_LIFESPAN_SECONDS = 1800;

export const TOKEN_ISSUER = 'campusconnect';
export const TOKEN_AUDIENCE = 'campusconnect-api';

/**
 * Validates that JWT_SECRET is properly configured.
 * In production, rejects missing or insecure default secrets.
 */
export function getValidatedJwtSecret(): string {
  const secret = config.jwtSecret;

  if (!secret || secret.trim() === '') {
    throw new InternalServerError('JWT configuration error: JWT_SECRET is not configured');
  }

  if (
    config.env === 'production' &&
    (secret.includes('fallback') || secret.includes('replace-with') || secret.length < 32)
  ) {
    throw new InternalServerError(
      'JWT configuration error: Production requires a secure JWT_SECRET with at least 32 characters',
    );
  }

  return secret;
}

/**
 * Generates a signed, short-lived JWT access token for an authenticated user.
 * - Sets the user ID as the subject (`sub`)
 * - Configures standard issuer (`iss`) and audience (`aud`) claims
 * - Strictly excludes passwords, password hashes, and sensitive credentials
 *
 * @param user - Authenticated user info (id and email)
 * @param expiresInSeconds - Token validity duration in seconds (defaults to 1800 / 30m)
 * @returns AccessTokenResult containing accessToken, tokenType ('Bearer'), and expiresIn
 */
export function generateAccessToken(
  user: { id: string; email: string },
  expiresInSeconds: number = DEFAULT_ACCESS_TOKEN_LIFESPAN_SECONDS,
): AccessTokenResult {
  const secret = getValidatedJwtSecret();

  const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
    sub: user.id,
    email: user.email.toLowerCase().trim(),
    iss: TOKEN_ISSUER,
    aud: TOKEN_AUDIENCE,
  };

  const accessToken = jwt.sign(payload, secret, {
    expiresIn: expiresInSeconds,
  });

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: expiresInSeconds,
  };
}

/**
 * Verifies and decodes a signed JWT access token.
 * Validates cryptographic signature, expiration, issuer, and audience.
 *
 * @param token - Bearer access token string
 * @returns Decoded TokenPayload with userId (sub) and email
 */
export function verifyAccessToken(token: string): { userId: string; email: string } {
  const secret = getValidatedJwtSecret();

  const decoded = jwt.verify(token, secret, {
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
  }) as jwt.JwtPayload;

  if (!decoded.sub || typeof decoded.sub !== 'string') {
    throw new Error('Token payload is missing subject claim');
  }

  return {
    userId: decoded.sub,
    email: (decoded.email as string) || '',
  };
}
