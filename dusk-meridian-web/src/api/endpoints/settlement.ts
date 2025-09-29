import { apiClient } from '../client';
// Temporary inline type to avoid import issues
interface SettlementListItem {
  settlement_id: number;
  name: string;
  continent_id: number;
  region_id: number;
  sub_region?: string;
  settlement_type: 'City' | 'Town' | 'Village' | 'Stronghold';
  population: number;
  dominant_faction?: number;
  government_type?: string;
  trade_importance: number;
  x_coordinate: number;
  y_coordinate: number;
  z_coordinate: number;
  public_view: boolean;
}
import axios from 'axios';
import { API_ENDPOINTS } from '../../utils/constants';
import { getBestValidToken } from '../../utils/tokenValidator';

// Create a custom API client for settlement endpoints matching character API pattern
const settlementApiClient = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add auth interceptor matching the character API
settlementApiClient.interceptors.request.use((config) => {
  const token = getBestValidToken();

  console.log('🏘️ Settlement API Request Interceptor:');
  console.log('   URL:', config.url);
  console.log('   Method:', config.method?.toUpperCase());
  console.log('   Token available:', !!token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('   Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
  } else {
    console.log('   ❌ NO TOKEN - Request will be unauthenticated');
  }

  return config;
});

export const settlementApi = {
  async getPublicSettlements(): Promise<SettlementListItem[]> {
    console.log('🏘️ getPublicSettlements: Starting API call using custom client');
    const response = await settlementApiClient.get<SettlementListItem[]>('/settlements/public');
    console.log('🏘️ getPublicSettlements: Response received:', response.data);
    return response.data;
  },

  async getSettlement(settlementId: number): Promise<any> {
    console.log('🏘️ getSettlement: Fetching settlement', settlementId);
    const response = await apiClient.get<any>(`/settlements/${settlementId}`);
    console.log('🏘️ getSettlement: Response type:', typeof response);
    console.log('🏘️ getSettlement: Response keys:', Object.keys(response));
    console.log('🏘️ getSettlement: Full response:', response);

    // Check if response.data exists (wrapped) or if response itself is the data
    const data = response.data || response;
    if (!data || typeof data !== 'object') {
      throw new Error('Settlement not found');
    }

    // Check if data is already in camelCase (already transformed)
    if (data.settlementId) {
      return data;
    }

    // Transform snake_case to camelCase
    return {
      settlementId: data.settlement_id,
      name: data.name,
      continentId: data.continent_id,
      regionId: data.region_id,
      subRegion: data.sub_region,
      settlementType: data.settlement_type,
      population: data.population,
      dominantFaction: data.dominant_faction,
      governmentType: data.government_type,
      tradeImportance: data.trade_importance,
      xCoordinate: data.x_coordinate,
      yCoordinate: data.y_coordinate,
      zCoordinate: data.z_coordinate,
      militarySignificance: data.military_significance,
      resources: data.resources,
    };
  },

  async getSettlementPopulation(settlementId: number): Promise<{
    total: number;
    characters: Array<{
      character_id: number;
      name: string;
      level: number;
      class: string;
    }>;
  }> {
    const response = await apiClient.get(`/settlements/${settlementId}/population`);
    return response.data;
  },

  async getSettlementBuildings(settlementId: number): Promise<Array<{
    buildingId: number;
    settlementId: number;
    name: string;
    type: string;
    xCoordinate: number;
    yCoordinate: number;
    zCoordinate: number;
    isDestroyed: boolean;
    isDamaged: boolean;
    isActive: boolean;
    prefabPath?: string;
    prefabName?: string;
  }>> {
    console.log('🏘️ getSettlementBuildings: Fetching buildings for settlement', settlementId);
    const response = await apiClient.get(`/settlements/${settlementId}/buildings`);
    console.log('🏘️ getSettlementBuildings: Response type:', typeof response);
    console.log('🏘️ getSettlementBuildings: Is array?:', Array.isArray(response));
    console.log('🏘️ getSettlementBuildings: Full response:', response);

    // Check if response.data exists (wrapped) or if response itself is the data
    const buildings = response.data || response;
    if (!buildings || !Array.isArray(buildings)) {
      return [];
    }

    // Check if already transformed
    if (buildings.length > 0 && buildings[0].buildingId) {
      return buildings;
    }

    // Transform snake_case to camelCase
    return buildings.map((building: any) => ({
      buildingId: building.building_id,
      settlementId: building.settlement_id,
      name: building.name,
      type: building.type,
      xCoordinate: building.x_coordinate,
      yCoordinate: building.y_coordinate,
      zCoordinate: building.z_coordinate,
      isDestroyed: building.is_destroyed,
      isDamaged: building.is_damaged,
      isActive: building.is_active,
      prefabPath: building.prefab_path,
      prefabName: building.prefab_name,
    }));
  }
};