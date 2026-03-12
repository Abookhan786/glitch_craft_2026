import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

let globalSocket = null;

export const useSocket = (events = {}) => {
  const handlersRef = useRef(events);
  handlersRef.current = events;

  useEffect(() => {
    if (!globalSocket) {
      globalSocket = io(window.location.origin, { transports: ['websocket', 'polling'] });
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
