import path from 'path';
import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/error';
import { healthRouter } from './routes/health.routes';
import { authRouter } from './routes/auth.routes';
import { usersRouter } from './routes/users.routes';
import { communitiesRouter } from './routes/communities.routes';
import { channelsRouter } from './routes/channels.routes';
import { messagesRouter } from './routes/messages.routes';
import { aiRouter } from './routes/ai.routes';

function parseCorsOrigins(): boolean | string | string[] {
  if (!config.corsOrigin || config.corsOrigin === '*') {
    return true;
  }
  return config.corsOrigin.split(',').map((origin) => origin.trim());
}

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: parseCorsOrigins(), credentials: true }));
  app.use(express.json({ limit: '64kb' }));
  app.use(express.urlencoded({ extended: true, limit: '64kb' }));

  // Serve Frontend Static Display
  const publicDir = path.join(process.cwd(), 'public');
  app.use(express.static(publicDir));

  // API Routes
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/communities', communitiesRouter);
  app.use('/api/channels', channelsRouter);
  app.use('/api/messages', messagesRouter);
  app.use('/api/ai', aiRouter);

  // 404 & Global Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
