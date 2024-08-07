// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  timestamp: { type: Date, default: Date.now },
  senderSymmetricKey: String, 
  ReceiverSymmetricKey: String, 
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;

