import React, { useState, useRef, useEffect } from 'react';
import {
  Navigation,
  MapPin,
  Clock,
  Zap,
  Target,
  Route,
  Eye,
  Play,
  Pause,
  Square,
  AlertTriangle,
  Settings,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Flag,
  Move3D,
  Activity
} from 'lucide-react';
import { cn } from '@/utils/cn';
// Local type definitions to replace @/api/types/map imports
export interface MapPosition {
  x: number;
  y: number;
}

export type TerrainType =
  | 'plains'
  | 'forest'
  | 'mountain'
  | 'water'
  | 'desert'
  | 'swamp'
  | 'tundra'
  | 'hills'
  | 'road'
  | 'bridge'
  | 'ruins';

export type DangerLevel = 'safe' | 'low' | 'medium' | 'high' | 'extreme' | 'unknown';

export type MovementState = 'idle' | 'moving' | 'combat' | 'resting';

export interface MapCharacter {
  id: string;
  name: string;
  position: MapPosition;
  movementSpeed: number;
  isMoving: boolean;
  faction: string;
  isPlayer: boolean;
  isVisible: boolean;
  status: MovementState;
}

export interface WorldMapRegion {
  id: string;
  name: string;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  controller: string;
  color: string;
  description: string;
  climate: string;
  dangerLevel: DangerLevel;
}

export interface MapSettlement {
  id: string;
  name: string;
  position: MapPosition;
  faction: string;
  size: string;
  population: number;
  defenseLevel: number;
  isVisible: boolean;
  isAccessible: boolean;
  lastUpdated: Date;
}

export interface MapPOI {
  id: string;
  name: string;
  type: string;
  position: MapPosition;
  description: string;
  isDiscovered: boolean;
  danger: DangerLevel;
  icon: string;
}

export interface WorldMap {
  id: number;
  name: string;
  width: number;
  height: number;
  tiles: any[];
  regions: WorldMapRegion[];
  settlements: MapSettlement[];
  characters: MapCharacter[];
  pois: MapPOI[];
  boundaries: any[];
}

export interface MovementRisk {
  type: string;
  probability: number;
  severity: number;
  description: string;
  mitigation?: string[];
}

export interface MovementWaypoint {
  position: MapPosition;
  action: string;
  duration: number;
  description: string;
}

export interface MovementPlan {
  origin: MapPosition;
  destination: MapPosition;
  path: MapPosition[];
  estimatedTime: number;
  totalDistance: number;
  actionPointCost: number;
  energyCost: number;
  risks: MovementRisk[];
  waypoints: MovementWaypoint[];
}

export interface MovementEvent {
  id: string;
  type: string;
  timestamp: Date;
  position: MapPosition;
  description: string;
  effects: any[];
}

export interface MovementOrder {
  id: string;
  characterId: string;
  type: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  plan: MovementPlan;
  startTime: Date;
  estimatedArrival: Date;
  progress: number;
  currentPosition: MapPosition;
  events: MovementEvent[];
}

export interface PathfindingOptions {
  avoidDanger: boolean;
  preferRoads: boolean;
  maxDetourRatio: number;
  allowWater: boolean;
  allowMountains: boolean;
  considerWeather: boolean;
  timeOfDay: string;
}

export interface MapViewState {
  center: MapPosition;
  zoom: number;
  rotation: number;
  showGrid: boolean;
  showCoordinates: boolean;
  activeLayer: string;
  filters: string[];
}

interface CharacterMapMovementProps {
  worldMap: WorldMap;
  character: MapCharacter;
  movementOrders: MovementOrder[];
  onCreateMovementOrder?: (plan: MovementPlan) => void;
  onCancelOrder?: (orderId: string) => void;
  onPauseOrder?: (orderId: string) => void;
  onResumeOrder?: (orderId: string) => void;
}

const TERRAIN_COLORS: Record<TerrainType, string> = {
  plains: '#90EE90',
  forest: '#228B22',
  mountain: '#A0522D',
  water: '#1E90FF',
  desert: '#F4A460',
  swamp: '#6B8E23',
  tundra: '#E0E0E0',
  hills: '#9ACD32',
  road: '#8B4513',
  bridge: '#CD853F',
  ruins: '#696969'
};

const DANGER_COLORS: Record<DangerLevel, string> = {
  safe: '#00FF00',
  low: '#FFFF00',
  medium: '#FFA500',
  high: '#FF4500',
  extreme: '#FF0000',
  unknown: '#808080'
};

export const CharacterMapMovement: React.FC<CharacterMapMovementProps> = ({
  worldMap,
  character,
  movementOrders,
  onCreateMovementOrder,
  onCancelOrder,
  onPauseOrder,
  onResumeOrder
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewState, setViewState] = useState<MapViewState>({
    center: character.position,
    zoom: 2,
    rotation: 0,
    showGrid: true,
    showCoordinates: true,
    activeLayer: 'terrain',
    filters: []
  });

  const [selectedDestination, setSelectedDestination] = useState<MapPosition | null>(null);
  const [plannedPath, setPlannedPath] = useState<MapPosition[]>([]);
  const [movementPlan, setMovementPlan] = useState<MovementPlan | null>(null);
  const [pathfindingOptions, setPathfindingOptions] = useState<PathfindingOptions>({
    avoidDanger: true,
    preferRoads: true,
    maxDetourRatio: 1.5,
    allowWater: false,
    allowMountains: true,
    considerWeather: true,
    timeOfDay: 'any'
  });

  const [activeTab, setActiveTab] = useState<'movement' | 'orders' | 'options'>('movement');

  // Mock pathfinding function
  const calculatePath = (start: MapPosition, end: MapPosition): MovementPlan => {
    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const baseTime = distance * 2; // 2 minutes per unit
    const path = [start, end]; // Simple direct path for demo

    return {
      origin: start,
      destination: end,
      path,
      estimatedTime: baseTime,
      totalDistance: distance,
      actionPointCost: Math.ceil(distance / 10),
      energyCost: Math.ceil(distance / 5),
      risks: [
        {
          type: 'weather',
          probability: 30,
          severity: 20,
          description: 'Light snow may slow travel',
          mitigation: ['Warm clothing', 'Weather magic']
        }
      ],
      waypoints: []
    };
  };

  const handleMapClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert canvas coordinates to map coordinates
    const mapX = Math.floor((x / canvas.width) * worldMap.width);
    const mapY = Math.floor((y / canvas.height) * worldMap.height);

    const destination: MapPosition = { x: mapX, y: mapY };
    setSelectedDestination(destination);

    // Calculate path and movement plan
    const plan = calculatePath(character.position, destination);
    setMovementPlan(plan);
    setPlannedPath(plan.path);
  };

  const handleCreateOrder = () => {
    if (movementPlan && onCreateMovementOrder) {
      onCreateMovementOrder(movementPlan);
      setSelectedDestination(null);
      setMovementPlan(null);
      setPlannedPath([]);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getRiskColor = (probability: number): string => {
    if (probability < 25) return 'text-green-400';
    if (probability < 50) return 'text-yellow-400';
    if (probability < 75) return 'text-orange-400';
    return 'text-red-400';
  };

  // Simple canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (viewState.showGrid) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw character
    const charX = (character.position.x / worldMap.width) * canvas.width;
    const charY = (character.position.y / worldMap.height) * canvas.height;

    ctx.fillStyle = character.isPlayer ? '#00FF00' : '#0080FF';
    ctx.beginPath();
    ctx.arc(charX, charY, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Draw planned path
    if (plannedPath.length > 0) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.beginPath();

      for (let i = 0; i < plannedPath.length; i++) {
        const pathX = (plannedPath[i].x / worldMap.width) * canvas.width;
        const pathY = (plannedPath[i].y / worldMap.height) * canvas.height;

        if (i === 0) {
          ctx.moveTo(pathX, pathY);
        } else {
          ctx.lineTo(pathX, pathY);
        }
      }
      ctx.stroke();
    }

    // Draw selected destination
    if (selectedDestination) {
      const destX = (selectedDestination.x / worldMap.width) * canvas.width;
      const destY = (selectedDestination.y / worldMap.height) * canvas.height;

      ctx.fillStyle = '#FF4444';
      ctx.beginPath();
      ctx.arc(destX, destY, 6, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw settlements
    worldMap.settlements.forEach(settlement => {
      const settX = (settlement.position.x / worldMap.width) * canvas.width;
      const settY = (settlement.position.y / worldMap.height) * canvas.height;

      ctx.fillStyle = '#8B4513';
      ctx.fillRect(settX - 4, settY - 4, 8, 8);
    });

  }, [worldMap, character, plannedPath, selectedDestination, viewState]);

  return (
    <div className="flex h-screen bg-background">
      {/* Map Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full cursor-crosshair"
          onClick={handleMapClick}
        />

        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <button
            onClick={() => setViewState(prev => ({ ...prev, zoom: Math.min(8, prev.zoom * 1.2) }))}
            className="p-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewState(prev => ({ ...prev, zoom: Math.max(0.5, prev.zoom / 1.2) }))}
            className="p-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewState(prev => ({ ...prev, center: character.position }))}
            className="p-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <Target className="w-4 h-4" />
          </button>
        </div>

        {/* Coordinates Display */}
        {viewState.showCoordinates && (
          <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2 text-sm">
            Character: {character.position.x}, {character.position.y}
            {selectedDestination && (
              <div>Target: {selectedDestination.x}, {selectedDestination.y}</div>
            )}
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="w-80 bg-card border-l border-border flex flex-col">
        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex">
            {['movement', 'orders', 'options'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "flex-1 py-2 px-4 text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "bg-background text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 overflow-auto">
          {activeTab === 'movement' && (
            <div className="space-y-4">
              {/* Character Status */}
              <div className="bg-background rounded-lg border border-border p-3">
                <h3 className="font-medium mb-2 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Character Status
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position:</span>
                    <span>{character.position.x}, {character.position.y}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={cn(
                      "capitalize",
                      character.status === 'moving' && "text-blue-400",
                      character.status === 'idle' && "text-green-400",
                      character.status === 'combat' && "text-red-400"
                    )}>
                      {character.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Speed:</span>
                    <span>{character.movementSpeed} units/hour</span>
                  </div>
                </div>
              </div>

              {/* Movement Plan */}
              {movementPlan && (
                <div className="bg-background rounded-lg border border-border p-3">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Route className="w-4 h-4 mr-2" />
                    Movement Plan
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distance:</span>
                      <span>{movementPlan.totalDistance.toFixed(1)} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span>{formatTime(movementPlan.estimatedTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Action Points:</span>
                      <span>{movementPlan.actionPointCost} AP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Energy Cost:</span>
                      <span>{movementPlan.energyCost} energy</span>
                    </div>

                    {/* Risks */}
                    {movementPlan.risks.length > 0 && (
                      <div className="mt-3">
                        <h4 className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1">
                          Risks
                        </h4>
                        {movementPlan.risks.map((risk, index) => (
                          <div key={index} className="flex items-start space-x-2 text-xs">
                            <AlertTriangle className={cn("w-3 h-3 mt-0.5", getRiskColor(risk.probability))} />
                            <div>
                              <span className={getRiskColor(risk.probability)}>
                                {risk.probability}% chance
                              </span>
                              <span className="text-muted-foreground ml-1">
                                {risk.description}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={handleCreateOrder}
                        className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                      >
                        <Play className="w-3 h-3 mr-1 inline" />
                        Start Movement
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDestination(null);
                          setMovementPlan(null);
                          setPlannedPath([]);
                        }}
                        className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-background rounded-lg border border-border p-3">
                <h3 className="font-medium mb-2">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="px-2 py-1 bg-secondary hover:bg-secondary/80 rounded text-xs transition-colors">
                    <Eye className="w-3 h-3 mr-1 inline" />
                    Scout Area
                  </button>
                  <button className="px-2 py-1 bg-secondary hover:bg-secondary/80 rounded text-xs transition-colors">
                    <Flag className="w-3 h-3 mr-1 inline" />
                    Set Waypoint
                  </button>
                  <button className="px-2 py-1 bg-secondary hover:bg-secondary/80 rounded text-xs transition-colors">
                    <Compass className="w-3 h-3 mr-1 inline" />
                    Quick Travel
                  </button>
                  <button className="px-2 py-1 bg-secondary hover:bg-secondary/80 rounded text-xs transition-colors">
                    <Route className="w-3 h-3 mr-1 inline" />
                    Patrol Route
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-3">
              <h3 className="font-medium">Active Orders</h3>
              {movementOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active movement orders</p>
              ) : (
                movementOrders.map((order) => (
                  <div key={order.id} className="bg-background rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{order.type} Order</span>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        order.status === 'active' && "bg-green-500/20 text-green-400",
                        order.status === 'paused' && "bg-yellow-500/20 text-yellow-400",
                        order.status === 'completed' && "bg-blue-500/20 text-blue-400"
                      )}>
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Destination: {order.plan.destination.x}, {order.plan.destination.y}</div>
                      <div>Progress: {order.progress}%</div>
                      <div>ETA: {order.estimatedArrival.toLocaleTimeString()}</div>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      {order.status === 'active' && (
                        <button
                          onClick={() => onPauseOrder?.(order.id)}
                          className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs hover:bg-yellow-500/30 transition-colors"
                        >
                          <Pause className="w-3 h-3 mr-1 inline" />
                          Pause
                        </button>
                      )}
                      {order.status === 'paused' && (
                        <button
                          onClick={() => onResumeOrder?.(order.id)}
                          className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors"
                        >
                          <Play className="w-3 h-3 mr-1 inline" />
                          Resume
                        </button>
                      )}
                      <button
                        onClick={() => onCancelOrder?.(order.id)}
                        className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
                      >
                        <Square className="w-3 h-3 mr-1 inline" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'options' && (
            <div className="space-y-4">
              <h3 className="font-medium">Pathfinding Options</h3>

              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={pathfindingOptions.avoidDanger}
                    onChange={(e) => setPathfindingOptions(prev => ({ ...prev, avoidDanger: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Avoid dangerous areas</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={pathfindingOptions.preferRoads}
                    onChange={(e) => setPathfindingOptions(prev => ({ ...prev, preferRoads: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Prefer roads</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={pathfindingOptions.allowWater}
                    onChange={(e) => setPathfindingOptions(prev => ({ ...prev, allowWater: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Allow water travel</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={pathfindingOptions.considerWeather}
                    onChange={(e) => setPathfindingOptions(prev => ({ ...prev, considerWeather: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Consider weather</span>
                </label>

                <div>
                  <label className="block text-sm font-medium mb-1">Max Detour Ratio</label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={pathfindingOptions.maxDetourRatio}
                    onChange={(e) => setPathfindingOptions(prev => ({ ...prev, maxDetourRatio: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {pathfindingOptions.maxDetourRatio.toFixed(1)}x max path length
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-2">View Options</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={viewState.showGrid}
                      onChange={(e) => setViewState(prev => ({ ...prev, showGrid: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Show grid</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={viewState.showCoordinates}
                      onChange={(e) => setViewState(prev => ({ ...prev, showCoordinates: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Show coordinates</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};