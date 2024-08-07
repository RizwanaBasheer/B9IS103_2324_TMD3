const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { checkAndUpdateEmailSent, removeEmailAsSent } = require('../utils/cache'); // Adjust the path as needed
const { removeSymmetricKey } = require('../utils/encryption');

exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] },);

exports.googleAuthCallback = async (req, res) => {
  try {
    const { user } = req;
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`${process.env.FRONTEND_URL}?authtoken=${token}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.user = async (req, res) => {
  try {
    let user = await User.findById(req.user.id)
    res.status(201).json({
      email: user.email,
      name: user.name,
      profilePic: user.picture,
      contacts:user.contacts
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.logout = (req, res) => {
  removeEmailAsSent(req.user.id);
  removeSymmetricKey(req.user.id)

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
