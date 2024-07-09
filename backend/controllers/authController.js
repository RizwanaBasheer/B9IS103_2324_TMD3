// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
