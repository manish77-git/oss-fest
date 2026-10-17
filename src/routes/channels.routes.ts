import { Router, Response, NextFunction } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import { verifyChannelAccess } from '../middleware/permissions';
import { createMessageSchema, messageQuerySchema } from '../schemas';
import { AuthenticatedRequest } from '../types';

export const channelsRouter = Router();

/**
 * GET /api/channels/:id/messages
 * Retrieves paginated messages in a channel with stable chronological ordering.
 * Enforces community membership check.
 */
channelsRouter.get('/:id/messages', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const channelId = req.params.id;
    await verifyChannelAccess(channelId, req.user!.id);

    const query = messageQuerySchema.parse(req.query);
    const limit = query.limit;
    const cursorId = query.before || query.cursor;

    let cursorMessageDate: Date | undefined;
    if (cursorId) {
      const cursorMessage = await prisma.message.findUnique({
        where: { id: cursorId },
        select: { createdAt: true },
      });
      if (cursorMessage) {
        cursorMessageDate = cursorMessage.createdAt;
      }
    }

    const messages = await prisma.message.findMany({
      where: {
        channelId,
        ...(cursorMessageDate ? { createdAt: { lt: cursorMessageDate } } : {}),
      },
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
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

    const hasMore = messages.length > limit;
    const resultMessages = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? resultMessages[resultMessages.length - 1].id : null;

    // Return in ascending chronological order for chat UI display friendliness
    const formatted = resultMessages.reverse().map((m) => ({
      id: m.id,
      channelId: m.channelId,
      content: m.content,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      author: m.author,
    }));

    res.json({
      messages: formatted,
      pagination: {
        limit,
        hasMore,
        nextCursor,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/channels/:id/messages
 * Sends a message in a channel. Enforces community membership.
 */
channelsRouter.post('/:id/messages', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const channelId = req.params.id;
    await verifyChannelAccess(channelId, req.user!.id);

    const data = createMessageSchema.parse(req.body);

    const message = await prisma.message.create({
      data: {
        channelId,
        authorId: req.user!.id,
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

    res.status(201).json({
      message: 'Message sent successfully',
      data: {
        id: message.id,
        channelId: message.channelId,
        content: message.content,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        author: message.author,
      },
    });
  } catch (err) {
    next(err);
  }
});
