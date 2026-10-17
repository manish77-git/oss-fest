import { Router, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import { ForbiddenError, NotFoundError } from '../middleware/error';
import { updateMessageSchema } from '../schemas';
import { AuthenticatedRequest } from '../types';

export const messagesRouter = Router();

/**
 * PATCH /api/messages/:id
 * Edits a message. Only the original author can edit their own message.
 */
messagesRouter.patch('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const messageId = req.params.id;
    const data = updateMessageSchema.parse(req.body);

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.authorId !== req.user!.id) {
      throw new ForbiddenError('You can only edit your own messages');
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: data.content,
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            department: true,
          },
        },
      },
    });

    res.json({
      message: 'Message updated successfully',
      data: {
        id: updated.id,
        channelId: updated.channelId,
        content: updated.content,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        author: updated.author,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/messages/:id
 * Deletes a message. Permitted for the original author OR community moderators/owners.
 */
messagesRouter.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const messageId = req.params.id;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        channel: {
          select: { communityId: true },
        },
      },
    });

    if (!message) {
      throw new NotFoundError('Message not found');
    }

    const isAuthor = message.authorId === req.user!.id;

    if (!isAuthor) {
      // Check if user is an OWNER or MODERATOR of the community
      const membership = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: message.channel.communityId,
            userId: req.user!.id,
          },
        },
      });

      const isModeratorOrOwner =
        membership && (membership.role === 'OWNER' || membership.role === 'MODERATOR');

      if (!isModeratorOrOwner) {
        throw new ForbiddenError('You do not have permission to delete this message');
      }
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    next(err);
  }
});
