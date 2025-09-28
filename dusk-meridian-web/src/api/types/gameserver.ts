// GameServer API Types based on the provided documentation

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface GameCharacter {
  characterId: number;
  characterName: string;
  userId: string;
  class: string;
  level: number;
  experience: number;
  settlementId?: number;
  worldId?: number;
  isNpc: boolean;
  currentRoutine?: string;
  lastLogin?: Date;
}

export interface MovementStatus {
  characterId: number;
  currentPosition: Vector3;
  targetPosition?: Vector3;
  movementState: 'Idle' | 'Moving' | 'Following' | 'Patrolling' | 'Fleeing' | 'Returning';
  controlMode: 'Autonomous' | 'PlayerControlled' | 'Hybrid';
  isPlayerControlled: boolean;
  movementSpeed: number;
  estimatedArrival?: Date;
  distanceToTarget?: number;
}

export interface ActionQueue {
  queueId: number;
  characterId: number;
  actionId: number;
  status: 'Queued' | 'InProgress' | 'Completed';
  scheduledTime: Date;
  maslowCategory: 'Physiological' | 'Safety' | 'Belonging' | 'Esteem' | 'Self-Actualization';
  priority: number;
  estimatedDuration: number;
}

export interface MoveCharacterRequest {
  characterId: number;
  targetPosition: Vector3;
  movementType?: 'Walk' | 'Run' | 'Teleport';
}

export interface StopCharacterRequest {
  characterId: number;
}

export interface ReleaseToAIRequest {
  characterId: number;
}

export interface NearbyCharactersRequest {
  characterId: number;
  radius?: number;
}

export interface AddActionRequest {
  characterId: number;
  actionId: number;
  priority?: number;
  scheduledTime?: Date;
  maslowCategory: 'Physiological' | 'Safety' | 'Belonging' | 'Esteem' | 'Self-Actualization';
}

export interface AIBehaviorUpdate {
  characterId: number;
  behavior: {
    aggressiveness: number;
    curiosity: number;
    sociability: number;
    workEthic: number;
  };
}

export interface MilitaryOrder {
  orderId: number;
  factionId: number;
  orderType: 'Attack' | 'Defend' | 'Patrol' | 'Retreat' | 'Garrison';
  targetLocation?: Vector3;
  targetSettlement?: number;
  priority: number;
  assignedUnits: number[];
  status: 'Pending' | 'Active' | 'Completed' | 'Cancelled';
  createdAt: Date;
  scheduledStart?: Date;
}

export interface TroopStatus {
  settlementId: number;
  totalTroops: number;
  availableTroops: number;
  garrisonedTroops: number;
  deployedTroops: number;
  troopTypes: {
    infantry: number;
    cavalry: number;
    archers: number;
    mages: number;
  };
}

export interface MageWarMatchmaking {
  characterId: number;
  matchType: 'Ranked' | 'Casual' | 'Tournament';
  preferredOpponents?: number[];
}

export interface MageWarMatch {
  matchId: string;
  players: GameCharacter[];
  status: 'Waiting' | 'Active' | 'Completed';
  startTime?: Date;
  endTime?: Date;
  winner?: number;
  battleground: {
    name: string;
    size: Vector3;
    obstacles: Vector3[];
  };
}

export interface MageWarAction {
  matchId: string;
  characterId: number;
  actionType: 'Move' | 'Attack' | 'Cast' | 'Defend' | 'UseItem';
  targetPosition?: Vector3;
  targetCharacter?: number;
  spellId?: number;
  itemId?: number;
  timestamp: Date;
}

// SignalR Event Types
export interface CharacterMovingEvent {
  characterId: number;
  fromPosition: Vector3;
  toPosition: Vector3;
  movementState: MovementStatus['movementState'];
  estimatedArrival: Date;
}

export interface CharacterStoppedEvent {
  characterId: number;
  finalPosition: Vector3;
  reason: 'PlayerStopped' | 'ReachedDestination' | 'Interrupted' | 'AITookControl';
}

export interface WorldTimeUpdate {
  currentTime: Date;
  timeScale: number;
  dayNightCycle: {
    isDaytime: boolean;
    sunPosition: number;
    phase: 'Dawn' | 'Day' | 'Dusk' | 'Night';
  };
}

export interface WorldEvent {
  eventId: string;
  eventType: 'Battle' | 'Trade' | 'Construction' | 'Discovery' | 'Natural';
  location: Vector3;
  settlementId?: number;
  participantIds: number[];
  description: string;
  timestamp: Date;
  duration?: number;
}

export interface ChatMessage {
  messageId: string;
  senderId: number;
  senderName: string;
  channel: 'Global' | 'Settlement' | 'Faction' | 'Private';
  targetId?: number;
  content: string;
  timestamp: Date;
}

export interface PopulationData {
  settlementId: number;
  totalPopulation: number;
  playerCharacters: number;
  npcCharacters: number;
  activePlayers: number;
  demographics: {
    classes: Record<string, number>;
    levels: Record<string, number>;
  };
}

// Auth0 JWT Token Claims
export interface JWTTokenClaims {
  sub: string; // User ID
  aud: string; // Must be 'magewar'
  iss: string; // Auth0 domain
  exp: number;
  iat: number;
  scope: string;
  email?: string;
  name?: string;
  picture?: string;
}

// API Response wrapper
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

// Settlement-specific types for SignalR groups
export interface SettlementGroup {
  settlementId: number;
  memberCount: number;
  lastActivity: Date;
}

export type SignalRConnectionState = 'Disconnected' | 'Connecting' | 'Connected' | 'Disconnecting' | 'Reconnecting';