import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db';
import { clearDatabase, createTestUser } from './helpers';

const app = createApp();

describe('Communities API', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/communities', () => {
    it('creates a new community and assigns creator as OWNER with a default general channel', async () => {
      const { token, user } = await createTestUser('1');

      const res = await request(app)
        .post('/api/communities')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Open Source Club',
          description: 'Official college open source development community',
        });

      expect(res.status).toBe(201);
      expect(res.body.community.id).toBeDefined();
      expect(res.body.community.name).toBe('Open Source Club');
      expect(res.body.community.creatorId).toBe(user.id);

      // Verify creator was assigned OWNER role
      const member = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: res.body.community.id,
            userId: user.id,
          },
        },
      });
      expect(member?.role).toBe('OWNER');

      // Verify default general channel was created
      const defaultChannel = await prisma.channel.findFirst({
        where: { communityId: res.body.community.id, name: 'general' },
      });
      expect(defaultChannel).not.toBeNull();
    });

    it('rejects duplicate community names (409 Conflict)', async () => {
      const { token } = await createTestUser('1');

      await request(app)
        .post('/api/communities')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Web Devs' });

      const res = await request(app)
        .post('/api/communities')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Web Devs' });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });

  describe('GET /api/communities & GET /api/communities/:id', () => {
    it('lists all communities with member counts', async () => {
      const { token } = await createTestUser('1');

      await request(app)
        .post('/api/communities')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'AI Society', description: 'Machine learning enthusiasts' });

      const res = await request(app).get('/api/communities');

      expect(res.status).toBe(200);
      expect(res.body.communities.length).toBe(1);
      expect(res.body.communities[0].name).toBe('AI Society');
      expect(res.body.communities[0].memberCount).toBe(1);
      expect(res.body.communities[0].channelCount).toBe(1);
    });

    it('retrieves detailed community profile including channels', async () => {
      const { token } = await createTestUser('1');

      const createRes = await request(app)
        .post('/api/communities')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Robotics Club' });

      const communityId = createRes.body.community.id;

      const res = await request(app).get(`/api/communities/${communityId}`);

      expect(res.status).toBe(200);
      expect(res.body.community.id).toBe(communityId);
      expect(res.body.community.channels.length).toBeGreaterThanOrEqual(1);
      expect(res.body.community.channels[0].name).toBe('general');
    });
  });

  describe('POST /api/communities/:id/join and leave', () => {
    it('allows a student to join a community as MEMBER', async () => {
      const { token: ownerToken } = await createTestUser('owner');
      const { token: studentToken, user: student } = await createTestUser('student');

      const commRes = await request(app)
        .post('/api/communities')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Cybersecurity Guild' });

      const communityId = commRes.body.community.id;

      const joinRes = await request(app)
        .post(`/api/communities/${communityId}/join`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(joinRes.status).toBe(200);
      expect(joinRes.body.membership.role).toBe('MEMBER');

      // Prevent duplicate join
      const dupRes = await request(app)
        .post(`/api/communities/${communityId}/join`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(dupRes.status).toBe(409);
      expect(dupRes.body.error.code).toBe('CONFLICT');

      // Leave community
      const leaveRes = await request(app)
        .post(`/api/communities/${communityId}/leave`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(leaveRes.status).toBe(200);

      // Verify membership removed
      const checkMember = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: { communityId, userId: student.id },
        },
      });
      expect(checkMember).toBeNull();
    });

    it('prevents sole community owner from leaving without transfer', async () => {
      const { token: ownerToken } = await createTestUser('owner');

      const commRes = await request(app)
        .post('/api/communities')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Data Science Club' });

      const communityId = commRes.body.community.id;

      const leaveRes = await request(app)
        .post(`/api/communities/${communityId}/leave`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(leaveRes.status).toBe(400);
      expect(leaveRes.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('PATCH /api/communities/:id/members/:userId', () => {
    it('allows community OWNER to promote a member to MODERATOR', async () => {
      const { token: ownerToken } = await createTestUser('owner');
      const { token: memberToken, user: member } = await createTestUser('member');

      const commRes = await request(app)
        .post('/api/communities')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Mobile Devs' });

      const communityId = commRes.body.community.id;

      // Member joins
      await request(app)
        .post(`/api/communities/${communityId}/join`)
        .set('Authorization', `Bearer ${memberToken}`);

      // Owner promotes member to MODERATOR
      const promoteRes = await request(app)
        .patch(`/api/communities/${communityId}/members/${member.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ role: 'MODERATOR' });

      expect(promoteRes.status).toBe(200);
      expect(promoteRes.body.membership.role).toBe('MODERATOR');
    });

    it('rejects regular members from modifying roles (403 Forbidden)', async () => {
      const { token: ownerToken } = await createTestUser('owner');
      const { token: member1Token, user: member1 } = await createTestUser('m1');
      const { token: member2Token } = await createTestUser('m2');

      const commRes = await request(app)
        .post('/api/communities')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ name: 'Cloud Computing' });

      const communityId = commRes.body.community.id;

      await request(app)
        .post(`/api/communities/${communityId}/join`)
        .set('Authorization', `Bearer ${member1Token}`);
      await request(app)
        .post(`/api/communities/${communityId}/join`)
        .set('Authorization', `Bearer ${member2Token}`);

      // Member 2 tries to promote Member 1
      const res = await request(app)
        .patch(`/api/communities/${communityId}/members/${member1.id}`)
        .set('Authorization', `Bearer ${member2Token}`)
        .send({ role: 'MODERATOR' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });
});
