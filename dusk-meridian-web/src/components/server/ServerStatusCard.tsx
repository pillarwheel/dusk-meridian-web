import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Server, Activity, AlertCircle } from 'lucide-react';
import { serverMetricsApi, type ServerStatus } from '@/api/endpoints/serverMetrics';

export const ServerStatusCard: React.FC = () => {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await serverMetricsApi.getStatus();
      setStatus(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching server status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return '< 1h';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'healthy': return 'Operational';
      case 'degraded': return 'Degraded';
      case 'critical': return 'Issues';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Server className="w-4 h-4" />
          Server Status
        </h4>
        <div className="flex items-center justify-center py-4">
          <Activity className="w-5 h-5 animate-pulse text-primary" />
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Server className="w-4 h-4" />
          Server Status
        </h4>
        <div className="text-center py-2">
          <AlertCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
        <Server className="w-4 h-4" />
        Server Status
      </h4>

      {/* Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-medium ${getStatusColor(status.status)}`}>
          {getStatusText(status.status)}
        </span>
        <span className="text-xs text-muted-foreground">
          {status.servers.online}/{status.servers.total} online
        </span>
      </div>

      {/* Key Metrics */}
      <div className="space-y-2 text-xs mb-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Avg CPU</span>
          <span className={status.performance.avgCpuPercent > 70 ? 'text-yellow-400 font-medium' : 'text-green-400 font-medium'}>
            {status.performance.avgCpuPercent.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Avg Memory</span>
          <span className={status.performance.avgMemoryPercent > 75 ? 'text-yellow-400 font-medium' : 'text-green-400 font-medium'}>
            {status.performance.avgMemoryPercent.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Response</span>
          <span className="text-blue-400 font-medium">{status.performance.avgResponseTimeMs}ms</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Uptime</span>
          <span className="text-purple-400 font-medium">{formatUptime(status.performance.avgUptimeSeconds)}</span>
        </div>
      </div>

      {/* View Details Link */}
      <div className="mt-3 pt-2 border-t border-border">
        <Link
          to="/server-statistics"
          className="text-xs text-primary hover:text-primary/80 transition-colors"
        >
          View Full Statistics →
        </Link>
      </div>
    </div>
  );
};
