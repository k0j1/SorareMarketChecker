import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { MarketEventPayload, TokenOffer } from '../types';

export function useSorareSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [marketEvents, setMarketEvents] = useState<TokenOffer[]>([]);

  useEffect(() => {
    // Connect to the same host that serves the Vite app (our Express server)
    const socketInstance = io();

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to Sorare Market Socket');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      setIsAuthenticated(false);
      console.log('Disconnected from Socket');
    });

    socketInstance.on('authenticated', (response: { success: boolean }) => {
      if (response.success) {
        setIsAuthenticated(true);
      }
    });

    socketInstance.on('market-event', (payload: MarketEventPayload) => {
      if (payload?.data?.tokenOfferWasCreated) {
        setMarketEvents((prev) => [payload.data.tokenOfferWasCreated, ...prev].slice(0, 50)); // Keep last 50
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const authenticate = useCallback((credentials: { email?: string; password?: string }) => {
    if (socket) {
      socket.emit('authenticate', credentials);
    }
  }, [socket]);

  const subscribe = useCallback((filters: any) => {
    if (socket) {
      socket.emit('subscribe', filters);
    }
  }, [socket]);

  const unsubscribe = useCallback(() => {
    if (socket) {
      socket.emit('unsubscribe');
    }
  }, [socket]);
  
  const clearEvents = useCallback(() => {
    setMarketEvents([]);
  }, []);

  return {
    isConnected,
    isAuthenticated,
    marketEvents,
    authenticate,
    subscribe,
    unsubscribe,
    clearEvents
  };
}
