const buildApp = require('./app');
const { PORT, ENABLE_REDIS_JOBS } = require('./config/env');
const { Server } = require('socket.io');

async function start() {
  try {
    const app = await buildApp();
    
    // Setup Socket.IO
    await app.ready();
    const io = new Server(app.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Attach Socket Handlers
    require('./socket/index')(io);

    // Initialize queue worker only when explicitly enabled.
    if (ENABLE_REDIS_JOBS) {
      require('./queues/worker');
      app.log.info('Redis jobs enabled: reports worker started');
    } else {
      app.log.warn('Redis jobs disabled (set ENABLE_REDIS_JOBS=true to enable BullMQ worker)');
    }

    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`Server listening on port ${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
