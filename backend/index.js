const path = require("path");
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();
require('./utils/encryption'); // Initialize encryption
require('./utils/jwt'); // Initialize JWT
require('./config/passport'); // Google Auth
require('./sockets/chatSocket'); // Initialize socket

const port = process.env.PORT_SERVER || 5000;
const app = express();

if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  const __dirname = path.resolve();
  app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
  
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
  
app.use(passport.initialize());
app.use(passport.session());

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });

module.exports = app;