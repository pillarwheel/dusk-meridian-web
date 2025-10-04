import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds, CRS } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import type { WorldSettlement, VisibilityMode, MapViewMode } from '@/types/map';
import { settlementApi } from '@/api/endpoints/settlement';

// Fix Leaflet default icon issue in Webpack/Vite
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

// Constants
const MAP_CONFIG = {
  bounds: [[0, 0], [1250, 2000]] as [[number, number], [number, number]],
  center: [625, 1000] as [number, number],
  defaultZoom: 1,
  minZoom: 0,
  maxZoom: 4,
  backgroundColor: '#1a1a1a',
  // Coordinate transformation settings
  // Adjust these values to align database coordinates with visual map
  coordinateTransform: {
    // Scale factors to convert from database coords to map coords
    xScale: 0.5,  // Adjust this to stretch/compress X axis
    yScale: 0.8,  // Adjust this to stretch/compress Y axis
    // Offset values to shift the entire coordinate system
    xOffset: -200,  // Shift all points left/right
    yOffset: 100,   // Shift all points up/down
    // Whether to invert Y axis (common in game coordinate systems)
    invertY: false,
  }
} as const;

const SETTLEMENT_COLORS = {
  City: '#3b82f6',
  Town: '#10b981',
  Village: '#f59e0b',
  Stronghold: '#ef4444',
  default: '#6b7280',
} as const;

const SETTLEMENT_SIZES = {
  City: 32,
  Town: 24,
  Stronghold: 28,
  Village: 20,
  default: 20,
} as const;

type SettlementType = keyof typeof SETTLEMENT_COLORS;

interface WorldMapProps {
  visibilityMode?: VisibilityMode;
  viewMode?: MapViewMode;
  onSettlementSelect?: (settlementId: number) => void;
  filterFactionId?: number;
  showLegend?: boolean;
  debugMode?: boolean; // Show coordinate debug info
  coordinateOverrides?: { [key: number]: { x: number; y: number } }; // Manual coordinate overrides
}

interface MapState {
  settlements: WorldSettlement[];
  isLoading: boolean;
  error: string | null;
  selectedSettlementId: number | null;
}

// Coordinate transformation function
const transformCoordinates = (
  x: number,
  y: number,
  overrides?: { [key: number]: { x: number; y: number } },
  settlementId?: number
): [number, number] => {
  // Check for manual override first
  if (settlementId && overrides && overrides[settlementId]) {
    return [overrides[settlementId].y, overrides[settlementId].x];
  }

  // Direct mapping from database coordinates to map coordinates
  // Database uses a coordinate system where we need to invert Y
  // Map image is 2000x1250, but coordinates seem to be in a different range

  // For Leaflet Simple CRS with bounds [[0, 0], [1250, 2000]]:
  // Y coordinate (vertical): invert from database Y
  let transformedY = 1250 - y;
  // X coordinate (horizontal): use database X directly
  let transformedX = x;

  // Ensure coordinates stay within bounds
  transformedX = Math.max(0, Math.min(MAP_CONFIG.bounds[1][1], transformedX));
  transformedY = Math.max(0, Math.min(MAP_CONFIG.bounds[1][0], transformedY));

  return [transformedY, transformedX]; // Leaflet uses [lat, lng] which is [y, x]
};

// Manual coordinate mappings based on the visual map
// These are the exact coordinates from debug mode clicks on correct positions
const COORDINATE_OVERRIDES: { [key: number]: { x: number; y: number } } = {
  1: { x: 1080, y: 455 },      // Sunspire
  4: { x: 695, y: 516 },        // Twilight Haven
  7: { x: 423, y: 395 },        // Shadow Abyss
  9: { x: 927, y: 504 },        // Blazing Spire
  14: { x: 875, y: 406 },       // Equinox Port
  15: { x: 1046, y: 685 },      // Duskfall
  19: { x: 652, y: 760 },       // Frozen Reach
  23: { x: 1450, y: 630 },      // Shadowheart (kept from global offset)
  24: { x: 812, y: 580 },       // Solaris Prime
  25: { x: 1242, y: 464 },      // Twilight Glade
  26: { x: 950, y: 230 },       // Noctis Haven (kept from global offset)
  27: { x: 1555, y: 530 },      // Skydome (kept from global offset)
  28: { x: 550, y: 631 },       // Deepforge Hold
};

// Memoized settlement icon factory
const createSettlementIcon = (settlement: WorldSettlement): Icon => {
  const settlementType = settlement.settlementType as SettlementType;
  const color = SETTLEMENT_COLORS[settlementType] || SETTLEMENT_COLORS.default;
  const size = SETTLEMENT_SIZES[settlementType] || SETTLEMENT_SIZES.default;

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.3"/>
        </filter>
      </defs>
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="#fff" stroke-width="2" filter="url(#shadow)"/>
      <text x="12" y="16" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">
        ${settlementType[0]}
      </text>
    </svg>`;

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgString)}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    className: `settlement-icon settlement-${settlementType.toLowerCase()}`,
  });
};

// Error component
const MapError: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="h-full flex items-center justify-center bg-background">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 mx-auto mb-4 bg-destructive/20 rounded-lg flex items-center justify-center">
        <span className="text-3xl">⚠️</span>
      </div>
      <h2 className="text-2xl font-bold mb-2">Map Error</h2>
      <p className="text-muted-foreground mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
);

// Loading component
const MapLoading: React.FC = () => (
  <div className="h-full flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading world map...</p>
    </div>
  </div>
);

// Settlement popup component
const SettlementPopup: React.FC<{
  settlement: WorldSettlement;
  onViewDetails: () => void;
}> = ({ settlement, onViewDetails }) => (
  <div className="p-2 min-w-[200px]">
    <h3 className="font-bold text-lg mb-2">{settlement.name}</h3>
    <dl className="space-y-1 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Type:</dt>
        <dd className="font-medium">{settlement.settlementType}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Population:</dt>
        <dd className="font-medium">{settlement.population.toLocaleString()}</dd>
      </div>
      {settlement.tradeImportance > 0 && (
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Trade:</dt>
          <dd className="font-medium">
            <span className="inline-flex items-center gap-1">
              {settlement.tradeImportance}/10
              {settlement.tradeImportance >= 7 && <span title="Major Trade Hub">⭐</span>}
            </span>
          </dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Coords:</dt>
        <dd className="font-mono text-xs">
          ({settlement.xCoordinate}, {settlement.yCoordinate})
        </dd>
      </div>
      {settlement.ownerName && (
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Owner:</dt>
          <dd className="font-medium truncate max-w-[120px]" title={settlement.ownerName}>
            {settlement.ownerName}
          </dd>
        </div>
      )}
    </dl>
    <button
      onClick={onViewDetails}
      className="mt-3 w-full px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm font-medium"
      aria-label={`View details for ${settlement.name}`}
    >
      View Details
    </button>
  </div>
);

// Map controller component for bounds and events
const MapController: React.FC<{ debugMode: boolean; onMapClick: (e: any) => void }> = ({ debugMode, onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(MAP_CONFIG.bounds);
  }, [map]);

  useEffect(() => {
    if (debugMode) {
      map.on('click', onMapClick);
      return () => {
        map.off('click', onMapClick);
      };
    }
  }, [map, debugMode, onMapClick]);

  return null;
};

// Legend component
const MapLegend: React.FC = () => (
  <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg z-[1000]">
    <h4 className="font-semibold mb-2 text-sm">Settlement Types</h4>
    <div className="space-y-1.5 text-xs">
      {(Object.keys(SETTLEMENT_COLORS) as Array<keyof typeof SETTLEMENT_COLORS>)
        .filter(key => key !== 'default')
        .map(settlementType => (
          <div key={settlementType} className="flex items-center gap-2">
            <div
              className="rounded-full border border-white/20"
              style={{
                backgroundColor: SETTLEMENT_COLORS[settlementType],
                width: `${SETTLEMENT_SIZES[settlementType] / 2}px`,
                height: `${SETTLEMENT_SIZES[settlementType] / 2}px`,
              }}
              aria-hidden="true"
            />
            <span>{settlementType}</span>
          </div>
        ))}
    </div>
  </div>
);

// Main component
export const WorldMap: React.FC<WorldMapProps> = ({
  visibilityMode = 'public',
  viewMode = 'political',
  onSettlementSelect,
  filterFactionId,
  showLegend = true,
  debugMode = false,
  coordinateOverrides = COORDINATE_OVERRIDES,
}) => {
  const navigate = useNavigate();
  const [state, setState] = useState<MapState>({
    settlements: [],
    isLoading: true,
    error: null,
    selectedSettlementId: null,
  });
  const [debugCoords, setDebugCoords] = useState<{ x: number; y: number } | null>(null);

  // Load settlements
  const loadSettlements = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Fetch settlements based on visibility mode
      const data = await settlementApi.getPublicSettlements();

      // Transform to WorldSettlement format
      const worldSettlements: WorldSettlement[] = data.map(s => ({
        settlementId: s.settlement_id,
        name: s.name,
        xCoordinate: s.x_coordinate,
        yCoordinate: s.y_coordinate,
        settlementType: s.settlement_type,
        population: s.population,
        factionId: s.dominant_faction,
        isAccessible: s.public_view,
        tradeImportance: s.trade_importance,
        ownerName: s.owner_name,
      }));

      setState(prev => ({ 
        ...prev, 
        settlements: worldSettlements, 
        isLoading: false 
      }));
    } catch (err) {
      console.error('Failed to load settlements:', err);
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Failed to load world map data', 
        isLoading: false 
      }));
    }
  }, [visibilityMode]);

  useEffect(() => {
    loadSettlements();
  }, [loadSettlements]);

  // Filter settlements based on faction
  const filteredSettlements = useMemo(() => {
    if (!filterFactionId) return state.settlements;
    return state.settlements.filter(s => s.factionId === filterFactionId);
  }, [state.settlements, filterFactionId]);

  // Memoize settlement icons
  const settlementIcons = useMemo(() => {
    const iconCache = new Map<string, Icon>();
    
    filteredSettlements.forEach(settlement => {
      const key = `${settlement.settlementType}-${settlement.settlementId}`;
      if (!iconCache.has(key)) {
        iconCache.set(key, createSettlementIcon(settlement));
      }
    });
    
    return iconCache;
  }, [filteredSettlements]);

  // Handle map click for debug mode
  const handleMapClick = useCallback((e: any) => {
    if (debugMode) {
      const { lat, lng } = e.latlng;
      setDebugCoords({ x: lng, y: lat });
      console.log(`Map clicked at: X=${lng}, Y=${lat}`);
    }
  }, [debugMode]);

  // Handle settlement click
  const handleSettlementClick = useCallback((settlementId: number) => {
    setState(prev => ({ ...prev, selectedSettlementId: settlementId }));
    
    if (onSettlementSelect) {
      onSettlementSelect(settlementId);
    } else {
      navigate(`/settlement/${settlementId}`);
    }
  }, [navigate, onSettlementSelect]);

  // Render states
  if (state.isLoading) return <MapLoading />;
  if (state.error) return <MapError error={state.error} onRetry={loadSettlements} />;
  
  if (filteredSettlements.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">
            {filterFactionId 
              ? 'No settlements found for this faction' 
              : 'No settlements found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <MapContainer
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.defaultZoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        className="h-full w-full"
        style={{ background: MAP_CONFIG.backgroundColor }}
        crs={CRS.Simple}
        maxBounds={MAP_CONFIG.bounds}
        maxBoundsViscosity={1.0}
        attributionControl={false}
      >
        {/* Custom map image overlay */}
        <ImageOverlay
          url="/Map-InGame-v1.png"
          bounds={MAP_CONFIG.bounds}
          opacity={1}
        />

        <MapController debugMode={debugMode} onMapClick={handleMapClick} />

        {/* Settlement markers */}
        {filteredSettlements.map((settlement) => {
          const icon = settlementIcons.get(`${settlement.settlementType}-${settlement.settlementId}`);
          const [y, x] = transformCoordinates(
            settlement.xCoordinate, 
            settlement.yCoordinate,
            coordinateOverrides,
            settlement.settlementId
          );
          
          return (
            <Marker
              key={settlement.settlementId}
              position={[y, x]}
              icon={icon}
              eventHandlers={{
                click: () => handleSettlementClick(settlement.settlementId),
              }}
            >
              <Popup>
                <SettlementPopup
                  settlement={settlement}
                  onViewDetails={() => handleSettlementClick(settlement.settlementId)}
                />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      {showLegend && <MapLegend />}

      {/* Debug Mode Overlay */}
      {debugMode && (
        <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg z-[1001] max-w-xs">
          <h4 className="font-semibold mb-2 text-sm">Debug Mode</h4>
          <div className="space-y-2 text-xs font-mono">
            {debugCoords && (
              <div className="border-b pb-2">
                <div>Last Click:</div>
                <div>X: {debugCoords.x.toFixed(1)}</div>
                <div>Y: {debugCoords.y.toFixed(1)}</div>
              </div>
            )}
            <div className="text-[10px] opacity-70">
              <div>Click map to get coordinates</div>
              <div>Use these values in COORDINATE_OVERRIDES</div>
            </div>
          </div>
        </div>
      )}

      {/* Optional: Settlement count indicator */}
      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg z-[1000]">
        <span className="text-xs text-muted-foreground">
          Showing {filteredSettlements.length} settlement{filteredSettlements.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};