import { useEffect, useState, useCallback, useRef } from 'react';
import { signalRClient } from '../services/signalr';

// Inline types to avoid import issues
type SignalRConnectionState = 'Disconnected' | 'Connecting' | 'Connected' | 'Disconnecting' | 'Reconnecting';
type SignalREventHandler<T = any> = (data: T) => void;

interface SignalREvents {
  CharacterMoving: {
    characterId: number;
    fromPosition: { x: number; y: number; z: number };
    toPosition: { x: number; y: number; z: number };
    movementState: 'Idle' | 'Moving' | 'Following' | 'Patrolling' | 'Fleeing' | 'Returning';
    estimatedArrival: Date;
  };
  CharacterStopped: {
    characterId: number;
    finalPosition: { x: number; y: number; z: number };
    reason: 'PlayerStopped' | 'ReachedDestination' | 'Interrupted' | 'AITookControl';
  };
  WorldTimeUpdate: {
    currentTime: Date;
    timeScale: number;
    dayNightCycle: {
      isDaytime: boolean;
      sunPosition: number;
      phase: 'Dawn' | 'Day' | 'Dusk' | 'Night';
    };
  };
  WorldEvent: {
    eventId: string;
    eventType: 'Battle' | 'Trade' | 'Construction' | 'Discovery' | 'Natural';
    location: { x: number; y: number; z: number };
    settlementId?: number;
    participantIds: number[];
    description: string;
    timestamp: Date;
    duration?: number;
  };
  ChatMessage: {
    messageId: string;
    senderId: number;
    senderName: string;
    channel: 'Global' | 'Settlement' | 'Faction' | 'Private';
    targetId?: number;
    content: string;
    timestamp: Date;
  };
  Connected: { connectionId: string };
  Disconnected: { reason: string };
  Reconnecting: {};
  Reconnected: { connectionId: string };
}

export const useSignalR = () => {
  const [connectionState, setConnectionState] = useState<SignalRConnectionState>('Disconnected');
  const [connectionId, setConnectionId] = useState<string | null>(null);

  useEffect(() => {
    // Set up connection state monitoring
    const handleConnected = (data: { connectionId: string }) => {
      setConnectionState('Connected');
      setConnectionId(data.connectionId);
    };

    const handleDisconnected = () => {
      setConnectionState('Disconnected');
      setConnectionId(null);
    };

    const handleReconnecting = () => {
      setConnectionState('Reconnecting');
    };

    const handleReconnected = (data: { connectionId: string }) => {
      setConnectionState('Connected');
      setConnectionId(data.connectionId);
    };

    signalRClient.on('Connected', handleConnected);
    signalRClient.on('Disconnected', handleDisconnected);
    signalRClient.on('Reconnecting', handleReconnecting);
    signalRClient.on('Reconnected', handleReconnected);

    // Set initial state
    setConnectionState(signalRClient.getConnectionState());
    setConnectionId(signalRClient.getConnectionId());

    return () => {
      signalRClient.off('Connected', handleConnected);
      signalRClient.off('Disconnected', handleDisconnected);
      signalRClient.off('Reconnecting', handleReconnecting);
      signalRClient.off('Reconnected', handleReconnected);
    };
  }, []);

  const connect = useCallback(async () => {
    try {
      await signalRClient.connect();
    } catch (error) {
      console.error('Failed to connect to SignalR:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await signalRClient.disconnect();
    } catch (error) {
      console.error('Failed to disconnect from SignalR:', error);
      throw error;
    }
  }, []);

  const joinSettlement = useCallback(async (settlementId: number) => {
    try {
      await signalRClient.joinSettlement(settlementId);
    } catch (error) {
      console.error('Failed to join settlement:', error);
      throw error;
    }
  }, []);

  const leaveSettlement = useCallback(async (settlementId: number) => {
    try {
      await signalRClient.leaveSettlement(settlementId);
    } catch (error) {
      console.error('Failed to leave settlement:', error);
      throw error;
    }
  }, []);

  const sendChatMessage = useCallback(async (
    channel: SignalREvents['ChatMessage']['channel'],
    content: string,
    targetId?: number
  ) => {
    try {
      await signalRClient.sendChatMessage(channel, content, targetId);
    } catch (error) {
      console.error('Failed to send chat message:', error);
      throw error;
    }
  }, []);

  return {
    connectionState,
    connectionId,
    isConnected: connectionState === 'Connected',
    isConnecting: connectionState === 'Connecting',
    isReconnecting: connectionState === 'Reconnecting',

    // Connection methods
    connect,
    disconnect,

    // Group methods
    joinSettlement,
    leaveSettlement,
    getJoinedSettlements: () => signalRClient.getJoinedSettlements(),

    // Communication methods
    sendChatMessage,

    // Event subscription
    on: signalRClient.on.bind(signalRClient),
    off: signalRClient.off.bind(signalRClient),
  };
};

// Hook for subscribing to specific SignalR events
export const useSignalREvent = <K extends keyof SignalREvents>(
  event: K,
  handler: SignalREventHandler<SignalREvents[K]>,
  dependencies: React.DependencyList = []
) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const stableHandler = (data: SignalREvents[K]) => {
      handlerRef.current(data);
    };

    signalRClient.on(event, stableHandler);

    return () => {
      signalRClient.off(event, stableHandler);
    };
  }, [event, ...dependencies]);
};

// Hook for character movement events
export const useCharacterMovement = (characterId?: number) => {
  const [movementData, setMovementData] = useState<{
    moving: SignalREvents['CharacterMoving'] | null;
    stopped: SignalREvents['CharacterStopped'] | null;
  }>({
    moving: null,
    stopped: null,
  });

  useSignalREvent('CharacterMoving', (data) => {
    if (!characterId || data.characterId === characterId) {
      setMovementData(prev => ({ ...prev, moving: data }));
    }
  }, [characterId]);

  useSignalREvent('CharacterStopped', (data) => {
    if (!characterId || data.characterId === characterId) {
      setMovementData(prev => ({ ...prev, stopped: data }));
    }
  }, [characterId]);

  return movementData;
};

// Hook for world events
export const useWorldEvents = () => {
  const [worldTime, setWorldTime] = useState<SignalREvents['WorldTimeUpdate'] | null>(null);
  const [recentEvents, setRecentEvents] = useState<SignalREvents['WorldEvent'][]>([]);

  useSignalREvent('WorldTimeUpdate', setWorldTime);

  useSignalREvent('WorldEvent', (event) => {
    setRecentEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
  });

  return {
    worldTime,
    recentEvents,
    clearEvents: () => setRecentEvents([]),
  };
};

// Hook for chat messages
export const useChat = (channel?: SignalREvents['ChatMessage']['channel']) => {
  const [messages, setMessages] = useState<SignalREvents['ChatMessage'][]>([]);

  useSignalREvent('ChatMessage', (message) => {
    if (!channel || message.channel === channel) {
      setMessages(prev => [message, ...prev.slice(0, 99)]); // Keep last 100 messages
    }
  }, [channel]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    clearMessages,
  };
};