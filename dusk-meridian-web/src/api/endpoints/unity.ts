import { apiClient } from '../client';

// Inline types to avoid import issues
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
  bounds: any;
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
  worldTime: any;
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

// Unity-compatible API endpoints matching ActionQueueApiService.cs
export const unityApi = {
  // Character Action Management
  async getCharacterActions(characterId: number): Promise<EnhancedActionQueueDto[]> {
    const response = await apiClient.get<GameServerResponse<EnhancedActionQueueDto[]>>(`/characters/${characterId}/actions`);
    return response.data.data!;
  },

  async queueAction(characterId: number, request: QueueActionRequest): Promise<EnhancedActionQueueDto> {
    const response = await apiClient.post<GameServerResponse<EnhancedActionQueueDto>>(`/characters/${characterId}/actions`, request);
    return response.data.data!;
  },

  async startAction(characterId: number, queueId: number): Promise<EnhancedActionQueueDto> {
    const response = await apiClient.post<GameServerResponse<EnhancedActionQueueDto>>(`/characters/${characterId}/actions/${queueId}/start`);
    return response.data.data!;
  },

  async completeAction(characterId: number, queueId: number): Promise<EnhancedActionQueueDto> {
    const response = await apiClient.post<GameServerResponse<EnhancedActionQueueDto>>(`/characters/${characterId}/actions/${queueId}/complete`);
    return response.data.data!;
  },

  async cancelAction(characterId: number, queueId: number): Promise<void> {
    await apiClient.delete(`/characters/${characterId}/actions/${queueId}`);
  },

  // Character Needs System (Maslow's Hierarchy)
  async getCharacterNeeds(characterId: number): Promise<CharacterNeeds> {
    const response = await apiClient.get<GameServerResponse<CharacterNeeds>>(`/characters/${characterId}/needs`);
    return response.data.data!;
  },

  async updateCharacterNeeds(characterId: number, request: UpdateCharacterNeedsRequest): Promise<CharacterNeeds> {
    const response = await apiClient.post<GameServerResponse<CharacterNeeds>>(`/characters/${characterId}/needs`, request);
    return response.data.data!;
  },

  async setCharacterNeed(characterId: number, needName: keyof CharacterNeeds, value: number): Promise<CharacterNeeds> {
    const request: SetCharacterNeedRequest = { needName, value };
    const response = await apiClient.post<GameServerResponse<CharacterNeeds>>(`/characters/${characterId}/needs/${needName}`, request);
    return response.data.data!;
  },

  // Spellcaster System
  async startSpellcasterLoop(characterId: number): Promise<void> {
    await apiClient.post(`/characters/${characterId}/spellcaster/start`);
  },

  async getSpellcasterStats(characterId: number): Promise<SpellcasterStats> {
    const response = await apiClient.get<GameServerResponse<SpellcasterStats>>(`/characters/${characterId}/spellcaster/stats`);
    return response.data.data!;
  },

  // Map System
  async getMapData(request: MapDataRequest): Promise<MapDataResponse> {
    const response = await apiClient.post<GameServerResponse<MapDataResponse>>('/map/data', request);
    return response.data.data!;
  },

  async getMapImage(worldId: string): Promise<string> {
    const response = await apiClient.get<GameServerResponse<{ imageUrl: string }>>(`/worlds/${worldId}/map-image`);
    return response.data.data!.imageUrl;
  },

  // System Status
  async getSystemStatus(): Promise<SystemStatusResponse> {
    const response = await apiClient.get<GameServerResponse<SystemStatusResponse>>('/system/status');
    return response.data.data!;
  },

  async getWorldTime(): Promise<WorldTimeData> {
    const response = await apiClient.get<GameServerResponse<WorldTimeData>>('/world/time');
    return response.data.data!;
  },

  // Utility methods for common operations
  async getCharacterFullStatus(characterId: number): Promise<{
    actions: EnhancedActionQueueDto[];
    needs: CharacterNeeds;
    spellcaster?: SpellcasterStats;
  }> {
    const [actions, needs] = await Promise.all([
      this.getCharacterActions(characterId),
      this.getCharacterNeeds(characterId),
    ]);

    try {
      const spellcaster = await this.getSpellcasterStats(characterId);
      return { actions, needs, spellcaster };
    } catch {
      // Character might not be a spellcaster
      return { actions, needs };
    }
  },

  async queueSurvivalAction(characterId: number, actionType: 'eat' | 'drink' | 'rest'): Promise<EnhancedActionQueueDto> {
    const actionMap = {
      eat: { name: 'Eat Food', category: 'Physiological' as const, type: 'survival' },
      drink: { name: 'Drink Water', category: 'Physiological' as const, type: 'survival' },
      rest: { name: 'Rest', category: 'Physiological' as const, type: 'survival' },
    };

    const action = actionMap[actionType];
    return this.queueAction(characterId, {
      actionName: action.name,
      actionDescription: `Automatically queued ${action.name.toLowerCase()} action`,
      needCategory: action.category,
      actionType: action.type,
      priority: 1, // Emergency priority for survival
    });
  },

  async emergencyNeedsCheck(characterId: number): Promise<{
    needs: CharacterNeeds;
    criticalNeeds: string[];
    actionsQueued: EnhancedActionQueueDto[];
  }> {
    const needs = await this.getCharacterNeeds(characterId);
    const criticalNeeds: string[] = [];
    const actionsQueued: EnhancedActionQueueDto[] = [];

    // Check for critical needs (below 15)
    if (needs.hunger < 15) {
      criticalNeeds.push('hunger');
      const action = await this.queueSurvivalAction(characterId, 'eat');
      actionsQueued.push(action);
    }

    if (needs.thirst < 15) {
      criticalNeeds.push('thirst');
      const action = await this.queueSurvivalAction(characterId, 'drink');
      actionsQueued.push(action);
    }

    if (needs.rest < 15) {
      criticalNeeds.push('rest');
      const action = await this.queueSurvivalAction(characterId, 'rest');
      actionsQueued.push(action);
    }

    return { needs, criticalNeeds, actionsQueued };
  },

  async getWorldOverview(worldId: string): Promise<{
    mapData: MapDataResponse;
    worldTime: WorldTimeData;
    systemStatus: SystemStatusResponse;
  }> {
    const [mapData, worldTime, systemStatus] = await Promise.all([
      this.getMapData({ worldId, includeUnexplored: false }),
      this.getWorldTime(),
      this.getSystemStatus(),
    ]);

    return { mapData, worldTime, systemStatus };
  }
};