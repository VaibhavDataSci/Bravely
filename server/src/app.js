const fastify = require('fastify');
const cors = require('@fastify/cors');
const helmet = require('@fastify/helmet');
const rateLimit = require('@fastify/rate-limit');
const jwt = require('@fastify/jwt');
const multipart = require('@fastify/multipart');
const { JWT_SECRET } = require('./config/env');

async function buildApp() {
  const app = fastify({ logger: true });

  // ── CORS — explicit allowlist so browsers always receive the header ──────────
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(o => o.trim());

  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ── Security & limits ────────────────────────────────────────────────────────
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });
  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });

  // ── Auth ─────────────────────────────────────────────────────────────────────
  await app.register(jwt, { secret: JWT_SECRET });

  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // ── Health check — registered BEFORE route plugins so it's always available ──
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  }));

  // ── Feature Routes ───────────────────────────────────────────────────────────
  app.register(require('./modules/auth/routes'),      { prefix: '/api/auth' });
  app.register(require('./modules/profile/routes'),   { prefix: '/api/profile' });
  app.register(require('./modules/dashboard/routes'), { prefix: '/api/dashboard' });
  app.register(require('./modules/interview/routes'), { prefix: '/api/interview' });
  app.register(require('./modules/coding/routes'),    { prefix: '/api/coding' });
  app.register(require('./modules/peers/routes'),     { prefix: '/api/peers' });
  app.register(require('./modules/rooms/routes'),     { prefix: '/api/rooms' });
  app.register(require('./modules/daily/routes'),     { prefix: '/api/daily' });
  app.register(require('./modules/reports/routes'),   { prefix: '/api/reports' });
  app.register(require('./modules/settings/routes'),  { prefix: '/api/settings' });
  app.register(require('./modules/ai/routes'),        { prefix: '/api/ai' });

  return app;
}

module.exports = buildApp;
