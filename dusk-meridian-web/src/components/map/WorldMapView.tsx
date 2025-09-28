import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Users, Crown, Filter } from 'lucide-react';
import { worldApi } from '@/api/endpoints/world';
import { cn } from '@/utils/cn';

// Inline types to avoid import issues
interface MapDataResponse {
  worldId: string;
  worldName: string;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  settlements: MapSettlementDto[];
  regions: MapRegionDto[];
  mapImageUrl: string;
}

interface MapSettlementDto {
  id: string;
  name: string;
  x: number;
  y: number;
  factionId?: string;
  factionName?: string;
  factionColor?: string;
  population: number;
  isCapital: boolean;
}

interface MapRegionDto {
  id: string;
  name: string;
  type: string;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  factionId?: string;
  color?: string;
}

interface WorldTimeData {
  currentDay: number;
  timeOfDay: number;
  season: string;
  year: number;
}

interface WorldMapViewProps {
  worldId: string;
  className?: string;
}

interface MapState {
  mapData: MapDataResponse | null;
  worldTime: WorldTimeData | null;
  isLoading: boolean;
  error: string | null;
  zoom: number;
  offsetX: number;
  offsetY: number;
  selectedSettlement: MapSettlementDto | null;
  filterFaction: string | null;
}

export const WorldMapView: React.FC<WorldMapViewProps> = ({ worldId, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [state, setState] = useState<MapState>({
    mapData: null,
    worldTime: null,
    isLoading: true,
    error: null,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    selectedSettlement: null,
    filterFaction: null
  });

  const fetchMapData = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch world data from GameServer instead of Unity
      const [worldDetails, settlements, factions, terrainData, resourceNodes] = await Promise.all([
        worldApi.getWorldDetails(worldId),
        worldApi.getSettlements(worldId),
        worldApi.getFactions(worldId),
        worldApi.getTerrainData(worldId),
        worldApi.getResourceNodes(worldId)
      ]);

      // Build map overview from GameServer data
      const mapData = {
        settlements: settlements.map(settlement => ({
          id: settlement.id,
          name: settlement.name,
          position: settlement.position,
          factionId: settlement.factionId,
          population: settlement.population,
          type: settlement.type,
          status: settlement.status
        })),
        factions: factions.map(faction => ({
          id: faction.id,
          name: faction.name,
          color: faction.color,
          territory: faction.territoryCount || 0
        })),
        terrain: terrainData,
        resources: resourceNodes,
        bounds: {
          minX: worldDetails.bounds?.minX || 0,
          minY: worldDetails.bounds?.minY || 0,
          maxX: worldDetails.bounds?.maxX || 1000,
          maxY: worldDetails.bounds?.maxY || 1000
        }
      };

      setState(prev => ({
        ...prev,
        mapData,
        worldTime: {
          day: worldDetails.currentDay || 1,
          hour: worldDetails.currentHour || 12,
          season: worldDetails.currentSeason || 'spring',
          year: worldDetails.currentYear || 1
        },
        isLoading: false
      }));
    } catch (err) {
      console.error('Failed to load world data:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load world data from GameServer'
      }));
    }
  };

  const handleZoom = (delta: number) => {
    setState(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(5, prev.zoom + delta))
    }));
  };

  const resetView = () => {
    setState(prev => ({
      ...prev,
      zoom: 1,
      offsetX: 0,
      offsetY: 0
    }));
  };

  const drawMap = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !state.mapData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2 + state.offsetX, canvas.height / 2 + state.offsetY);
    ctx.scale(state.zoom, state.zoom);

    // Draw map bounds
    const bounds = state.mapData.bounds;
    const mapWidth = bounds.maxX - bounds.minX;
    const mapHeight = bounds.maxY - bounds.minY;

    // Draw regions
    state.mapData.regions.forEach(region => {
      if (state.filterFaction && region.factionId !== state.filterFaction) return;

      ctx.fillStyle = region.color || '#333333';
      ctx.globalAlpha = 0.3;

      const x = (region.bounds.minX - bounds.minX) - mapWidth / 2;
      const y = (region.bounds.minY - bounds.minY) - mapHeight / 2;
      const width = region.bounds.maxX - region.bounds.minX;
      const height = region.bounds.maxY - region.bounds.minY;

      ctx.fillRect(x, y, width, height);
      ctx.globalAlpha = 1;

      // Draw region border
      ctx.strokeStyle = region.color || '#666666';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Draw region name
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(region.name, x + width / 2, y + height / 2);
    });

    // Draw settlements
    state.mapData.settlements.forEach(settlement => {
      if (state.filterFaction && settlement.factionId !== state.filterFaction) return;

      const x = (settlement.x - bounds.minX) - mapWidth / 2;
      const y = (settlement.y - bounds.minY) - mapHeight / 2;

      // Settlement circle
      const radius = settlement.isCapital ? 12 : 8;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);

      if (settlement.factionColor) {
        ctx.fillStyle = settlement.factionColor;
      } else {
        ctx.fillStyle = '#4ade80';
      }
      ctx.fill();

      // Settlement border
      ctx.strokeStyle = state.selectedSettlement?.id === settlement.id ? '#ffffff' : '#000000';
      ctx.lineWidth = state.selectedSettlement?.id === settlement.id ? 3 : 2;
      ctx.stroke();

      // Capital crown
      if (settlement.isCapital) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('♔', x, y - radius - 5);
      }

      // Settlement name
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(settlement.name, x, y + radius + 15);

      // Population
      ctx.fillStyle = '#888888';
      ctx.font = '10px Arial';
      ctx.fillText(`${settlement.population}`, x, y + radius + 28);
    });

    ctx.restore();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !state.mapData) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const worldX = (clickX - canvas.width / 2 - state.offsetX) / state.zoom;
    const worldY = (clickY - canvas.height / 2 - state.offsetY) / state.zoom;

    const bounds = state.mapData.bounds;
    const mapWidth = bounds.maxX - bounds.minX;
    const mapHeight = bounds.maxY - bounds.minY;

    // Check if click is on a settlement
    const clickedSettlement = state.mapData.settlements.find(settlement => {
      const x = (settlement.x - bounds.minX) - mapWidth / 2;
      const y = (settlement.y - bounds.minY) - mapHeight / 2;
      const radius = settlement.isCapital ? 12 : 8;

      const distance = Math.sqrt(Math.pow(worldX - x, 2) + Math.pow(worldY - y, 2));
      return distance <= radius;
    });

    setState(prev => ({
      ...prev,
      selectedSettlement: clickedSettlement || null
    }));
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: event.clientX - state.offsetX, y: event.clientY - state.offsetY });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    setState(prev => ({
      ...prev,
      offsetX: event.clientX - dragStart.x,
      offsetY: event.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(delta);
  };

  // Get unique factions for filter
  const factions = state.mapData ? Array.from(new Set(
    [...state.mapData.settlements, ...state.mapData.regions]
      .map(item => item.factionId)
      .filter(Boolean)
  )) : [];

  useEffect(() => {
    fetchMapData();
  }, [worldId]);

  useEffect(() => {
    drawMap();
  }, [state.mapData, state.zoom, state.offsetX, state.offsetY, state.selectedSettlement, state.filterFaction]);

  if (state.error) {
    return (
      <div className={cn("bg-red-600/20 border border-red-600/30 text-red-400 p-6 rounded-lg", className)}>
        <h3 className="text-lg font-semibold mb-2">Map Error</h3>
        <p className="mb-4">{state.error}</p>
        <button
          onClick={fetchMapData}
          className="bg-red-600/30 px-4 py-2 rounded border border-red-600/50 hover:bg-red-600/40 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">World Map: {state.mapData?.worldName || worldId}</h3>
          {state.worldTime && (
            <p className="text-sm text-muted-foreground">
              Day {state.worldTime.currentDay}, {state.worldTime.timeOfDay.toFixed(1)}h - {state.worldTime.season} Year {state.worldTime.year}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Faction Filter */}
          <select
            value={state.filterFaction || ''}
            onChange={(e) => setState(prev => ({ ...prev, filterFaction: e.target.value || null }))}
            className="bg-background border border-border rounded px-3 py-2 text-sm"
          >
            <option value="">All Factions</option>
            {factions.map(factionId => (
              <option key={factionId} value={factionId}>
                {factionId}
              </option>
            ))}
          </select>

          {/* Map Controls */}
          <button
            onClick={() => handleZoom(0.2)}
            className="p-2 bg-secondary border border-border rounded hover:bg-secondary/80 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            className="p-2 bg-secondary border border-border rounded hover:bg-secondary/80 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 bg-secondary border border-border rounded hover:bg-secondary/80 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={fetchMapData}
            disabled={state.isLoading}
            className="px-4 py-2 bg-secondary border border-border rounded hover:bg-secondary/80 transition-colors text-sm"
          >
            {state.isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative bg-background border border-border rounded-lg overflow-hidden" style={{ height: '600px' }}>
        <div ref={containerRef} className="absolute inset-0">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className="cursor-grab active:cursor-grabbing"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Loading Overlay */}
        {state.isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading map data...</p>
            </div>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3 space-y-2">
          <h4 className="text-sm font-semibold">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Settlement</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full relative">
                <Crown className="w-2 h-2 absolute -top-1 left-0.5 text-yellow-400" />
              </div>
              <span>Capital</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500/30 border border-gray-500" />
              <span>Region</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground pt-1 border-t border-border">
            Zoom: {(state.zoom * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Settlement Details */}
      {state.selectedSettlement && (
        <div className="bg-background/50 border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-green-400" />
              <h4 className="text-lg font-semibold">{state.selectedSettlement.name}</h4>
              {state.selectedSettlement.isCapital && (
                <Crown className="w-4 h-4 text-yellow-400" />
              )}
            </div>
            <button
              onClick={() => setState(prev => ({ ...prev, selectedSettlement: null }))}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Position:</span>
              <p className="font-medium">{state.selectedSettlement.x}, {state.selectedSettlement.y}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Population:</span>
              <p className="font-medium flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{state.selectedSettlement.population.toLocaleString()}</span>
              </p>
            </div>
            {state.selectedSettlement.factionName && (
              <div className="col-span-2">
                <span className="text-sm text-muted-foreground">Faction:</span>
                <p className="font-medium" style={{ color: state.selectedSettlement.factionColor || undefined }}>
                  {state.selectedSettlement.factionName}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Statistics */}
      {state.mapData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background/50 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold">{state.mapData.settlements.length}</p>
            <p className="text-sm text-muted-foreground">Settlements</p>
          </div>
          <div className="bg-background/50 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold">{state.mapData.settlements.filter(s => s.isCapital).length}</p>
            <p className="text-sm text-muted-foreground">Capitals</p>
          </div>
          <div className="bg-background/50 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold">{state.mapData.regions.length}</p>
            <p className="text-sm text-muted-foreground">Regions</p>
          </div>
          <div className="bg-background/50 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold">{factions.length}</p>
            <p className="text-sm text-muted-foreground">Factions</p>
          </div>
        </div>
      )}
    </div>
  );
};