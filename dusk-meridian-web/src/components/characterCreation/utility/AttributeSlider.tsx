import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import * as CharacterCreationTypes from '@/api/types/characterCreation';

interface AttributeSliderProps {
  attribute: keyof CharacterCreationTypes.AttributeDistribution;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  showButtons?: boolean;
  className?: string;
}

export const AttributeSlider: React.FC<AttributeSliderProps> = ({
  attribute,
  value,
  onChange,
  min = CharacterCreationTypes.MIN_ATTRIBUTE_VALUE,
  max = CharacterCreationTypes.MAX_ATTRIBUTE_VALUE,
  disabled = false,
  showButtons = true,
  className
}) => {
  const getAttributeDescription = () => {
    switch (attribute) {
      case 'strength':
        return 'Physical power, melee damage, and carrying capacity';
      case 'dexterity':
        return 'Agility, ranged accuracy, and movement speed';
      case 'constitution':
        return 'Health, stamina, and resistance to effects';
      case 'intelligence':
        return 'Magical power, mana pool, and spell effectiveness';
      case 'wisdom':
        return 'Perception, willpower, and mana regeneration';
      case 'charisma':
        return 'Social skills, leadership, and some magical abilities';
      default:
        return '';
    }
  };

  const getAttributeIcon = () => {
    switch (attribute) {
      case 'strength': return '💪';
      case 'dexterity': return '🏃';
      case 'constitution': return '❤️';
      case 'intelligence': return '🧠';
      case 'wisdom': return '👁️';
      case 'charisma': return '🎭';
      default: return '⭐';
    }
  };

  const getStatGrade = () => {
    if (value >= 16) return { grade: 'S', color: 'text-yellow-400' };
    if (value >= 14) return { grade: 'A', color: 'text-green-400' };
    if (value >= 12) return { grade: 'B', color: 'text-blue-400' };
    if (value >= 10) return { grade: 'C', color: 'text-gray-400' };
    return { grade: 'D', color: 'text-red-400' };
  };

  const handleDecrease = () => {
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(parseInt(event.target.value, 10));
    }
  };

  const percentage = ((value - min) / (max - min)) * 100;
  const statGrade = getStatGrade();

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getAttributeIcon()}</span>
          <div>
            <h3 className="font-medium capitalize">{attribute}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {getAttributeDescription()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={cn('text-sm font-bold px-2 py-1 rounded-full border', statGrade.color.replace('text-', 'border-'), statGrade.color.replace('text-', 'bg-').replace('400', '400/20'))}>
            {statGrade.grade}
          </span>
          <span className="text-lg font-bold min-w-8 text-center">
            {value}
          </span>
        </div>
      </div>

      {/* Slider and Controls */}
      <div className="flex items-center space-x-3">
        {showButtons && (
          <button
            onClick={handleDecrease}
            disabled={disabled || value <= min}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full border transition-colors',
              disabled || value <= min
                ? 'border-border text-muted-foreground cursor-not-allowed'
                : 'border-border hover:border-primary text-foreground hover:bg-primary/10'
            )}
          >
            <Minus className="w-4 h-4" />
          </button>
        )}

        <div className="flex-1 relative">
          {/* Custom slider track */}
          <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-200 ease-out rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* HTML range slider (invisible but functional) */}
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={handleSliderChange}
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          {/* Tick marks */}
          <div className="flex justify-between mt-1 px-1">
            {Array.from({ length: 5 }, (_, i) => {
              const tickValue = min + Math.floor((max - min) * (i / 4));
              return (
                <span
                  key={i}
                  className={cn(
                    'text-xs transition-colors',
                    value >= tickValue ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {tickValue}
                </span>
              );
            })}
          </div>
        </div>

        {showButtons && (
          <button
            onClick={handleIncrease}
            disabled={disabled || value >= max}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full border transition-colors',
              disabled || value >= max
                ? 'border-border text-muted-foreground cursor-not-allowed'
                : 'border-border hover:border-primary text-foreground hover:bg-primary/10'
            )}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Point Cost (optional display) */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Cost: {value - min} points</span>
        <span>Range: {min}-{max}</span>
      </div>
    </div>
  );
};