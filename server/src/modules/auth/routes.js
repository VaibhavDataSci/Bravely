const bcrypt = require('bcrypt');
const db = require('../../config/db');
const { createOrGetLocalUser, markUserActivity, setUserStreak } = require('../../services/runtimeStore');
const { updateDbStreak } = require('../../services/streakService');

module.exports = async function (fastify, opts) {
  
  fastify.post('/signup', async (request, reply) => {
    const { email, name, password } = request.body;
    
    if (!email || !password || !name) {
      return reply.code(400).send({ error: 'Email, name, and password are required' });
    }

    try {
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return reply.code(409).send({ error: 'Email already in use' });
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const result = await db.query(
        `INSERT INTO users (email, name, "passwordHash", role, plan, streak, preferences)
         VALUES ($1, $2, $3, 'user', 'free', '{"current":0}', '{"theme":"dark"}') RETURNING id, email, name, role`,
        [email, name, passwordHash]
      );

      const user = result.rows[0];
      const streak = markUserActivity(user.id, 'signup');
      user.streak = streak;
      setUserStreak(user.id, streak);
      const token = fastify.jwt.sign({ id: user.id, role: user.role, email: user.email });

      return { token, user };
    } catch (err) {
      request.log.error(err);
      const localUser = createOrGetLocalUser({ email, name });
      if (!localUser) {
        return reply.code(500).send({ error: 'Internal Server Error' });
      }
      localUser.streak = markUserActivity(localUser.id, 'signup');
      const token = fastify.jwt.sign({ id: localUser.id, role: localUser.role, email: localUser.email });
      return { token, user: localUser };
    }
  });

  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' });
    }

    try {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];

      if (!user) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return reply.code(401).send({ error: 'Invalid credentials' });
      }

      const token = fastify.jwt.sign({ id: user.id, role: user.role, email: user.email });
      
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.passwordHash;
      const streak = markUserActivity(user.id, 'login');
      userWithoutPassword.streak = streak;
      setUserStreak(user.id, streak);

      return { token, user: userWithoutPassword };
    } catch (err) {
      request.log.error(err);
      const localUser = createOrGetLocalUser({ email, name: email.split('@')[0] });
      if (!localUser) {
        return reply.code(500).send({ error: 'Internal Server Error' });
      }
      localUser.streak = markUserActivity(localUser.id, 'login');
      const token = fastify.jwt.sign({ id: localUser.id, role: localUser.role, email: localUser.email });
      return { token, user: localUser };
    }
  });

  fastify.get('/me', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    try {
      const result = await db.query('SELECT id, email, name, role, plan, streak, preferences, "photoURL", "createdAt" FROM users WHERE id = $1', [request.user.id]);
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }
      const user = result.rows[0];
      const streak = markUserActivity(user.id, 'session_active');
      user.streak = streak;
      setUserStreak(user.id, streak);
      return { user };
    } catch (err) {
      request.log.error(err);
      const localUser = createOrGetLocalUser({ email: request.user.email, name: request.user.email?.split('@')[0] });
      if (localUser) {
        localUser.streak = markUserActivity(localUser.id, 'session_active');
        return { user: localUser };
      }
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
};
