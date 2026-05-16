import Fastify from 'fastify';
import { Server } from 'socket.io';

const fastify = Fastify({ logger: true });

fastify.get('/health', async (request, reply) => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };
});

// We need to wait for fastify to be ready before attaching socket.io
fastify.ready((err) => {
  if (err) throw err;
  
  const io = new Server(fastify.server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', ({ roomId, userId }) => {
      socket.join(roomId);
      console.log(`User ${userId} (${socket.id}) joined room: ${roomId}`);
      
      // Notify others in room
      socket.to(roomId).emit('user-joined', { userId, socketId: socket.id });
      
      // Get list of existing users in the room and send back to the joiner
      const clients = io.sockets.adapter.rooms.get(roomId);
      const existingUsers = clients ? Array.from(clients).filter(id => id !== socket.id) : [];
      socket.emit('existing-users', existingUsers);
    });

    socket.on('offer', (payload) => {
      io.to(payload.target).emit('offer', payload);
    });

    socket.on('answer', (payload) => {
      io.to(payload.target).emit('answer', payload);
    });

    socket.on('ice-candidate', (payload) => {
      io.to(payload.target).emit('ice-candidate', payload);
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room: ${roomId}`);
      socket.to(roomId).emit('user-left', socket.id);
    });

    socket.on('disconnecting', () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.to(room).emit('user-left', socket.id);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Signaling server running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();


