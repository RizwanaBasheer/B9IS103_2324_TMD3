const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  emailSent: { type: Boolean, default: false },
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
