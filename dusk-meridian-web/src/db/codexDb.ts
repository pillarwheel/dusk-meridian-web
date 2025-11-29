import Dexie from 'dexie';

type Table<T, TKey> = Dexie.Table<T, TKey>;

// Cache metadata interface
export interface CacheMetadata {
  key: string;
  timestamp: number;
  expiry: number;
  category: string;
}

// Codex Data Interfaces
export interface CachedCharacterClass {
  id?: number;
  name: string;
  description?: string;
  primaryStats?: string;
  abilities?: string;
  count?: number;
  lastUpdated: number;
}

export interface CachedSkill {
  id: number;
  name: string;
  description: string;
  category: string;
  maxLevel?: number;
  prerequisites?: string;
  lastUpdated: number;
}

export interface CachedSpell {
  id: number;
  name: string;
  description: string;
  school: string;
  level: number;
  components: string;
  castingTime: string;
  range: string;
  duration: string;
  effect: string;
  lastUpdated: number;
}

export interface CachedSettlement {
  id: string;
  name: string;
  type: string;
  population: number;
  factionId?: string;
  factionName?: string;
  regionId?: number;
  regionName?: string;
  description?: string;
  founded?: number;
  isCapital?: boolean;
  lastUpdated: number;
}

export interface CachedFaction {
  id: string;
  name: string;
  description: string;
  color?: string;
  ideology?: string;
  leader?: string;
  memberCount?: number;
  settlementCount?: number;
  territory?: string;
  allies?: string;
  enemies?: string;
  founded?: number;
  lastUpdated: number;
}

export interface CachedProfession {
  id: number;
  name: string;
  description: string;
  requiredSkills: string;
  benefits: string;
  unlockConditions?: string;
  lastUpdated: number;
}

export interface CachedTechnology {
  id: number;
  name: string;
  description: string;
  category: string;
  requirements: string;
  unlocks: string;
  researchCost?: number;
  lastUpdated: number;
}

export interface CachedContinent {
  id: number;
  name: string;
  description: string;
  climate?: string;
  majorFeatures?: string;
  lastUpdated: number;
}

export interface CachedRegion {
  id: number;
  name: string;
  description: string;
  continentId: number;
  climate?: string;
  resources?: string;
  settlements?: number;
  lastUpdated: number;
}

export interface CachedResource {
  id: number;
  name: string;
  type: string;
  description: string;
  rarity: string;
  locations?: string;
  uses?: string;
  value?: number;
  lastUpdated: number;
}

export interface CachedLoreEntry {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  summary: string;
  tags?: string;
  lastUpdated: number;
}

// NFT Cache Interfaces
export interface CachedNFT {
  id: string;
  tier: 1 | 2 | 3;
  name: string;
  description: string;
  imagePath: string;
  metadata: string; // JSON stringified metadata
  lastUpdated: number;
}

// Creature Cache Interface
export interface CachedCreature {
  id: string;
  name: string;
  zone: string;
  threatLevel: string;
  type: string;
  levelRange: string;
  description: string;
  size?: string;
  imagePath: string;
  lore?: string;
  abilities?: string; // JSON stringified array
  resources?: string; // JSON stringified array
  lastUpdated: number;
}

export interface WorldStatisticsCache {
  id: number; // Always 1, singleton
  totalCharacters: number;
  totalClasses: number;
  onlinePlayers: number;
  totalSettlements: number;
  activeBattles: number;
  totalFactions: number;
  totalGuilds: number;
  worldTime: string; // JSON serialized
  serverUptime: string;
  lastUpdated: number;
}

// Settlement Buildings Cache Interface
export interface CachedSettlementBuilding {
  id: string; // settlementId-buildingId
  settlementId: number;
  buildingId: number;
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
  health?: number;
  level?: number;
  workers?: number;
  lastUpdated: number;
}

// Settlement Map Cache Metadata
export interface CachedSettlementMapMetadata {
  settlementId: number;
  buildingHash: string; // Hash of building data to detect changes
  lastUpdated: number;
}

// Dexie Database Class
export class CodexDatabase extends Dexie {
  // Cache metadata table
  cacheMetadata!: Table<CacheMetadata, string>;

  // Core game mechanics tables
  characterClasses!: Table<CachedCharacterClass, number>;
  skills!: Table<CachedSkill, number>;
  spells!: Table<CachedSpell, number>;
  professions!: Table<CachedProfession, number>;
  technologies!: Table<CachedTechnology, number>;

  // Geography tables
  continents!: Table<CachedContinent, number>;
  regions!: Table<CachedRegion, number>;
  settlements!: Table<CachedSettlement, string>;
  resources!: Table<CachedResource, number>;

  // World data tables
  factions!: Table<CachedFaction, string>;
  loreEntries!: Table<CachedLoreEntry, string>;

  // NFT table
  nfts!: Table<CachedNFT, string>;

  // Creature table
  creatures!: Table<CachedCreature, string>;

  // Statistics cache
  worldStatistics!: Table<WorldStatisticsCache, number>;

  // Settlement map cache
  settlementBuildings!: Table<CachedSettlementBuilding, string>;
  settlementMapMetadata!: Table<CachedSettlementMapMetadata, number>;

  constructor() {
    super('DuskMeridianCodex');

    this.version(4).stores({
      // Cache metadata with compound index
      cacheMetadata: 'key, category, expiry',

      // Core mechanics - indexed by id and name for fast lookups
      characterClasses: '++id, name, lastUpdated',
      skills: 'id, name, category, lastUpdated',
      spells: 'id, name, school, level, lastUpdated',
      professions: 'id, name, lastUpdated',
      technologies: 'id, name, category, lastUpdated',

      // Geography - indexed for filtering and searching
      continents: 'id, name, lastUpdated',
      regions: 'id, name, continentId, lastUpdated',
      settlements: 'id, name, factionId, regionId, type, lastUpdated',
      resources: 'id, name, type, rarity, lastUpdated',

      // World data
      factions: 'id, name, lastUpdated',
      loreEntries: 'id, title, category, subcategory, lastUpdated',

      // NFTs
      nfts: 'id, tier, name, lastUpdated',

      // Creatures
      creatures: 'id, name, zone, threatLevel, type, lastUpdated',

      // Statistics (singleton table)
      worldStatistics: 'id, lastUpdated',

      // Settlement map cache
      settlementBuildings: 'id, settlementId, buildingId, lastUpdated',
      settlementMapMetadata: 'settlementId, lastUpdated'
    });
  }

  /**
   * Clear all cached data
   */
  async clearAllCache(): Promise<void> {
    await Promise.all([
      this.cacheMetadata.clear(),
      this.characterClasses.clear(),
      this.skills.clear(),
      this.spells.clear(),
      this.professions.clear(),
      this.technologies.clear(),
      this.continents.clear(),
      this.regions.clear(),
      this.settlements.clear(),
      this.resources.clear(),
      this.factions.clear(),
      this.loreEntries.clear(),
      this.nfts.clear(),
      this.creatures.clear(),
      this.worldStatistics.clear(),
      this.settlementBuildings.clear(),
      this.settlementMapMetadata.clear()
    ]);
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    const now = Date.now();

    // Get all expired cache metadata keys
    const expiredKeys = await this.cacheMetadata
      .where('expiry')
      .below(now)
      .toArray();

    // Delete expired metadata
    await this.cacheMetadata
      .where('expiry')
      .below(now)
      .delete();

    // Note: Individual table entries have their own lastUpdated timestamps
    // and will be validated when accessed
  }

  /**
   * Clear cache by category
   */
  async clearCacheByCategory(category: string): Promise<void> {
    // Delete metadata for this category
    await this.cacheMetadata
      .where('category')
      .equals(category)
      .delete();

    // Clear appropriate tables based on category
    switch (category) {
      case 'mechanics':
        await Promise.all([
          this.characterClasses.clear(),
          this.skills.clear(),
          this.spells.clear(),
          this.professions.clear(),
          this.technologies.clear()
        ]);
        break;
      case 'geography':
        await Promise.all([
          this.continents.clear(),
          this.regions.clear(),
          this.settlements.clear()
        ]);
        break;
      case 'factions':
        await this.factions.clear();
        break;
      case 'resources':
        await this.resources.clear();
        break;
      case 'lore':
        await this.loreEntries.clear();
        break;
      case 'nfts':
        await this.nfts.clear();
        break;
      case 'creatures':
        await this.creatures.clear();
        break;
      case 'statistics':
        await this.worldStatistics.clear();
        break;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalEntries: number;
    entriesByCategory: Record<string, number>;
    oldestEntry: Date | null;
    newestEntry: Date | null;
    databaseSize: string;
  }> {
    const [
      classesCount,
      skillsCount,
      spellsCount,
      professionsCount,
      technologiesCount,
      continentsCount,
      regionsCount,
      settlementsCount,
      resourcesCount,
      factionsCount,
      loreCount,
      nftsCount,
      creaturesCount,
      statsCount
    ] = await Promise.all([
      this.characterClasses.count(),
      this.skills.count(),
      this.spells.count(),
      this.professions.count(),
      this.technologies.count(),
      this.continents.count(),
      this.regions.count(),
      this.settlements.count(),
      this.resources.count(),
      this.factions.count(),
      this.loreEntries.count(),
      this.nfts.count(),
      this.creatures.count(),
      this.worldStatistics.count()
    ]);

    const totalEntries = classesCount + skillsCount + spellsCount +
                        professionsCount + technologiesCount + continentsCount +
                        regionsCount + settlementsCount + resourcesCount +
                        factionsCount + loreCount + nftsCount + creaturesCount + statsCount;

    // Get oldest and newest entries
    const allMetadata = await this.cacheMetadata.toArray();
    const timestamps = allMetadata.map(m => m.timestamp);
    const oldestEntry = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null;
    const newestEntry = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;

    return {
      totalEntries,
      entriesByCategory: {
        characterClasses: classesCount,
        skills: skillsCount,
        spells: spellsCount,
        professions: professionsCount,
        technologies: technologiesCount,
        continents: continentsCount,
        regions: regionsCount,
        settlements: settlementsCount,
        resources: resourcesCount,
        factions: factionsCount,
        lore: loreCount,
        nfts: nftsCount,
        creatures: creaturesCount,
        statistics: statsCount
      },
      oldestEntry,
      newestEntry,
      databaseSize: 'N/A' // IndexedDB doesn't expose size directly
    };
  }

  /**
   * Check if cache is fresh for a given key and duration
   */
  async isCacheFresh(key: string, maxAge: number): Promise<boolean> {
    const metadata = await this.cacheMetadata.get(key);
    if (!metadata) return false;

    const now = Date.now();
    return now < metadata.expiry;
  }

  /**
   * Update cache metadata
   */
  async updateCacheMetadata(key: string, category: string, ttl: number): Promise<void> {
    const now = Date.now();
    await this.cacheMetadata.put({
      key,
      timestamp: now,
      expiry: now + ttl,
      category
    });
  }
}

// Export singleton instance
export const codexDb = new CodexDatabase();
