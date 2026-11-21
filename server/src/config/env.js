import dotenv from 'dotenv';

dotenv.config();

const MIN_JWT_SECRET_LENGTH = 32;

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
  throw new Error(
    `JWT_SECRET is required and must be at least ${MIN_JWT_SECRET_LENGTH} characters. See server/.env.example.`
  );
}

export const PORT = Number(process.env.PORT) || 5000;
export const JWT_SECRET = jwtSecret;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Required for any route that touches the database. Checked lazily so /health works without it.
export const POSTGRES_URL = process.env.POSTGRES_URL;

// Optional. The reports worker only starts when this is set.
export const REDIS_URL = process.env.REDIS_URL;

export const CORS_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
