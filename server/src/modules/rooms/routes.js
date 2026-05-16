module.exports = async function (fastify, opts) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/create', async (request, reply) => {
    return { message: 'Room created' };
  });
};
