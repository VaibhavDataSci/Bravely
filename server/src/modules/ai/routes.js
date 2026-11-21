import { Readable } from 'node:stream';
import { transcribe, evaluate, chatStream, aiConfigured, AiUnavailableError } from '../../ai/groq.js';
import { analyzeSpeech } from '../../ai/metrics.js';
import { scoreSpeech } from '../../ai/scoring.js';

// Shown next to every score. Keep in sync with the notice in the app.
export const SCORE_NOTICE = 'Scores are practice feedback from automated speech-to-text and an AI model. Transcription is less accurate for some accents, speech differences and noisy audio, filler words are often undercounted, and the AI can mis-score. Use scores to track your own progress. This is not a clinical, exam or hiring assessment.';

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const MIN_AUDIO_BYTES = 2 * 1024;

function sendAiError(reply, err) {
  if (err instanceof AiUnavailableError) {
    if (err.retryAfter) reply.header('retry-after', err.retryAfter);
    return reply.code(err.status).send({ error: err.message, code: err.status === 429 ? 'ai_busy' : 'ai_unavailable' });
  }
  if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
    return reply.code(504).send({ error: 'The AI service took too long. Try again.', code: 'ai_timeout' });
  }
  throw err;
}

export default async function (fastify) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.get('/status', async () => ({ configured: aiConfigured() }));

  // Audio in, transcript + measured metrics + score out. No language-model call, so it is fast.
  fastify.post('/transcribe', { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (request, reply) => {
    const file = await request.file({ limits: { fileSize: MAX_AUDIO_BYTES } });
    if (!file) return reply.code(400).send({ error: 'Attach an audio file.', code: 'no_file' });
    const buffer = await file.toBuffer();
    if (file.file.truncated) return reply.code(413).send({ error: 'That recording is too large.', code: 'too_large' });
    if (buffer.length < MIN_AUDIO_BYTES) return reply.code(400).send({ error: 'The recording was too short.', code: 'too_short' });

    try {
      const t = await transcribe({ buffer, filename: file.filename, mimetype: file.mimetype });
      if (t.noSpeechProb > 0.6 || !t.text) {
        return reply.code(422).send({ error: 'We could not hear any speech. Check your microphone and try again.', code: 'no_speech' });
      }
      const metrics = analyzeSpeech(t.text, { durationSec: t.durationSec, words: t.words });
      return { transcript: t.text, metrics, fluency: scoreSpeech(metrics), notice: SCORE_NOTICE };
    } catch (err) {
      return sendAiError(reply, err);
    }
  });

  // Transcript in, metrics + model judgement + score out. Used when speech was already transcribed.
  fastify.post('/evaluate', {
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    schema: {
      body: {
        type: 'object',
        required: ['transcript'],
        properties: {
          transcript: { type: 'string', minLength: 1, maxLength: 12000 },
          question: { type: 'string', maxLength: 500 },
          mode: { type: 'string', enum: ['general', 'interview', 'discussion', 'daily'] },
          durationSec: { type: 'number', minimum: 0, maximum: 1800 },
        },
      },
    },
  }, async (request, reply) => {
    const { transcript, question, mode = 'general', durationSec } = request.body;
    const metrics = analyzeSpeech(transcript, { durationSec });
    if (!metrics.sufficient) return { metrics, fluency: scoreSpeech(metrics), feedback: null, notice: SCORE_NOTICE };

    try {
      const feedback = await evaluate({ transcript, question, mode });
      const fluency = scoreSpeech(metrics, {
        structure: feedback.structure,
        relevance: question ? feedback.relevance : null,
        evidenceVerified: feedback.evidenceVerified,
      });
      return { metrics, fluency, feedback, notice: SCORE_NOTICE };
    } catch (err) {
      // The measured metrics are still useful when the model is unavailable.
      if (err instanceof AiUnavailableError) {
        return { metrics, fluency: scoreSpeech(metrics), feedback: null, degraded: true, notice: SCORE_NOTICE };
      }
      return sendAiError(reply, err);
    }
  });

  // Streams the AI reply as server-sent events: `data: {"delta":"..."}` and a final `data: [DONE]`.
  fastify.post('/chat', {
    config: { rateLimit: { max: 40, timeWindow: '1 minute' } },
    schema: {
      body: {
        type: 'object',
        required: ['messages'],
        properties: {
          persona: { type: 'string', maxLength: 60 },
          messages: {
            type: 'array', minItems: 1, maxItems: 40,
            items: { type: 'object', required: ['role', 'content'], properties: { role: { type: 'string' }, content: { type: 'string', maxLength: 2000 } } },
          },
        },
      },
    },
  }, async (request, reply) => {
    let upstream;
    try {
      upstream = await chatStream({ messages: request.body.messages, persona: request.body.persona });
    } catch (err) {
      return sendAiError(reply, err);
    }

    reply.hijack();
    const raw = reply.raw;
    raw.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache, no-transform', connection: 'keep-alive' });
    let buffer = '';
    try {
      for await (const chunk of Readable.fromWeb(upstream.body)) {
        buffer += chunk.toString('utf8');
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') continue;
          try {
            const delta = JSON.parse(payload).choices?.[0]?.delta?.content;
            if (delta) raw.write(`data: ${JSON.stringify({ delta })}\n\n`);
          } catch { /* ignore partial frames */ }
        }
      }
    } catch {
      raw.write(`data: ${JSON.stringify({ error: 'stream_interrupted' })}\n\n`);
    }
    raw.write('data: [DONE]\n\n');
    raw.end();
  });
}
