// Map state management types

export type VisibilityMode = 'owned' | 'allied' | 'public' | 'all';
export type MapViewMode = 'political' | 'economic' | 'military';

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface WorldMapState {
  settlements: WorldSettlement[];
  visibilityMode: VisibilityMode;
  selectedSettlement: number | null;
  zoomLevel: number;
  viewport: {
    center: [number, number];
    bounds: BoundingBox;
  };
  viewMode: MapViewMode;
}

export interface WorldSettlement {
  settlementId: number;
  name: string;
  xCoordinate: number;
  yCoordinate: number;
  settlementType: 'City' | 'Town' | 'Village' | 'Stronghold';
  population: number;
  ownerName?: string;
  factionId?: number;
  factionColor?: string;
  isAccessible: boolean;
  militaryStrength?: number;
  tradeImportance: number;
}

export interface SettlementMapState {
  buildings: MapBuilding[];
  characters: MapCharacter[];
  pois: PointOfInterest[];
  selectedEntity: EntitySelection | null;
  gridOverlay: boolean;
  showResourceFlow: boolean;
  showCharacters: boolean;
}

export interface MapBuilding {
  buildingId: number;
  name: string;
  type: string;
  xCoordinate: number;
  yCoordinate: number;
  zCoordinate: number;
  isDestroyed: boolean;
  isDamaged: boolean;
  isActive: boolean;
  level?: number;
  health?: number;
  production?: ResourceRate[];
  workers?: number;
}

export interface MapCharacter {
  characterId: number;
  name: string;
  class: string;
  level: number;
  xCoordinate: number;
  yCoordinate: number;
  currentAction?: string;
  health: { current: number; max: number };
  isPlayer: boolean;
}

export interface PointOfInterest {
  id: number;
  name: string;
  type: string;
  xCoordinate: number;
  yCoordinate: number;
  icon?: string;
}

export interface ResourceRate {
  resourceType: string;
  amount: number;
  perHour: number;
}

export interface EntitySelection {
  type: 'settlement' | 'building' | 'character' | 'poi';
  id: number;
  data: any;
}

// Hover card data structures
export interface SettlementHoverData {
  name: string;
  owner: string;
  faction: string;
  population: number;
  garrison?: number;
  lastActive?: Date;
  settlementType: string;
}

export interface BuildingHoverData {
  name: string;
  type: string;
  level: number;
  production?: ResourceRate[];
  workers: number;
  health: number;
  isActive: boolean;
}

export interface CharacterHoverData {
  name: string;
  class: string;
  level: number;
  currentAction: string;
  health: { current: number; max: number };
}

// Map control configurations
export interface MapControlConfig {
  layers: {
    political: boolean;
    economic: boolean;
    military: boolean;
    territories: boolean;
    tradeRoutes: boolean;
  };
  filters: {
    settlementTypes: string[];
    factions: number[];
    minPopulation: number;
  };
}

export interface MapResponsiveConfig {
  mobile: {
    simplifiedUI: boolean;
    touchGestures: boolean;
    reducedParticles: boolean;
  };
  desktop: {
    multiSelectEnabled: boolean;
    keyboardShortcuts: boolean;
    advancedFilters: boolean;
  };
}