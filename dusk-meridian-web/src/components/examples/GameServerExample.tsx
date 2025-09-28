import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSignalR, useCharacterMovement, useWorldEvents, useChat } from '@/hooks/useSignalR';
import { gameServerApi } from '@/api/endpoints/gameserver';
// Local type definitions to replace @/api/types/gameserver imports
export interface GameCharacter {
  characterId: number;
  characterName: string;
  level: number;
  class: string;
  settlementId?: string;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface MovementStatus {
  movementState: string;
  controlMode: string;
  currentPosition: Position3D;
  targetPosition?: Position3D;
}

export interface ActionQueue {
  queueId: string;
  maslowCategory: string;
  status: string;
}

export const GameServerExample: React.FC = () => {
  const { isAuthenticated, getUserId } = useAuth();
  const { isConnected, joinSettlement, sendChatMessage } = useSignalR();

  // State for demo data
  const [characters, setCharacters] = useState<GameCharacter[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<GameCharacter | null>(null);
  const [movementStatus, setMovementStatus] = useState<MovementStatus | null>(null);
  const [actionQueue, setActionQueue] = useState<ActionQueue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SignalR hooks
  const characterMovement = useCharacterMovement(selectedCharacter?.characterId);
  const { worldTime, recentEvents } = useWorldEvents();
  const { messages } = useChat('Global');

  // Load user's characters when authenticated
  useEffect(() => {
    if (isAuthenticated && getUserId()) {
      loadUserCharacters();
    }
  }, [isAuthenticated, getUserId]);

  // Load character details when one is selected
  useEffect(() => {
    if (selectedCharacter) {
      loadCharacterDetails(selectedCharacter.characterId);
    }
  }, [selectedCharacter]);

  const loadUserCharacters = async () => {
    const userId = getUserId();
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const userCharacters = await gameServerApi.getUserCharacters(userId);
      setCharacters(userCharacters);
      if (userCharacters.length > 0) {
        setSelectedCharacter(userCharacters[0]);
      }
    } catch (err) {
      setError(`Failed to load characters: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadCharacterDetails = async (characterId: number) => {
    setLoading(true);
    try {
      const [movement, queue] = await Promise.all([
        gameServerApi.getMovementStatus(characterId),
        gameServerApi.getActionQueue(characterId),
      ]);
      setMovementStatus(movement);
      setActionQueue(queue);

      // Join the character's settlement for real-time updates
      if (movement.currentPosition && selectedCharacter?.settlementId) {
        await joinSettlement(selectedCharacter.settlementId);
      }
    } catch (err) {
      setError(`Failed to load character details: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const moveCharacter = async (x: number, y: number, z: number) => {
    if (!selectedCharacter) return;

    try {
      const result = await gameServerApi.moveCharacterToPosition(
        selectedCharacter.characterId,
        x, y, z
      );
      setMovementStatus(result);
    } catch (err) {
      setError(`Failed to move character: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const stopCharacter = async () => {
    if (!selectedCharacter) return;

    try {
      const result = await gameServerApi.stopCharacter({
        characterId: selectedCharacter.characterId,
      });
      setMovementStatus(result);
    } catch (err) {
      setError(`Failed to stop character: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const sendGlobalMessage = async () => {
    try {
      await sendChatMessage('Global', 'Hello from the web client!');
    } catch (err) {
      setError(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="game-card">
        <h3 className="text-lg font-bold mb-4">GameServer Integration Demo</h3>
        <p className="text-muted-foreground">Please login to test GameServer features.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="game-card">
        <h3 className="text-lg font-bold mb-4">GameServer Integration Demo</h3>

        {/* Connection Status */}
        <div className="mb-4 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <span>SignalR Connection:</span>
            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/20 text-destructive">
            {error}
          </div>
        )}

        {/* Characters */}
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Your Characters</h4>
          {loading && <p>Loading characters...</p>}
          {characters.length === 0 && !loading && (
            <p className="text-muted-foreground">No characters found.</p>
          )}
          <div className="space-y-2">
            {characters.map((character) => (
              <div
                key={character.characterId}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedCharacter?.characterId === character.characterId
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground'
                }`}
                onClick={() => setSelectedCharacter(character)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{character.characterName}</span>
                  <span className="text-sm text-muted-foreground">
                    Lv. {character.level} {character.class}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Character Details */}
        {selectedCharacter && (
          <div className="space-y-4">
            <h4 className="font-semibold">Character: {selectedCharacter.characterName}</h4>

            {/* Movement Status */}
            {movementStatus && (
              <div className="p-3 rounded-lg bg-muted/50">
                <h5 className="font-medium mb-2">Movement Status</h5>
                <div className="text-sm space-y-1">
                  <div>State: {movementStatus.movementState}</div>
                  <div>Control: {movementStatus.controlMode}</div>
                  <div>
                    Position: ({movementStatus.currentPosition.x.toFixed(1)}, {' '}
                    {movementStatus.currentPosition.y.toFixed(1)}, {' '}
                    {movementStatus.currentPosition.z.toFixed(1)})
                  </div>
                  {movementStatus.targetPosition && (
                    <div>
                      Target: ({movementStatus.targetPosition.x.toFixed(1)}, {' '}
                      {movementStatus.targetPosition.y.toFixed(1)}, {' '}
                      {movementStatus.targetPosition.z.toFixed(1)})
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Movement Controls */}
            <div className="flex space-x-2">
              <button
                onClick={() => moveCharacter(100, 0, 200)}
                className="game-button-secondary text-xs"
              >
                Move to (100, 0, 200)
              </button>
              <button
                onClick={() => moveCharacter(0, 0, 0)}
                className="game-button-secondary text-xs"
              >
                Move to Origin
              </button>
              <button
                onClick={stopCharacter}
                className="game-button-secondary text-xs"
              >
                Stop
              </button>
            </div>

            {/* Real-time Movement Updates */}
            {characterMovement.moving && (
              <div className="p-3 rounded-lg bg-blue-600/20 text-blue-400">
                <p className="text-sm">
                  Character moving to ({characterMovement.moving.toPosition.x}, {' '}
                  {characterMovement.moving.toPosition.y}, {' '}
                  {characterMovement.moving.toPosition.z})
                </p>
                <p className="text-xs">
                  ETA: {new Date(characterMovement.moving.estimatedArrival).toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* Action Queue */}
            {actionQueue.length > 0 && (
              <div className="p-3 rounded-lg bg-muted/50">
                <h5 className="font-medium mb-2">Action Queue ({actionQueue.length})</h5>
                <div className="space-y-1 text-sm">
                  {actionQueue.slice(0, 3).map((action) => (
                    <div key={action.queueId} className="flex justify-between">
                      <span>{action.maslowCategory}</span>
                      <span className="text-muted-foreground">{action.status}</span>
                    </div>
                  ))}
                  {actionQueue.length > 3 && (
                    <div className="text-muted-foreground">...and {actionQueue.length - 3} more</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* World Time */}
        {worldTime && (
          <div className="p-3 rounded-lg bg-muted/50">
            <h5 className="font-medium mb-2">World Time</h5>
            <div className="text-sm">
              <div>Game Time: {new Date(worldTime.currentTime).toLocaleString()}</div>
              <div>Time Scale: {worldTime.timeScale}x</div>
              <div>Phase: {worldTime.dayNightCycle.phase}</div>
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="font-medium">Global Chat</h5>
            <button
              onClick={sendGlobalMessage}
              className="game-button-secondary text-xs"
            >
              Send Test Message
            </button>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 max-h-32 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet</p>
            ) : (
              <div className="space-y-1 text-sm">
                {messages.slice(0, 5).map((message) => (
                  <div key={message.messageId}>
                    <span className="font-medium">{message.senderName}:</span>{' '}
                    <span>{message.content}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Events */}
        {recentEvents.length > 0 && (
          <div className="p-3 rounded-lg bg-muted/50">
            <h5 className="font-medium mb-2">Recent World Events</h5>
            <div className="space-y-1 text-sm">
              {recentEvents.slice(0, 3).map((event) => (
                <div key={event.eventId}>
                  <span className="text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>{' '}
                  - {event.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};