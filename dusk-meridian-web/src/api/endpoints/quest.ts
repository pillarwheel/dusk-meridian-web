import { apiClient } from '../client';
import { Quest, QuestLog, QuestProgress, AvailableQuest } from '../types';

export const questApi = {
  async getQuestLog(characterId: string): Promise<QuestLog> {
    const response = await apiClient.get<QuestLog>(`/characters/${characterId}/quests`);
    return response.data;
  },

  async getQuest(questId: string): Promise<Quest> {
    const response = await apiClient.get<Quest>(`/quests/${questId}`);
    return response.data;
  },

  async getAvailableQuests(characterId: string): Promise<AvailableQuest[]> {
    const response = await apiClient.get<AvailableQuest[]>(`/characters/${characterId}/quests/available`);
    return response.data;
  },

  async acceptQuest(characterId: string, questId: string): Promise<Quest> {
    const response = await apiClient.post<Quest>(`/characters/${characterId}/quests`, { questId });
    return response.data;
  },

  async abandonQuest(characterId: string, questId: string): Promise<void> {
    await apiClient.delete(`/characters/${characterId}/quests/${questId}`);
  },

  async updateQuestProgress(characterId: string, questId: string, objectiveId: string, progress: number): Promise<QuestProgress> {
    const response = await apiClient.patch<QuestProgress>(`/characters/${characterId}/quests/${questId}/progress`, {
      objectiveId,
      progress,
    });
    return response.data;
  },

  async completeQuest(characterId: string, questId: string): Promise<{
    quest: Quest;
    rewards: Array<{
      type: string;
      value: any;
      description: string;
    }>;
    character: {
      experience: number;
      level: number;
      currency: Record<string, number>;
    };
  }> {
    const response = await apiClient.post(`/characters/${characterId}/quests/${questId}/complete`);
    return response.data;
  },

  async getDailyQuests(characterId: string): Promise<Quest[]> {
    const response = await apiClient.get<Quest[]>(`/characters/${characterId}/quests/daily`);
    return response.data;
  },

  async getWeeklyQuests(characterId: string): Promise<Quest[]> {
    const response = await apiClient.get<Quest[]>(`/characters/${characterId}/quests/weekly`);
    return response.data;
  },

  async getEventQuests(characterId: string): Promise<Quest[]> {
    const response = await apiClient.get<Quest[]>(`/characters/${characterId}/quests/event`);
    return response.data;
  },

  async getQuestChains(characterId: string): Promise<Array<{
    id: string;
    name: string;
    description: string;
    currentStep: number;
    totalSteps: number;
    quests: Quest[];
    rewards: Array<{
      type: string;
      value: any;
      description: string;
    }>;
  }>> {
    const response = await apiClient.get(`/characters/${characterId}/quest-chains`);
    return response.data;
  },

  async getQuestHistory(characterId: string, params?: {
    type?: string;
    limit?: number;
    page?: number;
  }): Promise<{
    quests: Array<{
      quest: Quest;
      completedAt: string;
      rewards: Array<{ type: string; value: any }>;
      timeToComplete: number;
    }>;
    stats: {
      totalCompleted: number;
      totalRewards: Record<string, number>;
      averageCompletionTime: number;
      favoriteQuestType: string;
    };
  }> {
    const response = await apiClient.get(`/characters/${characterId}/quests/history`, { params });
    return response.data;
  },

  async getQuestGivers(worldId: number, position?: {
    x: number;
    y: number;
    z: number;
    radius: number;
  }): Promise<Array<{
    id: string;
    name: string;
    type: string;
    position: { x: number; y: number; z: number };
    availableQuests: number;
    reputation: number;
    imageUrl?: string;
  }>> {
    const response = await apiClient.get(`/worlds/${worldId}/quest-givers`, { params: position });
    return response.data;
  },

  async getQuestsByLocation(worldId: number, position: {
    x: number;
    y: number;
    z: number;
    radius: number;
  }): Promise<Quest[]> {
    const response = await apiClient.get<Quest[]>(`/worlds/${worldId}/quests/location`, { params: position });
    return response.data;
  },

  async getQuestsByType(type: string, characterId?: string): Promise<Quest[]> {
    const params = characterId ? { characterId } : {};
    const response = await apiClient.get<Quest[]>(`/quests/type/${type}`, { params });
    return response.data;
  },

  async getQuestRewards(questId: string): Promise<Array<{
    type: string;
    value: any;
    description: string;
    rarity: string;
    imageUrl?: string;
  }>> {
    const response = await apiClient.get(`/quests/${questId}/rewards`);
    return response.data;
  },

  async shareQuest(characterId: string, questId: string, targetPlayerId: string): Promise<void> {
    await apiClient.post(`/characters/${characterId}/quests/${questId}/share`, {
      targetPlayerId,
    });
  },

  async getSharedQuests(characterId: string): Promise<Array<{
    quest: Quest;
    sharedBy: string;
    sharedAt: string;
    canAccept: boolean;
    reasons?: string[];
  }>> {
    const response = await apiClient.get(`/characters/${characterId}/quests/shared`);
    return response.data;
  },

  async getQuestRequirements(questId: string, characterId?: string): Promise<Array<{
    type: string;
    value: any;
    description: string;
    met: boolean;
    details?: string;
  }>> {
    const params = characterId ? { characterId } : {};
    const response = await apiClient.get(`/quests/${questId}/requirements`, { params });
    return response.data;
  }
};