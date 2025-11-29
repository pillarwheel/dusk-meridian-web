import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { actionQueueApi } from '../../api/endpoints/actionQueue';
import { ActionQueueDto, ActionStatus, CreateActionDto } from '../../api/types/actionQueue';
import { ActionItem } from './ActionItem';
import { useGameEvent } from '../../contexts/WebSocketContext';
import { Plus, Trash2, Save, FolderOpen, RefreshCw } from 'lucide-react';

interface ActionQueuePanelProps {
  characterId: string;
  className?: string;
}

export const ActionQueuePanel: React.FC<ActionQueuePanelProps> = ({
  characterId,
  className = '',
}) => {
  const [queue, setQueue] = useState<ActionQueueDto[]>([]);
  const [currentAction, setCurrentAction] = useState<ActionQueueDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load queue on mount and when character changes
  useEffect(() => {
    loadQueue();
  }, [characterId]);

  const loadQueue = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [queueData, currentData] = await Promise.all([
        actionQueueApi.getActionQueue(characterId),
        actionQueueApi.getCurrentAction(characterId),
      ]);

      // Filter out completed/failed/cancelled from queue
      const activeQueue = queueData.filter(
        (action) =>
          action.status === ActionStatus.Queued ||
          action.status === ActionStatus.Paused
      );

      setQueue(activeQueue);
      setCurrentAction(currentData);
    } catch (err: any) {
      console.error('Failed to load action queue:', err);
      setError(err.message || 'Failed to load queue');
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for real-time action queue updates
  useGameEvent(
    'ActionQueueUpdated',
    (data) => {
      if (data.characterId === characterId) {
        console.log('🔄 Action queue updated via WebSocket');
        loadQueue();
      }
    },
    [characterId]
  );

  useGameEvent(
    'ActionStarted',
    (data) => {
      if (data.characterId === characterId) {
        console.log('▶️ Action started:', data.action);
        setCurrentAction(data.action);
        // Remove from queue
        setQueue((prev) => prev.filter((a) => a.id !== data.actionId));
      }
    },
    [characterId]
  );

  useGameEvent(
    'ActionCompleted',
    (data) => {
      if (data.characterId === characterId) {
        console.log('✅ Action completed:', data);
        setCurrentAction(null);
        loadQueue(); // Reload to get next action
      }
    },
    [characterId]
  );

  useGameEvent(
    'ActionFailed',
    (data) => {
      if (data.characterId === characterId) {
        console.log('❌ Action failed:', data.reason);
        setCurrentAction(null);
        loadQueue();
      }
    },
    [characterId]
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = queue.findIndex((item) => item.id === active.id);
    const newIndex = queue.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Optimistic update
    const newQueue = arrayMove(queue, oldIndex, newIndex);
    setQueue(newQueue);

    // Send to backend
    try {
      const actionIds = newQueue.map((action) => action.id);
      await actionQueueApi.reorderQueue(characterId, actionIds);
      console.log('✅ Queue reordered successfully');
    } catch (err: any) {
      console.error('Failed to reorder queue:', err);
      // Revert on error
      setQueue(queue);
      setError('Failed to reorder queue');
    }
  };

  const handleCancelAction = async (actionId: string) => {
    try {
      await actionQueueApi.cancelAction(characterId, actionId);
      setQueue((prev) => prev.filter((a) => a.id !== actionId));

      // If it's the current action, clear it
      if (currentAction?.id === actionId) {
        setCurrentAction(null);
      }
    } catch (err: any) {
      console.error('Failed to cancel action:', err);
      setError('Failed to cancel action');
    }
  };

  const handlePauseAction = async (actionId: string) => {
    try {
      await actionQueueApi.pauseAction(characterId, actionId);
      loadQueue();
    } catch (err: any) {
      console.error('Failed to pause action:', err);
      setError('Failed to pause action');
    }
  };

  const handleResumeAction = async (actionId: string) => {
    try {
      await actionQueueApi.resumeAction(characterId, actionId);
      loadQueue();
    } catch (err: any) {
      console.error('Failed to resume action:', err);
      setError('Failed to resume action');
    }
  };

  const handleClearQueue = async () => {
    if (!confirm('Are you sure you want to clear the entire queue?')) {
      return;
    }

    try {
      await actionQueueApi.clearQueue(characterId);
      setQueue([]);
    } catch (err: any) {
      console.error('Failed to clear queue:', err);
      setError('Failed to clear queue');
    }
  };

  const queuedActionIds = queue.map((action) => action.id);

  if (isLoading && queue.length === 0) {
    return (
      <div className={`bg-card rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Loading queue...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          📋 Action Queue
          <span className="text-sm font-normal text-gray-400">
            ({queue.length} queued)
          </span>
        </h3>

        <div className="flex gap-2">
          <button
            onClick={loadQueue}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="p-2 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
            title="Templates"
          >
            <FolderOpen className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearQueue}
            disabled={queue.length === 0}
            className="p-2 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Clear Queue"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-300 hover:text-red-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Current Action */}
      {currentAction && (
        <div className="p-4 border-b border-gray-700">
          <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">
            Currently Executing
          </div>
          <ActionItem
            action={currentAction}
            onCancel={() => handleCancelAction(currentAction.id)}
            onPause={() => handlePauseAction(currentAction.id)}
            isDisabled={false}
          />
        </div>
      )}

      {/* Queue */}
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {queue.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-400 mb-2">No actions queued</p>
            <p className="text-sm text-gray-500">
              Add actions to manage your character's activities
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={queuedActionIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-0">
                {queue.map((action, index) => (
                  <div key={action.id}>
                    {index > 0 && (
                      <div className="flex items-center justify-center my-1">
                        <div className="text-xs text-gray-600">↓</div>
                      </div>
                    )}
                    <ActionItem
                      action={action}
                      onCancel={() => handleCancelAction(action.id)}
                      onPause={
                        action.status === ActionStatus.InProgress
                          ? () => handlePauseAction(action.id)
                          : undefined
                      }
                      onResume={
                        action.status === ActionStatus.Paused
                          ? () => handleResumeAction(action.id)
                          : undefined
                      }
                    />
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">
          Quick Actions
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm transition-colors">
            + Move
          </button>
          <button className="px-3 py-1 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm transition-colors">
            + Gather
          </button>
          <button className="px-3 py-1 rounded bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-sm transition-colors">
            + Craft
          </button>
          <button className="px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm transition-colors">
            + Rest
          </button>
        </div>
      </div>
    </div>
  );
};
