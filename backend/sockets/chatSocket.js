const jwt = require('jsonwebtoken');
const { sendMessage, getMessages } = require('../controllers/chatController');
const sessionStore = require('../config/sessionStore.js'); // Your MongoDB session store

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
    console.log('User connected');

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });

    socket.on('sendMessage', async (data) => {
      const { receiverEmail, content } = data;
      const senderId = socket.user.id;

  try {
    // Create request and response mock objects
    const req = { body: { receiverEmail, content }, user: { id: senderId }, session: socket.session };
    const res = {
      status: (code) => ({
        json: (response) => {
          socket.emit('messageStatus', { code, response });
        }
      })
    };

    // Send message
    await sendMessage(req, res);
    // Update session in MongoDB
    socket.session.emailSent = true;
    await sessionStore.set(socket.session.id, socket.session);

  } catch (error) {
    console.error(error);
    socket.emit('messageStatus', { code: 500, response: { error: 'Internal Server Error' } });
  }
});

socket.on('getMessages', async (data) => {
  const req = { headers: { 'x-symmetric-key': data.symmetricKey }, user: socket.user };
  const res = {
    status: (code) => ({
      json: (response) => {
        socket.emit('messages', { code, response });
      }
    })
  };

  try {
    await getMessages(req, res);
  } catch (error) {
    console.error(error);
    socket.emit('messages', { code: 500, response: { error: 'Internal Server Error' } });
  }
  });
 });
};

