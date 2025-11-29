import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Server, Activity, Cpu, MemoryStick, Clock, TrendingUp,
  TrendingDown, Minus, AlertCircle, CheckCircle, XCircle, ArrowLeft
} from 'lucide-react';
import { serverMetricsApi, type ServerStatistics as ServerStats } from '@/api/endpoints/serverMetrics';

export const ServerStatistics: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchStatistics();

    if (autoRefresh) {
      const interval = setInterval(fetchStatistics, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchStatistics = async () => {
    try {
      const data = await serverMetricsApi.getStatistics();
      setStats(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(0)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getHealthColor = (health: string): string => {
    switch (health) {
      case 'healthy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading server statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Failed to Load Statistics</h2>
          <p className="text-muted-foreground mb-4">Unable to retrieve server statistics</p>
          <button
            onClick={fetchStatistics}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">Server Statistics</h1>
              <p className="text-sm text-muted-foreground">Real-time infrastructure monitoring</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="cursor-pointer"
              />
              Auto-refresh
            </label>
            <button
              onClick={fetchStatistics}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Refresh Now
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <Server className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold">{stats.overview.totalServers}</span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Total Servers</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.overview.activeServers} active, {stats.overview.plannedServers} planned
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <Activity className="w-6 h-6 text-green-400" />
              <span className={`text-2xl font-bold capitalize ${getHealthColor(stats.overview.overallHealth)}`}>
                {stats.overview.overallHealth}
              </span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Overall Health</h3>
            <p className="text-xs text-muted-foreground mt-1">System status</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <Clock className="w-6 h-6 text-purple-400" />
              <span className="text-2xl font-bold">{formatUptime(stats.overview.totalUptime)}</span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Total Uptime</h3>
            <p className="text-xs text-muted-foreground mt-1">Combined uptime</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <CheckCircle className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Capacity</h3>
            <p className="text-sm font-medium">{stats.capacity.serverCapacity}</p>
          </div>
        </div>

        {/* Active Servers Table */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Active Servers
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">Server</th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">CPU</th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">Memory</th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">RAM Used</th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">Response</th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">Uptime</th>
                </tr>
              </thead>
              <tbody>
                {stats.activeServers.map(server => (
                  <tr key={server.name} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium">{server.name}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getHealthColor(server.health)}`}>
                          {server.health === 'healthy' && <CheckCircle className="w-3 h-3" />}
                          {server.health === 'warning' && <AlertCircle className="w-3 h-3" />}
                          {server.health === 'critical' && <XCircle className="w-3 h-3" />}
                          {server.health}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <span className={server.cpu.percent > 70 ? 'text-yellow-400 font-medium' : 'text-green-400 font-medium'}>
                          {server.cpu.percent}%
                        </span>
                        {getTrendIcon(server.cpu.trend)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <span className={server.memory.percent > 75 ? 'text-yellow-400 font-medium' : 'text-green-400 font-medium'}>
                          {server.memory.percent}%
                        </span>
                        {getTrendIcon(server.memory.trend)}
                      </div>
                    </td>
                    <td className="p-3 text-center text-muted-foreground">{formatBytes(server.memory.rssBytes)}</td>
                    <td className="p-3 text-center text-blue-400 font-medium">{server.responseTime}ms</td>
                    <td className="p-3 text-center text-muted-foreground">{formatUptime(server.uptime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Planned Microservices */}
        {stats.plannedServers.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-yellow-400" />
              Planned Microservices
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {stats.plannedServers.map(service => (
                <div
                  key={service.name}
                  className="p-4 bg-muted rounded-lg border border-yellow-400/20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{service.name}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
                      {service.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                  <p className="text-xs text-muted-foreground">Est. Launch: {service.estimatedLaunch}</p>
                </div>
              ))}
            </div>

            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-400 mb-1">Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  These microservices are planned for future deployment. Check the project documentation for updates.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(stats.timestamp).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Statistics refresh automatically every minute
          </p>
        </div>
      </div>
    </div>
  );
};
