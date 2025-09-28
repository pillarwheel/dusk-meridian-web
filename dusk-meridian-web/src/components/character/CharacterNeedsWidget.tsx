import React from 'react';
import { Heart, AlertTriangle, Shield, Users, Trophy, Brain, Droplets, Utensils, Bed } from 'lucide-react';
import { useCharacterNeeds } from '@/hooks/useCharacterNeeds';
import { cn } from '@/utils/cn';

// Inline type to avoid import issues
interface CharacterNeeds {
  characterId: number;
  hunger: number;
  thirst: number;
  rest: number;
  safety: number;
  social: number;
  esteem: number;
  selfActualization: number;
  lastUpdated: Date;
}

interface CharacterNeedsWidgetProps {
  characterId: number;
  showActions?: boolean;
  compact?: boolean;
  autoRefresh?: boolean;
  className?: string;
}

const needIcons = {
  hunger: Utensils,
  thirst: Droplets,
  rest: Bed,
  safety: Shield,
  social: Users,
  esteem: Trophy,
  selfActualization: Brain
};

const needLabels = {
  hunger: 'Hunger',
  thirst: 'Thirst',
  rest: 'Rest',
  safety: 'Safety',
  social: 'Social',
  esteem: 'Esteem',
  selfActualization: 'Self-Actualization'
};

const needCategories = {
  physiological: ['hunger', 'thirst', 'rest'],
  safety: ['safety'],
  love: ['social'],
  esteem: ['esteem'],
  selfActualization: ['selfActualization']
};

export const CharacterNeedsWidget: React.FC<CharacterNeedsWidgetProps> = ({
  characterId,
  showActions = true,
  compact = false,
  autoRefresh = true,
  className
}) => {
  const {
    needs,
    isLoading,
    error,
    criticalNeeds,
    hasCriticalNeeds,
    isHealthy,
    getOverallWellbeing,
    getNeedStatus,
    updateNeed,
    performEmergencyCheck,
    fetchNeeds
  } = useCharacterNeeds({
    characterId,
    autoRefresh,
    refreshInterval: 30000
  });

  const wellbeing = getOverallWellbeing;

  const renderNeedBar = (needKey: keyof CharacterNeeds, value: number) => {
    if (typeof value !== 'number') return null;

    const needStatus = getNeedStatus(value);
    const Icon = needIcons[needKey as keyof typeof needIcons];
    const isCritical = criticalNeeds.includes(needKey);

    return (
      <div key={needKey} className={cn(
        "bg-background/50 p-3 rounded-lg transition-all",
        isCritical && "ring-2 ring-red-500/50 bg-red-600/10"
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className={cn("w-4 h-4", isCritical ? "text-red-400" : "text-muted-foreground")} />}
            <span className={cn("text-sm font-medium", compact && "text-xs")}>
              {needLabels[needKey as keyof typeof needLabels]}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {isCritical && <AlertTriangle className="w-3 h-3 text-red-400" />}
            <span className={cn(
              "font-bold text-sm",
              needStatus.color === 'red' && "text-red-400",
              needStatus.color === 'orange' && "text-orange-400",
              needStatus.color === 'yellow' && "text-yellow-400",
              needStatus.color === 'blue' && "text-blue-400",
              needStatus.color === 'green' && "text-green-400"
            )}>
              {value}/100
            </span>
          </div>
        </div>

        <div className="w-full bg-border rounded-full h-2">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              needStatus.color === 'red' && "bg-red-500",
              needStatus.color === 'orange' && "bg-orange-500",
              needStatus.color === 'yellow' && "bg-yellow-500",
              needStatus.color === 'blue' && "bg-blue-500",
              needStatus.color === 'green' && "bg-green-500"
            )}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className={cn("bg-red-600/20 border border-red-600/30 text-red-400 p-4 rounded-lg", className)}>
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">Character Needs Error</span>
        </div>
        <p className="text-sm mb-3">{error}</p>
        <button
          onClick={fetchNeeds}
          className="text-xs bg-red-600/30 px-3 py-1 rounded border border-red-600/50 hover:bg-red-600/40 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading && !needs) {
    return (
      <div className={cn("bg-background/50 p-4 rounded-lg", className)}>
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 animate-pulse" />
          <span className="text-sm">Loading character needs...</span>
        </div>
      </div>
    );
  }

  if (!needs) {
    return (
      <div className={cn("bg-background/50 p-4 rounded-lg text-center", className)}>
        <Heart className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No character needs data available</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className={cn(
            "w-5 h-5",
            isHealthy ? "text-green-400" : hasCriticalNeeds ? "text-red-400" : "text-yellow-400"
          )} />
          <h3 className={cn("font-semibold", compact ? "text-sm" : "text-lg")}>
            Character Needs
          </h3>
          {hasCriticalNeeds && (
            <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded-full text-xs font-medium">
              {criticalNeeds.length} Critical
            </span>
          )}
        </div>

        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={fetchNeeds}
              disabled={isLoading}
              className="text-xs bg-secondary px-3 py-1 rounded border border-border hover:bg-secondary/80 transition-colors"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            {hasCriticalNeeds && (
              <button
                onClick={performEmergencyCheck}
                className="text-xs bg-red-600/20 text-red-400 px-3 py-1 rounded border border-red-600/30 hover:bg-red-600/30 transition-colors"
              >
                Emergency Aid
              </button>
            )}
          </div>
        )}
      </div>

      {/* Overall Wellbeing */}
      {wellbeing && !compact && (
        <div className="bg-background/30 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Wellbeing</span>
            <span className={cn(
              "text-sm font-bold",
              wellbeing.status === 'excellent' && "text-green-400",
              wellbeing.status === 'good' && "text-blue-400",
              wellbeing.status === 'fair' && "text-yellow-400",
              wellbeing.status === 'poor' && "text-orange-400",
              wellbeing.status === 'critical' && "text-red-400"
            )}>
              {wellbeing.averageScore}/100 ({wellbeing.status})
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                wellbeing.status === 'excellent' && "bg-green-500",
                wellbeing.status === 'good' && "bg-blue-500",
                wellbeing.status === 'fair' && "bg-yellow-500",
                wellbeing.status === 'poor' && "bg-orange-500",
                wellbeing.status === 'critical' && "bg-red-500"
              )}
              style={{ width: `${wellbeing.averageScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Needs by Category */}
      <div className={cn("space-y-4", compact && "space-y-2")}>
        {/* Physiological Needs */}
        <div>
          <h4 className={cn("text-sm font-medium text-muted-foreground mb-2", compact && "text-xs")}>
            Physiological Needs
          </h4>
          <div className={cn("grid gap-3", compact ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3")}>
            {renderNeedBar('hunger', needs.hunger)}
            {renderNeedBar('thirst', needs.thirst)}
            {renderNeedBar('rest', needs.rest)}
          </div>
        </div>

        {/* Safety Needs */}
        <div>
          <h4 className={cn("text-sm font-medium text-muted-foreground mb-2", compact && "text-xs")}>
            Safety & Security
          </h4>
          <div className="grid grid-cols-1">
            {renderNeedBar('safety', needs.safety)}
          </div>
        </div>

        {/* Social Needs */}
        <div>
          <h4 className={cn("text-sm font-medium text-muted-foreground mb-2", compact && "text-xs")}>
            Love & Belonging
          </h4>
          <div className="grid grid-cols-1">
            {renderNeedBar('social', needs.social)}
          </div>
        </div>

        {/* Esteem Needs */}
        <div>
          <h4 className={cn("text-sm font-medium text-muted-foreground mb-2", compact && "text-xs")}>
            Esteem & Recognition
          </h4>
          <div className="grid grid-cols-1">
            {renderNeedBar('esteem', needs.esteem)}
          </div>
        </div>

        {/* Self-Actualization */}
        <div>
          <h4 className={cn("text-sm font-medium text-muted-foreground mb-2", compact && "text-xs")}>
            Self-Actualization
          </h4>
          <div className="grid grid-cols-1">
            {renderNeedBar('selfActualization', needs.selfActualization)}
          </div>
        </div>
      </div>

      {/* Last Updated */}
      {!compact && (
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {new Date(needs.lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};