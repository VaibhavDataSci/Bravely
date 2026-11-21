// WebRTC signalling. TODO(security): authenticate the handshake and restrict
// offer/answer/ice-candidate targets to sockets in the same room (peer/group step).
export default function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, userId }) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined', { userId, socketId: socket.id });

      const clients = io.sockets.adapter.rooms.get(roomId);
      const existingUsers = clients ? Array.from(clients).filter((id) => id !== socket.id) : [];
      socket.emit('existing-users', existingUsers);
    });

    socket.on('offer', (payload) => io.to(payload.target).emit('offer', payload));
    socket.on('answer', (payload) => io.to(payload.target).emit('answer', payload));
    socket.on('ice-candidate', (payload) => io.to(payload.target).emit('ice-candidate', payload));

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', socket.id);
    });

    socket.on('disconnecting', () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) socket.to(room).emit('user-left', socket.id);
      }
    });
  });
}
