import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionQueueDto, ActionStatus } from '../../api/types/actionQueue';
import { Pause, Play, X, GripVertical, Clock, Target, AlertCircle } from 'lucide-react';

interface ActionItemProps {
  action: ActionQueueDto;
  onCancel: () => void;
  onPause?: () => void;
  onResume?: () => void;
  isDisabled?: boolean;
}

const getActionIcon = (actionName: string): React.ReactNode => {
  const name = actionName.toLowerCase();

  if (name.includes('eat') || name.includes('food')) return '🍖';
  if (name.includes('drink') || name.includes('water')) return '💧';
  if (name.includes('sleep') || name.includes('rest')) return '😴';
  if (name.includes('move') || name.includes('walk')) return '🚶';
  if (name.includes('gather') || name.includes('harvest')) return '⛏️';
  if (name.includes('craft') || name.includes('build')) return '🔨';
  if (name.includes('attack') || name.includes('combat')) return '⚔️';
  if (name.includes('guard') || name.includes('defend')) return '🛡️';
  if (name.includes('train') || name.includes('practice')) return '📚';
  if (name.includes('trade') || name.includes('buy')) return '💰';

  return '📋';
};

const getStatusColor = (status: ActionStatus): string => {
  switch (status) {
    case ActionStatus.InProgress:
      return 'bg-blue-500/20 border-blue-500';
    case ActionStatus.Queued:
      return 'bg-gray-500/20 border-gray-500';
    case ActionStatus.Paused:
      return 'bg-yellow-500/20 border-yellow-500';
    case ActionStatus.Completed:
      return 'bg-green-500/20 border-green-500';
    case ActionStatus.Failed:
      return 'bg-red-500/20 border-red-500';
    case ActionStatus.Cancelled:
      return 'bg-gray-400/20 border-gray-400';
    default:
      return 'bg-gray-500/20 border-gray-500';
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Physiological':
      return 'text-red-400';
    case 'Safety':
      return 'text-orange-400';
    case 'Social':
      return 'text-blue-400';
    case 'Esteem':
      return 'text-purple-400';
    case 'SelfActualization':
      return 'text-green-400';
    default:
      return 'text-gray-400';
  }
};

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
};

const formatTimeRemaining = (action: ActionQueueDto): string => {
  if (action.status !== ActionStatus.InProgress) return '';

  const remaining = action.durationSeconds * (1 - action.progressPercent / 100);
  return formatDuration(Math.ceil(remaining));
};

export const ActionItem: React.FC<ActionItemProps> = ({
  action,
  onCancel,
  onPause,
  onResume,
  isDisabled = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: action.id,
    disabled: isDisabled || action.status === ActionStatus.InProgress,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isInProgress = action.status === ActionStatus.InProgress;
  const isPaused = action.status === ActionStatus.Paused;
  const isFailed = action.status === ActionStatus.Failed;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative p-3 mb-2 rounded-lg border-2
        ${getStatusColor(action.status)}
        ${isDragging ? 'shadow-lg z-50' : 'shadow'}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
        transition-all duration-200
      `}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        {!isInProgress && !isDisabled && (
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-200 transition-colors"
          >
            <GripVertical className="w-5 h-5" />
          </div>
        )}

        {/* Action Icon */}
        <div className="flex-shrink-0 text-2xl">
          {getActionIcon(action.actionName)}
        </div>

        {/* Action Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-white truncate">
              {action.actionName}
            </h4>
            <span className={`text-xs font-medium ${getCategoryColor(action.actionCategory)}`}>
              P{action.priorityLevel}
            </span>
          </div>

          {/* Progress Bar (only for in-progress actions) */}
          {isInProgress && (
            <div className="mb-2">
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${action.progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
                <span>{Math.round(action.progressPercent)}%</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeRemaining(action)}
                </span>
              </div>
            </div>
          )}

          {/* Target Information */}
          <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-2">
            {action.targetBuildingId && (
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                Building
              </span>
            )}
            {action.targetCharacterId && (
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                Character
              </span>
            )}
            {action.targetX !== null && (
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                ({action.targetX.toFixed(0)}, {action.targetZ?.toFixed(0) || action.targetY?.toFixed(0)})
              </span>
            )}
            {action.targetResourceId && (
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                Resource
              </span>
            )}
            {action.repeatCount > 1 && (
              <span className="text-green-400">
                ↻ {action.currentRepeat}/{action.repeatCount}
              </span>
            )}
          </div>

          {/* Failed Reason */}
          {isFailed && action.failedReason && (
            <div className="flex items-start gap-1 text-xs text-red-400 mb-2">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{action.failedReason}</span>
            </div>
          )}

          {/* Duration */}
          {!isInProgress && (
            <div className="text-xs text-gray-400">
              <Clock className="w-3 h-3 inline mr-1" />
              {formatDuration(action.durationSeconds)}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          {isInProgress && onPause && (
            <button
              onClick={onPause}
              className="p-1 rounded bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 transition-colors"
              title="Pause"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}

          {isPaused && onResume && (
            <button
              onClick={onResume}
              className="p-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
              title="Resume"
            >
              <Play className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onCancel}
            className="p-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
            title={isInProgress ? 'Cancel' : 'Remove'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="absolute top-2 right-2">
        <span className={`
          text-[10px] px-2 py-0.5 rounded-full font-medium
          ${action.status === ActionStatus.InProgress ? 'bg-blue-500 text-white' : ''}
          ${action.status === ActionStatus.Queued ? 'bg-gray-500 text-white' : ''}
          ${action.status === ActionStatus.Paused ? 'bg-yellow-500 text-black' : ''}
          ${action.status === ActionStatus.Failed ? 'bg-red-500 text-white' : ''}
        `}>
          {action.status}
        </span>
      </div>
    </div>
  );
};
