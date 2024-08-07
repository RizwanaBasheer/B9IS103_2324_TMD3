import React, { createContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const OnlineUsersContext = createContext();

const OnlineUsersProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = useRef();

  useEffect(() => {
    socket.current = io(process.env.REACT_APP_API_BASE_URL, {
      query: {
        token: sessionStorage.getItem('token') || '',
      }
    });

    socket.current.on('onlineUsers', (onlineUsers) => {

      
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
