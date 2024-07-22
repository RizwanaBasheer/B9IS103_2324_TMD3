// controllers/authController.js
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PrivateKey = require('../models/PrivateKey');
const PublicKey = require('../models/PublicKey');
const { encrypt, decrypt } = require('../utils/encryption'); 

exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

exports.googleAuthCallback = async (req, res) => {
  try {
    const { user } = req;
   
    // Generate JWT token
    const token = jwt.sign({ id: user.id },"GoodDog", { expiresIn: '1h' });
    
    // Redirect or respond with token
    res.redirect(`/?token=${token}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getUserKeys = async (req, res) => {
  try {

    console.log(req.user);
    const encryptedUserId = encrypt(req.user.id.toString());
    console.log(encryptedUserId);

    const publicKeyDoc = await PublicKey.findOne({ userId: encryptedUserId });
    const privateKeyDoc = await PrivateKey.findOne({ userId: encryptedUserId });

    console.log(publicKeyDoc);
    console.log(privateKeyDoc);

    if (!publicKeyDoc || !privateKeyDoc) {
      return res.status(404).json({ error: 'Keys not found' });
    }

    // Decrypt keys
    const publicKeyPEM = decrypt(publicKeyDoc.publicKey);
    const privateKeyPEM = decrypt(privateKeyDoc.privateKey);

    res.status(200).json({ publicKey: publicKeyPEM, privateKey: privateKeyPEM });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Access Denied');
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send('Invalid Token');
  }
};
