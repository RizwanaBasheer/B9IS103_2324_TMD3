// import React, { useState, useEffect } from 'react';
// import { TextField, Button, List, ListItem, ListItemText, Typography } from '@mui/material';
// import axios from 'axios';

// function Chat() {
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     // Fetch user data and messages from your backend
//     const fetchData = async () => {
//       try {
//         const userResponse = await axios.get('/auth/user');
//         setUser(userResponse.data);

//         const messagesResponse = await axios.get('/messages');
//         setMessages(messagesResponse.data);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleSend = async () => {
//     if (message.trim()) {
//       try {
//         await axios.post('/messages', { text: message });
//         setMessages([...messages, { user: user.name, text: message }]);
//         setMessage('');
//       } catch (error) {
//         console.error("Error sending message:", error);
//       }
//     }
//   };

//   const handleSignOut = () => {
//     window.location.href = '/auth/signout';
//   };

//   return (
//     <div className="container mt-5">
//       <Button 
//         variant="contained" 
//         color="secondary" 
//         className="btn btn-secondary mb-3"
//         onClick={handleSignOut}
//       >
//         Sign Out
//       </Button>
//       <div>
//         <Typography variant="h5" className="mb-3">
//           Welcome, {user?.name}
//         </Typography>
//         <List className="mb-3">
//           {messages.map((msg, index) => (
//             <ListItem key={index} className="border-bottom">
//               <ListItemText primary={`${msg.user}: ${msg.text}`} />
//             </ListItem>
//           ))}
//         </List>
//         <div>
//           <TextField
//             label="Type a message"
//             fullWidth
//             variant="outlined"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//             className="mb-2"
//           />
//           <Button
//             variant="contained"
//             color="primary"
//             className="btn btn-primary"
//             onClick={handleSend}
//           >
//             Send
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Chat;

import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

function Chat() {
    const socket = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // Initialize socket connection
        socket.current = io('http://localhost:5000', {
            query: { userId: sessionStorage.getItem('id') }, // Replace with actual user ID
            transports: ['websocket'] // Specify transports if needed
        });

        // Handle connection events
        socket.current.on('connect', () => {
            setConnected(true);
            console.log('Connected to server');
        });

        socket.current.on('disconnect', () => {
            setConnected(false);
            console.log('Disconnected from server');
        });

        return () => {
            socket.current.disconnect(); // Clean up on component unmount
        };
    }, []);

    return (
        <div>
            <h1>{connected ? 'Connected' : 'Disconnected'}</h1>
        </div>
    );
}

export default Chat;