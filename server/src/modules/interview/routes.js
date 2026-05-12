module.exports = async function (fastify, opts) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/start', async (request, reply) => {
    return { message: 'Interview start' };
  });
};
