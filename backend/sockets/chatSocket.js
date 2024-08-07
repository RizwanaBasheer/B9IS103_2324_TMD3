const jwt = require('jsonwebtoken');
const onlineUsers = []; // Store online users with userId as the key
const User = require('../models/User');

const main = (io, sessionMiddleware) => {
  // Apply session middleware to Socket.IO
  io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (!token) return next(new Error('Authentication error'));

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.user = decoded; // Attach decoded user info to socket
      next();
    });
  });

  io.on('connection', async (socket) => {
    const userId = socket.user.id; // Assuming `id` is the user identifier in the token
    if (userId) {
      try {
        let user = await User.findById(userId); // Fetch user details
        onlineUsers.push({ id: userId, email: user.email })
      } catch (err) {
        console.error('Error fetching user:', err);
      }

      const uniqueData = Object.values(
        onlineUsers.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {})
      );
      console.log(uniqueData);

      // Emit the list of online users to all connected clients
      io.emit('onlineUsers', uniqueData);

      socket.on('disconnect', async () => {
        console.log('User disconnected:', userId);

        try {
          let user = await User.findById(userId); // Fetch user details
          delete onlineUsers[user.email];
        } catch (err) {
          console.error('Error fetching user:', err);
        }

        // Emit the updated list of online users to all connected clients
        io.emit('onlineUsers', Object.keys(onlineUsers));
      });
    } else {
      console.log('User ID not found');
    }
  });
};

module.exports = { main };
