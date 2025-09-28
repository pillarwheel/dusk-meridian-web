import React from 'react';
import { CheckCircle2, MapPin, Shield, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import * as CharacterCreationTypes from '@/api/types/characterCreation';

interface GeographicalTraitCardProps {
  trait: CharacterCreationTypes.GeographicalTrait;
  isSelected?: boolean;
  onSelect?: (trait: CharacterCreationTypes.GeographicalTrait) => void;
  className?: string;
}

export const GeographicalTraitCard: React.FC<GeographicalTraitCardProps> = ({
  trait,
  isSelected = false,
  onSelect,
  className
}) => {
  const getRegionColor = () => {
    switch (trait.region.toLowerCase()) {
      case 'northern': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'southern': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'eastern': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'western': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'central': return 'text-purple-400 bg-purple-400/20 border-purple-400/30';
      case 'coastal': return 'text-cyan-400 bg-cyan-400/20 border-cyan-400/30';
      case 'mountain': return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
      case 'desert': return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
      case 'forest': return 'text-emerald-400 bg-emerald-400/20 border-emerald-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getEffectIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'resistance': return Shield;
      case 'bonus': return TrendingUp;
      case 'penalty': return TrendingDown;
      default: return Zap;
    }
  };

  const getEffectColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'resistance': return 'text-blue-400';
      case 'bonus': return 'text-green-400';
      case 'penalty': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  return (
    <div
      className={cn(
        'bg-card border rounded-lg p-4 transition-all cursor-pointer hover:border-primary/50',
        isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border',
        className
      )}
      onClick={() => onSelect?.(trait)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={cn('p-2 rounded-lg border', getRegionColor())}>
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{trait.name}</h3>
            <span className={cn('text-xs px-2 py-1 rounded-full border', getRegionColor())}>
              {trait.region} Region
            </span>
          </div>
        </div>

        {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {trait.description}
      </p>

      {/* Effects */}
      <div className="space-y-3">
        {/* Resistances */}
        {trait.resistances.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
              <Shield className="w-3 h-3 mr-1" />
              Resistances
            </h4>
            <div className="space-y-1">
              {trait.resistances.map((resistance, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{resistance.type}</span>
                  <span className="text-blue-400 font-medium">+{resistance.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bonuses */}
        {trait.bonuses.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              Bonuses
            </h4>
            <div className="space-y-1">
              {trait.bonuses.map((bonus, index) => {
                const EffectIcon = getEffectIcon(bonus.type);
                const effectColor = getEffectColor(bonus.type);

                return (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <EffectIcon className={cn('w-3 h-3', effectColor)} />
                      <span className="text-foreground">
                        {bonus.attribute ? `${bonus.attribute} ${bonus.type}` : bonus.type}
                      </span>
                    </div>
                    <span className={cn('font-medium', effectColor)}>
                      {bonus.value > 0 ? '+' : ''}{bonus.value}
                      {bonus.type === 'resistance' ? '%' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Trait Status */}
      {!trait.isActive && (
        <div className="mt-3 pt-3 border-t border-border">
          <span className="text-xs text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded-full">
            Coming Soon
          </span>
        </div>
      )}
    </div>
  );
};