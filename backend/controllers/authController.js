// controllers/authController.js
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PrivateKey = require('../models/PrivateKey');
const PublicKey = require('../models/PublicKey');
const { encrypt, decrypt } = require('../utils/encryption'); 

// const axios = require("axios");
const generateToken = require("../utils/generateToken.js");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_SECRET
);

exports.googleAuth3 = async (req, res) => {
  const { credential, clientId } = req.body;
  try {
    console.log(1);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];
    console.log(2);
    // const email = payload?.data?.payload?.email;
    console.log(3);

    res.status(200).json({ token, payload, email });
  } catch (err) {
    console.log(err);
    res.status(400).json({ err });
  }
};

exports.googleAuth2 = async (req, res) => {
  console.log(33, req.body);
  const { access_token } = req.body;

  console.log(4);
  if (access_token) {
    console.log(5);
    const tokenInfo = await client.getTokenInfo(access_token);
    console.log(tokenInfo);

    if (tokenInfo.email) {
      // sign jwt token  and send response
    }

    // below code didn't work so refered another code from documentation
    // await axios
    //   .get(
    //     `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`,
    //     {
    //       headers: {
    //         Authorization: `Bearer ${access_token}`,
    //         Accept: "application/json",
    //       },
    //     }
    //   )
    //   .then((res) => {
    //     res.status(200).json({ token, payload, email });
    //   })
    //   .catch((err) => {
    //     res.status(400).json({ err });
    //   });
  }
};

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
