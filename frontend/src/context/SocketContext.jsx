import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        auth: { token: localStorage.getItem('token') },
      });
      setSocket(newSocket);
      return () => newSocket.close();
    }
  }, [user]);

  const joinGroup = (groupId) => socket?.emit('join_group', groupId);
  const leaveGroup = (groupId) => socket?.emit('leave_group', groupId);

  return (
    <SocketContext.Provider value={{ socket, joinGroup, leaveGroup }}>
      {children}
    </SocketContext.Provider>
  );
};
