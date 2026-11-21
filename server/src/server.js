import { Server } from 'socket.io';
import buildApp from './app.js';
import registerSocketHandlers, { authenticateSocket } from './socket/index.js';
import { closePool } from './config/db.js';
import { PORT, REDIS_URL, CORS_ORIGINS } from './config/env.js';

async function start() {
  const app = await buildApp();
  await app.ready();

  const io = new Server(app.server, {
    cors: { origin: CORS_ORIGINS, methods: ['GET', 'POST'] },
  });
  io.use(authenticateSocket((token) => app.jwt.verify(token)));
  registerSocketHandlers(io);

  let worker;
  if (REDIS_URL) {
    ({ reportsWorker: worker } = await import('./queues/worker.js'));
  } else {
    app.log.warn('REDIS_URL not set: report worker disabled');
  }

  await app.listen({ port: PORT, host: '0.0.0.0' });

  // Finish in-flight requests, then release connections. A hard exit follows if that stalls.
  let closing = false;
  const shutdown = async (signal) => {
    if (closing) return;
    closing = true;
    app.log.info({ signal }, 'shutting down');
    const force = setTimeout(() => process.exit(1), 10000);
    force.unref();
    try {
      await io.close();
      await worker?.close();
      await app.close();
      await closePool();
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, 'error during shutdown');
      process.exit(1);
    }
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
