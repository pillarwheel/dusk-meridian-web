// Codex API types for game encyclopedia data

export interface CodexEntry {
  id: string;
  title: string;
  description: string;
  category: CodexCategory;
  subcategory?: string;
  content: string;
  lastUpdated: Date;
  isDiscovered?: boolean;
}

export enum CodexCategory {
  Mechanics = 'Mechanics',
  Geography = 'Geography',
  Population = 'Population',
  Lore = 'Lore',
  Factions = 'Factions',
  Resources = 'Resources'
}

// Mechanics
export interface Skill {
  id: number;
  name: string;
  description: string;
  category: string;
  maxLevel?: number;
  prerequisites?: string[];
}

export interface SurvivalMechanic {
  id: number;
  name: string;
  description: string;
  type: string;
  mechanics: Record<string, any>;
}

export interface ActionCategory {
  id: number;
  name: string;
  description: string;
  priority: number;
  needCategory: string;
}

export interface Profession {
  id: number;
  name: string;
  description: string;
  requiredSkills: string[];
  benefits: string[];
  unlockConditions?: string[];
}

export interface Spell {
  id: number;
  name: string;
  description: string;
  school: string;
  level: number;
  components: string[];
  castingTime: string;
  range: string;
  duration: string;
  effect: string;
}

export interface Technology {
  id: number;
  name: string;
  description: string;
  category: string;
  requirements: string[];
  unlocks: string[];
  researchCost?: number;
}

export interface CharacterClass {
  name: string;
  description?: string;
  primaryStats?: string[];
  abilities?: string[];
  count?: number; // Number of characters with this class
}

// Geography
export interface Continent {
  id: number;
  name: string;
  description: string;
  climate?: string;
  majorFeatures?: string[];
}

export interface Region {
  id: number;
  name: string;
  description: string;
  continentId: number;
  climate?: string;
  resources?: string[];
  settlements?: number; // Count of settlements
}

export interface SubRegion {
  id: number;
  name: string;
  description: string;
  regionId: number;
  terrain?: string;
  dangerLevel?: number;
}

export interface Settlement {
  id: string;
  name: string;
  type: string;
  population: number;
  factionId?: string;
  factionName?: string;
  regionId?: number;
  regionName?: string;
  description?: string;
  founded?: Date;
  isCapital?: boolean;
}

export interface Building {
  id: number;
  name: string;
  type: string;
  description: string;
  function: string;
  requirements?: string[];
  benefits?: string[];
}

// Population Data
export interface PopulationStatistics {
  totalCharacters: number;
  totalPlayers: number;
  totalNPCs: number;
  onlineCharacters: number;
  offlineCharacters: number;
  charactersByClass: Record<string, number>;
  charactersByFaction: Record<string, number>;
  charactersBySettlement: Record<string, number>;
  averageLevel: number;
  lastUpdated: Date;
}

export interface CharacterLocation {
  characterId: string;
  characterName: string;
  settlementId?: string;
  settlementName?: string;
  regionId?: number;
  regionName?: string;
  lastSeen: Date;
  isOnline: boolean;
}

// World Data
export interface Faction {
  id: string;
  name: string;
  description: string;
  color?: string;
  ideology?: string;
  leader?: string;
  memberCount?: number;
  settlementCount?: number;
  territory?: string[];
  allies?: string[];
  enemies?: string[];
  founded?: Date;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  factionId?: string;
  memberCount?: number;
  level?: number;
  specialization?: string;
  requirements?: string[];
  benefits?: string[];
}

export interface Resource {
  id: number;
  name: string;
  type: string;
  description: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  locations?: string[];
  uses?: string[];
  value?: number;
}

// Real-time statistics
export interface WorldStatistics {
  totalCharacters: number;
  totalClasses: number;
  onlinePlayers: number;
  offlinePlayers: number;
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

// Codex API Responses
export interface CodexResponse<T> {
  data: T;
  total?: number;
  category?: CodexCategory;
  lastUpdated: Date;
}

export interface CodexSearchRequest {
  query?: string;
  category?: CodexCategory;
  subcategory?: string;
  limit?: number;
  offset?: number;
}

export interface CodexSearchResponse {
  entries: CodexEntry[];
  total: number;
  categories: { category: CodexCategory; count: number }[];
}