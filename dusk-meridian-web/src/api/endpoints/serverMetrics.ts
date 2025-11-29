/**
 * Server Metrics API Endpoints
 *
 * Connects to ServerManager for real-time infrastructure monitoring
 */

const SERVER_MANAGER_URL = import.meta.env.VITE_SERVER_MANAGER_URL || 'http://localhost:3000';

export interface ServerStatus {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  servers: {
    total: number;
    online: number;
    offline: number;
  };
  performance: {
    avgCpuPercent: number;
    avgMemoryPercent: number;
    avgResponseTimeMs: number;
    avgUptimeSeconds: number;
  };
  services: Array<{
    name: string;
    status: string;
    cpuPercent: number;
    memoryPercent: number;
    uptimeSeconds: number;
  }>;
}

export interface ServerStatistics {
  timestamp: string;
  overview: {
    totalServers: number;
    activeServers: number;
    plannedServers: number;
    overallHealth: 'healthy' | 'degraded' | 'critical';
    totalUptime: number;
  };
  activeServers: Array<{
    name: string;
    status: string;
    pid: number;
    uptime: number;
    cpu: {
      percent: number;
      trend: 'up' | 'down' | 'stable';
    };
    memory: {
      percent: number;
      rssBytes: number;
      trend: 'up' | 'down' | 'stable';
    };
    responseTime: number;
    health: 'healthy' | 'warning' | 'critical';
  }>;
  plannedServers: Array<{
    name: string;
    status: string;
    description: string;
    estimatedLaunch: string;
  }>;
  trends: {
    cpu: { labels: string[]; values: number[] };
    memory: { labels: string[]; values: number[] };
  };
  capacity: {
    showCosts: boolean;
    estimatedMonthlyCost: number;
    serverCapacity: string;
  };
}

export const serverMetricsApi = {
  /**
   * Get current server status (lightweight)
   */
  async getStatus(): Promise<ServerStatus> {
    const response = await fetch(`${SERVER_MANAGER_URL}/api/metrics/public/status`);

    if (!response.ok) {
      throw new Error(`Failed to fetch server status: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get detailed server statistics
   */
  async getStatistics(): Promise<ServerStatistics> {
    const response = await fetch(`${SERVER_MANAGER_URL}/api/metrics/public/statistics`);

    if (!response.ok) {
      throw new Error(`Failed to fetch server statistics: ${response.statusText}`);
    }

    return response.json();
  }
};
