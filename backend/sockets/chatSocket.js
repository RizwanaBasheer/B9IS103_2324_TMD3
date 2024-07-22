// sockets/chatSocket.js
const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (!token) return next(new Error('Authentication error'));
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.user = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user ? socket.user.id : 'Unknown');

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user ? socket.user.id : 'Unknown');
    });
  });

  require('../controllers/chatController').initialize(io);

};
