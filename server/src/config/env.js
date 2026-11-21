import dotenv from 'dotenv';

dotenv.config();

const MIN_JWT_SECRET_LENGTH = 32;

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
  throw new Error(
    `JWT_SECRET is required and must be at least ${MIN_JWT_SECRET_LENGTH} characters. See server/.env.example.`
  );
}

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug');
// Set to true (or a hop count) when running behind a load balancer so client IPs and rate limits are correct.
export const TRUST_PROXY = process.env.TRUST_PROXY === 'true' ? true : Number(process.env.TRUST_PROXY) || false;
export const PORT = Number(process.env.PORT) || 5000;
export const JWT_SECRET = jwtSecret;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Required for any route that touches the database. Checked lazily so /health works without it.
export const POSTGRES_URL = process.env.POSTGRES_URL;

// Optional. The reports worker only starts when this is set.
export const REDIS_URL = process.env.REDIS_URL;

// Optional. Without a key the /api/ai routes report that AI is not configured.
// Model IDs are checked against console.groq.com/docs/models; the Llama 3.x models were shut down.
export const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
export const GROQ_CHAT_MODEL = process.env.GROQ_CHAT_MODEL || 'openai/gpt-oss-20b';
export const GROQ_EVAL_MODEL = process.env.GROQ_EVAL_MODEL || 'openai/gpt-oss-120b';
export const GROQ_STT_MODEL = process.env.GROQ_STT_MODEL || 'whisper-large-v3-turbo';
// Optional Whisper prompt. A filler-word prompt can keep "um"/"uh" but research shows prompts can also
// cause hallucinated words, so it is off by default. Measure on real recordings before enabling.
export const GROQ_STT_PROMPT = process.env.GROQ_STT_PROMPT || '';

export const CORS_ORIGINS =(process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
