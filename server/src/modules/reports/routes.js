import * as db from '../../config/db.js';

export default async function (fastify) {
  fastify.addHook('onRequest', fastify.authenticate);

  // The most recent saved session in full, or { report: null } before the first one.
  fastify.get('/latest', async (request) => {
    const { rows: [report] } = await db.query(
      'SELECT * FROM sessions WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 1', [request.user.id]
    );
    return { report: report ?? null };
  });
}
