import * as signalR from '@microsoft/signalr';
import { API_ENDPOINTS } from '../utils/constants';

// Temporary inline types to avoid import issues
interface CharacterMovingEvent {
  characterId: number;
  fromPosition: { x: number; y: number; z: number };
  toPosition: { x: number; y: number; z: number };
  movementState: 'Idle' | 'Moving' | 'Following' | 'Patrolling' | 'Fleeing' | 'Returning';
  estimatedArrival: Date;
}

interface CharacterStoppedEvent {
  characterId: number;
  finalPosition: { x: number; y: number; z: number };
  reason: 'PlayerStopped' | 'ReachedDestination' | 'Interrupted' | 'AITookControl';
}

interface WorldTimeUpdate {
  currentTime: Date;
  timeScale: number;
  dayNightCycle: {
    isDaytime: boolean;
    sunPosition: number;
    phase: 'Dawn' | 'Day' | 'Dusk' | 'Night';
  };
}

interface WorldEvent {
  eventId: string;
  eventType: 'Battle' | 'Trade' | 'Construction' | 'Discovery' | 'Natural';
  location: { x: number; y: number; z: number };
  settlementId?: number;
  participantIds: number[];
  description: string;
  timestamp: Date;
  duration?: number;
}

interface ChatMessage {
  messageId: string;
  senderId: number;
  senderName: string;
  channel: 'Global' | 'Settlement' | 'Faction' | 'Private';
  targetId?: number;
  content: string;
  timestamp: Date;
}

type SignalRConnectionState = 'Disconnected' | 'Connecting' | 'Connected' | 'Disconnecting' | 'Reconnecting';

export type SignalREventHandler<T = any> = (data: T) => void;

export interface SignalREvents {
  // Character movement events
  CharacterMoving: CharacterMovingEvent;
  CharacterStopped: CharacterStoppedEvent;

  // World events
  WorldTimeUpdate: WorldTimeUpdate;
  WorldEvent: WorldEvent;

  // Communication
  ChatMessage: ChatMessage;

  // Connection events
  Connected: { connectionId: string };
  Disconnected: { reason: string };
  Reconnecting: {};
  Reconnected: { connectionId: string };
}

class SignalRClient {
  private connection: signalR.HubConnection | null = null;
  private connectionState: SignalRConnectionState = 'Disconnected';
  private eventHandlers = new Map<string, Set<SignalREventHandler>>();
  private joinedSettlements = new Set<number>();
  private authTokenProvider: () => string | null = () => null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.setupConnection();
  }

  private setupConnection() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(API_ENDPOINTS.SIGNALR_HUB_URL, {
        accessTokenFactory: () => {
          const token = this.authTokenProvider();
          return token || '';
        },
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 2s, 4s, 8s, 16s, 30s
          const delays = [2000, 4000, 8000, 16000, 30000];
          return delays[Math.min(retryContext.previousRetryCount, delays.length - 1)];
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.setupEventHandlers();
    this.setupConnectionEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    // Character movement events
    this.connection.on('CharacterMoving', (data: CharacterMovingEvent) => {
      this.emit('CharacterMoving', data);
    });

    this.connection.on('CharacterStopped', (data: CharacterStoppedEvent) => {
      this.emit('CharacterStopped', data);
    });

    // World events
    this.connection.on('WorldTimeUpdate', (data: WorldTimeUpdate) => {
      this.emit('WorldTimeUpdate', data);
    });

    this.connection.on('WorldEvent', (data: WorldEvent) => {
      this.emit('WorldEvent', data);
    });

    // Chat messages
    this.connection.on('ChatMessage', (data: ChatMessage) => {
      this.emit('ChatMessage', data);
    });
  }

  private setupConnectionEventHandlers() {
    if (!this.connection) return;

    this.connection.onclose((error) => {
      this.connectionState = 'Disconnected';
      this.emit('Disconnected', { reason: error?.message || 'Connection closed' });
      console.warn('SignalR connection closed:', error);
    });

    this.connection.onreconnecting((error) => {
      this.connectionState = 'Reconnecting';
      this.reconnectAttempts++;
      this.emit('Reconnecting', {});
      console.info('SignalR reconnecting, attempt:', this.reconnectAttempts);
    });

    this.connection.onreconnected((connectionId) => {
      this.connectionState = 'Connected';
      this.reconnectAttempts = 0;
      this.emit('Reconnected', { connectionId: connectionId || '' });
      console.info('SignalR reconnected:', connectionId);

      // Rejoin settlement groups after reconnection
      this.rejoinSettlements();
    });
  }

  setAuthTokenProvider(provider: () => string | null) {
    this.authTokenProvider = provider;
  }

  async connect(): Promise<void> {
    if (!this.connection || this.connectionState === 'Connected') {
      return;
    }

    try {
      this.connectionState = 'Connecting';
      await this.connection.start();
      this.connectionState = 'Connected';
      this.reconnectAttempts = 0;

      const connectionId = this.connection.connectionId || '';
      this.emit('Connected', { connectionId });
      console.info('SignalR connected:', connectionId);
    } catch (error) {
      this.connectionState = 'Disconnected';
      console.error('SignalR connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connection || this.connectionState === 'Disconnected') {
      return;
    }

    try {
      this.connectionState = 'Disconnecting';
      await this.connection.stop();
      this.connectionState = 'Disconnected';
      this.joinedSettlements.clear();
    } catch (error) {
      console.error('SignalR disconnection failed:', error);
      throw error;
    }
  }

  async joinSettlement(settlementId: number): Promise<void> {
    if (!this.connection || this.connectionState !== 'Connected') {
      throw new Error('SignalR connection not available');
    }

    try {
      await this.connection.invoke('JoinSettlement', settlementId);
      this.joinedSettlements.add(settlementId);
      console.info('Joined settlement group:', settlementId);
    } catch (error) {
      console.error('Failed to join settlement:', error);
      throw error;
    }
  }

  async leaveSettlement(settlementId: number): Promise<void> {
    if (!this.connection || this.connectionState !== 'Connected') {
      return;
    }

    try {
      await this.connection.invoke('LeaveSettlement', settlementId);
      this.joinedSettlements.delete(settlementId);
      console.info('Left settlement group:', settlementId);
    } catch (error) {
      console.error('Failed to leave settlement:', error);
      throw error;
    }
  }

  async sendChatMessage(channel: ChatMessage['channel'], content: string, targetId?: number): Promise<void> {
    if (!this.connection || this.connectionState !== 'Connected') {
      throw new Error('SignalR connection not available');
    }

    try {
      await this.connection.invoke('SendChatMessage', {
        channel,
        content,
        targetId,
      });
    } catch (error) {
      console.error('Failed to send chat message:', error);
      throw error;
    }
  }

  private async rejoinSettlements(): Promise<void> {
    const settlements = Array.from(this.joinedSettlements);
    this.joinedSettlements.clear();

    for (const settlementId of settlements) {
      try {
        await this.joinSettlement(settlementId);
      } catch (error) {
        console.error(`Failed to rejoin settlement ${settlementId}:`, error);
      }
    }
  }

  // Event subscription methods
  on<K extends keyof SignalREvents>(event: K, handler: SignalREventHandler<SignalREvents[K]>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off<K extends keyof SignalREvents>(event: K, handler: SignalREventHandler<SignalREvents[K]>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }

  private emit<K extends keyof SignalREvents>(event: K, data: SignalREvents[K]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in SignalR event handler for ${event}:`, error);
        }
      });
    }
  }

  // Utility methods
  getConnectionState(): SignalRConnectionState {
    return this.connectionState;
  }

  isConnected(): boolean {
    return this.connectionState === 'Connected';
  }

  getJoinedSettlements(): number[] {
    return Array.from(this.joinedSettlements);
  }

  getConnectionId(): string | null {
    return this.connection?.connectionId || null;
  }
}

// Export singleton instance
export const signalRClient = new SignalRClient();