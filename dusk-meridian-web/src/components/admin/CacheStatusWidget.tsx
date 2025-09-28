import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Clock, Database, Zap } from 'lucide-react';
import { codexApi } from '@/api/endpoints/codex';
import { cn } from '@/utils/cn';

interface CacheEntry {
  key: string;
  expiry: Date;
  age: string;
}

export const CacheStatusWidget: React.FC = () => {
  const [cacheStatus, setCacheStatus] = useState<CacheEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const refreshCacheStatus = () => {
    const status = codexApi.getCacheStatus();
    setCacheStatus(status);
  };

  const clearAllCache = () => {
    codexApi.clearCache();
    setCacheStatus([]);
  };

  const clearExpiredCache = () => {
    codexApi.clearExpiredCache();
    refreshCacheStatus();
  };

  const clearSpecificCache = (key: string) => {
    codexApi.forceClearCacheKey(key);
    refreshCacheStatus();
  };

  const getCacheTypeColor = (key: string) => {
    if (key.includes('statistics') || key.includes('population')) {
      return 'text-blue-400 bg-blue-600/20'; // Dynamic data
    }
    if (key.includes('locations') || key.includes('online')) {
      return 'text-red-400 bg-red-600/20'; // Real-time data
    }
    if (key.includes('settlements') || key.includes('factions') || key.includes('guilds')) {
      return 'text-yellow-400 bg-yellow-600/20'; // Semi-static data
    }
    return 'text-green-400 bg-green-600/20'; // Static data
  };

  const getCacheTypeName = (key: string) => {
    if (key.includes('statistics') || key.includes('population')) return 'Dynamic';
    if (key.includes('locations') || key.includes('online')) return 'Real-time';
    if (key.includes('settlements') || key.includes('factions') || key.includes('guilds')) return 'Semi-static';
    return 'Static';
  };

  useEffect(() => {
    if (isVisible) {
      refreshCacheStatus();
      const interval = setInterval(refreshCacheStatus, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={cn(
          "flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors",
          isVisible
            ? "bg-primary/20 border-primary/30 text-primary"
            : "bg-secondary border-border text-muted-foreground hover:text-foreground"
        )}
        title="Toggle Cache Status"
      >
        <Database className="w-4 h-4" />
        <span className="text-xs">Cache ({cacheStatus.length})</span>
      </button>

      {/* Cache Status Panel */}
      {isVisible && (
        <div className="absolute top-12 right-0 w-96 bg-card border border-border rounded-lg shadow-lg p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Cache Status</span>
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={refreshCacheStatus}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={clearExpiredCache}
                className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                title="Clear Expired"
              >
                <Clock className="w-4 h-4" />
              </button>
              <button
                onClick={clearAllCache}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                title="Clear All Cache"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {cacheStatus.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No cached data</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cacheStatus.map((entry) => {
                const isExpired = new Date() > entry.expiry;
                const typeColor = getCacheTypeColor(entry.key);
                const typeName = getCacheTypeName(entry.key);

                return (
                  <div
                    key={entry.key}
                    className={cn(
                      "bg-background/50 p-3 rounded border transition-colors",
                      isExpired && "opacity-50 border-red-600/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className={cn("text-xs px-2 py-1 rounded", typeColor)}>
                          {typeName}
                        </span>
                        <span className="text-sm font-medium truncate max-w-48">
                          {entry.key}
                        </span>
                      </div>
                      <button
                        onClick={() => clearSpecificCache(entry.key)}
                        className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                        title="Clear this cache"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3" />
                        <span>Cached {entry.age}</span>
                      </div>
                      <div className={cn(
                        "flex items-center space-x-1",
                        isExpired ? "text-red-400" : "text-green-400"
                      )}>
                        <Zap className="w-3 h-3" />
                        <span>
                          {isExpired ? 'Expired' : `Expires ${entry.expiry.toLocaleTimeString()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cache Statistics */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="text-center">
                <p className="font-medium">{cacheStatus.length}</p>
                <p className="text-muted-foreground">Total Entries</p>
              </div>
              <div className="text-center">
                <p className="font-medium">
                  {cacheStatus.filter(entry => new Date() > entry.expiry).length}
                </p>
                <p className="text-muted-foreground">Expired</p>
              </div>
            </div>
          </div>

          {/* Cache Legend */}
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs font-medium mb-2">Cache Types:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Static (24h)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Semi-static (12h)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Dynamic (5-10m)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>Real-time (30s)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};