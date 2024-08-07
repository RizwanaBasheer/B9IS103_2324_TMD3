// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const router = express.Router();
const { authenticateJWT } = require('../middleware/authMiddleware');

router.get('/google', authController.googleAuth);
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), authController.googleAuthCallback);

router.get('/user',authenticateJWT, authController.user);

router.get('/logout',authenticateJWT, authController.logout);


module.exports = router;
