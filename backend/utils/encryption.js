const crypto = require('crypto');

let key = undefined

const generateSymmetricKey = () => {
  if(key===undefined){
    key = crypto.randomBytes(32).toString('hex'); 
  }
  return key
} 

const encryptionKey = process.env.KEY_ENCRYPTION_KEY
const ivHex = process.env.IVHEX

// Encrypt function
function encrypt(text) {
  const key = Buffer.from(encryptionKey, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Decrypt function
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

// Decrypt function for messages
function decrypMessage(encryptedText, key) {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Function to encrypt message using recipient's public key
function encryptMessage(message, publicKeyPEM) {
  const bufferMessage = Buffer.from(message, 'utf8');
  const encrypted = crypto.publicEncrypt({
    key: publicKeyPEM,
    padding: crypto.constants.RSA_PKCS1_PADDING // Ensure correct padding
  }, bufferMessage);

  return encrypted.toString('base64');
}

// Function to decrypt message using recipient's private key
function decryptMessage(encryptedMessage, privateKeyPEM) {
  const bufferEncrypted = Buffer.from(encryptedMessage, 'base64');
  const decrypted = crypto.privateDecrypt({
    key: privateKeyPEM,
    padding: crypto.constants.RSA_PKCS1_PADDING // Ensure correct padding
  }, bufferEncrypted);

  return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt , encryptMessage, decryptMessage, generateSymmetricKey };
