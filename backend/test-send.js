const io = require('socket.io-client');
require('dotenv').config();

const senderToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2OWQ0MGY3ZTFkMTgwOTZjMjM5YWFmOCIsImlhdCI6MTcyMjA1MjQxNSwiZXhwIjoxNzIyMDU2MDE1fQ.oCIMvKHVkKo_h7Hf_n2C9brNlKILrHYf-krUBy7q1lU'

const senderSocket = io('http://localhost:5000', {
  query: { token: senderToken }
});

senderSocket.on('connect', () => {
  console.log('Sender connected');

  // Test sending a message
  senderSocket.emit('sendMessage', {
    receiverEmail: 'behonestfull@gmail.com',
    content: 'Hello from socket.io-client!',
  });

  console.log('Message sent from sender');
});

senderSocket.on('disconnect', () => {
  console.log('Sender disconnected');
});


senderSocket.on('connect_error', (err) => {
  console.error('Sender connection error:', err.message);
});

