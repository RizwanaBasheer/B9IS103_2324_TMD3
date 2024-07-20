const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();
require('./utils/encryption'); // Initialize encryption
require('./utils/jwt'); // Initialize JWT
require('./config/passport'); // Google Auth
require('./sockets/chatSocket'); // Initialize socket

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

mongoose.connect("mongodb+srv://rizwanabasheer067:hNzeKAhi1VEyfUoQ@inote.mbucrtj.mongodb.net/chat_app?retryWrites=true&w=majority&appName=INote")
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