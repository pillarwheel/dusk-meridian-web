import { apiClient } from '../client';
import {
  NFTListing,
  NFTMetadata,
  MarketplaceStats,
  ListingFilters,
  UserNFTs,
  CreateListingRequest,
  PlaceBidRequest,
  BidInfo,
  AuctionListing,
  PaginatedResponse
} from '../types';

export const marketplaceApi = {
  async getListings(filters?: ListingFilters): Promise<PaginatedResponse<NFTListing>> {
    const response = await apiClient.get<PaginatedResponse<NFTListing>>('/marketplace/listings', {
      params: filters,
    });
    return response.data;
  },

  async getListing(listingId: string): Promise<NFTListing> {
    const response = await apiClient.get<NFTListing>(`/marketplace/listings/${listingId}`);
    return response.data;
  },

  async createListing(request: CreateListingRequest): Promise<NFTListing> {
    const response = await apiClient.post<NFTListing>('/marketplace/listings', request);
    return response.data;
  },

  async cancelListing(listingId: string): Promise<void> {
    await apiClient.delete(`/marketplace/listings/${listingId}`);
  },

  async purchaseNFT(listingId: string): Promise<{
    transactionHash: string;
    buyer: string;
    seller: string;
    price: string;
    nft: NFTMetadata;
  }> {
    const response = await apiClient.post(`/marketplace/listings/${listingId}/purchase`);
    return response.data;
  },

  async getAuctions(filters?: ListingFilters): Promise<PaginatedResponse<AuctionListing>> {
    const response = await apiClient.get<PaginatedResponse<AuctionListing>>('/marketplace/auctions', {
      params: filters,
    });
    return response.data;
  },

  async getAuction(auctionId: string): Promise<AuctionListing> {
    const response = await apiClient.get<AuctionListing>(`/marketplace/auctions/${auctionId}`);
    return response.data;
  },

  async placeBid(auctionId: string, request: PlaceBidRequest): Promise<BidInfo> {
    const response = await apiClient.post<BidInfo>(`/marketplace/auctions/${auctionId}/bid`, request);
    return response.data;
  },

  async getBids(auctionId: string): Promise<BidInfo[]> {
    const response = await apiClient.get<BidInfo[]>(`/marketplace/auctions/${auctionId}/bids`);
    return response.data;
  },

  async getUserBids(): Promise<BidInfo[]> {
    const response = await apiClient.get<BidInfo[]>('/marketplace/bids/my');
    return response.data;
  },

  async cancelBid(bidId: string): Promise<void> {
    await apiClient.delete(`/marketplace/bids/${bidId}`);
  },

  async acceptBid(bidId: string): Promise<{
    transactionHash: string;
    buyer: string;
    seller: string;
    price: string;
    nft: NFTMetadata;
  }> {
    const response = await apiClient.post(`/marketplace/bids/${bidId}/accept`);
    return response.data;
  },

  async getMarketplaceStats(): Promise<MarketplaceStats> {
    const response = await apiClient.get<MarketplaceStats>('/marketplace/stats');
    return response.data;
  },

  async getCollectionStats(contractAddress: string): Promise<{
    totalListings: number;
    floorPrice: string;
    volumeTraded: string;
    averagePrice: string;
    uniqueOwners: number;
    totalSupply: number;
    priceHistory: Array<{ timestamp: string; price: string; volume: string }>;
  }> {
    const response = await apiClient.get(`/marketplace/collections/${contractAddress}/stats`);
    return response.data;
  },

  async getUserNFTs(): Promise<UserNFTs> {
    const response = await apiClient.get<UserNFTs>('/marketplace/user/nfts');
    return response.data;
  },

  async getUserListings(): Promise<NFTListing[]> {
    const response = await apiClient.get<NFTListing[]>('/marketplace/user/listings');
    return response.data;
  },

  async getUserPurchases(): Promise<Array<{
    id: string;
    nft: NFTMetadata;
    price: string;
    currency: string;
    purchasedAt: string;
    transactionHash: string;
  }>> {
    const response = await apiClient.get('/marketplace/user/purchases');
    return response.data;
  },

  async getUserSales(): Promise<Array<{
    id: string;
    nft: NFTMetadata;
    price: string;
    currency: string;
    soldAt: string;
    buyer: string;
    transactionHash: string;
  }>> {
    const response = await apiClient.get('/marketplace/user/sales');
    return response.data;
  },

  async addToWatchlist(tokenId: string): Promise<void> {
    await apiClient.post('/marketplace/watchlist', { tokenId });
  },

  async removeFromWatchlist(tokenId: string): Promise<void> {
    await apiClient.delete('/marketplace/watchlist', { data: { tokenId } });
  },

  async getWatchlist(): Promise<NFTMetadata[]> {
    const response = await apiClient.get<NFTMetadata[]>('/marketplace/watchlist');
    return response.data;
  },

  async getNFTHistory(tokenId: string): Promise<Array<{
    id: string;
    type: 'mint' | 'sale' | 'transfer' | 'listing' | 'bid';
    from?: string;
    to?: string;
    price?: string;
    currency?: string;
    timestamp: string;
    transactionHash: string;
  }>> {
    const response = await apiClient.get(`/marketplace/nft/${tokenId}/history`);
    return response.data;
  },

  async getNFTMetadata(tokenId: string): Promise<NFTMetadata> {
    const response = await apiClient.get<NFTMetadata>(`/marketplace/nft/${tokenId}/metadata`);
    return response.data;
  },

  async refreshNFTMetadata(tokenId: string): Promise<NFTMetadata> {
    const response = await apiClient.post<NFTMetadata>(`/marketplace/nft/${tokenId}/refresh`);
    return response.data;
  },

  async getCollections(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    contractAddress: string;
    totalSupply: number;
    floorPrice?: string;
    volumeTraded: string;
    verified: boolean;
    category: string;
  }>> {
    const response = await apiClient.get('/marketplace/collections');
    return response.data;
  },

  async getPopularNFTs(): Promise<NFTMetadata[]> {
    const response = await apiClient.get<NFTMetadata[]>('/marketplace/popular');
    return response.data;
  },

  async getRecentSales(): Promise<Array<{
    id: string;
    nft: NFTMetadata;
    price: string;
    currency: string;
    buyer: string;
    seller: string;
    timestamp: string;
    transactionHash: string;
  }>> {
    const response = await apiClient.get('/marketplace/recent-sales');
    return response.data;
  },

  async searchNFTs(query: string, filters?: ListingFilters): Promise<PaginatedResponse<NFTListing>> {
    const response = await apiClient.get<PaginatedResponse<NFTListing>>('/marketplace/search', {
      params: { query, ...filters },
    });
    return response.data;
  }
};