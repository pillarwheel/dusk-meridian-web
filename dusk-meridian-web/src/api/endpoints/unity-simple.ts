import { apiClient } from '../client';

// Simplified inline types to avoid import issues
interface EnhancedActionQueueDto {
  queueId: number;
  characterId: number;
  actionName: string;
  actionDescription: string;
  targetId?: number;
  targetName?: string;
  priority: number;
  queuedAt: Date;
  startTime?: Date;
  estimatedCompletion?: Date;
  duration: number;
  status: string;
  needCategory: string;
  progressPercentage: number;
  isPlayerInitiated: boolean;
  canBeCancelled: boolean;
  actionType: string;
  requirements: Record<string, any>;
  effects: Record<string, any>;
}

interface CharacterNeeds {
  characterId: number;
  hunger: number;
  thirst: number;
  rest: number;
  safety: number;
  social: number;
  esteem: number;
  selfActualization: number;
  lastUpdated: Date;
}

interface MapDataRequest {
  worldId: string;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  includeUnexplored: boolean;
}

interface MapDataResponse {
  worldId: string;
  worldName: string;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  settlements: any[];
  regions: any[];
  mapImageUrl: string;
}

interface SpellcasterStats {
  characterId: number;
  currentStep: string;
  experiencePoints: number;
  level: number;
  completedCycles: number;
  timeInCurrentStep: number;
  canAdvance: boolean;
  availableSpells: string[];
  masteredSpells: string[];
  nextStepRequirements: Record<string, any>;
}

interface SystemStatusResponse {
  serverTime: Date;
  connectedClients: number;
  activeCharacters: number;
  queuedActions: number;
  worldTime: {
    currentDay: number;
    timeOfDay: number;
    season: string;
    year: number;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    dbConnections: number;
  };
}

interface WorldTimeData {
  currentDay: number;
  timeOfDay: number;
  season: string;
  year: number;
}

interface QueueActionRequest {
  actionName: string;
  actionDescription?: string;
  targetId?: number;
  priority?: number;
  needCategory: string;
  actionType: string;
  requirements?: Record<string, any>;
}

interface UpdateCharacterNeedsRequest {
  needs: Partial<CharacterNeeds>;
}

interface SetCharacterNeedRequest {
  needName: keyof CharacterNeeds;
  value: number;
}

interface GameServerResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

// Simplified Unity API with mock data for testing
export const unityApi = {
  // Character Action Management
  async getCharacterActions(characterId: number): Promise<EnhancedActionQueueDto[]> {
    // Mock data for testing
    return [
      {
        queueId: 1,
        characterId,
        actionName: "Gather Food",
        actionDescription: "Searching for berries in the forest",
        priority: 2,
        queuedAt: new Date(),
        duration: 300000, // 5 minutes
        status: "InProgress",
        needCategory: "Physiological",
        progressPercentage: 65,
        isPlayerInitiated: false,
        canBeCancelled: true,
        actionType: "Gathering",
        requirements: {},
        effects: { hunger: +20 }
      }
    ];
  },

  async queueCharacterAction(characterId: number, request: QueueActionRequest): Promise<EnhancedActionQueueDto> {
    // Mock response
    return {
      queueId: Math.floor(Math.random() * 1000),
      characterId,
      actionName: request.actionName,
      actionDescription: request.actionDescription || '',
      priority: request.priority || 3,
      queuedAt: new Date(),
      duration: 180000, // 3 minutes default
      status: "Queued",
      needCategory: request.needCategory,
      progressPercentage: 0,
      isPlayerInitiated: true,
      canBeCancelled: true,
      actionType: request.actionType,
      requirements: request.requirements || {},
      effects: {}
    };
  },

  async cancelCharacterAction(characterId: number, queueId: number): Promise<boolean> {
    console.log(`Cancelled action ${queueId} for character ${characterId}`);
    return true;
  },

  // Character Needs Management
  async getCharacterNeeds(characterId: number): Promise<CharacterNeeds> {
    // Mock data
    return {
      characterId,
      hunger: 75,
      thirst: 85,
      rest: 60,
      safety: 90,
      social: 45,
      esteem: 70,
      selfActualization: 30,
      lastUpdated: new Date()
    };
  },

  async updateCharacterNeeds(characterId: number, request: UpdateCharacterNeedsRequest): Promise<CharacterNeeds> {
    console.log(`Updated needs for character ${characterId}:`, request.needs);
    // Return mock updated needs
    return this.getCharacterNeeds(characterId);
  },

  async setCharacterNeed(characterId: number, request: SetCharacterNeedRequest): Promise<CharacterNeeds> {
    console.log(`Set ${request.needName} to ${request.value} for character ${characterId}`);
    return this.getCharacterNeeds(characterId);
  },

  // Map Data
  async getMapData(request: MapDataRequest): Promise<MapDataResponse> {
    // Mock map data
    return {
      worldId: request.worldId,
      worldName: "Dusk Meridian",
      bounds: {
        minX: request.minX || -1000,
        maxX: request.maxX || 1000,
        minY: request.minY || -1000,
        maxY: request.maxY || 1000
      },
      settlements: [],
      regions: [],
      mapImageUrl: "/api/maps/dusk-meridian.png"
    };
  },

  // Spellcaster Stats
  async getSpellcasterStats(characterId: number): Promise<SpellcasterStats> {
    // Mock spellcaster data
    return {
      characterId,
      currentStep: "Meditation",
      experiencePoints: 1250,
      level: 3,
      completedCycles: 42,
      timeInCurrentStep: 180,
      canAdvance: true,
      availableSpells: ["Fireball", "Lightning Bolt", "Heal"],
      masteredSpells: ["Light", "Detect Magic"],
      nextStepRequirements: {
        meditation: 300,
        reagents: ["Moonstone", "Silver Dust"]
      }
    };
  },

  // System Status
  async getSystemStatus(): Promise<SystemStatusResponse> {
    // Mock system status
    return {
      serverTime: new Date(),
      connectedClients: 247,
      activeCharacters: 189,
      queuedActions: 1423,
      worldTime: {
        currentDay: 156,
        timeOfDay: 14.5,
        season: "Summer",
        year: 1342
      },
      performance: {
        cpuUsage: 45.2,
        memoryUsage: 67.8,
        dbConnections: 12
      }
    };
  },

  // World Time
  async getWorldTime(): Promise<WorldTimeData> {
    return {
      currentDay: 156,
      timeOfDay: 14.5,
      season: "Summer",
      year: 1342
    };
  }
};