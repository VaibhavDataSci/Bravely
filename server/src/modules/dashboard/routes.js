import * as db from '../../config/db.js';
import { activeStreak, levelFromXp } from '../sessions/progress.js';

const TREND_DAYS = 14;

export default async function (fastify) {
  fastify.addHook('onRequest', fastify.authenticate);

  // Everything here is computed from the user's saved sessions. A new user gets zeros and empty lists,
  // never made-up numbers.
  fastify.get('/summary', async (request, reply) => {
    const id = request.user.id;
    const [userRes, totalsRes, trendRes, recentRes, partsRes] = await Promise.all([
      db.query('SELECT name, streak, xp FROM users WHERE id = $1', [id]),
      db.query(
        `SELECT count(*)::int AS sessions, coalesce(sum("durationSec"),0)::float AS seconds,
                avg(score)::float AS "avgScore", max(score) AS "bestScore"
           FROM sessions WHERE "userId" = $1`, [id]),
      db.query(
        `SELECT to_char(date_trunc('day', "createdAt" AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
                round(avg(score))::int AS score, count(*)::int AS sessions
           FROM sessions
          WHERE "userId" = $1 AND "createdAt" >= now() - make_interval(days => $2) AND score IS NOT NULL
          GROUP BY 1 ORDER BY 1`, [id, TREND_DAYS]),
      db.query(
        `SELECT id, mode, topic, score, "durationSec", "createdAt" FROM sessions
          WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 5`, [id]),
      db.query(
        `SELECT p.key AS part, round(avg((p.value)::numeric))::int AS score
           FROM sessions s, jsonb_each_text(s.fluency->'parts') p
          WHERE s."userId" = $1 AND s.score IS NOT NULL AND p.value ~ '^[0-9.]+$'
          GROUP BY p.key ORDER BY score ASC`, [id]),
    ]);

    const user = userRes.rows[0];
    if (!user) return reply.code(401).send({ error: 'Account not found', code: 'unauthenticated' });
    const t = totalsRes.rows[0];
    const parts = partsRes.rows;

    return {
      user: { name: user.name },
      progress: { xp: user.xp, ...levelFromXp(user.xp), streak: activeStreak(user.streak), bestStreak: user.streak?.best ?? 0 },
      totals: {
        sessions: t.sessions,
        minutes: Math.round(t.seconds / 60),
        averageScore: t.avgScore == null ? null : Math.round(t.avgScore),
        bestScore: t.bestScore,
      },
      trend: trendRes.rows,
      recent: recentRes.rows,
      // Lowest average sub-score first, so the first item is the best thing to practise next.
      focus: parts.length ? { weakest: parts[0], strongest: parts.at(-1) } : null,
    };
  });
}
