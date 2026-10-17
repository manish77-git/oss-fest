import { Router, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import { BadRequestError, NotFoundError } from '../middleware/error';
import { updateUserSchema } from '../schemas';
import { AuthenticatedRequest } from '../types';
import { sanitizeUser } from './auth.routes';

export const usersRouter = Router();

function formatList(val: unknown): string {
  if (Array.isArray(val)) {
    return val.join(', ');
  }
  return typeof val === 'string' ? val : '';
}

/**
 * GET /api/users/me
 * Retrieves current student's authenticated profile with active memberships.
 * Requires valid authentication token. Returns user's own email and permitted profile fields.
 * Never returns password hashes or secret credentials.
 */
usersRouter.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        memberships: {
          include: {
            community: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User profile not found or account unavailable');
    }

    res.json({
      user: {
        ...sanitizeUser(user),
        memberships: user.memberships.map((m) => ({
          communityId: m.communityId,
          communityName: m.community.name,
          role: m.role,
          joinedAt: m.joinedAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/users/me
 * Updates allowed profile fields for the authenticated student.
 * Uses authenticated identity from token rather than client input.
 * Supports partial updates while strictly rejecting protected fields (email, id, passwordHash, role).
 */
usersRouter.patch('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.body || typeof req.body !== 'object' || Object.keys(req.body).length === 0) {
      throw new BadRequestError('At least one editable profile field must be provided');
    }

    const data = updateUserSchema.parse(req.body);

    const updateData: Record<string, unknown> = {};
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl === '' ? null : data.avatarUrl;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.academicYear !== undefined) updateData.academicYear = data.academicYear;
    if (data.skills !== undefined) updateData.skills = formatList(data.skills);
    if (data.interests !== undefined) updateData.interests = formatList(data.interests);

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
    });

    res.json({
      message: 'Profile updated successfully',
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/:id
 * Public student profile view, omitting credentials, email, and sensitive account data.
 * Validates the requested student ID format and returns 404 for nonexistent students.
 */
usersRouter.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ID format: non-empty alphanumeric string (with hyphens/underscores, 1-64 chars)
    if (!id || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
      throw new BadRequestError('Invalid user ID format');
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        department: true,
        academicYear: true,
        skills: true,
        interests: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Student profile not found');
    }

    res.json({
      user: {
        id: user.id,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        department: user.department,
        academicYear: user.academicYear,
        skills: user.skills
          ? user.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        interests: user.interests
          ? user.interests.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});
