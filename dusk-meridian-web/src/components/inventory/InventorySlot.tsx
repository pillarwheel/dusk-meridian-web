import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { InventoryItemDto, ItemRarity } from '../../api/types/inventory';

interface InventorySlotProps {
  item: InventoryItemDto | null;
  slotIndex: number;
  onItemClick?: (item: InventoryItemDto) => void;
  onItemRightClick?: (item: InventoryItemDto) => void;
  isDisabled?: boolean;
}

const getRarityColor = (rarity: ItemRarity): string => {
  switch (rarity) {
    case ItemRarity.Common:
      return 'border-gray-500';
    case ItemRarity.Uncommon:
      return 'border-green-500';
    case ItemRarity.Rare:
      return 'border-blue-500';
    case ItemRarity.Epic:
      return 'border-purple-500';
    case ItemRarity.Legendary:
      return 'border-orange-500';
    case ItemRarity.Mythic:
      return 'border-red-500';
    case ItemRarity.Artifact:
      return 'border-yellow-500';
    default:
      return 'border-gray-600';
  }
};

const getRarityGlow = (rarity: ItemRarity): string => {
  switch (rarity) {
    case ItemRarity.Uncommon:
      return 'shadow-green-500/50';
    case ItemRarity.Rare:
      return 'shadow-blue-500/50';
    case ItemRarity.Epic:
      return 'shadow-purple-500/50';
    case ItemRarity.Legendary:
      return 'shadow-orange-500/50';
    case ItemRarity.Mythic:
      return 'shadow-red-500/50';
    case ItemRarity.Artifact:
      return 'shadow-yellow-500/50';
    default:
      return '';
  }
};

export const InventorySlot: React.FC<InventorySlotProps> = ({
  item,
  slotIndex,
  onItemClick,
  onItemRightClick,
  isDisabled = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item?.id || `empty-${slotIndex}`,
    disabled: isDisabled || !item,
    data: {
      item,
      slotIndex,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = () => {
    if (item && onItemClick) {
      onItemClick(item);
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (item && onItemRightClick) {
      onItemRightClick(item);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      onContextMenu={handleRightClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`
        relative w-12 h-12 rounded border-2 bg-gray-800
        ${item ? getRarityColor(item.item.rarity) : 'border-gray-700'}
        ${item && getRarityGlow(item.item.rarity) ? `shadow-lg ${getRarityGlow(item.item.rarity)}` : ''}
        ${item ? 'cursor-pointer hover:brightness-110' : 'cursor-default'}
        ${isDragging ? 'z-50' : ''}
        transition-all duration-200
      `}
    >
      {item ? (
        <>
          {/* Item Icon/Image */}
          {item.item.iconUrl ? (
            <img
              src={item.item.iconUrl}
              alt={item.item.name}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              {getItemIcon(item.item.type)}
            </div>
          )}

          {/* Stack Count */}
          {item.quantity > 1 && (
            <div className="absolute bottom-0 right-0 bg-black/80 px-1 rounded-tl text-xs font-bold text-white">
              {item.quantity}
            </div>
          )}

          {/* Durability Bar */}
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

          {/* Equipped Indicator */}
          {item.equipped && (
            <div className="absolute top-0 left-0 w-3 h-3 bg-green-500 rounded-br border border-green-400">
              <span className="text-[8px] text-white font-bold flex items-center justify-center">
                E
              </span>
            </div>
          )}

          {/* Basic Tooltip */}
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
              <div className={`text-xs font-semibold ${getRarityTextColor(item.item.rarity)}`}>
                {item.item.name}
              </div>
              {item.customName && (
                <div className="text-[10px] text-gray-400 italic">"{item.customName}"</div>
              )}
            </div>
          )}
        </>
      ) : (
        // Empty slot
        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
          {slotIndex + 1}
        </div>
      )}
    </div>
  );
};

const getRarityTextColor = (rarity: ItemRarity): string => {
  switch (rarity) {
    case ItemRarity.Common:
      return 'text-gray-300';
    case ItemRarity.Uncommon:
      return 'text-green-400';
    case ItemRarity.Rare:
      return 'text-blue-400';
    case ItemRarity.Epic:
      return 'text-purple-400';
    case ItemRarity.Legendary:
      return 'text-orange-400';
    case ItemRarity.Mythic:
      return 'text-red-400';
    case ItemRarity.Artifact:
      return 'text-yellow-400';
    default:
      return 'text-gray-300';
  }
};

const getItemIcon = (type: string): string => {
  switch (type) {
    case 'Weapon':
      return '⚔️';
    case 'Armor':
      return '🛡️';
    case 'Accessory':
      return '💍';
    case 'Consumable':
      return '🧪';
    case 'Material':
      return '📦';
    case 'Quest':
      return '📜';
    case 'Currency':
      return '💰';
    case 'Tool':
      return '🔧';
    case 'Book':
      return '📖';
    default:
      return '📋';
  }
};
