const io = require('socket.io-client');
require('dotenv').config();

const receiverToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2OWQ0MGUyZTFkMTgwOTZjMjM5YWFmMCIsImlhdCI6MTcyMjA0ODk1MCwiZXhwIjoxNzIyMDUyNTUwfQ.rKgjOMJFguyDUcbt5YQ_6fD56BfGfX3RJuI0esopCXg'
const key = 'Lsn5OXsnupRujU0ymL/XsfHNfvGCJ7/wY63Bb5CxycBDlit/WPR+ayeU8oHww2WfBtF4QI7s3BBHPMf9qLER34toRkn9uDlNQWd66pEbDThKj7HCDaFlZFSiK3fEMZqSAG4gHEe/yqzCtVNvzY4AMXsDHvnYSQU+ypvhACiojUAwoOB02aaooYR351YefkwaY+DksLG8mENRyuLhCy32HjCT80bFr9A17MTo7l8p5Vp+36Qq+R9WAdLKHc4M8KSneYqgMqXC7nhCEMFVWqxrNdbAH+P3wN5LhuhIzk1wKBQw9elJX/FC+jQS9Pnn+sGi2S6Ufgk7RtOw31Defh1TSA==';


const receiverSocket = io('http://localhost:5000', {
  query: { token: receiverToken }
});

receiverSocket.on('connect', () => {
  console.log('Receiver connected');

  // Test receiving messages
  receiverSocket.on('messages', (message) => {
    console.log('Received message on receiver side:', message.response);
  });

  // Test getting messages
  receiverSocket.emit('getMessages', {
    encryptedSymmetricKey:key});
});

receiverSocket.on('receiveMessages', (messages) => {
  console.log('Received messages on receiver side:', messages);
});


receiverSocket.on('disconnect', () => {
  console.log('Receiver disconnected');
});

receiverSocket.on('connect_error', (err) => {
  console.error('Receiver connection error:', err.message);
});
