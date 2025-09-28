import { apiClient } from '../client';
import {
  GameCharacter,
  MovementStatus,
  ActionQueue,
  MoveCharacterRequest,
  StopCharacterRequest,
  ReleaseToAIRequest,
  NearbyCharactersRequest,
  AddActionRequest,
  AIBehaviorUpdate,
  MilitaryOrder,
  TroopStatus,
  MageWarMatchmaking,
  MageWarMatch,
  MageWarAction,
  PopulationData,
  GameServerResponse
} from '../types/gameserver';

export const gameServerApi = {
  // Character Management
  async getCharacter(characterId: number): Promise<GameCharacter> {
    const response = await apiClient.get<GameServerResponse<GameCharacter>>(`/character/${characterId}`);
    return response.data.data!;
  },

  async createCharacter(characterData: Partial<GameCharacter>): Promise<GameCharacter> {
    const response = await apiClient.post<GameServerResponse<GameCharacter>>('/character', characterData);
    return response.data.data!;
  },

  async updateCharacter(characterId: number, updates: Partial<GameCharacter>): Promise<GameCharacter> {
    const response = await apiClient.put<GameServerResponse<GameCharacter>>(`/character/${characterId}`, updates);
    return response.data.data!;
  },

  async getUserCharacters(userId: string): Promise<GameCharacter[]> {
    const response = await apiClient.get<GameServerResponse<GameCharacter[]>>(`/character/user/${userId}`);
    return response.data.data!;
  },

  // Movement System
  async moveCharacter(request: MoveCharacterRequest): Promise<MovementStatus> {
    const response = await apiClient.post<GameServerResponse<MovementStatus>>('/movement/move', request);
    return response.data.data!;
  },

  async stopCharacter(request: StopCharacterRequest): Promise<MovementStatus> {
    const response = await apiClient.post<GameServerResponse<MovementStatus>>('/movement/stop', request);
    return response.data.data!;
  },

  async releaseToAI(request: ReleaseToAIRequest): Promise<MovementStatus> {
    const response = await apiClient.post<GameServerResponse<MovementStatus>>('/movement/release-to-ai', request);
    return response.data.data!;
  },

  async getNearbyCharacters(params: NearbyCharactersRequest): Promise<GameCharacter[]> {
    const response = await apiClient.get<GameServerResponse<GameCharacter[]>>('/movement/nearby', { params });
    return response.data.data!;
  },

  async getMovementStatus(characterId: number): Promise<MovementStatus> {
    const response = await apiClient.get<GameServerResponse<MovementStatus>>(`/movement/status/${characterId}`);
    return response.data.data!;
  },

  // Action Queue System
  async getActionQueue(characterId: number): Promise<ActionQueue[]> {
    const response = await apiClient.get<GameServerResponse<ActionQueue[]>>(`/actionqueue/${characterId}`);
    return response.data.data!;
  },

  async addAction(request: AddActionRequest): Promise<ActionQueue> {
    const response = await apiClient.post<GameServerResponse<ActionQueue>>('/actionqueue/add', request);
    return response.data.data!;
  },

  async startAction(queueId: number): Promise<ActionQueue> {
    const response = await apiClient.post<GameServerResponse<ActionQueue>>(`/actionqueue/${queueId}/start`);
    return response.data.data!;
  },

  async completeAction(queueId: number): Promise<ActionQueue> {
    const response = await apiClient.post<GameServerResponse<ActionQueue>>(`/actionqueue/${queueId}/complete`);
    return response.data.data!;
  },

  async cancelAction(queueId: number): Promise<void> {
    await apiClient.delete(`/actionqueue/${queueId}`);
  },

  // Character AI Management
  async getAIStatus(characterId: number): Promise<any> {
    const response = await apiClient.get<GameServerResponse<any>>(`/characterai/${characterId}/status`);
    return response.data.data!;
  },

  async updateAIBehavior(characterId: number, behavior: AIBehaviorUpdate['behavior']): Promise<any> {
    const response = await apiClient.post<GameServerResponse<any>>(`/characterai/${characterId}/behavior`, behavior);
    return response.data.data!;
  },

  async getSettlementPopulation(settlementId: number): Promise<PopulationData> {
    const response = await apiClient.get<GameServerResponse<PopulationData>>(`/characterai/population/${settlementId}`);
    return response.data.data!;
  },

  // Military System
  async getFactionOrders(factionId: number): Promise<MilitaryOrder[]> {
    const response = await apiClient.get<GameServerResponse<MilitaryOrder[]>>(`/military/orders/${factionId}`);
    return response.data.data!;
  },

  async createMilitaryOrder(order: Partial<MilitaryOrder>): Promise<MilitaryOrder> {
    const response = await apiClient.post<GameServerResponse<MilitaryOrder>>('/military/orders', order);
    return response.data.data!;
  },

  async getTroopStatus(settlementId: number): Promise<TroopStatus> {
    const response = await apiClient.get<GameServerResponse<TroopStatus>>(`/military/troops/${settlementId}`);
    return response.data.data!;
  },

  // MageWar (PvP Combat)
  async joinMatchmaking(request: MageWarMatchmaking): Promise<{ matchId?: string; estimatedWaitTime?: number }> {
    const response = await apiClient.post<GameServerResponse<any>>('/magewar/matchmaking', request);
    return response.data.data!;
  },

  async getMatch(matchId: string): Promise<MageWarMatch> {
    const response = await apiClient.get<GameServerResponse<MageWarMatch>>(`/magewar/match/${matchId}`);
    return response.data.data!;
  },

  async submitCombatAction(action: MageWarAction): Promise<{ success: boolean; nextTurn?: number }> {
    const response = await apiClient.post<GameServerResponse<any>>('/magewar/action', action);
    return response.data.data!;
  },

  // Utility methods for common operations
  async getCharacterStatus(characterId: number): Promise<{
    character: GameCharacter;
    movement: MovementStatus;
    actionQueue: ActionQueue[];
  }> {
    const [character, movement, actionQueue] = await Promise.all([
      this.getCharacter(characterId),
      this.getMovementStatus(characterId),
      this.getActionQueue(characterId),
    ]);

    return {
      character,
      movement,
      actionQueue,
    };
  },

  async moveCharacterToPosition(characterId: number, x: number, y: number, z: number): Promise<MovementStatus> {
    return this.moveCharacter({
      characterId,
      targetPosition: { x, y, z },
    });
  },

  async scheduleAction(characterId: number, actionId: number, category: ActionQueue['maslowCategory'], priority: number = 1): Promise<ActionQueue> {
    return this.addAction({
      characterId,
      actionId,
      priority,
      maslowCategory: category,
    });
  }
};