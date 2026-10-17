import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db';
import { clearDatabase, createTestUser } from './helpers';

const app = createApp();

describe('Student Profiles API (Feature 06)', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('GET /api/users/me — Current User Profile', () => {
    it('1. allows an authenticated user to retrieve their own full profile', async () => {
      const { token, user } = await createTestUser('1');

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe(user.id);
      expect(res.body.user.email).toBe(user.email);
      expect(res.body.user.displayName).toBe(user.displayName);
      expect(res.body.user.department).toBe('Computer Science');
      expect(res.body.user.academicYear).toBe('Senior');
      expect(Array.isArray(res.body.user.skills)).toBe(true);
      expect(res.body.user.skills).toEqual(expect.arrayContaining(['TypeScript', 'React', 'Python']));
      expect(Array.isArray(res.body.user.interests)).toBe(true);
      expect(res.body.user.interests).toEqual(expect.arrayContaining(['Open Source', 'Web Development']));
      expect(res.body.user.createdAt).toBeDefined();

      // Password hashes, tokens, or internal secrets must never be exposed
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.user.passwordHash).toBeUndefined();
      expect(res.body.user.token).toBeUndefined();
    });

    it('2. rejects unauthenticated access with HTTP 401', async () => {
      const res = await request(app).get('/api/users/me');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('3. rejects invalid or corrupted bearer tokens with HTTP 401', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer corrupted-or-forged-jwt-token');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('4. ignores client-supplied user ID query or body, returning authenticated user identity only', async () => {
      const { token: token1, user: user1 } = await createTestUser('1');
      const { user: user2 } = await createTestUser('2');

      const res = await request(app)
        .get(`/api/users/me?id=${user2.id}&userId=${user2.id}`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(user1.id);
      expect(res.body.user.id).not.toBe(user2.id);
      expect(res.body.user.email).toBe(user1.email);
    });

    it('5. handles deleted or unavailable accounts safely', async () => {
      const { token, user } = await createTestUser('1');

      // Delete the user from the database
      await prisma.user.delete({ where: { id: user.id } });

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect([401, 404]).toContain(res.status);
    });

    it('6. returns HTTP 500 when database fails during profile retrieval without false success', async () => {
      const { token } = await createTestUser('1');

      // The auth middleware first calls prisma.user.findUnique.
      // We want findUnique in the route handler to throw an error:
      let calls = 0;
      const origFindUnique = prisma.user.findUnique;
      (prisma.user as any).findUnique = vi.fn().mockImplementation((...args: any[]) => {
        calls++;
        if (calls > 1) {
          return Promise.reject(new Error('Simulated database failure'));
        }
        return (origFindUnique as any).apply(prisma.user, args);
      });

      try {
        const res = await request(app)
          .get('/api/users/me')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(500);
        expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
        expect(res.body.user).toBeUndefined();
      } finally {
        (prisma.user as any).findUnique = origFindUnique;
      }
    });
  });

  describe('PATCH /api/users/me — Profile Updates', () => {
    it('1. allows updating permitted profile fields', async () => {
      const { token } = await createTestUser('1');

      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          displayName: 'Updated Name',
          avatarUrl: 'https://cdn.example.com/avatars/student1.png',
          bio: 'Junior CS student passionate about distributed systems and open source.',
          department: 'Software Engineering',
          academicYear: 'Junior',
          skills: ['Rust', 'Go', 'Docker'],
          interests: ['Distributed Systems', 'Cloud Native'],
        });

      expect(res.status).toBe(200);
      expect(res.body.user.displayName).toBe('Updated Name');
      expect(res.body.user.avatarUrl).toBe('https://cdn.example.com/avatars/student1.png');
      expect(res.body.user.bio).toBe('Junior CS student passionate about distributed systems and open source.');
      expect(res.body.user.department).toBe('Software Engineering');
      expect(res.body.user.academicYear).toBe('Junior');
      expect(res.body.user.skills).toEqual(expect.arrayContaining(['Rust', 'Go', 'Docker']));
      expect(res.body.user.interests).toEqual(expect.arrayContaining(['Distributed Systems', 'Cloud Native']));
      // Passwords and secrets must not be returned
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('2. supports partial updates and preserves unsupplied fields', async () => {
      const { token, user } = await createTestUser('1');

      // Update only bio and department
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bio: 'Updated bio only',
          department: 'Data Science',
        });

      expect(res.status).toBe(200);
      expect(res.body.user.bio).toBe('Updated bio only');
      expect(res.body.user.department).toBe('Data Science');
      // Preserves original displayName, email, academicYear, skills
      expect(res.body.user.displayName).toBe(user.displayName);
      expect(res.body.user.email).toBe(user.email);
      expect(res.body.user.academicYear).toBe('Senior');
      expect(res.body.user.skills).toEqual(expect.arrayContaining(['TypeScript', 'React', 'Python']));
    });

    it('3. rejects empty update payloads with HTTP 400', async () => {
      const { token } = await createTestUser('1');

      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(['BAD_REQUEST', 'VALIDATION_ERROR']).toContain(res.body.error.code);
    });

    it('4. rejects empty or whitespace-only display names', async () => {
      const { token } = await createTestUser('1');

      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ displayName: '    ' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('5. rejects invalid avatar URLs (non-url, ftp protocol, or invalid format)', async () => {
      const { token } = await createTestUser('1');

      // Invalid format
      const res1 = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ avatarUrl: 'not-a-valid-url' });

      expect(res1.status).toBe(400);
      expect(res1.body.error.code).toBe('VALIDATION_ERROR');

      // Non-HTTP/HTTPS protocol (FTP)
      const res2 = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ avatarUrl: 'ftp://files.example.com/avatar.jpg' });

      expect(res2.status).toBe(400);
      expect(res2.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('6. rejects invalid academic year values', async () => {
      const { token } = await createTestUser('1');

      // Out of range numeric year (e.g. 99)
      const res1 = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ academicYear: 99 });

      expect(res1.status).toBe(400);
      expect(res1.body.error.code).toBe('VALIDATION_ERROR');

      // Empty string
      const res2 = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ academicYear: '   ' });

      expect(res2.status).toBe(400);
      expect(res2.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('7. accepts valid numeric academic years and converts properly', async () => {
      const { token } = await createTestUser('1');

      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ academicYear: 3 });

      expect(res.status).toBe(200);
      expect(res.body.user.academicYear).toBe('3');
    });

    it('8. rejects invalid skill and interest lists', async () => {
      const { token } = await createTestUser('1');

      // Non-array skills
      const res1 = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ skills: 'invalid-string-instead-of-array' });

      expect(res1.status).toBe(400);
      expect(res1.body.error.code).toBe('VALIDATION_ERROR');

      // Array containing empty item
      const res2 = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ skills: ['Valid Skill', '   '] });

      expect(res2.status).toBe(400);
      expect(res2.body.error.code).toBe('VALIDATION_ERROR');

      // Non-array interests
      const res3 = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ interests: 12345 });

      expect(res3.status).toBe(400);
      expect(res3.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('9. strictly rejects attempts to modify protected fields (email, id, passwordHash, role, createdAt)', async () => {
      const { token } = await createTestUser('1');

      // Attempt to change email
      const resEmail = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'hacker@malicious.com' });

      expect(resEmail.status).toBe(400);
      expect(resEmail.body.error.code).toBe('VALIDATION_ERROR');

      // Attempt to change passwordHash
      const resHash = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ passwordHash: 'tampered-hash' });

      expect(resHash.status).toBe(400);
      expect(resHash.body.error.code).toBe('VALIDATION_ERROR');

      // Attempt to inject role or id
      const resRole = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'admin', id: 'fake-id' });

      expect(resRole.status).toBe(400);
      expect(resRole.body.error.code).toBe('VALIDATION_ERROR');
    });

    it("10. makes it impossible to modify another user's profile through the update endpoint", async () => {
      const { token: student1Token, user: student1 } = await createTestUser('1');
      const { user: student2 } = await createTestUser('2');

      // Student 1 attempts to pass Student 2's ID in the body
      const res = await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          displayName: 'Hacked Name',
          userId: student2.id,
        });

      // The request is rejected due to strict schema rejecting 'userId'
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');

      // Verify Student 2's data in the database was not touched
      const refreshedStudent2 = await prisma.user.findUnique({ where: { id: student2.id } });
      expect(refreshedStudent2?.displayName).toBe(student2.displayName);
      expect(refreshedStudent2?.displayName).not.toBe('Hacked Name');
    });

    it('11. handles database failure during profile update safely without false success', async () => {
      const { token } = await createTestUser('1');

      const origUpdate = prisma.user.update;
      (prisma.user as any).update = vi.fn().mockRejectedValueOnce(
        new Error('Database write failure'),
      );

      try {
        const res = await request(app)
          .patch('/api/users/me')
          .set('Authorization', `Bearer ${token}`)
          .send({ displayName: 'New Name' });

        expect(res.status).toBe(500);
        expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
        expect(res.body.user).toBeUndefined();
      } finally {
        (prisma.user as any).update = origUpdate;
      }
    });
  });

  describe('GET /api/users/:id — Public Profile Viewing', () => {
    it('1. retrieves public profile omitting sensitive details (email, passwordHash)', async () => {
      const { user } = await createTestUser('1');

      // Notice: No Authorization header required (public profile)
      const res = await request(app).get(`/api/users/${user.id}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe(user.id);
      expect(res.body.user.displayName).toBe(user.displayName);
      expect(res.body.user.department).toBe(user.department);
      expect(res.body.user.academicYear).toBe(user.academicYear);
      expect(Array.isArray(res.body.user.skills)).toBe(true);
      expect(res.body.user.skills).toEqual(expect.arrayContaining(['TypeScript', 'React', 'Python']));
      expect(Array.isArray(res.body.user.interests)).toBe(true);
      expect(res.body.user.interests).toEqual(expect.arrayContaining(['Open Source', 'Web Development']));
      expect(res.body.user.createdAt).toBeDefined();

      // STRICT PRIVACY: Private account data must NEVER be exposed publicly
      expect(res.body.user.email).toBeUndefined();
      expect(res.body.user.passwordHash).toBeUndefined();
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.user.token).toBeUndefined();
    });

    it('2. returns HTTP 404 for nonexistent student ID', async () => {
      const res = await request(app).get('/api/users/non-existent-user-id');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.user).toBeUndefined();
    });

    it('3. rejects invalid student ID formats with HTTP 400', async () => {
      const res = await request(app).get('/api/users/invalid@id!special#chars');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toMatch(/invalid user id format/i);
    });

    it('4. returns HTTP 500 when database fails during public profile retrieval', async () => {
      const { user } = await createTestUser('1');

      const origFindUnique = prisma.user.findUnique;
      (prisma.user as any).findUnique = vi.fn().mockRejectedValueOnce(
        new Error('Database read failure'),
      );

      try {
        const res = await request(app).get(`/api/users/${user.id}`);

        expect(res.status).toBe(500);
        expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
        expect(res.body.user).toBeUndefined();
      } finally {
        (prisma.user as any).findUnique = origFindUnique;
      }
    });

    it('5. public profile retrieval is strictly read-only and does not mutate user data', async () => {
      const { user } = await createTestUser('1');

      const res = await request(app).get(`/api/users/${user.id}`);
      expect(res.status).toBe(200);

      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      expect(dbUser?.displayName).toBe(user.displayName);
      expect(dbUser?.department).toBe(user.department);
      expect(dbUser?.email).toBe(user.email);
    });
  });
});
