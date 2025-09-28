import { useState, useEffect, useCallback } from 'react';
import { codexApi } from '@/api/endpoints/codex-simple';

// Temporary inline types
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

interface PopulationStatistics {
  totalCharacters: number;
  totalPlayers: number;
  totalNPCs: number;
  onlineCharacters: number;
  offlineCharacters: number;
  averageLevel: number;
  charactersByClass: Record<string, number>;
  charactersByFaction: Record<string, number>;
  lastUpdated: Date;
}

interface UseWorldStatisticsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface WorldStatisticsState {
  worldStats: WorldStatistics | null;
  populationStats: PopulationStatistics | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useWorldStatistics = ({
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000 // 5 minutes default
}: UseWorldStatisticsOptions = {}) => {
  const [state, setState] = useState<WorldStatisticsState>({
    worldStats: null,
    populationStats: null,
    isLoading: false,
    error: null,
    lastUpdated: null
  });

  const fetchStatistics = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [worldStats, populationStats] = await Promise.all([
        codexApi.getWorldStatistics(),
        codexApi.getPopulationStatistics()
      ]);

      setState({
        worldStats,
        populationStats,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch world statistics'
      }));
    }
  }, []);

  const refreshStatistics = useCallback(() => {
    return fetchStatistics();
  }, [fetchStatistics]);

  // Calculate derived statistics
  const getDerivedStats = useCallback(() => {
    if (!state.worldStats || !state.populationStats) return null;

    return {
      // Server health indicators
      serverHealthScore: state.worldStats.serverUptime.includes('99') ? 'Excellent' :
                        state.worldStats.serverUptime.includes('9') ? 'Good' : 'Poor',

      // Activity indicators
      playerActivityRatio: state.worldStats.onlinePlayers / state.worldStats.totalCharacters,
      averagePlayersPerSettlement: state.worldStats.onlinePlayers / state.worldStats.totalSettlements,

      // World dynamics
      battleDensity: state.worldStats.activeBattles / state.worldStats.totalSettlements,
      factionDistribution: state.populationStats.charactersByFaction,

      // Time indicators
      isActiveHour: state.worldStats.worldTime.timeOfDay >= 6 && state.worldStats.worldTime.timeOfDay <= 22,
      seasonModifier: state.worldStats.worldTime.season,

      // Growth indicators
      newCharactersToday: Math.floor(state.populationStats.totalCharacters * 0.01), // Estimated
    };
  }, [state.worldStats, state.populationStats]);

  const getFormattedWorldTime = useCallback(() => {
    if (!state.worldStats) return null;

    const { worldTime } = state.worldStats;
    const hours = Math.floor(worldTime.timeOfDay);
    const minutes = Math.floor((worldTime.timeOfDay - hours) * 60);

    return {
      formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      period: hours >= 12 ? 'PM' : 'AM',
      displayHours: hours > 12 ? hours - 12 : hours === 0 ? 12 : hours,
      dayNight: hours >= 6 && hours < 18 ? 'day' : 'night',
      fullDate: `Day ${worldTime.currentDay}, ${worldTime.season} Year ${worldTime.year}`
    };
  }, [state.worldStats]);

  const getPlayerStatusBreakdown = useCallback(() => {
    if (!state.populationStats) return null;

    return {
      online: state.populationStats.onlineCharacters,
      offline: state.populationStats.offlineCharacters,
      total: state.populationStats.totalCharacters,
      players: state.populationStats.totalPlayers,
      npcs: state.populationStats.totalNPCs,
      onlinePercentage: (state.populationStats.onlineCharacters / state.populationStats.totalCharacters) * 100
    };
  }, [state.populationStats]);

  // Auto-refresh effect
  useEffect(() => {
    fetchStatistics();

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchStatistics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStatistics, autoRefresh, refreshInterval]);

  return {
    ...state,
    refreshStatistics,
    derivedStats: getDerivedStats(),
    formattedWorldTime: getFormattedWorldTime(),
    playerStatusBreakdown: getPlayerStatusBreakdown(),

    // Convenience getters
    isWorldOnline: state.worldStats?.onlinePlayers > 0,
    hasActiveBattles: state.worldStats?.activeBattles > 0,
    serverStatus: state.worldStats ? 'online' : state.error ? 'error' : 'connecting',

    // Time until next refresh
    nextRefreshIn: state.lastUpdated && autoRefresh ?
      Math.max(0, refreshInterval - (Date.now() - state.lastUpdated.getTime())) : null
  };
};