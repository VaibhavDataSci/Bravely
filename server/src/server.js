const buildApp = require('./app');
const { PORT } = require('./config/env');
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

    // Initialize Queues Worker
    require('./queues/worker');

    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`Server listening on port ${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
