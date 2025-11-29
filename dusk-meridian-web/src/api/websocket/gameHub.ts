import * as signalR from '@microsoft/signalr';
import { getBestValidToken } from '../../utils/tokenValidator';
import { API_ENDPOINTS } from '../../utils/constants';

export interface GameHubEvents {
  // Action Queue Events
  'ActionCompleted': (data: { characterId: string; actionId: string; result: any }) => void;
  'ActionStarted': (data: { characterId: string; actionId: string; action: any }) => void;
  'ActionFailed': (data: { characterId: string; actionId: string; reason: string }) => void;
  'ActionQueueUpdated': (data: { characterId: string; queue: any[] }) => void;

  // Character Events
  'CharacterMoved': (data: { characterId: string; x: number; y: number; z: number }) => void;
  'CharacterStatsUpdated': (data: { characterId: string; stats: any }) => void;
  'CharacterHealthChanged': (data: { characterId: string; health: number; maxHealth: number }) => void;
  'CharacterLevelUp': (data: { characterId: string; newLevel: number }) => void;

  // Settlement Events
  'SettlementResourceUpdated': (data: { settlementId: string; resourceId: string; amount: number }) => void;
  'SettlementBuildingCompleted': (data: { settlementId: string; buildingId: string }) => void;
  'SettlementPopulationChanged': (data: { settlementId: string; population: number }) => void;

  // Military Events
  'MilitaryOrderCreated': (data: { orderId: string; order: any }) => void;
  'MilitaryOrderStatusChanged': (data: { orderId: string; status: string }) => void;
  'MilitaryOrderCompleted': (data: { orderId: string; result: any }) => void;

  // Combat Events
  'CombatStarted': (data: { combatId: string; participants: string[] }) => void;
  'CombatRoundComplete': (data: { combatId: string; round: number; events: any[] }) => void;
  'CombatEnded': (data: { combatId: string; winner: string; loot: any[] }) => void;

  // World Events
  'WorldTimeUpdated': (data: { worldId: string; gameTime: string; tick: number }) => void;
  'WorldWeatherChanged': (data: { worldId: string; weather: string }) => void;

  // Social Events
  'MessageReceived': (data: { from: string; to: string; message: string; timestamp: string }) => void;
  'PartyInvite': (data: { partyId: string; inviterId: string; invitedId: string }) => void;
  'PartyMemberJoined': (data: { partyId: string; characterId: string }) => void;
  'PartyMemberLeft': (data: { partyId: string; characterId: string }) => void;

  // Crafting Events
  'CraftingStarted': (data: { characterId: string; recipeId: string; queueId: string }) => void;
  'CraftingCompleted': (data: { characterId: string; queueId: string; items: any[] }) => void;
  'CraftingFailed': (data: { characterId: string; queueId: string; reason: string }) => void;

  // Market Events
  'MarketListingCreated': (data: { listingId: string; item: any; price: number }) => void;
  'MarketListingSold': (data: { listingId: string; buyer: string; seller: string }) => void;
  'MarketPriceUpdated': (data: { itemId: string; newPrice: number; change: number }) => void;
}

export type GameHubEventName = keyof GameHubEvents;

class GameHub {
  private connection: signalR.HubConnection | null = null;
  private listeners: Map<GameHubEventName, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isStarting = false;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    const hubUrl = API_ENDPOINTS.SIGNALR_HUB_URL || 'wss://localhost:5001/worldhub';

    console.log('🔌 Initializing SignalR connection to:', hubUrl);

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => {
          const token = getBestValidToken();
          console.log('🔑 SignalR requesting auth token:', token ? 'Token available' : 'No token');
          return token || '';
        },
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          console.log(`🔄 SignalR reconnect attempt ${retryContext.previousRetryCount + 1}`);
          if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnect attempts reached');
            return null;
          }
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.setupConnectionHandlers();
    this.setupEventHandlers();
  }

  private setupConnectionHandlers() {
    if (!this.connection) return;

    this.connection.onclose((error) => {
      console.log('🔴 SignalR connection closed', error);
      this.connectionPromise = null;
    });

    this.connection.onreconnecting((error) => {
      console.log('🟡 SignalR reconnecting...', error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('🟢 SignalR reconnected:', connectionId);
      this.reconnectAttempts = 0;
      this.rejoinChannels();
    });
  }

  private setupEventHandlers() {
    if (!this.connection) return;

    // Register handlers for all event types
    const eventNames: GameHubEventName[] = [
      'ActionCompleted',
      'ActionStarted',
      'ActionFailed',
      'ActionQueueUpdated',
      'CharacterMoved',
      'CharacterStatsUpdated',
      'CharacterHealthChanged',
      'CharacterLevelUp',
      'SettlementResourceUpdated',
      'SettlementBuildingCompleted',
      'SettlementPopulationChanged',
      'MilitaryOrderCreated',
      'MilitaryOrderStatusChanged',
      'MilitaryOrderCompleted',
      'CombatStarted',
      'CombatRoundComplete',
      'CombatEnded',
      'WorldTimeUpdated',
      'WorldWeatherChanged',
      'MessageReceived',
      'PartyInvite',
      'PartyMemberJoined',
      'PartyMemberLeft',
      'CraftingStarted',
      'CraftingCompleted',
      'CraftingFailed',
      'MarketListingCreated',
      'MarketListingSold',
      'MarketPriceUpdated',
    ];

    eventNames.forEach((eventName) => {
      this.connection!.on(eventName, (...args: any[]) => {
        console.log(`📡 SignalR Event Received: ${eventName}`, args);
        this.emit(eventName, args[0]);
      });
    });
  }

  private emit(event: GameHubEventName, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  private async rejoinChannels() {
    // Re-join channels after reconnection
    // This would be implemented based on what channels the user was in before disconnect
    console.log('🔄 Rejoining channels after reconnect...');
  }

  async start(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('✅ SignalR already connected');
      return;
    }

    if (this.isStarting && this.connectionPromise) {
      console.log('⏳ SignalR connection already starting, waiting...');
      return this.connectionPromise;
    }

    this.isStarting = true;
    this.connectionPromise = this.doStart();
    return this.connectionPromise;
  }

  private async doStart(): Promise<void> {
    if (!this.connection) {
      throw new Error('SignalR connection not initialized');
    }

    try {
      console.log('🚀 Starting SignalR connection...');
      await this.connection.start();
      console.log('✅ SignalR connected successfully');
      console.log('Connection ID:', this.connection.connectionId);
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('❌ SignalR connection failed:', error);
      this.reconnectAttempts++;
      throw error;
    } finally {
      this.isStarting = false;
    }
  }

  async stop(): Promise<void> {
    if (!this.connection) return;

    try {
      console.log('🛑 Stopping SignalR connection...');
      await this.connection.stop();
      console.log('✅ SignalR stopped');
      this.connectionPromise = null;
    } catch (error) {
      console.error('❌ Error stopping SignalR:', error);
    }
  }

  on<K extends GameHubEventName>(event: K, callback: GameHubEvents[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as Function);
    console.log(`📝 Registered listener for: ${event}`);
  }

  off<K extends GameHubEventName>(event: K, callback: GameHubEvents[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback as Function);
      console.log(`🗑️ Removed listener for: ${event}`);
    }
  }

  // Hub Methods - Call server-side methods
  async joinCharacterChannel(characterId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      await this.start();
    }

    try {
      console.log(`🔗 Joining character channel: ${characterId}`);
      await this.connection!.invoke('JoinCharacterChannel', characterId);
      console.log(`✅ Joined character channel: ${characterId}`);
    } catch (error) {
      console.error(`❌ Failed to join character channel: ${characterId}`, error);
      throw error;
    }
  }

  async leaveCharacterChannel(characterId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      console.log(`🔗 Leaving character channel: ${characterId}`);
      await this.connection.invoke('LeaveCharacterChannel', characterId);
      console.log(`✅ Left character channel: ${characterId}`);
    } catch (error) {
      console.error(`❌ Failed to leave character channel: ${characterId}`, error);
    }
  }

  async joinSettlementChannel(settlementId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      await this.start();
    }

    try {
      console.log(`🔗 Joining settlement channel: ${settlementId}`);
      await this.connection!.invoke('JoinSettlementChannel', settlementId);
      console.log(`✅ Joined settlement channel: ${settlementId}`);
    } catch (error) {
      console.error(`❌ Failed to join settlement channel: ${settlementId}`, error);
      throw error;
    }
  }

  async leaveSettlementChannel(settlementId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      console.log(`🔗 Leaving settlement channel: ${settlementId}`);
      await this.connection.invoke('LeaveSettlementChannel', settlementId);
      console.log(`✅ Left settlement channel: ${settlementId}`);
    } catch (error) {
      console.error(`❌ Failed to leave settlement channel: ${settlementId}`, error);
    }
  }

  async joinWorldChannel(worldId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      await this.start();
    }

    try {
      console.log(`🔗 Joining world channel: ${worldId}`);
      await this.connection!.invoke('JoinWorldChannel', worldId);
      console.log(`✅ Joined world channel: ${worldId}`);
    } catch (error) {
      console.error(`❌ Failed to join world channel: ${worldId}`, error);
      throw error;
    }
  }

  async leaveWorldChannel(worldId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      console.log(`🔗 Leaving world channel: ${worldId}`);
      await this.connection.invoke('LeaveWorldChannel', worldId);
      console.log(`✅ Left world channel: ${worldId}`);
    } catch (error) {
      console.error(`❌ Failed to leave world channel: ${worldId}`, error);
    }
  }

  async sendMessage(recipientId: string, message: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Not connected to game hub');
    }

    try {
      await this.connection.invoke('SendMessage', recipientId, message);
      console.log(`📨 Message sent to ${recipientId}`);
    } catch (error) {
      console.error(`❌ Failed to send message to ${recipientId}`, error);
      throw error;
    }
  }

  getConnectionState(): signalR.HubConnectionState {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected;
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Export singleton instance
export const gameHub = new GameHub();
