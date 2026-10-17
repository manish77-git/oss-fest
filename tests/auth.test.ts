import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app';
import { prisma } from '../src/db';
import { clearDatabase } from './helpers';

const app = createApp();

describe('Student Registration API (Feature 03)', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register — Successful Registration & Persistence', () => {
    it('creates a database-backed account and returns HTTP 201 with safe response', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          displayName: 'Jane Doe',
          email: 'jane.doe@campus.edu',
          password: 'securePassword123',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Registration successful');
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBeDefined();
      expect(res.body.user.displayName).toBe('Jane Doe');
      expect(res.body.user.email).toBe('jane.doe@campus.edu');
      expect(res.body.user.createdAt).toBeDefined();

      // STRICT SECURITY CHECKS: No tokens, passwords, or hashes in response
      expect(res.body.token).toBeUndefined();
      expect(res.body.user.token).toBeUndefined();
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.user.passwordHash).toBeUndefined();

      // Verify record is truly stored in the database
      const dbUser = await prisma.user.findUnique({
        where: { id: res.body.user.id },
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.email).toBe('jane.doe@campus.edu');
      expect(dbUser?.displayName).toBe('Jane Doe');
    });

    it('stores a hashed password that differs from submitted plaintext and verifies with bcrypt', async () => {
      const rawPassword = 'mySecretPassword999';

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          displayName: 'Alex Security',
          email: 'alex.sec@campus.edu',
          password: rawPassword,
        });

      expect(res.status).toBe(201);

      const dbUser = await prisma.user.findUnique({
        where: { id: res.body.user.id },
      });

      expect(dbUser?.passwordHash).toBeDefined();
      expect(dbUser?.passwordHash).not.toBe(rawPassword);
      expect(dbUser?.passwordHash.startsWith('$2')).toBe(true); // bcrypt prefix

      // Verify bcrypt comparison succeeds with raw password and fails with wrong password
      const isMatch = await bcrypt.compare(rawPassword, dbUser!.passwordHash);
      expect(isMatch).toBe(true);

      const isWrongMatch = await bcrypt.compare('wrongPassword', dbUser!.passwordHash);
      expect(isWrongMatch).toBe(false);
    });

    it('normalizes email addresses by trimming whitespace and converting to lowercase', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          displayName: '  Normalized Student  ',
          email: '   ALICE.Student@CAMPUS.EDU   ',
          password: 'securePassword123',
        });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('alice.student@campus.edu');
      expect(res.body.user.displayName).toBe('Normalized Student');

      const dbUser = await prisma.user.findUnique({
        where: { email: 'alice.student@campus.edu' },
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.email).toBe('alice.student@campus.edu');
      expect(dbUser?.displayName).toBe('Normalized Student');
    });
  });

  describe('POST /api/auth/register — Validation & Input Rejection', () => {
    it('rejects missing required fields (displayName, email, password)', async () => {
      // Missing displayName
      const res1 = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@campus.edu',
          password: 'securePassword123',
        });
      expect(res1.status).toBe(400);
      expect(res1.body.error.code).toBe('VALIDATION_ERROR');

      // Missing email
      const res2 = await request(app)
        .post('/api/auth/register')
        .send({
          displayName: 'Test User',
          password: 'securePassword123',
        });
      expect(res2.status).toBe(400);
      expect(res2.body.error.code).toBe('VALIDATION_ERROR');

      // Missing password
      const res3 = await request(app)
        .post('/api/auth/register')
        .send({
          displayName: 'Test User',
          email: 'test@campus.edu',
        });
      expect(res3.status).toBe(400);
      expect(res3.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects empty or whitespace-only display name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          displayName: '    ',
          email: 'valid@campus.edu',
          password: 'securePassword123',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects display names exceeding maximum length (>60 characters)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          displayName: 'A'.repeat(61),
          email: 'valid@campus.edu',
          password: 'securePassword123',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects invalid email formats', async () => {
      const invalidEmails = ['plainaddress', '@missingusername.com', 'user@.com', 'user@domain..com'];

      for (const email of invalidEmails) {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            displayName: 'Test User',
            email,
            password: 'securePassword123',
          });
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('rejects passwords shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          displayName: 'Short Password User',
          email: 'user@campus.edu',
          password: '1234567', // 7 chars
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects passwords exceeding maximum length (>100 characters)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          displayName: 'Long Password User',
          email: 'user@campus.edu',
          password: 'X'.repeat(101),
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects requests with privileged or unexpected fields (role, passwordHash, id)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          displayName: 'Hacker User',
          email: 'hacker@campus.edu',
          password: 'securePassword123',
          role: 'ADMIN',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('handles malformed JSON payloads gracefully (HTTP 400)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{ "displayName": "Broken", "email": }');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_JSON');
    });
  });

  describe('POST /api/auth/register — Duplicate & Concurrency Handling', () => {
    it('rejects duplicate email addresses with HTTP 409 Conflict', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          displayName: 'Original User',
          email: 'duplicate@campus.edu',
          password: 'securePassword123',
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          displayName: 'Duplicate Attempt',
          email: 'duplicate@campus.edu',
          password: 'differentPassword456',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
      expect(res.body.error.message).toMatch(/already exists/i);
    });

    it('handles concurrent registration requests for the same email gracefully without duplicate accounts', async () => {
      const targetEmail = 'concurrent@campus.edu';

      // Launch multiple simultaneous registration attempts
      const [res1, res2] = await Promise.all([
        request(app).post('/api/auth/register').send({
          displayName: 'Concurrent Runner 1',
          email: targetEmail,
          password: 'password12345',
        }),
        request(app).post('/api/auth/register').send({
          displayName: 'Concurrent Runner 2',
          email: targetEmail,
          password: 'password12345',
        }),
      ]);

      const statuses = [res1.status, res2.status].sort();
      // Exactly one must succeed (201) and one must be rejected (409)
      expect(statuses).toEqual([201, 409]);

      // Exactly one record must exist in the database
      const usersInDb = await prisma.user.findMany({
        where: { email: targetEmail },
      });
      expect(usersInDb.length).toBe(1);
    });
  });

  describe('POST /api/auth/register — Error Handling & Database Failures', () => {
    it('returns a safe HTTP 500 when database operation fails without leaking stack traces or internal details', async () => {
      const origCreate = prisma.user.create;
      (prisma.user as any).create = vi.fn().mockRejectedValueOnce(
        new Error('Database disk error / table corruption'),
      );

      try {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            displayName: 'Fail User',
            email: 'fail@campus.edu',
            password: 'securePassword123',
          });

        expect(res.status).toBe(500);
        expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
        expect(res.body.error.message).toBe('An unexpected internal server error occurred');
        // Must not leak database error message, stack, or internal details
        expect(res.body.error.details).toBeUndefined();
        expect(res.body.stack).toBeUndefined();
      } finally {
        (prisma.user as any).create = origCreate;
      }
    });
  });

  describe('POST /api/auth/login (Feature 04: Login & Authentication)', () => {
    beforeEach(async () => {
      // Register a student for login testing
      await request(app)
        .post('/api/auth/register')
        .send({
          displayName: 'Login Test Student',
          email: 'login.test@campus.edu',
          password: 'correctPassword123',
        });
    });

    it('authenticates a registered student with valid credentials and returns 200 with JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login.test@campus.edu',
          password: 'correctPassword123',
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.tokenType).toBe('Bearer');
      expect(res.body.expiresIn).toBe(1800);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('login.test@campus.edu');
      expect(res.body.user.displayName).toBe('Login Test Student');

      // Security check: passwords and hashes must never appear in response
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.user.passwordHash).toBeUndefined();
      expect(res.body.password).toBeUndefined();
      expect(res.body.passwordHash).toBeUndefined();
    });

    it('issues a JWT access token that can be verified and contains standard claims', async () => {
      const { verifyAccessToken } = await import('../src/services/token.service');
      const jwt = (await import('jsonwebtoken')).default;
      const { config } = await import('../src/config');

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login.test@campus.edu',
          password: 'correctPassword123',
        });

      expect(res.status).toBe(200);
      const token = res.body.accessToken;

      // Verify token cryptographic signature and standard claims using token service
      const verified = verifyAccessToken(token);
      expect(verified.userId).toBe(res.body.user.id);
      expect(verified.email).toBe('login.test@campus.edu');

      // Decode token to verify subject, issuer, audience, and expiration
      const decoded = jwt.decode(token) as Record<string, unknown>;
      expect(decoded.sub).toBe(res.body.user.id);
      expect(decoded.iss).toBe('campusconnect');
      expect(decoded.aud).toBe('campusconnect-api');
      expect(decoded.exp).toBeDefined();
      expect(typeof decoded.exp).toBe('number');

      // Verify token payload does not contain sensitive password or hash
      expect(decoded.password).toBeUndefined();
      expect(decoded.passwordHash).toBeUndefined();
    });

    it('normalizes email during login (trimmed, case-insensitive)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: '   LOGIN.TEST@CAMPUS.EDU   ',
          password: 'correctPassword123',
        });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.user.email).toBe('login.test@campus.edu');
    });

    it('rejects incorrect password with generic 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login.test@campus.edu',
          password: 'wrongPassword999',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('rejects unregistered email with identical generic 401 Unauthorized (enumeration prevention)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unregistered.user@campus.edu',
          password: 'correctPassword123',
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
      // Generic message prevents disclosing account existence
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('rejects missing email or missing password with 400 Bad Request', async () => {
      // Missing password
      const res1 = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login.test@campus.edu' });

      expect(res1.status).toBe(400);
      expect(res1.body.error.code).toBe('VALIDATION_ERROR');

      // Missing email
      const res2 = await request(app)
        .post('/api/auth/login')
        .send({ password: 'correctPassword123' });

      expect(res2.status).toBe(400);
      expect(res2.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects malformed JSON payload with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ "email": "login.test@campus.edu", "password": }');

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_JSON');
    });

    it('rejects unexpected fields with strict validation (HTTP 400)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login.test@campus.edu',
          password: 'correctPassword123',
          rememberMe: true, // Unexpected field
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('handles database failure during login safely with HTTP 500 without false success', async () => {
      const origFindUnique = prisma.user.findUnique;
      (prisma.user as any).findUnique = vi.fn().mockRejectedValueOnce(
        new Error('Database connectivity lost'),
      );

      try {
        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'login.test@campus.edu',
            password: 'correctPassword123',
          });

        expect(res.status).toBe(500);
        expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
        expect(res.body.accessToken).toBeUndefined();
      } finally {
        (prisma.user as any).findUnique = origFindUnique;
      }
    });

    it('enforces rate limiting on excessive login attempts (HTTP 429 Too Many Requests)', async () => {
      const { configureLoginRateLimit, resetLoginRateLimiter } = await import(
        '../src/middleware/rateLimit'
      );

      resetLoginRateLimiter();
      configureLoginRateLimit({ max: 3, windowMs: 60000 });

      try {
        // Send 3 requests (allowed)
        for (let i = 0; i < 3; i++) {
          const res = await request(app)
            .post('/api/auth/login')
            .set('x-test-rate-limit', 'true')
            .send({
              email: 'login.test@campus.edu',
              password: 'wrongPassword',
            });
          expect(res.status).toBe(401);
        }

        // 4th request exceeds threshold -> HTTP 429
        const rateLimitedRes = await request(app)
          .post('/api/auth/login')
          .set('x-test-rate-limit', 'true')
          .send({
            email: 'login.test@campus.edu',
            password: 'wrongPassword',
          });

        expect(rateLimitedRes.status).toBe(429);
        expect(rateLimitedRes.body.error.code).toBe('TOO_MANY_REQUESTS');
        expect(rateLimitedRes.headers['retry-after']).toBeDefined();
      } finally {
        resetLoginRateLimiter();
        configureLoginRateLimit({ max: 10, windowMs: 900000 });
      }
    });

    it('fails safely when JWT configuration is missing', async () => {
      const { config } = await import('../src/config');
      const origSecret = config.jwtSecret;

      try {
        config.jwtSecret = '';

        const res = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'login.test@campus.edu',
            password: 'correctPassword123',
          });

        expect(res.status).toBe(500);
        expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
        expect(res.body.accessToken).toBeUndefined();
      } finally {
        config.jwtSecret = origSecret;
      }
    });
  });

  describe('College Email Domain Matching Logic', () => {
    it('correctly validates domain matching and rejects lookalike domains', async () => {
      const { config } = await import('../src/config');
      const { isAllowedEmailDomain } = await import('../src/schemas');

      const original = [...config.allowedEmailDomains];
      try {
        config.allowedEmailDomains = ['college.edu', 'university.ac.in'];

        expect(isAllowedEmailDomain('student@college.edu')).toBe(true);
        expect(isAllowedEmailDomain('student@cs.college.edu')).toBe(true);
        expect(isAllowedEmailDomain('student@university.ac.in')).toBe(true);

        // Strict rejection of lookalikes
        expect(isAllowedEmailDomain('student@attacker-college.edu')).toBe(false);
        expect(isAllowedEmailDomain('student@fakecollege.edu')).toBe(false);
        expect(isAllowedEmailDomain('student@college.edu.evil.com')).toBe(false);
        expect(isAllowedEmailDomain('student@gmail.com')).toBe(false);
      } finally {
        config.allowedEmailDomains = original;
      }
    });
  });
});
