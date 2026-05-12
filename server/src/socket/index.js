module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Placeholder events
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
