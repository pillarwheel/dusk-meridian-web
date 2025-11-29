import { codexDb } from '@/db/codexDb';
import type { CachedNFT } from '@/db/codexDb';
import { nftCollection } from '@/data/nftData';

/**
 * Populate NFT data into IndexedDB cache
 */
export async function populateNFTData(): Promise<void> {
  const now = Date.now();
  const allNFTs: CachedNFT[] = [];

  // Add Tier 1 NFTs
  for (const nft of nftCollection.tier1) {
    allNFTs.push({
      id: nft.id,
      tier: 1,
      name: nft.name,
      description: nft.description,
      imagePath: nft.imagePath,
      metadata: JSON.stringify(nft),
      lastUpdated: now
    });
  }

  // Add Tier 2 NFTs
  for (const nft of nftCollection.tier2) {
    allNFTs.push({
      id: nft.id,
      tier: 2,
      name: nft.name,
      description: nft.description,
      imagePath: nft.imagePath,
      metadata: JSON.stringify(nft),
      lastUpdated: now
    });
  }

  // Add Tier 3 NFTs
  for (const nft of nftCollection.tier3) {
    allNFTs.push({
      id: nft.id,
      tier: 3,
      name: nft.name,
      description: nft.description,
      imagePath: nft.imagePath,
      metadata: JSON.stringify(nft),
      lastUpdated: now
    });
  }

  // Clear existing NFTs and insert new data
  await codexDb.nfts.clear();
  await codexDb.nfts.bulkAdd(allNFTs);

  // Update cache metadata
  await codexDb.updateCacheMetadata('nfts-all', 'nfts', 24 * 60 * 60 * 1000); // 24 hours

  console.log(`Populated ${allNFTs.length} NFTs into cache`);
}

/**
 * Get all NFTs from cache
 */
export async function getAllNFTsFromCache(): Promise<CachedNFT[]> {
  return await codexDb.nfts.toArray();
}

/**
 * Get NFTs by tier
 */
export async function getNFTsByTierFromCache(tier: 1 | 2 | 3): Promise<CachedNFT[]> {
  return await codexDb.nfts.where('tier').equals(tier).toArray();
}

/**
 * Get single NFT by ID
 */
export async function getNFTByIdFromCache(id: string): Promise<CachedNFT | undefined> {
  return await codexDb.nfts.get(id);
}
