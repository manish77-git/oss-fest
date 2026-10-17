import { Router, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../middleware/error';
import {
  requireCommunityMember,
  requireCommunityRole,
} from '../middleware/permissions';
import {
  createChannelSchema,
  createCommunitySchema,
  updateMemberRoleSchema,
} from '../schemas';
import { AuthenticatedRequest } from '../types';

export const communitiesRouter = Router();

/**
 * POST /api/communities
 * Creates a new community. The creator is automatically assigned the OWNER role.
 */
communitiesRouter.post('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createCommunitySchema.parse(req.body);

    const existing = await prisma.community.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictError(`A community with the name "${data.name}" already exists`);
    }

    // Create community, assign owner role, and create default general channel in a transaction
    const community = await prisma.$transaction(async (tx) => {
      const newCommunity = await tx.community.create({
        data: {
          name: data.name,
          description: data.description || '',
          creatorId: req.user!.id,
        },
      });

      await tx.communityMember.create({
        data: {
          communityId: newCommunity.id,
          userId: req.user!.id,
          role: 'OWNER',
        },
      });

      // Automatically create a default general text channel
      await tx.channel.create({
        data: {
          communityId: newCommunity.id,
          name: 'general',
          description: 'General community discussion',
          type: 'GENERAL',
        },
      });

      return newCommunity;
    });

    res.status(201).json({
      message: 'Community created successfully',
      community: {
        id: community.id,
        name: community.name,
        description: community.description,
        creatorId: community.creatorId,
        createdAt: community.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/communities
 * Lists communities with member count, channel count, and membership status.
 */
communitiesRouter.get('/', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const communities = await prisma.community.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, displayName: true },
        },
        _count: {
          select: { members: true, channels: true },
        },
        members: req.user
          ? {
              where: { userId: req.user.id },
              select: { role: true },
            }
          : false,
      },
    });

    const formatted = communities.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      creator: c.creator,
      memberCount: c._count.members,
      channelCount: c._count.channels,
      createdAt: c.createdAt,
      isMember: req.user ? c.members && c.members.length > 0 : false,
      myRole: req.user && c.members && c.members.length > 0 ? c.members[0].role : null,
    }));

    res.json({ communities: formatted });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/communities/:id
 * Retrieves detailed community profile, including channels and member count.
 */
communitiesRouter.get('/:id', optionalAuthenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const community = await prisma.community.findUnique({
      where: { id: req.params.id },
      include: {
        creator: {
          select: { id: true, displayName: true },
        },
        channels: {
          select: { id: true, name: true, description: true, type: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { members: true },
        },
        members: req.user
          ? {
              where: { userId: req.user.id },
              select: { role: true, joinedAt: true },
            }
          : false,
      },
    });

    if (!community) {
      throw new NotFoundError('Community not found');
    }

    res.json({
      community: {
        id: community.id,
        name: community.name,
        description: community.description,
        creator: community.creator,
        memberCount: community._count.members,
        channels: community.channels,
        createdAt: community.createdAt,
        isMember: req.user ? community.members && community.members.length > 0 : false,
        myRole: req.user && community.members && community.members.length > 0 ? community.members[0].role : null,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/communities/:id/join
 * Adds the authenticated student as a MEMBER of the community.
 */
communitiesRouter.post('/:id/join', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const communityId = req.params.id;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      throw new NotFoundError('Community not found');
    }

    const existingMember = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId: req.user!.id,
        },
      },
    });

    if (existingMember) {
      throw new ConflictError('You are already a member of this community');
    }

    const membership = await prisma.communityMember.create({
      data: {
        communityId,
        userId: req.user!.id,
        role: 'MEMBER',
      },
    });

    res.status(200).json({
      message: 'Successfully joined community',
      membership: {
        communityId: membership.communityId,
        userId: membership.userId,
        role: membership.role,
        joinedAt: membership.joinedAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/communities/:id/leave
 * Allows a member to leave a community.
 * Owners cannot leave if they are the sole owner.
 */
communitiesRouter.post('/:id/leave', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const communityId = req.params.id;

    const membership = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId: req.user!.id,
        },
      },
    });

    if (!membership) {
      throw new NotFoundError('You are not a member of this community');
    }

    if (membership.role === 'OWNER') {
      const ownerCount = await prisma.communityMember.count({
        where: { communityId, role: 'OWNER' },
      });

      if (ownerCount <= 1) {
        throw new BadRequestError(
          'Community owner cannot leave without transferring ownership to another member',
        );
      }
    }

    await prisma.communityMember.delete({
      where: {
        communityId_userId: {
          communityId,
          userId: req.user!.id,
        },
      },
    });

    res.json({ message: 'Successfully left community' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/communities/:id/members
 * Lists members of a community. Restricted to community members.
 */
communitiesRouter.get(
  '/:id/members',
  authenticate,
  requireCommunityMember('id'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const members = await prisma.communityMember.findMany({
        where: { communityId: req.params.id },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              department: true,
              academicYear: true,
            },
          },
        },
        orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      });

      res.json({
        members: members.map((m) => ({
          userId: m.userId,
          displayName: m.user.displayName,
          avatarUrl: m.user.avatarUrl,
          department: m.user.department,
          academicYear: m.user.academicYear,
          role: m.role,
          joinedAt: m.joinedAt,
        })),
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * PATCH /api/communities/:id/members/:userId
 * Updates a member's role (MODERATOR or MEMBER). Only the community OWNER can execute this.
 */
communitiesRouter.patch(
  '/:id/members/:userId',
  authenticate,
  requireCommunityMember('id'),
  requireCommunityRole(['OWNER']),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: communityId, userId: targetUserId } = req.params;
      const data = updateMemberRoleSchema.parse(req.body);

      const targetMember = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId,
            userId: targetUserId,
          },
        },
      });

      if (!targetMember) {
        throw new NotFoundError('Target user is not a member of this community');
      }

      if (targetMember.role === 'OWNER') {
        throw new ForbiddenError('Cannot change the role of a community owner');
      }

      const updated = await prisma.communityMember.update({
        where: {
          communityId_userId: {
            communityId,
            userId: targetUserId,
          },
        },
        data: { role: data.role },
      });

      res.json({
        message: 'Member role updated successfully',
        membership: {
          communityId: updated.communityId,
          userId: updated.userId,
          role: updated.role,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * POST /api/communities/:id/channels
 * Creates a new text channel in the community. Requires OWNER or MODERATOR role.
 */
communitiesRouter.post(
  '/:id/channels',
  authenticate,
  requireCommunityMember('id'),
  requireCommunityRole(['OWNER', 'MODERATOR']),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const communityId = req.params.id;
      const data = createChannelSchema.parse(req.body);

      const existingChannel = await prisma.channel.findUnique({
        where: {
          communityId_name: {
            communityId,
            name: data.name,
          },
        },
      });

      if (existingChannel) {
        throw new ConflictError(
          `A channel named "${data.name}" already exists in this community`,
        );
      }

      const channel = await prisma.channel.create({
        data: {
          communityId,
          name: data.name,
          description: data.description || '',
          type: data.type,
        },
      });

      res.status(201).json({
        message: 'Channel created successfully',
        channel: {
          id: channel.id,
          communityId: channel.communityId,
          name: channel.name,
          description: channel.description,
          type: channel.type,
          createdAt: channel.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/communities/:id/channels
 * Lists all channels in the community. Requires community membership.
 */
communitiesRouter.get(
  '/:id/channels',
  authenticate,
  requireCommunityMember('id'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const channels = await prisma.channel.findMany({
        where: { communityId: req.params.id },
        orderBy: { createdAt: 'asc' },
      });

      res.json({ channels });
    } catch (err) {
      next(err);
    }
  },
);
