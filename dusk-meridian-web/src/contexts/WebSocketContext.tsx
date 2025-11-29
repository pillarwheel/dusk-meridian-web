import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { gameHub, GameHubEventName, GameHubEvents } from '../api/websocket/gameHub';
import * as signalR from '@microsoft/signalr';

interface WebSocketContextType {
  isConnected: boolean;
  connectionState: signalR.HubConnectionState;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  on: <K extends GameHubEventName>(event: K, callback: GameHubEvents[K]) => void;
  off: <K extends GameHubEventName>(event: K, callback: GameHubEvents[K]) => void;
  joinCharacterChannel: (characterId: string) => Promise<void>;
  leaveCharacterChannel: (characterId: string) => Promise<void>;
  joinSettlementChannel: (settlementId: string) => Promise<void>;
  leaveSettlementChannel: (settlementId: string) => Promise<void>;
  joinWorldChannel: (worldId: string) => Promise<void>;
  leaveWorldChannel: (worldId: string) => Promise<void>;
  sendMessage: (recipientId: string, message: string) => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, autoConnect = true }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<signalR.HubConnectionState>(
    signalR.HubConnectionState.Disconnected
  );

  // Poll connection state
  useEffect(() => {
    const interval = setInterval(() => {
      const state = gameHub.getConnectionState();
      setConnectionState(state);
      setIsConnected(gameHub.isConnected());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      console.log('🔌 Auto-connecting to SignalR...');
      gameHub.start().catch((error) => {
        console.error('❌ Failed to auto-connect to SignalR:', error);
      });
    }

    return () => {
      // Optionally disconnect on unmount
      // gameHub.stop();
    };
  }, [autoConnect]);

  const start = useCallback(async () => {
    await gameHub.start();
  }, []);

  const stop = useCallback(async () => {
    await gameHub.stop();
  }, []);

  const on = useCallback(<K extends GameHubEventName>(event: K, callback: GameHubEvents[K]) => {
    gameHub.on(event, callback);
  }, []);

  const off = useCallback(<K extends GameHubEventName>(event: K, callback: GameHubEvents[K]) => {
    gameHub.off(event, callback);
  }, []);

  const joinCharacterChannel = useCallback(async (characterId: string) => {
    await gameHub.joinCharacterChannel(characterId);
  }, []);

  const leaveCharacterChannel = useCallback(async (characterId: string) => {
    await gameHub.leaveCharacterChannel(characterId);
  }, []);

  const joinSettlementChannel = useCallback(async (settlementId: string) => {
    await gameHub.joinSettlementChannel(settlementId);
  }, []);

  const leaveSettlementChannel = useCallback(async (settlementId: string) => {
    await gameHub.leaveSettlementChannel(settlementId);
  }, []);

  const joinWorldChannel = useCallback(async (worldId: string) => {
    await gameHub.joinWorldChannel(worldId);
  }, []);

  const leaveWorldChannel = useCallback(async (worldId: string) => {
    await gameHub.leaveWorldChannel(worldId);
  }, []);

  const sendMessage = useCallback(async (recipientId: string, message: string) => {
    await gameHub.sendMessage(recipientId, message);
  }, []);

  const value: WebSocketContextType = {
    isConnected,
    connectionState,
    start,
    stop,
    on,
    off,
    joinCharacterChannel,
    leaveCharacterChannel,
    joinSettlementChannel,
    leaveSettlementChannel,
    joinWorldChannel,
    leaveWorldChannel,
    sendMessage,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

// Custom hook for subscribing to specific events
export const useGameEvent = <K extends GameHubEventName>(
  event: K,
  callback: GameHubEvents[K],
  dependencies: React.DependencyList = []
) => {
  const { on, off } = useWebSocket();

  useEffect(() => {
    on(event, callback);
    return () => {
      off(event, callback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, on, off, ...dependencies]);
};

// Custom hook for joining/leaving character channel
export const useCharacterChannel = (characterId: string | null) => {
  const { joinCharacterChannel, leaveCharacterChannel } = useWebSocket();

  useEffect(() => {
    if (!characterId) return;

    console.log(`🎮 Joining character channel: ${characterId}`);
    joinCharacterChannel(characterId).catch((error) => {
      console.error(`Failed to join character channel ${characterId}:`, error);
    });

    return () => {
      console.log(`🎮 Leaving character channel: ${characterId}`);
      leaveCharacterChannel(characterId).catch((error) => {
        console.error(`Failed to leave character channel ${characterId}:`, error);
      });
    };
  }, [characterId, joinCharacterChannel, leaveCharacterChannel]);
};

// Custom hook for joining/leaving settlement channel
export const useSettlementChannel = (settlementId: string | null) => {
  const { joinSettlementChannel, leaveSettlementChannel } = useWebSocket();

  useEffect(() => {
    if (!settlementId) return;

    console.log(`🏰 Joining settlement channel: ${settlementId}`);
    joinSettlementChannel(settlementId).catch((error) => {
      console.error(`Failed to join settlement channel ${settlementId}:`, error);
    });

    return () => {
      console.log(`🏰 Leaving settlement channel: ${settlementId}`);
      leaveSettlementChannel(settlementId).catch((error) => {
        console.error(`Failed to leave settlement channel ${settlementId}:`, error);
      });
    };
  }, [settlementId, joinSettlementChannel, leaveSettlementChannel]);
};

// Custom hook for joining/leaving world channel
export const useWorldChannel = (worldId: string | null) => {
  const { joinWorldChannel, leaveWorldChannel } = useWebSocket();

  useEffect(() => {
    if (!worldId) return;

    console.log(`🌍 Joining world channel: ${worldId}`);
    joinWorldChannel(worldId).catch((error) => {
      console.error(`Failed to join world channel ${worldId}:`, error);
    });

    return () => {
      console.log(`🌍 Leaving world channel: ${worldId}`);
      leaveWorldChannel(worldId).catch((error) => {
        console.error(`Failed to leave world channel ${worldId}:`, error);
      });
    };
  }, [worldId, joinWorldChannel, leaveWorldChannel]);
};
