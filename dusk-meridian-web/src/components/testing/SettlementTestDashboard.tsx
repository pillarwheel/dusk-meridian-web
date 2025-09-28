import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Users,
  Building,
  Activity,
  Clock,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  Settings,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { settlementTestService } from '@/services/settlementTestService';

// Inline type definitions to avoid export issues
interface SettlementOverview {
  settlementId: number;
  settlementName: string;
  totalCharacters: number;
  totalBuildings: number;
  charactersByRole: Record<string, number>;
  buildingTypes: string[];
  lastUpdateTime: string;
}

interface CharacterInfo {
  id: string;
  name: string;
  role: string;
  currentPosition: { x: number; y: number };
  currentActivity: string;
  targetBuilding?: string;
  actionQueueLength: number;
  needs: {
    hunger: number;
    thirst: number;
    energy: number;
    social: number;
  };
  lastActionTime: string;
}

interface ActivitySummary {
  timestamp: string;
  totalActiveCharacters: number;
  buildingInteractions: Record<string, number>;
  characterActivities: Record<string, number>;
  averageQueueLength: number;
  completedActionsLastHour: number;
}

interface ProcessBehaviorsResponse {
  success: boolean;
  processedCharacters: number;
  createdActions: number;
  processingTime: number;
  debugLog?: string[];
}

interface InteractionResponse {
  success: boolean;
  createdInteractions: number;
  affectedCharacters: string[];
  processingTime: number;
}

interface SettlementTestDashboardProps {
  className?: string;
}

export const SettlementTestDashboard: React.FC<SettlementTestDashboardProps> = ({ className }) => {
  // State management
  const [overview, setOverview] = useState<SettlementOverview | null>(null);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Settings state
  const [settings, setSettings] = useState({
    pollInterval: 5000,
    timeMultiplier: 1,
    batchSize: 25,
    autoRefresh: true
  });

  // Activity log
  const [activityLog, setActivityLog] = useState<string[]>([]);

  const addToLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActivityLog(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  }, []);

  // Load initial data
  const loadOverview = useCallback(async () => {
    try {
      setError(null);
      const data = await settlementTestService.getSettlementOverview();
      setOverview(data);
      setLastUpdate(new Date());
      addToLog(`Settlement overview loaded: ${data.totalCharacters} characters, ${data.totalBuildings} buildings`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load overview';
      setError(errorMsg);
      addToLog(`Error: ${errorMsg}`);
    }
  }, [addToLog]);

  const loadActivitySummary = useCallback(async () => {
    try {
      const data = await settlementTestService.getActivitySummary();
      setActivitySummary(data);
      return data;
    } catch (err) {
      console.error('Failed to load activity summary:', err);
      return null;
    }
  }, []);

  // Start/stop polling
  const startPolling = useCallback(() => {
    setIsPolling(true);
    addToLog(`Started real-time monitoring (${settings.pollInterval}ms interval)`);

    settlementTestService.pollActivitySummary((summary) => {
      setActivitySummary(summary);
      setLastUpdate(new Date());
    }, settings.pollInterval);
  }, [settings.pollInterval, addToLog]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    addToLog('Stopped real-time monitoring');
  }, [addToLog]);

  // Control actions
  const handleStartInteractions = async () => {
    setIsLoading(true);
    try {
      const response: InteractionResponse = await settlementTestService.startInteractions({
        maxInteractions: 100
      });
      addToLog(`Started interactions: ${response.createdInteractions} interactions created for ${response.affectedCharacters.length} characters`);
      await loadActivitySummary();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start interactions';
      setError(errorMsg);
      addToLog(`Error starting interactions: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessBehaviors = async () => {
    setIsLoading(true);
    try {
      const response: ProcessBehaviorsResponse = await settlementTestService.processBehaviors({
        timeMultiplier: settings.timeMultiplier,
        batchSize: settings.batchSize,
        includeDebugLog: true
      });
      addToLog(`Processed behaviors: ${response.processedCharacters} characters, ${response.createdActions} actions created (${response.processingTime}ms)`);
      await loadActivitySummary();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process behaviors';
      setError(errorMsg);
      addToLog(`Error processing behaviors: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset Settlement 21? This will clear all character actions.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await settlementTestService.resetSettlement();
      addToLog(`Settlement reset: ${response.message}`);
      await loadOverview();
      await loadActivitySummary();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reset settlement';
      setError(errorMsg);
      addToLog(`Error resetting settlement: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCharacter = async (characterId: string) => {
    try {
      const character = await settlementTestService.getCharacterDetails(characterId);
      setSelectedCharacter(character);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load character details';
      setError(errorMsg);
    }
  };

  // Initialize
  useEffect(() => {
    loadOverview();
    loadActivitySummary();
  }, [loadOverview, loadActivitySummary]);

  // Auto-refresh
  useEffect(() => {
    if (settings.autoRefresh && !isPolling) {
      const interval = setInterval(() => {
        loadActivitySummary();
      }, settings.pollInterval * 2);
      return () => clearInterval(interval);
    }
  }, [settings.autoRefresh, settings.pollInterval, isPolling, loadActivitySummary]);

  // Character role colors
  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Blacksmith': 'text-orange-400',
      'Farmer': 'text-green-400',
      'Merchant': 'text-yellow-400',
      'Religious': 'text-purple-400',
      'Fisher': 'text-blue-400',
      'Crafter': 'text-cyan-400',
      'Worker': 'text-gray-400'
    };
    return colors[role] || 'text-white';
  };

  return (
    <div className={cn("h-full flex flex-col space-y-6 p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settlement 21 Test Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and control the character action system with 601 characters across 14 buildings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          {error && (
            <div className="flex items-center space-x-1 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Control Panel</span>
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={isPolling ? stopPolling : startPolling}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm",
                isPolling
                  ? "bg-red-600/20 border border-red-600 text-red-400 hover:bg-red-600/30"
                  : "bg-green-600/20 border border-green-600 text-green-400 hover:bg-green-600/30"
              )}
            >
              {isPolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPolling ? 'Stop Monitoring' : 'Start Monitoring'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button
            onClick={handleStartInteractions}
            disabled={isLoading}
            className="game-button flex items-center justify-center space-x-2 py-3"
          >
            <Play className="w-4 h-4" />
            <span>Start Interactions</span>
          </button>

          <button
            onClick={handleProcessBehaviors}
            disabled={isLoading}
            className="game-button flex items-center justify-center space-x-2 py-3"
          >
            <Activity className="w-4 h-4" />
            <span>Process Behaviors</span>
          </button>

          <button
            onClick={loadOverview}
            disabled={isLoading}
            className="game-button-secondary flex items-center justify-center space-x-2 py-3"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={handleReset}
            disabled={isLoading}
            className="bg-red-600/20 border border-red-600 text-red-400 hover:bg-red-600/30 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Settlement</span>
          </button>
        </div>

        {/* Settings */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Poll Interval (ms)</label>
            <input
              type="number"
              value={settings.pollInterval}
              onChange={(e) => setSettings(prev => ({ ...prev, pollInterval: parseInt(e.target.value) || 5000 }))}
              className="w-full px-2 py-1 bg-background border border-border rounded text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Time Multiplier</label>
            <input
              type="number"
              value={settings.timeMultiplier}
              onChange={(e) => setSettings(prev => ({ ...prev, timeMultiplier: parseFloat(e.target.value) || 1 }))}
              className="w-full px-2 py-1 bg-background border border-border rounded text-xs"
              step="0.1"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Batch Size</label>
            <input
              type="number"
              value={settings.batchSize}
              onChange={(e) => setSettings(prev => ({ ...prev, batchSize: parseInt(e.target.value) || 25 }))}
              className="w-full px-2 py-1 bg-background border border-border rounded text-xs"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.autoRefresh}
              onChange={(e) => setSettings(prev => ({ ...prev, autoRefresh: e.target.checked }))}
              className="rounded"
            />
            <label className="text-xs text-muted-foreground">Auto Refresh</label>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Characters */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold">{overview?.totalCharacters || 0}</div>
              <div className="text-sm text-muted-foreground">Total Characters</div>
            </div>
          </div>
        </div>

        {/* Total Buildings */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <Building className="w-8 h-8 text-green-400" />
            <div>
              <div className="text-2xl font-bold">{overview?.totalBuildings || 0}</div>
              <div className="text-sm text-muted-foreground">Total Buildings</div>
            </div>
          </div>
        </div>

        {/* Active Characters */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-2xl font-bold">{activitySummary?.totalActiveCharacters || 0}</div>
              <div className="text-sm text-muted-foreground">Active Characters</div>
            </div>
          </div>
        </div>

        {/* Actions Completed */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold">{activitySummary?.completedActionsLastHour || 0}</div>
              <div className="text-sm text-muted-foreground">Actions/Hour</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Character Distribution */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Character Roles</span>
          </h3>
          <div className="space-y-3">
            {overview?.charactersByRole && Object.entries(overview.charactersByRole).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <span className={cn("text-sm font-medium", getRoleColor(role))}>{role}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-secondary rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${(count / (overview?.totalCharacters || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Building Activity */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Building Activity</span>
          </h3>
          <div className="space-y-2">
            {activitySummary?.buildingInteractions && Object.entries(activitySummary.buildingInteractions)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 8)
              .map(([building, interactions]) => (
              <div key={building} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{building}</span>
                <span className="font-medium">{interactions}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Activity Log</span>
          </h3>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {activityLog.map((entry, index) => (
              <div key={index} className="text-xs text-muted-foreground font-mono">
                {entry}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Character Details Modal */}
      {selectedCharacter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg border border-border p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Character Details</h3>
              <button
                onClick={() => setSelectedCharacter(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="ml-2 font-medium">{selectedCharacter.name}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Role:</span>
                <span className={cn("ml-2 font-medium", getRoleColor(selectedCharacter.role))}>
                  {selectedCharacter.role}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Activity:</span>
                <span className="ml-2">{selectedCharacter.currentActivity}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Position:</span>
                <span className="ml-2">
                  ({selectedCharacter.currentPosition.x}, {selectedCharacter.currentPosition.y})
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Queue Length:</span>
                <span className="ml-2">{selectedCharacter.actionQueueLength}</span>
              </div>
              {selectedCharacter.targetBuilding && (
                <div>
                  <span className="text-sm text-muted-foreground">Target:</span>
                  <span className="ml-2">{selectedCharacter.targetBuilding}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};