import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { AuthenticatedRequest, AuthTokenPayload } from '../types';
import { UnauthorizedError } from './error';
import { generateAccessToken, verifyAccessToken } from '../services/token.service';

/**
 * Signs a JWT token with user credentials.
 * Reuses the standard token service with full claims (sub, iss, aud).
 */
export function signToken(payload: AuthTokenPayload): string {
  const result = generateAccessToken({
    id: payload.userId,
    email: payload.email,
  });
  return result.accessToken;
}

/**
 * Authentication Middleware
 * Enforces Bearer token authentication on protected endpoints:
 * 1. Strictly rejects tokens passed via query parameters
 * 2. Extracts and validates the `Authorization: Bearer <token>` header
 * 3. Cryptographically verifies signature, expiration, issuer, audience, and algorithm
 * 4. Confirms the user account still exists in the database
 * 5. Attaches a typed `req.user = { id, email }` context to the request
 * 6. Safely handles database/infrastructure failures (yielding 500 rather than false success)
 */
export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // 1. Strictly reject tokens passed via query parameters
    if (req.query.token || req.query.accessToken) {
      throw new UnauthorizedError('Authentication tokens in query parameters are strictly forbidden');
    }

    // 2. Extract Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError('Authentication token is missing');
    }

    // 3. Validate Bearer token scheme format
    const match = authHeader.match(/^Bearer\s+(\S+)$/);
    if (!match || !match[1] || match[1].trim() === '') {
      throw new UnauthorizedError('Authentication token is missing or malformed');
    }

    const token = match[1];

    // 4. Verify cryptographic signature, expiration, algorithm, issuer, and audience
    let tokenData: { userId: string; email: string };
    try {
      tokenData = verifyAccessToken(token);
    } catch (err: unknown) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Authentication token has expired');
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid authentication token');
      }
      throw new UnauthorizedError('Invalid authentication credentials');
    }

    // 5. Confirm that the user still exists in the database
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: tokenData.userId },
        select: { id: true, email: true },
      });
    } catch (dbErr) {
      // Database errors must NOT produce false success or 401; pass to central error handler -> 500
      return next(dbErr);
    }

    if (!user) {
      throw new UnauthorizedError('User account not found or invalid');
    }

    // 6. Attach trusted, typed user identity context
    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Optional Authentication Helper
 * Enriches request with `req.user` if a valid Bearer token is provided,
 * but allows unauthenticated requests to proceed without error.
 */
export async function optionalAuthenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const match = authHeader.match(/^Bearer\s+(\S+)$/);
    if (!match || !match[1]) {
      return next();
    }

    try {
      const tokenData = verifyAccessToken(match[1]);
      const user = await prisma.user.findUnique({
        where: { id: tokenData.userId },
        select: { id: true, email: true },
      });
      if (user) {
        req.user = { id: user.id, email: user.email };
      }
    } catch {
      // Ignore invalid tokens for optional authentication endpoints
    }

    next();
  } catch (err) {
    next(err);
  }
}
