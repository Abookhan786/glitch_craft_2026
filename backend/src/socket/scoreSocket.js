let io;

const initSocket = (socketIo) => {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });

    // Client can request current scoreboard
    socket.on('scoreboard:request', async () => {
      socket.emit('scoreboard:current', { requested: true });
    });
  });
};

const emitScoreUpdate = (data) => {
  if (io) io.emit('score:update', data);
};

const emitAnnouncement = (message) => {
  if (io) io.emit('announcement', { message, timestamp: new Date().toISOString() });
};

module.exports = { initSocket, emitScoreUpdate, emitAnnouncement };
