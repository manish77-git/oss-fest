import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db';

const app = createApp();

describe('Health and Readiness Probes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/health (Liveness Probe)', () => {
    it('returns HTTP 200 with operational service status', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('campusconnect-backend');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/health/ready (Readiness Probe)', () => {
    it('returns HTTP 200 and connected status when database is reachable', async () => {
      const res = await request(app).get('/api/health/ready');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: 'ready',
        database: 'connected',
      });
    });

    it('returns HTTP 503 and not_ready status when database query fails', async () => {
      // Simulate database failure by mocking $queryRawUnsafe to reject
      vi.spyOn(prisma, '$queryRawUnsafe').mockRejectedValueOnce(
        new Error('Simulated database unreachable'),
      );

      const res = await request(app).get('/api/health/ready');

      expect(res.status).toBe(503);
      expect(res.body).toEqual({
        status: 'not_ready',
        database: 'disconnected',
      });
      // Ensure no sensitive internal error messages or stack traces are leaked
      expect(res.body.error).toBeUndefined();
      expect(res.body.stack).toBeUndefined();
    });
  });
});
