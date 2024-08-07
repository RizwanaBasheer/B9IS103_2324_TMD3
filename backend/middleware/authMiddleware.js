// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticateJWT = (req, res, next) => {
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
