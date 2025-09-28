import React, { useState, useEffect } from 'react';
import { Brain, Star, BookOpen, Zap, Clock, TrendingUp, Award, Target } from 'lucide-react';
import { unityApi } from '@/api/endpoints/unity-simple';
import { cn } from '@/utils/cn';

// Inline types to avoid import issues
interface SpellcasterStats {
  characterId: number;
  currentStep: string;
  experiencePoints: number;
  level: number;
  completedCycles: number;
  timeInCurrentStep: number;
  canAdvance: boolean;
  availableSpells: string[];
  masteredSpells: string[];
  nextStepRequirements: Record<string, any>;
}

interface SpellcasterProgressWidgetProps {
  characterId: number;
  autoRefresh?: boolean;
  compact?: boolean;
  className?: string;
}

enum SpellcasterStep {
  Meditation = 'Meditation',
  GatherReagents = 'GatherReagents',
  PrepareComponents = 'PrepareComponents',
  CastSpell = 'CastSpell',
  StudyResults = 'StudyResults'
}

const stepIcons = {
  'Meditation': Brain,
  'GatherReagents': Target,
  'PrepareComponents': BookOpen,
  'CastSpell': Zap,
  'StudyResults': Star
};

const stepDescriptions = {
  'Meditation': 'Centering mind and focusing magical energy',
  'GatherReagents': 'Collecting magical components and materials',
  'PrepareComponents': 'Preparing reagents and setting up ritual space',
  'CastSpell': 'Actively casting the spell with focused will',
  'StudyResults': 'Analyzing outcomes and integrating knowledge'
};

const stepColors = {
  'Meditation': 'text-purple-400 bg-purple-600/20 border-purple-600/30',
  'GatherReagents': 'text-green-400 bg-green-600/20 border-green-600/30',
  'PrepareComponents': 'text-blue-400 bg-blue-600/20 border-blue-600/30',
  'CastSpell': 'text-yellow-400 bg-yellow-600/20 border-yellow-600/30',
  'StudyResults': 'text-cyan-400 bg-cyan-600/20 border-cyan-600/30'
};

export const SpellcasterProgressWidget: React.FC<SpellcasterProgressWidgetProps> = ({
  characterId,
  autoRefresh = true,
  compact = false,
  className
}) => {
  const [stats, setStats] = useState<SpellcasterStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSpellcasterStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const spellcasterStats = await unityApi.getSpellcasterStats(characterId);
      setStats(spellcasterStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch spellcaster stats');
    } finally {
      setIsLoading(false);
    }
  };

  const startSpellcasterLoop = async () => {
    try {
      await unityApi.startSpellcasterLoop(characterId);
      await fetchSpellcasterStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start spellcaster loop');
    }
  };

  const getStepProgress = () => {
    if (!stats) return [];

    const steps = Object.values(SpellcasterStep);
    const currentIndex = steps.indexOf(stats.currentStep);

    return steps.map((step, index) => ({
      step,
      completed: index < currentIndex,
      current: index === currentIndex,
      upcoming: index > currentIndex
    }));
  };

  const getExperienceToNextLevel = () => {
    if (!stats) return 0;
    // Rough calculation - in real implementation this would come from the API
    const baseXP = 1000;
    const nextLevelXP = baseXP * Math.pow(1.5, stats.level);
    const currentLevelXP = baseXP * Math.pow(1.5, stats.level - 1);
    return nextLevelXP - stats.experiencePoints;
  };

  const getExperienceProgress = () => {
    if (!stats) return 0;
    const baseXP = 1000;
    const currentLevelXP = baseXP * Math.pow(1.5, stats.level - 1);
    const nextLevelXP = baseXP * Math.pow(1.5, stats.level);
    const progress = (stats.experiencePoints - currentLevelXP) / (nextLevelXP - currentLevelXP);
    return Math.max(0, Math.min(100, progress * 100));
  };

  useEffect(() => {
    fetchSpellcasterStats();

    if (autoRefresh) {
      const interval = setInterval(fetchSpellcasterStats, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [characterId, autoRefresh]);

  if (error && !stats) {
    return (
      <div className={cn("bg-red-600/20 border border-red-600/30 text-red-400 p-4 rounded-lg", className)}>
        <div className="flex items-center space-x-2 mb-2">
          <Brain className="w-4 h-4" />
          <span className="font-medium">Spellcaster Error</span>
        </div>
        <p className="text-sm mb-3">{error}</p>
        <button
          onClick={fetchSpellcasterStats}
          className="text-xs bg-red-600/30 px-3 py-1 rounded border border-red-600/50 hover:bg-red-600/40 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={cn("bg-background/50 border border-border rounded-lg p-4", className)}>
        <div className="text-center">
          <Brain className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Character is not a spellcaster</p>
          <button
            onClick={startSpellcasterLoop}
            className="mt-3 bg-purple-600/20 text-purple-400 px-4 py-2 rounded border border-purple-600/30 hover:bg-purple-600/30 transition-colors text-sm"
          >
            Begin Spellcasting Journey
          </button>
        </div>
      </div>
    );
  }

  const stepProgress = getStepProgress();
  const experienceProgress = getExperienceProgress();
  const experienceToNext = getExperienceToNextLevel();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <h3 className={cn("font-semibold", compact ? "text-sm" : "text-lg")}>
            Spellcaster Progress
          </h3>
          {stats.canAdvance && (
            <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
              Can Advance
            </span>
          )}
        </div>

        <button
          onClick={fetchSpellcasterStats}
          disabled={isLoading}
          className="text-xs bg-secondary px-3 py-1 rounded border border-border hover:bg-secondary/80 transition-colors"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-background/50 p-3 rounded-lg text-center">
          <p className={cn("font-bold", compact ? "text-lg" : "text-2xl")}>
            {stats.level}
          </p>
          <p className="text-xs text-muted-foreground">Level</p>
        </div>

        <div className="bg-background/50 p-3 rounded-lg text-center">
          <p className={cn("font-bold", compact ? "text-lg" : "text-2xl")}>
            {stats.experiencePoints.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Experience</p>
        </div>

        <div className="bg-background/50 p-3 rounded-lg text-center">
          <p className={cn("font-bold", compact ? "text-lg" : "text-2xl")}>
            {stats.completedCycles}
          </p>
          <p className="text-xs text-muted-foreground">Cycles</p>
        </div>

        <div className="bg-background/50 p-3 rounded-lg text-center">
          <p className={cn("font-bold", compact ? "text-lg" : "text-2xl")}>
            {Math.floor(stats.timeInCurrentStep)}s
          </p>
          <p className="text-xs text-muted-foreground">Current Step</p>
        </div>
      </div>

      {/* Experience Progress */}
      {!compact && (
        <div className="bg-background/30 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Level Progress</span>
            <span className="text-xs text-muted-foreground">
              {experienceToNext.toLocaleString()} XP to next level
            </span>
          </div>
          <div className="w-full bg-border rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${experienceProgress}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-right mt-1">
            {experienceProgress.toFixed(1)}%
          </div>
        </div>
      )}

      {/* Current Step */}
      <div className={cn(
        "p-4 rounded-lg border",
        stepColors[stats.currentStep]
      )}>
        <div className="flex items-center space-x-3 mb-2">
          {React.createElement(stepIcons[stats.currentStep], { className: "w-5 h-5" })}
          <div>
            <h4 className="font-semibold">{stats.currentStep}</h4>
            <p className="text-xs opacity-90">
              {stepDescriptions[stats.currentStep]}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Clock className="w-3 h-3" />
          <span>Time in step: {Math.floor(stats.timeInCurrentStep)}s</span>
        </div>
      </div>

      {/* Step Progress Chain */}
      {!compact && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Spellcasting Cycle</h4>
          <div className="flex items-center justify-between">
            {stepProgress.map((step, index) => {
              const Icon = stepIcons[step.step];
              return (
                <div key={step.step} className="flex flex-col items-center space-y-1">
                  <div className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                    step.completed && "bg-green-600/20 border-green-600 text-green-400",
                    step.current && "bg-yellow-600/20 border-yellow-600 text-yellow-400 ring-2 ring-yellow-600/50",
                    step.upcoming && "bg-gray-600/20 border-gray-600 text-gray-400"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={cn(
                    "text-xs text-center leading-tight",
                    step.current && "font-medium"
                  )}>
                    {step.step.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  {index < stepProgress.length - 1 && (
                    <div className={cn(
                      "absolute w-8 h-0.5 mt-5 ml-10",
                      step.completed ? "bg-green-600" : "bg-gray-600"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Spells */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Available Spells */}
        <div className="bg-background/30 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Available Spells ({stats.availableSpells.length})</span>
          </h4>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {stats.availableSpells.length > 0 ? (
              stats.availableSpells.map((spell, index) => (
                <div key={index} className="text-xs bg-background/50 px-2 py-1 rounded">
                  {spell}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No spells available</p>
            )}
          </div>
        </div>

        {/* Mastered Spells */}
        <div className="bg-background/30 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Mastered Spells ({stats.masteredSpells.length})</span>
          </h4>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {stats.masteredSpells.length > 0 ? (
              stats.masteredSpells.map((spell, index) => (
                <div key={index} className="text-xs bg-gradient-to-r from-purple-600/20 to-cyan-600/20 px-2 py-1 rounded">
                  {spell}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No spells mastered yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Advancement Requirements */}
      {stats.nextStepRequirements && Object.keys(stats.nextStepRequirements).length > 0 && !compact && (
        <div className="bg-background/30 p-3 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Next Step Requirements</span>
          </h4>
          <div className="space-y-1">
            {Object.entries(stats.nextStepRequirements).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{key}:</span>
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-600/20 border border-red-600/30 text-red-400 p-3 rounded-lg">
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  );
};