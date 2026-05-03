import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

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
    // payload: { target: socketId, caller: socketId, sdp: RTCSessionDescription }
    io.to(payload.target).emit('offer', payload);
  });

  socket.on('answer', (payload) => {
    // payload: { target: socketId, caller: socketId, sdp: RTCSessionDescription }
    io.to(payload.target).emit('answer', payload);
  });

  socket.on('ice-candidate', (payload) => {
    // payload: { target: socketId, caller: socketId, candidate: RTCIceCandidate }
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

httpServer.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
