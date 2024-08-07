const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();
require('./utils/encryption');
require('./config/passport');

const app = express();
const server = http.createServer(app);
const corsConfig = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "x-symmetric-key"],
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    secure: false,
    maxAge: 3600000,
  },
  genid: () => crypto.randomBytes(16).toString('hex'),
});

// Middleware
app.use(cors(corsConfig));
app.use(express.json());
app.use(sessionMiddleware);

app.get('/', async (req, res) => {
  res.send('Hello, Vercel!');
});

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next);
});

io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) return next(new Error('Authentication error'));

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = decoded;
    next();
  });
});

io.on('connection', async (socket) => {
  const userId = socket.user.id;
  if (userId) {
    try {
      let user = await User.findById(userId);
      onlineUsers.push({ id: userId, email: user.email });
    } catch (err) {
      console.error('Error fetching user:', err);
    }

    const uniqueData = Object.values(
      onlineUsers.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {})
    );

    io.emit('onlineUsers', uniqueData);

    socket.on('disconnect', async () => {
      console.log('User disconnected:', userId);

      try {
        let user = await User.findById(userId);
        delete onlineUsers[user.email];
      } catch (err) {
        console.error('Error fetching user:', err);
      }
      
      io.emit('onlineUsers', Object.keys(onlineUsers));
    });
  } else {
    console.log('User ID not found');
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

module.exports = app;
