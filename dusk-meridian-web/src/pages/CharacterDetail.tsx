import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  ArrowLeft,
  Heart,
  Shield,
  Sword,
  Zap,
  Crown,
  Target,
  MapPin,
  Clock,
  Activity,
  Settings,
  Edit,
  Trash2,
  Plus,
  Play,
  Pause,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Eye,
  ShoppingBag,
  Users,
  Hammer,
  Book,
  Coins
} from 'lucide-react';
import { useIMXAuth } from '@/contexts/IMXAuthContext';
import { characterApi } from '@/api/endpoints/character';
import * as CharacterTypes from '@/api/types/character';
import { CharacterNeedsWidget } from '@/components/character/CharacterNeedsWidget';
import { cn } from '@/utils/cn';

interface Action {
  id: string;
  type: string;
  description: string;
  progress: number;
  timeRemaining: number;
  priority: number;
  status: 'queued' | 'active' | 'paused' | 'completed' | 'failed';
}

export const CharacterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, walletAddress } = useIMXAuth();

  const [character, setCharacter] = useState<CharacterTypes.Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionQueue, setActionQueue] = useState<Action[]>([]);
  const [currentAction, setCurrentAction] = useState<Action | null>(null);
  const [newActionType, setNewActionType] = useState('');
  const [newActionDescription, setNewActionDescription] = useState('');

  useEffect(() => {
    if (id) {
      loadCharacterDetails();
      loadActionQueue();
    }
  }, [id]);

  const loadCharacterDetails = async () => {
    if (!id) {
      setError('No character ID provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Loading character details for ID:', id);

      // Use the improved getCharacter method
      const foundCharacter = await characterApi.getCharacter(id);
      console.log('✅ Character API response:', foundCharacter);

      if (foundCharacter) {
        setCharacter(foundCharacter);
      } else {
        console.error('❌ Character not found for ID:', id);
        setError(`Character not found (ID: ${id})`);
      }
    } catch (err) {
      console.error('Failed to load character:', err);
      setError('Failed to load character details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadActionQueue = async () => {
    // Mock action queue - replace with API call
    setActionQueue([
      {
        id: '1',
        type: 'travel',
        description: 'Travel to settlement Alpha',
        progress: 65,
        timeRemaining: 120,
        priority: 1,
        status: 'active'
      },
      {
        id: '2',
        type: 'craft',
        description: 'Craft iron sword',
        progress: 0,
        timeRemaining: 300,
        priority: 2,
        status: 'queued'
      },
      {
        id: '3',
        type: 'trade',
        description: 'Sell items at market',
        progress: 0,
        timeRemaining: 60,
        priority: 3,
        status: 'queued'
      }
    ]);

    setCurrentAction({
      id: '1',
      type: 'travel',
      description: 'Travel to settlement Alpha',
      progress: 65,
      timeRemaining: 120,
      priority: 1,
      status: 'active'
    });
  };

  const getClassIcon = (characterClass: string) => {
    switch (characterClass) {
      case 'Guardian': return Shield;
      case 'Striker': return Sword;
      case 'Specialist': return Target;
      case 'Coordinator': return Crown;
      default: return User;
    }
  };

  const addAction = () => {
    if (!newActionType || !newActionDescription) return;

    const newAction: Action = {
      id: Date.now().toString(),
      type: newActionType,
      description: newActionDescription,
      progress: 0,
      timeRemaining: 180,
      priority: actionQueue.length + 1,
      status: 'queued'
    };

    setActionQueue([...actionQueue, newAction]);
    setNewActionType('');
    setNewActionDescription('');
  };

  const removeAction = (actionId: string) => {
    setActionQueue(actionQueue.filter(a => a.id !== actionId));
  };

  const moveAction = (actionId: string, direction: 'up' | 'down') => {
    const currentIndex = actionQueue.findIndex(a => a.id === actionId);
    if (currentIndex === -1) return;

    const newQueue = [...actionQueue];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < newQueue.length) {
      [newQueue[currentIndex], newQueue[targetIndex]] = [newQueue[targetIndex], newQueue[currentIndex]];
      setActionQueue(newQueue);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading character details...</p>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-lg flex items-center justify-center">
            <User className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Character Not Found</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => navigate('/character')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Characters
          </button>
        </div>
      </div>
    );
  }

  const ClassIcon = getClassIcon(character.class);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/character')}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <ClassIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{character.name}</h1>
              <p className="text-muted-foreground">
                Level {character.level} {character.class}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition-colors text-sm">
            <Eye className="w-4 h-4 mr-2 inline" />
            View Details
          </button>
          <button className="px-3 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 transition-colors text-sm">
            <MapPin className="w-4 h-4 mr-2 inline" />
            Teleport
          </button>
          <button className="px-3 py-2 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 transition-colors text-sm">
            <Activity className="w-4 h-4 mr-2 inline" />
            Issue Commands
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Character Info & Stats */}
        <div className="xl:col-span-2 space-y-6">
          {/* Character Stats */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Character Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Health</span>
                  <span>{character.health}/{character.maxHealth}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${((character.health || 0) / (character.maxHealth || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mana</span>
                  <span>{character.mana}/{character.maxMana}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${((character.mana || 0) / (character.maxMana || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Experience</span>
                  <span>{character.experience} XP</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ width: `${((character.experience || 0) % 1000) / 10}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <span className="capitalize">{character.status?.replace('_', ' ') || 'Unknown'}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Level {character.level} {character.class}
                </div>
              </div>
            </div>
          </div>

          {/* Current Action */}
          {currentAction && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h3 className="text-lg font-semibold mb-4">Current Action</h3>
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium capitalize">{currentAction.type}</h4>
                      <p className="text-sm text-muted-foreground">{currentAction.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-primary/20 rounded">
                      <Pause className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-primary/20 rounded">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{currentAction.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${currentAction.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Time remaining: {formatTime(currentAction.timeRemaining)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Queue */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Action Queue</h3>
              <span className="text-sm text-muted-foreground">
                {actionQueue.length} action{actionQueue.length !== 1 ? 's' : ''} queued
              </span>
            </div>

            {/* Add New Action */}
            <div className="bg-secondary/50 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-3">Add New Action</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={newActionType}
                  onChange={(e) => setNewActionType(e.target.value)}
                  className="px-3 py-2 bg-background border border-border rounded-lg"
                >
                  <option value="">Select action type</option>
                  <option value="travel">Travel</option>
                  <option value="craft">Craft</option>
                  <option value="trade">Trade</option>
                  <option value="rest">Rest</option>
                  <option value="gather">Gather Resources</option>
                  <option value="combat">Combat Training</option>
                </select>
                <input
                  type="text"
                  value={newActionDescription}
                  onChange={(e) => setNewActionDescription(e.target.value)}
                  placeholder="Action description"
                  className="px-3 py-2 bg-background border border-border rounded-lg"
                />
                <button
                  onClick={addAction}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Action
                </button>
              </div>
            </div>

            {/* Queue List */}
            <div className="space-y-2">
              {actionQueue.map((action, index) => (
                <div
                  key={action.id}
                  className={cn(
                    "border rounded-lg p-4 transition-all",
                    action.status === 'active' ? 'border-primary bg-primary/5' : 'border-border bg-background/50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-mono text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium capitalize">{action.type}</h4>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(action.timeRemaining)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => moveAction(action.id, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-secondary rounded disabled:opacity-50"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveAction(action.id, 'down')}
                          disabled={index === actionQueue.length - 1}
                          className="p-1 hover:bg-secondary rounded disabled:opacity-50"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeAction(action.id)}
                          className="p-1 hover:bg-red-600/20 text-red-400 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {action.status === 'active' && (
                    <div className="mt-3">
                      <div className="w-full bg-secondary rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${action.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {actionQueue.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No actions in queue</p>
                </div>
              )}
            </div>
          </div>

          {/* Position & Location */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Position & Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">World Position</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">World ID:</span>
                    <span>{character.position?.worldId || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coordinates:</span>
                    <span>
                      ({character.position?.x || 0}, {character.position?.y || 0}, {character.position?.z || 0})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Region:</span>
                    <span>Northern Plains</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Settlement</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Settlement:</span>
                    <span>Ironhaven</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Settlement Rank:</span>
                    <span>Town</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Population:</span>
                    <span>1,247</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Character Needs */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <CharacterNeedsWidget
              characterId={parseInt(id || '1')}
              showActions={true}
              compact={false}
            />
          </div>

          {/* Character Details */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Character Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Character ID:</span>
                <span className="font-mono">{character.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>Unknown</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Active:</span>
                <span>
                  {character.lastActive ? new Date(character.lastActive).toLocaleString() : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Playtime:</span>
                <span>Unknown</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};