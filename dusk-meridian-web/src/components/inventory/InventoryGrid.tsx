import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { inventoryApi } from '../../api/endpoints/inventory';
import { InventoryItemDto, InventoryDto } from '../../api/types/inventory';
import { InventorySlot } from './InventorySlot';
import { Package, Trash2, ArrowDownUp, Layers } from 'lucide-react';

interface InventoryGridProps {
  characterId: string;
  className?: string;
  onItemSelect?: (item: InventoryItemDto) => void;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  characterId,
  className = '',
  onItemSelect,
}) => {
  const [inventory, setInventory] = useState<InventoryDto | null>(null);
  const [activeItem, setActiveItem] = useState<InventoryItemDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    loadInventory();
  }, [characterId]);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await inventoryApi.getInventory(characterId);
      setInventory(data);
    } catch (err: any) {
      console.error('Failed to load inventory:', err);
      setError(err.message || 'Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    const item = inventory?.items.find(i => i.id === active.id);
    if (item) {
      setActiveItem(item);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over || !inventory) return;

    const activeItem = inventory.items.find(i => i.id === active.id);
    if (!activeItem) return;

    // Get target slot index
    const targetSlot = over.data.current?.slotIndex ?? parseInt(over.id.toString().replace('empty-', ''));

    if (activeItem.slot === targetSlot) return;

    try {
      // Move item to new slot
      await inventoryApi.moveItem(characterId, {
        inventoryItemId: activeItem.id,
        targetSlot,
        targetBagId: null,
      });

      // Update local state optimistically
      setInventory(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map(item =>
            item.id === activeItem.id
              ? { ...item, slot: targetSlot }
              : item
          ),
        };
      });
    } catch (err: any) {
      console.error('Failed to move item:', err);
      setError(err.message || 'Failed to move item');
      // Reload inventory to reset state
      loadInventory();
    }
  };

  const handleItemClick = (item: InventoryItemDto) => {
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  const handleItemRightClick = async (item: InventoryItemDto) => {
    // Quick use/equip on right-click
    if (item.item.equipmentSlot && !item.equipped) {
      try {
        await inventoryApi.quickActions.quickEquip(characterId, item.id);
        loadInventory();
      } catch (err: any) {
        console.error('Failed to equip item:', err);
        setError(err.message || 'Failed to equip item');
      }
    } else if (item.item.type === 'Consumable') {
      try {
        await inventoryApi.useItem(characterId, {
          inventoryItemId: item.id,
          targetCharacterId: null,
        });
        loadInventory();
      } catch (err: any) {
        console.error('Failed to use item:', err);
        setError(err.message || 'Failed to use item');
      }
    }
  };

  const handleSortInventory = async () => {
    try {
      await inventoryApi.quickActions.sortInventory(characterId, 'type');
      loadInventory();
    } catch (err: any) {
      console.error('Failed to sort inventory:', err);
      setError(err.message || 'Failed to sort inventory');
    }
  };

  const handleStackAll = async () => {
    try {
      await inventoryApi.quickActions.stackAll(characterId);
      loadInventory();
    } catch (err: any) {
      console.error('Failed to stack items:', err);
      setError(err.message || 'Failed to stack items');
    }
  };

  if (isLoading && !inventory) {
    return (
      <div className={`bg-card rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Package className="w-6 h-6 animate-pulse text-gray-400" />
          <span className="ml-2 text-gray-400">Loading inventory...</span>
        </div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className={`bg-card rounded-lg p-4 ${className}`}>
        <div className="text-center py-8 text-gray-400">
          Failed to load inventory
        </div>
      </div>
    );
  }

  // Create array of all slots (including empty ones)
  const allSlots = Array.from({ length: inventory.maxSlots }, (_, index) => {
    const item = inventory.items.find(i => i.slot === index && !i.equipped);
    return { slotIndex: index, item: item || null };
  });

  const weightPercent = (inventory.currentWeight / inventory.weightCapacity) * 100;

  return (
    <div className={`bg-card rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            🎒 Inventory
            <span className="text-sm font-normal text-gray-400">
              ({inventory.usedSlots}/{inventory.maxSlots})
            </span>
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">Weight:</span>
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div
                className={`h-full rounded-full transition-all ${
                  weightPercent > 90
                    ? 'bg-red-500'
                    : weightPercent > 75
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(weightPercent, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">
              {inventory.currentWeight.toFixed(1)}/{inventory.weightCapacity}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleStackAll}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            title="Stack All"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={handleSortInventory}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            title="Sort Inventory"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-300 hover:text-red-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Inventory Grid */}
      <div className="p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={allSlots.map(s => s.item?.id || `empty-${s.slotIndex}`)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-8 gap-1">
              {allSlots.map((slot) => (
                <InventorySlot
                  key={`slot-${slot.slotIndex}`}
                  item={slot.item}
                  slotIndex={slot.slotIndex}
                  onItemClick={handleItemClick}
                  onItemRightClick={handleItemRightClick}
                />
              ))}
            </div>
          </SortableContext>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeItem && (
              <div className="w-12 h-12 rounded border-2 border-blue-500 shadow-lg opacity-80">
                {activeItem.item.iconUrl ? (
                  <img
                    src={activeItem.item.iconUrl}
                    alt={activeItem.item.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-2xl">
                    📦
                  </div>
                )}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <span>Drag items to rearrange • Right-click to use/equip</span>
          <span className="text-gray-500">
            {inventory.items.filter(i => !i.equipped).length} items
          </span>
        </div>
      </div>
    </div>
  );
};
