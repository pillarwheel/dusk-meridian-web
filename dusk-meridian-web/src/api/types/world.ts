export interface World {
  id: number;
  name: string;
  seed: string;
  playerCount: number;
  settlements: number;
  createdAt: string;
  status: 'active' | 'maintenance' | 'archived';
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Settlement {
  id: number;
  worldId: number;
  name: string;
  position: Position;
  factionId: number;
  population: number;
  buildings: SettlementBuilding[];
  resources: ResourceInventory;
  status: 'active' | 'abandoned' | 'under_siege';
  founded: string;
  mayor?: Player;
}

export interface SettlementBuilding {
  id: number;
  type: BuildingType;
  level: number;
  health: number;
  maxHealth: number;
  position: Position;
  status: 'operational' | 'damaged' | 'under_construction' | 'destroyed';
  constructionProgress?: number;
}

export interface ResourceInventory {
  food: number;
  wood: number;
  stone: number;
  iron: number;
  gold: number;
  arcane: number;
  capacity: number;
}

export interface Player {
  id: string;
  username: string;
  factionId: number;
  level: number;
  experience: number;
  joinedAt: string;
  lastActive: string;
  isOnline: boolean;
}

export interface Faction {
  id: number;
  name: string;
  color: string;
  description: string;
  memberCount: number;
  territoryCount: number;
  leader?: Player;
}

export interface WorldDetails extends World {
  factions: Faction[];
  settlements: Settlement[];
  playerStats: {
    totalPlayers: number;
    activePlayers: number;
    newPlayersToday: number;
  };
  worldMap: {
    width: number;
    height: number;
    terrainData?: TerrainData;
  };
}

export interface TerrainData {
  biomes: Biome[];
  resources: ResourceNode[];
  landmarks: Landmark[];
}

export interface Biome {
  id: number;
  type: 'forest' | 'mountain' | 'plains' | 'desert' | 'swamp' | 'tundra';
  area: Position[];
  modifiers: {
    foodProduction: number;
    woodProduction: number;
    stoneProduction: number;
    ironProduction: number;
    movementSpeed: number;
  };
}

export interface ResourceNode {
  id: number;
  type: 'mine' | 'quarry' | 'forest' | 'farm';
  position: Position;
  yield: number;
  depleted: boolean;
  controlledBy?: number; // factionId
}

export interface Landmark {
  id: number;
  name: string;
  type: 'ruins' | 'monument' | 'portal' | 'dungeon';
  position: Position;
  description: string;
  effects?: LandmarkEffect[];
}

export interface LandmarkEffect {
  type: 'resource_bonus' | 'experience_bonus' | 'faction_buff';
  value: number;
  radius: number;
}

export type BuildingType =
  | 'town_hall'
  | 'barracks'
  | 'workshop'
  | 'market'
  | 'temple'
  | 'academy'
  | 'wall'
  | 'tower'
  | 'farm'
  | 'mine'
  | 'quarry'
  | 'lumber_mill';