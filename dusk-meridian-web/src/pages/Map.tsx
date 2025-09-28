import React, { useState } from 'react';
import { WorldMapView } from '@/components/map/WorldMapView';
import { CharacterNeedsWidget } from '@/components/character/CharacterNeedsWidget';
import { SpellcasterProgressWidget } from '@/components/character/SpellcasterProgressWidget';
import { Globe, User, Settings } from 'lucide-react';

export const Map: React.FC = () => {
  const [selectedWorldId, setSelectedWorldId] = useState<string>('world-1');
  const [selectedCharacterId, setSelectedCharacterId] = useState<number>(1);
  const [showCharacterWidgets, setShowCharacterWidgets] = useState<boolean>(true);

  // Mock world options - in a real app these would come from an API
  const availableWorlds = [
    { id: 'world-1', name: 'Aethermoor' },
    { id: 'world-2', name: 'Shadowlands' },
    { id: 'world-3', name: 'Crystal Peaks' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Interactive World Map</h1>
          <p className="text-muted-foreground">
            Explore settlements, track factions, and monitor character progress across the realm
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* World Selection */}
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedWorldId}
              onChange={(e) => setSelectedWorldId(e.target.value)}
              className="bg-background border border-border rounded px-3 py-2 text-sm min-w-32"
            >
              {availableWorlds.map(world => (
                <option key={world.id} value={world.id}>
                  {world.name}
                </option>
              ))}
            </select>
          </div>

          {/* Character Selection */}
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <input
              type="number"
              value={selectedCharacterId}
              onChange={(e) => setSelectedCharacterId(Number(e.target.value))}
              className="w-20 px-2 py-2 bg-background border border-border rounded text-sm"
              min="1"
              placeholder="ID"
            />
          </div>

          {/* Toggle Character Widgets */}
          <button
            onClick={() => setShowCharacterWidgets(!showCharacterWidgets)}
            className={`p-2 rounded border transition-colors ${
              showCharacterWidgets
                ? 'bg-primary/20 border-primary/30 text-primary'
                : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
            }`}
            title={`${showCharacterWidgets ? 'Hide' : 'Show'} character widgets`}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Map View */}
        <div className="xl:col-span-3">
          <WorldMapView worldId={selectedWorldId} />
        </div>

        {/* Character Information Sidebar */}
        {showCharacterWidgets && (
          <div className="space-y-6">
            <div className="game-card">
              <h3 className="text-lg font-semibold mb-4">Character #{selectedCharacterId}</h3>

              {/* Character Needs */}
              <CharacterNeedsWidget
                characterId={selectedCharacterId}
                compact={true}
                className="mb-6"
              />

              {/* Spellcaster Progress */}
              <SpellcasterProgressWidget
                characterId={selectedCharacterId}
                compact={true}
              />
            </div>

            {/* Quick Actions */}
            <div className="game-card">
              <h4 className="text-md font-semibold mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left bg-background/50 hover:bg-background/70 p-3 rounded border border-border transition-colors">
                  <div className="font-medium text-sm">View Character Details</div>
                  <div className="text-xs text-muted-foreground">Full stats and inventory</div>
                </button>

                <button className="w-full text-left bg-background/50 hover:bg-background/70 p-3 rounded border border-border transition-colors">
                  <div className="font-medium text-sm">Teleport to Settlement</div>
                  <div className="text-xs text-muted-foreground">Move character to selected location</div>
                </button>

                <button className="w-full text-left bg-background/50 hover:bg-background/70 p-3 rounded border border-border transition-colors">
                  <div className="font-medium text-sm">Issue Commands</div>
                  <div className="text-xs text-muted-foreground">Queue actions and objectives</div>
                </button>
              </div>
            </div>

            {/* Map Controls */}
            <div className="game-card">
              <h4 className="text-md font-semibold mb-3">Map Layers</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Settlements</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Faction Territories</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Trade Routes</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Battle Zones</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Character Movements</span>
                </label>
              </div>
            </div>

            {/* World Information */}
            <div className="game-card">
              <h4 className="text-md font-semibold mb-3">World Status</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Players:</span>
                  <span className="font-medium">1,247</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Settlements:</span>
                  <span className="font-medium">89</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Battles:</span>
                  <span className="font-medium text-red-400">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Server Uptime:</span>
                  <span className="font-medium text-green-400">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="game-card">
          <h3 className="text-lg font-semibold mb-3">Navigation Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Click and drag to pan around the map</li>
            <li>• Use mouse wheel to zoom in and out</li>
            <li>• Click on settlements for detailed information</li>
            <li>• Use faction filter to focus on specific territories</li>
            <li>• Reset view button returns to default zoom</li>
          </ul>
        </div>

        <div className="game-card">
          <h3 className="text-lg font-semibold mb-3">Legend</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Active Settlement</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full relative">
                <div className="absolute -top-1 -left-1 text-yellow-400 text-xs">♔</div>
              </div>
              <span>Capital City</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500/30 border border-gray-500"></div>
              <span>Faction Territory</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Battle Zone</span>
            </div>
          </div>
        </div>

        <div className="game-card">
          <h3 className="text-lg font-semibold mb-3">Live Updates</h3>
          <div className="space-y-2">
            <div className="text-sm">
              <div className="font-medium">Settlement Founded</div>
              <div className="text-xs text-muted-foreground">
                New outpost "Ironhold" established by Blue faction
              </div>
              <div className="text-xs text-muted-foreground">2 minutes ago</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Battle Resolved</div>
              <div className="text-xs text-muted-foreground">
                Red faction successfully defended "Crimson Keep"
              </div>
              <div className="text-xs text-muted-foreground">15 minutes ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};