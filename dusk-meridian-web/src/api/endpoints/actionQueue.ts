import { apiClient } from '../client';
import * as ActionQueueTypes from '../types/actionQueue';

export const actionQueueApi = {
  /**
   * Get the full action queue for a character
   */
  async getActionQueue(characterId: string): Promise<ActionQueueTypes.ActionQueueDto[]> {
    const response = await apiClient.get<ActionQueueTypes.ActionQueueDto[]>(
      `/character/${characterId}/action-queue`
    );
    return response.data;
  },

  /**
   * Get action queue summary with statistics
   */
  async getActionQueueSummary(characterId: string): Promise<ActionQueueTypes.ActionQueueSummary> {
    const response = await apiClient.get<ActionQueueTypes.ActionQueueSummary>(
      `/character/${characterId}/action-queue/summary`
    );
    return response.data;
  },

  /**
   * Get the currently executing action
   */
  async getCurrentAction(characterId: string): Promise<ActionQueueTypes.ActionQueueDto | null> {
    const response = await apiClient.get<ActionQueueTypes.ActionQueueDto | null>(
      `/character/${characterId}/action-queue/current`
    );
    return response.data;
  },

  /**
   * Get the next action in the queue
   */
  async getNextAction(characterId: string): Promise<ActionQueueTypes.ActionQueueDto | null> {
    const response = await apiClient.get<ActionQueueTypes.ActionQueueDto | null>(
      `/character/${characterId}/action-queue/next`
    );
    return response.data;
  },

  /**
   * Add a single action to the queue
   */
  async addAction(
    characterId: string,
    action: ActionQueueTypes.CreateActionDto
  ): Promise<ActionQueueTypes.ActionQueueDto> {
    const response = await apiClient.post<ActionQueueTypes.ActionQueueDto>(
      `/character/${characterId}/action-queue`,
      action
    );
    return response.data;
  },

  /**
   * Add multiple actions to the queue in batch
   */
  async addActionBatch(
    characterId: string,
    actions: ActionQueueTypes.CreateActionDto[]
  ): Promise<ActionQueueTypes.ActionQueueDto[]> {
    const response = await apiClient.post<ActionQueueTypes.ActionQueueDto[]>(
      `/character/${characterId}/action-queue/batch`,
      { actions }
    );
    return response.data;
  },

  /**
   * Update an existing action
   */
  async updateAction(
    characterId: string,
    actionId: string,
    updates: ActionQueueTypes.UpdateActionDto
  ): Promise<ActionQueueTypes.ActionQueueDto> {
    const response = await apiClient.patch<ActionQueueTypes.ActionQueueDto>(
      `/character/${characterId}/action-queue/${actionId}`,
      updates
    );
    return response.data;
  },

  /**
   * Reorder the entire queue
   */
  async reorderQueue(characterId: string, actionIds: string[]): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/action-queue/reorder`, { actionIds });
  },

  /**
   * Remove a specific action from the queue
   */
  async removeAction(characterId: string, actionId: string): Promise<void> {
    await apiClient.delete<void>(`/character/${characterId}/action-queue/${actionId}`);
  },

  /**
   * Clear all queued actions (not in progress)
   */
  async clearQueue(characterId: string): Promise<void> {
    await apiClient.delete<void>(`/character/${characterId}/action-queue`);
  },

  /**
   * Cancel a specific action (if in progress, stops it)
   */
  async cancelAction(characterId: string, actionId: string): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/action-queue/${actionId}/cancel`);
  },

  /**
   * Pause a specific action
   */
  async pauseAction(characterId: string, actionId: string): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/action-queue/${actionId}/pause`);
  },

  /**
   * Resume a paused action
   */
  async resumeAction(characterId: string, actionId: string): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/action-queue/${actionId}/resume`);
  },

  /**
   * Get all saved action templates
   */
  async getTemplates(): Promise<ActionQueueTypes.ActionTemplateDto[]> {
    const response = await apiClient.get<ActionQueueTypes.ActionTemplateDto[]>(
      '/action-queue/templates'
    );
    return response.data;
  },

  /**
   * Get a specific template by ID
   */
  async getTemplate(templateId: string): Promise<ActionQueueTypes.ActionTemplateDto> {
    const response = await apiClient.get<ActionQueueTypes.ActionTemplateDto>(
      `/action-queue/templates/${templateId}`
    );
    return response.data;
  },

  /**
   * Save a new action template
   */
  async saveTemplate(
    template: ActionQueueTypes.CreateActionTemplateDto
  ): Promise<ActionQueueTypes.ActionTemplateDto> {
    const response = await apiClient.post<ActionQueueTypes.ActionTemplateDto>(
      '/action-queue/templates',
      template
    );
    return response.data;
  },

  /**
   * Update an existing template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<ActionQueueTypes.CreateActionTemplateDto>
  ): Promise<ActionQueueTypes.ActionTemplateDto> {
    const response = await apiClient.patch<ActionQueueTypes.ActionTemplateDto>(
      `/action-queue/templates/${templateId}`,
      updates
    );
    return response.data;
  },

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    await apiClient.delete<void>(`/action-queue/templates/${templateId}`);
  },

  /**
   * Load a template into a character's queue
   */
  async loadTemplate(characterId: string, templateId: string): Promise<void> {
    await apiClient.post<void>(
      `/character/${characterId}/action-queue/load-template/${templateId}`
    );
  },

  /**
   * Quick actions - Add common actions with defaults
   */
  quickActions: {
    async eat(characterId: string, foodItemId: string): Promise<ActionQueueTypes.ActionQueueDto> {
      return actionQueueApi.addAction(characterId, {
        actionName: 'Eat',
        actionType: ActionQueueTypes.ActionType.Eat,
        actionCategory: ActionQueueTypes.ActionCategory.Physiological,
        targetItemId: foodItemId,
        priorityLevel: 10,
      });
    },

    async drink(characterId: string, drinkItemId: string): Promise<ActionQueueTypes.ActionQueueDto> {
      return actionQueueApi.addAction(characterId, {
        actionName: 'Drink',
        actionType: ActionQueueTypes.ActionType.Drink,
        actionCategory: ActionQueueTypes.ActionCategory.Physiological,
        targetItemId: drinkItemId,
        priorityLevel: 10,
      });
    },

    async sleep(characterId: string, buildingId?: string): Promise<ActionQueueTypes.ActionQueueDto> {
      return actionQueueApi.addAction(characterId, {
        actionName: 'Sleep',
        actionType: ActionQueueTypes.ActionType.Sleep,
        actionCategory: ActionQueueTypes.ActionCategory.Physiological,
        targetBuildingId: buildingId,
        priorityLevel: 8,
      });
    },

    async moveTo(
      characterId: string,
      x: number,
      y: number,
      z: number
    ): Promise<ActionQueueTypes.ActionQueueDto> {
      return actionQueueApi.addAction(characterId, {
        actionName: 'Move',
        actionType: ActionQueueTypes.ActionType.MoveTo,
        actionCategory: ActionQueueTypes.ActionCategory.Safety,
        targetX: x,
        targetY: y,
        targetZ: z,
        priorityLevel: 5,
      });
    },

    async gather(
      characterId: string,
      resourceId: string
    ): Promise<ActionQueueTypes.ActionQueueDto> {
      return actionQueueApi.addAction(characterId, {
        actionName: 'Gather Resource',
        actionType: ActionQueueTypes.ActionType.GatherResource,
        actionCategory: ActionQueueTypes.ActionCategory.SelfActualization,
        targetResourceId: resourceId,
        priorityLevel: 5,
      });
    },

    async craft(
      characterId: string,
      recipeId: string
    ): Promise<ActionQueueTypes.ActionQueueDto> {
      return actionQueueApi.addAction(characterId, {
        actionName: 'Craft Item',
        actionType: ActionQueueTypes.ActionType.Craft,
        actionCategory: ActionQueueTypes.ActionCategory.SelfActualization,
        parameters: { recipeId },
        priorityLevel: 5,
      });
    },

    async attack(
      characterId: string,
      targetCharacterId: string
    ): Promise<ActionQueueTypes.ActionQueueDto> {
      return actionQueueApi.addAction(characterId, {
        actionName: 'Attack',
        actionType: ActionQueueTypes.ActionType.Attack,
        actionCategory: ActionQueueTypes.ActionCategory.Safety,
        targetCharacterId: targetCharacterId,
        priorityLevel: 9,
      });
    },

    async guard(
      characterId: string,
      buildingId: string
    ): Promise<ActionQueueTypes.ActionQueueDto> {
      return actionQueueApi.addAction(characterId, {
        actionName: 'Guard',
        actionType: ActionQueueTypes.ActionType.Guard,
        actionCategory: ActionQueueTypes.ActionCategory.Safety,
        targetBuildingId: buildingId,
        priorityLevel: 7,
      });
    },

    async trainSkill(
      characterId: string,
      skillId: string
    ): Promise<ActionQueueTypes.ActionQueueDto> {
      return actionQueueApi.addAction(characterId, {
        actionName: 'Train Skill',
        actionType: ActionQueueTypes.ActionType.TrainSkill,
        actionCategory: ActionQueueTypes.ActionCategory.SelfActualization,
        parameters: { skillId },
        priorityLevel: 4,
      });
    },
  },
};
