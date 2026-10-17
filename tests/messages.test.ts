import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db';
import { clearDatabase, createTestUser } from './helpers';

const app = createApp();

describe('Messages API', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  async function setupCommunityAndChannel() {
    const { token: ownerToken, user: owner } = await createTestUser('owner');
    const { token: memberToken, user: member } = await createTestUser('member');
    const { token: outsiderToken, user: outsider } = await createTestUser('outsider');

    const commRes = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Web3 Builders' });

    const communityId = commRes.body.community.id;

    // Member joins community
    await request(app)
      .post(`/api/communities/${communityId}/join`)
      .set('Authorization', `Bearer ${memberToken}`);

    // Fetch the default 'general' channel
    const channel = await prisma.channel.findFirstOrThrow({
      where: { communityId, name: 'general' },
    });

    return {
      communityId,
      channelId: channel.id,
      owner,
      ownerToken,
      member,
      memberToken,
      outsider,
      outsiderToken,
    };
  }

  describe('POST /api/channels/:id/messages', () => {
    it('allows community members to send messages in a channel', async () => {
      const { channelId, memberToken, member } = await setupCommunityAndChannel();

      const res = await request(app)
        .post(`/api/channels/${channelId}/messages`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ content: 'Hello everyone! Excited to contribute.' });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.content).toBe('Hello everyone! Excited to contribute.');
      expect(res.body.data.author.id).toBe(member.id);
    });

    it('rejects empty or whitespace-only messages', async () => {
      const { channelId, memberToken } = await setupCommunityAndChannel();

      const res = await request(app)
        .post(`/api/channels/${channelId}/messages`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ content: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects messages longer than 4000 characters', async () => {
      const { channelId, memberToken } = await setupCommunityAndChannel();

      const longContent = 'A'.repeat(4001);
      const res = await request(app)
        .post(`/api/channels/${channelId}/messages`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ content: longContent });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects non-community members from sending messages (403 Forbidden)', async () => {
      const { channelId, outsiderToken } = await setupCommunityAndChannel();

      const res = await request(app)
        .post(`/api/channels/${channelId}/messages`)
        .set('Authorization', `Bearer ${outsiderToken}`)
        .send({ content: 'I am not a member' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/channels/:id/messages', () => {
    it('returns paginated messages for community members', async () => {
      const { channelId, memberToken } = await setupCommunityAndChannel();

      // Create 3 messages
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post(`/api/channels/${channelId}/messages`)
          .set('Authorization', `Bearer ${memberToken}`)
          .send({ content: `Message number ${i}` });
      }

      const res = await request(app)
        .get(`/api/channels/${channelId}/messages?limit=2`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.messages.length).toBe(2);
      expect(res.body.pagination.hasMore).toBe(true);
      expect(res.body.pagination.nextCursor).toBeDefined();
    });
  });

  describe('PATCH /api/messages/:id', () => {
    it('allows authors to edit their own message', async () => {
      const { channelId, memberToken } = await setupCommunityAndChannel();

      const createRes = await request(app)
        .post(`/api/channels/${channelId}/messages`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ content: 'Original typo message' });

      const messageId = createRes.body.data.id;

      const editRes = await request(app)
        .patch(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ content: 'Fixed message content' });

      expect(editRes.status).toBe(200);
      expect(editRes.body.data.content).toBe('Fixed message content');
    });

    it('rejects non-authors from editing messages (403 Forbidden)', async () => {
      const { channelId, memberToken, ownerToken } = await setupCommunityAndChannel();

      const createRes = await request(app)
        .post(`/api/channels/${channelId}/messages`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ content: 'Member original message' });

      const messageId = createRes.body.data.id;

      // Owner cannot edit another user's message
      const res = await request(app)
        .patch(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ content: 'Owner trying to hijack message' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('DELETE /api/messages/:id', () => {
    it('allows authors to delete their own message', async () => {
      const { channelId, memberToken } = await setupCommunityAndChannel();

      const createRes = await request(app)
        .post(`/api/channels/${channelId}/messages`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ content: 'Message to delete' });

      const messageId = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(deleteRes.status).toBe(200);

      const check = await prisma.message.findUnique({ where: { id: messageId } });
      expect(check).toBeNull();
    });

    it('allows community OWNER/MODERATOR to delete inappropriate messages from members', async () => {
      const { channelId, memberToken, ownerToken } = await setupCommunityAndChannel();

      const createRes = await request(app)
        .post(`/api/channels/${channelId}/messages`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ content: 'Spam message' });

      const messageId = createRes.body.data.id;

      // Owner deletes spam message
      const deleteRes = await request(app)
        .delete(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toBe('Message deleted successfully');
    });

    it('rejects non-moderator members from deleting others messages (403 Forbidden)', async () => {
      const { channelId, memberToken } = await setupCommunityAndChannel();
      const { token: otherMemberToken } = await createTestUser('otherMember');

      const createRes = await request(app)
        .post(`/api/channels/${channelId}/messages`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ content: 'Member message' });

      const messageId = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${otherMemberToken}`);

      expect(deleteRes.status).toBe(403);
      expect(deleteRes.body.error.code).toBe('FORBIDDEN');
    });
  });
});
