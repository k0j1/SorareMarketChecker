export interface PlayerData {
  slug: string;
  displayName: string;
}

export interface TokenOffer {
  id: string;
  price: string;
  token: {
    player: PlayerData;
    name: string;
    rarity: string;
  };
  timestamp: string;
}

export interface MarketEventPayload {
  data: {
    tokenOfferWasCreated: TokenOffer;
  };
}

export interface SubscriptionConfig {
  playerNameQuery: string;
  targetMaxPriceEth: string;
  isActive: boolean;
}
