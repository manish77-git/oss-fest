import { Router, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import { NotFoundError } from '../middleware/error';
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
      throw new NotFoundError('User not found');
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
 */
usersRouter.patch('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = updateUserSchema.parse(req.body);

    const updateData: Record<string, unknown> = {};
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
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
 * Public student profile view, omitting credentials and sensitive account data.
 */
usersRouter.get('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
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
