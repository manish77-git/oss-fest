import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db';
import { clearDatabase, createTestUser } from './helpers';

const app = createApp();

describe('Users & Profiles API', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('GET /api/users/me', () => {
    it('returns authenticated user profile and memberships', async () => {
      const { token, user } = await createTestUser('1');

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(user.id);
      expect(res.body.user.email).toBe(user.email);
      expect(res.body.user.department).toBe('Computer Science');
      expect(res.body.user.memberships).toBeDefined();
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('rejects unauthenticated request (401)', async () => {
      const res = await request(app).get('/api/users/me');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects invalid or corrupted token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-jwt-token');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PATCH /api/users/me', () => {
    it('allows updating permitted profile fields', async () => {
      const { token } = await createTestUser('1');

      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          displayName: 'Updated Name',
          bio: 'Aspiring open source maintainer',
          department: 'Software Engineering',
          academicYear: 'Junior',
          skills: ['Rust', 'Go'],
        });

      expect(res.status).toBe(200);
      expect(res.body.user.displayName).toBe('Updated Name');
      expect(res.body.user.bio).toBe('Aspiring open source maintainer');
      expect(res.body.user.department).toBe('Software Engineering');
      expect(res.body.user.academicYear).toBe('Junior');
      expect(res.body.user.skills).toContain('Rust');
    });
  });

  describe('GET /api/users/:id', () => {
    it('retrieves public profile omitting sensitive details', async () => {
      const { user } = await createTestUser('1');

      const res = await request(app).get(`/api/users/${user.id}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(user.id);
      expect(res.body.user.displayName).toBe(user.displayName);
      expect(res.body.user.department).toBe('Computer Science');
      // Must not expose email or passwordHash on public profile
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('returns 404 for non-existent student ID', async () => {
      const res = await request(app).get('/api/users/non-existent-id');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
