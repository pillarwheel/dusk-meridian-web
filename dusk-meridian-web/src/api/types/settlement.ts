export interface Settlement {
  id: string;
  name: string;
  faction: SettlementFaction;
  population: PopulationData;
  defense: DefenseData;
  resources: ResourceData;
  buildings: Building[];
  garrison: GarrisonData;
  location: {
    x: number;
    y: number;
    z: number;
    regionName: string;
  };
  status: SettlementStatus;
  owner: string;
  founded: Date;
  lastUpdated: Date;
}

export interface PopulationData {
  current: number;
  max: number;
  growth: number; // per day
  happiness: number; // 0-100
  loyalty: number; // 0-100
}

export interface DefenseData {
  rating: number;
  walls: WallData;
  towers: number;
  gates: GateData[];
  traps: TrapData[];
}

export interface WallData {
  level: number;
  health: number;
  maxHealth: number;
  material: 'wood' | 'stone' | 'iron' | 'enchanted';
}

export interface GateData {
  id: string;
  name: string;
  direction: 'north' | 'south' | 'east' | 'west';
  health: number;
  maxHealth: number;
  isOpen: boolean;
  guardStrength: number;
}

export interface TrapData {
  id: string;
  type: string;
  location: string;
  damage: number;
  isArmed: boolean;
}

export interface ResourceData {
  storage: ResourceStorage;
  production: ResourceProduction;
  consumption: ResourceConsumption;
  tradingPost?: TradingPostData;
}

export interface ResourceStorage {
  food: StorageInfo;
  wood: StorageInfo;
  stone: StorageInfo;
  iron: StorageInfo;
  gold: StorageInfo;
  gems: StorageInfo;
  mana: StorageInfo;
}

export interface StorageInfo {
  current: number;
  max: number;
  reserved: number; // for ongoing projects
}

export interface ResourceProduction {
  food: ProductionInfo;
  wood: ProductionInfo;
  stone: ProductionInfo;
  iron: ProductionInfo;
  gold: ProductionInfo;
  gems: ProductionInfo;
  mana: ProductionInfo;
}

export interface ProductionInfo {
  rate: number; // per hour
  efficiency: number; // 0-100%
  workers: number;
  maxWorkers: number;
}

export interface ResourceConsumption {
  food: number; // per hour
  wood: number;
  stone: number;
  iron: number;
  gold: number;
  mana: number;
}

export interface TradingPostData {
  level: number;
  activeRoutes: TradeRoute[];
  availableRoutes: TradeRoute[];
  reputation: number;
}

export interface TradeRoute {
  id: string;
  destination: string;
  distance: number;
  travelTime: number; // hours
  profit: number;
  risk: 'low' | 'medium' | 'high';
  resources: TradeResource[];
}

export interface TradeResource {
  type: keyof ResourceStorage;
  quantity: number;
  price: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  name: string;
  level: number;
  maxLevel: number;
  health: number;
  maxHealth: number;
  position: BuildingPosition;
  status: BuildingStatus;
  queue: BuildingQueue[];
  resources: BuildingResources;
  workers: WorkerData;
  upgradeCost?: UpgradeCost;
  description: string;
  abilities: BuildingAbility[];
  lastMaintenance: Date;
}

export interface BuildingPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BuildingQueue {
  id: string;
  action: 'build' | 'upgrade' | 'repair' | 'research' | 'train';
  target: string;
  progress: number; // 0-100
  timeRemaining: number; // minutes
  cost: ResourceCost;
  priority: number;
}

export interface BuildingResources {
  input: Partial<ResourceStorage>;
  output: Partial<ResourceProduction>;
  storage: Partial<ResourceStorage>;
}

export interface WorkerData {
  current: number;
  max: number;
  efficiency: number; // 0-100%
  wages: number; // gold per hour
}

export interface UpgradeCost {
  gold: number;
  wood: number;
  stone: number;
  iron: number;
  time: number; // hours
  requirements: UpgradeRequirement[];
}

export interface UpgradeRequirement {
  type: 'building' | 'research' | 'resource' | 'population';
  target: string;
  level?: number;
  quantity?: number;
}

export interface ResourceCost {
  gold?: number;
  wood?: number;
  stone?: number;
  iron?: number;
  gems?: number;
  mana?: number;
  food?: number;
}

export interface BuildingAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number; // hours
  lastUsed?: Date;
  cost?: ResourceCost;
  effects: AbilityEffect[];
}

export interface AbilityEffect {
  type: 'production' | 'defense' | 'population' | 'research' | 'special';
  value: number;
  duration?: number; // hours
  target?: string;
}

export interface GarrisonData {
  commander?: string;
  units: GarrisonUnit[];
  capacity: number;
  morale: number; // 0-100
  training: TrainingData[];
  patrol: PatrolData[];
}

export interface GarrisonUnit {
  id: string;
  type: string;
  count: number;
  level: number;
  health: number;
  experience: number;
  equipment: string[];
}

export interface TrainingData {
  unitType: string;
  quantity: number;
  progress: number; // 0-100
  timeRemaining: number; // minutes
  cost: ResourceCost;
}

export interface PatrolData {
  id: string;
  name: string;
  route: PatrolPoint[];
  units: string[];
  status: 'active' | 'paused' | 'returning';
  lastReport: Date;
}

export interface PatrolPoint {
  x: number;
  y: number;
  duration: number; // minutes to stay
}

export type SettlementFaction = 'player' | 'ally' | 'neutral' | 'enemy' | 'npc';

export type SettlementStatus = 'peaceful' | 'alert' | 'under_siege' | 'expanding' | 'abandoned';

export type BuildingType =
  | 'town_hall'
  | 'barracks'
  | 'workshop'
  | 'market'
  | 'tavern'
  | 'library'
  | 'temple'
  | 'warehouse'
  | 'farm'
  | 'mine'
  | 'lumber_mill'
  | 'quarry'
  | 'blacksmith'
  | 'alchemist'
  | 'mage_tower'
  | 'walls'
  | 'gate'
  | 'tower'
  | 'house'
  | 'inn'
  | 'stable';

export type BuildingStatus =
  | 'active'
  | 'inactive'
  | 'under_construction'
  | 'upgrading'
  | 'damaged'
  | 'destroyed'
  | 'abandoned';