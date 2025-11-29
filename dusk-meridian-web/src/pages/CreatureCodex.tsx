import React, { useState, useEffect } from 'react';
import { ArrowLeft, Skull, Search, Filter, Info, Swords, Package, TrendingUp } from 'lucide-react';
import {
  getAllCreatureImages,
  getCreaturesByZone as getLocalCreaturesByZone,
  getCreaturesByThreatLevel as getLocalCreaturesByThreatLevel,
  getAllZones,
  getAllThreatLevels,
  getCreatureImageByName,
  type CreatureImageData,
  type CreatureZone,
  type CreatureThreatLevel
} from '@/data/creatureImages';
import { populateCreatureData } from '@/utils/creatureDataPopulator';
import { creatureCodexApi, type CreatureDetail, type CreatureListItem } from '@/api/endpoints/creatureCodex';

type ViewMode = 'overview' | 'gallery' | 'detail';
type FilterMode = 'all' | 'zone' | 'threat';

// Merged creature type combining API and local data
interface MergedCreature extends Partial<CreatureDetail> {
  name: string;
  imagePath: string;
  zone: string;
  threatLevel: string;
  type: string;
  levelRange: string;
  description: string;
  size?: string;
  lore?: string;
  abilities?: any[];
  resources?: any[];
  combatPhases?: any[];
  fromApi?: boolean;
}

export const CreatureCodex: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedCreature, setSelectedCreature] = useState<MergedCreature | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiCreatures, setApiCreatures] = useState<CreatureListItem[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const localCreatures = getAllCreatureImages();
  const zones = getAllZones();
  const threatLevels = getAllThreatLevels();

  // Fetch creatures from API
  useEffect(() => {
    const fetchCreatures = async () => {
      try {
        setIsLoadingApi(true);
        const response = await creatureCodexApi.getCreatures({ pageSize: 100 });
        setApiCreatures(response.data);
        setApiError(null);
      } catch (error) {
        console.error('Failed to fetch creatures from API:', error);
        setApiError('Using offline data only');
      } finally {
        setIsLoadingApi(false);
      }
    };

    fetchCreatures();

    // Auto-populate creature cache on component mount
    populateCreatureData().catch(err => {
      console.log('Creature cache population (background):', err.message);
    });
  }, []);

  // Merge API creatures with local image data
  const mergeCreatures = (): MergedCreature[] => {
    const merged: MergedCreature[] = [];

    // Add API creatures with images
    apiCreatures.forEach(apiCreature => {
      const localImage = getCreatureImageByName(apiCreature.creatureName);

      merged.push({
        codexId: apiCreature.codexId,
        creatureName: apiCreature.creatureName,
        name: apiCreature.creatureName,
        imagePath: localImage?.imagePath || '/Images/Creatures/Void_Hunter.png',
        zone: apiCreature.environmentalZone,
        threatLevel: apiCreature.threatLevel,
        type: apiCreature.creatureType,
        levelRange: `${apiCreature.estimatedLevelMin}-${apiCreature.estimatedLevelMax}`,
        description: localImage?.description || `A ${apiCreature.threatLevel} ${apiCreature.creatureType} found in the ${apiCreature.environmentalZone}.`,
        size: apiCreature.size,
        lore: localImage?.lore,
        abilities: localImage?.abilities,
        resources: localImage?.resources,
        fromApi: true
      });
    });

    // Add local creatures that don't exist in API
    localCreatures.forEach(localCreature => {
      const existsInApi = apiCreatures.some(
        api => api.creatureName.toLowerCase() === localCreature.name.toLowerCase()
      );

      if (!existsInApi) {
        merged.push({
          name: localCreature.name,
          imagePath: localCreature.imagePath,
          zone: localCreature.zone,
          threatLevel: localCreature.threatLevel,
          type: localCreature.type,
          levelRange: localCreature.levelRange,
          description: localCreature.description,
          size: localCreature.size,
          lore: localCreature.lore,
          abilities: localCreature.abilities,
          resources: localCreature.resources,
          fromApi: false
        });
      }
    });

    return merged;
  };

  const allCreatures = mergeCreatures();

  // Filter creatures based on current filters
  const getFilteredCreatures = (): MergedCreature[] => {
    let creatures = allCreatures;

    if (filterMode === 'zone' && selectedZone) {
      creatures = creatures.filter(c => c.zone === selectedZone);
    } else if (filterMode === 'threat' && selectedThreat) {
      creatures = creatures.filter(c => c.threatLevel === selectedThreat);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      creatures = creatures.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.zone.toLowerCase().includes(query)
      );
    }

    return creatures;
  };

  const filteredCreatures = getFilteredCreatures();

  // Fetch detailed creature data when selecting a creature
  const handleCreatureSelect = async (creature: MergedCreature) => {
    if (creature.fromApi && creature.codexId) {
      try {
        const detailedCreature = await creatureCodexApi.getCreatureById(creature.codexId);
        const localImage = getCreatureImageByName(detailedCreature.creatureName);

        setSelectedCreature({
          ...detailedCreature,
          name: detailedCreature.creatureName,
          imagePath: localImage?.imagePath || creature.imagePath,
          zone: detailedCreature.environmentalZone,
          threatLevel: detailedCreature.threatLevel,
          type: detailedCreature.creatureType,
          levelRange: `${detailedCreature.estimatedLevelMin}-${detailedCreature.estimatedLevelMax}`,
          description: localImage?.description || detailedCreature.loreDescription,
          lore: localImage?.lore || detailedCreature.behaviorDescription,
          fromApi: true
        });
      } catch (error) {
        console.error('Failed to fetch detailed creature data:', error);
        setSelectedCreature(creature);
      }
    } else {
      setSelectedCreature(creature);
    }

    setViewMode('detail');
  };

  // Threat level color coding (supports both local and API threat levels)
  const getThreatColor = (threat: string): string => {
    const normalizedThreat = threat.toLowerCase();

    // API threat levels: Passive, Cautious, Aggressive, Lethal, Apex
    // Local threat levels: Fodder, Standard, Elite, MiniBoss, WorldBoss, Environmental

    if (normalizedThreat.includes('passive')) return 'bg-green-100 text-green-800';
    if (normalizedThreat.includes('cautious')) return 'bg-yellow-100 text-yellow-800';
    if (normalizedThreat.includes('aggressive')) return 'bg-orange-100 text-orange-800';
    if (normalizedThreat.includes('lethal')) return 'bg-purple-100 text-purple-800';
    if (normalizedThreat.includes('apex')) return 'bg-red-100 text-red-800';
    if (normalizedThreat.includes('fodder')) return 'bg-gray-100 text-gray-800';
    if (normalizedThreat.includes('standard')) return 'bg-green-100 text-green-800';
    if (normalizedThreat.includes('elite')) return 'bg-blue-100 text-blue-800';
    if (normalizedThreat.includes('miniboss')) return 'bg-purple-100 text-purple-800';
    if (normalizedThreat.includes('worldboss')) return 'bg-red-100 text-red-800';
    if (normalizedThreat.includes('environmental')) return 'bg-yellow-100 text-yellow-800';

    return 'bg-gray-100 text-gray-800';
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Creature Codex</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          A comprehensive Monster Manual documenting the dangerous fauna of Dusk Meridian.
          From fodder creatures to world bosses, learn about the threats that await in each climate zone.
        </p>
        <div className="flex justify-center space-x-8 text-sm">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{allCreatures.length}</p>
            <p className="text-muted-foreground">Total Creatures</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-400">3</p>
            <p className="text-muted-foreground">World Bosses</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">{zones.length}</p>
            <p className="text-muted-foreground">Climate Zones</p>
          </div>
        </div>
      </div>

      {/* Browse by Zone */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <Filter className="w-6 h-6" />
          <span>Browse by Zone</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(new Set(allCreatures.map(c => c.zone)))
            .filter(z => z !== 'All Zones')
            .map(zone => {
              const zoneCreatures = allCreatures.filter(c => c.zone === zone);
              return (
                <button
                  key={zone}
                  onClick={() => {
                    setFilterMode('zone');
                    setSelectedZone(zone);
                    setViewMode('gallery');
                  }}
                  className="bg-card p-6 rounded-lg border border-border hover:border-primary transition-colors text-left"
                >
                  <h3 className="text-lg font-semibold mb-2">{zone}</h3>
                  <p className="text-sm text-muted-foreground">{zoneCreatures.length} creatures documented</p>
                </button>
              );
            })}
        </div>
      </div>

      {/* Browse by Threat Level */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <Skull className="w-6 h-6" />
          <span>Browse by Threat Level</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from(new Set(allCreatures.map(c => c.threatLevel))).map(threat => {
            const threatCreatures = allCreatures.filter(c => c.threatLevel === threat);
            return (
              <button
                key={threat}
                onClick={() => {
                  setFilterMode('threat');
                  setSelectedThreat(threat);
                  setViewMode('gallery');
                }}
                className={`p-4 rounded-lg border-2 hover:scale-105 transition-transform text-center ${getThreatColor(threat)}`}
              >
                <p className="font-bold text-lg">{threatCreatures.length}</p>
                <p className="text-xs font-medium">{threat}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* View All Button */}
      <div className="text-center">
        <button
          onClick={() => {
            setFilterMode('all');
            setViewMode('gallery');
          }}
          className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          View All Creatures ({allCreatures.length})
        </button>
      </div>
    </div>
  );

  const renderGallery = () => (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewMode('overview')}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Overview</span>
        </button>

        <div className="text-right">
          <h2 className="text-2xl font-bold">
            {filterMode === 'zone' && selectedZone && `${selectedZone} Creatures`}
            {filterMode === 'threat' && selectedThreat && `${selectedThreat} Creatures`}
            {filterMode === 'all' && 'All Creatures'}
          </h2>
          <p className="text-sm text-muted-foreground">{filteredCreatures.length} creatures found</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="Search creatures..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Creature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCreatures.map(creature => (
          <button
            key={creature.codexId || creature.name}
            onClick={() => handleCreatureSelect(creature)}
            className="bg-card rounded-lg border border-border overflow-hidden hover:border-primary transition-colors text-left group"
          >
            {/* Creature Image */}
            <div className="w-full h-48 overflow-hidden bg-background">
              <img
                src={creature.imagePath}
                alt={creature.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Creature Info */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold">{creature.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getThreatColor(creature.threatLevel)}`}>
                  {creature.threatLevel}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium">{creature.zone}</span>
                <span>Level {creature.levelRange}</span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">{creature.description}</p>
            </div>
          </button>
        ))}
      </div>

      {filteredCreatures.length === 0 && (
        <div className="text-center py-12">
          <Info className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Creatures Found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );

  const renderDetail = () => {
    if (!selectedCreature) return null;

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setViewMode('gallery')}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Gallery</span>
        </button>

        {/* Creature Detail Card */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Large Image */}
            <div className="w-full h-96 lg:h-full min-h-[24rem]">
              <img
                src={selectedCreature.imagePath}
                alt={selectedCreature.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Detailed Information */}
            <div className="p-8 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h1 className="text-3xl font-bold">{selectedCreature.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getThreatColor(selectedCreature.threatLevel)}`}>
                    {selectedCreature.threatLevel}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="font-medium">{selectedCreature.zone}</span>
                  <span>•</span>
                  <span>Level {selectedCreature.levelRange}</span>
                  <span>•</span>
                  <span>{selectedCreature.type}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">DESCRIPTION</h3>
                <p className="leading-relaxed">{selectedCreature.description}</p>
              </div>

              {/* Stats */}
              {selectedCreature.size && (
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">SIZE</h4>
                  <p className="text-lg font-bold">{selectedCreature.size}</p>
                </div>
              )}

              {/* Abilities */}
              {selectedCreature.abilities && selectedCreature.abilities.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">ABILITIES</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCreature.abilities.map((ability, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
                      >
                        {typeof ability === 'object' ? ability.abilityName : ability}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {selectedCreature.resources && selectedCreature.resources.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">RESOURCE DROPS</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCreature.resources.map((resource, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-yellow-500/20 text-yellow-600 rounded-full text-sm font-medium"
                      >
                        {typeof resource === 'object' ? resource.resourceName : resource}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Lore */}
              {selectedCreature.lore && (
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-primary mb-2">LORE & HISTORY</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{selectedCreature.lore}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* API Data: Combat Stats */}
        {selectedCreature.fromApi && selectedCreature.estimatedHealth && (
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Combat Statistics</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Health</p>
                <p className="text-2xl font-bold text-green-400">{selectedCreature.estimatedHealth?.toLocaleString()}</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Damage</p>
                <p className="text-2xl font-bold text-red-400">{selectedCreature.estimatedDamage?.toLocaleString()}</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Armor</p>
                <p className="text-2xl font-bold text-blue-400">{selectedCreature.estimatedArmor}</p>
              </div>
              <div className="bg-background/50 p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Speed</p>
                <p className="text-2xl font-bold text-yellow-400">{selectedCreature.estimatedSpeed?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* API Data: Abilities */}
        {selectedCreature.fromApi && selectedCreature.abilities && selectedCreature.abilities.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Swords className="w-5 h-5" />
              <span>Abilities & Attacks</span>
            </h2>
            <div className="space-y-4">
              {selectedCreature.abilities.map((ability: any, idx: number) => (
                <div key={idx} className="bg-background/50 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{ability.abilityName || ability}</h3>
                      {ability.abilityType && (
                        <p className="text-xs text-muted-foreground">{ability.abilityType} • {ability.damageType}</p>
                      )}
                    </div>
                    {ability.estimatedDamage && (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-bold">
                        {ability.estimatedDamage} DMG
                      </span>
                    )}
                  </div>
                  {ability.description && (
                    <p className="text-sm mb-2">{ability.description}</p>
                  )}
                  {ability.counterStrategies && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2 text-xs">
                      <strong className="text-blue-400">Strategy:</strong> {ability.counterStrategies}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    {ability.cooldownSeconds && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                        CD: {ability.cooldownSeconds}s
                      </span>
                    )}
                    {ability.rangeMeters && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">
                        Range: {ability.rangeMeters}m
                      </span>
                    )}
                    {ability.aoeRadius && ability.aoeRadius > 0 && (
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
                        AOE: {ability.aoeRadius}m
                      </span>
                    )}
                    {ability.phaseNumber && (
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">
                        Phase {ability.phaseNumber}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Data: Resource Drops */}
        {selectedCreature.fromApi && selectedCreature.resources && selectedCreature.resources.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Resource Drops</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedCreature.resources.map((resource: any, idx: number) => (
                <div key={idx} className="bg-background/50 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold">{resource.resourceName || resource}</h3>
                      {resource.rarity && (
                        <span className={`text-xs font-medium ${
                          resource.rarity === 'Legendary' ? 'text-orange-400' :
                          resource.rarity === 'Epic' ? 'text-purple-400' :
                          resource.rarity === 'Rare' ? 'text-blue-400' :
                          'text-green-400'
                        }`}>
                          {resource.rarity}
                        </span>
                      )}
                    </div>
                    {resource.dropRatePercentage && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">
                        {resource.dropRatePercentage}%
                      </span>
                    )}
                  </div>
                  {resource.description && (
                    <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {resource.quantityMin && (
                      <span className="px-2 py-1 bg-background rounded">
                        Qty: {resource.quantityMin}-{resource.quantityMax}
                      </span>
                    )}
                    {resource.marketValue && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                        ${resource.marketValue.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Data: Combat Phases (World Bosses) */}
        {selectedCreature.fromApi && selectedCreature.combatPhases && selectedCreature.combatPhases.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Skull className="w-5 h-5 text-red-400" />
              <span>Boss Combat Phases</span>
            </h2>
            <div className="space-y-6">
              {selectedCreature.combatPhases.map((phase: any, idx: number) => (
                <div key={idx} className="border-l-4 border-red-500 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold">Phase {phase.phaseNumber}: {phase.phaseName}</h3>
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-bold">
                      &lt;{phase.healthThresholdPercentage}% HP
                    </span>
                  </div>
                  <p className="text-sm mb-3">{phase.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-background/50 p-3 rounded">
                      <p className="font-semibold text-xs text-muted-foreground mb-1">Behavior Changes</p>
                      <p>{phase.behaviorChanges}</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded">
                      <p className="font-semibold text-xs text-muted-foreground mb-1">New Abilities</p>
                      <p>{phase.newAbilities}</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded">
                      <p className="font-semibold text-xs text-muted-foreground mb-1">Environmental Changes</p>
                      <p>{phase.environmentalChanges}</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded">
                      <p className="font-semibold text-xs text-muted-foreground mb-1">Transition</p>
                      <p>{phase.transitionDescription}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Creatures from Same Zone */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Other Creatures in {selectedCreature.zone}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allCreatures
              .filter(c => c.zone === selectedCreature.zone && c.name !== selectedCreature.name)
              .slice(0, 6)
              .map(creature => (
                <button
                  key={creature.codexId || creature.name}
                  onClick={() => handleCreatureSelect(creature)}
                  className="bg-card rounded-lg border border-border overflow-hidden hover:border-primary transition-colors"
                >
                  <img
                    src={creature.imagePath}
                    alt={creature.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2">
                    <p className="text-xs font-semibold truncate">{creature.name}</p>
                    <p className="text-xs text-muted-foreground">Level {creature.levelRange}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {viewMode === 'overview' && renderOverview()}
      {viewMode === 'gallery' && renderGallery()}
      {viewMode === 'detail' && renderDetail()}
    </div>
  );
};
