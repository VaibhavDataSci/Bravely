import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-1234';

const { xpForSession, levelFromXp, nextStreak, activeStreak } = await import('../src/modules/sessions/progress.js');

describe('progress rules', () => {
  test('xp rewards score and effort, and still pays a little for unscored sessions', () => {
    assert.ok(xpForSession({ score: 80, durationSec: 120 }) > xpForSession({ score: 40, durationSec: 120 }));
    assert.ok(xpForSession({ score: 60, durationSec: 300 }) > xpForSession({ score: 60, durationSec: 15 }));
    const unscored = xpForSession({ score: null, durationSec: 10 });
    assert.ok(unscored > 0 && unscored < 12);
  });

  test('level comes from total xp', () => {
    assert.deepEqual(levelFromXp(0), { level: 1, xpIntoLevel: 0, xpForNext: 200 });
    assert.equal(levelFromXp(450).level, 3);
  });

  test('streak starts, holds on the same day, extends next day, resets after a gap', () => {
    const d = (s) => new Date(`${s}T12:00:00Z`);
    const first = nextStreak(undefined, d('2026-03-01'));
    assert.equal(first.current, 1);
    assert.equal(nextStreak(first, d('2026-03-01')).current, 1);
    const second = nextStreak(first, d('2026-03-02'));
    assert.equal(second.current, 2);
    const reset = nextStreak(second, d('2026-03-05'));
    assert.equal(reset.current, 1);
    assert.equal(reset.best, 2);
  });

  test('a streak that lapsed is shown as 0', () => {
    const streak = { current: 4, best: 4, lastDay: '2026-03-01' };
    assert.equal(activeStreak(streak, new Date('2026-03-02T09:00:00Z')), 4);
    assert.equal(activeStreak(streak, new Date('2026-03-04T09:00:00Z')), 0);
  });
});

// Real database path. Skipped when no database is configured.
const { POSTGRES_URL } = await import('../src/config/env.js');
describe('sessions API', { skip: !POSTGRES_URL && 'POSTGRES_URL not set' }, () => {
  let app;
  let auth;
  const email = `sessions-${randomUUID()}@example.com`;
  const transcript = Array.from({ length: 60 }, (_, i) => ['project', 'team', 'delivered', 'because', 'planned', 'result'][i % 6]).join(' ');

  before(async () => {
    const { default: buildApp } = await import('../src/app.js');
    app = await buildApp({ logger: false });
    await app.ready();
    const res = await app.inject({ method: 'POST', url: '/api/auth/signup', payload: { email, name: 'Test', password: 'password123' } });
    assert.equal(res.statusCode, 201);
    auth = { authorization: `Bearer ${res.json().token}` };
  });

  after(async () => {
    const db = await import('../src/config/db.js');
    await db.query('DELETE FROM users WHERE lower(email) = lower($1)', [email]);
    await app.close();
    await db.closePool();
  });

  test('a new user has an empty dashboard and no report', async () => {
    const dash = (await app.inject({ method: 'GET', url: '/api/dashboard/summary', headers: auth })).json();
    assert.equal(dash.totals.sessions, 0);
    assert.equal(dash.totals.averageScore, null);
    assert.deepEqual(dash.recent, []);
    assert.equal(dash.progress.streak, 0);
    const report = (await app.inject({ method: 'GET', url: '/api/reports/latest', headers: auth })).json();
    assert.equal(report.report, null);
  });

  test('saving a session scores it server-side, awards xp and starts a streak', async () => {
    const res = await app.inject({
      method: 'POST', url: '/api/sessions', headers: auth,
      payload: { transcript, mode: 'interview', question: 'Tell me about a project', durationSec: 90 },
    });
    assert.equal(res.statusCode, 201);
    const body = res.json();
    assert.ok(body.session.fluency.score > 0 && body.session.fluency.score <= 100);
    assert.ok(body.progress.xpEarned > 0);
    assert.equal(body.progress.streak, 1);
    assert.equal(body.session.degraded, true);
  });

  test('dashboard, list and report now reflect the saved session', async () => {
    const dash = (await app.inject({ method: 'GET', url: '/api/dashboard/summary', headers: auth })).json();
    assert.equal(dash.totals.sessions, 1);
    assert.ok(dash.progress.xp > 0);
    assert.equal(dash.recent.length, 1);

    const list = (await app.inject({ method: 'GET', url: '/api/sessions?limit=1', headers: auth })).json();
    assert.equal(list.items.length, 1);
    assert.equal(list.nextCursor, null);

    const report = (await app.inject({ method: 'GET', url: '/api/reports/latest', headers: auth })).json();
    assert.equal(report.report.id, list.items[0].id);
  });

  test('sessions are private to their owner', async () => {
    const other = await app.inject({ method: 'POST', url: '/api/auth/signup', payload: { email: `o-${email}`, name: 'Other', password: 'password123' } });
    const otherAuth = { authorization: `Bearer ${other.json().token}` };
    const list = (await app.inject({ method: 'GET', url: '/api/sessions', headers: auth })).json();
    const res = await app.inject({ method: 'GET', url: `/api/sessions/${list.items[0].id}`, headers: otherAuth });
    assert.equal(res.statusCode, 404);
    const db = await import('../src/config/db.js');
    await db.query('DELETE FROM users WHERE lower(email) = lower($1)', [`o-${email}`]);
  });

  test('requires auth and a transcript', async () => {
    assert.equal((await app.inject({ method: 'GET', url: '/api/sessions' })).statusCode, 401);
    const bad = await app.inject({ method: 'POST', url: '/api/sessions', headers: auth, payload: {} });
    assert.equal(bad.statusCode, 400);
  });
});
