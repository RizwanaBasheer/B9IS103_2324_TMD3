const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: String,
  picture: String,
  password: String,
  contacts: [{ type: String }], // Store emails of contacts
  emailSent:{type:Boolean,default:false}
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
