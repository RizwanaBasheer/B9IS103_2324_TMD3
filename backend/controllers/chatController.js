const { encrypt, decrypt, encryptMessage, decrypMessage, generateSymmetricKey } = require('../utils/encryption');
const Message = require('../models/Message');
const User = require('../models/User');
const PublicKey = require('../models/PublicKey');
const PrivateKey = require('../models/PrivateKey');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { checkAndUpdateEmailSent, markEmailAsSent } = require('../utils/cache'); // Adjust the path as needed
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

    const symmetricKey = generateSymmetricKey(recipient.id);
    const encryptedRecieverId = encrypt(recipient.id.toString());
    const publicKeyDoc = await PublicKey.findOne({ userId: encryptedRecieverId  });

    if (!publicKeyDoc) return res.status(404).json({ error: 'Public key not found' });

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
    });
    await message.save();

    // Check or update email status
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

    res.status(200).json({ message: 'Message sent and key emailed if necessary' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
  
    // Fetch all messages for the user as sender or receiver from the database
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    });

    if (!messages.length) {
      return res.status(404).json({ error: 'No messages found' });
    }

    // Retrieve the encrypted symmetric key from the headers
    let encryptedSymmetricKey = req.headers['x-symmetric-key'];

    if (!encryptedSymmetricKey) {
      return res.status(400).json({ error: 'Symmetric key not found in headers' });
    }

    // Fetch the user's private key
    const recipient = await User.findById(userId);
    const encryptedUserId = encrypt(recipient.id);
    const privateKeyDoc = await PrivateKey.findOne({ userId: encryptedUserId });

    if (!privateKeyDoc) {
      throw new Error('Private key not found');
    }

    const privateKeyPEM = decrypt(privateKeyDoc.privateKey);

    // Process messages and decrypt content
    const decryptedMessages = [];
    for (const message of messages) {
      try {
        let keyToUse;
        // Determine which symmetric key to use
        if (message.sender.equals(userId)) {
          keyToUse = message.senderSymmetricKey;
        } else {
          keyToUse = message.ReceiverSymmetricKey === undefined ? encryptedSymmetricKey : message.ReceiverSymmetricKey;
        }

        // Decrypt the symmetric key
        const symmetricKey1 = await decryptMessageKey(keyToUse, privateKeyPEM);

        // Decrypt the message content
        const decryptedContent = await decrypMessage(message.content, symmetricKey1);

        // Update ReceiverSymmetricKey if not already set
        if (message.receiver.equals(userId) && decryptedContent && message.ReceiverSymmetricKey === undefined) {
          message.ReceiverSymmetricKey = encryptedSymmetricKey;
          await message.save();
        }

        let senderemail = await User.findOne({_id:message.sender})
        let recieveremail = await User.findOne({_id:message.receiver})
        
        // Add the decrypted message to the result array
        decryptedMessages.push({
          ...message.toObject(),
          content: decryptedContent,
          userPosition:message.receiver.equals(userId) ? 'reciever':'sender',
          senderEmail:senderemail.email,
          recieverEmail:recieveremail.email,
          senderSymmetricKey: undefined,
          ReceiverSymmetricKey: undefined,
        });        
      } catch (err) {
        console.error('Error decrypting message:', err);
      }
    }

    res.status(200).json({ messages: decryptedMessages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
