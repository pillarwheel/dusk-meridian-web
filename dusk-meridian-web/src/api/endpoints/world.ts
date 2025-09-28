import { apiClient } from '../client';
import * as WorldTypes from '../types/world';
import * as SettlementTypes from '../types/settlement';

export const worldApi = {
  async getWorlds(): Promise<WorldTypes.World[]> {
    const response = await apiClient.get<WorldTypes.World[]>('/worlds');
    return response.data;
  },

  async getWorldDetails(worldId: number): Promise<WorldTypes.WorldDetails> {
    const response = await apiClient.get<WorldTypes.WorldDetails>(`/worlds/${worldId}`);
    return response.data;
  },

  async getSettlements(worldId: number): Promise<SettlementTypes.Settlement[]> {
    const response = await apiClient.get<SettlementTypes.Settlement[]>(`/worlds/${worldId}/settlements`);
    return response.data;
  },

  async getSettlement(worldId: number, settlementId: number): Promise<SettlementTypes.Settlement> {
    const response = await apiClient.get<SettlementTypes.Settlement>(`/worlds/${worldId}/settlements/${settlementId}`);
    return response.data;
  },

  async getFactions(worldId: number): Promise<WorldTypes.Faction[]> {
    const response = await apiClient.get<WorldTypes.Faction[]>(`/worlds/${worldId}/factions`);
    return response.data;
  },

  async getFaction(worldId: number, factionId: number): Promise<WorldTypes.Faction> {
    const response = await apiClient.get<WorldTypes.Faction>(`/worlds/${worldId}/factions/${factionId}`);
    return response.data;
  },

  async getPlayers(worldId: number, params?: {
    factionId?: number;
    online?: boolean;
    page?: number;
    limit?: number;
  }): Promise<WorldTypes.Player[]> {
    const response = await apiClient.get<WorldTypes.Player[]>(`/worlds/${worldId}/players`, { params });
    return response.data;
  },

  async getWorldStats(worldId: number): Promise<{
    playerCount: number;
    activePlayerCount: number;
    settlementCount: number;
    factionCount: number;
    totalCombats: number;
    totalTrades: number;
  }> {
    const response = await apiClient.get(`/worlds/${worldId}/stats`);
    return response.data;
  },

  async getWorldEvents(worldId: number, params?: {
    type?: string;
    limit?: number;
    since?: string;
  }): Promise<Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    participants: string[];
    location?: { x: number; y: number; z: number };
  }>> {
    const response = await apiClient.get(`/worlds/${worldId}/events`, { params });
    return response.data;
  },

  async getTerrainData(worldId: number, bounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }) {
    const response = await apiClient.get(`/worlds/${worldId}/terrain`, { params: bounds });
    return response.data;
  },

  async getResourceNodes(worldId: number): Promise<Array<{
    id: number;
    type: string;
    position: { x: number; y: number; z: number };
    yield: number;
    depleted: boolean;
    controlledBy?: number;
  }>> {
    const response = await apiClient.get(`/worlds/${worldId}/resources`);
    return response.data;
  },

  async getLandmarks(worldId: number) {
    const response = await apiClient.get(`/worlds/${worldId}/landmarks`);
    return response.data;
  },

  async getTerritoryControl(worldId: number): Promise<Array<{
    factionId: number;
    territories: Array<{
      id: string;
      name: string;
      bounds: Array<{ x: number; y: number }>;
      controlStrength: number;
    }>;
  }>> {
    const response = await apiClient.get(`/worlds/${worldId}/territory`);
    return response.data;
  },

  async getTradeRoutes(worldId: number): Promise<Array<{
    id: string;
    from: { x: number; y: number; z: number };
    to: { x: number; y: number; z: number };
    goods: string[];
    volume: number;
    active: boolean;
  }>> {
    const response = await apiClient.get(`/worlds/${worldId}/trade-routes`);
    return response.data;
  },

  async getMilitaryMovements(worldId: number): Promise<Array<{
    id: string;
    factionId: number;
    units: number;
    from: { x: number; y: number; z: number };
    to: { x: number; y: number; z: number };
    type: 'attack' | 'defense' | 'patrol' | 'trade';
    estimatedArrival: string;
  }>> {
    const response = await apiClient.get(`/worlds/${worldId}/military`);
    return response.data;
  }
};