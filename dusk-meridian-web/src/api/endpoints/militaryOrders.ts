import { apiClient } from '../client';
import * as MilitaryTypes from '../types/military';

export const militaryOrdersApi = {
  // ===== Military Orders =====

  /**
   * Get all military orders for a faction
   */
  async getOrdersByFaction(factionId: string): Promise<MilitaryTypes.MilitaryOrderDto[]> {
    const response = await apiClient.get<MilitaryTypes.MilitaryOrderDto[]>(
      `/military/factions/${factionId}/orders`
    );
    return response.data;
  },

  /**
   * Get all military orders for a settlement
   */
  async getOrdersBySettlement(settlementId: string): Promise<MilitaryTypes.MilitaryOrderDto[]> {
    const response = await apiClient.get<MilitaryTypes.MilitaryOrderDto[]>(
      `/military/settlements/${settlementId}/orders`
    );
    return response.data;
  },

  /**
   * Get military orders assigned to a character
   */
  async getOrdersByCharacter(characterId: string): Promise<MilitaryTypes.MilitaryOrderDto[]> {
    const response = await apiClient.get<MilitaryTypes.MilitaryOrderDto[]>(
      `/military/characters/${characterId}/orders`
    );
    return response.data;
  },

  /**
   * Get a specific military order by ID
   */
  async getOrder(orderId: string): Promise<MilitaryTypes.MilitaryOrderDto> {
    const response = await apiClient.get<MilitaryTypes.MilitaryOrderDto>(
      `/military/orders/${orderId}`
    );
    return response.data;
  },

  /**
   * Get summary of all military orders for a faction
   */
  async getOrderSummary(factionId: string): Promise<MilitaryTypes.MilitaryOrderSummary> {
    const response = await apiClient.get<MilitaryTypes.MilitaryOrderSummary>(
      `/military/factions/${factionId}/orders/summary`
    );
    return response.data;
  },

  /**
   * Create a new military order
   */
  async createOrder(
    order: MilitaryTypes.CreateMilitaryOrderDto
  ): Promise<MilitaryTypes.MilitaryOrderDto> {
    const response = await apiClient.post<MilitaryTypes.MilitaryOrderDto>(
      '/military/orders',
      order
    );
    return response.data;
  },

  /**
   * Update an existing military order
   */
  async updateOrder(
    orderId: string,
    updates: MilitaryTypes.UpdateMilitaryOrderDto
  ): Promise<MilitaryTypes.MilitaryOrderDto> {
    const response = await apiClient.patch<MilitaryTypes.MilitaryOrderDto>(
      `/military/orders/${orderId}`,
      updates
    );
    return response.data;
  },

  /**
   * Cancel a military order
   */
  async cancelOrder(orderId: string): Promise<void> {
    await apiClient.post<void>(`/military/orders/${orderId}/cancel`);
  },

  /**
   * Execute a pending order immediately
   */
  async executeOrder(orderId: string): Promise<void> {
    await apiClient.post<void>(`/military/orders/${orderId}/execute`);
  },

  /**
   * Pause an in-progress order
   */
  async pauseOrder(orderId: string): Promise<void> {
    await apiClient.post<void>(`/military/orders/${orderId}/pause`);
  },

  /**
   * Resume a paused order
   */
  async resumeOrder(orderId: string): Promise<void> {
    await apiClient.post<void>(`/military/orders/${orderId}/resume`);
  },

  /**
   * Simulate an order before executing (predict outcome)
   */
  async simulateOrder(
    order: MilitaryTypes.CreateMilitaryOrderDto
  ): Promise<MilitaryTypes.OrderSimulationResult> {
    const response = await apiClient.post<MilitaryTypes.OrderSimulationResult>(
      '/military/orders/simulate',
      order
    );
    return response.data;
  },

  // ===== Troop Management =====

  /**
   * Get troop status for a settlement
   */
  async getTroopStatus(settlementId: string): Promise<MilitaryTypes.TroopStatusDto> {
    const response = await apiClient.get<MilitaryTypes.TroopStatusDto>(
      `/military/settlements/${settlementId}/troops`
    );
    return response.data;
  },

  /**
   * Assign a character to garrison duty
   */
  async assignToGarrison(characterId: string, settlementId: string): Promise<void> {
    await apiClient.post<void>(`/military/characters/${characterId}/garrison`, {
      settlementId,
    });
  },

  /**
   * Remove a character from garrison
   */
  async removeFromGarrison(characterId: string): Promise<void> {
    await apiClient.delete<void>(`/military/characters/${characterId}/garrison`);
  },

  /**
   * Assign characters to a military order
   */
  async assignCharactersToOrder(orderId: string, characterIds: string[]): Promise<void> {
    await apiClient.post<void>(`/military/orders/${orderId}/assign-characters`, {
      characterIds,
    });
  },

  /**
   * Remove characters from a military order
   */
  async removeCharactersFromOrder(orderId: string, characterIds: string[]): Promise<void> {
    await apiClient.post<void>(`/military/orders/${orderId}/remove-characters`, {
      characterIds,
    });
  },

  // ===== Formations =====

  /**
   * Get all available formations
   */
  async getFormations(): Promise<MilitaryTypes.FormationDto[]> {
    const response = await apiClient.get<MilitaryTypes.FormationDto[]>('/military/formations');
    return response.data;
  },

  /**
   * Get a specific formation
   */
  async getFormation(formationId: string): Promise<MilitaryTypes.FormationDto> {
    const response = await apiClient.get<MilitaryTypes.FormationDto>(
      `/military/formations/${formationId}`
    );
    return response.data;
  },

  /**
   * Create a custom formation
   */
  async createFormation(
    formation: MilitaryTypes.CreateFormationDto
  ): Promise<MilitaryTypes.FormationDto> {
    const response = await apiClient.post<MilitaryTypes.FormationDto>(
      '/military/formations',
      formation
    );
    return response.data;
  },

  /**
   * Update a formation
   */
  async updateFormation(
    formationId: string,
    updates: Partial<MilitaryTypes.CreateFormationDto>
  ): Promise<MilitaryTypes.FormationDto> {
    const response = await apiClient.patch<MilitaryTypes.FormationDto>(
      `/military/formations/${formationId}`,
      updates
    );
    return response.data;
  },

  /**
   * Delete a custom formation
   */
  async deleteFormation(formationId: string): Promise<void> {
    await apiClient.delete<void>(`/military/formations/${formationId}`);
  },

  /**
   * Assign a formation to an order
   */
  async assignFormation(orderId: string, formationId: string): Promise<void> {
    await apiClient.post<void>(`/military/orders/${orderId}/formation`, { formationId });
  },

  // ===== Battle Reports =====

  /**
   * Get battle report for a completed order
   */
  async getBattleReport(orderId: string): Promise<MilitaryTypes.BattleReport> {
    const response = await apiClient.get<MilitaryTypes.BattleReport>(
      `/military/orders/${orderId}/battle-report`
    );
    return response.data;
  },

  /**
   * Get recent battle reports for a faction
   */
  async getRecentBattleReports(
    factionId: string,
    limit: number = 10
  ): Promise<MilitaryTypes.BattleReport[]> {
    const response = await apiClient.get<MilitaryTypes.BattleReport[]>(
      `/military/factions/${factionId}/battle-reports`,
      { params: { limit } }
    );
    return response.data;
  },

  // ===== Patrol Routes =====

  /**
   * Get all patrol routes for a settlement
   */
  async getPatrolRoutes(settlementId: string): Promise<MilitaryTypes.PatrolRoute[]> {
    const response = await apiClient.get<MilitaryTypes.PatrolRoute[]>(
      `/military/settlements/${settlementId}/patrols`
    );
    return response.data;
  },

  /**
   * Create a new patrol route
   */
  async createPatrolRoute(
    route: MilitaryTypes.CreatePatrolRouteDto
  ): Promise<MilitaryTypes.PatrolRoute> {
    const response = await apiClient.post<MilitaryTypes.PatrolRoute>(
      '/military/patrols',
      route
    );
    return response.data;
  },

  /**
   * Update a patrol route
   */
  async updatePatrolRoute(
    routeId: string,
    updates: Partial<MilitaryTypes.CreatePatrolRouteDto>
  ): Promise<MilitaryTypes.PatrolRoute> {
    const response = await apiClient.patch<MilitaryTypes.PatrolRoute>(
      `/military/patrols/${routeId}`,
      updates
    );
    return response.data;
  },

  /**
   * Delete a patrol route
   */
  async deletePatrolRoute(routeId: string): Promise<void> {
    await apiClient.delete<void>(`/military/patrols/${routeId}`);
  },

  /**
   * Activate a patrol route
   */
  async activatePatrolRoute(routeId: string): Promise<void> {
    await apiClient.post<void>(`/military/patrols/${routeId}/activate`);
  },

  /**
   * Deactivate a patrol route
   */
  async deactivatePatrolRoute(routeId: string): Promise<void> {
    await apiClient.post<void>(`/military/patrols/${routeId}/deactivate`);
  },

  // ===== Quick Actions =====
  quickActions: {
    /**
     * Quick order: Move troops to location
     */
    async moveToLocation(
      factionId: string,
      sourceSettlementId: string,
      targetX: number,
      targetY: number,
      targetZ: number,
      characterIds: string[],
      units: number
    ): Promise<MilitaryTypes.MilitaryOrderDto> {
      return militaryOrdersApi.createOrder({
        factionId,
        sourceSettlementId,
        orderType: MilitaryTypes.OrderType.Move,
        targetX,
        targetY,
        targetZ,
        assignedCharacterIds: characterIds,
        unitsCommitted: units,
        priority: MilitaryTypes.OrderPriority.Normal,
      });
    },

    /**
     * Quick order: Attack settlement
     */
    async attackSettlement(
      factionId: string,
      sourceSettlementId: string,
      targetSettlementId: string,
      characterIds: string[],
      units: number
    ): Promise<MilitaryTypes.MilitaryOrderDto> {
      return militaryOrdersApi.createOrder({
        factionId,
        sourceSettlementId,
        orderType: MilitaryTypes.OrderType.Attack,
        targetSettlementId,
        assignedCharacterIds: characterIds,
        unitsCommitted: units,
        priority: MilitaryTypes.OrderPriority.High,
      });
    },

    /**
     * Quick order: Defend settlement
     */
    async defendSettlement(
      factionId: string,
      settlementId: string,
      characterIds: string[],
      units: number
    ): Promise<MilitaryTypes.MilitaryOrderDto> {
      return militaryOrdersApi.createOrder({
        factionId,
        sourceSettlementId: settlementId,
        orderType: MilitaryTypes.OrderType.Defend,
        assignedCharacterIds: characterIds,
        unitsCommitted: units,
        priority: MilitaryTypes.OrderPriority.High,
      });
    },

    /**
     * Quick order: Garrison troops
     */
    async garrisonTroops(
      factionId: string,
      settlementId: string,
      characterIds: string[],
      units: number
    ): Promise<MilitaryTypes.MilitaryOrderDto> {
      return militaryOrdersApi.createOrder({
        factionId,
        sourceSettlementId: settlementId,
        orderType: MilitaryTypes.OrderType.Garrison,
        assignedCharacterIds: characterIds,
        unitsCommitted: units,
        priority: MilitaryTypes.OrderPriority.Normal,
        autoExecute: true,
      });
    },

    /**
     * Quick order: Scout area
     */
    async scoutArea(
      factionId: string,
      sourceSettlementId: string,
      targetX: number,
      targetY: number,
      targetZ: number,
      characterIds: string[]
    ): Promise<MilitaryTypes.MilitaryOrderDto> {
      return militaryOrdersApi.createOrder({
        factionId,
        sourceSettlementId,
        orderType: MilitaryTypes.OrderType.Scout,
        targetX,
        targetY,
        targetZ,
        assignedCharacterIds: characterIds,
        unitsCommitted: characterIds.length,
        priority: MilitaryTypes.OrderPriority.Normal,
        movementSpeed: MilitaryTypes.MovementSpeed.ForcedMarch,
      });
    },

    /**
     * Quick order: Retreat to settlement
     */
    async retreat(
      factionId: string,
      currentOrderId: string,
      retreatToSettlementId: string
    ): Promise<MilitaryTypes.MilitaryOrderDto> {
      // Cancel current order
      await militaryOrdersApi.cancelOrder(currentOrderId);

      // Get current order details to extract characters
      const currentOrder = await militaryOrdersApi.getOrder(currentOrderId);

      // Create retreat order
      return militaryOrdersApi.createOrder({
        factionId,
        sourceSettlementId: currentOrder.sourceSettlementId,
        orderType: MilitaryTypes.OrderType.Retreat,
        targetSettlementId: retreatToSettlementId,
        assignedCharacterIds: currentOrder.assignedCharacterIds,
        unitsCommitted: currentOrder.unitsRemaining,
        priority: MilitaryTypes.OrderPriority.Critical,
        movementSpeed: MilitaryTypes.MovementSpeed.ForcedMarch,
      });
    },
  },
};
