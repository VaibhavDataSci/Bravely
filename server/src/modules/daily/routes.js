const {
  analyzeDailyTranscript,
  generateConversationTurn,
  generateDailyTopic,
} = require('../../services/dailyAI');
const { createDailyReport, markUserActivity, setUserStreak } = require('../../services/runtimeStore');
const { updateDbStreak } = require('../../services/streakService');
const crypto = require('crypto');

function createDailyId() {
  return `daily_${crypto.randomBytes(5).toString('hex')}`;
}

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

module.exports = async function (fastify) {
  fastify.post('/start', async (request) => {
    const mode = request.body?.mode || 'day-summary';
    const topic = mode === 'topic-practice' ? await generateDailyTopic() : null;

    return {
      success: true,
      sessionId: createDailyId(),
      mode,
      topic,
      startedAt: new Date().toISOString(),
    };
  });

  fastify.post('/topic', async () => {
    const topic = await generateDailyTopic();
    return { success: true, topic };
  });

  fastify.post('/analyze', async (request, reply) => {
    const { transcript, mode, prompt, duration, sessionId, category } = request.body || {};
    const result = await analyzeDailyTranscript({ transcript, mode, prompt, duration });
    const user = await getOptionalUser(request);
    const durationSeconds = Number(duration) || result?.metrics?.estimated_duration_seconds;

    if (!result?.empty) {
      try {
        createDailyReport({
          userId: user.id,
          mode: mode || 'day-summary',
          prompt: prompt || '',
          category: category || '',
          analysis: result,
          durationSeconds,
          sessionId,
        });
      } catch {
        // Report creation should not block analysis results.
      }

      try {
        if (user.id !== 'guest') {
          const streak = await updateDbStreak(user.id, 'daily_practice_completed');
          setUserStreak(user.id, streak);
        } else {
          markUserActivity(user.id, 'daily_practice_completed');
        }
      } catch {
        // Streak updates should not block analysis results.
      }
    }

    return reply.send({ success: true, ...result });
  });

  fastify.post('/ai-chat', async (request, reply) => {
    const { message, history } = request.body || {};
    const result = await generateConversationTurn({ message, history });
    return reply.send({ success: true, ...result });
  });
};
