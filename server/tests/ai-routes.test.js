import { test, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-1234';
process.env.GROQ_API_KEY = 'test-key';

let app;
let token;
const realFetch = globalThis.fetch;
const groqCalls = [];

// Replaces only calls to Groq; everything else (app.inject) never uses fetch.
const mockGroq = (handler) => {
  globalThis.fetch = async (url, init) => {
    groqCalls.push({ url: String(url), init });
    return handler(String(url), init);
  };
};
const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

before(async () => {
  const { default: buildApp } = await import('../src/app.js');
  app = await buildApp({ logger: false });
  await app.ready();
  token = app.jwt.sign({ id: 'u1', role: 'user', email: 'a@b.co' });
});
afterEach(() => { globalThis.fetch = realFetch; groqCalls.length = 0; });
after(async () => { await app.close(); });

const headers = () => ({ authorization: `Bearer ${token}` });
const longText = Array.from({ length: 160 }, (_, i) => `word${i}`).join(' ') + '.';

test('AI routes require authentication', async () => {
  const res = await app.inject({ method: 'POST', url: '/api/ai/evaluate', payload: { transcript: 'hi' } });
  assert.equal(res.statusCode, 401);
});

test('short transcripts are not sent to the model and return no score', async () => {
  mockGroq(() => { throw new Error('should not be called'); });
  const res = await app.inject({ method: 'POST', url: '/api/ai/evaluate', headers: headers(), payload: { transcript: 'Just a few words here.' } });
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().fluency.score, null);
  assert.equal(groqCalls.length, 0);
});

test('evaluate calls the eval model with strict json_schema and returns score, range and notice', async () => {
  mockGroq(() => json({
    choices: [{ message: { content: JSON.stringify({
      structure: 72, structureEvidence: 'word10 word11 word12', relevance: 80, relevanceEvidence: 'word40 word41',
      strengths: ['Clear start'], improvement: 'Add a number to the result.',
      star: { situation: true, task: true, action: true, result: false },
    }) } }],
  }));
  const res = await app.inject({ method: 'POST', url: '/api/ai/evaluate', headers: headers(), payload: { transcript: longText, durationSec: 60, question: 'Tell me about a challenge', mode: 'interview' } });
  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.equal(body.feedback.improvement, 'Add a number to the result.');
  assert.ok(body.fluency.score >= 0 && body.fluency.range.length === 2);
  assert.match(body.notice, /not a clinical, exam or hiring assessment/);

  const sent = JSON.parse(groqCalls[0].init.body);
  assert.equal(sent.model, 'openai/gpt-oss-120b');
  assert.equal(sent.response_format.type, 'json_schema');
  assert.equal(sent.response_format.json_schema.strict, true);
  assert.equal(sent.temperature, 0);
  assert.match(groqCalls[0].init.headers.authorization, /^Bearer test-key$/);
});

test('a quote that is not in the transcript marks the judgement unverified and lowers confidence', async () => {
  const reply = (evidence) => json({
    choices: [{ message: { content: JSON.stringify({
      structure: 80, structureEvidence: evidence, relevance: 80, relevanceEvidence: evidence,
      strengths: [], improvement: 'x', star: { situation: true, task: true, action: true, result: true },
    }) } }],
  });
  const send = () => app.inject({ method: 'POST', url: '/api/ai/evaluate', headers: headers(), payload: { transcript: longText, durationSec: 60, question: 'Q?' } });

  mockGroq(() => reply('word10 word11 word12'));
  const good = (await send()).json();
  assert.equal(good.feedback.evidenceVerified, true);

  mockGroq(() => reply('this sentence was never spoken'));
  const bad = (await send()).json();
  assert.equal(bad.feedback.evidenceVerified, false);
  assert.ok(bad.fluency.margin > good.fluency.margin);
});

test('when Groq fails, measured metrics are still returned and marked degraded', async () => {
  mockGroq(() => new Response('boom', { status: 500 }));
  const res = await app.inject({ method: 'POST', url: '/api/ai/evaluate', headers: headers(), payload: { transcript: longText, durationSec: 60 } });
  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.equal(body.degraded, true);
  assert.equal(body.feedback, null);
  assert.ok(body.metrics.wordCount > 100);
});

test('an unreadable model reply degrades instead of crashing', async () => {
  mockGroq(() => json({ choices: [{ message: { content: 'not json' } }] }));
  const res = await app.inject({ method: 'POST', url: '/api/ai/evaluate', headers: headers(), payload: { transcript: longText, durationSec: 60 } });
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().degraded, true);
});

test('chat streams deltas as server-sent events and ends with [DONE]', async () => {
  const frames = [
    'data: {"choices":[{"delta":{"content":"Nice "}}]}\n\n',
    'data: {"choices":[{"delta":{"content":"to meet you."}}]}\n\n',
    'data: [DONE]\n\n',
  ];
  mockGroq(() => new Response(new ReadableStream({
    start(c) { frames.forEach((f) => c.enqueue(new TextEncoder().encode(f))); c.close(); },
  }), { status: 200, headers: { 'content-type': 'text/event-stream' } }));
  const res = await app.inject({ method: 'POST', url: '/api/ai/chat', headers: headers(), payload: { messages: [{ role: 'user', content: 'Hello' }] } });
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['content-type'], /text\/event-stream/);
  assert.match(res.body, /"delta":"Nice "/);
  assert.match(res.body, /"delta":"to meet you\."/);
  assert.ok(res.body.trimEnd().endsWith('data: [DONE]'));
  const sent = JSON.parse(groqCalls[0].init.body);
  assert.equal(sent.model, 'openai/gpt-oss-20b');
  assert.equal(sent.stream, true);
});

test('chat rejects an empty message list', async () => {
  const res = await app.inject({ method: 'POST', url: '/api/ai/chat', headers: headers(), payload: { messages: [] } });
  assert.equal(res.statusCode, 400);
});

test('a Groq rate limit is returned as 429 ai_busy with retry-after', async () => {
  mockGroq(() => new Response('slow down', { status: 429, headers: { 'retry-after': '20' } }));
  const res = await app.inject({ method: 'POST', url: '/api/ai/chat', headers: headers(), payload: { messages: [{ role: 'user', content: 'Hi' }] } });
  assert.equal(res.statusCode, 429);
  assert.equal(res.json().code, 'ai_busy');
  assert.equal(res.headers['retry-after'], '20');
});
