import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

let globalSocket = null;
const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://glitch-craft-2026.onrender.com';

export const useSocket = (events = {}) => {
  const handlersRef = useRef(events);
  handlersRef.current = events;

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io(socketUrl, { transports: ['websocket', 'polling'] });
    }

    const socket = globalSocket;

    Object.entries(handlersRef.current).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(handlersRef.current).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, []);

  const emit = useCallback((event, data) => {
    globalSocket?.emit(event, data);
  }, []);

  return { emit };
};
