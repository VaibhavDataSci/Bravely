const { getLatestReport } = require('../../services/runtimeStore');

async function getOptionalUser(request) {
  try {
    await request.jwtVerify();
    return request.user;
  } catch {
    return {
      id: 'guest',
      email: 'guest@bravely.local',
      role: 'guest',
    };
  }
}

module.exports = async function (fastify, opts) {

  fastify.get('/latest', async (request, reply) => {
    const user = await getOptionalUser(request);
    const report = getLatestReport(user.id);
    return {
      success: true,
      data: { report },
    };
  });
};
