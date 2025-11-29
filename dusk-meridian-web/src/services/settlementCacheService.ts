/**
 * Settlement Cache Service
 *
 * Manages caching for settlement data with smart comparison logic.
 * - Map geometry: Heavily cached (rarely changes)
 * - Building data: Cache with comparison (moderate change frequency)
 * - Population data: Always fetch fresh (changes frequently)
 */

import { codexDb, type CachedSettlementBuilding } from '@/db/codexDb';

/**
 * Settlement Building interface from API
 */
export interface SettlementBuilding {
  settlementBuildingId?: number;
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
  health?: number;
  level?: number;
  workers?: number;
}

/**
 * Result from building comparison
 */
export interface BuildingComparisonResult {
  hasChanged: boolean;
  cachedBuildings: SettlementBuilding[];
  freshBuildings: SettlementBuilding[];
  changesSummary?: {
    added: number;
    removed: number;
    modified: number;
  };
}

/**
 * Generate a hash for building data to detect changes
 * Uses a fast, simple approach: count + checksum of key properties
 */
function generateBuildingHash(buildings: SettlementBuilding[]): string {
  if (buildings.length === 0) return '0';

  // Fast checksum approach instead of string concatenation
  let hash = buildings.length; // Start with count

  for (const b of buildings) {
    // Combine critical properties into hash
    hash = ((hash << 5) - hash) + b.buildingId;
    hash = ((hash << 5) - hash) + Math.floor(b.xCoordinate);
    hash = ((hash << 5) - hash) + Math.floor(b.zCoordinate);
    hash = ((hash << 5) - hash) + (b.isDestroyed ? 1 : 0);
    hash = ((hash << 5) - hash) + (b.isDamaged ? 2 : 0);
    hash = ((hash << 5) - hash) + (b.isActive ? 4 : 0);
    hash = hash & hash; // Convert to 32-bit integer
  }

  return hash.toString(36);
}

/**
 * Convert API building to cached building format
 */
function toCachedBuilding(building: SettlementBuilding): CachedSettlementBuilding {
  return {
    id: `${building.settlementId}-${building.buildingId}`,
    settlementId: building.settlementId,
    buildingId: building.buildingId,
    name: building.name,
    type: building.type,
    xCoordinate: building.xCoordinate,
    yCoordinate: building.yCoordinate,
    zCoordinate: building.zCoordinate,
    isDestroyed: building.isDestroyed,
    isDamaged: building.isDamaged,
    isActive: building.isActive,
    prefabPath: building.prefabPath,
    prefabName: building.prefabName,
    health: building.health,
    level: building.level,
    workers: building.workers,
    lastUpdated: Date.now()
  };
}

/**
 * Convert cached building to API building format
 */
function fromCachedBuilding(cached: CachedSettlementBuilding): SettlementBuilding {
  return {
    buildingId: cached.buildingId,
    settlementId: cached.settlementId,
    name: cached.name,
    type: cached.type,
    xCoordinate: cached.xCoordinate,
    yCoordinate: cached.yCoordinate,
    zCoordinate: cached.zCoordinate,
    isDestroyed: cached.isDestroyed,
    isDamaged: cached.isDamaged,
    isActive: cached.isActive,
    prefabPath: cached.prefabPath,
    prefabName: cached.prefabName,
    health: cached.health,
    level: cached.level,
    workers: cached.workers
  };
}

/**
 * Check if buildings have changed by comparing cached vs fresh data
 */
async function compareBuildingData(
  settlementId: number,
  freshBuildings: SettlementBuilding[]
): Promise<BuildingComparisonResult> {
  try {
    // Get cached buildings for this settlement
    const cachedBuildingEntries = await codexDb.settlementBuildings
      .where('settlementId')
      .equals(settlementId)
      .toArray();

    if (cachedBuildingEntries.length === 0) {
      // No cache exists - return fresh data
      console.log(`🏗️ No cached buildings found for settlement ${settlementId}`);
      return {
        hasChanged: true,
        cachedBuildings: [],
        freshBuildings,
        changesSummary: {
          added: freshBuildings.length,
          removed: 0,
          modified: 0
        }
      };
    }

    const cachedBuildings = cachedBuildingEntries.map(fromCachedBuilding);

    // Get metadata to check hash
    const metadata = await codexDb.settlementMapMetadata.get(settlementId);

    if (!metadata) {
      console.log(`🏗️ No metadata found for settlement ${settlementId}`);
      return {
        hasChanged: true,
        cachedBuildings,
        freshBuildings,
        changesSummary: {
          added: freshBuildings.length - cachedBuildings.length,
          removed: 0,
          modified: 0
        }
      };
    }

    // Generate hash for fresh buildings
    const freshHash = generateBuildingHash(freshBuildings);

    // Compare hashes
    const hasChanged = metadata.buildingHash !== freshHash;

    if (hasChanged) {
      // Calculate detailed changes
      const cachedIds = new Set(cachedBuildings.map(b => b.buildingId));
      const freshIds = new Set(freshBuildings.map(b => b.buildingId));

      const added = freshBuildings.filter(b => !cachedIds.has(b.buildingId)).length;
      const removed = cachedBuildings.filter(b => !freshIds.has(b.buildingId)).length;
      const modified = freshBuildings.filter(b => {
        if (!cachedIds.has(b.buildingId)) return false;
        const cached = cachedBuildings.find(c => c.buildingId === b.buildingId);
        if (!cached) return false;

        // Check if any relevant properties changed
        return (
          cached.xCoordinate !== b.xCoordinate ||
          cached.yCoordinate !== b.yCoordinate ||
          cached.zCoordinate !== b.zCoordinate ||
          cached.isDestroyed !== b.isDestroyed ||
          cached.isDamaged !== b.isDamaged ||
          cached.isActive !== b.isActive
        );
      }).length;

      console.log(`🏗️ Building changes detected for settlement ${settlementId}:`, {
        added,
        removed,
        modified,
        oldHash: metadata.buildingHash,
        newHash: freshHash
      });

      return {
        hasChanged: true,
        cachedBuildings,
        freshBuildings,
        changesSummary: { added, removed, modified }
      };
    }

    console.log(`✅ No building changes for settlement ${settlementId} (hash: ${freshHash})`);

    return {
      hasChanged: false,
      cachedBuildings,
      freshBuildings,
    };
  } catch (error) {
    console.error('Failed to compare building data:', error);
    // On error, assume changed and use fresh data
    return {
      hasChanged: true,
      cachedBuildings: [],
      freshBuildings,
    };
  }
}

/**
 * Cache settlement buildings
 */
async function cacheBuildingData(
  settlementId: number,
  buildings: SettlementBuilding[]
): Promise<void> {
  try {
    const now = Date.now();

    // Generate hash
    const hash = generateBuildingHash(buildings);

    // Clear old cached buildings for this settlement
    await codexDb.settlementBuildings
      .where('settlementId')
      .equals(settlementId)
      .delete();

    // Cache all buildings using bulkPut instead of bulkAdd to handle duplicates
    const cachedBuildings = buildings.map(toCachedBuilding);
    await codexDb.settlementBuildings.bulkPut(cachedBuildings);

    // Update metadata
    await codexDb.settlementMapMetadata.put({
      settlementId,
      buildingHash: hash,
      lastUpdated: now
    });

    console.log(`💾 Cached ${buildings.length} buildings for settlement ${settlementId} (hash: ${hash})`);
  } catch (error) {
    console.error('Failed to cache building data:', error);
    // Don't throw - allow the app to continue even if caching fails
  }
}

/**
 * Get cached buildings for a settlement
 */
async function getCachedBuildings(settlementId: number): Promise<SettlementBuilding[]> {
  try {
    const cachedEntries = await codexDb.settlementBuildings
      .where('settlementId')
      .equals(settlementId)
      .toArray();

    return cachedEntries.map(fromCachedBuilding);
  } catch (error) {
    console.error('Failed to get cached buildings:', error);
    return [];
  }
}

/**
 * Check if cache exists for a settlement
 */
async function hasCachedBuildings(settlementId: number): Promise<boolean> {
  try {
    const count = await codexDb.settlementBuildings
      .where('settlementId')
      .equals(settlementId)
      .count();

    return count > 0;
  } catch (error) {
    console.error('Failed to check cached buildings:', error);
    return false;
  }
}

/**
 * Clear cache for a specific settlement
 */
async function clearSettlementCache(settlementId: number): Promise<void> {
  try {
    await Promise.all([
      codexDb.settlementBuildings
        .where('settlementId')
        .equals(settlementId)
        .delete(),
      codexDb.settlementMapMetadata.delete(settlementId)
    ]);

    console.log(`🗑️ Cleared cache for settlement ${settlementId}`);
  } catch (error) {
    console.error('Failed to clear settlement cache:', error);
    throw error;
  }
}

/**
 * Get cache age for a settlement
 */
async function getCacheAge(settlementId: number): Promise<number | null> {
  try {
    const metadata = await codexDb.settlementMapMetadata.get(settlementId);
    if (!metadata) return null;

    return Date.now() - metadata.lastUpdated;
  } catch (error) {
    console.error('Failed to get cache age:', error);
    return null;
  }
}

export const settlementCacheService = {
  compareBuildingData,
  cacheBuildingData,
  getCachedBuildings,
  hasCachedBuildings,
  clearSettlementCache,
  getCacheAge,
  generateBuildingHash
};
