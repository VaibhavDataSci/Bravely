import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { JWT_SECRET, CORS_ORIGINS } from './config/env.js';

import authRoutes from './modules/auth/routes.js';
import profileRoutes from './modules/profile/routes.js';
import dashboardRoutes from './modules/dashboard/routes.js';
import interviewRoutes from './modules/interview/routes.js';
import codingRoutes from './modules/coding/routes.js';
import peersRoutes from './modules/peers/routes.js';
import roomsRoutes from './modules/rooms/routes.js';
import dailyRoutes from './modules/daily/routes.js';
import reportsRoutes from './modules/reports/routes.js';
import settingsRoutes from './modules/settings/routes.js';

export default async function buildApp(options = {}) {
  const app = fastify({ logger: options.logger ?? true });

  await app.register(helmet);
  await app.register(cors, {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
  await app.register(jwt, { secret: JWT_SECRET });

  // Routes opt in with { onRequest: [fastify.authenticate] }. The frontend logs the
  // user out on any 401 and shows a session-expired message for code "token_expired".
  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      const expired = err?.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED';
      return reply.code(401).send({
        error: expired ? 'Your session has expired. Please sign in again.' : 'Authentication required',
        code: expired ? 'token_expired' : 'unauthenticated',
      });
    }
  });

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(profileRoutes, { prefix: '/api/profile' });
  app.register(dashboardRoutes, { prefix: '/api/dashboard' });
  app.register(interviewRoutes, { prefix: '/api/interview' });
  app.register(codingRoutes, { prefix: '/api/coding' });
  app.register(peersRoutes, { prefix: '/api/peers' });
  app.register(roomsRoutes, { prefix: '/api/rooms' });
  app.register(dailyRoutes, { prefix: '/api/daily' });
  app.register(reportsRoutes, { prefix: '/api/reports' });
  app.register(settingsRoutes, { prefix: '/api/settings' });

  return app;
}
