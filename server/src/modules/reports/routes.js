module.exports = async function (fastify, opts) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/latest', async (request, reply) => {
    return { report: null };
  });
};
