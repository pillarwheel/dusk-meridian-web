import { useState, useEffect, useCallback } from 'react';
import { unityApi } from '@/api/endpoints/unity-simple';

// Inline type to avoid import issues
interface CharacterNeeds {
  characterId: number;
  hunger: number;
  thirst: number;
  rest: number;
  safety: number;
  social: number;
  esteem: number;
  selfActualization: number;
  lastUpdated: Date;
}

interface UseCharacterNeedsOptions {
  characterId: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  emergencyThreshold?: number;
}

interface CharacterNeedsState {
  needs: CharacterNeeds | null;
  isLoading: boolean;
  error: string | null;
  criticalNeeds: string[];
  lastUpdated: Date | null;
}

export const useCharacterNeeds = ({
  characterId,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  emergencyThreshold = 15
}: UseCharacterNeedsOptions) => {
  const [state, setState] = useState<CharacterNeedsState>({
    needs: null,
    isLoading: false,
    error: null,
    criticalNeeds: [],
    lastUpdated: null
  });

  const fetchNeeds = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const needs = await unityApi.getCharacterNeeds(characterId);

      // Check for critical needs
      const criticalNeeds: string[] = [];
      if (needs.hunger < emergencyThreshold) criticalNeeds.push('hunger');
      if (needs.thirst < emergencyThreshold) criticalNeeds.push('thirst');
      if (needs.rest < emergencyThreshold) criticalNeeds.push('rest');
      if (needs.safety < emergencyThreshold) criticalNeeds.push('safety');
      if (needs.social < emergencyThreshold) criticalNeeds.push('social');
      if (needs.esteem < emergencyThreshold) criticalNeeds.push('esteem');
      if (needs.selfActualization < emergencyThreshold) criticalNeeds.push('selfActualization');

      setState({
        needs,
        isLoading: false,
        error: null,
        criticalNeeds,
        lastUpdated: new Date()
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch character needs'
      }));
    }
  }, [characterId, emergencyThreshold]);

  const updateNeed = useCallback(async (needName: keyof CharacterNeeds, value: number) => {
    if (needName === 'characterId' || needName === 'lastUpdated') {
      throw new Error(`Cannot update ${needName}`);
    }

    try {
      const updatedNeeds = await unityApi.setCharacterNeed(characterId, needName, value);
      setState(prev => ({
        ...prev,
        needs: updatedNeeds,
        lastUpdated: new Date()
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to update character need'
      }));
    }
  }, [characterId]);

  const performEmergencyCheck = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await unityApi.emergencyNeedsCheck(characterId);

      setState(prev => ({
        ...prev,
        needs: result.needs,
        criticalNeeds: result.criticalNeeds,
        isLoading: false,
        lastUpdated: new Date()
      }));

      return result;
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to perform emergency check'
      }));
      throw err;
    }
  }, [characterId]);

  const getNeedStatus = useCallback((value: number) => {
    if (value < 15) return { status: 'critical', color: 'red' };
    if (value < 30) return { status: 'low', color: 'orange' };
    if (value < 50) return { status: 'moderate', color: 'yellow' };
    if (value < 75) return { status: 'good', color: 'blue' };
    return { status: 'excellent', color: 'green' };
  }, []);

  const getOverallWellbeing = useCallback(() => {
    if (!state.needs) return null;

    const values = [
      state.needs.hunger,
      state.needs.thirst,
      state.needs.rest,
      state.needs.safety,
      state.needs.social,
      state.needs.esteem,
      state.needs.selfActualization
    ];

    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const criticalCount = state.criticalNeeds.length;

    return {
      averageScore: Math.round(average),
      criticalNeedsCount: criticalCount,
      status: criticalCount > 0 ? 'critical' : average < 30 ? 'poor' : average < 60 ? 'fair' : average < 80 ? 'good' : 'excellent'
    };
  }, [state.needs, state.criticalNeeds]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchNeeds, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchNeeds]);

  // Initial fetch
  useEffect(() => {
    fetchNeeds();
  }, [fetchNeeds]);

  return {
    ...state,
    fetchNeeds,
    updateNeed,
    performEmergencyCheck,
    getNeedStatus,
    getOverallWellbeing: getOverallWellbeing(),
    hasCriticalNeeds: state.criticalNeeds.length > 0,
    isHealthy: state.criticalNeeds.length === 0 && (state.needs ?
      Object.values(state.needs).every(val => typeof val === 'number' ? val >= 30 : true) : false)
  };
};