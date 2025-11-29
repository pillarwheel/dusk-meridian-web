import { apiClient } from '../client';
import * as InventoryTypes from '../types/inventory';

export const inventoryApi = {
  // ===== Inventory =====

  /**
   * Get full inventory for a character
   */
  async getInventory(characterId: string): Promise<InventoryTypes.InventoryDto> {
    const response = await apiClient.get<InventoryTypes.InventoryDto>(
      `/character/${characterId}/inventory`
    );
    return response.data;
  },

  /**
   * Get equipped items only
   */
  async getEquipment(
    characterId: string
  ): Promise<Record<InventoryTypes.EquipmentSlot, InventoryTypes.InventoryItemDto | null>> {
    const response = await apiClient.get<
      Record<InventoryTypes.EquipmentSlot, InventoryTypes.InventoryItemDto | null>
    >(`/character/${characterId}/equipment`);
    return response.data;
  },

  /**
   * Get inventory items only (not equipped)
   */
  async getInventoryItems(characterId: string): Promise<InventoryTypes.InventoryItemDto[]> {
    const response = await apiClient.get<InventoryTypes.InventoryItemDto[]>(
      `/character/${characterId}/inventory/items`
    );
    return response.data;
  },

  /**
   * Get currency balances
   */
  async getCurrencies(characterId: string): Promise<InventoryTypes.CurrencyDto[]> {
    const response = await apiClient.get<InventoryTypes.CurrencyDto[]>(
      `/character/${characterId}/inventory/currency`
    );
    return response.data;
  },

  // ===== Item Management =====

  /**
   * Equip an item
   */
  async equipItem(characterId: string, data: InventoryTypes.EquipItemDto): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/inventory/equip`, data);
  },

  /**
   * Unequip an item
   */
  async unequipItem(characterId: string, data: InventoryTypes.UnequipItemDto): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/inventory/unequip`, data);
  },

  /**
   * Move item to different slot
   */
  async moveItem(characterId: string, data: InventoryTypes.MoveItemDto): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/inventory/move`, data);
  },

  /**
   * Split a stack of items
   */
  async splitStack(characterId: string, data: InventoryTypes.SplitStackDto): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/inventory/split`, data);
  },

  /**
   * Merge two stacks
   */
  async mergeStacks(characterId: string, data: InventoryTypes.MergeStackDto): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/inventory/merge`, data);
  },

  /**
   * Drop an item (destroy it)
   */
  async dropItem(characterId: string, data: InventoryTypes.DropItemDto): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/inventory/drop`, data);
  },

  /**
   * Use a consumable item
   */
  async useItem(characterId: string, data: InventoryTypes.UseItemDto): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/inventory/use`, data);
  },

  /**
   * Delete an item permanently
   */
  async deleteItem(characterId: string, inventoryItemId: string): Promise<void> {
    await apiClient.delete<void>(
      `/character/${characterId}/inventory/items/${inventoryItemId}`
    );
  },

  /**
   * Repair an item
   */
  async repairItem(characterId: string, data: InventoryTypes.RepairItemDto): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/inventory/repair`, data);
  },

  /**
   * Enchant an item
   */
  async enchantItem(characterId: string, data: InventoryTypes.EnchantItemDto): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/inventory/enchant`, data);
  },

  /**
   * Socket a gem into an item
   */
  async socketGem(characterId: string, data: InventoryTypes.SocketGemDto): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/inventory/socket`, data);
  },

  // ===== Item Database =====

  /**
   * Get item details by ID
   */
  async getItemDetails(itemId: string): Promise<InventoryTypes.ItemDto> {
    const response = await apiClient.get<InventoryTypes.ItemDto>(`/items/${itemId}`);
    return response.data;
  },

  /**
   * Search items in database
   */
  async searchItems(query: string, filters?: {
    type?: InventoryTypes.ItemType;
    rarity?: InventoryTypes.ItemRarity;
    minLevel?: number;
    maxLevel?: number;
  }): Promise<InventoryTypes.ItemDto[]> {
    const response = await apiClient.get<InventoryTypes.ItemDto[]>('/items/search', {
      params: { query, ...filters },
    });
    return response.data;
  },

  /**
   * Get tooltip data for an item
   */
  async getItemTooltip(
    itemId: string,
    characterId: string | null = null
  ): Promise<InventoryTypes.ItemTooltipData> {
    const response = await apiClient.get<InventoryTypes.ItemTooltipData>(
      `/items/${itemId}/tooltip`,
      { params: { characterId } }
    );
    return response.data;
  },

  // ===== Trading =====

  /**
   * Get active trades for a character
   */
  async getTrades(characterId: string): Promise<InventoryTypes.TradeOfferDto[]> {
    const response = await apiClient.get<InventoryTypes.TradeOfferDto[]>(
      `/character/${characterId}/trades`
    );
    return response.data;
  },

  /**
   * Create a trade offer
   */
  async createTradeOffer(
    characterId: string,
    offer: InventoryTypes.CreateTradeOfferDto
  ): Promise<InventoryTypes.TradeOfferDto> {
    const response = await apiClient.post<InventoryTypes.TradeOfferDto>(
      `/character/${characterId}/trades`,
      offer
    );
    return response.data;
  },

  /**
   * Accept a trade offer
   */
  async acceptTrade(characterId: string, tradeId: string): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/trades/${tradeId}/accept`);
  },

  /**
   * Decline a trade offer
   */
  async declineTrade(characterId: string, tradeId: string): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/trades/${tradeId}/decline`);
  },

  /**
   * Cancel a trade offer
   */
  async cancelTrade(characterId: string, tradeId: string): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/trades/${tradeId}/cancel`);
  },

  // ===== Looting =====

  /**
   * Get nearby loot containers
   */
  async getNearbyLoot(characterId: string): Promise<InventoryTypes.LootContainerDto[]> {
    const response = await apiClient.get<InventoryTypes.LootContainerDto[]>(
      `/character/${characterId}/loot/nearby`
    );
    return response.data;
  },

  /**
   * Loot a container
   */
  async lootContainer(
    characterId: string,
    containerId: string,
    itemIds: string[]
  ): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/loot/${containerId}`, { itemIds });
  },

  /**
   * Loot all from a container
   */
  async lootAll(characterId: string, containerId: string): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/loot/${containerId}/all`);
  },

  // ===== Crafting =====

  /**
   * Get all known crafting recipes
   */
  async getCraftingRecipes(characterId: string): Promise<InventoryTypes.CraftingRecipeDto[]> {
    const response = await apiClient.get<InventoryTypes.CraftingRecipeDto[]>(
      `/character/${characterId}/crafting/recipes`
    );
    return response.data;
  },

  /**
   * Get crafting recipe details
   */
  async getCraftingRecipe(recipeId: string): Promise<InventoryTypes.CraftingRecipeDto> {
    const response = await apiClient.get<InventoryTypes.CraftingRecipeDto>(
      `/crafting/recipes/${recipeId}`
    );
    return response.data;
  },

  /**
   * Learn a new recipe
   */
  async learnRecipe(characterId: string, recipeId: string): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/crafting/learn/${recipeId}`);
  },

  /**
   * Get crafting queue
   */
  async getCraftingQueue(characterId: string): Promise<InventoryTypes.CraftingQueueDto[]> {
    const response = await apiClient.get<InventoryTypes.CraftingQueueDto[]>(
      `/character/${characterId}/crafting/queue`
    );
    return response.data;
  },

  /**
   * Start crafting an item
   */
  async startCrafting(
    characterId: string,
    data: InventoryTypes.StartCraftingDto
  ): Promise<InventoryTypes.CraftingQueueDto> {
    const response = await apiClient.post<InventoryTypes.CraftingQueueDto>(
      `/character/${characterId}/crafting/start`,
      data
    );
    return response.data;
  },

  /**
   * Cancel crafting
   */
  async cancelCrafting(characterId: string, queueId: string): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/crafting/${queueId}/cancel`);
  },

  /**
   * Pause crafting
   */
  async pauseCrafting(characterId: string, queueId: string): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/crafting/${queueId}/pause`);
  },

  /**
   * Resume crafting
   */
  async resumeCrafting(characterId: string, queueId: string): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/crafting/${queueId}/resume`);
  },

  // ===== Bags =====

  /**
   * Get all bags for a character
   */
  async getBags(characterId: string): Promise<InventoryTypes.BagDto[]> {
    const response = await apiClient.get<InventoryTypes.BagDto[]>(
      `/character/${characterId}/inventory/bags`
    );
    return response.data;
  },

  /**
   * Equip a bag
   */
  async equipBag(characterId: string, inventoryItemId: string, bagSlot: number): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/inventory/bags/equip`, {
      inventoryItemId,
      bagSlot,
    });
  },

  /**
   * Unequip a bag
   */
  async unequipBag(characterId: string, bagSlot: number): Promise<void> {
    await apiClient.post<void>(`/character/${characterId}/inventory/bags/unequip`, { bagSlot });
  },

  // ===== Quick Actions =====
  quickActions: {
    /**
     * Quick equip item from inventory
     */
    async quickEquip(characterId: string, inventoryItemId: string): Promise<void> {
      // API will auto-detect appropriate slot
      const inventory = await inventoryApi.getInventory(characterId);
      const item = inventory.items.find((i) => i.id === inventoryItemId);

      if (!item || !item.item.equipmentSlot) {
        throw new Error('Item cannot be equipped');
      }

      await inventoryApi.equipItem(characterId, {
        inventoryItemId,
        slot: item.item.equipmentSlot,
      });
    },

    /**
     * Quick unequip to first available slot
     */
    async quickUnequip(
      characterId: string,
      slot: InventoryTypes.EquipmentSlot
    ): Promise<void> {
      await inventoryApi.unequipItem(characterId, { slot });
    },

    /**
     * Sell item to vendor
     */
    async sellItem(
      characterId: string,
      inventoryItemId: string,
      quantity: number = 1
    ): Promise<number> {
      const response = await apiClient.post<{ goldReceived: number }>(
        `/character/${characterId}/inventory/sell`,
        { inventoryItemId, quantity }
      );
      return response.data.goldReceived;
    },

    /**
     * Buy item from vendor
     */
    async buyItem(
      characterId: string,
      itemId: string,
      quantity: number = 1
    ): Promise<InventoryTypes.InventoryItemDto> {
      const response = await apiClient.post<InventoryTypes.InventoryItemDto>(
        `/character/${characterId}/inventory/buy`,
        { itemId, quantity }
      );
      return response.data;
    },

    /**
     * Auto-sort inventory
     */
    async sortInventory(characterId: string, sortBy: 'type' | 'rarity' | 'value' | 'name' = 'type'): Promise<void> {
      await apiClient.post<void>(`/character/${characterId}/inventory/sort`, { sortBy });
    },

    /**
     * Stack all stackable items
     */
    async stackAll(characterId: string): Promise<void> {
      await apiClient.post<void>(`/character/${characterId}/inventory/stack-all`);
    },

    /**
     * Disenchant an item for materials
     */
    async disenchantItem(
      characterId: string,
      inventoryItemId: string
    ): Promise<InventoryTypes.InventoryItemDto[]> {
      const response = await apiClient.post<InventoryTypes.InventoryItemDto[]>(
        `/character/${characterId}/inventory/disenchant`,
        { inventoryItemId }
      );
      return response.data;
    },
  },
};
