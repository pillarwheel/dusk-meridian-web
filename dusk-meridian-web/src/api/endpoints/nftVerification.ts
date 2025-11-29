/**
 * NFT Verification API Integration
 * Connects to GameServer NFT endpoints for blockchain verification
 */

import { apiClient } from '../client';

/**
 * NFT Validation Response (from GameServer)
 */
export interface NFTValidationResponse {
  canCreateCharacter: boolean;
  ownedTiers: Array<{
    tier: number;
    tokenId: string;
    contractAddress: string;
    metadata: {
      tier: number;
      tokenId: string;
      name: string;
      [key: string]: any;
    };
  }>;
  missingRequirements: string[];
  availableCharacterSlots: number;
}

/**
 * NFT Inventory Response (from GameServer)
 */
export interface NFTInventoryResponse {
  success: boolean;
  walletAddress: string;
  ownedNFTs: Array<{
    tokenId: string;
    tier: number;
    contractAddress: string;
    name: string;
    metadata: {
      tier: number;
      tokenId: string;
      name: string;
      [key: string]: any;
    };
    isUsedForCharacter: boolean;
    associatedCharacterId: number | null;
  }>;
  totalNFTs: number;
  hasRequiredNFTs: boolean;
  availableCharacterSlots: number;
}

/**
 * Character Creation Config Response
 */
export interface CharacterCreationConfigResponse {
  success: boolean;
  ownedNFTs: {
    tier1: Array<{ tokenId: string; name: string }>;
    tier2: Array<{ tokenId: string; name: string }>;
    tier3: Array<{ tokenId: string; name: string }>;
    tier4: Array<{ tokenId: string; name: string }>;
  };
  availableTemplates: any[];
  availableGeographicalTraits: any[];
  requirements: {
    minimumTier1: number;
    minimumTier2: number;
  };
}

/**
 * NFT Bonuses Response
 */
export interface NFTBonusesResponse {
  success: boolean;
  characterId: number;
  appliedBonuses: {
    tier1Bonus?: any;
    tier2Bonus?: any;
    tier3Bonus?: any;
    tier4Bonus?: any;
  };
  totalBonusStats: {
    extraSkillSlots: number;
    statBonus: number;
    unlocksPremiumTemplates: boolean;
  };
}

/**
 * Validate NFTs for character creation
 * GET /api/nft/validate-nfts
 */
export async function validateNFTs(authToken: string): Promise<NFTValidationResponse> {
  try {
    const response = await apiClient.get('/nft/validate-nfts', {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to validate NFTs:', error);
    throw error;
  }
}

/**
 * Get NFT inventory for current user
 * GET /api/nft/inventory
 */
export async function getNFTInventory(authToken: string): Promise<NFTInventoryResponse> {
  try {
    const response = await apiClient.get('/nft/inventory', {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get NFT inventory:', error);
    throw error;
  }
}

/**
 * Get character creation configuration
 * GET /api/character/creation-config
 */
export async function getCharacterCreationConfig(authToken: string): Promise<CharacterCreationConfigResponse> {
  try {
    const response = await apiClient.get('/character/creation-config', {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get character creation config:', error);
    throw error;
  }
}

/**
 * Get NFT bonuses for a character
 * GET /api/nft/bonuses/:characterId
 */
export async function getNFTBonuses(characterId: number, authToken: string): Promise<NFTBonusesResponse> {
  try {
    const response = await apiClient.get(`/nft/bonuses/${characterId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get NFT bonuses:', error);
    throw error;
  }
}

/**
 * Create character with NFT validation
 * POST /api/character/create
 */
export interface CharacterCreationRequest {
  characterName: string;
  selectedTier1NFT: string;
  selectedTier2NFT: string;
  selectedTier3NFT: string | null;
  selectedTier4NFT: string | null;
  selectedGeographicalTraitId: string;
  buildType: number;
  selectedTemplateId: string;
  selectedSkillIds: string[];
  className: string;
  appearance: {
    modelType: string;
    customizationData: Record<string, any>;
  };
}

export interface CharacterCreationResponse {
  success: boolean;
  characterId: string;
  summary: {
    name: string;
    class: string;
    geographicalTrait: string;
    skillCount: number;
    nftBonuses: {
      extraSkillSlots: number;
      statBonus: number;
      unlocksPremiumTemplates: boolean;
    };
    createdAt: string;
  };
}

export async function createCharacterWithNFTs(
  request: CharacterCreationRequest,
  authToken: string
): Promise<CharacterCreationResponse> {
  try {
    const response = await apiClient.post('/character/create', request, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create character:', error);
    throw error;
  }
}

/**
 * Helper function to check if user has required NFTs
 */
export async function checkNFTRequirements(authToken: string): Promise<{
  hasRequirements: boolean;
  canCreateCharacter: boolean;
  missingNFTs: string[];
  availableSlots: number;
}> {
  try {
    const validation = await validateNFTs(authToken);

    return {
      hasRequirements: validation.canCreateCharacter,
      canCreateCharacter: validation.canCreateCharacter,
      missingNFTs: validation.missingRequirements,
      availableSlots: validation.availableCharacterSlots
    };
  } catch (error) {
    console.error('Failed to check NFT requirements:', error);
    return {
      hasRequirements: false,
      canCreateCharacter: false,
      missingNFTs: ['Unable to verify NFT ownership'],
      availableSlots: 0
    };
  }
}

/**
 * Helper function to get owned NFT token IDs
 */
export async function getOwnedNFTTokenIds(authToken: string): Promise<string[]> {
  try {
    const inventory = await getNFTInventory(authToken);
    return inventory.ownedNFTs.map(nft => nft.tokenId);
  } catch (error) {
    console.error('Failed to get owned NFT token IDs:', error);
    return [];
  }
}

/**
 * Helper function to get used NFTs (associated with characters)
 */
export async function getUsedNFTs(authToken: string): Promise<Array<{ tokenId: string; characterId: number }>> {
  try {
    const inventory = await getNFTInventory(authToken);
    return inventory.ownedNFTs
      .filter(nft => nft.isUsedForCharacter && nft.associatedCharacterId !== null)
      .map(nft => ({
        tokenId: nft.tokenId,
        characterId: nft.associatedCharacterId!
      }));
  } catch (error) {
    console.error('Failed to get used NFTs:', error);
    return [];
  }
}
