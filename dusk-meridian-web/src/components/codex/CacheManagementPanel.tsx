import React, { useState, useEffect } from 'react';
import { Database, Trash2, RefreshCw, HardDrive, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { codexCachedApi } from '@/api/endpoints/codex-cached';

interface CacheStats {
  totalEntries: number;
  entriesByCategory: Record<string, number>;
  oldestEntry: Date | null;
  newestEntry: Date | null;
  databaseSize: string;
}

export const CacheManagementPanel: React.FC = () => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCleared, setLastCleared] = useState<Date | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const cacheStats = await codexCachedApi.getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error('Failed to load cache stats:', error);
      setMessage({ type: 'error', text: 'Failed to load cache statistics' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all cached data? This will require re-downloading data from the server.')) {
      return;
    }

    try {
      await codexCachedApi.clearCache();
      setLastCleared(new Date());
      setMessage({ type: 'success', text: 'All cache cleared successfully' });
      await loadStats();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      setMessage({ type: 'error', text: 'Failed to clear cache' });
    }
  };

  const handleClearExpired = async () => {
    try {
      await codexCachedApi.clearExpiredCache();
      setMessage({ type: 'success', text: 'Expired cache entries cleared' });
      await loadStats();
    } catch (error) {
      console.error('Failed to clear expired cache:', error);
      setMessage({ type: 'error', text: 'Failed to clear expired cache' });
    }
  };

  const handleRefresh = async () => {
    await loadStats();
    setMessage({ type: 'success', text: 'Cache statistics refreshed' });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  if (isLoading && !stats) {
    return (
      <div className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold">Cache Management</h2>
            <p className="text-sm text-muted-foreground">
              Manage offline cache for Codex data
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success'
              ? 'bg-green-600/20 border border-green-600/30 text-green-400'
              : 'bg-red-600/20 border border-red-600/30 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      {/* Cache Statistics */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center space-x-3 mb-2">
                <HardDrive className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-muted-foreground">Total Entries</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalEntries.toLocaleString()}</p>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="w-5 h-5 text-green-400" />
                <span className="text-sm text-muted-foreground">Oldest Entry</span>
              </div>
              <p className="text-sm font-medium">{formatDate(stats.oldestEntry)}</p>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-muted-foreground">Newest Entry</span>
              </div>
              <p className="text-sm font-medium">{formatDate(stats.newestEntry)}</p>
            </div>

            <div className="bg-card p-4 rounded-lg border border-border">
              <div className="flex items-center space-x-3 mb-2">
                <Database className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-muted-foreground">Database Size</span>
              </div>
              <p className="text-sm font-medium">{stats.databaseSize}</p>
            </div>
          </div>

          {/* Entries by Category */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4">Cached Entries by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.entriesByCategory).map(([category, count]) => (
                <div key={category} className="bg-background/50 p-3 rounded">
                  <p className="text-xs text-muted-foreground capitalize mb-1">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-xl font-bold">{count.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-lg font-semibold mb-4">Cache Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleClearExpired}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Expired Cache</span>
              </button>

              <button
                onClick={handleClearAll}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Cache</span>
              </button>
            </div>

            {lastCleared && (
              <p className="text-sm text-muted-foreground mt-4">
                Last cleared: {formatDate(lastCleared)}
              </p>
            )}
          </div>

          {/* Info Panel */}
          <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">About Cache</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                The Codex uses IndexedDB to cache data locally in your browser. This allows you to
                browse the Codex even when the server is offline.
              </p>
              <p>
                <strong>Cache Durations:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Mechanics (Skills, Spells, Classes): 24 hours</li>
                <li>Geography (Settlements, Regions): 12 hours</li>
                <li>World Statistics: 5 minutes</li>
              </ul>
              <p className="mt-3">
                When data expires, it will automatically be refreshed from the server on your next visit.
                If the server is unavailable, stale cached data will be used instead.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
