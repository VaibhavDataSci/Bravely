import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { io as connect } from 'socket.io-client';

process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-1234';

let app;
let token;

before(async () => {
  const { default: buildApp } = await import('../src/app.js');
  app = await buildApp({ logger: false });
  app.get('/boom', async () => { throw new Error('database password is hunter2'); });
  await app.ready();
  token = app.jwt.sign({ id: 'u1', role: 'user', email: 'a@b.co' });
});
after(async () => { await app.close(); });

test('server errors return a generic body and never leak the message', async () => {
  const res = await app.inject({ method: 'GET', url: '/boom' });
  assert.equal(res.statusCode, 500);
  const body = res.json();
  assert.equal(body.code, 'internal_error');
  assert.ok(body.requestId);
  assert.ok(!JSON.stringify(body).includes('hunter2'));
});

test('every response carries an x-request-id', async () => {
  const res = await app.inject({ method: 'GET', url: '/health' });
  assert.match(res.headers['x-request-id'], /^[0-9a-f-]{36}$/);
});

test('unknown routes return a JSON 404', async () => {
  const res = await app.inject({ method: 'GET', url: '/nope' });
  assert.equal(res.statusCode, 404);
  assert.equal(res.json().code, 'not_found');
});

test('validation failures return 400 with validation_error', async () => {
  const res = await app.inject({
    method: 'POST', url: '/api/ai/evaluate', headers: { authorization: `Bearer ${token}` }, payload: {},
  });
  assert.equal(res.statusCode, 400);
  assert.equal(res.json().code, 'validation_error');
});

test('/ready reports ok when no database is configured', async () => {
  const res = await app.inject({ method: 'GET', url: '/ready' });
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().status, 'ok');
});

// ── Socket.IO signalling ────────────────────────────────────────────────────
async function startSocketServer() {
  const { default: register, authenticateSocket } = await import('../src/socket/index.js');
  const http = createServer();
  const io = new Server(http);
  io.use(authenticateSocket((t) => app.jwt.verify(t)));
  register(io);
  await new Promise((resolve) => http.listen(0, resolve));
  const url = `http://localhost:${http.address().port}`;
  const client = (auth) => connect(url, { auth, transports: ['websocket'], reconnection: false });
  const close = async () => { await io.close(); };
  return { client, close };
}

const once = (socket, event) => new Promise((resolve) => socket.once(event, resolve));
const connected = (socket) => new Promise((resolve, reject) => { socket.once('connect', resolve); socket.once('connect_error', reject); });

test('sockets without a valid token are rejected', async () => {
  const { client, close } = await startSocketServer();
  const none = client({});
  await assert.rejects(connected(none), /unauthorized/);
  const bad = client({ token: 'not-a-jwt' });
  await assert.rejects(connected(bad), /unauthorized/);
  none.close(); bad.close();
  await close();
});

test('signalling only reaches sockets in a shared room, and the caller id cannot be spoofed', async () => {
  const { client, close } = await startSocketServer();
  const a = client({ token }); const b = client({ token }); const outsider = client({ token });
  await Promise.all([connected(a), connected(b), connected(outsider)]);

  a.emit('join-room', { roomId: 'room-1' });
  b.emit('join-room', { roomId: 'room-1' });
  outsider.emit('join-room', { roomId: 'room-2' });
  await once(b, 'existing-users');
  await new Promise((r) => setTimeout(r, 50));

  let leaked = false;
  outsider.on('offer', () => { leaked = true; });
  const received = once(b, 'offer');
  a.emit('offer', { target: b.id, caller: 'someone-else', sdp: 'x' });
  a.emit('offer', { target: outsider.id, caller: a.id, sdp: 'x' });
  const offer = await received;
  await new Promise((r) => setTimeout(r, 100));

  assert.equal(offer.caller, a.id);      // overwritten with the real sender
  assert.equal(leaked, false);           // different room: never delivered
  [a, b, outsider].forEach((s) => s.close());
  await close();
});

test('invalid room ids are rejected', async () => {
  const { client, close } = await startSocketServer();
  const a = client({ token });
  await connected(a);
  const err = once(a, 'error-message');
  a.emit('join-room', { roomId: '../../etc' });
  assert.equal(await err, 'invalid_room');
  a.close();
  await close();
});
