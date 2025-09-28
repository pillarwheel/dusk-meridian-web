import { apiClient } from '../client';
import * as CharacterTypes from '../types/character';
import axios from 'axios';
import { API_ENDPOINTS } from '../../utils/constants';
import { getBestValidToken, clearAllTokens } from '../../utils/tokenValidator';

// Create a custom API client for character endpoints that use /api/ instead of /api/v1/
const characterApiClient = axios.create({
  baseURL: API_ENDPOINTS.CHARACTER_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add comprehensive auth interceptor matching the main API client
characterApiClient.interceptors.request.use((config) => {
  // Use validated token retrieval (IMX first, then Auth0 fallback)
  const token = getBestValidToken();

  console.log('🎯 Character API Request Interceptor:');
  console.log('   URL:', config.url);
  console.log('   Method:', config.method?.toUpperCase());
  console.log('   Token available:', !!token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('   Token preview:', token.substring(0, 50) + '...');
    console.log('   Token length:', token.length);
    console.log('   Authorization header set:', `Bearer ${token.substring(0, 20)}...`);

    // Decode and show token claims for debugging
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      console.log('   Token claims summary:', {
        sub: decoded.sub,
        email: decoded.email,
        wallet_address: decoded.wallet_address,
        ether_key: decoded.ether_key,
        exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'No expiry'
      });

      // Show token fields - backend will map ether_key → wallet_address
      if (decoded.ether_key) {
        console.log('   ✅ ether_key found in JWT payload:', decoded.ether_key);
        console.log('   🔄 Backend will map ether_key → wallet_address automatically');
      } else {
        console.log('   ❌ ether_key missing from JWT payload');
      }

      // Add wallet address as a separate header if available
      const walletAddress = decoded.wallet_address || decoded.ether_key || decoded.imx_eth_address || decoded.zkevm_eth_address;
      if (walletAddress) {
        config.headers['X-Wallet-Address'] = walletAddress;
        console.log('   Added X-Wallet-Address header:', walletAddress);
      }

      // Add user email as header if available
      if (decoded.email) {
        config.headers['X-User-Email'] = decoded.email;
        console.log('   Added X-User-Email header:', decoded.email);
      }
    } catch (e) {
      console.log('   Could not decode token for inspection');
    }
  } else {
    console.log('   ❌ NO TOKEN - Request will be unauthenticated');
  }

  console.log('   All headers:', Object.keys(config.headers || {}));
  return config;
});

// Add response interceptor for consistent error handling
characterApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🚨 Character API 401 response - temporarily NOT clearing tokens for debugging');
      // Temporarily disable automatic token clearing for debugging
      // clearAllTokens();
      // Emit auth error event for Auth0 to handle
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
    }
    return Promise.reject(error);
  }
);

export const characterApi = {
  async getCharacters(): Promise<CharacterTypes.Character[]> {
    // Use the new IMX Passport-aware endpoint with custom character API client
    const response = await characterApiClient.get<CharacterTypes.Character[]>('/character/my-characters');
    return response.data;
  },

  async getCharacter(characterId: string): Promise<CharacterTypes.Character | null> {
    try {
      // For now, get all characters and find the specific one
      // TODO: Replace with dedicated single character endpoint when available
      const allCharacters = await this.getCharacters();
      const charactersArray = allCharacters?.characters || allCharacters || [];

      const character = charactersArray.find(c =>
        String(c.id) === String(characterId) || c.id === characterId
      );

      return character || null;
    } catch (error) {
      console.error('Failed to get character:', error);
      return null;
    }
  },

  async createCharacter(data: {
    name: string;
    class: string;
    worldId: number;
    factionId: number;
    appearance?: Record<string, any>;
  }): Promise<CharacterTypes.Character> {
    const response = await apiClient.post<CharacterTypes.Character>('/characters', data);
    return response.data;
  },

  async updateCharacter(characterId: string, data: Partial<CharacterTypes.Character>): Promise<CharacterTypes.Character> {
    const response = await apiClient.patch<CharacterTypes.Character>(`/characters/${characterId}`, data);
    return response.data;
  },

  async deleteCharacter(characterId: string): Promise<void> {
    await apiClient.delete(`/characters/${characterId}`);
  },

  async getCharacterEquipment(characterId: string): Promise<CharacterTypes.Equipment> {
    const response = await apiClient.get<CharacterTypes.Equipment>(`/characters/${characterId}/equipment`);
    return response.data;
  },

  async equipItem(characterId: string, itemId: string, slot: string): Promise<CharacterTypes.Equipment> {
    const response = await apiClient.post<CharacterTypes.Equipment>(`/characters/${characterId}/equipment`, {
      itemId,
      slot,
    });
    return response.data;
  },

  async unequipItem(characterId: string, slot: string): Promise<CharacterTypes.Equipment> {
    const response = await apiClient.delete<CharacterTypes.Equipment>(`/characters/${characterId}/equipment/${slot}`);
    return response.data;
  },

  async getCharacterInventory(characterId: string): Promise<CharacterTypes.InventoryItem[]> {
    const response = await apiClient.get<CharacterTypes.InventoryItem[]>(`/characters/${characterId}/inventory`);
    return response.data;
  },

  async addToInventory(characterId: string, itemId: string, quantity: number): Promise<CharacterTypes.InventoryItem[]> {
    const response = await apiClient.post<CharacterTypes.InventoryItem[]>(`/characters/${characterId}/inventory`, {
      itemId,
      quantity,
    });
    return response.data;
  },

  async removeFromInventory(characterId: string, itemId: string, quantity: number): Promise<CharacterTypes.InventoryItem[]> {
    const response = await apiClient.delete<CharacterTypes.InventoryItem[]>(`/characters/${characterId}/inventory`, {
      data: { itemId, quantity },
    });
    return response.data;
  },

  async getCharacterSkills(characterId: string): Promise<CharacterTypes.Skill[]> {
    const response = await apiClient.get<CharacterTypes.Skill[]>(`/characters/${characterId}/skills`);
    return response.data;
  },

  async upgradeSkill(characterId: string, skillId: string): Promise<CharacterTypes.Skill> {
    const response = await apiClient.post<CharacterTypes.Skill>(`/characters/${characterId}/skills/${skillId}/upgrade`);
    return response.data;
  },

  async learnSkill(characterId: string, skillId: string): Promise<CharacterTypes.Skill> {
    const response = await apiClient.post<CharacterTypes.Skill>(`/characters/${characterId}/skills`, { skillId });
    return response.data;
  },

  async moveCharacter(characterId: string, destination: {
    x: number;
    y: number;
    z: number;
    worldId: number;
  }): Promise<CharacterTypes.Character> {
    const response = await apiClient.post<CharacterTypes.Character>(`/characters/${characterId}/move`, destination);
    return response.data;
  },

  async useItem(characterId: string, itemId: string, target?: {
    characterId?: string;
    position?: { x: number; y: number; z: number };
  }): Promise<{
    character: CharacterTypes.Character;
    effects: Array<{ type: string; value: number; duration?: number }>;
  }> {
    const response = await apiClient.post(`/characters/${characterId}/use-item`, {
      itemId,
      target,
    });
    return response.data;
  },

  async craftItem(characterId: string, recipeId: string, quantity?: number): Promise<{
    character: CharacterTypes.Character;
    craftedItems: CharacterTypes.InventoryItem[];
    consumedMaterials: CharacterTypes.InventoryItem[];
  }> {
    const response = await apiClient.post(`/characters/${characterId}/craft`, {
      recipeId,
      quantity: quantity || 1,
    });
    return response.data;
  },

  async getCharacterStats(characterId: string): Promise<{
    combatStats: {
      monstersKilled: number;
      playersKilled: number;
      deaths: number;
      damageDealt: number;
      damageTaken: number;
      healingDone: number;
    };
    progressStats: {
      questsCompleted: number;
      itemsCrafted: number;
      distanceTraveled: number;
      timeOnline: number;
    };
    economicStats: {
      goldEarned: number;
      goldSpent: number;
      itemsSold: number;
      itemsBought: number;
    };
  }> {
    const response = await apiClient.get(`/characters/${characterId}/stats`);
    return response.data;
  },

  async getCharacterAchievements(characterId: string): Promise<Array<{
    id: string;
    name: string;
    description: string;
    unlockedAt: string;
    rarity: string;
    rewards: Array<{ type: string; value: any }>;
  }>> {
    const response = await apiClient.get(`/characters/${characterId}/achievements`);
    return response.data;
  },

  async restoreCharacter(characterId: string): Promise<CharacterTypes.Character> {
    const response = await apiClient.post<CharacterTypes.Character>(`/characters/${characterId}/restore`);
    return response.data;
  },

  async getCharacterHistory(characterId: string, params?: {
    type?: 'combat' | 'trade' | 'quest' | 'movement';
    limit?: number;
    since?: string;
  }): Promise<Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    location?: { x: number; y: number; z: number };
    participants?: string[];
    rewards?: Array<{ type: string; value: any }>;
  }>> {
    const response = await apiClient.get(`/characters/${characterId}/history`, { params });
    return response.data;
  }
};