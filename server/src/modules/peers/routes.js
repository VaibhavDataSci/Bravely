module.exports = async function (fastify, opts) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/online', async (request, reply) => {
    return { users: [] };
  });
};
