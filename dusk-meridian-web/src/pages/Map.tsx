import React, { useState } from 'react';
import { WorldMap } from '@/components/map/WorldMap';
import { Globe, Map as MapIcon, Filter } from 'lucide-react';
import type { VisibilityMode, MapViewMode } from '@/types/map';

export const Map: React.FC = () => {
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>('public');
  const [viewMode, setViewMode] = useState<MapViewMode>('political');

  return (
    <div className="h-full flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">World Map</h1>
          <p className="text-muted-foreground">
            Explore settlements and territories across the realm
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Selection */}
          <div className="flex items-center space-x-2">
            <MapIcon className="w-4 h-4 text-muted-foreground" />
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as MapViewMode)}
              className="bg-background border border-border rounded px-3 py-2 text-sm"
            >
              <option value="political">Political</option>
              <option value="economic">Economic</option>
              <option value="military">Military</option>
            </select>
          </div>

          {/* Visibility Mode */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={visibilityMode}
              onChange={(e) => setVisibilityMode(e.target.value as VisibilityMode)}
              className="bg-background border border-border rounded px-3 py-2 text-sm"
            >
              <option value="public">Public</option>
              <option value="owned">My Settlements</option>
              <option value="allied">Allied</option>
              <option value="all">All (Admin)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Map View */}
      <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden">
        <WorldMap visibilityMode={visibilityMode} viewMode={viewMode} />
      </div>
    </div>
  );
};