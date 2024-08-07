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
require('./utils/encryption'); // Initialize encryption
require('./config/passport'); // Google Auth

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
    maxAge: 3600000, // 1 hour
  },
  genid: () => crypto.randomBytes(16).toString('hex'), // Custom session ID generator
});

// Middleware
app.use(cors(corsConfig));
app.use(express.json());
app.use(sessionMiddleware);

app.get('/', async (req, res) => {
  res.send('Hello, World!');
});

// Middleware to ensure session is available for Socket.IO
io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next);
});

// Apply passport middlewares
app.use(passport.initialize());
app.use(passport.session());

// Routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

// Socket.IO setup for real-time messaging
require('./sockets/chatSocket').main(io, sessionMiddleware);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

module.exports = app;
