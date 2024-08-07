import React, { createContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const OnlineUsersContext = createContext();

const OnlineUsersProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = useRef();

  useEffect(() => {
    socket.current = io('http://localhost:5000', {
      query: {
        token: sessionStorage.getItem('token') || '',
      }
    });

    socket.current.on('onlineUsers', (onlineUsers) => {
      console.log(onlineUsers);
      // sessionStorage.setItem('users',onlineUsers)
      
      if (Array.isArray(onlineUsers)) {
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
