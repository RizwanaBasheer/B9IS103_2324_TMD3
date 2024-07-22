// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const router = express.Router();
const { authenticateJWT } = require('../middleware/authMiddleware');

router.post("/google-auth2", authController.googleAuth2);
router.post("/google-auth3", authController.googleAuth3);
router.get('/google', authController.googleAuth);

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), authController.googleAuthCallback);

router.get('/user/keys', authenticateJWT, authController.getUserKeys);

router.get('/verify', authController.verifyToken);
router.get('/logout', authController.logout);


module.exports = router;
