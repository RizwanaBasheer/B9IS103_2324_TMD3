import React, { createContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const OnlineUsersContext = createContext();

const OnlineUsersProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState(null);
  const socket = useRef();

  useEffect(() => {
    const token = sessionStorage.getItem('token') || '';
    const url = process.env.REACT_APP_API_BASE_URL;

    if (!url) {
      console.error('REACT_APP_API_BASE_URL is not defined');
      return;
    }

    socket.current = io(url, {
      query: {
        token,
      },
    });

    socket.current.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    socket.current.on('onlineUsers', (onlineUsers) => {
      if (Array.isArray(onlineUsers)) {
        setOnlineUsers(onlineUsers);
      } else {
        console.warn('Received non-array data for online users');
      }
    });

    socket.current.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setError(err);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  return (
    <OnlineUsersContext.Provider value={{ onlineUsers, error }}>
      {children}
    </OnlineUsersContext.Provider>
  );
};

export { OnlineUsersProvider, OnlineUsersContext };
