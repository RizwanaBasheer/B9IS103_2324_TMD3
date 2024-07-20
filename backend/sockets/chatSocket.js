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
    console.log('User connected', socket.user.id);

    socket.on('sendMessage', async (data) => {
      const { receiverId, content } = data;
      const senderId = socket.user.id;

      const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
      });

      await newMessage.save();
      io.to(receiverId).emit('receiveMessage', newMessage);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected', socket.user.id);
    });
  });
};
