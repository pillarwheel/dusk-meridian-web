/**
 * Creature Codex API Endpoints
 *
 * API wrapper for the Creature Codex (Monster Manual) system
 */

import { API_ENDPOINTS } from '@/utils/constants';

// Base URL for creature codex endpoints
const CREATURE_CODEX_BASE = `${API_ENDPOINTS.BASE_URL}/creaturecodex`;

// Type definitions matching the API response

export interface CreatureAbility {
  abilityId: number;
  abilityName: string;
  abilityType: string;
  description: string;
  damageType: string;
  cooldownSeconds: number;
  telegraphTime: number;
  rangeMeters: number;
  aoeRadius: number;
  estimatedDamage: number;
  counterStrategies: string;
  phaseNumber: number;
}

export interface CreatureResource {
  resourceId: number;
  resourceName: string;
  resourceType: string;
  rarity: string;
  description: string;
  dropRatePercentage: number;
  quantityMin: number;
  quantityMax: number;
  marketValue: number;
  gatheringSkill: string;
  gatheringDifficulty: number;
}

export interface CreatureCombatPhase {
  phaseId: number;
  phaseNumber: number;
  phaseName: string;
  healthThresholdPercentage: number;
  description: string;
  behaviorChanges: string;
  newAbilities: string;
  environmentalChanges: string;
  transitionDescription: string;
}

export interface CreatureListItem {
  codexId: number;
  creatureName: string;
  creatureType: string;
  threatLevel: string;
  size: string;
  environmentalZone: string;
  mmoFunction: string;
  estimatedLevelMin: number;
  estimatedLevelMax: number;
  codexCategory: string;
  isDiscovered: boolean;
  isPublic: boolean;
}

export interface CreatureDetail extends CreatureListItem {
  intelligence: string;
  loreDescription: string;
  physicalDescription: string;
  behaviorDescription: string;
  estimatedHealth: number;
  estimatedDamage: number;
  estimatedArmor: number;
  estimatedSpeed: number;
  temperatureMin: number;
  temperatureMax: number;
  radiationResistance: number;
  createdAt: string;
  updatedAt: string;
  abilities: CreatureAbility[];
  resources: CreatureResource[];
  combatPhases: CreatureCombatPhase[];
}

export interface PaginatedCreatureResponse {
  data: CreatureListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreatureFilterParams {
  page?: number;
  pageSize?: number;
  zone?: string;
  threatLevel?: string;
  mmoFunction?: string;
  minLevel?: number;
  maxLevel?: number;
  search?: string;
  sortBy?: 'name' | 'level' | 'threat' | 'zone';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Creature Codex API client
 */
export const creatureCodexApi = {
  /**
   * Get paginated list of creatures with optional filtering
   */
  async getCreatures(params?: CreatureFilterParams): Promise<PaginatedCreatureResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.zone) queryParams.append('zone', params.zone);
    if (params?.threatLevel) queryParams.append('threatLevel', params.threatLevel);
    if (params?.mmoFunction) queryParams.append('mmoFunction', params.mmoFunction);
    if (params?.minLevel) queryParams.append('minLevel', params.minLevel.toString());
    if (params?.maxLevel) queryParams.append('maxLevel', params.maxLevel.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const url = `${CREATURE_CODEX_BASE}/creatures${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch creatures: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get detailed information about a specific creature by ID
   */
  async getCreatureById(id: number): Promise<CreatureDetail> {
    const response = await fetch(`${CREATURE_CODEX_BASE}/creatures/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch creature ${id}: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get creature by name
   */
  async getCreatureByName(name: string): Promise<CreatureDetail> {
    const response = await fetch(`${CREATURE_CODEX_BASE}/creatures/by-name/${encodeURIComponent(name)}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch creature "${name}": ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get all abilities for a specific creature
   */
  async getCreatureAbilities(id: number): Promise<CreatureAbility[]> {
    const response = await fetch(`${CREATURE_CODEX_BASE}/creatures/${id}/abilities`);

    if (!response.ok) {
      throw new Error(`Failed to fetch abilities for creature ${id}: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get all resource drops for a specific creature
   */
  async getCreatureResources(id: number): Promise<CreatureResource[]> {
    const response = await fetch(`${CREATURE_CODEX_BASE}/creatures/${id}/resources`);

    if (!response.ok) {
      throw new Error(`Failed to fetch resources for creature ${id}: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get combat phases for a specific creature (world bosses)
   */
  async getCreatureCombatPhases(id: number): Promise<CreatureCombatPhase[]> {
    const response = await fetch(`${CREATURE_CODEX_BASE}/creatures/${id}/combat-phases`);

    if (!response.ok) {
      throw new Error(`Failed to fetch combat phases for creature ${id}: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get all creatures in a specific zone
   */
  async getCreaturesByZone(zone: string): Promise<CreatureListItem[]> {
    const response = await fetch(`${CREATURE_CODEX_BASE}/zones/${encodeURIComponent(zone)}/creatures`);

    if (!response.ok) {
      throw new Error(`Failed to fetch creatures for zone "${zone}": ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get all world bosses
   */
  async getWorldBosses(): Promise<CreatureDetail[]> {
    const response = await fetch(`${CREATURE_CODEX_BASE}/world-bosses`);

    if (!response.ok) {
      throw new Error(`Failed to fetch world bosses: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Search creatures
   */
  async searchCreatures(query: string): Promise<PaginatedCreatureResponse> {
    const response = await fetch(`${CREATURE_CODEX_BASE}/search?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`Failed to search creatures: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get creature codex statistics
   */
  async getStats(): Promise<{
    totalCreatures: number;
    discoveredCreatures: number;
    creaturesByZone: Record<string, number>;
    creaturesByThreat: Record<string, number>;
    worldBossCount: number;
  }> {
    const response = await fetch(`${CREATURE_CODEX_BASE}/stats`);

    if (!response.ok) {
      throw new Error(`Failed to fetch creature stats: ${response.statusText}`);
    }

    return response.json();
  }
};
