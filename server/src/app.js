import fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { randomUUID } from 'node:crypto';
import { JWT_SECRET, CORS_ORIGINS, LOG_LEVEL, TRUST_PROXY, NODE_ENV, POSTGRES_URL } from './config/env.js';
import { query } from './config/db.js';

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
import aiRoutes from './modules/ai/routes.js';
import sessionRoutes from './modules/sessions/routes.js';

export default async function buildApp(options = {}) {
  const app = fastify({
    // Secrets never reach the logs.
    logger: options.logger ?? {
      level: LOG_LEVEL,
      redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
    },
    trustProxy: TRUST_PROXY,
    requestIdHeader: 'x-request-id',
    genReqId: () => randomUUID(),
    bodyLimit: 1024 * 1024,
  });

  // Every response carries the request id so a user report can be matched to a log line.
  app.addHook('onSend', async (request, reply) => { reply.header('x-request-id', request.id); });

  // One error shape for the whole API. Server errors are logged in full but never leak details.
  app.setErrorHandler((err, request, reply) => {
    const status = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
    if (status >= 500) {
      request.log.error({ err }, 'request failed');
      return reply.code(500).send({
        error: 'Something went wrong on our side. Please try again.',
        code: 'internal_error',
        requestId: request.id,
      });
    }
    const code = err.validation ? 'validation_error' : status === 429 ? 'rate_limited' : err.code || 'bad_request';
    return reply.code(status).send({ error: err.message, code });
  });
  app.setNotFoundHandler((request, reply) => reply.code(404).send({ error: 'Not found', code: 'not_found' }));

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

  // Readiness is stricter than liveness: it fails when the database is configured but unreachable,
  // so a load balancer stops sending traffic to an instance that cannot serve it.
  app.get('/ready', async (request, reply) => {
    if (!POSTGRES_URL) return { status: 'ok', database: 'not_configured', env: NODE_ENV };
    try {
      await query('select 1');
      return { status: 'ok', database: 'up' };
    } catch (err) {
      request.log.error({ err }, 'readiness check failed');
      return reply.code(503).send({ status: 'unavailable', database: 'down' });
    }
  });

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
  app.register(aiRoutes, { prefix: '/api/ai' });
  app.register(sessionRoutes, { prefix: '/api/sessions' });

  return app;
}
