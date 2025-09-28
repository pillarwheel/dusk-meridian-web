import React, { useState, useEffect } from 'react';
import { MapPin, Filter, ChevronDown, X, Search, Globe } from 'lucide-react';
import { cn } from '@/utils/cn';
import * as CharacterCreationTypes from '@/api/types/characterCreation';
import { GeographicalTraitCard } from '../utility/GeographicalTraitCard';
import { LoadingSpinner } from '../utility/LoadingSpinner';
import { characterCreationApi } from '@/api/endpoints/characterCreation';

interface GeographicalTraitStepProps {
  selectedTrait?: CharacterCreationTypes.GeographicalTrait;
  onTraitSelect: (trait: CharacterCreationTypes.GeographicalTrait | undefined) => void;
  onValidationChange: (isValid: boolean, errors: string[]) => void;
  nftTier?: number;
}

export const GeographicalTraitStep: React.FC<GeographicalTraitStepProps> = ({
  selectedTrait,
  onTraitSelect,
  onValidationChange,
  nftTier = 1
}) => {
  const [traits, setTraits] = useState<CharacterCreationTypes.GeographicalTrait[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadTraits();
  }, []);

  useEffect(() => {
    // This step is optional, so it's always valid
    onValidationChange(true, []);
  }, [selectedTrait, onValidationChange]);

  const loadTraits = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const traitsData = await characterCreationApi.getGeographicalTraits();
      setTraits(traitsData.filter(trait => trait.isActive));

      console.log('📍 Loaded geographical traits:', traitsData);
    } catch (err) {
      console.error('Failed to load geographical traits:', err);
      setError('Failed to load geographical traits');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableRegions = () => {
    const regions = [...new Set(traits.map(trait => trait.region))];
    return regions.sort();
  };

  const getFilteredTraits = () => {
    let filtered = traits;

    // Filter by region
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(trait => trait.region === selectedRegion);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(trait =>
        trait.name.toLowerCase().includes(term) ||
        trait.description.toLowerCase().includes(term) ||
        trait.region.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const getTraitsByRegion = () => {
    const filtered = getFilteredTraits();
    const grouped = filtered.reduce((acc, trait) => {
      if (!acc[trait.region]) {
        acc[trait.region] = [];
      }
      acc[trait.region].push(trait);
      return acc;
    }, {} as Record<string, CharacterCreationTypes.GeographicalTrait[]>);

    // Sort regions alphabetically
    const sortedRegions = Object.keys(grouped).sort();
    return sortedRegions.map(region => ({
      region,
      traits: grouped[region]
    }));
  };

  const getRegionColor = (region: string) => {
    switch (region.toLowerCase()) {
      case 'northern': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'southern': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'eastern': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'western': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'central': return 'text-purple-400 bg-purple-400/20 border-purple-400/30';
      case 'coastal': return 'text-cyan-400 bg-cyan-400/20 border-cyan-400/30';
      case 'mountain': return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
      case 'desert': return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
      case 'forest': return 'text-emerald-400 bg-emerald-400/20 border-emerald-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const handleTraitSelect = (trait: CharacterCreationTypes.GeographicalTrait) => {
    if (selectedTrait?.id === trait.id) {
      // Deselect if clicking the same trait
      onTraitSelect(undefined);
    } else {
      onTraitSelect(trait);
    }
  };

  const clearSelection = () => {
    onTraitSelect(undefined);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner
          size="lg"
          message="Loading Geographical Traits"
          submessage="Fetching regional traits and bonuses..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-6 max-w-md mx-auto">
          <Globe className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Traits</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={loadTraits}
            className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredTraits = getFilteredTraits();
  const traitsByRegion = getTraitsByRegion();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Geographical Origin</h2>
        <p className="text-muted-foreground">
          Choose a regional trait that reflects your character's background and heritage (Optional)
        </p>
      </div>

      {/* Current Selection */}
      {selectedTrait && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Selected Trait</h3>
            <button
              onClick={clearSelection}
              className="px-3 py-2 text-sm bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Remove</span>
            </button>
          </div>
          <GeographicalTraitCard
            trait={selectedTrait}
            isSelected={true}
            className="bg-background"
          />
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search traits by name, description, or region..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Region Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>{selectedRegion === 'all' ? 'All Regions' : selectedRegion}</span>
              <ChevronDown className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
            </button>

            {showFilters && (
              <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-lg min-w-48 z-10">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setSelectedRegion('all');
                      setShowFilters(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg transition-colors',
                      selectedRegion === 'all' ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'
                    )}
                  >
                    All Regions ({traits.length})
                  </button>

                  {getAvailableRegions().map(region => (
                    <button
                      key={region}
                      onClick={() => {
                        setSelectedRegion(region);
                        setShowFilters(false);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between',
                        selectedRegion === region ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'
                      )}
                    >
                      <span>{region}</span>
                      <span className="text-xs text-muted-foreground">
                        {traits.filter(t => t.region === region).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-muted-foreground">
          {filteredTraits.length === traits.length
            ? `${traits.length} traits available`
            : `${filteredTraits.length} of ${traits.length} traits match your filters`
          }
        </div>
      </div>

      {/* No Selection Option */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div
          onClick={() => onTraitSelect(undefined)}
          className={cn(
            'border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50',
            !selectedTrait ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border'
          )}
        >
          <div className="flex items-center space-x-3">
            <div className={cn(
              'p-2 rounded-lg',
              !selectedTrait ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
            )}>
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold">No Regional Trait</h4>
              <p className="text-sm text-muted-foreground">
                Start with a blank slate - no regional bonuses or penalties
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Traits by Region */}
      {traitsByRegion.length > 0 ? (
        <div className="space-y-8">
          {traitsByRegion.map(({ region, traits: regionTraits }) => (
            <div key={region} className="space-y-4">
              {/* Region Header */}
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold">{region} Region</h3>
                <span className={cn('text-xs px-3 py-1 rounded-full border', getRegionColor(region))}>
                  {regionTraits.length} trait{regionTraits.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Traits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regionTraits.map(trait => (
                  <GeographicalTraitCard
                    key={trait.id}
                    trait={trait}
                    isSelected={selectedTrait?.id === trait.id}
                    onSelect={handleTraitSelect}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Traits Found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedRegion !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'No geographical traits are currently available'
            }
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
        <h4 className="font-medium text-blue-400 mb-2">About Geographical Traits</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Geographical traits are completely optional and can be skipped</p>
          <p>• They provide resistances, bonuses, and unique lore for your character</p>
          <p>• Each trait reflects the environment and culture of different regions</p>
          <p>• You can change your selection at any time before creating your character</p>
        </div>
      </div>
    </div>
  );
};