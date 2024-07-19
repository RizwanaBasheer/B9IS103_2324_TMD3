// routes/chatRoutes.js
const express = require('express');
const chatController = require('../controllers/chatController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/send', authenticateJWT, chatController.sendMessage);

router.get('/messages', authenticateJWT, chatController.getMessages);

module.exports = router;
