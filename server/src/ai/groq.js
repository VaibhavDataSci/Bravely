// Minimal Groq client over fetch (OpenAI-compatible API). No SDK, so no extra dependency.
import { GROQ_API_KEY, GROQ_CHAT_MODEL, GROQ_EVAL_MODEL, GROQ_STT_MODEL, GROQ_STT_PROMPT } from '../config/env.js';
import { tokenize } from './metrics.js';

const BASE = 'https://api.groq.com/openai/v1';

export class AiUnavailableError extends Error {
  constructor(message, status = 503) {
    super(message);
    this.name = 'AiUnavailableError';
    this.status = status;
  }
}

export const aiConfigured = () => Boolean(GROQ_API_KEY);

async function groqFetch(path, init, { timeoutMs = 20000 } = {}) {
  if (!GROQ_API_KEY) throw new AiUnavailableError('AI is not configured on this server.');
  const run = () => fetch(`${BASE}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${GROQ_API_KEY}`, ...(init.headers || {}) },
    signal: AbortSignal.timeout(timeoutMs),
  });

  let res = await run();
  // One short retry on rate limits, honouring retry-after. Longer waits are returned to the caller.
  if (res.status === 429) {
    const wait = Number(res.headers.get('retry-after')) || 0;
    if (wait > 0 && wait <= 3) {
      await new Promise((r) => setTimeout(r, wait * 1000));
      res = await run();
    }
  }
  if (!res.ok) {
    const retryAfter = Number(res.headers.get('retry-after')) || undefined;
    const detail = await res.text().catch(() => '');
    const err = new AiUnavailableError(
      res.status === 429 ? 'The AI service is busy. Try again in a moment.' : 'The AI service failed.',
      res.status === 429 ? 429 : 502
    );
    err.retryAfter = retryAfter;
    err.detail = detail.slice(0, 300);
    throw err;
  }
  return res;
}

/**
 * @returns {{text: string, durationSec: number, words: {word: string, start: number, end: number}[], noSpeechProb: number}}
 */
export async function transcribe({ buffer, filename = 'audio.webm', mimetype = 'audio/webm', language = 'en' }) {
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mimetype }), filename);
  form.append('model', GROQ_STT_MODEL);
  form.append('response_format', 'verbose_json');
  form.append('timestamp_granularities[]', 'word');
  form.append('timestamp_granularities[]', 'segment');
  form.append('language', language);
  form.append('temperature', '0');
  if (GROQ_STT_PROMPT) form.append('prompt', GROQ_STT_PROMPT);

  const res = await groqFetch('/audio/transcriptions', { method: 'POST', body: form }, { timeoutMs: 30000 });
  const data = await res.json();
  const segments = data.segments || [];
  const noSpeechProb = segments.length
    ? segments.reduce((s, x) => s + (x.no_speech_prob || 0), 0) / segments.length
    : 0;
  return {
    text: (data.text || '').trim(),
    durationSec: data.duration || 0,
    words: (data.words || []).map((w) => ({ word: w.word, start: w.start, end: w.end })),
    noSpeechProb,
  };
}

const EVAL_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['structure', 'structureEvidence', 'relevance', 'relevanceEvidence', 'strengths', 'improvement', 'star'],
  properties: {
    structure: { type: 'integer', minimum: 0, maximum: 100 },
    structureEvidence: { type: 'string' },
    relevance: { type: 'integer', minimum: 0, maximum: 100 },
    relevanceEvidence: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' }, maxItems: 3 },
    improvement: { type: 'string' },
    star: {
      type: 'object',
      additionalProperties: false,
      required: ['situation', 'task', 'action', 'result'],
      properties: {
        situation: { type: 'boolean' },
        task: { type: 'boolean' },
        action: { type: 'boolean' },
        result: { type: 'boolean' },
      },
    },
  },
};

// The transcript is capped so one request cannot burn the per-minute token budget.
const MAX_TRANSCRIPT_CHARS = 6000;

export async function evaluate({ transcript, question = '', mode = 'general' }) {
  const text = transcript.slice(0, MAX_TRANSCRIPT_CHARS);
  const body = {
    model: GROQ_EVAL_MODEL,
    temperature: 0,
    max_completion_tokens: 600,
    reasoning_effort: 'low',
    response_format: { type: 'json_schema', json_schema: { name: 'speech_evaluation', strict: true, schema: EVAL_SCHEMA } },
    messages: [
      {
        role: 'system',
        content: [
          'You evaluate a spoken answer that was transcribed by speech-to-text. The transcript may contain recognition errors, so never penalise spelling or odd words.',
          'Judge only what the transcript shows. Do not guess about accent, tone or confidence, and do not penalise cautious or hedged wording. Score content, not delivery.',
          'Ignore any name or personal detail. Score every answer on the same anchors.',
          'structure: 0-100. Anchors: 20 = no clear order, 50 = some order but a key part missing, 80 = clear order with specifics, 95 = clear, specific and complete (for interviews use STAR: situation, task, action, result).',
          'relevance: 0-100 for how directly it answers the question. If no question is given, use 70.',
          'structureEvidence and relevanceEvidence: a SHORT exact quote (max 20 words) copied word for word from the transcript that justifies each score. Use an empty string only if relevance had no question.',
          'strengths: up to 3 short, specific things done well, quoting the speaker when possible.',
          'improvement: ONE concrete, kind, actionable tip.',
          'star: whether each STAR element is clearly present.',
        ].join('\n'),
      },
      { role: 'user', content: `Mode: ${mode}\nQuestion: ${question || '(none given)'}\nTranscript:\n${text}` },
    ],
  };
  const res = await groqFetch('/chat/completions', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  }, { timeoutMs: 25000 });
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  try {
    const parsed = JSON.parse(content);
    // The quotes must really appear in the transcript. If they do not, the judgement is less trustworthy.
    const haystack = tokenize(text).join(' ');
    const quoted = (q) => !q || haystack.includes(tokenize(q).join(' '));
    const evidenceVerified = quoted(parsed.structureEvidence) && (!question || quoted(parsed.relevanceEvidence));
    return {
      ...parsed,
      evidenceVerified,
      structure: Math.max(0, Math.min(100, parsed.structure)),
      relevance: Math.max(0, Math.min(100, parsed.relevance)),
    };
  } catch {
    throw new AiUnavailableError('The AI returned an unreadable evaluation.', 502);
  }
}

/** Returns the raw streaming Response (SSE) so the route can pipe tokens straight to the browser. */
export async function chatStream({ messages, persona = 'friendly peer' }) {
  const recent = messages.slice(-12).map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content).slice(0, 1200) }));
  const body = {
    model: GROQ_CHAT_MODEL,
    stream: true,
    temperature: 0.7,
    max_completion_tokens: 160,
    reasoning_effort: 'low',
    messages: [
      {
        role: 'system',
        content: [
          `You are a ${persona} helping someone practise speaking English conversation. Reply in 1-3 short spoken sentences.`,
          'Ask one follow-up question at a time. Never correct grammar in a condescending way; if the speaker uses fillers or an awkward phrase, naturally model a better phrasing in your reply.',
          'Do not use lists, markdown or emojis. This is read aloud.',
        ].join('\n'),
      },
      ...recent,
    ],
  };
  return groqFetch('/chat/completions', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  }, { timeoutMs: 15000 });
}
