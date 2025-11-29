// Character Creation TypeScript Interfaces based on Dusk Meridian specs

// NFT Types
export interface NFTValidationResponse {
  // Backend actual response structure
  canCreateCharacter: boolean;
  ownedTiers: NFTTier[];
  missingRequirements?: string[];
  availableCharacterSlots?: number;
  message?: string;
  // Legacy fields (may not be present in actual backend response)
  isValid?: boolean;
  walletAddress?: string;
  ownedNFTs?: NFTTier[]; // Alias for ownedTiers
  maxCharacterSlots?: number; // Alias for availableCharacterSlots
  currentCharacterCount?: number;
}

export interface NFTTier {
  tier: number;
  tokenId: string;
  contractAddress: string;
  metadata: Record<string, any>;
  // Legacy fields for backward compatibility
  count?: number;
  tokenIds?: string[];
}

export interface NFTBonuses {
  tier: number;
  skillPointBonus: number;
  attributePointBonus: number;
  premiumTemplatesUnlocked: boolean;
  exclusiveTraitsUnlocked: boolean;
  additionalCustomizationOptions?: boolean;
  errorMessage?: string | null;
}

// Character Creation Configuration
export interface CharacterCreationConfig {
  availableRaces: Race[];
  availableClasses: CharacterClass[];
  geographicalTraits: GeographicalTrait[];
  skillTemplates: SkillTemplate[];
  skills: Skill[];
  nftBonuses?: NFTBonuses;
  characterSlots: CharacterSlots;
}

export interface Race {
  id: number;
  name: string;
  description: string;
  baseAttributes: AttributeDistribution;
  racialTraits: string[];
  isActive: boolean;
}

export interface CharacterClass {
  id: number;
  name: string;
  description: string;
  primaryAttributes: string[];
  suggestedSkills: string[];
  classFeatures: string[];
  isActive: boolean;
}

export interface CharacterSlots {
  used: number;
  available: number;
  total: number;
}

// Geographical Traits
export interface GeographicalTrait {
  id: string;
  name: string;
  region: string;
  description: string;
  resistances: Resistance[];
  bonuses: Bonus[];
  isActive: boolean;
}

export interface Resistance {
  type: string;
  value: number;
  description: string;
}

export interface Bonus {
  type: string;
  attribute?: string;
  value: number;
  description: string;
}

// Skills and Templates
export interface SkillTemplate {
  templateId: string;
  name: string;
  description: string;
  category: string;
  preselectedSkillIds: string[];
  statModifiers: Record<string, number>;
  requiredNFTTier?: number;
  isActive: boolean;
  sortOrder: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  prerequisites: string[];
  maxLevel: number;
  skillType: 'active' | 'passive' | 'toggle';
  cooldown?: number;
  manaCost?: number;
  effects: SkillEffect[];
  isActive: boolean;
}

export interface SkillEffect {
  type: string;
  target: string;
  value: number;
  duration?: number;
  description: string;
}

// Character Creation Request/Response
export interface CharacterCreationRequest {
  name: string;
  raceId: number;
  classId: number;
  geographicalTraitId?: string;
  skillTemplateId?: string;
  customSkillIds?: string[];
  attributeDistribution: AttributeDistribution;
  walletAddress: string;
  selectedNFTs: {
    tier1?: string;
    tier2?: string;
    tier3?: string;
    tier4?: string;
  };
  appearance?: CharacterAppearance;
}

export interface AttributeDistribution {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface CharacterAppearance {
  modelType?: string;
  customizationData?: Record<string, any>;
}

export interface CharacterCreationResponse {
  success: boolean;
  characterId?: string;
  errorMessage?: string;
  summary?: CharacterSummary;
}

export interface CharacterSummary {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  totalSkills: number;
  geographicalTrait?: string;
  createdAt: string;
}

// Validation
export interface CharacterValidationRequest {
  name: string;
  selectedSkillIds: string[];
  attributeDistribution: AttributeDistribution;
  raceId: number;
  classId: number;
}

export interface CharacterValidationResponse {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

// Character Creation State Management
export interface CharacterCreationState {
  // Current step
  currentStep: number;

  // API Data
  nftValidation?: NFTValidationResponse;
  creationConfig?: CharacterCreationConfig;

  // User Selections
  characterName: string;
  selectedRace?: Race;
  selectedClass?: CharacterClass;
  selectedGeographicalTrait?: GeographicalTrait;
  selectedSkillTemplate?: SkillTemplate;
  customSkillIds: string[];
  attributeDistribution: AttributeDistribution;
  selectedNFTs: {
    tier1?: string;
    tier2?: string;
    tier3?: string;
    tier4?: string;
  };
  appearance: CharacterAppearance;

  // UI State
  isLoading: boolean;
  errors: Record<string, string>;
  mode: 'template' | 'custom'; // For skill selection
  totalAttributePoints: number;
  usedAttributePoints: number;
}

// Step Types
export type CharacterCreationStep =
  | 'nft-validation'
  | 'basic-info'
  | 'geographical-traits'
  | 'skill-configuration'
  | 'attribute-distribution'
  | 'review-create';

// Error Types
export interface CreationError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, any>;
}

// Utility Types
export type BuildType = 'template' | 'custom';

export interface StepValidation {
  isValid: boolean;
  errors: string[];
  canProceed: boolean;
}

// Character Creation Data (for managing state across steps)
export interface BasicInfo {
  name: string;
  race?: Race;
  characterClass?: CharacterClass;
}

export interface SkillConfiguration {
  useTemplate: boolean;
  templateId?: string;
  template?: SkillTemplate;
  selectedSkills: string[];
  customSkillPoints: number;
}

export interface CharacterCreationData {
  basicInfo: BasicInfo;
  geographicalTrait?: GeographicalTrait;
  skillConfiguration: SkillConfiguration;
  attributes: AttributeDistribution;
  selectedNFTs: {
    tier1?: string;
    tier2?: string;
    tier3?: string;
    tier4?: string;
  };
  nftTier: number;
  walletAddress: string;
}

// Constants
export const CREATION_STEPS: { id: CharacterCreationStep; title: string; description: string }[] = [
  {
    id: 'nft-validation',
    title: 'NFT Validation',
    description: 'Verify your NFT ownership and character slots'
  },
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Choose your character name, race, and class'
  },
  {
    id: 'geographical-traits',
    title: 'Geographical Origin',
    description: 'Select regional traits that define your character\'s background'
  },
  {
    id: 'skill-configuration',
    title: 'Skills & Abilities',
    description: 'Choose skills either from templates or custom selection'
  },
  {
    id: 'attribute-distribution',
    title: 'Attribute Points',
    description: 'Distribute your attribute points across different stats'
  },
  {
    id: 'review-create',
    title: 'Review & Create',
    description: 'Review your choices and create your character'
  }
];

export const DEFAULT_ATTRIBUTE_DISTRIBUTION: AttributeDistribution = {
  strength: 8,
  dexterity: 8,
  constitution: 8,
  intelligence: 8,
  wisdom: 8,
  charisma: 8
};

export const BASE_ATTRIBUTE_POINTS = 27; // Point-buy system like D&D 5e
export const MIN_ATTRIBUTE_VALUE = 8;
export const MAX_ATTRIBUTE_VALUE = 15; // Standard point-buy max before racial bonuses

// Validation Constants
export const CHARACTER_NAME_MIN_LENGTH = 3;
export const CHARACTER_NAME_MAX_LENGTH = 20;
export const MIN_SKILLS_REQUIRED = 3;
export const DEFAULT_MAX_SKILLS = 10;
export const BASE_SKILL_POINTS = 10;