// controllers/chatController.js
const { encrypt, decrypt, encryptMessage, decryptMessage } = require('../utils/encryption');
const Message = require('../models/Message');
const User = require('../models/User');
const PublicKey = require('../models/PublicKey');
const PrivateKey = require('../models/PrivateKey');
require('dotenv').config();


exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    console.log(req.body);
    const sender = req.user.id;

    const recipient = await User.findById(receiverId);
    if (recipient) {
      const encryptedUserId = encrypt(recipient.id);


      const publicKeyDoc = await PublicKey.findOne({ userId: encryptedUserId });

      console.log(publicKeyDoc);

      if (!publicKeyDoc) {
        return res.status(404).json({ error: 'Keys not found' });
      }

      // Decrypt keys
      const publicKeyPEM = decrypt(publicKeyDoc.publicKey);
      const encryptedContent = encryptMessage(content, publicKeyPEM);

      // Save to database
      const message = new Message({
        sender: sender,
        receiver: receiverId,
        content: encryptedContent
      });
      await message.save();

      res.status(200).json({ message: 'Message sent' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const recipientId = req.user.id; // Assuming req.user.id contains the authenticated user's ID
    console.log(recipientId);
    // Fetch recipient's private key (normally you'd handle this securely)
    const recipient = await User.findById(recipientId);
    if (recipient) {
      const encryptedUserId = encrypt(recipient.id);


      const PrivateKeyDoc = await PrivateKey.findOne({ userId: encryptedUserId });

      if (!PrivateKeyDoc) {
        return res.status(404).json({ error: 'Keys not found' });
      }

      // Decrypt keys
      const PrivateKeyPEM = decrypt(PrivateKeyDoc.privateKey);

      console.log(recipient);

      // Fetch all messages for the recipient from the database
      const messages = await Message.find({ receiver: recipientId });
      if (!messages.length) {
        return res.status(404).json({ error: 'No messages found' });
      }

      console.log(messages);

      // Decrypt each message content
      const decryptedMessages = messages.map(message => ({
        sender: message.sender,
        content: decryptMessage(message.content, PrivateKeyPEM),
        createdAt: message.createdAt
      }));

      res.status(200).json({ messages: decryptedMessages });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};