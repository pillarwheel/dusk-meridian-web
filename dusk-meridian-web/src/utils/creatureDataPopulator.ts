/**
 * Creature Data Populator
 *
 * Populates IndexedDB cache with creature data from local mappings.
 * This allows the Creature Codex to work offline.
 */

import { codexDb, type CachedCreature } from '@/db/codexDb';
import { getAllCreatureImages, type CreatureImageData } from '@/data/creatureImages';

/**
 * Convert CreatureImageData to CachedCreature format
 */
function convertToCachedCreature(creature: CreatureImageData): CachedCreature {
  return {
    id: creature.id ? String(creature.id) : creature.name.toLowerCase().replace(/\s+/g, '-'),
    name: creature.name,
    zone: creature.zone,
    threatLevel: creature.threatLevel,
    type: creature.type,
    levelRange: creature.levelRange,
    description: creature.description,
    size: creature.size,
    imagePath: creature.imagePath,
    lore: creature.lore,
    abilities: creature.abilities ? JSON.stringify(creature.abilities) : undefined,
    resources: creature.resources ? JSON.stringify(creature.resources) : undefined,
    lastUpdated: Date.now()
  };
}

/**
 * Populate IndexedDB with all creature data
 */
export async function populateCreatureData(): Promise<void> {
  try {
    const creatures = getAllCreatureImages();
    const cachedCreatures = creatures.map(convertToCachedCreature);

    // Clear existing creature data
    await codexDb.creatures.clear();

    // Bulk insert all creatures
    await codexDb.creatures.bulkAdd(cachedCreatures);

    // Update cache metadata
    await codexDb.updateCacheMetadata(
      'creatures:all',
      'creatures',
      24 * 60 * 60 * 1000 // 24 hours
    );

    console.log(`✅ Populated ${cachedCreatures.length} creatures into cache`);
  } catch (error) {
    console.error('Failed to populate creature data:', error);
    throw error;
  }
}

/**
 * Get creature from cache by ID
 */
export async function getCachedCreatureById(id: string): Promise<CachedCreature | null> {
  try {
    const creature = await codexDb.creatures.get(id);
    return creature || null;
  } catch (error) {
    console.error('Failed to get cached creature:', error);
    return null;
  }
}

/**
 * Get creature from cache by name
 */
export async function getCachedCreatureByName(name: string): Promise<CachedCreature | null> {
  try {
    const normalizedName = name.toLowerCase();
    const creature = await codexDb.creatures
      .where('name')
      .equalsIgnoreCase(name)
      .first();
    return creature || null;
  } catch (error) {
    console.error('Failed to get cached creature by name:', error);
    return null;
  }
}

/**
 * Get all creatures from cache
 */
export async function getAllCachedCreatures(): Promise<CachedCreature[]> {
  try {
    return await codexDb.creatures.toArray();
  } catch (error) {
    console.error('Failed to get all cached creatures:', error);
    return [];
  }
}

/**
 * Get creatures by zone from cache
 */
export async function getCachedCreaturesByZone(zone: string): Promise<CachedCreature[]> {
  try {
    return await codexDb.creatures
      .where('zone')
      .equals(zone)
      .toArray();
  } catch (error) {
    console.error('Failed to get creatures by zone:', error);
    return [];
  }
}

/**
 * Get creatures by threat level from cache
 */
export async function getCachedCreaturesByThreatLevel(threatLevel: string): Promise<CachedCreature[]> {
  try {
    return await codexDb.creatures
      .where('threatLevel')
      .equals(threatLevel)
      .toArray();
  } catch (error) {
    console.error('Failed to get creatures by threat level:', error);
    return [];
  }
}

/**
 * Get creatures by type from cache
 */
export async function getCachedCreaturesByType(type: string): Promise<CachedCreature[]> {
  try {
    return await codexDb.creatures
      .where('type')
      .equals(type)
      .toArray();
  } catch (error) {
    console.error('Failed to get creatures by type:', error);
    return [];
  }
}

/**
 * Search creatures by query (name or description)
 */
export async function searchCachedCreatures(query: string): Promise<CachedCreature[]> {
  try {
    const normalizedQuery = query.toLowerCase();
    const allCreatures = await codexDb.creatures.toArray();

    return allCreatures.filter(creature =>
      creature.name.toLowerCase().includes(normalizedQuery) ||
      creature.description.toLowerCase().includes(normalizedQuery) ||
      creature.zone.toLowerCase().includes(normalizedQuery)
    );
  } catch (error) {
    console.error('Failed to search cached creatures:', error);
    return [];
  }
}

/**
 * Get cache statistics for creatures
 */
export async function getCreatureCacheStats(): Promise<{
  total: number;
  byZone: Record<string, number>;
  byThreatLevel: Record<string, number>;
  lastUpdated: Date | null;
}> {
  try {
    const allCreatures = await codexDb.creatures.toArray();

    const byZone: Record<string, number> = {};
    const byThreatLevel: Record<string, number> = {};
    let mostRecentUpdate = 0;

    allCreatures.forEach(creature => {
      // Count by zone
      byZone[creature.zone] = (byZone[creature.zone] || 0) + 1;

      // Count by threat level
      byThreatLevel[creature.threatLevel] = (byThreatLevel[creature.threatLevel] || 0) + 1;

      // Track most recent update
      if (creature.lastUpdated > mostRecentUpdate) {
        mostRecentUpdate = creature.lastUpdated;
      }
    });

    return {
      total: allCreatures.length,
      byZone,
      byThreatLevel,
      lastUpdated: mostRecentUpdate > 0 ? new Date(mostRecentUpdate) : null
    };
  } catch (error) {
    console.error('Failed to get creature cache stats:', error);
    return {
      total: 0,
      byZone: {},
      byThreatLevel: {},
      lastUpdated: null
    };
  }
}
