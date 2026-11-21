import pg from 'pg';
import { POSTGRES_URL } from './env.js';

let pool;

function getPool() {
  if (!pool) {
    if (!POSTGRES_URL) throw new Error('POSTGRES_URL is not set');
    pool = new pg.Pool({ connectionString: POSTGRES_URL });
  }
  return pool;
}

export const query = (text, params) => getPool().query(text, params);

export const withClient = async (fn) => {
  const client = await getPool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
};

export const closePool = async () => {
  if (pool) await pool.end();
  pool = undefined;
};
