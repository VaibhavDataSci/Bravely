import bcrypt from 'bcrypt';
import * as db from '../../config/db.js';
import { JWT_EXPIRES_IN } from '../../config/env.js';

const BCRYPT_ROUNDS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PUBLIC_COLUMNS = 'id, email, name, role, plan, streak, preferences, "photoURL"';

// Compared against when the email is unknown so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

const authRateLimit = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } };

function validateCredentials({ email, password }) {
  const fields = {};
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.length > 254) {
    fields.email = 'Enter a valid email address';
  }
  // bcrypt only reads the first 72 bytes, so longer passwords are rejected, not silently truncated.
  if (typeof password !== 'string' || password.length < 8) {
    fields.password = 'Password must be at least 8 characters';
  } else if (Buffer.byteLength(password) > 72) {
    fields.password = 'Password must be at most 72 bytes';
  }
  return fields;
}

function validationError(reply, fields) {
  return reply.code(400).send({ error: 'Please correct the highlighted fields', fields });
}

export default async function authRoutes(fastify) {
  const issueToken = (user) =>
    fastify.jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      { expiresIn: JWT_EXPIRES_IN }
    );

  fastify.post('/signup', authRateLimit, async (request, reply) => {
    const body = request.body ?? {};
    const fields = validateCredentials(body);
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) fields.name = 'Enter your name';
    else if (name.length > 80) fields.name = 'Name must be at most 80 characters';
    if (Object.keys(fields).length) return validationError(reply, fields);

    const email = body.email.trim().toLowerCase();

    try {
      const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
      const result = await db.query(
        `INSERT INTO users (email, name, "passwordHash") VALUES ($1, $2, $3)
         RETURNING ${PUBLIC_COLUMNS}`,
        [email, name, passwordHash]
      );
      const user = result.rows[0];
      return reply.code(201).send({ token: issueToken(user), user });
    } catch (err) {
      if (err.code === '23505') {
        return reply.code(409).send({
          error: 'An account with this email already exists',
          fields: { email: 'An account with this email already exists' },
        });
      }
      request.log.error(err);
      return reply.code(500).send({ error: 'Something went wrong. Please try again.' });
    }
  });

  fastify.post('/login', authRateLimit, async (request, reply) => {
    const body = request.body ?? {};
    if (typeof body.email !== 'string' || !body.email.trim() || typeof body.password !== 'string' || !body.password) {
      return validationError(reply, {
        ...(!body.email ? { email: 'Enter your email address' } : {}),
        ...(!body.password ? { password: 'Enter your password' } : {}),
      });
    }

    try {
      const result = await db.query(
        `SELECT ${PUBLIC_COLUMNS}, "passwordHash" FROM users WHERE lower(email) = $1`,
        [body.email.trim().toLowerCase()]
      );
      const row = result.rows[0];
      const match = await bcrypt.compare(body.password, row?.passwordHash ?? DUMMY_HASH);
      if (!row || !row.passwordHash || !match) {
        return reply.code(401).send({ error: 'Incorrect email or password' });
      }

      const { passwordHash: _omit, ...user } = row;
      return { token: issueToken(user), user };
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Something went wrong. Please try again.' });
    }
  });

  fastify.get('/me', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const result = await db.query(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [request.user.id]);
      if (!result.rows.length) {
        return reply.code(401).send({ error: 'Authentication required', code: 'unauthenticated' });
      }
      return { user: result.rows[0] };
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Something went wrong. Please try again.' });
    }
  });
}
