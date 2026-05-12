module.exports = async function (fastify, opts) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.put('/profile', async (request, reply) => {
    return { message: 'Settings profile update' };
  });
};
