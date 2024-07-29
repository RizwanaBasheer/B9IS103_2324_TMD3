const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const MongoStore = require('connect-mongo'); // Import MongoStore
const cors = require('cors'); // Import CORS

require('dotenv').config();
require('./utils/encryption'); // Initialize encryption
require('./config/passport'); // Google Auth

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
  }),
  cookie: { secure: true, maxAge: 3600000, emailSent:false } // 1 hour
})

// Middleware
app.use(cors()); // Enable CORS for Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use((req, res, next) => {
  console.log('Session Middleware Execution:', req.session);
  next();
});

app.use(passport.initialize());
app.use(passport.session());

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

// Socket.IO setup for real-time messaging
require('./sockets/chatSocket')(io,sessionMiddleware);

// Start server
const PORT = process.env.PORT_SOCKETIO || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
