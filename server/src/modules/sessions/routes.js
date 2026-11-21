import * as db from '../../config/db.js';
import { analyzeSpeech } from '../../ai/metrics.js';
import { scoreSpeech } from '../../ai/scoring.js';
import { levelFromXp, nextStreak, xpForSession, activeStreak } from './progress.js';

const MODES = ['general', 'interview', 'discussion', 'daily'];
const LIST_COLUMNS = 'id, mode, topic, question, "durationSec", score, xp, degraded, "createdAt"';

export default async function sessionRoutes(fastify) {
  fastify.addHook('onRequest', fastify.authenticate);

  // Saves a finished practice session. The score is recomputed here from the transcript, so the
  // client cannot submit a made-up number. Evidence-verified model feedback is accepted as given.
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['transcript'],
        properties: {
          transcript: { type: 'string', minLength: 1, maxLength: 12000 },
          mode: { type: 'string', enum: MODES },
          topic: { type: 'string', maxLength: 120 },
          question: { type: 'string', maxLength: 500 },
          durationSec: { type: 'number', minimum: 0, maximum: 1800 },
          feedback: { type: ['object', 'null'] },
        },
      },
    },
  }, async (request, reply) => {
    const { transcript, mode = 'general', topic, question, durationSec, feedback = null } = request.body;
    const metrics = analyzeSpeech(transcript, { durationSec });
    const fluency = scoreSpeech(metrics, {
      structure: feedback?.structure,
      relevance: question ? feedback?.relevance : null,
      evidenceVerified: feedback?.evidenceVerified,
    });
    const xp = xpForSession({ score: fluency.score, durationSec });

    const saved = await db.withClient(async (client) => {
      await client.query('BEGIN');
      try {
        const { rows: [user] } = await client.query('SELECT streak, xp FROM users WHERE id = $1 FOR UPDATE', [request.user.id]);
        if (!user) {
          await client.query('ROLLBACK');
          return null;
        }
        const streak = nextStreak(user.streak);
        const totalXp = user.xp + xp;
        const { rows: [session] } = await client.query(
          `INSERT INTO sessions ("userId", mode, topic, question, transcript, "durationSec", metrics, fluency, feedback, degraded, score, xp)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING ${LIST_COLUMNS}`,
          [request.user.id, mode, topic ?? null, question ?? null, transcript, durationSec ?? null,
            metrics, fluency, feedback, !feedback, fluency.score, xp]
        );
        await client.query('UPDATE users SET streak = $2, xp = $3 WHERE id = $1', [request.user.id, streak, totalXp]);
        await client.query('COMMIT');
        return { session, streak, xp: totalXp };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    });
    if (!saved) return reply.code(401).send({ error: 'Account not found', code: 'unauthenticated' });

    return reply.code(201).send({
      session: { ...saved.session, metrics, fluency, feedback },
      progress: { xpEarned: xp, xp: saved.xp, ...levelFromXp(saved.xp), streak: activeStreak(saved.streak) },
    });
  });

  // Newest first. `cursor` is the createdAt of the last item from the previous page.
  fastify.get('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
          cursor: { type: 'string', format: 'date-time' },
          mode: { type: 'string', enum: MODES },
        },
      },
    },
  }, async (request) => {
    const { limit, cursor, mode } = request.query;
    const params = [request.user.id];
    let where = '"userId" = $1';
    if (mode) { params.push(mode); where += ` AND mode = $${params.length}`; }
    if (cursor) { params.push(cursor); where += ` AND "createdAt" < $${params.length}`; }
    params.push(limit + 1);
    const { rows } = await db.query(
      `SELECT ${LIST_COLUMNS} FROM sessions WHERE ${where} ORDER BY "createdAt" DESC LIMIT $${params.length}`,
      params
    );
    const items = rows.slice(0, limit);
    return { items, nextCursor: rows.length > limit ? items.at(-1).createdAt : null };
  });

  fastify.get('/:id', {
    schema: { params: { type: 'object', properties: { id: { type: 'string', format: 'uuid' } } } },
  }, async (request, reply) => {
    const { rows: [session] } = await db.query(
      'SELECT * FROM sessions WHERE id = $1 AND "userId" = $2', [request.params.id, request.user.id]
    );
    if (!session) return reply.code(404).send({ error: 'Session not found', code: 'not_found' });
    return { session };
  });
}
