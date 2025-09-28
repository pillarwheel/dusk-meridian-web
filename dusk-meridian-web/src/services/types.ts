export interface SettlementOverview {
  settlementId: number;
  settlementName: string;
  totalCharacters: number;
  totalBuildings: number;
  charactersByRole: Record<string, number>;
  buildingTypes: string[];
  lastUpdateTime: string;
}

export interface CharacterInfo {
  id: string;
  name: string;
  role: string;
  currentPosition: { x: number; y: number };
  currentActivity: string;
  targetBuilding?: string;
  actionQueueLength: number;
  needs: {
    hunger: number;
    thirst: number;
    energy: number;
    social: number;
  };
  lastActionTime: string;
}

export interface ActivitySummary {
  timestamp: string;
  totalActiveCharacters: number;
  buildingInteractions: Record<string, number>;
  characterActivities: Record<string, number>;
  averageQueueLength: number;
  completedActionsLastHour: number;
}

export interface ProcessBehaviorsRequest {
  timeMultiplier?: number;
  batchSize?: number;
  includeDebugLog?: boolean;
}

export interface ProcessBehaviorsResponse {
  success: boolean;
  processedCharacters: number;
  createdActions: number;
  processingTime: number;
  debugLog?: string[];
}

export interface InteractionRequest {
  characterIds?: string[];
  buildingTypes?: string[];
  maxInteractions?: number;
}

export interface InteractionResponse {
  success: boolean;
  createdInteractions: number;
  affectedCharacters: string[];
  processingTime: number;
}