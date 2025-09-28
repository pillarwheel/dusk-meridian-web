import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  MapPin,
  Target,
  Clock,
  Activity,
  TrendingUp,
  Pause,
  Play,
  BarChart3,
  Eye
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  settlementTestService,
  CharacterInfo,
  ActivitySummary
} from '@/services/settlementTestService';

interface CharacterVisualizationProps {
  className?: string;
}

interface CharacterDisplayInfo extends CharacterInfo {
  displayX: number;
  displayY: number;
}

const BUILDING_POSITIONS = {
  'Town Hall': { x: 50, y: 50, color: 'bg-yellow-500' },
  'General Store': { x: 30, y: 70, color: 'bg-blue-500' },
  'Blacksmith': { x: 70, y: 30, color: 'bg-orange-500' },
  'Farmhouse': { x: 20, y: 90, color: 'bg-green-500' },
  'Church': { x: 80, y: 60, color: 'bg-purple-500' },
  'Barn': { x: 10, y: 80, color: 'bg-amber-600' },
  'Workshop': { x: 60, y: 40, color: 'bg-cyan-500' },
  'Well': { x: 45, y: 65, color: 'bg-blue-300' },
  'Shrine': { x: 85, y: 75, color: 'bg-violet-500' },
  'Fishery': { x: 90, y: 20, color: 'bg-teal-500' },
  'Granary': { x: 25, y: 85, color: 'bg-yellow-600' },
  'Tailor Shop': { x: 35, y: 45, color: 'bg-pink-500' },
  'Brewery': { x: 65, y: 80, color: 'bg-amber-500' }
};

export const CharacterVisualization: React.FC<CharacterVisualizationProps> = ({ className }) => {
  const [characters, setCharacters] = useState<CharacterDisplayInfo[]>([]);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [isAnimating, setIsAnimating] = useState(true);
  const [hoveredCharacter, setHoveredCharacter] = useState<CharacterDisplayInfo | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Character role colors
  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Blacksmith': 'bg-orange-400',
      'Farmer': 'bg-green-400',
      'Merchant': 'bg-yellow-400',
      'Religious': 'bg-purple-400',
      'Fisher': 'bg-blue-400',
      'Crafter': 'bg-cyan-400',
      'Worker': 'bg-gray-400'
    };
    return colors[role] || 'bg-white';
  };

  // Convert real coordinates to display coordinates
  const normalizePosition = (x: number, y: number) => {
    // Assuming the settlement is roughly 100x100 units, normalize to 0-100%
    return {
      displayX: Math.max(5, Math.min(95, (x / 100) * 90 + 5)),
      displayY: Math.max(5, Math.min(95, (y / 100) * 90 + 5))
    };
  };

  // Load sample character data (in a real app, this would come from the API)
  const loadCharacterData = useCallback(async () => {
    try {
      const summary = await settlementTestService.getActivitySummary();
      setActivitySummary(summary);

      // Generate sample character positions for visualization
      // In a real implementation, you would fetch actual character positions
      const sampleCharacters: CharacterDisplayInfo[] = [];
      const roles = ['Blacksmith', 'Farmer', 'Merchant', 'Religious', 'Fisher', 'Crafter', 'Worker'];

      for (let i = 0; i < 50; i++) { // Show a sample of 50 characters for visualization
        const role = roles[i % roles.length];
        const baseX = Math.random() * 80 + 10;
        const baseY = Math.random() * 80 + 10;
        const { displayX, displayY } = normalizePosition(baseX, baseY);

        sampleCharacters.push({
          id: `char_${i}`,
          name: `Character ${i + 1}`,
          role,
          currentPosition: { x: baseX, y: baseY },
          displayX,
          displayY,
          currentActivity: ['Working', 'Moving', 'Resting', 'Socializing'][Math.floor(Math.random() * 4)],
          targetBuilding: Math.random() > 0.5 ? Object.keys(BUILDING_POSITIONS)[Math.floor(Math.random() * Object.keys(BUILDING_POSITIONS).length)] : undefined,
          actionQueueLength: Math.floor(Math.random() * 5),
          needs: {
            hunger: Math.random() * 100,
            thirst: Math.random() * 100,
            energy: Math.random() * 100,
            social: Math.random() * 100
          },
          lastActionTime: new Date().toISOString()
        });
      }

      setCharacters(sampleCharacters);
    } catch (error) {
      console.error('Failed to load character data:', error);
    }
  }, []);

  // Animate character movement
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setCharacters(prev => prev.map(char => ({
        ...char,
        displayX: Math.max(5, Math.min(95, char.displayX + (Math.random() - 0.5) * 2)),
        displayY: Math.max(5, Math.min(95, char.displayY + (Math.random() - 0.5) * 2))
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnimating]);

  // Initialize
  useEffect(() => {
    loadCharacterData();
    const interval = setInterval(loadCharacterData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [loadCharacterData]);

  const filteredCharacters = selectedRole === 'All'
    ? characters
    : characters.filter(char => char.role === selectedRole);

  const uniqueRoles = ['All', ...Array.from(new Set(characters.map(char => char.role)))];

  const getActivityColor = (activity: string) => {
    const colors: Record<string, string> = {
      'Working': 'border-green-400',
      'Moving': 'border-blue-400',
      'Resting': 'border-yellow-400',
      'Socializing': 'border-purple-400'
    };
    return colors[activity] || 'border-gray-400';
  };

  return (
    <div className={cn("bg-card rounded-lg border border-border p-6 h-full flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Eye className="w-6 h-6" />
            <span>Character Visualization</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Real-time character positions and activities in Settlement 21
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('overview')}
              className={cn(
                "px-3 py-1 rounded text-xs transition-colors",
                viewMode === 'overview'
                  ? "bg-blue-600/20 border border-blue-600 text-blue-400"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={cn(
                "px-3 py-1 rounded text-xs transition-colors",
                viewMode === 'detailed'
                  ? "bg-blue-600/20 border border-blue-600 text-blue-400"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              Detailed
            </button>
          </div>

          {/* Animation Toggle */}
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={cn(
              "flex items-center space-x-1 px-3 py-2 rounded transition-colors text-xs",
              isAnimating
                ? "bg-green-600/20 border border-green-600 text-green-400"
                : "bg-gray-600/20 border border-gray-600 text-gray-400"
            )}
          >
            {isAnimating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isAnimating ? 'Pause' : 'Play'}</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Filter by role:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-background border border-border rounded px-2 py-1 text-xs"
          >
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        <div className="text-xs text-muted-foreground">
          Showing {filteredCharacters.length} characters
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex space-x-6">
        {/* Visualization */}
        <div className="flex-1 relative">
          <div className="w-full h-full bg-slate-900 rounded-lg relative overflow-hidden">
            {/* Grid */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Buildings */}
            {Object.entries(BUILDING_POSITIONS).map(([name, { x, y, color }]) => (
              <div
                key={name}
                className={cn("absolute w-4 h-4 rounded-sm border-2 border-white/50", color)}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={name}
              />
            ))}

            {/* Characters */}
            {filteredCharacters.map((character) => (
              <div
                key={character.id}
                className={cn(
                  "absolute w-2 h-2 rounded-full border transition-all duration-500 cursor-pointer hover:scale-150",
                  getRoleColor(character.role),
                  getActivityColor(character.currentActivity)
                )}
                style={{
                  left: `${character.displayX}%`,
                  top: `${character.displayY}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: hoveredCharacter?.id === character.id ? 10 : 1
                }}
                onMouseEnter={() => setHoveredCharacter(character)}
                onMouseLeave={() => setHoveredCharacter(null)}
                title={`${character.name} (${character.role})`}
              />
            ))}

            {/* Character Info Tooltip */}
            {hoveredCharacter && (
              <div
                className="absolute bg-card border border-border rounded p-2 text-xs pointer-events-none z-20"
                style={{
                  left: `${hoveredCharacter.displayX}%`,
                  top: `${hoveredCharacter.displayY - 10}%`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <div className="font-semibold">{hoveredCharacter.name}</div>
                <div className="text-muted-foreground">{hoveredCharacter.role}</div>
                <div className="text-muted-foreground">{hoveredCharacter.currentActivity}</div>
                {hoveredCharacter.targetBuilding && (
                  <div className="text-blue-400">→ {hoveredCharacter.targetBuilding}</div>
                )}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            {uniqueRoles.slice(1).map(role => (
              <div key={role} className="flex items-center space-x-2">
                <div className={cn("w-3 h-3 rounded-full", getRoleColor(role))} />
                <span className="text-xs text-muted-foreground">{role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Panel */}
        <div className="w-80 space-y-4">
          {/* Activity Stats */}
          <div className="bg-background rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Activity Breakdown</span>
            </h3>
            <div className="space-y-2">
              {['Working', 'Moving', 'Resting', 'Socializing'].map(activity => {
                const count = characters.filter(char => char.currentActivity === activity).length;
                const percentage = characters.length > 0 ? (count / characters.length) * 100 : 0;
                return (
                  <div key={activity} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{activity}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-secondary rounded-full h-1">
                        <div
                          className="bg-blue-500 h-1 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Building Activity */}
          {activitySummary?.buildingInteractions && (
            <div className="bg-background rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Building Interactions</span>
              </h3>
              <div className="space-y-2">
                {Object.entries(activitySummary.buildingInteractions)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 6)
                  .map(([building, count]) => (
                  <div key={building} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground truncate">{building}</span>
                    <span className="text-xs font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Character Needs (if detailed view) */}
          {viewMode === 'detailed' && hoveredCharacter && (
            <div className="bg-background rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold mb-3">Character Needs</h3>
              <div className="space-y-2">
                {Object.entries(hoveredCharacter.needs).map(([need, value]) => (
                  <div key={need} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground capitalize">{need}</span>
                      <span>{Math.round(value)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1">
                      <div
                        className={cn(
                          "h-1 rounded-full",
                          value > 70 ? "bg-green-500" : value > 40 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};