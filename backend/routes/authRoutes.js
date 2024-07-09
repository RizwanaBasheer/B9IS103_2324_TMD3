// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/google', authController.googleAuth);

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), authController.googleAuthCallback);

module.exports = router;
