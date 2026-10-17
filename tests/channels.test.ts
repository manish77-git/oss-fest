import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db';
import { clearDatabase, createTestUser } from './helpers';

const app = createApp();

describe('Channels API', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('allows community OWNER or MODERATOR to create a channel', async () => {
    const { token: ownerToken } = await createTestUser('owner');

    const commRes = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Game Dev Club' });

    const communityId = commRes.body.community.id;

    const channelRes = await request(app)
      .post(`/api/communities/${communityId}/channels`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: 'unity-showcase',
        description: 'Show off your Unity game demos',
        type: 'PROJECT_DISCUSSION',
      });

    expect(channelRes.status).toBe(201);
    expect(channelRes.body.channel.name).toBe('unity-showcase');
    expect(channelRes.body.channel.type).toBe('PROJECT_DISCUSSION');
  });

  it('rejects regular members from creating channels (403 Forbidden)', async () => {
    const { token: ownerToken } = await createTestUser('owner');
    const { token: memberToken } = await createTestUser('member');

    const commRes = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Algorithmic Trading' });

    const communityId = commRes.body.community.id;

    await request(app)
      .post(`/api/communities/${communityId}/join`)
      .set('Authorization', `Bearer ${memberToken}`);

    const res = await request(app)
      .post(`/api/communities/${communityId}/channels`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ name: 'crypto-chat' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('prevents duplicate channel names within the same community (409 Conflict)', async () => {
    const { token: ownerToken } = await createTestUser('owner');

    const commRes = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Hardware Enthusiasts' });

    const communityId = commRes.body.community.id;

    // 'general' is already created by default on community creation
    const res = await request(app)
      .post(`/api/communities/${communityId}/channels`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'general' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('rejects non-members from listing community channels (403 Forbidden)', async () => {
    const { token: ownerToken } = await createTestUser('owner');
    const { token: outsiderToken } = await createTestUser('outsider');

    const commRes = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Private Research Lab' });

    const communityId = commRes.body.community.id;

    const res = await request(app)
      .get(`/api/communities/${communityId}/channels`)
      .set('Authorization', `Bearer ${outsiderToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
