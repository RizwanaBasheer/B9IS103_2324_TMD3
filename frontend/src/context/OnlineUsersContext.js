import React, { createContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const OnlineUsersContext = createContext();

const OnlineUsersProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = useRef();
  console.log(process.env.REACT_APP_API_BASE_URL);
  
  useEffect(() => {
    socket.current = io('https://b9is103-2324-tmd3-rnrf.onrender.com', {
      query: {
        token: sessionStorage.getItem('token') || '',
      },
      transports: ['websocket', 'polling'], // Make sure to include transports

    });

    socket.current.on('onlineUsers', (onlineUsers) => {

      
      if (Array.isArray(onlineUsers)) {
        console.log(onlineUsers);
        
        setOnlineUsers(onlineUsers);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  return (
    <OnlineUsersContext.Provider value={onlineUsers}>
      {children}
    </OnlineUsersContext.Provider>
  );
};

export { OnlineUsersProvider, OnlineUsersContext };
