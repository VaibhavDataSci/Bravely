const {
  createInterviewSession,
  addAnswer,
  endSession,
  createReportFromSession,
} = require('../../services/runtimeStore');
const { generateQuestionsFromResume, generateFollowUpQuestion, analyzeAnswer } = require('../../services/interviewAI');

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
  fastify.post('/start', async (request, reply) => {
    const { config = {}, resume = null } = request.body || {};
    const user = await getOptionalUser(request);
    const userId = user.id;

    const questions = await generateQuestionsFromResume({ config, resume: resume || {} });
    const session = createInterviewSession({ userId, config, resume, questions });

    return {
      success: true,
      data: {
        sessionId: session.id,
        firstQuestion: questions[0],
        questions,
      },
    };
  });

  fastify.post('/answer', async (request, reply) => {
    const { sessionId, question, text, posture = null } = request.body || {};
    if (!sessionId || !text) {
      return reply.code(400).send({ success: false, error: 'sessionId and text are required' });
    }

    await getOptionalUser(request);

    const store = addAnswer({
      sessionId,
      answer: {
        question,
        text,
        posture,
        createdAt: new Date().toISOString(),
      },
    });

    if (!store) {
      return reply.code(404).send({ success: false, error: 'Session not found' });
    }

    let analysis;
    try {
      analysis = await analyzeAnswer({ transcript: text, question, config: store.config });
    } catch (err) {
      request.log.error(err);
      return reply.code(502).send({
        success: false,
        error: 'AI analysis failed. Check the Gemini AI service and GEMINI_API_KEY.',
      });
    }

    const currentIndex = store.answers.length - 1;
    store.answers[currentIndex].analysis = analysis;

    const askedQuestions = store.answers.map(a => a.question).filter(Boolean);
    const maxQuestions = Math.max(store.questions.length || 0, 6);
    let nextQuestion = null;
    if (store.answers.length < maxQuestions) {
      nextQuestion = await generateFollowUpQuestion({
        config: store.config,
        resume: store.resume || {},
        previousQuestion: question,
        answerText: text,
        analysis,
        askedQuestions,
      });
      store.questions[store.answers.length] = nextQuestion;
    }

    return {
      success: true,
      data: {
        sessionId,
        feedback: analysis.feedback,
        scores: analysis.scores,
        metrics: analysis.metrics,
        nextQuestion,
        done: !nextQuestion,
      },
    };
  });

  fastify.post('/end', async (request, reply) => {
    const { sessionId } = request.body || {};
    if (!sessionId) {
      return reply.code(400).send({ success: false, error: 'sessionId is required' });
    }

    await getOptionalUser(request);

    const session = endSession({ sessionId });
    if (!session) {
      return reply.code(404).send({ success: false, error: 'Session not found' });
    }

    const report = createReportFromSession(session);
    return {
      success: true,
      data: {
        reportId: report?.id,
        report,
      },
    };
  });
};
