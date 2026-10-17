import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { config } from '../src/config';

const app = createApp();

const validExplanation = {
  summary:
    'The issue asks for a clearer error message when a profile update fails. A newcomer could investigate where the message is produced.',
  difficulty: 'beginner' as const,
  prerequisites: ['Basic TypeScript and Express familiarity'],
  suggestedSteps: [
    'Read the issue carefully and note what behavior is expected.',
    'Ask the maintainer where the relevant code lives.',
  ],
  questionsToAskMaintainer: ['Which endpoint or screen shows the incorrect error message?'],
};

const validRequest = {
  title: 'Improve error message for failed profile updates',
  body: 'When a profile update fails, the UI shows a generic error. It would help to say which field caused the problem.',
};

function stubFetch(implementation: ReturnType<typeof vi.fn>) {
  vi.stubGlobal('fetch', implementation);
  return implementation;
}

function mockOllamaContent(content: string) {
  return stubFetch(
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ message: { role: 'assistant', content } }),
    }),
  );
}

describe('POST /api/ai/explain-issue (Local AI Issue Explainer)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('Valid input', () => {
    it('returns a validated beginner-friendly explanation', async () => {
      mockOllamaContent(JSON.stringify(validExplanation));

      const res = await request(app).post('/api/ai/explain-issue').send(validRequest);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(validExplanation);
    });

    it('calls Ollama server-side with a non-streaming chat request and the supplied issue', async () => {
      const fetchMock = mockOllamaContent(JSON.stringify(validExplanation));

      await request(app).post('/api/ai/explain-issue').send(validRequest);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(`${config.ollamaBaseUrl}/api/chat`);
      expect(init.method).toBe('POST');

      const payload = JSON.parse(String(init.body));
      expect(payload.model).toBe(config.ollamaModel);
      expect(payload.stream).toBe(false);
      expect(payload.messages[0].role).toBe('system');
      expect(payload.messages[0].content).toMatch(/untrusted/i);
      expect(payload.messages[0].content).toMatch(/never claim to have inspected files/i);
      expect(payload.messages[0].content).toMatch(/do not invent/i);
      expect(payload.messages[1].role).toBe('user');
      expect(payload.messages[1].content).toContain(validRequest.title);
      expect(payload.messages[1].content).toContain(validRequest.body);
    });

    it('recovers JSON wrapped in markdown fences', async () => {
      mockOllamaContent('```json\n' + JSON.stringify(validExplanation) + '\n```');

      const res = await request(app).post('/api/ai/explain-issue').send(validRequest);

      expect(res.status).toBe(200);
      expect(res.body.summary).toBe(validExplanation.summary);
    });

    it('keeps at most 10 valid items when the model returns more', async () => {
      mockOllamaContent(
        JSON.stringify({
          ...validExplanation,
          suggestedSteps: Array.from({ length: 15 }, (_, i) => `Step ${i + 1}`),
        }),
      );

      const res = await request(app).post('/api/ai/explain-issue').send(validRequest);

      expect(res.status).toBe(200);
      expect(res.body.suggestedSteps).toHaveLength(10);
      expect(res.body.suggestedSteps[0]).toBe('Step 1');
    });

    it('normalizes difficulty casing from the model', async () => {
      mockOllamaContent(JSON.stringify({ ...validExplanation, difficulty: ' BEGINNER ' }));

      const res = await request(app).post('/api/ai/explain-issue').send(validRequest);

      expect(res.status).toBe(200);
      expect(res.body.difficulty).toBe('beginner');
    });
  });

  describe('Invalid input', () => {
    it.each([
      ['missing title', { ...validRequest, title: undefined }, 'title'],
      ['empty title', { ...validRequest, title: '   ' }, 'title'],
      ['missing body', { ...validRequest, body: undefined }, 'body'],
      ['empty body', { ...validRequest, body: '   ' }, 'body'],
      ['title over 200 characters', { ...validRequest, title: 'a'.repeat(201) }, 'title'],
      ['body over 10000 characters', { ...validRequest, body: 'a'.repeat(10001) }, 'body'],
    ])('rejects %s without calling the model', async (_label, payload, field) => {
      const fetchMock = stubFetch(vi.fn());

      const res = await request(app).post('/api/ai/explain-issue').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field })]),
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects unexpected fields', async () => {
      const fetchMock = stubFetch(vi.fn());

      const res = await request(app)
        .post('/api/ai/explain-issue')
        .send({ ...validRequest, model: 'llama3' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('rejects non-string fields and malformed JSON bodies', async () => {
      const fetchMock = stubFetch(vi.fn());

      const nonString = await request(app)
        .post('/api/ai/explain-issue')
        .send({ title: 42, body: validRequest.body });
      expect(nonString.status).toBe(400);
      expect(nonString.body.error.code).toBe('VALIDATION_ERROR');

      const malformed = await request(app)
        .post('/api/ai/explain-issue')
        .set('Content-Type', 'application/json')
        .send('{ "title": "Broken", "body": }');
      expect(malformed.status).toBe(400);
      expect(malformed.body.error.code).toBe('INVALID_JSON');

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('Malformed AI output', () => {
    it('returns HTTP 502 for non-JSON model content', async () => {
      mockOllamaContent('I cannot explain this issue right now.');

      const res = await request(app).post('/api/ai/explain-issue').send(validRequest);

      expect(res.status).toBe(502);
      expect(res.body.error.code).toBe('AI_INVALID_RESPONSE');
      expect(res.body.error.message).not.toMatch(/I cannot explain/);
      expect(res.body.stack).toBeUndefined();
    });

    it('returns HTTP 502 for JSON that does not match the expected shape', async () => {
      mockOllamaContent(
        JSON.stringify({ ...validExplanation, difficulty: 'expert', suggestedSteps: 'read it' }),
      );

      const res = await request(app).post('/api/ai/explain-issue').send(validRequest);

      expect(res.status).toBe(502);
      expect(res.body.error.code).toBe('AI_INVALID_RESPONSE');
    });

    it('returns HTTP 502 when a list item is not a string', async () => {
      mockOllamaContent(
        JSON.stringify({ ...validExplanation, prerequisites: ['ok', { text: 'nope' }] }),
      );

      const res = await request(app).post('/api/ai/explain-issue').send(validRequest);

      expect(res.status).toBe(502);
      expect(res.body.error.code).toBe('AI_INVALID_RESPONSE');
    });

    it('returns HTTP 502 when required fields are missing', async () => {
      mockOllamaContent(JSON.stringify({ summary: 'Only a summary' }));

      const res = await request(app).post('/api/ai/explain-issue').send(validRequest);

      expect(res.status).toBe(502);
      expect(res.body.error.code).toBe('AI_INVALID_RESPONSE');
    });

    it('returns HTTP 502 when the Ollama response has no message content', async () => {
      stubFetch(
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ done: true }),
        }),
      );

      const res = await request(app).post('/api/ai/explain-issue').send(validRequest);

      expect(res.status).toBe(502);
      expect(res.body.error.code).toBe('AI_INVALID_RESPONSE');
    });

    it('returns HTTP 502 when the Ollama response body is not JSON', async () => {
      stubFetch(
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => {
            throw new SyntaxError('Unexpected token < in JSON');
          },
        }),
      );

      const res = await request(app).post('/api/ai/explain-issue').send(validRequest);

      expect(res.status).toBe(502);
      expect(res.body.error.code).toBe('AI_INVALID_RESPONSE');
      expect(res.body.error.message).not.toMatch(/Unexpected token/);
    });
  });

  describe('Ollama unavailable', () => {
    it('returns HTTP 503 with a safe message when the connection fails', async () => {
      stubFetch(
        vi.fn().mockRejectedValue(
          Object.assign(new Error(`connect ECONNREFUSED ${config.ollamaBaseUrl}`), {
            code: 'ECONNREFUSED',
          }),
        ),
      );

      const res = await request(app).post('/api/ai/explain-issue').send(validRequest);

      expect(res.status).toBe(503);
      expect(res.body.error.code).toBe('AI_SERVICE_UNAVAILABLE');
      expect(res.body.error.message).toMatch(/Ollama/i);
      expect(JSON.stringify(res.body)).not.toContain('ECONNREFUSED');
      expect(JSON.stringify(res.body)).not.toContain(config.ollamaBaseUrl);
      expect(res.body.stack).toBeUndefined();
    });

    it('returns HTTP 503 when Ollama responds with an error status', async () => {
      stubFetch(
        vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
          json: async () => ({ error: `model '${config.ollamaModel}' not found` }),
        }),
      );

      const res = await request(app).post('/api/ai/explain-issue').send(validRequest);

      expect(res.status).toBe(503);
      expect(res.body.error.code).toBe('AI_SERVICE_UNAVAILABLE');
      expect(JSON.stringify(res.body)).not.toContain('not found');
    });

    it('returns HTTP 504 when the model call times out', async () => {
      stubFetch(
        vi.fn().mockRejectedValue(
          Object.assign(new Error('This operation was aborted'), { name: 'AbortError' }),
        ),
      );

      const res = await request(app).post('/api/ai/explain-issue').send(validRequest);

      expect(res.status).toBe(504);
      expect(res.body.error.code).toBe('AI_TIMEOUT');
      expect(res.body.stack).toBeUndefined();
    });
  });
});
