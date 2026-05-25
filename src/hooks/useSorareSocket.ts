import { useEffect, useState, useCallback, useRef } from 'react';
import { MarketEventPayload, TokenOffer } from '../types';

export function useSorareSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [marketEvents, setMarketEvents] = useState<TokenOffer[]>([]);
  
  const mockIntervalRef = useRef<number | null>(null);

  // 実際のアプリではここで graphql-ws クライアント等を初期化します
  // GitHub Pagesで動作させるため、サーバー通信はブラウザから直接行う想定のシミュレーションとします。
  useEffect(() => {
    setIsConnected(true);
    return () => {
      setIsConnected(false);
      if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    };
  }, []);

  const authenticate = useCallback(async (credentials: { email?: string; password?: string }) => {
    // 実際のSorare APIがCORSを許可している場合は、ブラウザから直接fetchでログインしトークンを取得できます。
    return new Promise((resolve) => {
      setTimeout(() => {
        if (credentials.email && credentials.password) {
          setIsAuthenticated(true);
          console.log('Client successfully authenticated. Mock JWT issued.');
        }
        resolve(true);
      }, 800);
    });
  }, []);

  const subscribe = useCallback((filters: any) => {
    if (!isAuthenticated) return;
    
    console.log('Subscribed to market events with filters:', filters);
    
    const mockPlayers = ["Kylian Mbappé", "Lionel Messi", "Erling Haaland", "Vinícius Júnior", "Kevin De Bruyne", "Jude Bellingham", "Rodri", "Harry Kane", "Mohamed Salah", "Takefusa Kubo", "Kaoru Mitoma", "Wataru Endo"];
    const mockRarities = ["Limited", "Rare", "Super Rare", "Unique"];
    
    if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    
    mockIntervalRef.current = window.setInterval(() => {
      const player = mockPlayers[Math.floor(Math.random() * mockPlayers.length)];
      const rarity = mockRarities[Math.floor(Math.random() * mockRarities.length)];
      const ethPrice = (Math.random() * 0.1 + 0.001).toFixed(4);
      
      const payload = {
        data: {
          tokenOfferWasCreated: {
            id: `offer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            price: ethPrice,
            token: {
              player: { displayName: player, slug: player.toLowerCase().replace(/ /g, "-") },
              name: `${player} 2023-2024`,
              rarity: rarity
            },
            timestamp: new Date().toISOString()
          }
        }
      };
      
      setMarketEvents((prev) => [payload.data.tokenOfferWasCreated, ...prev].slice(0, 50));
    }, 4000);
  }, [isAuthenticated]);

  const unsubscribe = useCallback(() => {
    console.log('Unsubscribed from market events');
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }
  }, []);
  
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
