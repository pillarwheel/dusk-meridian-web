// Unity-compatible API types based on ActionQueueApiService.cs

export interface EnhancedActionQueueDto {
  queueId: number;
  characterId: number;
  actionName: string;
  actionDescription: string;
  targetId?: number;
  targetName?: string;
  priority: ActionPriority;
  queuedAt: Date;
  startTime?: Date;
  estimatedCompletion?: Date;
  duration: number;
  status: ActionStatus;
  needCategory: NeedCategory;
  progressPercentage: number;
  isPlayerInitiated: boolean;
  canBeCancelled: boolean;
  actionType: string;
  requirements: Record<string, any>;
  effects: Record<string, any>;
}

export enum ActionPriority {
  Emergency = 1,
  High = 2,
  Normal = 3,
  Low = 4
}

export enum ActionStatus {
  Queued = "Queued",
  InProgress = "InProgress",
  Completed = "Completed",
  Cancelled = "Cancelled",
  Failed = "Failed"
}

export enum NeedCategory {
  Physiological = "Physiological",      // Food, water, rest
  Safety = "Safety",                    // Security, stability
  Love = "Love",                        // Social connections
  Esteem = "Esteem",                   // Recognition, status
  SelfActualization = "SelfActualization" // Spellcasting, personal growth
}

export interface CharacterNeeds {
  characterId: number;
  hunger: number;        // 0-100
  thirst: number;        // 0-100
  rest: number;          // 0-100
  safety: number;        // 0-100
  social: number;        // 0-100
  esteem: number;        // 0-100
  selfActualization: number; // 0-100
  lastUpdated: Date;
}

export interface MapDataRequest {
  worldId: string;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  includeUnexplored: boolean;
}

export interface MapDataResponse {
  worldId: string;
  worldName: string;
  bounds: MapBounds;
  settlements: MapSettlementDto[];
  regions: MapRegionDto[];
  mapImageUrl: string;
}

export interface MapBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface MapSettlementDto {
  id: string;
  name: string;
  x: number;
  y: number;
  factionId?: string;
  factionName?: string;
  factionColor?: string; // Hex color
  population: number;
  isCapital: boolean;
}

export interface MapRegionDto {
  id: string;
  name: string;
  type: string;
  bounds: MapBounds;
  factionId?: string;
  color?: string;
}

export interface SpellcasterStats {
  characterId: number;
  currentStep: SpellcasterStep;
  experiencePoints: number;
  level: number;
  completedCycles: number;
  timeInCurrentStep: number;
  canAdvance: boolean;
  availableSpells: string[];
  masteredSpells: string[];
  nextStepRequirements: Record<string, any>;
}

export enum SpellcasterStep {
  Meditation = "Meditation",
  GatherReagents = "GatherReagents",
  PrepareComponents = "PrepareComponents",
  CastSpell = "CastSpell",
  StudyResults = "StudyResults"
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface WorldTimeData {
  currentDay: number;
  timeOfDay: number; // 0-24 hours
  season: string;
  year: number;
}

// WebSocket Event Types
export interface ActionQueuedEvent {
  characterId: number;
  action: EnhancedActionQueueDto;
}

export interface ActionStartedEvent {
  characterId: number;
  queueId: number;
}

export interface ActionCompletedEvent {
  characterId: number;
  queueId: number;
  success: boolean;
}

export interface ActionCancelledEvent {
  characterId: number;
  queueId: number;
}

export interface CharacterMovedEvent {
  characterId: number;
  position: Vector3;
  timestamp: Date;
}

export interface CharacterNeedsUpdatedEvent {
  characterId: number;
  needs: CharacterNeeds;
}

export interface SettlementStatusChangedEvent {
  settlementId: string;
  status: any;
}

export interface WorldTimeUpdatedEvent {
  currentTime: WorldTimeData;
}

// API Request/Response Types
export interface QueueActionRequest {
  actionName: string;
  actionDescription?: string;
  targetId?: number;
  priority?: ActionPriority;
  needCategory: NeedCategory;
  actionType: string;
  requirements?: Record<string, any>;
}

export interface UpdateCharacterNeedsRequest {
  needs: Partial<CharacterNeeds>;
}

export interface SetCharacterNeedRequest {
  needName: keyof CharacterNeeds;
  value: number;
}

export interface SystemStatusResponse {
  serverTime: Date;
  connectedClients: number;
  activeCharacters: number;
  queuedActions: number;
  worldTime: WorldTimeData;
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    dbConnections: number;
  };
}

// GameServer API Response wrapper
export interface GameServerResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}