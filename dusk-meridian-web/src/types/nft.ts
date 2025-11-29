/**
 * NFT Types for Dusk Meridian Three-Tier Architecture
 */

export type NFTTier = 1 | 2 | 3;

export type RoleType = 'guardian' | 'striker' | 'specialist' | 'coordinator';
export type PowerSourceType = 'magic' | 'martial_arts' | 'tech' | 'divine' | 'nature' | 'psionic' | 'biochem';

// Tier 1: Universal Role License NFTs
export interface Tier1RoleNFT {
  id: string;
  tier: 1;
  name: string;
  roleType: RoleType;
  description: string;
  imagePath: string;
  soulbound: boolean;
  requiredForCharacter: boolean;
  roleDescription: string;
  playstyle: string;
  primaryFunction: string;
  // Blockchain integration fields
  tokenId?: string;
  contractAddress?: string;
  metadata: {
    strength: number;
    agility: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
}

// Tier 2: Power Source Certification NFTs
export interface Tier2PowerSourceNFT {
  id: string;
  tier: 2;
  name: string;
  powerSource: PowerSourceType;
  description: string;
  imagePath: string;
  tradeable: boolean;
  compatibleRoles: RoleType[];
  compatibleWorlds: string[];
  unlockCategories: string[];
  specializations: string[];
  signatureAbilities: string[];
  // Blockchain integration fields
  tokenId?: string;
  contractAddress?: string;
  metadata: {
    strength: number;
    agility: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
}

// Tier 3: Specialization NFTs
export interface Tier3SpecializationNFT {
  id: string;
  tier: 3;
  name: string;
  specializationType: string;
  description: string;
  imagePath: string;
  tradeable: boolean;
  requiredRole: RoleType | RoleType[];
  requiredPowerSource: PowerSourceType | PowerSourceType[];
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  signatureAbilities: string[];
  loreDescription: string;
  worldAdaptation: {
    [worldType: string]: string;
  };
  // Blockchain integration fields
  tokenId?: string;
  contractAddress?: string;
  metadata: {
    strength: number;
    agility: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
}

export type NFTData = Tier1RoleNFT | Tier2PowerSourceNFT | Tier3SpecializationNFT;

export interface NFTCollection {
  tier1: Tier1RoleNFT[];
  tier2: Tier2PowerSourceNFT[];
  tier3: Tier3SpecializationNFT[];
}

export interface CharacterNFTRequirements {
  role: Tier1RoleNFT;
  powerSource?: Tier2PowerSourceNFT;
  specialization?: Tier3SpecializationNFT;
}

export interface NFTVerificationResult {
  verified: boolean;
  walletAddress?: string;
  ownedNFTs: {
    tier1: string[];
    tier2: string[];
    tier3: string[];
  };
  missingRequirements: string[];
}
