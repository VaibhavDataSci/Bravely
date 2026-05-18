const { getDashboardSnapshot } = require('../../services/runtimeStore');

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

  fastify.get('/summary', async (request, reply) => {
    const user = await getOptionalUser(request);
    const snap = getDashboardSnapshot(user.id, 7);
    return {
      success: true,
      data: {
        streak: snap.streak,
        metrics: snap.metrics,
        strengths: snap.strengths,
        growthAreas: snap.growthAreas,
      },
    };
  });

  fastify.get('/performance', async (request, reply) => {
    const user = await getOptionalUser(request);
    const range = parseInt(request.query.range, 10) === 30 ? 30 : 7;
    const snap = getDashboardSnapshot(user.id, range);
    return {
      success: true,
      data: {
        range,
        points: snap.points,
      },
    };
  });

  fastify.get('/sessions', async (request, reply) => {
    const user = await getOptionalUser(request);
    const limit = Math.min(parseInt(request.query.limit, 10) || 5, 20);
    const snap = getDashboardSnapshot(user.id, 30);
    return {
      success: true,
      data: {
        sessions: snap.sessions.slice(0, limit),
      },
    };
  });

  fastify.get('/milestones', async (request, reply) => {
    const user = await getOptionalUser(request);
    const snap = getDashboardSnapshot(user.id, 30);
    return {
      success: true,
      data: {
        milestones: snap.milestones,
      },
    };
  });

  fastify.get('/filler-words', async (request, reply) => {
    const user = await getOptionalUser(request);
    const snap = getDashboardSnapshot(user.id, 30);
    return {
      success: true,
      data: {
        words: snap.fillerWords,
      },
    };
  });
};
