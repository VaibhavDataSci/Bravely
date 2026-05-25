const { AI_SERVICE_URL } = require('../../config/env');

module.exports = async function (fastify, opts) {
  fastify.get('/health', async (request, reply) => {
    try {
      const res = await fetch(`${AI_SERVICE_URL}/health`);
      if (!res.ok) {
        return reply.code(502).send({ success: false, status: 'down' });
      }
      const payload = await res.json();
      return { success: true, status: 'ok', service: payload?.service || 'bravely-ai' };
    } catch {
      return reply.code(502).send({ success: false, status: 'down' });
    }
  });
};
