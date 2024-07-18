const mongoose = require('mongoose');

const publicKeySchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true, unique: true },
  publicKey: { type: String, required: true },
});

const PublicKey = mongoose.model('PublicKey', publicKeySchema);
module.exports = PublicKey;
