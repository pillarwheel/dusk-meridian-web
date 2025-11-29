/**
 * NFT Mapping Service
 * Maps blockchain token IDs to NFT data and vice versa
 */

import type { NFTData, Tier1RoleNFT, Tier2PowerSourceNFT, Tier3SpecializationNFT } from '@/types/nft';
import { tier1RoleNFTs, tier2PowerSourceNFTs, tier3SpecializationNFTs } from '@/data/nftData';

/**
 * Blockchain NFT data structure (from Immutable API)
 */
export interface BlockchainNFT {
  tokenId: string;
  contractAddress: string;
  tier?: number;
  name?: string;
  metadata?: {
    tier?: number;
    tokenId?: string;
    name?: string;
    [key: string]: any;
  };
}

/**
 * Enhanced NFT with ownership data
 */
export interface OwnedNFT extends NFTData {
  isOwned: boolean;
  isUsedForCharacter?: boolean;
  associatedCharacterId?: number | null;
}

/**
 * Get NFT data by token ID
 */
export function getNFTByTokenId(tokenId: string, contractAddress?: string): NFTData | undefined {
  const allNFTs: NFTData[] = [
    ...tier1RoleNFTs,
    ...tier2PowerSourceNFTs,
    ...tier3SpecializationNFTs
  ];

  return allNFTs.find(nft => {
    const matchesTokenId = nft.tokenId === tokenId;
    const matchesContract = contractAddress ? nft.contractAddress === contractAddress : true;
    return matchesTokenId && matchesContract;
  });
}

/**
 * Get NFT data by ID (internal ID, not token ID)
 */
export function getNFTById(id: string): NFTData | undefined {
  const allNFTs: NFTData[] = [
    ...tier1RoleNFTs,
    ...tier2PowerSourceNFTs,
    ...tier3SpecializationNFTs
  ];

  return allNFTs.find(nft => nft.id === id);
}

/**
 * Map blockchain NFT to UI NFT data
 */
export function mapBlockchainNFTToUIData(blockchainNFT: BlockchainNFT): NFTData | undefined {
  return getNFTByTokenId(blockchainNFT.tokenId, blockchainNFT.contractAddress);
}

/**
 * Map multiple blockchain NFTs to UI data
 */
export function mapBlockchainNFTsToUIData(blockchainNFTs: BlockchainNFT[]): NFTData[] {
  return blockchainNFTs
    .map(mapBlockchainNFTToUIData)
    .filter((nft): nft is NFTData => nft !== undefined);
}

/**
 * Enrich NFT data with ownership information
 */
export function enrichNFTWithOwnership(
  nft: NFTData,
  ownedTokenIds: string[],
  usedNFTs?: Array<{ tokenId: string; characterId: number }>
): OwnedNFT {
  const isOwned = nft.tokenId ? ownedTokenIds.includes(nft.tokenId) : false;
  const usedNFT = usedNFTs?.find(used => used.tokenId === nft.tokenId);

  return {
    ...nft,
    isOwned,
    isUsedForCharacter: !!usedNFT,
    associatedCharacterId: usedNFT?.characterId ?? null
  };
}

/**
 * Get all NFTs with ownership information
 */
export function getAllNFTsWithOwnership(
  ownedTokenIds: string[],
  usedNFTs?: Array<{ tokenId: string; characterId: number }>
): OwnedNFT[] {
  const allNFTs: NFTData[] = [
    ...tier1RoleNFTs,
    ...tier2PowerSourceNFTs,
    ...tier3SpecializationNFTs
  ];

  return allNFTs.map(nft => enrichNFTWithOwnership(nft, ownedTokenIds, usedNFTs));
}

/**
 * Filter NFTs by tier with ownership information
 */
export function getNFTsByTierWithOwnership(
  tier: 1 | 2 | 3,
  ownedTokenIds: string[],
  usedNFTs?: Array<{ tokenId: string; characterId: number }>
): OwnedNFT[] {
  let nfts: NFTData[];

  switch (tier) {
    case 1:
      nfts = tier1RoleNFTs;
      break;
    case 2:
      nfts = tier2PowerSourceNFTs;
      break;
    case 3:
      nfts = tier3SpecializationNFTs;
      break;
    default:
      nfts = [];
  }

  return nfts.map(nft => enrichNFTWithOwnership(nft, ownedTokenIds, usedNFTs));
}

/**
 * Get only owned NFTs
 */
export function getOwnedNFTs(
  ownedTokenIds: string[],
  usedNFTs?: Array<{ tokenId: string; characterId: number }>
): OwnedNFT[] {
  const allNFTs = getAllNFTsWithOwnership(ownedTokenIds, usedNFTs);
  return allNFTs.filter(nft => nft.isOwned);
}

/**
 * Get available NFTs (owned but not used for character)
 */
export function getAvailableNFTs(
  ownedTokenIds: string[],
  usedNFTs?: Array<{ tokenId: string; characterId: number }>
): OwnedNFT[] {
  const ownedNFTs = getOwnedNFTs(ownedTokenIds, usedNFTs);
  return ownedNFTs.filter(nft => !nft.isUsedForCharacter);
}

/**
 * Get available NFTs by tier
 */
export function getAvailableNFTsByTier(
  tier: 1 | 2 | 3,
  ownedTokenIds: string[],
  usedNFTs?: Array<{ tokenId: string; characterId: number }>
): OwnedNFT[] {
  const nftsWithOwnership = getNFTsByTierWithOwnership(tier, ownedTokenIds, usedNFTs);
  return nftsWithOwnership.filter(nft => nft.isOwned && !nft.isUsedForCharacter);
}

/**
 * Verify character creation requirements
 */
export interface CharacterCreationVerification {
  canCreate: boolean;
  hasRequiredTier1: boolean;
  hasRequiredTier2: boolean;
  availableTier1NFTs: OwnedNFT[];
  availableTier2NFTs: OwnedNFT[];
  availableTier3NFTs: OwnedNFT[];
  missingRequirements: string[];
}

export function verifyCharacterCreationRequirements(
  ownedTokenIds: string[],
  usedNFTs?: Array<{ tokenId: string; characterId: number }>
): CharacterCreationVerification {
  const availableTier1 = getAvailableNFTsByTier(1, ownedTokenIds, usedNFTs);
  const availableTier2 = getAvailableNFTsByTier(2, ownedTokenIds, usedNFTs);
  const availableTier3 = getAvailableNFTsByTier(3, ownedTokenIds, usedNFTs);

  const hasRequiredTier1 = availableTier1.length > 0;
  const hasRequiredTier2 = availableTier2.length > 0;

  const missingRequirements: string[] = [];
  if (!hasRequiredTier1) {
    missingRequirements.push('Tier 1 Role License NFT required');
  }
  if (!hasRequiredTier2) {
    missingRequirements.push('Tier 2 Power Source Certification NFT required');
  }

  return {
    canCreate: hasRequiredTier1 && hasRequiredTier2,
    hasRequiredTier1,
    hasRequiredTier2,
    availableTier1NFTs: availableTier1,
    availableTier2NFTs: availableTier2,
    availableTier3NFTs: availableTier3,
    missingRequirements
  };
}

/**
 * Token ID to Tier mapping (based on minted NFTs)
 */
export const TOKEN_ID_TO_TIER_MAP: Record<string, number> = {
  '1': 1, // Coordinator
  '2': 1, // Guardian
  '5': 2, // Biochem
  '6': 2, // Divine
};

/**
 * Get tier from token ID
 */
export function getTierFromTokenId(tokenId: string): number | undefined {
  return TOKEN_ID_TO_TIER_MAP[tokenId];
}

/**
 * Contract configuration
 */
export const NFT_CONTRACT_CONFIG = {
  contractAddress: '0x8a287861D4138e50Dd6126905FB606617b49dc50',
  network: 'Immutable zkEVM Testnet',
  explorerUrl: 'https://explorer.testnet.immutable.com',
};

/**
 * Get explorer URL for a token
 */
export function getTokenExplorerUrl(tokenId: string): string {
  return `${NFT_CONTRACT_CONFIG.explorerUrl}/address/${NFT_CONTRACT_CONFIG.contractAddress}/token/${tokenId}`;
}

/**
 * Get explorer URL for a wallet
 */
export function getWalletExplorerUrl(walletAddress: string): string {
  return `${NFT_CONTRACT_CONFIG.explorerUrl}/address/${walletAddress}`;
}
