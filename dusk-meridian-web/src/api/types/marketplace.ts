export interface NFTListing {
  id: string;
  tokenId: string;
  contractAddress: string;
  seller: string;
  price: string; // In wei
  currency: 'ETH' | 'DUSK' | 'PLR';
  status: ListingStatus;
  listedAt: string;
  expiresAt?: string;
  metadata: NFTMetadata;
  sales: NFTSale[];
}

export interface NFTMetadata {
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  animationUrl?: string;
  externalUrl?: string;
  attributes: NFTAttribute[];
  rarity: ItemRarity;
  collection: NFTCollection;
  category: NFTCategory;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'boost_number' | 'boost_percentage' | 'number' | 'date';
  max_value?: number;
}

export interface NFTCollection {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  contractAddress: string;
  totalSupply: number;
  floorPrice?: string;
  volumeTraded: string;
  verified: boolean;
}

export interface NFTSale {
  id: string;
  tokenId: string;
  buyer: string;
  seller: string;
  price: string;
  currency: 'ETH' | 'DUSK' | 'PLR';
  transactionHash: string;
  timestamp: string;
}

export interface MarketplaceStats {
  totalListings: number;
  totalSales: number;
  totalVolume: string;
  floorPrice: string;
  averagePrice: string;
  topCollections: TopCollection[];
  recentSales: NFTSale[];
  priceHistory: PricePoint[];
}

export interface TopCollection {
  collection: NFTCollection;
  volume24h: string;
  volumeChange: number;
  floorPrice: string;
  floorPriceChange: number;
}

export interface PricePoint {
  timestamp: string;
  price: string;
  volume: string;
}

export interface ListingFilters {
  collections?: string[];
  minPrice?: string;
  maxPrice?: string;
  currency?: 'ETH' | 'DUSK' | 'PLR';
  rarity?: ItemRarity[];
  category?: NFTCategory[];
  attributes?: AttributeFilter[];
  status?: ListingStatus[];
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
}

export interface AttributeFilter {
  trait_type: string;
  values: (string | number)[];
}

export interface UserNFTs {
  owned: NFTMetadata[];
  listed: NFTListing[];
  bids: BidInfo[];
  watchlist: string[]; // tokenIds
}

export interface BidInfo {
  id: string;
  tokenId: string;
  bidder: string;
  amount: string;
  currency: 'ETH' | 'DUSK' | 'PLR';
  expiresAt: string;
  status: BidStatus;
  placedAt: string;
}

export interface AuctionListing extends NFTListing {
  auctionType: 'english' | 'dutch';
  startPrice: string;
  reservePrice?: string;
  currentBid?: string;
  bidCount: number;
  endsAt: string;
  bids: BidInfo[];
}

export interface CreateListingRequest {
  tokenId: string;
  price: string;
  currency: 'ETH' | 'DUSK' | 'PLR';
  duration?: number; // in days
  isAuction?: boolean;
  reservePrice?: string;
}

export interface PlaceBidRequest {
  tokenId: string;
  amount: string;
  currency: 'ETH' | 'DUSK' | 'PLR';
  duration?: number; // in days
}

export type ListingStatus =
  | 'active'
  | 'sold'
  | 'cancelled'
  | 'expired';

export type BidStatus =
  | 'active'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'outbid';

export type NFTCategory =
  | 'character'
  | 'power_source'
  | 'equipment'
  | 'land'
  | 'consumable'
  | 'blueprint';

export type SortOption =
  | 'price_low_to_high'
  | 'price_high_to_low'
  | 'newest'
  | 'oldest'
  | 'ending_soon'
  | 'most_popular';