// controllers/chatController.js
const { encrypt, decrypt, encryptMessage, decryptMessage , generateSymmetricKey} = require('../utils/encryption');
const Message = require('../models/Message');
const User = require('../models/User');
const PublicKey = require('../models/PublicKey');
const PrivateKey = require('../models/PrivateKey');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { checkAndUpdateEmailSent, markEmailAsSent } = require('../utils/cache'); 
const crypto = require('crypto');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, // Sender's email address
    pass: process.env.EMAIL_PASS // Sender's email password
  }
});

const encryptMessageKey = (message, publicKeyPEM) => {
  const bufferMessage = Buffer.from(message, 'utf8');
  const encrypted = crypto.publicEncrypt({
    key: publicKeyPEM,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256"
  }, bufferMessage);
  return encrypted.toString('base64');
};

const decryptMessageKey = (encryptedMessage, privateKeyPEM) => {
  const bufferEncrypted = Buffer.from(encryptedMessage, 'base64');
  const decrypted = crypto.privateDecrypt({
    key: privateKeyPEM,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256"
  }, bufferEncrypted);
  return decrypted.toString('utf8');
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverEmail, content } = req.body;
    const senderId = req.user.id;

    const recipient = await User.findOne({ email: receiverEmail });
    if (!recipient) return res.status(404).json({ error: 'Recipient not found' });
  
    const senderUser = await User.findById(senderId);
    const recipientUser = await User.findOne({ email: receiverEmail });

    if (!senderUser.contacts.includes(receiverEmail)) {
      senderUser.contacts.push(receiverEmail);
      await senderUser.save();
    }

    if (!recipientUser.contacts.includes(senderUser.email)) {
      recipientUser.contacts.push(senderUser.email);
      await recipientUser.save();
    }

    const symmetricKey = generateSymmetricKey();
    console.log(symmetricKey);

    const encryptedRecieverId = encrypt(recipient.id.toString());
    const publicKeyDoc = await PublicKey.findOne({ userId: encryptedRecieverId  });

      if (!publicKeyDoc) return res.status(404).json({ error: 'Public Key not found' });

      const publicKeyPEM = publicKeyDoc.publicKey;
      const encryptedContent = encryptMessage(content, symmetricKey);
      const encryptedSymmetricKey = encryptMessageKey(symmetricKey, publicKeyPEM);
      const encryptedSenderId =  encrypt(senderId.toString());
      const publicKeyDoc1 = await PublicKey.findOne({ userId: encryptedSenderId  });
    
      if (!publicKeyDoc1) return res.status(404).json({ error: 'Public key not found' });
      const publicKeyPEM1 = publicKeyDoc1.publicKey;
      const senderEncryptedSymmetricKey = encryptMessageKey(symmetricKey, publicKeyPEM1);

      const message = new Message({
        sender: senderId,
        receiver: recipient.id,
        content: encryptedContent,
        senderSymmetricKey: senderEncryptedSymmetricKey,
        ReceiverSymmetricKey: encryptedSymmetricKey
      });
      await message.save();

      // Update session data to track email sent status
      if (!checkAndUpdateEmailSent(recipient.id)) {
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

      // Mark email as sent in cache
      markEmailAsSent(recipient.id);
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
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    });

    if (!messages.length) {
      return res.status(404).json({ error: 'No messages found' });
    }

    // Retrieve the encrypted symmetric key from the email header
    let encryptedSymmetricKey = req.headers['x-symmetric-key']; 
    
    if (!encryptedSymmetricKey) {
      return res.status(400).json({ error: 'Symmetric key not found in headers' });
    }
     
    // Fetch user's private key 
    const recipient = await User.findById(userId);
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