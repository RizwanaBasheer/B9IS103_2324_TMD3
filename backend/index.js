const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 5000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

mongoose.connect("mongodb+srv://rizwanabasheer067:hNzeKAhi1VEyfUoQ@inote.mbucrtj.mongodb.net/chat_app?retryWrites=true&w=majority&appName=INote")
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });