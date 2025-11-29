import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { characterApi } from '../api/endpoints/character';
import { inventoryApi } from '../api/endpoints/inventory';
import { Character } from '../api/types/character';
import { InventoryDto } from '../api/types/inventory';
import { useCharacterChannel, useGameEvent } from './WebSocketContext';

interface GameState {
  // Current character
  currentCharacter: Character | null;
  currentCharacterId: string | null;

  // All characters
  characters: Character[];

  // Inventory
  inventory: InventoryDto | null;

  // Loading states
  isLoadingCharacter: boolean;
  isLoadingCharacters: boolean;
  isLoadingInventory: boolean;

  // Errors
  error: string | null;

  // World state
  currentWorldId: string | null;
  currentSettlementId: string | null;

  // UI state
  sidebarCollapsed: boolean;
  activePanel: 'character' | 'inventory' | 'actions' | 'military' | 'crafting' | null;
}

interface GameContextType extends GameState {
  // Character actions
  setCurrentCharacter: (characterId: string | null) => Promise<void>;
  loadCharacters: () => Promise<void>;
  refreshCurrentCharacter: () => Promise<void>;

  // Inventory actions
  loadInventory: (characterId: string) => Promise<void>;
  refreshInventory: () => Promise<void>;

  // UI actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActivePanel: (panel: GameState['activePanel']) => void;

  // World actions
  setCurrentWorld: (worldId: string | null) => void;
  setCurrentSettlement: (settlementId: string | null) => void;

  // Utility
  clearError: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [state, setState] = useState<GameState>({
    currentCharacter: null,
    currentCharacterId: null,
    characters: [],
    inventory: null,
    isLoadingCharacter: false,
    isLoadingCharacters: false,
    isLoadingInventory: false,
    error: null,
    currentWorldId: null,
    currentSettlementId: null,
    sidebarCollapsed: false,
    activePanel: null,
  });

  // Load saved character ID from localStorage on mount
  useEffect(() => {
    const savedCharacterId = localStorage.getItem('selectedCharacterId');
    if (savedCharacterId) {
      setCurrentCharacter(savedCharacterId);
    }
  }, []);

  // Auto-join character channel when current character changes
  useCharacterChannel(state.currentCharacterId);

  // Listen for character updates via WebSocket
  useGameEvent(
    'CharacterStatsUpdated',
    (data) => {
      if (data.characterId === state.currentCharacterId) {
        console.log('📊 Character stats updated via WebSocket');
        refreshCurrentCharacter();
      }
    },
    [state.currentCharacterId]
  );

  useGameEvent(
    'CharacterHealthChanged',
    (data) => {
      if (data.characterId === state.currentCharacterId && state.currentCharacter) {
        console.log('❤️ Character health changed via WebSocket');
        setState((prev) => ({
          ...prev,
          currentCharacter: prev.currentCharacter
            ? {
                ...prev.currentCharacter,
                health: data.health,
                maxHealth: data.maxHealth,
              }
            : null,
        }));
      }
    },
    [state.currentCharacterId, state.currentCharacter]
  );

  useGameEvent(
    'CharacterLevelUp',
    (data) => {
      if (data.characterId === state.currentCharacterId && state.currentCharacter) {
        console.log('🎉 Character leveled up via WebSocket!');
        setState((prev) => ({
          ...prev,
          currentCharacter: prev.currentCharacter
            ? { ...prev.currentCharacter, level: data.newLevel }
            : null,
        }));
        // Show notification (could add a toast system)
      }
    },
    [state.currentCharacterId, state.currentCharacter]
  );

  const setCurrentCharacter = useCallback(async (characterId: string | null) => {
    if (!characterId) {
      setState((prev) => ({
        ...prev,
        currentCharacter: null,
        currentCharacterId: null,
        inventory: null,
      }));
      localStorage.removeItem('selectedCharacterId');
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoadingCharacter: true, error: null }));

      const character = await characterApi.getCharacter(characterId);

      if (!character) {
        throw new Error('Character not found');
      }

      setState((prev) => ({
        ...prev,
        currentCharacter: character,
        currentCharacterId: characterId,
        isLoadingCharacter: false,
      }));

      // Save to localStorage
      localStorage.setItem('selectedCharacterId', characterId);

      // Load inventory for this character
      await loadInventory(characterId);
    } catch (error: any) {
      console.error('Failed to load character:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to load character',
        isLoadingCharacter: false,
      }));
    }
  }, []);

  const loadCharacters = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoadingCharacters: true, error: null }));

      const characters = await characterApi.getCharacters();

      setState((prev) => ({
        ...prev,
        characters,
        isLoadingCharacters: false,
      }));

      // If no current character but we have characters, select the first one
      if (!state.currentCharacterId && characters.length > 0) {
        await setCurrentCharacter(characters[0].characterId);
      }
    } catch (error: any) {
      console.error('Failed to load characters:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to load characters',
        isLoadingCharacters: false,
      }));
    }
  }, [state.currentCharacterId, setCurrentCharacter]);

  const refreshCurrentCharacter = useCallback(async () => {
    if (!state.currentCharacterId) return;

    try {
      const character = await characterApi.getCharacter(state.currentCharacterId);

      if (!character) {
        throw new Error('Character not found');
      }

      setState((prev) => ({
        ...prev,
        currentCharacter: character,
      }));
    } catch (error: any) {
      console.error('Failed to refresh character:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to refresh character',
      }));
    }
  }, [state.currentCharacterId]);

  const loadInventory = useCallback(async (characterId: string) => {
    try {
      setState((prev) => ({ ...prev, isLoadingInventory: true, error: null }));

      const inventory = await inventoryApi.getInventory(characterId);

      setState((prev) => ({
        ...prev,
        inventory,
        isLoadingInventory: false,
      }));
    } catch (error: any) {
      console.error('Failed to load inventory:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to load inventory',
        isLoadingInventory: false,
      }));
    }
  }, []);

  const refreshInventory = useCallback(async () => {
    if (!state.currentCharacterId) return;
    await loadInventory(state.currentCharacterId);
  }, [state.currentCharacterId, loadInventory]);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setState((prev) => ({ ...prev, sidebarCollapsed: collapsed }));
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  }, []);

  const setActivePanel = useCallback((panel: GameState['activePanel']) => {
    setState((prev) => ({ ...prev, activePanel: panel }));
  }, []);

  const setCurrentWorld = useCallback((worldId: string | null) => {
    setState((prev) => ({ ...prev, currentWorldId: worldId }));
  }, []);

  const setCurrentSettlement = useCallback((settlementId: string | null) => {
    setState((prev) => ({ ...prev, currentSettlementId: settlementId }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Load characters on mount
  useEffect(() => {
    loadCharacters();
  }, []);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    if (savedSidebarState !== null) {
      setState((prev) => ({ ...prev, sidebarCollapsed: savedSidebarState === 'true' }));
    }
  }, []);

  const value: GameContextType = {
    ...state,
    setCurrentCharacter,
    loadCharacters,
    refreshCurrentCharacter,
    loadInventory,
    refreshInventory,
    setSidebarCollapsed,
    setActivePanel,
    setCurrentWorld,
    setCurrentSettlement,
    clearError,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hooks for specific use cases
export const useCurrentCharacter = () => {
  const { currentCharacter, isLoadingCharacter, refreshCurrentCharacter } = useGame();
  return { character: currentCharacter, isLoading: isLoadingCharacter, refresh: refreshCurrentCharacter };
};

export const useCharacters = () => {
  const { characters, isLoadingCharacters, loadCharacters } = useGame();
  return { characters, isLoading: isLoadingCharacters, refresh: loadCharacters };
};

export const useInventory = () => {
  const { inventory, isLoadingInventory, refreshInventory } = useGame();
  return { inventory, isLoading: isLoadingInventory, refresh: refreshInventory };
};

export const useCharacterSelector = () => {
  const { currentCharacterId, characters, setCurrentCharacter } = useGame();
  return { currentCharacterId, characters, setCurrentCharacter };
};
