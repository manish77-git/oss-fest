import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../db';
import { AuthenticatedRequest, AuthTokenPayload } from '../types';
import { UnauthorizedError } from './error';

export function signToken(payload: AuthTokenPayload): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
}

export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Authentication token is missing');
    }

    let decoded: AuthTokenPayload;
    try {
      decoded = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
    } catch (err: unknown) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Authentication token has expired');
      }
      throw new UnauthorizedError('Invalid authentication token');
    }

    // Verify user still exists in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new UnauthorizedError('The user associated with this token no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

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

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true },
      });
      if (user) {
        req.user = user;
      }
    } catch {
      // Ignored for optional authentication
    }

    next();
  } catch (err) {
    next(err);
  }
}
