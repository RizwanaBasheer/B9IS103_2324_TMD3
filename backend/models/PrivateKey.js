const mongoose = require('mongoose');

const privateKeySchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true, unique: true },
  privateKey: { type: String, required: true },
});

const PrivateKey = mongoose.model('PrivateKey', privateKeySchema);
module.exports = PrivateKey;
