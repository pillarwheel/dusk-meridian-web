import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock, AlertTriangle, Activity, User, Heart, Brain } from 'lucide-react';
import { unityApi } from '@/api/endpoints/unity-simple';
import { cn } from '@/utils/cn';

// Inline types to avoid import issues
interface EnhancedActionQueueDto {
  queueId: number;
  characterId: number;
  actionName: string;
  actionDescription: string;
  targetId?: number;
  targetName?: string;
  priority: number;
  queuedAt: Date;
  startTime?: Date;
  estimatedCompletion?: Date;
  duration: number;
  status: string;
  needCategory: string;
  progressPercentage: number;
  isPlayerInitiated: boolean;
  canBeCancelled: boolean;
  actionType: string;
  requirements: Record<string, any>;
  effects: Record<string, any>;
}

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

export const UnityActionQueueExample: React.FC = () => {
  const [characterId, setCharacterId] = useState<number>(1);
  const [actions, setActions] = useState<EnhancedActionQueueDto[]>([]);
  const [needs, setNeeds] = useState<CharacterNeeds | null>(null);
  const [spellcaster, setSpellcaster] = useState<SpellcasterStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacterData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fullStatus = await unityApi.getCharacterFullStatus(characterId);
      setActions(fullStatus.actions);
      setNeeds(fullStatus.needs);
      setSpellcaster(fullStatus.spellcaster || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch character data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueueAction = async (actionType: 'gather' | 'craft' | 'rest' | 'socialize') => {
    try {
      const actionMap = {
        gather: { name: 'Gather Resources', category: 'Physiological', type: 'gathering' },
        craft: { name: 'Craft Item', category: 'Esteem', type: 'crafting' },
        rest: { name: 'Rest', category: 'Physiological', type: 'survival' },
        socialize: { name: 'Socialize', category: 'Love', type: 'social' }
      };

      const action = actionMap[actionType];
      await unityApi.queueAction(characterId, {
        actionName: action.name,
        actionDescription: `${action.name} to fulfill ${action.category} needs`,
        needCategory: action.category,
        actionType: action.type,
        priority: 3
      });

      await fetchCharacterData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to queue action');
    }
  };

  const handleActionControl = async (queueId: number, action: 'start' | 'complete' | 'cancel') => {
    try {
      switch (action) {
        case 'start':
          await unityApi.startAction(characterId, queueId);
          break;
        case 'complete':
          await unityApi.completeAction(characterId, queueId);
          break;
        case 'cancel':
          await unityApi.cancelAction(characterId, queueId);
          break;
      }
      await fetchCharacterData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to control action');
    }
  };

  const handleEmergencyCheck = async () => {
    try {
      const result = await unityApi.emergencyNeedsCheck(characterId);
      setNeeds(result.needs);
      if (result.criticalNeeds.length > 0) {
        setError(`Critical needs detected: ${result.criticalNeeds.join(', ')}. Queued ${result.actionsQueued.length} emergency actions.`);
      }
      await fetchCharacterData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform emergency check');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Queued': return 'text-blue-400';
      case 'InProgress': return 'text-yellow-400';
      case 'Completed': return 'text-green-400';
      case 'Cancelled': return 'text-gray-400';
      case 'Failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'bg-red-600/20 text-red-400'; // Emergency
      case 2: return 'bg-orange-600/20 text-orange-400'; // High
      case 3: return 'bg-blue-600/20 text-blue-400'; // Normal
      case 4: return 'bg-gray-600/20 text-gray-400'; // Low
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getNeedColor = (value: number) => {
    if (value < 15) return 'text-red-400';
    if (value < 30) return 'text-orange-400';
    if (value < 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  useEffect(() => {
    fetchCharacterData();
  }, [characterId]);

  return (
    <div className="game-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Unity Action Queue System</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <input
              type="number"
              value={characterId}
              onChange={(e) => setCharacterId(Number(e.target.value))}
              className="w-20 px-2 py-1 bg-background border border-border rounded text-sm"
              min="1"
            />
          </div>
          <button
            onClick={fetchCharacterData}
            disabled={isLoading}
            className="game-button-secondary text-sm"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={handleEmergencyCheck}
            className="bg-red-600/20 text-red-400 px-3 py-1 rounded border border-red-600/30 hover:bg-red-600/30 transition-colors text-sm"
          >
            Emergency Check
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-600/20 border border-red-600/30 text-red-400 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Character Needs */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span>Character Needs (Maslow's Hierarchy)</span>
          </h4>

          {needs ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Hunger</span>
                    <span className={`font-bold ${getNeedColor(needs.hunger)}`}>
                      {needs.hunger}/100
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${needs.hunger < 15 ? 'bg-red-500' : needs.hunger < 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${needs.hunger}%` }}
                    />
                  </div>
                </div>

                <div className="bg-background/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Thirst</span>
                    <span className={`font-bold ${getNeedColor(needs.thirst)}`}>
                      {needs.thirst}/100
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${needs.thirst < 15 ? 'bg-red-500' : needs.thirst < 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${needs.thirst}%` }}
                    />
                  </div>
                </div>

                <div className="bg-background/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rest</span>
                    <span className={`font-bold ${getNeedColor(needs.rest)}`}>
                      {needs.rest}/100
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${needs.rest < 15 ? 'bg-red-500' : needs.rest < 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${needs.rest}%` }}
                    />
                  </div>
                </div>

                <div className="bg-background/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Safety</span>
                    <span className={`font-bold ${getNeedColor(needs.safety)}`}>
                      {needs.safety}/100
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${needs.safety < 15 ? 'bg-red-500' : needs.safety < 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${needs.safety}%` }}
                    />
                  </div>
                </div>

                <div className="bg-background/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Social</span>
                    <span className={`font-bold ${getNeedColor(needs.social)}`}>
                      {needs.social}/100
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${needs.social < 15 ? 'bg-red-500' : needs.social < 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${needs.social}%` }}
                    />
                  </div>
                </div>

                <div className="bg-background/50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Esteem</span>
                    <span className={`font-bold ${getNeedColor(needs.esteem)}`}>
                      {needs.esteem}/100
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${needs.esteem < 15 ? 'bg-red-500' : needs.esteem < 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${needs.esteem}%` }}
                    />
                  </div>
                </div>

                <div className="bg-background/50 p-3 rounded-lg col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Self-Actualization</span>
                    <span className={`font-bold ${getNeedColor(needs.selfActualization)}`}>
                      {needs.selfActualization}/100
                    </span>
                  </div>
                  <div className="w-full bg-border rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full ${needs.selfActualization < 15 ? 'bg-red-500' : needs.selfActualization < 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${needs.selfActualization}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleQueueAction('gather')}
                  className="flex-1 bg-green-600/20 text-green-400 px-3 py-2 rounded border border-green-600/30 hover:bg-green-600/30 transition-colors text-sm"
                >
                  Queue Gather
                </button>
                <button
                  onClick={() => handleQueueAction('rest')}
                  className="flex-1 bg-blue-600/20 text-blue-400 px-3 py-2 rounded border border-blue-600/30 hover:bg-blue-600/30 transition-colors text-sm"
                >
                  Queue Rest
                </button>
                <button
                  onClick={() => handleQueueAction('socialize')}
                  className="flex-1 bg-purple-600/20 text-purple-400 px-3 py-2 rounded border border-purple-600/30 hover:bg-purple-600/30 transition-colors text-sm"
                >
                  Socialize
                </button>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">No character needs data available</div>
          )}

          {/* Spellcaster Status */}
          {spellcaster && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Spellcaster Progress</span>
              </h4>

              <div className="bg-background/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span>Current Step:</span>
                  <span className="font-bold text-purple-400">{spellcaster.currentStep}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Level:</span>
                  <span className="font-bold">{spellcaster.level}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Experience:</span>
                  <span className="font-bold">{spellcaster.experiencePoints} XP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Completed Cycles:</span>
                  <span className="font-bold">{spellcaster.completedCycles}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Can Advance:</span>
                  <span className={`font-bold ${spellcaster.canAdvance ? 'text-green-400' : 'text-red-400'}`}>
                    {spellcaster.canAdvance ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Queue */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Action Queue</span>
          </h4>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {actions.length > 0 ? actions.map((action) => (
              <div key={action.queueId} className="bg-background/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{action.actionName}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(action.priority)}`}>
                      Priority {action.priority}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(action.status)}`}>
                    {action.status}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-2">{action.actionDescription}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{action.duration}s</span>
                    <span>•</span>
                    <span>{action.needCategory}</span>
                    <span>•</span>
                    <span>{action.progressPercentage}%</span>
                  </div>

                  <div className="flex space-x-1">
                    {action.status === 'Queued' && (
                      <button
                        onClick={() => handleActionControl(action.queueId, 'start')}
                        className="p-1 text-green-400 hover:bg-green-600/20 rounded"
                        title="Start Action"
                      >
                        <Play className="w-3 h-3" />
                      </button>
                    )}
                    {action.status === 'InProgress' && (
                      <button
                        onClick={() => handleActionControl(action.queueId, 'complete')}
                        className="p-1 text-blue-400 hover:bg-blue-600/20 rounded"
                        title="Complete Action"
                      >
                        <Square className="w-3 h-3" />
                      </button>
                    )}
                    {action.canBeCancelled && (
                      <button
                        onClick={() => handleActionControl(action.queueId, 'cancel')}
                        className="p-1 text-red-400 hover:bg-red-600/20 rounded"
                        title="Cancel Action"
                      >
                        <Square className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-muted-foreground text-center py-8">
                No actions in queue
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};