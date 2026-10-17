import { Router, Request, Response } from 'express';
import { prisma } from '../db';

export const healthRouter = Router();

/**
 * GET /api/health
 * Basic liveness check: verifies the backend application process is running.
 */
healthRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'campusconnect-backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

/**
 * GET /api/health/ready
 * Readiness check: executes a lightweight database query (SELECT 1) to verify real connectivity.
 * Returns HTTP 200 when connected, or HTTP 503 when the database is unreachable.
 * Never exposes passwords, connection URLs, stack traces, or internal error details.
 */
healthRouter.get('/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    res.status(200).json({
      status: 'ready',
      database: 'connected',
    });
  } catch {
    res.status(503).json({
      status: 'not_ready',
      database: 'disconnected',
    });
  }
});
