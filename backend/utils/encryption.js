const crypto = require('crypto');

let key = new Map();

const generateSymmetricKey = (userId) => { 
  if (!key.has(userId)) {
    key.set(userId, crypto.randomBytes(32).toString('hex'));
  }
  return key.get(userId);
};

function removeSymmetricKey(userId) {
  key.delete(userId, true);
}

const encryptionKey = process.env.KEY_ENCRYPTION_KEY;
const ivHex = process.env.IVHEX;

function encrypt(text) {
  const key = Buffer.from(encryptionKey, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(text) {
  const key = Buffer.from(encryptionKey, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function encryptMessage(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decrypMessage(encryptedText, key) {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encrypt, decrypt, encryptMessage, decrypMessage, generateSymmetricKey,removeSymmetricKey };
