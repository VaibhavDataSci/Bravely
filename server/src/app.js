const fastify = require('fastify');
const cors = require('@fastify/cors');
const helmet = require('@fastify/helmet');
const rateLimit = require('@fastify/rate-limit');
const jwt = require('@fastify/jwt');
const multipart = require('@fastify/multipart');
const { JWT_SECRET } = require('./config/env');

async function buildApp() {
  const app = fastify({ logger: true });

  // Core Middleware
  await app.register(helmet);
  await app.register(cors, { origin: true });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });
  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  });

  // Auth Middleware
  await app.register(jwt, {
    secret: JWT_SECRET,
  });

  // Decorate app with auth check
  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // Register Routes
  app.register(require('./modules/auth/routes'), { prefix: '/api/auth' });
  app.register(require('./modules/profile/routes'), { prefix: '/api/profile' });
  app.register(require('./modules/dashboard/routes'), { prefix: '/api/dashboard' });
  app.register(require('./modules/interview/routes'), { prefix: '/api/interview' });
  app.register(require('./modules/coding/routes'), { prefix: '/api/coding' });
  app.register(require('./modules/peers/routes'), { prefix: '/api/peers' });
  app.register(require('./modules/rooms/routes'), { prefix: '/api/rooms' });
  app.register(require('./modules/daily/routes'), { prefix: '/api/daily' });
  app.register(require('./modules/reports/routes'), { prefix: '/api/reports' });
  app.register(require('./modules/settings/routes'), { prefix: '/api/settings' });

  // Basic Health Check
  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}

module.exports = buildApp;
