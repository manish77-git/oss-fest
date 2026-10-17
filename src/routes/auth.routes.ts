import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { registerSchema, loginSchema } from '../schemas';
import { ConflictError, UnauthorizedError } from '../middleware/error';
import { hashPassword, verifyPassword } from '../services/password.service';
import { generateAccessToken } from '../services/token.service';
import { loginRateLimiter } from '../middleware/rateLimit';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

export const authRouter = Router();

// Helper to format skills and interests for serialization
function formatList(val: unknown): string {
  if (Array.isArray(val)) {
    return val.join(', ');
  }
  return typeof val === 'string' ? val : '';
}

function parseList(val: string): string[] {
  if (!val) return [];
  return val
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function sanitizeUser(user: {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  department: string | null;
  academicYear: string | null;
  skills: string;
  interests: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    department: user.department,
    academicYear: user.academicYear,
    skills: parseList(user.skills),
    interests: parseList(user.interests),
    createdAt: user.createdAt,
  };
}

/**
 * POST /api/auth/register
 * Registers a new student account.
 * Validates request payload, normalizes email and display name, securely hashes password,
 * persists record to the database, and returns a safe HTTP 201 response.
 *
 * Does NOT issue access tokens or create sessions in this feature.
 */
authRouter.post('/register', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    const normalizedEmail = data.email.toLowerCase().trim();
    const normalizedDisplayName = data.displayName.trim();

    // 1. Application-level email duplicate check
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    // 2. Securely hash password with bcrypt (12 salt rounds)
    const passwordHash = await hashPassword(data.password);

    // 3. Persist to real database (handling concurrent unique constraint race conditions)
    let user;
    try {
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          displayName: normalizedDisplayName,
          avatarUrl: data.avatarUrl || null,
          bio: data.bio || null,
          department: data.department || null,
          academicYear: data.academicYear || null,
          skills: formatList(data.skills),
          interests: formatList(data.interests),
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictError('An account with this email already exists');
      }
      throw err;
    }

    // 4. Return safe HTTP 201 response without tokens, passwords, or password hashes
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        displayName: user.displayName,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Authenticates a student using email and password.
 * - Rate-limited to protect against brute-force abuse
 * - Normalizes email consistently with registration (trimmed, lowercased)
 * - Verifies password using constant-time bcrypt hashing
 * - Employs generic error responses to prevent account enumeration
 * - Issues a cryptographically signed, short-lived JWT access token
 * - Strictly excludes password and passwordHash from the response
 */
authRouter.post(
  '/login',
  loginRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = loginSchema.parse(req.body);
      const normalizedEmail = data.email.toLowerCase().trim();

      // Look up student in real database
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      // Generic authentication failure response to prevent account enumeration
      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Verify submitted plaintext password against stored bcrypt hash
      const isPasswordValid = await verifyPassword(data.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Generate signed, short-lived JWT access token
      const tokenResult = generateAccessToken({
        id: user.id,
        email: user.email,
      });

      res.status(200).json({
        message: 'Login successful',
        accessToken: tokenResult.accessToken,
        token: tokenResult.accessToken, // Retained for compatibility
        tokenType: tokenResult.tokenType,
        expiresIn: tokenResult.expiresIn,
        user: {
          id: user.id,
          displayName: user.displayName,
          email: user.email,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/auth/session
 * Protected test endpoint demonstrating authentication middleware.
 * Returns confirmation and the authenticated student's identifier.
 * Unauthenticated requests are rejected with HTTP 401 Unauthorized.
 */
authRouter.get(
  '/session',
  authenticate,
  (req: AuthenticatedRequest, res: Response): void => {
    res.status(200).json({
      status: 'authenticated',
      user: {
        id: req.user!.id,
        email: req.user!.email,
      },
    });
  },
);

