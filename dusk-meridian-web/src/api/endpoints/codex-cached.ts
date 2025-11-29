import { apiClient } from '../client';
import { codexCacheService } from '@/services/codexCacheService';
import type {
  CharacterClass,
  Skill,
  Spell,
  Settlement,
  Faction,
  Profession,
  Technology,
  Continent,
  Region,
  Resource
} from '../types/codex';

interface GameServerResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

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

interface PopulationStatistics {
  totalCharacters: number;
  totalPlayers: number;
  totalNPCs: number;
  onlineCharacters: number;
  offlineCharacters: number;
  averageLevel: number;
  charactersByClass: Record<string, number>;
  charactersByFaction: Record<string, number>;
  lastUpdated: Date;
}

/**
 * Codex API with IndexedDB caching
 * Automatically falls back to cached data when server is offline
 */
export const codexCachedApi = {
  /**
   * World Statistics
   */
  async getWorldStatistics(): Promise<WorldStatistics> {
    return codexCacheService.getWorldStatistics(async () => {
      const response = await apiClient.get<GameServerResponse<WorldStatistics>>('/codex/statistics/world');
      return response.data.data;
    });
  },

  async getPopulationStatistics(): Promise<PopulationStatistics> {
    // TODO: Implement population statistics caching similar to world stats
    const response = await apiClient.get<GameServerResponse<PopulationStatistics>>('/codex/statistics/population');
    return response.data.data;
  },

  /**
   * Character Classes
   */
  async getCharacterClasses(): Promise<CharacterClass[]> {
    return codexCacheService.getCharacterClasses(async () => {
      const response = await apiClient.get<GameServerResponse<CharacterClass[]>>('/codex/mechanics/classes');
      return response.data.data!;
    });
  },

  /**
   * Skills
   */
  async getSkills(): Promise<Skill[]> {
    return codexCacheService.getSkills(async () => {
      const response = await apiClient.get<GameServerResponse<Skill[]>>('/codex/mechanics/skills');
      return response.data.data!;
    });
  },

  /**
   * Professions
   */
  async getProfessions(): Promise<Profession[]> {
    return codexCacheService.getProfessions(async () => {
      const response = await apiClient.get<GameServerResponse<Profession[]>>('/codex/mechanics/professions');
      return response.data.data!;
    });
  },

  /**
   * Spells
   */
  async getSpells(): Promise<Spell[]> {
    return codexCacheService.getSpells(async () => {
      const response = await apiClient.get<GameServerResponse<Spell[]>>('/codex/mechanics/spells');
      return response.data.data!;
    });
  },

  /**
   * Technologies
   */
  async getTechnologies(): Promise<Technology[]> {
    return codexCacheService.getTechnologies(async () => {
      const response = await apiClient.get<GameServerResponse<Technology[]>>('/codex/mechanics/technologies');
      return response.data.data!;
    });
  },

  /**
   * Continents
   */
  async getContinents(): Promise<Continent[]> {
    return codexCacheService.getContinents(async () => {
      const response = await apiClient.get<GameServerResponse<Continent[]>>('/codex/geography/continents');
      return response.data.data!;
    });
  },

  /**
   * Regions
   */
  async getRegions(continentId?: number): Promise<Region[]> {
    return codexCacheService.getRegions(
      async () => {
        const url = continentId
          ? `/codex/geography/regions?continentId=${continentId}`
          : '/codex/geography/regions';
        const response = await apiClient.get<GameServerResponse<Region[]>>(url);
        return response.data.data!;
      },
      continentId
    );
  },

  /**
   * Settlements
   */
  async getSettlements(regionId?: number, factionId?: string): Promise<Settlement[]> {
    return codexCacheService.getSettlements(
      async () => {
        const params = new URLSearchParams();
        if (regionId) params.append('regionId', regionId.toString());
        if (factionId) params.append('factionId', factionId);

        const url = `/codex/geography/settlements${params.toString() ? '?' + params.toString() : ''}`;
        const response = await apiClient.get<GameServerResponse<Settlement[]>>(url);
        return response.data.data!;
      },
      { regionId, factionId }
    );
  },

  /**
   * Factions
   */
  async getFactions(): Promise<Faction[]> {
    return codexCacheService.getFactions(async () => {
      const response = await apiClient.get<GameServerResponse<Faction[]>>('/codex/world/factions');
      return response.data.data!;
    });
  },

  /**
   * Resources
   */
  async getResources(): Promise<Resource[]> {
    return codexCacheService.getResources(async () => {
      const response = await apiClient.get<GameServerResponse<Resource[]>>('/codex/world/resources');
      return response.data.data!;
    });
  },

  /**
   * Lore Management
   */
  async storeLoreEntry(entry: {
    id: string;
    title: string;
    category: string;
    subcategory?: string;
    content: string;
    summary: string;
    tags?: string;
  }): Promise<void> {
    await codexCacheService.storeLoreEntry(entry);
  },

  async bulkImportLore(entries: Array<{
    id: string;
    title: string;
    category: string;
    subcategory?: string;
    content: string;
    summary: string;
    tags?: string;
  }>): Promise<void> {
    await codexCacheService.bulkImportLore(entries);
  },

  async searchLore(query: string, category?: string): Promise<any[]> {
    return await codexCacheService.searchLore(query, category);
  },

  async getLoreByCategory(category: string): Promise<any[]> {
    return await codexCacheService.getLoreByCategory(category);
  },

  /**
   * Search across all codex data
   */
  async searchCodex(request: { query?: string; category?: string; limit?: number }): Promise<any> {
    // For offline mode, search through cached data
    try {
      const response = await apiClient.post('/codex/search', request);
      return response.data;
    } catch (error) {
      console.warn('API search failed, falling back to local search');

      // Fall back to local lore search if API is down
      if (request.query) {
        const loreResults = await codexCacheService.searchLore(request.query, request.category);
        return {
          entries: loreResults,
          total: loreResults.length,
          categories: []
        };
      }

      return { entries: [], total: 0, categories: [] };
    }
  },

  async getCodexEntry(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/codex/entry/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API fetch failed, searching local cache');
      // Try to find in lore cache
      const allLore = await codexCacheService.getLoreByCategory('');
      return allLore.find(entry => entry.id === id) || null;
    }
  },

  async getCodexByCategory(category: any): Promise<any> {
    // This is a generic endpoint that might not exist on the server
    // We'll implement it using cached data
    const loreEntries = await codexCacheService.getLoreByCategory(category);
    return { data: loreEntries, total: loreEntries.length };
  },

  /**
   * Cache Management
   */
  async clearCache(): Promise<void> {
    await codexCacheService.clearAllCache();
  },

  async clearExpiredCache(): Promise<void> {
    await codexCacheService.clearExpiredCache();
  },

  async getCacheStats(): Promise<any> {
    return await codexCacheService.getCacheStats();
  },

  async forceRefresh(key: string): Promise<void> {
    await codexCacheService.forceRefresh(key);
  },

  /**
   * Utility methods for bulk operations
   */
  async getFullMechanicsData(): Promise<{
    classes: CharacterClass[];
    skills: Skill[];
    professions: Profession[];
    spells: Spell[];
    technologies: Technology[];
  }> {
    const [classes, skills, professions, spells, technologies] = await Promise.all([
      this.getCharacterClasses(),
      this.getSkills(),
      this.getProfessions(),
      this.getSpells(),
      this.getTechnologies(),
    ]);

    return {
      classes,
      skills,
      professions,
      spells,
      technologies,
    };
  },

  async getFullGeographyData(): Promise<{
    continents: Continent[];
    regions: Region[];
    settlements: Settlement[];
  }> {
    const [continents, regions, settlements] = await Promise.all([
      this.getContinents(),
      this.getRegions(),
      this.getSettlements(),
    ]);

    return {
      continents,
      regions,
      settlements,
    };
  },

  async getFullWorldData(): Promise<{
    factions: Faction[];
    resources: Resource[];
    statistics: WorldStatistics;
  }> {
    const [factions, resources, statistics] = await Promise.all([
      this.getFactions(),
      this.getResources(),
      this.getWorldStatistics(),
    ]);

    return {
      factions,
      resources,
      statistics,
    };
  }
};
