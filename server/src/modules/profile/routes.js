module.exports = async function (fastify, opts) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/', async (request, reply) => {
    return { profile: 'Profile route' };
  });
};
