import { apiClient } from './client';
import type {
  SettlementListItem,
  Settlement,
  SettlementPopulation,
  SettlementBuilding
} from '@/types/settlements';

export const settlementsApi = {
  async getPublicSettlements(): Promise<SettlementListItem[]> {
    const response = await apiClient.get<SettlementListItem[]>('/settlements/public');
    return response.data;
  },

  async getSettlement(settlementId: number): Promise<Settlement> {
    const response = await apiClient.get<Settlement>(`/settlements/${settlementId}`);
    return response.data;
  },

  async getSettlementPopulation(settlementId: number): Promise<SettlementPopulation> {
    const response = await apiClient.get<SettlementPopulation>(`/settlements/${settlementId}/population`);
    return response.data;
  },

  async getSettlementBuildings(settlementId: number): Promise<SettlementBuilding[]> {
    const response = await apiClient.get<SettlementBuilding[]>(`/settlements/${settlementId}/buildings`);
    return response.data;
  }
};