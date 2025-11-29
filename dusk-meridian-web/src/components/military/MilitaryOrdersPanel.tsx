import React, { useState, useEffect } from 'react';
import { militaryOrdersApi } from '../../api/endpoints/militaryOrders';
import { MilitaryOrderDto, OrderStatus, OrderType, CreateMilitaryOrderDto } from '../../api/types/military';
import { MilitaryOrderItem } from './MilitaryOrderItem';
import { useGameEvent } from '../../contexts/WebSocketContext';
import { Plus, RefreshCw, Filter, AlertTriangle } from 'lucide-react';

interface MilitaryOrdersPanelProps {
  settlementId: string;
  factionId: string;
  className?: string;
}

export const MilitaryOrdersPanel: React.FC<MilitaryOrdersPanelProps> = ({
  settlementId,
  factionId,
  className = '',
}) => {
  const [orders, setOrders] = useState<MilitaryOrderDto[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<MilitaryOrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, [settlementId]);

  // Filter orders when filter changes
  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.status === filterStatus));
    }
  }, [orders, filterStatus]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await militaryOrdersApi.getOrdersBySettlement(settlementId);
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to load military orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for military order events
  useGameEvent(
    'MilitaryOrderCreated',
    (data) => {
      console.log('🎖️ New military order created:', data);
      loadOrders();
    },
    []
  );

  useGameEvent(
    'MilitaryOrderStatusChanged',
    (data) => {
      console.log('📊 Military order status changed:', data);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === data.orderId ? { ...order, status: data.status } : order
        )
      );
    },
    []
  );

  useGameEvent(
    'MilitaryOrderCompleted',
    (data) => {
      console.log('✅ Military order completed:', data);
      loadOrders();
    },
    []
  );

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await militaryOrdersApi.cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: OrderStatus.Cancelled } : order
        )
      );
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      setError(err.message || 'Failed to cancel order');
    }
  };

  const handleExecuteOrder = async (orderId: string) => {
    try {
      await militaryOrdersApi.executeOrder(orderId);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: OrderStatus.InProgress } : order
        )
      );
    } catch (err: any) {
      console.error('Failed to execute order:', err);
      setError(err.message || 'Failed to execute order');
    }
  };

  const handleViewDetails = (orderId: string) => {
    // TODO: Open order details modal
    console.log('View order details:', orderId);
  };

  const activeOrders = orders.filter(
    (o) => o.status === OrderStatus.InProgress || o.status === OrderStatus.Pending
  );
  const completedOrders = orders.filter((o) => o.status === OrderStatus.Completed);
  const failedOrders = orders.filter((o) => o.status === OrderStatus.Failed);

  if (isLoading && orders.length === 0) {
    return (
      <div className={`bg-card rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-400">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            ⚔️ Military Orders
            <span className="text-sm font-normal text-gray-400">
              ({activeOrders.length} active)
            </span>
          </h3>
          <div className="flex gap-4 mt-1 text-xs text-gray-400">
            <span className="text-green-400">{completedOrders.length} completed</span>
            {failedOrders.length > 0 && (
              <span className="text-red-400">{failedOrders.length} failed</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
            className="px-3 py-2 rounded bg-gray-800 border border-gray-700 text-gray-300 text-sm"
          >
            <option value="all">All Orders</option>
            <option value={OrderStatus.Pending}>Pending</option>
            <option value={OrderStatus.InProgress}>In Progress</option>
            <option value={OrderStatus.Completed}>Completed</option>
            <option value={OrderStatus.Failed}>Failed</option>
            <option value={OrderStatus.Cancelled}>Cancelled</option>
          </select>

          <button
            onClick={loadOrders}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Order
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-300 hover:text-red-100 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚔️</div>
            <p className="text-gray-400 mb-2">No military orders</p>
            <p className="text-sm text-gray-500">
              Create an order to deploy troops and execute military operations
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-6 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              Create First Order
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <MilitaryOrderItem
                key={order.id}
                order={order}
                onCancel={handleCancelOrder}
                onExecute={handleExecuteOrder}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="p-4 border-t border-gray-700 bg-gray-900/50">
        <div className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">
          Quick Orders
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm transition-colors">
            + Move Troops
          </button>
          <button className="px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm transition-colors">
            + Attack
          </button>
          <button className="px-3 py-1 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm transition-colors">
            + Defend
          </button>
          <button className="px-3 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm transition-colors">
            + Garrison
          </button>
          <button className="px-3 py-1 rounded bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-sm transition-colors">
            + Patrol
          </button>
        </div>
      </div>

      {/* Create Order Modal - TODO: Implement full modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Create Military Order</h3>
            <p className="text-gray-400 mb-4">
              Order creation UI coming soon! For now, use the API directly.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
