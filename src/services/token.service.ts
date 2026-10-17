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
export const TOKEN_ALGORITHM: jwt.Algorithm = 'HS256';

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
 * - Specifies permitted HMAC SHA-256 (`HS256`) signing algorithm
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
    algorithm: TOKEN_ALGORITHM,
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
 * Validates cryptographic signature, expiration, algorithm, issuer, and audience.
 *
 * @param token - Bearer access token string
 * @returns Decoded payload containing verified userId and email
 */
export function verifyAccessToken(token: string): { userId: string; email: string } {
  const secret = getValidatedJwtSecret();

  const decoded = jwt.verify(token, secret, {
    algorithms: [TOKEN_ALGORITHM],
  }) as jwt.JwtPayload;

  // Validate issuer claim if specified
  if (decoded.iss !== undefined && decoded.iss !== TOKEN_ISSUER) {
    throw new jwt.JsonWebTokenError(`Invalid token issuer. Expected: ${TOKEN_ISSUER}`);
  }

  // Validate audience claim if specified
  if (decoded.aud !== undefined && decoded.aud !== TOKEN_AUDIENCE) {
    throw new jwt.JsonWebTokenError(`Invalid token audience. Expected: ${TOKEN_AUDIENCE}`);
  }

  const userId = (decoded.sub as string) || ((decoded as Record<string, unknown>).userId as string);
  if (!userId || typeof userId !== 'string') {
    throw new jwt.JsonWebTokenError('Token payload is missing subject claim');
  }

  return {
    userId,
    email: (decoded.email as string) || '',
  };
}
