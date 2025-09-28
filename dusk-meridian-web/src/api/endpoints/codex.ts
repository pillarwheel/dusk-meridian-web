import { apiClient } from '../client';
// Temporarily comment out problematic imports to get app working
// import {
//   CodexEntry,
//   CodexCategory,
//   CodexResponse,
//   CodexSearchRequest,
//   CodexSearchResponse,
//   WorldStatistics,
//   PopulationStatistics,
//   CharacterClass,
//   Skill,
//   Profession,
//   Spell,
//   Technology,
//   ActionCategory,
//   SurvivalMechanic,
//   Continent,
//   Region,
//   SubRegion,
//   Settlement,
//   Building,
//   Faction,
//   Guild,
//   Resource,
//   CharacterLocation,
//   GameServerResponse
// } from '../types/codex';

// Minimal types for now
interface WorldStatistics {
  totalCharacters: number;
  totalClasses: number;
  onlinePlayers: number;
  totalSettlements: number;
  activeBattles: number;
  totalFactions: number;
  totalGuilds: number;
  worldTime: {
    currentDay: number;
    timeOfDay: number;
    season: string;
    year: number;
    serverTime: Date;
  };
  serverUptime: string;
  lastUpdated: Date;
}

// Cache configuration based on data update frequency
const CACHE_DURATION = {
  // Static data - updates rarely (daily or less)
  STATIC_DAILY: 24 * 60 * 60 * 1000, // 24 hours
  MECHANICS: 24 * 60 * 60 * 1000,    // Skills, spells, etc. don't change often
  GEOGRAPHY: 12 * 60 * 60 * 1000,    // Settlements may change but not frequently

  // Semi-dynamic data - updates periodically
  POPULATION: 10 * 60 * 1000,        // 10 minutes - population stats
  WORLD_STATS: 5 * 60 * 1000,        // 5 minutes - world statistics

  // Dynamic data - updates frequently
  CHARACTER_LOCATIONS: 30 * 1000,    // 30 seconds - character movement
  ONLINE_STATUS: 60 * 1000,          // 1 minute - online/offline status
} as const;

// Simple in-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, duration: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: now + duration
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new DataCache();

// Helper function for cached API calls
async function cachedApiCall<T>(
  key: string,
  apiCall: () => Promise<T>,
  cacheDuration: number
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key);
  if (cached) {
    return cached;
  }

  // Not in cache, make API call
  const data = await apiCall();
  cache.set(key, data, cacheDuration);
  return data;
}

// Temporary simplified API for basic functionality
export const codexApi = {
  // World Statistics (semi-dynamic data - 5 minute cache)
  async getWorldStatistics(): Promise<WorldStatistics> {
    // Mock data for now until import issues are resolved
    return {
      totalCharacters: 15647,
      totalClasses: 92,
      onlinePlayers: 1247,
      totalSettlements: 89,
      activeBattles: 12,
      totalFactions: 6,
      totalGuilds: 34,
      worldTime: {
        currentDay: 156,
        timeOfDay: 14.5,
        season: 'Summer',
        year: 1342,
        serverTime: new Date()
      },
      serverUptime: '99.9%',
      lastUpdated: new Date()
    };
  },

  async getPopulationStatistics(): Promise<any> {
    // Mock data for now
    return {
      totalCharacters: 15647,
      totalPlayers: 12450,
      totalNPCs: 3197,
      onlineCharacters: 1247,
      offlineCharacters: 14400,
      averageLevel: 23.4,
      charactersByClass: {},
      charactersByFaction: {},
      lastUpdated: new Date()
    };
  },

  // Placeholder methods - will be restored once import issues are fixed
  async searchCodex(request: any): Promise<any> {
    return { entries: [], total: 0, categories: [] };
  },

  async getCodexEntry(id: string): Promise<any> {
    return { id, title: 'Sample Entry', description: 'Sample description' };
  },

  async getCodexByCategory(category: any): Promise<any> {
    return { data: [], total: 0 };
  },

  // Mechanics Data (static data - daily cache)
  async getCharacterClasses(): Promise<CharacterClass[]> {
    return cachedApiCall(
      'character-classes',
      async () => {
        const response = await apiClient.get<GameServerResponse<CharacterClass[]>>('/codex/mechanics/classes');
        return response.data.data!;
      },
      CACHE_DURATION.MECHANICS
    );
  },

  async getSkills(): Promise<Skill[]> {
    return cachedApiCall(
      'skills',
      async () => {
        const response = await apiClient.get<GameServerResponse<Skill[]>>('/codex/mechanics/skills');
        return response.data.data!;
      },
      CACHE_DURATION.MECHANICS
    );
  },

  async getProfessions(): Promise<Profession[]> {
    return cachedApiCall(
      'professions',
      async () => {
        const response = await apiClient.get<GameServerResponse<Profession[]>>('/codex/mechanics/professions');
        return response.data.data!;
      },
      CACHE_DURATION.MECHANICS
    );
  },

  async getSpells(): Promise<Spell[]> {
    return cachedApiCall(
      'spells',
      async () => {
        const response = await apiClient.get<GameServerResponse<Spell[]>>('/codex/mechanics/spells');
        return response.data.data!;
      },
      CACHE_DURATION.MECHANICS
    );
  },

  async getTechnologies(): Promise<Technology[]> {
    return cachedApiCall(
      'technologies',
      async () => {
        const response = await apiClient.get<GameServerResponse<Technology[]>>('/codex/mechanics/technologies');
        return response.data.data!;
      },
      CACHE_DURATION.MECHANICS
    );
  },

  async getActionCategories(): Promise<ActionCategory[]> {
    return cachedApiCall(
      'action-categories',
      async () => {
        const response = await apiClient.get<GameServerResponse<ActionCategory[]>>('/codex/mechanics/action-categories');
        return response.data.data!;
      },
      CACHE_DURATION.MECHANICS
    );
  },

  async getSurvivalMechanics(): Promise<SurvivalMechanic[]> {
    return cachedApiCall(
      'survival-mechanics',
      async () => {
        const response = await apiClient.get<GameServerResponse<SurvivalMechanic[]>>('/codex/mechanics/survival');
        return response.data.data!;
      },
      CACHE_DURATION.MECHANICS
    );
  },

  // Geography Data (semi-static data - 12 hour cache)
  async getContinents(): Promise<Continent[]> {
    return cachedApiCall(
      'continents',
      async () => {
        const response = await apiClient.get<GameServerResponse<Continent[]>>('/codex/geography/continents');
        return response.data.data!;
      },
      CACHE_DURATION.GEOGRAPHY
    );
  },

  async getRegions(continentId?: number): Promise<Region[]> {
    const cacheKey = continentId ? `regions-${continentId}` : 'regions-all';
    return cachedApiCall(
      cacheKey,
      async () => {
        const url = continentId ? `/codex/geography/regions?continentId=${continentId}` : '/codex/geography/regions';
        const response = await apiClient.get<GameServerResponse<Region[]>>(url);
        return response.data.data!;
      },
      CACHE_DURATION.GEOGRAPHY
    );
  },

  async getSubRegions(regionId?: number): Promise<SubRegion[]> {
    const cacheKey = regionId ? `subregions-${regionId}` : 'subregions-all';
    return cachedApiCall(
      cacheKey,
      async () => {
        const url = regionId ? `/codex/geography/subregions?regionId=${regionId}` : '/codex/geography/subregions';
        const response = await apiClient.get<GameServerResponse<SubRegion[]>>(url);
        return response.data.data!;
      },
      CACHE_DURATION.GEOGRAPHY
    );
  },

  async getSettlements(regionId?: number, factionId?: string): Promise<Settlement[]> {
    const cacheKey = `settlements-${regionId || 'all'}-${factionId || 'all'}`;
    return cachedApiCall(
      cacheKey,
      async () => {
        const params = new URLSearchParams();
        if (regionId) params.append('regionId', regionId.toString());
        if (factionId) params.append('factionId', factionId);

        const url = `/codex/geography/settlements${params.toString() ? '?' + params.toString() : ''}`;
        const response = await apiClient.get<GameServerResponse<Settlement[]>>(url);
        return response.data.data!;
      },
      CACHE_DURATION.GEOGRAPHY
    );
  },

  async getBuildings(): Promise<Building[]> {
    return cachedApiCall(
      'buildings',
      async () => {
        const response = await apiClient.get<GameServerResponse<Building[]>>('/codex/geography/buildings');
        return response.data.data!;
      },
      CACHE_DURATION.STATIC_DAILY
    );
  },

  // Population Data (dynamic data - frequent updates)
  async getCharacterLocations(settlementId?: string): Promise<CharacterLocation[]> {
    // Character locations change frequently, short cache
    const cacheKey = settlementId ? `character-locations-${settlementId}` : 'character-locations-all';
    return cachedApiCall(
      cacheKey,
      async () => {
        const url = settlementId ? `/codex/population/locations?settlementId=${settlementId}` : '/codex/population/locations';
        const response = await apiClient.get<GameServerResponse<CharacterLocation[]>>(url);
        return response.data.data!;
      },
      CACHE_DURATION.CHARACTER_LOCATIONS
    );
  },

  // World Data (semi-static data)
  async getFactions(): Promise<Faction[]> {
    return cachedApiCall(
      'factions',
      async () => {
        const response = await apiClient.get<GameServerResponse<Faction[]>>('/codex/world/factions');
        return response.data.data!;
      },
      CACHE_DURATION.GEOGRAPHY // Factions don't change often
    );
  },

  async getGuilds(factionId?: string): Promise<Guild[]> {
    const cacheKey = factionId ? `guilds-${factionId}` : 'guilds-all';
    return cachedApiCall(
      cacheKey,
      async () => {
        const url = factionId ? `/codex/world/guilds?factionId=${factionId}` : '/codex/world/guilds';
        const response = await apiClient.get<GameServerResponse<Guild[]>>(url);
        return response.data.data!;
      },
      CACHE_DURATION.GEOGRAPHY
    );
  },

  async getResources(): Promise<Resource[]> {
    return cachedApiCall(
      'resources',
      async () => {
        const response = await apiClient.get<GameServerResponse<Resource[]>>('/codex/world/resources');
        return response.data.data!;
      },
      CACHE_DURATION.STATIC_DAILY
    );
  },

  // Utility methods for common Codex operations
  async getFullMechanicsData(): Promise<{
    classes: CharacterClass[];
    skills: Skill[];
    professions: Profession[];
    spells: Spell[];
    technologies: Technology[];
    actionCategories: ActionCategory[];
    survivalMechanics: SurvivalMechanic[];
  }> {
    const [classes, skills, professions, spells, technologies, actionCategories, survivalMechanics] = await Promise.all([
      this.getCharacterClasses(),
      this.getSkills(),
      this.getProfessions(),
      this.getSpells(),
      this.getTechnologies(),
      this.getActionCategories(),
      this.getSurvivalMechanics(),
    ]);

    return {
      classes,
      skills,
      professions,
      spells,
      technologies,
      actionCategories,
      survivalMechanics,
    };
  },

  async getFullGeographyData(): Promise<{
    continents: Continent[];
    regions: Region[];
    subRegions: SubRegion[];
    settlements: Settlement[];
    buildings: Building[];
  }> {
    const [continents, regions, subRegions, settlements, buildings] = await Promise.all([
      this.getContinents(),
      this.getRegions(),
      this.getSubRegions(),
      this.getSettlements(),
      this.getBuildings(),
    ]);

    return {
      continents,
      regions,
      subRegions,
      settlements,
      buildings,
    };
  },

  async getFullWorldData(): Promise<{
    factions: Faction[];
    guilds: Guild[];
    resources: Resource[];
    statistics: WorldStatistics;
    population: PopulationStatistics;
  }> {
    const [factions, guilds, resources, statistics, population] = await Promise.all([
      this.getFactions(),
      this.getGuilds(),
      this.getResources(),
      this.getWorldStatistics(),
      this.getPopulationStatistics(),
    ]);

    return {
      factions,
      guilds,
      resources,
      statistics,
      population,
    };
  },

  // Cache management methods
  clearCache(): void {
    cache.clear();
  },

  clearExpiredCache(): void {
    cache.clearExpired();
  },

  forceClearCacheKey(key: string): void {
    cache.cache.delete(key);
  },

  // Force refresh methods (bypass cache)
  async forceRefreshWorldStatistics(): Promise<WorldStatistics> {
    cache.cache.delete('world-statistics');
    return this.getWorldStatistics();
  },

  async forceRefreshPopulationData(): Promise<PopulationStatistics> {
    cache.cache.delete('population-statistics');
    return this.getPopulationStatistics();
  },

  async forceRefreshCharacterLocations(settlementId?: string): Promise<CharacterLocation[]> {
    const cacheKey = settlementId ? `character-locations-${settlementId}` : 'character-locations-all';
    cache.cache.delete(cacheKey);
    return this.getCharacterLocations(settlementId);
  },

  // Live data refresh (for real-time updates)
  async refreshWorldStatistics(): Promise<WorldStatistics> {
    return this.getWorldStatistics();
  },

  async refreshPopulationData(): Promise<PopulationStatistics> {
    return this.getPopulationStatistics();
  },

  // Get cache status for debugging
  getCacheStatus(): { key: string, expiry: Date, age: string }[] {
    const status: { key: string, expiry: Date, age: string }[] = [];
    const now = Date.now();

    for (const [key, entry] of cache.cache.entries()) {
      const age = Math.round((now - entry.timestamp) / 1000);
      status.push({
        key,
        expiry: new Date(entry.expiry),
        age: `${age}s ago`
      });
    }

    return status.sort((a, b) => a.key.localeCompare(b.key));
  }
};