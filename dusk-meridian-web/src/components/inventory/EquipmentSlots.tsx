import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../api/endpoints/inventory';
import { InventoryItemDto, EquipmentSlot } from '../../api/types/inventory';
import { Shield, Shirt, Footprints, Hand, Gem, Zap } from 'lucide-react';

interface EquipmentSlotsProps {
  characterId: string;
  className?: string;
  onItemClick?: (item: InventoryItemDto) => void;
}

const SLOT_LAYOUT = [
  { slot: EquipmentSlot.Head, label: 'Head', position: 'top-0 left-1/2 -translate-x-1/2' },
  { slot: EquipmentSlot.Neck, label: 'Neck', position: 'top-16 left-1/2 -translate-x-1/2' },
  { slot: EquipmentSlot.Shoulders, label: 'Shoulders', position: 'top-32 left-1/2 -translate-x-1/2' },

  { slot: EquipmentSlot.Back, label: 'Back', position: 'top-0 left-0' },
  { slot: EquipmentSlot.Chest, label: 'Chest', position: 'top-48 left-1/2 -translate-x-1/2' },
  { slot: EquipmentSlot.Wrists, label: 'Wrists', position: 'top-64 left-1/2 -translate-x-1/2' },

  { slot: EquipmentSlot.MainHand, label: 'Main Hand', position: 'top-32 left-0' },
  { slot: EquipmentSlot.Hands, label: 'Hands', position: 'top-80 left-1/2 -translate-x-1/2' },
  { slot: EquipmentSlot.OffHand, label: 'Off Hand', position: 'top-32 right-0' },

  { slot: EquipmentSlot.Waist, label: 'Waist', position: 'top-96 left-1/2 -translate-x-1/2' },
  { slot: EquipmentSlot.Legs, label: 'Legs', position: 'top-112 left-1/2 -translate-x-1/2' },
  { slot: EquipmentSlot.Feet, label: 'Feet', position: 'top-128 left-1/2 -translate-x-1/2' },

  { slot: EquipmentSlot.Ring1, label: 'Ring 1', position: 'top-48 left-0' },
  { slot: EquipmentSlot.Ring2, label: 'Ring 2', position: 'top-48 right-0' },
  { slot: EquipmentSlot.Trinket1, label: 'Trinket 1', position: 'top-64 left-0' },
  { slot: EquipmentSlot.Trinket2, label: 'Trinket 2', position: 'top-64 right-0' },
];

export const EquipmentSlots: React.FC<EquipmentSlotsProps> = ({
  characterId,
  className = '',
  onItemClick,
}) => {
  const [equipment, setEquipment] = useState<Record<EquipmentSlot, InventoryItemDto | null> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEquipment();
  }, [characterId]);

  const loadEquipment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await inventoryApi.getEquipment(characterId);
      setEquipment(data);
    } catch (err: any) {
      console.error('Failed to load equipment:', err);
      setError(err.message || 'Failed to load equipment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnequip = async (slot: EquipmentSlot) => {
    try {
      await inventoryApi.unequipItem(characterId, { slot });
      loadEquipment();
    } catch (err: any) {
      console.error('Failed to unequip item:', err);
      setError(err.message || 'Failed to unequip item');
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-card rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Shield className="w-6 h-6 animate-pulse text-gray-400" />
          <span className="ml-2 text-gray-400">Loading equipment...</span>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className={`bg-card rounded-lg p-4 ${className}`}>
        <div className="text-center py-8 text-gray-400">
          Failed to load equipment
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          🛡️ Equipment
        </h3>
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

      {/* Equipment Slots - Paper Doll Style */}
      <div className="p-8">
        <div className="relative mx-auto" style={{ width: '280px', height: '400px' }}>
          {/* Character Silhouette */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="text-9xl">🧍</div>
          </div>

          {/* Equipment Slots */}
          {SLOT_LAYOUT.map(({ slot, label, position }) => {
            const item = equipment[slot];
            return (
              <div
                key={slot}
                className={`absolute ${position} group`}
                title={label}
              >
                <div
                  className={`
                    w-14 h-14 rounded border-2 bg-gray-800 flex items-center justify-center
                    ${item ? 'border-blue-500 cursor-pointer hover:border-blue-400' : 'border-gray-700'}
                    transition-all relative
                  `}
                  onClick={() => item && onItemClick && onItemClick(item)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (item) handleUnequip(slot);
                  }}
                >
                  {item ? (
                    <>
                      {item.item.iconUrl ? (
                        <img
                          src={item.item.iconUrl}
                          alt={item.item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="text-2xl">
                          {getSlotIcon(slot)}
                        </div>
                      )}

                      {/* Durability Indicator */}
                      {item.durability !== null && item.maxDurability !== null && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900">
                          <div
                            className={`h-full ${
                              (item.durability / item.maxDurability) > 0.5
                                ? 'bg-green-500'
                                : (item.durability / item.maxDurability) > 0.25
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${(item.durability / item.maxDurability) * 100}%` }}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-600 text-xl">
                      {getSlotIcon(slot)}
                    </div>
                  )}
                </div>

                {/* Slot Label */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs text-gray-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {label}
                </div>

                {/* Item Name Tooltip */}
                {item && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <div className="text-xs font-semibold text-blue-400">
                      {item.item.name}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="p-4 border-t border-gray-700 bg-gray-900/50">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-400">
            <span className="text-white font-semibold">
              {Object.values(equipment).filter(item => item !== null).length}
            </span>
            {' '}/ {Object.keys(equipment).length} equipped
          </div>
          <div className="text-gray-400 text-right">
            Right-click to unequip
          </div>
        </div>
      </div>
    </div>
  );
};

const getSlotIcon = (slot: EquipmentSlot): string => {
  switch (slot) {
    case EquipmentSlot.Head:
      return '⛑️';
    case EquipmentSlot.Neck:
      return '📿';
    case EquipmentSlot.Shoulders:
      return '🎖️';
    case EquipmentSlot.Back:
      return '🧥';
    case EquipmentSlot.Chest:
      return '🛡️';
    case EquipmentSlot.Wrists:
      return '⌚';
    case EquipmentSlot.Hands:
      return '🧤';
    case EquipmentSlot.Waist:
      return '🎗️';
    case EquipmentSlot.Legs:
      return '👖';
    case EquipmentSlot.Feet:
      return '👢';
    case EquipmentSlot.MainHand:
    case EquipmentSlot.TwoHand:
      return '⚔️';
    case EquipmentSlot.OffHand:
      return '🛡️';
    case EquipmentSlot.RangedWeapon:
      return '🏹';
    case EquipmentSlot.Ring1:
    case EquipmentSlot.Ring2:
      return '💍';
    case EquipmentSlot.Trinket1:
    case EquipmentSlot.Trinket2:
      return '✨';
    case EquipmentSlot.Ammo:
      return '🎯';
    default:
      return '📦';
  }
};
