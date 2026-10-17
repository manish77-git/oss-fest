import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import { prisma } from '../src/db';
import { clearDatabase } from './helpers';
import { config } from '../src/config';
import { TOKEN_ISSUER, TOKEN_AUDIENCE } from '../src/services/token.service';

const app = createApp();

describe('Authentication Middleware (Feature 05)', () => {
  beforeEach(async () => {
    await clearDatabase();
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  async function registerAndLoginTestStudent() {
    await request(app).post('/api/auth/register').send({
      displayName: 'Protected Test Student',
      email: 'protected.student@campus.edu',
      password: 'password12345',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'protected.student@campus.edu',
      password: 'password12345',
    });

    return {
      token: loginRes.body.accessToken,
      userId: loginRes.body.user.id,
      email: loginRes.body.user.email,
    };
  }

  describe('1. Missing Credentials Rejection', () => {
    it('rejects a request with no Authorization header (HTTP 401)', async () => {
      const res = await request(app).get('/api/auth/session');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toMatch(/missing/i);
    });
  });

  describe('2. Malformed Authorization Headers Rejection', () => {
    it('rejects headers not using the Bearer scheme (e.g. Basic, Token)', async () => {
      const schemes = ['Basic dXNlcjpwYXNz', 'Token some-token', 'CustomAuth abc'];

      for (const authHeader of schemes) {
        const res = await request(app)
          .get('/api/auth/session')
          .set('Authorization', authHeader);

        expect(res.status).toBe(401);
        expect(res.body.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('rejects an empty Bearer token or bare Bearer string without token', async () => {
      const emptyHeaders = ['Bearer', 'Bearer ', 'Bearer    '];

      for (const authHeader of emptyHeaders) {
        const res = await request(app)
          .get('/api/auth/session')
          .set('Authorization', authHeader);

        expect(res.status).toBe(401);
        expect(res.body.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('strictly rejects access tokens passed via query parameters', async () => {
      const { token } = await registerAndLoginTestStudent();

      const res = await request(app).get(`/api/auth/session?token=${token}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('3 & 5. Invalid Signature & Corrupted Tokens Rejection', () => {
    it('rejects a token signed with an invalid/different secret', async () => {
      const { userId } = await registerAndLoginTestStudent();

      const fakeToken = jwt.sign(
        { sub: userId, email: 'fake@campus.edu', iss: TOKEN_ISSUER, aud: TOKEN_AUDIENCE },
        'wrong-attacker-secret-key-that-does-not-match',
        { algorithm: 'HS256', expiresIn: 1800 },
      );

      const res = await request(app)
        .get('/api/auth/session')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects corrupted or random string tokens', async () => {
      const res = await request(app)
        .get('/api/auth/session')
        .set('Authorization', 'Bearer not-a-valid-jwt.token.structure');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('4. Expired Token Rejection', () => {
    it('rejects an expired JWT token (HTTP 401)', async () => {
      const { userId } = await registerAndLoginTestStudent();

      // Create an expired token (expired 10 seconds ago)
      const expiredToken = jwt.sign(
        { sub: userId, email: 'protected.student@campus.edu', iss: TOKEN_ISSUER, aud: TOKEN_AUDIENCE },
        config.jwtSecret,
        { algorithm: 'HS256', expiresIn: -10 },
      );

      const res = await request(app)
        .get('/api/auth/session')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toMatch(/expired/i);
    });
  });

  describe('6. Invalid Claims (Issuer / Audience) Rejection', () => {
    it('rejects tokens with an invalid issuer claim', async () => {
      const { userId } = await registerAndLoginTestStudent();

      const invalidIssuerToken = jwt.sign(
        { sub: userId, email: 'protected.student@campus.edu', iss: 'wrong-issuer', aud: TOKEN_AUDIENCE },
        config.jwtSecret,
        { algorithm: 'HS256', expiresIn: 1800 },
      );

      const res = await request(app)
        .get('/api/auth/session')
        .set('Authorization', `Bearer ${invalidIssuerToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects tokens with an invalid audience claim', async () => {
      const { userId } = await registerAndLoginTestStudent();

      const invalidAudienceToken = jwt.sign(
        { sub: userId, email: 'protected.student@campus.edu', iss: TOKEN_ISSUER, aud: 'wrong-audience' },
        config.jwtSecret,
        { algorithm: 'HS256', expiresIn: 1800 },
      );

      const res = await request(app)
        .get('/api/auth/session')
        .set('Authorization', `Bearer ${invalidAudienceToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('7 & 8. Successful Authentication & Identity Attachment', () => {
    it('allows a valid login token to reach the protected endpoint and returns the authenticated user ID', async () => {
      const { token, userId, email } = await registerAndLoginTestStudent();

      const res = await request(app)
        .get('/api/auth/session')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('authenticated');
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe(userId);
      expect(res.body.user.email).toBe(email);

      // Sensitive fields must never be exposed
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.user.passwordHash).toBeUndefined();
      expect(res.body.secret).toBeUndefined();
    });
  });

  describe('9. Account Existence Verification', () => {
    it('rejects access if the user account was deleted after the token was issued', async () => {
      const { token, userId } = await registerAndLoginTestStudent();

      // Delete the student account from the database
      await prisma.user.delete({
        where: { id: userId },
      });

      const res = await request(app)
        .get('/api/auth/session')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toMatch(/not found or invalid/i);
    });
  });

  describe('10. Database Failure Safety', () => {
    it('returns HTTP 500 when database fails during user lookup without false success or token leakage', async () => {
      const { token } = await registerAndLoginTestStudent();

      const origFindUnique = prisma.user.findUnique;
      (prisma.user as any).findUnique = vi.fn().mockRejectedValueOnce(
        new Error('Database connectivity failure'),
      );

      try {
        const res = await request(app)
          .get('/api/auth/session')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(500);
        expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
        // Must never leak stack traces or error message
        expect(res.body.status).toBeUndefined();
        expect(res.body.stack).toBeUndefined();
        expect(res.body.error.details).toBeUndefined();
      } finally {
        (prisma.user as any).findUnique = origFindUnique;
      }
    });
  });

  describe('11. Public Endpoints Remain Accessible Without Authentication', () => {
    it('confirms GET /api/health and GET /api/health/ready are public without Authorization header', async () => {
      const healthRes = await request(app).get('/api/health');
      expect(healthRes.status).toBe(200);
      expect(healthRes.body.status).toBe('ok');

      const readyRes = await request(app).get('/api/health/ready');
      expect(readyRes.status).toBe(200);
      expect(readyRes.body.status).toBe('ready');
      expect(readyRes.body.database).toBe('connected');
    });

    it('confirms POST /api/auth/register and POST /api/auth/login are public', async () => {
      const regRes = await request(app).post('/api/auth/register').send({
        displayName: 'Public Student',
        email: 'public.student@campus.edu',
        password: 'password12345',
      });
      expect(regRes.status).toBe(201);

      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'public.student@campus.edu',
        password: 'password12345',
      });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.accessToken).toBeDefined();
    });
  });
});
