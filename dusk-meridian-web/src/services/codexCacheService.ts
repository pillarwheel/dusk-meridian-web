import { codexDb } from '@/db/codexDb';
import type {
  CachedCharacterClass,
  CachedSkill,
  CachedSpell,
  CachedSettlement,
  CachedFaction,
  CachedProfession,
  CachedTechnology,
  CachedContinent,
  CachedRegion,
  CachedResource,
  CachedLoreEntry,
  WorldStatisticsCache
} from '@/db/codexDb';

// Cache duration constants (in milliseconds)
export const CACHE_DURATION = {
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

export class CodexCacheService {
  /**
   * Generic cache getter with fallback to API
   */
  private async getCachedData<T, K>(
    cacheKey: string,
    category: string,
    table: any,
    apiCall: () => Promise<T[]>,
    cacheDuration: number,
    mapper: (item: T, now: number) => K
  ): Promise<T[]> {
    try {
      // Check if cache is fresh
      const isFresh = await codexDb.isCacheFresh(cacheKey, cacheDuration);

      if (isFresh) {
        // Return cached data
        const cached = await table.toArray();
        if (cached.length > 0) {
          console.log(`[Cache HIT] ${cacheKey}`);
          return cached;
        }
      }

      console.log(`[Cache MISS] ${cacheKey} - fetching from API`);

      // Cache miss or expired - fetch from API
      const data = await apiCall();

      // Store in cache
      const now = Date.now();
      const cachedData = data.map(item => mapper(item, now));

      // Clear old data and insert new
      await table.clear();
      await table.bulkAdd(cachedData);

      // Update metadata
      await codexDb.updateCacheMetadata(cacheKey, category, cacheDuration);

      return data;
    } catch (error) {
      console.error(`[Cache ERROR] ${cacheKey}:`, error);

      // Try to return stale cache data if API fails
      const staleCache = await table.toArray();
      if (staleCache.length > 0) {
        console.warn(`[Cache STALE] ${cacheKey} - using stale data due to API error`);
        return staleCache;
      }

      // No cache available, rethrow error
      throw error;
    }
  }

  /**
   * Character Classes
   */
  async getCharacterClasses(apiCall: () => Promise<any[]>): Promise<any[]> {
    return this.getCachedData<any, CachedCharacterClass>(
      'character-classes',
      'mechanics',
      codexDb.characterClasses,
      apiCall,
      CACHE_DURATION.MECHANICS,
      (item, now) => ({
        name: item.name,
        description: item.description,
        primaryStats: item.primaryStats ? JSON.stringify(item.primaryStats) : undefined,
        abilities: item.abilities ? JSON.stringify(item.abilities) : undefined,
        count: item.count,
        lastUpdated: now
      })
    );
  }

  /**
   * Skills
   */
  async getSkills(apiCall: () => Promise<any[]>): Promise<any[]> {
    return this.getCachedData<any, CachedSkill>(
      'skills',
      'mechanics',
      codexDb.skills,
      apiCall,
      CACHE_DURATION.MECHANICS,
      (item, now) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        maxLevel: item.maxLevel,
        prerequisites: item.prerequisites ? JSON.stringify(item.prerequisites) : undefined,
        lastUpdated: now
      })
    );
  }

  /**
   * Spells
   */
  async getSpells(apiCall: () => Promise<any[]>): Promise<any[]> {
    return this.getCachedData<any, CachedSpell>(
      'spells',
      'mechanics',
      codexDb.spells,
      apiCall,
      CACHE_DURATION.MECHANICS,
      (item, now) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        school: item.school,
        level: item.level,
        components: JSON.stringify(item.components || []),
        castingTime: item.castingTime,
        range: item.range,
        duration: item.duration,
        effect: item.effect,
        lastUpdated: now
      })
    );
  }

  /**
   * Professions
   */
  async getProfessions(apiCall: () => Promise<any[]>): Promise<any[]> {
    return this.getCachedData<any, CachedProfession>(
      'professions',
      'mechanics',
      codexDb.professions,
      apiCall,
      CACHE_DURATION.MECHANICS,
      (item, now) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        requiredSkills: JSON.stringify(item.requiredSkills || []),
        benefits: JSON.stringify(item.benefits || []),
        unlockConditions: item.unlockConditions ? JSON.stringify(item.unlockConditions) : undefined,
        lastUpdated: now
      })
    );
  }

  /**
   * Technologies
   */
  async getTechnologies(apiCall: () => Promise<any[]>): Promise<any[]> {
    return this.getCachedData<any, CachedTechnology>(
      'technologies',
      'mechanics',
      codexDb.technologies,
      apiCall,
      CACHE_DURATION.MECHANICS,
      (item, now) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        requirements: JSON.stringify(item.requirements || []),
        unlocks: JSON.stringify(item.unlocks || []),
        researchCost: item.researchCost,
        lastUpdated: now
      })
    );
  }

  /**
   * Settlements
   */
  async getSettlements(apiCall: () => Promise<any[]>, filters?: { regionId?: number; factionId?: string }): Promise<any[]> {
    const cacheKey = filters
      ? `settlements-${filters.regionId || 'all'}-${filters.factionId || 'all'}`
      : 'settlements-all';

    return this.getCachedData<any, CachedSettlement>(
      cacheKey,
      'geography',
      codexDb.settlements,
      apiCall,
      CACHE_DURATION.GEOGRAPHY,
      (item, now) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        population: item.population,
        factionId: item.factionId,
        factionName: item.factionName,
        regionId: item.regionId,
        regionName: item.regionName,
        description: item.description,
        founded: item.founded ? new Date(item.founded).getTime() : undefined,
        isCapital: item.isCapital,
        lastUpdated: now
      })
    );
  }

  /**
   * Factions
   */
  async getFactions(apiCall: () => Promise<any[]>): Promise<any[]> {
    return this.getCachedData<any, CachedFaction>(
      'factions',
      'factions',
      codexDb.factions,
      apiCall,
      CACHE_DURATION.GEOGRAPHY,
      (item, now) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        color: item.color,
        ideology: item.ideology,
        leader: item.leader,
        memberCount: item.memberCount,
        settlementCount: item.settlementCount,
        territory: item.territory ? JSON.stringify(item.territory) : undefined,
        allies: item.allies ? JSON.stringify(item.allies) : undefined,
        enemies: item.enemies ? JSON.stringify(item.enemies) : undefined,
        founded: item.founded ? new Date(item.founded).getTime() : undefined,
        lastUpdated: now
      })
    );
  }

  /**
   * Continents
   */
  async getContinents(apiCall: () => Promise<any[]>): Promise<any[]> {
    return this.getCachedData<any, CachedContinent>(
      'continents',
      'geography',
      codexDb.continents,
      apiCall,
      CACHE_DURATION.GEOGRAPHY,
      (item, now) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        climate: item.climate,
        majorFeatures: item.majorFeatures ? JSON.stringify(item.majorFeatures) : undefined,
        lastUpdated: now
      })
    );
  }

  /**
   * Regions
   */
  async getRegions(apiCall: () => Promise<any[]>, continentId?: number): Promise<any[]> {
    const cacheKey = continentId ? `regions-${continentId}` : 'regions-all';

    return this.getCachedData<any, CachedRegion>(
      cacheKey,
      'geography',
      codexDb.regions,
      apiCall,
      CACHE_DURATION.GEOGRAPHY,
      (item, now) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        continentId: item.continentId,
        climate: item.climate,
        resources: item.resources ? JSON.stringify(item.resources) : undefined,
        settlements: item.settlements,
        lastUpdated: now
      })
    );
  }

  /**
   * Resources
   */
  async getResources(apiCall: () => Promise<any[]>): Promise<any[]> {
    return this.getCachedData<any, CachedResource>(
      'resources',
      'resources',
      codexDb.resources,
      apiCall,
      CACHE_DURATION.STATIC_DAILY,
      (item, now) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        description: item.description,
        rarity: item.rarity,
        locations: item.locations ? JSON.stringify(item.locations) : undefined,
        uses: item.uses ? JSON.stringify(item.uses) : undefined,
        value: item.value,
        lastUpdated: now
      })
    );
  }

  /**
   * World Statistics (special case - always has ID 1)
   */
  async getWorldStatistics(apiCall: () => Promise<any>): Promise<any> {
    const cacheKey = 'world-statistics';
    const isFresh = await codexDb.isCacheFresh(cacheKey, CACHE_DURATION.WORLD_STATS);

    try {
      if (isFresh) {
        const cached = await codexDb.worldStatistics.get(1);
        if (cached) {
          console.log(`[Cache HIT] ${cacheKey}`);
          return {
            ...cached,
            worldTime: JSON.parse(cached.worldTime),
            lastUpdated: new Date(cached.lastUpdated)
          };
        }
      }

      console.log(`[Cache MISS] ${cacheKey} - fetching from API`);
      const data = await apiCall();

      const now = Date.now();
      const cachedData: WorldStatisticsCache = {
        id: 1,
        totalCharacters: data.totalCharacters,
        totalClasses: data.totalClasses,
        onlinePlayers: data.onlinePlayers,
        totalSettlements: data.totalSettlements,
        activeBattles: data.activeBattles,
        totalFactions: data.totalFactions,
        totalGuilds: data.totalGuilds,
        worldTime: JSON.stringify(data.worldTime),
        serverUptime: data.serverUptime,
        lastUpdated: now
      };

      await codexDb.worldStatistics.put(cachedData);
      await codexDb.updateCacheMetadata(cacheKey, 'statistics', CACHE_DURATION.WORLD_STATS);

      return data;
    } catch (error) {
      console.error(`[Cache ERROR] ${cacheKey}:`, error);

      // Try to return stale cache
      const staleCache = await codexDb.worldStatistics.get(1);
      if (staleCache) {
        console.warn(`[Cache STALE] ${cacheKey} - using stale data due to API error`);
        return {
          ...staleCache,
          worldTime: JSON.parse(staleCache.worldTime),
          lastUpdated: new Date(staleCache.lastUpdated)
        };
      }

      throw error;
    }
  }

  /**
   * Store lore entries (for manual data entry)
   */
  async storeLoreEntry(entry: Omit<CachedLoreEntry, 'lastUpdated'>): Promise<void> {
    const now = Date.now();
    await codexDb.loreEntries.put({
      ...entry,
      lastUpdated: now
    });
    await codexDb.updateCacheMetadata(`lore-${entry.id}`, 'lore', CACHE_DURATION.STATIC_DAILY);
  }

  /**
   * Bulk import lore entries
   */
  async bulkImportLore(entries: Omit<CachedLoreEntry, 'lastUpdated'>[]): Promise<void> {
    const now = Date.now();
    const cachedEntries = entries.map(entry => ({
      ...entry,
      lastUpdated: now
    }));

    await codexDb.loreEntries.bulkPut(cachedEntries);
    await codexDb.updateCacheMetadata('lore-bulk-import', 'lore', CACHE_DURATION.STATIC_DAILY);
  }

  /**
   * Search lore entries
   */
  async searchLore(query: string, category?: string): Promise<CachedLoreEntry[]> {
    let collection = codexDb.loreEntries.toCollection();

    if (category) {
      collection = codexDb.loreEntries.where('category').equals(category);
    }

    const entries = await collection.toArray();

    // Simple text search
    const lowerQuery = query.toLowerCase();
    return entries.filter(entry =>
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.content.toLowerCase().includes(lowerQuery) ||
      entry.summary.toLowerCase().includes(lowerQuery) ||
      (entry.tags && entry.tags.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get lore by category
   */
  async getLoreByCategory(category: string): Promise<CachedLoreEntry[]> {
    return await codexDb.loreEntries
      .where('category')
      .equals(category)
      .toArray();
  }

  /**
   * Force refresh - bypass cache
   */
  async forceRefresh(key: string): Promise<void> {
    await codexDb.cacheMetadata.delete(key);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return await codexDb.getCacheStats();
  }

  /**
   * Clear all cache
   */
  async clearAllCache(): Promise<void> {
    await codexDb.clearAllCache();
  }

  /**
   * Clear expired cache
   */
  async clearExpiredCache(): Promise<void> {
    await codexDb.clearExpiredCache();
  }
}

// Export singleton instance
export const codexCacheService = new CodexCacheService();
