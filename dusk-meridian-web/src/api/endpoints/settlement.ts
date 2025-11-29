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

    // Use the custom axios instance that doesn't expect wrapped responses
    const response = await settlementApiClient.get(`/settlements/${settlementId}`);
    console.log('🏘️ getSettlement: Response type:', typeof response);
    console.log('🏘️ getSettlement: Response keys:', Object.keys(response.data || response));
    console.log('🏘️ getSettlement: Full response:', response);

    // The response.data contains the settlement directly
    const data = response.data;
    if (!data || typeof data !== 'object') {
      throw new Error('Settlement not found');
    }

    // The API already returns camelCase, just return it directly
    return data;
  },

  async getSettlementPopulation(settlementId: number): Promise<{
    total: number;
    byBuilding: Array<{
      buildingId: number;
      buildingName: string;
      characters: Array<{
        characterId: number;
        name: string;
        level: number;
        class: string;
        xCoordinate: number;
        yCoordinate: number;
        zCoordinate: number;
      }>;
    }>;
    outdoor: Array<{
      characterId: number;
      name: string;
      level: number;
      class: string;
      xCoordinate: number;
      yCoordinate: number;
      zCoordinate: number;
    }>;
  }> {
    console.log('👥 getSettlementPopulation: Fetching detailed character data for settlement', settlementId);

    // Use the detailed characters endpoint
    const [charactersData, buildingsData] = await Promise.all([
      this.getSettlementCharacters(settlementId, false),
      this.getSettlementBuildings(settlementId)
    ]);

    console.log('👥 Got', charactersData.length, 'characters and', buildingsData.length, 'buildings');

    // Debug: Check first few characters
    if (charactersData.length > 0) {
      console.log('👥 Sample character data (first 3):');
      console.log('  Character 0:', charactersData[0]);
      console.log('  Character 1:', charactersData[1]);
      console.log('  Character 2:', charactersData[2]);
      console.log('👥 Character has buildingId?', 'buildingId' in charactersData[0]);
      console.log('👥 BuildingId value:', charactersData[0].buildingId);

      // Count characters with building assignments
      const charsWithBuildings = charactersData.filter(c => c.buildingId !== null && c.buildingId !== undefined).length;
      console.log(`👥 Characters with building assignments: ${charsWithBuildings} / ${charactersData.length}`);
    }

    // Create a map of settlement building IDs to building names
    const buildingMap = new Map(
      buildingsData.map(b => [b.settlementBuildingId, b.name])
    );

    // Helper function to check if a character is inside a building based on coordinates
    const findCharacterBuilding = (char: any): number | null => {
      // If buildingId is explicitly set, use it
      if (char.buildingId) {
        return char.buildingId;
      }

      // Try to match by character class to building name as a heuristic
      const classToBuilding: Record<string, string[]> = {
        'Blacksmith': ['Blacksmith', 'Forge'],
        'Armorer': ['Blacksmith', 'Forge', 'Armory'],
        'Librarian': ['Library'],
        'Scholar': ['Library', 'University'],
        'Merchant': ['Market', 'Marketplace', 'Trading Post', 'Shop'],
        'Innkeeper': ['Inn', 'Tavern'],
        'Guard': ['Barracks', 'Guard House', 'Garrison'],
        'Soldier': ['Barracks', 'Guard House', 'Garrison'],
        'Priest': ['Temple', 'Church', 'Shrine'],
        'Healer': ['Hospital', 'Infirmary', 'Clinic'],
        'Alchemist': ['Alchemy', 'Apothecary'],
        'Mage': ['Tower', 'Academy', 'Sanctum'],
        'Cook': ['Kitchen', 'Tavern', 'Inn'],
        'Farmer': ['Farm', 'Granary'],
        'Miner': ['Mine', 'Quarry']
      };

      const possibleBuildings = classToBuilding[char.class] || [];
      if (possibleBuildings.length > 0) {
        for (const building of buildingsData) {
          const buildingNameLower = building.name.toLowerCase();
          const buildingTypeLower = building.type.toLowerCase();

          if (possibleBuildings.some(type =>
            buildingNameLower.includes(type.toLowerCase()) ||
            buildingTypeLower.includes(type.toLowerCase())
          )) {
            return building.settlementBuildingId;
          }
        }
      }

      // If no class match, check if character coordinates are within any building bounds
      // Buildings at 0,0,0 are probably not placed yet, skip them
      for (const building of buildingsData) {
        if (building.xCoordinate === 0 && building.yCoordinate === 0 && building.zCoordinate === 0) {
          continue;
        }

        const dx = Math.abs(char.xCoordinate - building.xCoordinate);
        const dy = Math.abs(char.yCoordinate - building.yCoordinate);
        const dz = Math.abs(char.zCoordinate - building.zCoordinate);

        // If within ~20 units, consider them in this building
        if (dx < 20 && dy < 20 && dz < 5) {
          return building.settlementBuildingId;
        }
      }

      // Character is outdoor
      return null;
    };

    // Group characters by building
    const grouped = new Map<number, Array<any>>();
    const outdoor: Array<any> = [];

    charactersData.forEach((char) => {
      const character = {
        characterId: char.characterId,
        name: char.name,
        level: char.level,
        class: char.class,
        xCoordinate: char.xCoordinate,
        yCoordinate: char.yCoordinate,
        zCoordinate: char.zCoordinate
      };

      const buildingId = findCharacterBuilding(char);

      if (buildingId !== null) {
        if (!grouped.has(buildingId)) {
          grouped.set(buildingId, []);
        }
        grouped.get(buildingId)!.push(character);
      } else {
        outdoor.push(character);
      }
    });

    // Convert map to array and add building names
    const byBuilding = Array.from(grouped.entries())
      .map(([settlementBuildingId, chars]) => ({
        buildingId: settlementBuildingId,
        buildingName: buildingMap.get(settlementBuildingId) || `Building ${settlementBuildingId}`,
        characters: chars
      }))
      .sort((a, b) => a.buildingName.localeCompare(b.buildingName));

    console.log('👥 Grouped into', byBuilding.length, 'buildings with', byBuilding.reduce((sum, b) => sum + b.characters.length, 0), 'characters and', outdoor.length, 'outdoor characters');

    return {
      total: charactersData.length,
      byBuilding,
      outdoor
    };
  },

  async getSettlementCharacters(settlementId: number, outdoorOnly: boolean = false): Promise<Array<{
    characterId: number;
    name: string;
    class: string;
    level: number;
    xCoordinate: number;
    yCoordinate: number;
    zCoordinate: number;
    currentAction?: string;
    health: { current: number; max: number };
    isPlayer: boolean;
    buildingId?: number;
  }>> {
    console.log('👥 getSettlementCharacters: Fetching characters for settlement', settlementId, 'outdoor only:', outdoorOnly);

    const url = outdoorOnly
      ? `/settlements/${settlementId}/characters/outdoor`
      : `/settlements/${settlementId}/characters/detailed`;

    try {
      const response = await settlementApiClient.get(url);
      console.log('👥 Raw response from', url, ':', response);
      console.log('👥 Response type:', typeof response);
      console.log('👥 Response keys:', Object.keys(response.data || response));

      // Handle outdoor endpoint response format
      if (outdoorOnly && response.data.characters) {
        const data = response.data.characters;
        console.log('👥 Using outdoor format, found', data.length, 'characters');
        return data.map((char: any) => ({
          characterId: char.id,
          name: char.name,
          class: char.characterClass || 'Unknown',
          level: char.level || 1,
          xCoordinate: char.x,
          yCoordinate: char.y,
          zCoordinate: char.z,
          currentAction: char.activityType,
          health: { current: 100, max: 100 },
          isPlayer: true,
          buildingId: null
        }));
      }

      // Handle detailed endpoint response format (same structure as outdoor)
      if (response.data.characters && Array.isArray(response.data.characters)) {
        const data = response.data.characters;
        console.log('👥 Using detailed format with .characters property, found', data.length, 'characters');
        return data.map((char: any) => ({
          characterId: char.id,
          name: char.name,
          class: char.characterClass || 'Unknown',
          level: char.level || 1,
          xCoordinate: char.x,
          yCoordinate: char.y,
          zCoordinate: char.z,
          currentAction: char.activityType,
          health: { current: 100, max: 100 },
          isPlayer: true,
          buildingId: char.buildingId
        }));
      }

      // Fallback to direct array format
      const characters = response.data || response;
      console.log('👥 Using fallback format');
      console.log('👥 characters variable:', characters);
      console.log('👥 Is array?', Array.isArray(characters));

      if (!characters || !Array.isArray(characters)) {
        console.log('👥 Not an array or null, returning empty array');
        return [];
      }

      console.log('👥 Processing', characters.length, 'characters');
      console.log('👥 First character:', characters[0]);

      return characters.map((char: any) => ({
        characterId: char.id,
        name: char.name,
        class: char.characterClass || 'Unknown',
        level: char.level || 1,
        xCoordinate: char.x,
        yCoordinate: char.y,
        zCoordinate: char.z,
        currentAction: char.activityType,
        health: { current: 100, max: 100 },
        isPlayer: true,
        buildingId: char.buildingId
      }));
    } catch (err) {
      console.error('Failed to fetch settlement characters:', err);
      return [];
    }
  },

  async getSettlementBuildings(settlementId: number): Promise<Array<{
    settlementBuildingId: number;
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
    description?: string;
  }>> {
    console.log('🏘️ getSettlementBuildings: Fetching buildings for settlement', settlementId);

    try {
      const response = await settlementApiClient.get(`/settlements/${settlementId}/buildings`);
      console.log('🏘️ getSettlementBuildings: Response type:', typeof response);
      console.log('🏘️ getSettlementBuildings: Is array?:', Array.isArray(response));
      console.log('🏘️ getSettlementBuildings: Full response:', response);

      // Check if response.data exists (wrapped) or if response itself is the data
      const buildings = response.data || response;
      if (!buildings || !Array.isArray(buildings)) {
        console.warn('🏘️ getSettlementBuildings: Invalid response format, returning empty array');
        return [];
      }

      // Transform and extract building template data
      return buildings.map((building: any) => {
        const template = building.buildingTemplate || building.building_template;

        return {
          settlementBuildingId: building.settlementBuildingId || building.settlement_building_id,
          buildingId: building.buildingId || building.building_id,
          settlementId: building.settlementId || building.settlement_id,
          name: template?.name || `Building Template ${building.buildingId || building.building_id}`,
          type: template?.type || 'Unknown',
          xCoordinate: building.xCoordinate || building.x_coordinate || 0,
          yCoordinate: building.yCoordinate || building.y_coordinate || 0,
          zCoordinate: building.zCoordinate || building.z_coordinate || 0,
          isDestroyed: building.isDestroyed ?? building.is_destroyed ?? false,
          isDamaged: building.isDamaged ?? building.is_damaged ?? false,
          isActive: building.isActive ?? building.is_active ?? true,
          prefabPath: template?.prefabPath || template?.prefab_path,
          prefabName: template?.prefabName || template?.prefab_name,
          description: template?.description,
        };
      });
    } catch (error) {
      console.error('🏘️ getSettlementBuildings: Error fetching buildings:', error);
      // Return empty array on error to allow UI to display gracefully
      return [];
    }
  }
};