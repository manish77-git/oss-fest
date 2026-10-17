import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { registerSchema, loginSchema } from '../schemas';
import { signToken } from '../middleware/auth';
import { ConflictError, UnauthorizedError } from '../middleware/error';
import { hashPassword, verifyPassword } from '../services/password.service';

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
 * Authenticates a student with email and password, returning a JWT token.
 */
authRouter.post('/login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);
    const normalizedEmail = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await verifyPassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
});
