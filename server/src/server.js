import { Server } from 'socket.io';
import buildApp from './app.js';
import registerSocketHandlers from './socket/index.js';
import { PORT, REDIS_URL, CORS_ORIGINS } from './config/env.js';

async function start() {
  try {
    const app = await buildApp();
    await app.ready();

    const io = new Server(app.server, {
      cors: { origin: CORS_ORIGINS, methods: ['GET', 'POST'] },
    });
    registerSocketHandlers(io);

    if (REDIS_URL) {
      await import('./queues/worker.js');
    } else {
      app.log.warn('REDIS_URL not set: report worker disabled');
    }

    await app.listen({ port: PORT, host: '0.0.0.0' });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
