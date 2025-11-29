import React from 'react';
import { MilitaryOrderDto, OrderStatus, OrderType } from '../../api/types/military';
import { Swords, Shield, MapPin, Users, Calendar, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MilitaryOrderItemProps {
  order: MilitaryOrderDto;
  onCancel: (orderId: string) => void;
  onExecute: (orderId: string) => void;
  onViewDetails: (orderId: string) => void;
}

const getOrderIcon = (type: OrderType) => {
  switch (type) {
    case OrderType.Attack:
      return <Swords className="w-5 h-5 text-red-400" />;
    case OrderType.Defend:
      return <Shield className="w-5 h-5 text-blue-400" />;
    case OrderType.Move:
      return <MapPin className="w-5 h-5 text-green-400" />;
    case OrderType.Patrol:
      return <MapPin className="w-5 h-5 text-yellow-400" />;
    case OrderType.Garrison:
      return <Shield className="w-5 h-5 text-purple-400" />;
    default:
      return <Users className="w-5 h-5 text-gray-400" />;
  }
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.InProgress:
      return <Clock className="w-4 h-4 text-blue-400" />;
    case OrderStatus.Completed:
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    case OrderStatus.Failed:
      return <XCircle className="w-4 h-4 text-red-400" />;
    case OrderStatus.Cancelled:
      return <XCircle className="w-4 h-4 text-gray-400" />;
    case OrderStatus.Pending:
      return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.InProgress:
      return 'bg-blue-500/20 border-blue-500';
    case OrderStatus.Completed:
      return 'bg-green-500/20 border-green-500';
    case OrderStatus.Failed:
      return 'bg-red-500/20 border-red-500';
    case OrderStatus.Cancelled:
      return 'bg-gray-500/20 border-gray-500';
    case OrderStatus.Pending:
      return 'bg-yellow-500/20 border-yellow-500';
    default:
      return 'bg-gray-500/20 border-gray-500';
  }
};

const getPriorityColor = (priority: number): string => {
  if (priority >= 9) return 'text-red-400';
  if (priority >= 7) return 'text-orange-400';
  if (priority >= 5) return 'text-yellow-400';
  return 'text-gray-400';
};

export const MilitaryOrderItem: React.FC<MilitaryOrderItemProps> = ({
  order,
  onCancel,
  onExecute,
  onViewDetails,
}) => {
  const isActive = order.status === OrderStatus.InProgress || order.status === OrderStatus.Pending;

  return (
    <div
      className={`
        p-4 rounded-lg border-2 shadow transition-all
        ${getStatusColor(order.status)}
        hover:shadow-lg cursor-pointer
      `}
      onClick={() => onViewDetails(order.id)}
    >
      <div className="flex items-start gap-3">
        {/* Order Icon */}
        <div className="flex-shrink-0 p-2 rounded bg-gray-800">
          {getOrderIcon(order.orderType)}
        </div>

        {/* Order Details */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-white">{order.orderType}</h4>
                <span className={`text-xs font-bold ${getPriorityColor(order.priority)}`}>
                  P{order.priority}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                {order.sourceSettlementName}
                {order.targetSettlementName && (
                  <> → {order.targetSettlementName}</>
                )}
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-gray-800/50">
              {getStatusIcon(order.status)}
              <span className="text-xs font-medium text-white">{order.status}</span>
            </div>
          </div>

          {/* Troops & Supply */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-2">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{order.unitsRemaining}/{order.unitsCommitted} troops</span>
            </div>
            {order.currentSupply > 0 && (
              <div className="flex items-center gap-1">
                <span>📦</span>
                <span>{order.currentSupply}/{order.supplyDays} days supply</span>
              </div>
            )}
            {order.formationName && (
              <div className="flex items-center gap-1">
                <span>⚔️</span>
                <span>{order.formationName}</span>
              </div>
            )}
          </div>

          {/* Timing */}
          {order.estimatedArrival && order.status === OrderStatus.InProgress && (
            <div className="flex items-center gap-1 text-xs text-blue-400 mb-2">
              <Clock className="w-3 h-3" />
              <span>
                ETA: {formatDistanceToNow(new Date(order.estimatedArrival), { addSuffix: true })}
              </span>
            </div>
          )}

          {/* Failed Reason */}
          {order.status === OrderStatus.Failed && order.failedReason && (
            <div className="flex items-start gap-1 text-xs text-red-400 mb-2 bg-red-500/10 p-2 rounded">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{order.failedReason}</span>
            </div>
          )}

          {/* Success Rate */}
          {order.successRate !== null && order.status === OrderStatus.Completed && (
            <div className="text-xs text-gray-400 mb-2">
              <span className="text-green-400">Success Rate: {(order.successRate * 100).toFixed(0)}%</span>
              {order.casualties !== null && order.casualties > 0 && (
                <span className="ml-3 text-red-400">Casualties: {order.casualties}</span>
              )}
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="text-xs text-gray-500 italic mt-2 truncate">
              "{order.notes}"
            </div>
          )}
        </div>

        {/* Actions */}
        {isActive && (
          <div className="flex flex-col gap-1 flex-shrink-0">
            {order.status === OrderStatus.Pending && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onExecute(order.id);
                }}
                className="px-3 py-1 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs transition-colors"
              >
                Execute
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel(order.id);
              }}
              className="px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Issue Date */}
      <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-500">
        Issued {formatDistanceToNow(new Date(order.issueDate), { addSuffix: true })}
      </div>
    </div>
  );
};
