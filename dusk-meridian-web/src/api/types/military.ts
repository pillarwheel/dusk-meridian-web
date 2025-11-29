export enum OrderType {
  Move = 'Move',
  Patrol = 'Patrol',
  Attack = 'Attack',
  Defend = 'Defend',
  Garrison = 'Garrison',
  Escort = 'Escort',
  Raid = 'Raid',
  Scout = 'Scout',
  Retreat = 'Retreat',
  HoldPosition = 'HoldPosition',
}

export enum OrderStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Failed = 'Failed',
  Paused = 'Paused',
}

export enum OrderPriority {
  Low = 1,
  Normal = 5,
  High = 8,
  Critical = 10,
}

export enum MovementSpeed {
  Normal = 'Normal',
  ForcedMarch = 'ForcedMarch',
  Cautious = 'Cautious',
}

export enum FormationType {
  Line = 'Line',
  Column = 'Column',
  Square = 'Square',
  Wedge = 'Wedge',
  Circle = 'Circle',
  Skirmish = 'Skirmish',
  Custom = 'Custom',
}

export enum TroopStatus {
  Idle = 'Idle',
  Marching = 'Marching',
  InCombat = 'InCombat',
  Resting = 'Resting',
  Garrisoned = 'Garrisoned',
  Retreating = 'Retreating',
}

export interface MilitaryOrderDto {
  id: string;
  factionId: string;
  factionName: string;
  sourceSettlementId: string;
  sourceSettlementName: string;
  targetSettlementId: string | null;
  targetSettlementName: string | null;

  orderType: OrderType;
  status: OrderStatus;
  priority: OrderPriority;

  // Target location (if not targeting settlement)
  targetX: number | null;
  targetY: number | null;
  targetZ: number | null;

  // Units
  unitsCommitted: number;
  unitsRemaining: number;
  assignedCharacterIds: string[];

  // Movement
  movementSpeed: MovementSpeed;
  formationId: string | null;
  formationName: string | null;

  // Supply & Logistics
  supplyDays: number;
  currentSupply: number;

  // Timing
  issueDate: string;
  startDate: string | null;
  estimatedArrival: string | null;
  completionDate: string | null;

  // Result
  successRate: number | null;
  casualties: number | null;
  loot: any[] | null;
  failedReason: string | null;

  // Metadata
  notes: string | null;
  autoExecute: boolean;
}

export interface CreateMilitaryOrderDto {
  factionId: string;
  sourceSettlementId: string;
  orderType: OrderType;
  priority?: OrderPriority;

  // Target (either settlement or coordinates)
  targetSettlementId?: string;
  targetX?: number;
  targetY?: number;
  targetZ?: number;

  // Units
  unitsCommitted: number;
  assignedCharacterIds: string[];

  // Movement options
  movementSpeed?: MovementSpeed;
  formationId?: string;

  // Supply
  supplyDays?: number;

  // Options
  notes?: string;
  autoExecute?: boolean;
}

export interface UpdateMilitaryOrderDto {
  status?: OrderStatus;
  priority?: OrderPriority;
  movementSpeed?: MovementSpeed;
  formationId?: string;
  notes?: string;
}

export interface FormationDto {
  id: string;
  name: string;
  description: string;
  type: FormationType;

  // Grid configuration
  rows: number;
  columns: number;
  spacing: number;

  // Position assignments
  positions: FormationPositionDto[];

  // Bonuses
  defenseBonus: number;
  attackBonus: number;
  speedModifier: number;

  // Metadata
  isCustom: boolean;
  createdBy: string | null;
  usageCount: number;
}

export interface FormationPositionDto {
  row: number;
  column: number;
  unitType: string | null; // 'Infantry', 'Cavalry', 'Archer', etc.
  characterId: string | null;
  offsetX: number;
  offsetY: number;
}

export interface CreateFormationDto {
  name: string;
  description: string;
  type: FormationType;
  rows: number;
  columns: number;
  spacing: number;
  positions?: FormationPositionDto[];
}

export interface TroopStatusDto {
  settlementId: string;
  settlementName: string;

  // Troop counts
  totalTroops: number;
  stationedTroops: number;
  enRouteTroops: number;
  committedTroops: number;
  availableTroops: number;

  // Characters
  garrisonCharacters: CharacterTroopDto[];
  onMissionCharacters: CharacterTroopDto[];

  // Current morale & readiness
  averageMorale: number;
  combatReadiness: number;

  // Supply status
  totalSupply: number;
  supplyConsumptionRate: number;
  daysOfSupply: number;
}

export interface CharacterTroopDto {
  characterId: string;
  characterName: string;
  level: number;
  class: string;
  status: TroopStatus;
  currentOrderId: string | null;
  health: number;
  maxHealth: number;
  morale: number;
  equipment: string[];
}

export interface MilitaryOrderSummary {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  failedOrders: number;
  pendingOrders: number;

  totalUnitsDeployed: number;
  averageSuccessRate: number;

  recentOrders: MilitaryOrderDto[];
}

export interface OrderSimulationResult {
  orderId: string;
  estimatedDuration: number; // seconds
  estimatedCasualties: number;
  successProbability: number;
  risks: string[];
  recommendations: string[];
  supplyRequired: number;
}

export interface BattleReport {
  orderId: string;
  orderType: OrderType;
  location: {
    settlementId: string | null;
    settlementName: string | null;
    x: number;
    y: number;
    z: number;
  };

  attackingForce: {
    factionId: string;
    factionName: string;
    initialUnits: number;
    remainingUnits: number;
    casualties: number;
    commanderId: string | null;
  };

  defendingForce: {
    factionId: string;
    factionName: string;
    initialUnits: number;
    remainingUnits: number;
    casualties: number;
    commanderId: string | null;
  } | null;

  outcome: 'Victory' | 'Defeat' | 'Draw' | 'Retreat';
  duration: number; // seconds

  events: BattleEventDto[];
  loot: LootItemDto[];
  experienceGained: number;

  startTime: string;
  endTime: string;
}

export interface BattleEventDto {
  timestamp: string;
  type: 'Attack' | 'Defend' | 'Ability' | 'Casualty' | 'Retreat' | 'Reinforcement';
  description: string;
  actorId: string | null;
  targetId: string | null;
  damage: number | null;
}

export interface LootItemDto {
  itemId: string;
  itemName: string;
  quantity: number;
  rarity: string;
}

export interface PatrolRoute {
  id: string;
  name: string;
  settlementId: string;
  waypoints: PatrolWaypoint[];
  interval: number; // seconds per patrol cycle
  assignedCharacterIds: string[];
  isActive: boolean;
}

export interface PatrolWaypoint {
  order: number;
  x: number;
  y: number;
  z: number;
  waitDuration: number; // seconds to wait at waypoint
  actions: string[]; // Actions to perform at waypoint
}

export interface CreatePatrolRouteDto {
  name: string;
  settlementId: string;
  waypoints: PatrolWaypoint[];
  interval: number;
  assignedCharacterIds: string[];
}
