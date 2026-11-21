import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-1234';

let app;

before(async () => {
  const { default: buildApp } = await import('../src/app.js');
  app = await buildApp({ logger: false });
  await app.ready();
});

after(async () => {
  await app.close();
});

test('GET /health returns ok without a database', async () => {
  const res = await app.inject({ method: 'GET', url: '/health' });
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().status, 'ok');
});

test('POST /api/auth/signup rejects invalid input with field errors', async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/api/auth/signup',
    payload: { email: 'nope', name: '', password: 'short' },
  });
  assert.equal(res.statusCode, 400);
  assert.deepEqual(Object.keys(res.json().fields).sort(), ['email', 'name', 'password']);
});

test('POST /api/auth/login requires email and password', async () => {
  const res = await app.inject({ method: 'POST', url: '/api/auth/login', payload: {} });
  assert.equal(res.statusCode, 400);
  assert.ok(res.json().fields.email && res.json().fields.password);
});

test('GET /api/auth/me without a token is 401 unauthenticated', async () => {
  const res = await app.inject({ method: 'GET', url: '/api/auth/me' });
  assert.equal(res.statusCode, 401);
  assert.equal(res.json().code, 'unauthenticated');
});

test('GET /api/auth/me with an expired token is 401 token_expired', async () => {
  const token = app.jwt.sign({ id: 'x', role: 'user', email: 'a@b.co' }, { expiresIn: '-1s' });
  const res = await app.inject({
    method: 'GET',
    url: '/api/auth/me',
    headers: { authorization: `Bearer ${token}` },
  });
  assert.equal(res.statusCode, 401);
  assert.equal(res.json().code, 'token_expired');
});

test('protected stub routes require authentication', async () => {
  const res = await app.inject({ method: 'POST', url: '/api/coding/start' });
  assert.equal(res.statusCode, 401);
});
