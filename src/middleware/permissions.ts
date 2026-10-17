import { Response, NextFunction } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest, CommunityRole } from '../types';
import { ForbiddenError, NotFoundError, UnauthorizedError } from './error';

/**
 * Middleware ensuring the authenticated user is an active member of the community.
 * Looks for community ID in `req.params.communityId` or `req.params.id`.
 */
export function requireCommunityMember(paramName: 'id' | 'communityId' = 'id') {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const communityId = req.params[paramName];
      if (!communityId) {
        throw new NotFoundError('Community identifier is missing');
      }

      // Check community exists
      const community = await prisma.community.findUnique({
        where: { id: communityId },
        select: { id: true },
      });

      if (!community) {
        throw new NotFoundError('Community not found');
      }

      const membership = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId,
            userId: req.user.id,
          },
        },
      });

      if (!membership) {
        throw new ForbiddenError('You must be a member of this community to perform this action');
      }

      req.communityMembership = {
        communityId,
        userId: req.user.id,
        role: membership.role as CommunityRole,
      };

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Middleware ensuring the member holds one of the required roles in the community.
 */
export function requireCommunityRole(allowedRoles: CommunityRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.communityMembership) {
      return next(new ForbiddenError('Community membership context is required'));
    }

    if (!allowedRoles.includes(req.communityMembership.role)) {
      return next(
        new ForbiddenError(
          `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        ),
      );
    }

    next();
  };
}

/**
 * Verifies channel existence and ensures the authenticated user is a member of the parent community.
 */
export async function verifyChannelAccess(
  channelId: string,
  userId: string,
): Promise<{ channel: { id: string; communityId: string; name: string }; membership: { role: CommunityRole } }> {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: { id: true, communityId: true, name: true },
  });

  if (!channel) {
    throw new NotFoundError('Channel not found');
  }

  const membership = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: {
        communityId: channel.communityId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new ForbiddenError('You must be a member of the community to access this channel');
  }

  return {
    channel,
    membership: {
      role: membership.role as CommunityRole,
    },
  };
}
