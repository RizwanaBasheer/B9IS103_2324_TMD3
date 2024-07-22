// controllers/authController.js
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PrivateKey = require('../models/PrivateKey');
const PublicKey = require('../models/PublicKey');
const { encrypt, decrypt } = require('../utils/encryption'); 

// const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_SECRET
);

exports.googleAuth3 = async (req, res) => {
  const { credential, clientId } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];
    const email = payload?.data?.payload?.email || null;

    res.status(200).json({ token, payload, email });
  } catch (err) {
    console.log(err);
    res.status(400).json({ err });
  }
};

exports.googleAuth2 = async (req, res) => {
  const { access_token } = req.body;

  if (access_token) {
    try{
      const tokenInfo = await client.getTokenInfo(access_token);
      console.log(tokenInfo)
      if (tokenInfo.email) {
        const user = await User.findOne({ email: tokenInfo.email });
        console.log(user)
        if(!user){
          console.log(1)
          const user = new User({
            email: tokenInfo.email,
          });
          const newUser = await user.save();
          console.log(newUser);
          generatedToken = jwt.sign(newUser, process.env.JWT_SECRET, { expiresIn: '1h' })
        }else{
          console.log(2)
          // TODO FIX TOKEN GENERATION
          const generatedToken = jwt.sign({email:user.email}, process.env.JWT_SECRET, { expiresIn: '1h' })
          // const token = jwt.sign(payload, process.env.JWT_SECRET, {
          //   expiresIn: process.env.EXPIRESIN,
          // });
          console.log(generateToken)
        }
      }
      res.status(200).json({ generatedToken });  
    }catch(err){
      res.status(500).json({ error: '1Internal Server Error' });
    }
  }
};

exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

exports.googleAuthCallback = async (req, res) => {
  try {
    const { user } = req;
   
    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
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

exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      // Clear the session cookie
      res.clearCookie('connect.sid'); // 'connect.sid' is the default session cookie name

      // Send a response
      res.status(200).json({ message: 'Successfully logged out' });
    });
  });
};
