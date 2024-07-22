// controllers/chatController.js
const { encrypt, decrypt, encryptMessage, decryptMessage , encryptMessageKey, decryptMessageKey, generateSymmetricKey} = require('../utils/encryption');
const Message = require('../models/Message');
const User = require('../models/User');
const PublicKey = require('../models/PublicKey');
const PrivateKey = require('../models/PrivateKey');
const nodemailer = require('nodemailer');

require('dotenv').config();
let io;

exports.initialize = (socketIoInstance) => {
  io = socketIoInstance;
};

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, // Sender's email address
    pass: process.env.EMAIL_PASS // Sender's email password
  }
});

exports.sendMessage = async (req, res) => {
  try {
    const { receiverEmail, content } = req.body;
    const sender = req.user.id;

    const recipient = await User.findOne({ email: receiverEmail });
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const senderUser = await User.findById(sender);
    const recipientUser = await User.findOne({ email: receiverEmail });

    if (!senderUser.contacts.includes(receiverEmail)) {
      // Add recipient email to sender's contact list
      senderUser.contacts.push(receiverEmail);
      await senderUser.save();
    }

    if (!recipientUser.contacts.includes(senderUser.email)) {
      // Add sender email to recipient's contact list
      recipientUser.contacts.push(senderUser.email);
      await recipientUser.save();
    }

    const encryptedUserId = encrypt(recipient.id).toString();
    
    const publicKeyDoc = await PublicKey.findOne({ userId: encryptedUserId });

      if (!publicKeyDoc) {
        return res.status(404).json({ error: 'Public Key not found' });
      }

      // Decrypt Public Key 
      const publicKeyPEM = decrypt(publicKeyDoc.publicKey);
     
      // Generate a new symmetric key for the session
      const symmetricKey = generateSymmetricKey();
      console.log(symmetricKey);
      // Encrypt the message with the symmetric key
      const encryptedContent = encryptMessage(content, symmetricKey);

      // Encrypt the symmetric key with the recipient's public key
      const encryptedSymmetricKey = encryptMessageKey(symmetricKey, publicKeyPEM);

      // Save the encrypted message and the symmetric key to the database
    
      const message = new Message({
        sender,
        receiver: recipient.id,
        content: encryptedContent,
      });
      await message.save();

    // Emit the message to all connected clients
    io.emit('send_message', {
      senderId: senderUser.id,
      receiverId: recipient.id,
      content: content,
      timestamp: message.timestamp,
    });

    // Check if the email has already been sent during the current session
    if (!req.session.emailSent) {
      // Send the encrypted symmetric key via email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipient.email,
        subject: 'Encrypted Symmetric Key for Your Session',
        html: `
          <h1>Secure Communication Key</h1>
          <p>Hello ${recipient.email},</p>
          <p>You have received a new message from ${senderUser.email}. To read the message, please use the following encrypted symmetric key:</p>
          <p><strong>Encrypted Symmetric Key:</strong> ${encryptedSymmetricKey}</p>
          <p>Please use this key to decrypt the messages sent during this session. If you have any questions or need assistance, feel free to contact support.</p>
          <p>Best regards,<br>Your Communication Platform Team</p>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      // Mark that the email has been sent for this session
      req.session.emailSent = true;
    }

    res.status(200).json({ message: 'Message sent and key emailed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const recipientId = req.user.id;

    // Fetch all messages for the recipient from the database
    const messages = await Message.find({ receiver: recipientId });

    if (!messages.length) {
      return res.status(404).json({ error: 'No messages found' });
    }
    // Retrieve the encrypted symmetric key from the email header

    let encryptedSymmetricKey = req.headers['x-symmetric-key']; // Assuming this is set as a header
    
    if (!encryptedSymmetricKey) {
      return res.status(400).json({ error: 'Symmetric key not found in headers' });
    }
     
    // Fetch recipient's private key 
    const recipient = await User.findById(recipientId);
    const encryptedUserId = encrypt(recipient.id);

    const privateKeyDoc = await PrivateKey.findOne({ userId: encryptedUserId });

    if (!privateKeyDoc) {
      throw new Error('Private key not found');
    }
    
    const PrivateKeyPEM = decrypt(PrivateKeyDoc.privateKey);

    // Decrypt the symmetric key
    const symmetricKey = decryptMessageKey(encryptedSymmetricKey, privateKeyPEM);
  
     // Decrypt each message content
     const decryptedMessages = await Promise.all(messages.map(async (message) => {
      let decryptedContent = ''
      if(message.symmetricKey === undefined){
        decryptedContent = decrypMessage(message.content, symmetricKey);
        message.symmetricKey = encryptedSymmetricKey;
        await message.save();
      }
      else{
        decryptedContent = decrypMessage(message.content, decryptMessageKey(message.symmetricKey,privateKeyPEM));
      }
      console.log(decryptedContent);
      return {
        ...message.toObject(),
        content: decryptedContent,
      };
    }));

    res.status(200).json({ messages: decryptedMessages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};