import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Users, Map, Zap, Sword, Globe, Building2, Crown, User } from 'lucide-react';
import { codexApi } from '@/api/endpoints/codex-simple';
import { CacheStatusWidget } from '@/components/admin/CacheStatusWidget';
import { cn } from '@/utils/cn';

// Inline types to avoid import issues
type CodexCategory = 'mechanics' | 'geography' | 'factions' | 'skills' | 'spells' | 'settlements';

interface CodexEntry {
  id: string;
  title: string;
  description: string;
  category: CodexCategory;
}

interface WorldStatistics {
  totalCharacters: number;
  totalClasses: number;
  onlinePlayers: number;
  totalSettlements: number;
  activeBattles: number;
  totalFactions: number;
  totalGuilds: number;
  worldTime: {
    currentDay: number;
    timeOfDay: number;
    season: string;
    year: number;
    serverTime: Date;
  };
  serverUptime: string;
  lastUpdated: Date;
}

interface CharacterClass {
  name: string;
  count: number;
}

interface Faction {
  id: string;
  name: string;
  memberCount: number;
  color: string;
}

interface Settlement {
  id: string;
  name: string;
  population: number;
  factionName: string;
}

interface Skill {
  name: string;
  description: string;
}

interface Spell {
  name: string;
  description: string;
}

interface CodexState {
  activeCategory: CodexCategory | 'overview';
  searchQuery: string;
  entries: CodexEntry[];
  worldStats: WorldStatistics | null;
  characterClasses: CharacterClass[];
  factions: Faction[];
  settlements: Settlement[];
  skills: Skill[];
  spells: Spell[];
  isLoading: boolean;
  error: string | null;
}

const categoryIcons = {
  overview: Globe,
  mechanics: Zap,
  geography: Map,
  factions: Crown,
  skills: Sword,
  spells: BookOpen,
  settlements: Building2
};

export const Codex: React.FC = () => {
  const [state, setState] = useState<CodexState>({
    activeCategory: 'overview',
    searchQuery: '',
    entries: [],
    worldStats: null,
    characterClasses: [],
    factions: [],
    settlements: [],
    skills: [],
    spells: [],
    isLoading: true,
    error: null
  });

  const fetchWorldStatistics = async () => {
    try {
      const stats = await codexApi.getWorldStatistics();
      setState(prev => ({ ...prev, worldStats: stats }));
    } catch (err) {
      console.error('Failed to fetch world statistics:', err);
    }
  };

  const fetchCategoryData = async (category: CodexCategory) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      switch (category) {
        case 'mechanics':
          const [classes, skills, spells] = await Promise.all([
            codexApi.getCharacterClasses(),
            codexApi.getSkills(),
            codexApi.getSpells()
          ]);
          setState(prev => ({
            ...prev,
            characterClasses: classes,
            skills: skills.slice(0, 20), // Limit for display
            spells: spells.slice(0, 20),
            isLoading: false
          }));
          break;

        case 'geography':
          const settlements = await codexApi.getSettlements();
          setState(prev => ({
            ...prev,
            settlements: settlements.slice(0, 50), // Limit for display
            isLoading: false
          }));
          break;

        case 'factions':
          const factions = await codexApi.getFactions();
          setState(prev => ({
            ...prev,
            factions,
            isLoading: false
          }));
          break;

        default:
          const response = await codexApi.getCodexByCategory(category);
          setState(prev => ({
            ...prev,
            entries: response.data,
            isLoading: false
          }));
          break;
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch data'
      }));
    }
  };

  const handleCategoryChange = (category: CodexCategory | 'overview') => {
    setState(prev => ({ ...prev, activeCategory: category }));

    if (category !== 'overview' && category !== state.activeCategory) {
      fetchCategoryData(category as CodexCategory);
    }
  };

  const performSearch = async () => {
    if (!state.searchQuery.trim()) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await codexApi.searchCodex({
        query: state.searchQuery,
        limit: 50
      });
      setState(prev => ({
        ...prev,
        entries: response.entries,
        isLoading: false,
        activeCategory: 'overview' // Switch to results view
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Search failed'
      }));
    }
  };

  useEffect(() => {
    fetchWorldStatistics();
    // Refresh world stats every 5 minutes
    const interval = setInterval(fetchWorldStatistics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* World Statistics */}
      {state.worldStats && (
        <div className="game-card">
          <h3 className="text-xl font-bold mb-4">Live World Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background/50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-400">{state.worldStats.totalCharacters.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Characters</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-400">{state.worldStats.totalClasses}</p>
              <p className="text-sm text-muted-foreground">Character Classes</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-400">{state.worldStats.onlinePlayers.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Online Players</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-400">{state.worldStats.totalSettlements.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Settlements</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-400">{state.worldStats.activeBattles}</p>
              <p className="text-sm text-muted-foreground">Active Battles</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-cyan-400">{state.worldStats.totalFactions}</p>
              <p className="text-sm text-muted-foreground">Factions</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-orange-400">{state.worldStats.serverUptime}</p>
              <p className="text-sm text-muted-foreground">Server Uptime</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg text-center">
              <p className="text-lg font-bold">
                Day {state.worldStats.worldTime.currentDay}, {state.worldStats.worldTime.timeOfDay.toFixed(1)}h
              </p>
              <p className="text-sm text-muted-foreground">{state.worldStats.worldTime.season} Year {state.worldStats.worldTime.year}</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-center mt-4">
            Last updated: {new Date(state.worldStats.lastUpdated).toLocaleString()}
          </div>
        </div>
      )}

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(CodexCategory).map(category => {
          const Icon = categoryIcons[category];
          return (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className="game-card text-left hover:bg-background/70 transition-colors"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Icon className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold">{category}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {category === 'mechanics' && 'Skills, spells, classes, and game mechanics'}
                {category === 'geography' && 'Continents, regions, settlements, and locations'}
                {category === 'settlements' && 'Character demographics and population data'}
                {category === 'spells' && 'History, stories, and world background'}
                {category === 'factions' && 'Political entities, guilds, and organizations'}
                {category === 'skills' && 'Materials, items, and economic data'}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderCharacterClasses = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Character Classes ({state.characterClasses.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.characterClasses.map((characterClass, index) => (
          <div key={index} className="bg-background/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{characterClass.name}</h4>
              {characterClass.count && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                  {characterClass.count} characters
                </span>
              )}
            </div>
            {characterClass.description && (
              <p className="text-sm text-muted-foreground">{characterClass.description}</p>
            )}
            {characterClass.primaryStats && (
              <div className="mt-2">
                <p className="text-xs font-medium">Primary Stats:</p>
                <p className="text-xs text-muted-foreground">{characterClass.primaryStats.join(', ')}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Skills ({state.skills.length}+)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.skills.map(skill => (
          <div key={skill.id} className="bg-background/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{skill.name}</h4>
              <span className="text-xs bg-secondary px-2 py-1 rounded">{skill.category}</span>
            </div>
            <p className="text-sm text-muted-foreground">{skill.description}</p>
            {skill.maxLevel && (
              <p className="text-xs mt-2">Max Level: {skill.maxLevel}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderSpells = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Spells ({state.spells.length}+)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.spells.map(spell => (
          <div key={spell.id} className="bg-background/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{spell.name}</h4>
              <div className="flex space-x-2">
                <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                  {spell.school}
                </span>
                <span className="text-xs bg-secondary px-2 py-1 rounded">
                  Lvl {spell.level}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{spell.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Range:</span> {spell.range}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {spell.duration}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Components:</span> {spell.components.join(', ')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettlements = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Settlements ({state.settlements.length}+)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.settlements.map(settlement => (
          <div key={settlement.id} className="bg-background/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold flex items-center space-x-2">
                <span>{settlement.name}</span>
                {settlement.isCapital && <Crown className="w-4 h-4 text-yellow-400" />}
              </h4>
              <span className="text-xs bg-secondary px-2 py-1 rounded">{settlement.type}</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{settlement.population.toLocaleString()} population</span>
              </div>
              {settlement.factionName && (
                <div>
                  <span className="font-medium">Faction:</span> {settlement.factionName}
                </div>
              )}
              {settlement.regionName && (
                <div>
                  <span className="font-medium">Region:</span> {settlement.regionName}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFactions = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Factions ({state.factions.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.factions.map(faction => (
          <div key={faction.id} className="bg-background/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold" style={{ color: faction.color || undefined }}>
                {faction.name}
              </h4>
              <div className="flex space-x-2 text-xs">
                {faction.memberCount && (
                  <span className="bg-secondary px-2 py-1 rounded">
                    {faction.memberCount} members
                  </span>
                )}
                {faction.settlementCount && (
                  <span className="bg-secondary px-2 py-1 rounded">
                    {faction.settlementCount} settlements
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{faction.description}</p>
            {faction.ideology && (
              <p className="text-xs"><span className="font-medium">Ideology:</span> {faction.ideology}</p>
            )}
            {faction.leader && (
              <p className="text-xs"><span className="font-medium">Leader:</span> {faction.leader}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    if (state.isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading codex data...</p>
          </div>
        </div>
      );
    }

    if (state.error) {
      return (
        <div className="bg-red-600/20 border border-red-600/30 text-red-400 p-6 rounded-lg">
          <h3 className="font-semibold mb-2">Error Loading Data</h3>
          <p>{state.error}</p>
        </div>
      );
    }

    switch (state.activeCategory) {
      case 'overview':
        return renderOverview();
      case 'mechanics':
        return (
          <div className="space-y-8">
            {renderCharacterClasses()}
            {renderSkills()}
            {renderSpells()}
          </div>
        );
      case 'geography':
        return renderSettlements();
      case 'factions':
        return renderFactions();
      default:
        return (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Select a category to explore the codex</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Cache Status Widget (admin tool) */}
      <CacheStatusWidget />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-3">
            <BookOpen className="w-8 h-8" />
            <span>Game Codex</span>
          </h1>
          <p className="text-muted-foreground">
            Comprehensive encyclopedia of Dusk Meridian's world, mechanics, and lore
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search the codex..."
            value={state.searchQuery}
            onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && performSearch()}
            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={performSearch}
          className="game-button px-6"
          disabled={!state.searchQuery.trim()}
        >
          Search
        </button>
      </div>

      {/* Category Navigation */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryChange('overview')}
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors",
            state.activeCategory === 'overview'
              ? "bg-primary/20 border-primary/30 text-primary"
              : "bg-secondary border-border hover:bg-secondary/80"
          )}
        >
          <Globe className="w-4 h-4" />
          <span>Overview</span>
        </button>

        {Object.values(CodexCategory).map(category => {
          const Icon = categoryIcons[category];
          return (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors",
                state.activeCategory === category
                  ? "bg-primary/20 border-primary/30 text-primary"
                  : "bg-secondary border-border hover:bg-secondary/80"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{category}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-96">
        {renderContent()}
      </div>
    </div>
  );
};