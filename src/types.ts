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

export interface UserCard {
  id: string;
  name: string;
  slug: string;
  pictureUrl: string | null;
  rarityTyped: string;
  player: {
    displayName: string;
  };
  lowestPriceCardAnySeason?: {
    publicMinPrices?: {
      eurCents: number;
    } | null;
  } | null;
}
