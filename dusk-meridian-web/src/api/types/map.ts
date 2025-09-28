export interface WorldMap {
  id: number;
  name: string;
  width: number;
  height: number;
  tiles: MapTile[][];
  regions: Region[];
  settlements: MapSettlement[];
  characters: MapCharacter[];
  pois: PointOfInterest[];
  boundaries: MapBoundary[];
}

export interface MapTile {
  x: number;
  y: number;
  terrain: TerrainType;
  elevation: number;
  temperature: number;
  biome: BiomeType;
  resources: TileResource[];
  visibility: VisibilityLevel;
  explored: boolean;
  lastVisited?: Date;
  movementCost: number;
  defensiveBonus: number;
  hazards: TileHazard[];
}

export interface Region {
  id: string;
  name: string;
  bounds: MapBounds;
  controller: string; // faction/player ID
  color: string;
  description: string;
  climate: ClimateType;
  dangerLevel: DangerLevel;
}

export interface MapSettlement {
  id: string;
  name: string;
  position: MapPosition;
  faction: string;
  size: SettlementSize;
  population: number;
  defenseLevel: number;
  isVisible: boolean;
  isAccessible: boolean;
  lastUpdated: Date;
}

export interface MapCharacter {
  id: string;
  name: string;
  position: MapPosition;
  destination?: MapPosition;
  movementSpeed: number;
  isMoving: boolean;
  faction: string;
  isPlayer: boolean;
  isVisible: boolean;
  status: CharacterMapStatus;
  path?: MapPosition[];
  eta?: Date;
}

export interface PointOfInterest {
  id: string;
  name: string;
  type: POIType;
  position: MapPosition;
  description: string;
  isDiscovered: boolean;
  requirements?: POIRequirement[];
  rewards?: POIReward[];
  danger: DangerLevel;
  icon: string;
}

export interface MapBoundary {
  id: string;
  name: string;
  points: MapPosition[];
  type: BoundaryType;
  permeability: number; // 0-100, how easy it is to cross
  effects: BoundaryEffect[];
}

export interface MapPosition {
  x: number;
  y: number;
  z?: number;
}

export interface MapBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface TileResource {
  type: ResourceType;
  abundance: number; // 0-100
  quality: number; // 0-100
  isVisible: boolean;
}

export interface TileHazard {
  type: HazardType;
  severity: number; // 0-100
  isActive: boolean;
  duration?: number; // remaining time in hours
}

export interface POIRequirement {
  type: 'level' | 'item' | 'quest' | 'faction_standing';
  value: number | string;
  description: string;
}

export interface POIReward {
  type: 'experience' | 'item' | 'currency' | 'reputation';
  value: number | string;
  description: string;
}

export interface BoundaryEffect {
  type: 'movement_speed' | 'damage' | 'buff' | 'debuff';
  value: number;
  description: string;
}

// Movement System Types
export interface MovementPlan {
  origin: MapPosition;
  destination: MapPosition;
  path: MapPosition[];
  estimatedTime: number; // in minutes
  totalDistance: number;
  actionPointCost: number;
  energyCost: number;
  risks: MovementRisk[];
  waypoints: MovementWaypoint[];
}

export interface MovementWaypoint {
  position: MapPosition;
  action: WaypointAction;
  duration: number; // minutes to spend here
  requirements?: string[];
  description: string;
}

export interface MovementRisk {
  type: RiskType;
  probability: number; // 0-100
  severity: number; // 0-100
  description: string;
  mitigation?: string[];
}

export interface MovementOrder {
  id: string;
  characterId: string;
  type: MovementOrderType;
  status: MovementOrderStatus;
  plan: MovementPlan;
  startTime: Date;
  estimatedArrival: Date;
  actualArrival?: Date;
  progress: number; // 0-100
  currentPosition: MapPosition;
  events: MovementEvent[];
}

export interface MovementEvent {
  id: string;
  type: MovementEventType;
  timestamp: Date;
  position: MapPosition;
  description: string;
  effects?: MovementEventEffect[];
}

export interface MovementEventEffect {
  type: 'health' | 'energy' | 'item' | 'experience' | 'delay';
  value: number | string;
  description: string;
}

export interface PathfindingOptions {
  avoidDanger: boolean;
  preferRoads: boolean;
  maxDetourRatio: number; // 1.0 = direct path, 2.0 = up to 2x longer path acceptable
  allowWater: boolean;
  allowMountains: boolean;
  considerWeather: boolean;
  timeOfDay: 'day' | 'night' | 'any';
}

export interface MapViewState {
  center: MapPosition;
  zoom: number;
  rotation: number;
  showGrid: boolean;
  showCoordinates: boolean;
  activeLayer: MapLayerType;
  filters: MapFilter[];
}

export interface MapFilter {
  type: 'terrain' | 'faction' | 'danger' | 'resource' | 'settlement_size';
  values: string[];
  enabled: boolean;
}

// Enums and Type Unions
export type TerrainType =
  | 'plains'
  | 'forest'
  | 'mountain'
  | 'water'
  | 'desert'
  | 'swamp'
  | 'tundra'
  | 'hills'
  | 'road'
  | 'bridge'
  | 'ruins';

export type BiomeType =
  | 'temperate'
  | 'tropical'
  | 'arctic'
  | 'desert'
  | 'wetlands'
  | 'volcanic'
  | 'magical';

export type ClimateType =
  | 'temperate'
  | 'arid'
  | 'tropical'
  | 'polar'
  | 'continental'
  | 'mediterranean'
  | 'oceanic';

export type VisibilityLevel =
  | 'clear'
  | 'fog_of_war'
  | 'unexplored'
  | 'hidden';

export type DangerLevel =
  | 'safe'
  | 'low'
  | 'medium'
  | 'high'
  | 'extreme'
  | 'unknown';

export type SettlementSize =
  | 'outpost'
  | 'village'
  | 'town'
  | 'city'
  | 'metropolis'
  | 'capital';

export type CharacterMapStatus =
  | 'idle'
  | 'moving'
  | 'combat'
  | 'resting'
  | 'gathering'
  | 'trading'
  | 'hidden';

export type POIType =
  | 'dungeon'
  | 'ruins'
  | 'resource_node'
  | 'shrine'
  | 'portal'
  | 'camp'
  | 'landmark'
  | 'quest_location';

export type BoundaryType =
  | 'political'
  | 'natural'
  | 'magical'
  | 'territorial';

export type ResourceType =
  | 'iron'
  | 'gold'
  | 'gems'
  | 'wood'
  | 'stone'
  | 'herbs'
  | 'wildlife'
  | 'mana_crystal';

export type HazardType =
  | 'fire'
  | 'poison'
  | 'magical_storm'
  | 'avalanche'
  | 'quicksand'
  | 'monsters'
  | 'curse';

export type WaypointAction =
  | 'pass_through'
  | 'rest'
  | 'gather'
  | 'scout'
  | 'trade'
  | 'explore'
  | 'wait';

export type RiskType =
  | 'ambush'
  | 'weather'
  | 'terrain'
  | 'monsters'
  | 'bandits'
  | 'magical_anomaly'
  | 'equipment_failure';

export type MovementOrderType =
  | 'move'
  | 'patrol'
  | 'escort'
  | 'retreat'
  | 'explore'
  | 'scout';

export type MovementOrderStatus =
  | 'planned'
  | 'active'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type MovementEventType =
  | 'departure'
  | 'arrival'
  | 'waypoint_reached'
  | 'encounter'
  | 'weather_change'
  | 'equipment_issue'
  | 'rest_break'
  | 'obstacle'
  | 'discovery';

export type MapLayerType =
  | 'terrain'
  | 'political'
  | 'resources'
  | 'danger'
  | 'weather'
  | 'trade_routes'
  | 'factions';