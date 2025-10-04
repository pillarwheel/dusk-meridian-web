import React, { useState, useEffect } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds, CRS } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapBuilding, SettlementMapState } from '@/types/map';
import { settlementApi } from '@/api/endpoints/settlement';
import { Building, Users, Hammer, Home, Shield, Coins } from 'lucide-react';

// Fix Leaflet default icon paths
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

interface SettlementMapProps {
  settlementId: number;
  settlementName: string;
  onBuildingSelect?: (building: MapBuilding) => void;
}

// Settlement map bounds - buildings now use local Unity coordinates
// Centered around (1250, -15) with typical spread of ~50 units
const SETTLEMENT_BOUNDS: [[number, number], [number, number]] = [[-100, 1150], [100, 1350]];

// Component to fit map to buildings
const FitToBuildings: React.FC<{ buildings: MapBuilding[] }> = ({ buildings }) => {
  const map = useMap();

  useEffect(() => {
    if (buildings.length > 0) {
      // Find min/max coordinates to create tight bounds around buildings
      // Use X and Z coordinates (Z is the vertical position on the map)
      const xCoords = buildings.map(b => b.xCoordinate);
      const zCoords = buildings.map(b => b.zCoordinate);

      const minX = Math.min(...xCoords);
      const maxX = Math.max(...xCoords);
      const minZ = Math.min(...zCoords);
      const maxZ = Math.max(...zCoords);

      // Add padding
      const padding = 50;
      const bounds: [[number, number], [number, number]] = [
        [minZ - padding, minX - padding],
        [maxZ + padding, maxX + padding]
      ];

      console.log('🗺️ Fitting to building bounds:', bounds);
      console.log('🗺️ First building coords:', {
        x: buildings[0].xCoordinate,
        y: buildings[0].yCoordinate,
        z: buildings[0].zCoordinate
      });
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [buildings, map]);

  return null;
};

export const SettlementMap: React.FC<SettlementMapProps> = ({
  settlementId,
  settlementName,
  onBuildingSelect,
}) => {
  const [mapState, setMapState] = useState<SettlementMapState>({
    buildings: [],
    characters: [],
    pois: [],
    selectedEntity: null,
    gridOverlay: false,
    showResourceFlow: false,
    showCharacters: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettlementData();
  }, [settlementId]);

  const loadSettlementData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch settlement buildings
      const buildings = await settlementApi.getSettlementBuildings(settlementId);
      console.log('🏗️ Settlement buildings loaded:', buildings);
      console.log('🏗️ Building count:', buildings.length);
      if (buildings.length > 0) {
        console.log('🏗️ First building:', buildings[0]);
      }

      // Fetch outdoor characters (those not in buildings)
      const characters = await settlementApi.getSettlementCharacters(settlementId, true);
      console.log('👥 Outdoor characters loaded:', characters.length);
      if (characters.length > 0) {
        console.log('👥 First character:', characters[0]);
        console.log('👥 All character positions:', characters.map(c => ({
          id: c.characterId,
          name: c.name,
          x: c.xCoordinate,
          y: c.yCoordinate,
          z: c.zCoordinate
        })));
      }

      setMapState(prev => ({
        ...prev,
        buildings,
        characters,
      }));
    } catch (err) {
      console.error('Failed to load settlement map data:', err);
      setError('Failed to load settlement map');
    } finally {
      setIsLoading(false);
    }
  };

  const getCharacterIcon = (character: any) => {
    const size = 16;
    const color = character.isPlayer ? '#3b82f6' : '#f59e0b';

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="#fff"/>
    </svg>`;

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(svgString)}`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  };

  const getBuildingIcon = (building: MapBuilding) => {
    // Building type colors
    const typeColors: Record<string, string> = {
      'Residential': '#10b981',
      'Commercial': '#f59e0b',
      'Industrial': '#6b7280',
      'Military': '#ef4444',
      'Administrative': '#8b5cf6',
      'Religious': '#ec4899',
      'Storage': '#06b6d4',
    };

    const color = typeColors[building.type] || '#6b7280';
    const size = 24;

    // Use simple shapes instead of emoji/text
    let statusShape = '';
    if (building.isDestroyed) {
      // X shape for destroyed
      statusShape = `<line x1="8" y1="8" x2="16" y2="16" stroke="#fff" stroke-width="2"/>
                     <line x1="16" y1="8" x2="8" y2="16" stroke="#fff" stroke-width="2"/>`;
    } else if (building.isDamaged) {
      // Exclamation mark for damaged
      statusShape = `<circle cx="12" cy="15" r="1" fill="#fff"/>
                     <line x1="12" y1="8" x2="12" y2="12" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
    } else if (building.isActive) {
      // Check mark for active
      statusShape = `<polyline points="8,12 11,15 16,9" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else {
      // Circle for inactive
      statusShape = `<circle cx="12" cy="12" r="3" stroke="#fff" stroke-width="2" fill="none"/>`;
    }

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" fill="${color}" stroke="#fff" stroke-width="2" rx="2"/>
      ${statusShape}
    </svg>`;

    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(svgString)}`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  };

  const getBuildingStatusColor = (building: MapBuilding) => {
    if (building.isDestroyed) return 'text-red-600';
    if (building.isDamaged) return 'text-yellow-600';
    if (building.isActive) return 'text-green-600';
    return 'text-gray-600';
  };

  const getBuildingStatusText = (building: MapBuilding) => {
    if (building.isDestroyed) return 'Destroyed';
    if (building.isDamaged) return 'Damaged';
    if (building.isActive) return 'Active';
    return 'Inactive';
  };

  const handleBuildingClick = (building: MapBuilding) => {
    setMapState(prev => ({
      ...prev,
      selectedEntity: {
        type: 'building',
        id: building.buildingId,
        data: building,
      },
    }));

    if (onBuildingSelect) {
      onBuildingSelect(building);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <Building className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading settlement map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-lg flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Map Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={loadSettlementData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (mapState.buildings.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No buildings found in this settlement</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <MapContainer
        center={[0, 1250]}
        zoom={3}
        minZoom={1}
        maxZoom={6}
        className="h-full w-full"
        style={{ background: '#4ade80' }}
        crs={CRS.Simple}
        maxBounds={SETTLEMENT_BOUNDS}
        maxBoundsViscosity={0.8}
      >
        {/* Green background - will be replaced with settlement image later */}
        <ImageOverlay
          url="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%234ade80'/%3E%3C/svg%3E"
          bounds={SETTLEMENT_BOUNDS}
          opacity={1}
        />

        <FitToBuildings buildings={mapState.buildings} />

        {/* Render buildings */}
        {mapState.buildings.map((building) => (
          <Marker
            key={building.buildingId}
            position={[building.zCoordinate, building.xCoordinate]}
            icon={getBuildingIcon(building)}
            eventHandlers={{
              click: () => handleBuildingClick(building),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[220px]">
                <h3 className="font-bold text-base mb-2">{building.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">{building.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${getBuildingStatusColor(building)}`}>
                      {getBuildingStatusText(building)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position:</span>
                    <span className="font-mono text-xs">
                      ({building.xCoordinate.toFixed(1)}, {building.yCoordinate.toFixed(1)})
                    </span>
                  </div>
                  {building.health !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Health:</span>
                      <span className="font-medium">{building.health}%</span>
                    </div>
                  )}
                  {building.level && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Level:</span>
                      <span className="font-medium">{building.level}</span>
                    </div>
                  )}
                  {building.workers !== undefined && building.workers > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Workers:</span>
                      <span className="font-medium">{building.workers}</span>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render outdoor characters */}
        {mapState.showCharacters && mapState.characters.map((character) => (
          <Marker
            key={`char-${character.characterId}`}
            position={[character.zCoordinate || character.yCoordinate, character.xCoordinate]}
            icon={getCharacterIcon(character)}
            eventHandlers={{
              click: () => {
                setMapState(prev => ({
                  ...prev,
                  selectedEntity: {
                    type: 'character',
                    id: character.characterId,
                    data: character,
                  },
                }));
              },
            }}
          >
            <Popup>
              <div className="p-2 min-w-[180px]">
                <h3 className="font-bold text-base mb-2">{character.name}</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Class:</span>
                    <span className="font-medium">{character.class}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">{character.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Health:</span>
                    <span className="font-medium">
                      {character.health.current}/{character.health.max}
                    </span>
                  </div>
                  {character.currentAction && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Action:</span>
                      <span className="font-medium text-xs">{character.currentAction}</span>
                    </div>
                  )}
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex items-center gap-1 text-xs">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: character.isPlayer ? '#3b82f6' : '#f59e0b' }}
                      />
                      <span className="text-muted-foreground">
                        {character.isPlayer ? 'Player' : 'NPC'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Grid overlay if enabled */}
        {mapState.gridOverlay && (
          <div className="absolute inset-0 pointer-events-none z-[400]">
            {/* Grid lines would be rendered here */}
          </div>
        )}
      </MapContainer>

      {/* Map controls */}
      <div className="absolute top-4 right-4 bg-card border border-border rounded-lg p-3 shadow-lg z-[1000] space-y-2">
        <button
          onClick={() => setMapState(prev => ({ ...prev, gridOverlay: !prev.gridOverlay }))}
          className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
            mapState.gridOverlay ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
          }`}
        >
          <Hammer className="w-4 h-4" />
          Grid
        </button>
        <button
          onClick={() => setMapState(prev => ({ ...prev, showCharacters: !prev.showCharacters }))}
          className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
            mapState.showCharacters ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
          }`}
        >
          <Users className="w-4 h-4" />
          Characters
        </button>
        <button
          onClick={() => setMapState(prev => ({ ...prev, showResourceFlow: !prev.showResourceFlow }))}
          className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
            mapState.showResourceFlow ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
          }`}
        >
          <Coins className="w-4 h-4" />
          Resources
        </button>
      </div>

      {/* Building legend */}
      <div className="absolute bottom-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-[1000]">
        <h4 className="font-semibold mb-2 text-sm">Building Types</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500"></div>
            <span>Residential</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500"></div>
            <span>Commercial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500"></div>
            <span>Military</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500"></div>
            <span>Administrative</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500"></div>
            <span>Industrial</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" className="inline">
              <polyline points="8,12 11,15 16,9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Active</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" className="inline text-yellow-500">
              <circle cx="12" cy="15" r="1" fill="currentColor"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Damaged</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" className="inline text-red-500">
              <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Destroyed</span>
          </div>
        </div>
      </div>

      {/* Statistics panel */}
      <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg p-4 shadow-lg z-[1000]">
        <h4 className="font-semibold mb-2 text-sm">{settlementName}</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Buildings:</span>
            <span className="font-medium">{mapState.buildings.length}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Active:</span>
            <span className="font-medium text-green-500">
              {mapState.buildings.filter(b => b.isActive).length}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Damaged:</span>
            <span className="font-medium text-yellow-500">
              {mapState.buildings.filter(b => b.isDamaged && !b.isDestroyed).length}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Destroyed:</span>
            <span className="font-medium text-red-500">
              {mapState.buildings.filter(b => b.isDestroyed).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};