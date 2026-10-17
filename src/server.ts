import http from 'node:http';
import { createApp } from './app';
import { config } from './config';
import { prisma } from './db';

const app = createApp();
const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(
    `[CampusConnect] Server running on http://localhost:${config.port} (${config.env})`,
  );
});

let isShuttingDown = false;

async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`[CampusConnect] ${signal} signal received: closing HTTP server...`);

  server.close(async () => {
    console.log('[CampusConnect] HTTP server closed.');
    try {
      await prisma.$disconnect();
      console.log('[CampusConnect] Database connection disconnected.');
      process.exit(0);
    } catch (err) {
      console.error('[CampusConnect] Error during database disconnect:', err);
      process.exit(1);
    }
  });

  // Force close after 10s timeout
  setTimeout(() => {
    console.error('[CampusConnect] Forcefully shutting down after timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => void gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
