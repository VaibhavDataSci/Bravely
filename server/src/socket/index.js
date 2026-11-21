// WebRTC signalling. Every socket must present a valid JWT, identity comes from that token
// (never from the client), and offers/answers/ICE can only reach sockets in a shared room.
const ROOM_ID = /^[\w-]{1,64}$/;
export const MAX_ROOM_SIZE = 8;

/** Socket.IO middleware. `verify` throws when the token is missing, invalid or expired. */
export function authenticateSocket(verify) {
  return (socket, next) => {
    try {
      socket.data.user = verify(socket.handshake.auth?.token);
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  };
}

const sharesRoom = (a, b) => [...a.rooms].some((room) => room !== a.id && b.rooms.has(room));

export default function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    const userId = socket.data.user?.id;

    socket.on('join-room', ({ roomId } = {}) => {
      if (typeof roomId !== 'string' || !ROOM_ID.test(roomId)) return socket.emit('error-message', 'invalid_room');
      const clients = io.sockets.adapter.rooms.get(roomId);
      if (clients && !clients.has(socket.id) && clients.size >= MAX_ROOM_SIZE) return socket.emit('error-message', 'room_full');

      socket.join(roomId);
      socket.to(roomId).emit('user-joined', { userId, socketId: socket.id });
      const existing = io.sockets.adapter.rooms.get(roomId);
      socket.emit('existing-users', existing ? Array.from(existing).filter((id) => id !== socket.id) : []);
    });

    // `caller` is always the real sender, so one participant cannot impersonate another.
    const relay = (event) => socket.on(event, (payload = {}) => {
      const target = typeof payload.target === 'string' ? io.sockets.sockets.get(payload.target) : null;
      if (!target || !sharesRoom(socket, target)) return;
      target.emit(event, { ...payload, caller: socket.id });
    });
    ['offer', 'answer', 'ice-candidate'].forEach(relay);

    socket.on('leave-room', (roomId) => {
      if (typeof roomId !== 'string' || !socket.rooms.has(roomId)) return;
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
