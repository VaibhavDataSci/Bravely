module.exports = async function (fastify, opts) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/summary', async (request, reply) => {
    return { summary: 'Dashboard summary' };
  });
};
