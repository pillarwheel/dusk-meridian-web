import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Building, Shield, Coins, Map, RefreshCw } from 'lucide-react';
import { settlementApi } from '@/api/endpoints/settlement';
import { PixiSettlementMap } from '@/components/map/PixiSettlementMap';
import { getSettlementImage, getSettlementImageById, getSettlementImageByName, getDefaultSettlementImage } from '@/data/settlementImages';
import { settlementCacheService } from '@/services/settlementCacheService';

interface Settlement {
  settlementId: number;
  name: string;
  continentId: number;
  regionId: number;
  subRegion?: string;
  settlementType: 'City' | 'Town' | 'Village' | 'Stronghold';
  population: number;
  dominantFaction?: number;
  governmentType?: string;
  tradeImportance: number;
  xCoordinate: number;
  yCoordinate: number;
  zCoordinate: number;
  militarySignificance?: string;
  resources?: string;
}

interface SettlementBuilding {
  buildingId: number;
  settlementId: number;
  name: string;
  type: string;
  xCoordinate: number;
  yCoordinate: number;
  zCoordinate: number;
  isDestroyed: boolean;
  isDamaged: boolean;
  isActive: boolean;
  prefabPath?: string;
  prefabName?: string;
}

interface SettlementPopulation {
  total: number;
  byBuilding: Array<{
    buildingId: number;
    buildingName: string;
    characters: Array<{
      characterId: number;
      name: string;
      level: number;
      class: string;
      xCoordinate?: number;
      yCoordinate?: number;
      zCoordinate?: number;
    }>;
  }>;
  outdoor: Array<{
    characterId: number;
    name: string;
    level: number;
    class: string;
    xCoordinate?: number;
    yCoordinate?: number;
    zCoordinate?: number;
  }>;
}

export const SettlementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [buildings, setBuildings] = useState<SettlementBuilding[]>([]);
  const [population, setPopulation] = useState<SettlementPopulation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuildingsUpdating, setIsBuildingsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'overview' | 'buildings' | 'population'>('map');
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false); // Track if we've attempted to load
  const loadingRef = React.useRef(false); // Prevent duplicate loads

  useEffect(() => {
    if (id && !loadingRef.current) {
      const settlementId = parseInt(id);
      loadSettlementData(settlementId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only re-run when id changes

  // Poll character positions every 10 seconds for real-time movement
  useEffect(() => {
    if (!id) return;

    const settlementId = parseInt(id);

    const characterPollInterval = setInterval(async () => {
      console.log('🔄 Polling character positions...');
      try {
        const freshPopulation = await settlementApi.getSettlementPopulation(settlementId);
        setPopulation(freshPopulation);
      } catch (err) {
        console.error('Failed to poll character positions:', err);
      }
    }, 10000); // 10 seconds

    return () => clearInterval(characterPollInterval);
  }, [id]);

  const loadSettlementData = async (settlementId: number) => {
    // Prevent duplicate simultaneous loads
    if (loadingRef.current) {
      console.log('⏸️ Load already in progress, skipping...');
      return;
    }

    try {
      loadingRef.current = true;
      setIsLoading(true);
      setError(null);

      // Step 1: Load cached buildings immediately if available
      const hasCachedBuildings = await settlementCacheService.hasCachedBuildings(settlementId);

      if (hasCachedBuildings) {
        console.log('🚀 Loading cached buildings for fast initial render');
        const cachedBuildings = await settlementCacheService.getCachedBuildings(settlementId);
        setBuildings(cachedBuildings);

        // Show initial view quickly
        setIsLoading(false);
      }

      // Step 2: Fetch fresh data in parallel
      const [settlementData, freshBuildingsData, populationData] = await Promise.allSettled([
        settlementApi.getSettlement(settlementId),
        settlementApi.getSettlementBuildings(settlementId),
        settlementApi.getSettlementPopulation(settlementId),
      ]);

      // Update settlement info (rarely changes, but always update)
      if (settlementData.status === 'fulfilled') {
        setSettlement(settlementData.value);
      } else {
        console.error('Failed to load settlement:', settlementData.reason);
      }

      // Update population (always use fresh data)
      if (populationData.status === 'fulfilled') {
        setPopulation(populationData.value);
      } else {
        console.error('Failed to load population:', populationData.reason);
      }

      // Step 3: Compare building data and only update if changed
      if (freshBuildingsData.status === 'fulfilled') {
        const freshBuildings = freshBuildingsData.value;

        // Compare with cache
        const comparison = await settlementCacheService.compareBuildingData(
          settlementId,
          freshBuildings
        );

        if (comparison.hasChanged) {
          console.log('🔄 Building layout changed, updating...');

          // Show updating indicator only if we had cached data
          if (hasCachedBuildings) {
            setIsBuildingsUpdating(true);
          }

          // Update buildings
          setBuildings(freshBuildings);

          // Cache the new data (non-blocking, errors are logged but don't fail the load)
          settlementCacheService.cacheBuildingData(settlementId, freshBuildings)
            .catch(err => console.warn('Cache update failed (non-critical):', err));

          // Hide updating indicator after a brief delay
          if (hasCachedBuildings) {
            setTimeout(() => {
              setIsBuildingsUpdating(false);
            }, 500);
          }

          // Log changes
          if (comparison.changesSummary) {
            console.log('Building changes:', comparison.changesSummary);
          }
        } else {
          console.log('✅ Buildings unchanged, using cached data');
        }
      } else {
        console.error('Failed to load buildings:', freshBuildingsData.reason);

        // If we failed to get fresh data but have cache, keep using cache
        if (!hasCachedBuildings) {
          // Only show error if we have no cached data at all
          setError('Failed to load building data');
        }
      }

      if (settlementData.status === 'rejected' && !hasCachedBuildings) {
        setError('Failed to load settlement details');
      }
    } catch (err) {
      console.error('Failed to load settlement data:', err);
      setError('Failed to load settlement details');
    } finally {
      setIsLoading(false);
      setHasAttemptedLoad(true); // Mark that we've attempted to load
      loadingRef.current = false;
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading settlement details...</p>
        </div>
      </div>
    );
  }

  // Only show error after we've attempted to load (prevents flash of error on initial render)
  if (hasAttemptedLoad && (error || !settlement)) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-lg flex items-center justify-center">
            <MapPin className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Settlement Not Found</h2>
          <p className="text-muted-foreground mb-4">{error || 'The requested settlement could not be found.'}</p>
          <button
            onClick={() => navigate('/settlements')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Settlements
          </button>
        </div>
      </div>
    );
  }

  // Safety check: if settlement is still null but we haven't attempted load yet, show loading
  if (!settlement) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading settlement details...</p>
        </div>
      </div>
    );
  }

  const typeColor = {
    City: 'bg-blue-100 text-blue-800',
    Town: 'bg-green-100 text-green-800',
    Village: 'bg-yellow-100 text-yellow-800',
    Stronghold: 'bg-red-100 text-red-800',
  };

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <div className="bg-card border-b border-border px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Left: Back button and settlement name */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/settlements')}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{settlement.name}</h1>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor[settlement.settlementType]}`}>
                  {settlement.settlementType}
                </span>
              </div>
            </div>

            {/* Right: Quick stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{settlement.population.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{buildings.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{settlement.tradeImportance}/10</span>
              </div>
              <div className="text-xs text-muted-foreground">
                ({settlement.xCoordinate.toFixed(0)}, {settlement.yCoordinate.toFixed(0)})
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex space-x-6 mt-3">
            {[
              { id: 'map', label: 'Map View', icon: Map },
              { id: 'overview', label: 'Overview', icon: MapPin },
              { id: 'buildings', label: `Buildings (${buildings.length})`, icon: Building },
              { id: 'population', label: `Population (${population?.total || 0})`, icon: Users },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 pb-2 px-1 border-b-2 font-medium text-xs transition-colors ${
                  activeTab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 relative min-h-0">{activeTab === 'map' && (
          <div className="absolute inset-0">
            <PixiSettlementMap
              settlementId={settlement.settlementId}
              settlementName={settlement.name}
              buildings={buildings}
              characters={population?.outdoor.map(c => ({
                characterId: c.characterId,
                name: c.name,
                class: c.class,
                level: c.level,
                xCoordinate: c.xCoordinate || 0,
                yCoordinate: c.yCoordinate || 0,
                zCoordinate: c.zCoordinate || 0,
                health: { current: 100, max: 100 },
                isPlayer: true,
              })) || []}
              onBuildingSelect={(building) => {
                console.log('Building selected:', building);
              }}
              onRefresh={() => {
                if (id) {
                  loadSettlementData(parseInt(id));
                }
              }}
            />
            {/* Building update indicator */}
            {isBuildingsUpdating && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-[1001]">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Updating building layout...</span>
              </div>
            )}
          </div>
        )}
        {activeTab === 'overview' && (
          <div className="absolute inset-0 overflow-auto">
            <div className="p-6">
              <div className="max-w-6xl mx-auto space-y-6">
            {/* City Image */}
            {(() => {
              const imageUrl = getSettlementImage(settlement.settlementId) || getSettlementImage(settlement.name) || getDefaultSettlementImage();
              return imageUrl && (
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={settlement.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Population</h3>
              </div>
              <p className="text-2xl font-bold">{settlement.population.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total inhabitants</p>
            </div>

            {settlement.governmentType && (
              <div className="bg-card p-6 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold">Government</h3>
                </div>
                <p className="text-lg font-medium">{settlement.governmentType}</p>
                <p className="text-sm text-muted-foreground">Type of governance</p>
              </div>
            )}

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Coins className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold">Trade Importance</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(10)].map((_, i) => (
                    <span
                      key={i}
                      className={`w-3 h-3 mr-1 rounded-full ${
                        i < settlement.tradeImportance ? 'bg-yellow-400' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{settlement.tradeImportance}/10</span>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Building className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">Buildings</h3>
              </div>
              <p className="text-2xl font-bold">{buildings.length}</p>
              <p className="text-sm text-muted-foreground">
                {buildings.filter(b => b.isActive).length} active, {buildings.filter(b => b.isDamaged).length} damaged
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold">Location</h3>
              </div>
              <p className="text-sm">
                <strong>Continent:</strong> {settlement.continentId}<br/>
                <strong>Region:</strong> {settlement.regionId}<br/>
                <strong>Coordinates:</strong> ({settlement.xCoordinate.toFixed(1)}, {settlement.yCoordinate.toFixed(1)}, {settlement.zCoordinate.toFixed(1)})
              </p>
            </div>
          </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'buildings' && (
          <div className="absolute inset-0 overflow-auto">
            <div className="p-6">
              <div className="max-w-6xl mx-auto space-y-4">
            {buildings.length === 0 ? (
              <div className="text-center py-12">
                <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Buildings Found</h3>
                <p className="text-muted-foreground">This settlement currently has no recorded buildings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {buildings.map((building) => (
                  <div
                    key={building.settlementBuildingId}
                    className={`bg-card p-4 rounded-lg border transition-colors ${
                      building.isDestroyed
                        ? 'border-red-200 bg-red-50/50'
                        : building.isDamaged
                        ? 'border-yellow-200 bg-yellow-50/50'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{building.name}</h4>
                      <div className="flex gap-1">
                        {building.isDestroyed && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Destroyed</span>
                        )}
                        {building.isDamaged && !building.isDestroyed && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Damaged</span>
                        )}
                        {building.isActive && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Active</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Type: {building.type}</p>
                    <p className="text-xs text-muted-foreground">
                      Position: ({building.xCoordinate}, {building.yCoordinate}, {building.zCoordinate})
                    </p>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
          </div>
        )}

        {activeTab === 'population' && (
          <div className="absolute inset-0 overflow-auto">
            <div className="p-6">
              <div className="max-w-6xl mx-auto space-y-6">
            {population && population.total > 0 ? (
              <>
                <div className="bg-card p-4 rounded-lg border border-border">
                  <h3 className="font-semibold mb-2">Population Overview</h3>
                  <p className="text-2xl font-bold text-primary">{population.total.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total characters in settlement</p>
                </div>

                {population.byBuilding.length === 0 && population.outdoor.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Debug:</strong> Population total is {population.total}, but no character details are available.
                      Check browser console for API response details.
                    </p>
                  </div>
                )}

                {/* Characters grouped by building */}
                {population.byBuilding.map((buildingGroup) => (
                  <div key={buildingGroup.buildingId} className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                      <Building className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-lg">{buildingGroup.buildingName}</h3>
                      <span className="text-sm text-muted-foreground">({buildingGroup.characters.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {buildingGroup.characters.map((character) => (
                        <div
                          key={character.characterId}
                          className="bg-card p-3 rounded-lg border border-border hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigate(`/character/${character.characterId}`)}
                        >
                          <h4 className="font-medium text-sm">{character.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Level {character.level} {character.class}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Outdoor characters */}
                {population.outdoor.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-lg">Outside</h3>
                      <span className="text-sm text-muted-foreground">({population.outdoor.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {population.outdoor.map((character) => (
                        <div
                          key={character.characterId}
                          className="bg-card p-3 rounded-lg border border-border hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigate(`/character/${character.characterId}`)}
                        >
                          <h4 className="font-medium text-sm">{character.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Level {character.level} {character.class}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Population Data</h3>
                <p className="text-muted-foreground">Population information is not available for this settlement.</p>
              </div>
            )}
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};