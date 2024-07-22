// server.js
const app = require('./index');
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server);

require('./sockets/chatSocket')(io);

const PORT = process.env.PORT_SOCKETIO || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
