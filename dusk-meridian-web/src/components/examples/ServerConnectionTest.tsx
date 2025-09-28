import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Wifi, WifiOff, Server } from 'lucide-react';
import axios from 'axios';
import { signalRClient } from '@/services/signalr';
import { useSignalR } from '@/hooks/useSignalR';

interface ServerStatus {
  name: string;
  url: string;
  status: 'checking' | 'online' | 'offline' | 'error';
  response?: string;
  responseTime?: number;
  error?: string;
}

export const ServerConnectionTest: React.FC = () => {
  const [servers, setServers] = useState<ServerStatus[]>([
    {
      name: 'GameServer (HTTP)',
      url: 'http://localhost:5105',
      status: 'checking'
    },
    {
      name: 'GameServer (HTTPS)',
      url: 'https://localhost:5001',
      status: 'checking'
    },
    {
      name: 'WorldServer',
      url: 'http://localhost:5002',
      status: 'checking'
    }
  ]);

  const { connectionState, isConnected } = useSignalR();
  const [signalRTestResult, setSignalRTestResult] = useState<string>('');

  const testServerConnection = async (server: ServerStatus, index: number) => {
    const startTime = Date.now();

    try {
      // Update status to checking
      setServers(prev => prev.map((s, i) =>
        i === index ? { ...s, status: 'checking' as const } : s
      ));

      // Test basic connectivity first
      const response = await axios.get(`${server.url}/health`, {
        timeout: 5000,
        validateStatus: () => true, // Accept any status code
      });

      const responseTime = Date.now() - startTime;

      if (response.status === 200) {
        setServers(prev => prev.map((s, i) =>
          i === index ? {
            ...s,
            status: 'online' as const,
            response: `HTTP ${response.status}`,
            responseTime
          } : s
        ));
      } else {
        setServers(prev => prev.map((s, i) =>
          i === index ? {
            ...s,
            status: 'error' as const,
            response: `HTTP ${response.status}`,
            responseTime,
            error: response.statusText || 'Unknown error'
          } : s
        ));
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          setServers(prev => prev.map((s, i) =>
            i === index ? {
              ...s,
              status: 'offline' as const,
              responseTime,
              error: 'Connection refused - server not running'
            } : s
          ));
        } else if (error.code === 'ENOTFOUND') {
          setServers(prev => prev.map((s, i) =>
            i === index ? {
              ...s,
              status: 'offline' as const,
              responseTime,
              error: 'Host not found'
            } : s
          ));
        } else {
          setServers(prev => prev.map((s, i) =>
            i === index ? {
              ...s,
              status: 'error' as const,
              responseTime,
              error: error.message
            } : s
          ));
        }
      } else {
        setServers(prev => prev.map((s, i) =>
          i === index ? {
            ...s,
            status: 'error' as const,
            responseTime,
            error: 'Unknown error occurred'
          } : s
        ));
      }
    }
  };

  const testGameServerAPI = async () => {
    try {
      // Test Swagger endpoint first
      const swaggerResponse = await axios.get('http://localhost:5105/swagger/v1/swagger.json', {
        timeout: 5000,
      });

      if (swaggerResponse.status === 200) {
        setSignalRTestResult(`GameServer API: Swagger docs available ✓ (${swaggerResponse.data.info?.title || 'API'})`);
      }
    } catch (error) {
      try {
        // If swagger fails, try a protected endpoint to check auth requirement
        const response = await axios.get('http://localhost:5105/api/v1/movement/nearby?characterId=1', {
          timeout: 5000,
        });
        setSignalRTestResult(`GameServer API: Unexpected success - ${response.status}`);
      } catch (authError) {
        if (axios.isAxiosError(authError)) {
          if (authError.response?.status === 500 && authError.response.data?.includes('authorization')) {
            setSignalRTestResult(`GameServer API: Working ✓ (requires Auth0 JWT token as expected)`);
          } else if (authError.response?.status === 401) {
            setSignalRTestResult(`GameServer API: Working ✓ (401 Unauthorized as expected)`);
          } else {
            setSignalRTestResult(`GameServer API Error: ${authError.message}`);
          }
        } else {
          setSignalRTestResult(`GameServer API Error: Unknown error`);
        }
      }
    }
  };

  const testSignalRConnection = async () => {
    try {
      if (!isConnected) {
        setSignalRTestResult('Attempting to connect to SignalR...');
        await signalRClient.connect();
        setSignalRTestResult('SignalR connection successful!');
      } else {
        setSignalRTestResult('SignalR already connected');
      }
    } catch (error) {
      setSignalRTestResult(`SignalR Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test all servers on component mount
  useEffect(() => {
    servers.forEach((server, index) => {
      testServerConnection(server, index);
    });
  }, []);

  const getStatusIcon = (status: ServerStatus['status']) => {
    switch (status) {
      case 'checking':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ServerStatus['status']) => {
    switch (status) {
      case 'online':
        return 'border-green-500 bg-green-500/10';
      case 'offline':
        return 'border-red-500 bg-red-500/10';
      case 'error':
        return 'border-orange-500 bg-orange-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="game-card">
      <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
        <Server className="w-5 h-5" />
        <span>Server Connection Test</span>
      </h3>

      {/* Server Status */}
      <div className="space-y-4 mb-6">
        <h4 className="font-semibold">Server Health Checks</h4>
        {servers.map((server, index) => (
          <div
            key={server.name}
            className={`p-4 rounded-lg border-2 transition-all ${getStatusColor(server.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(server.status)}
                <div>
                  <h5 className="font-medium">{server.name}</h5>
                  <p className="text-sm text-muted-foreground">{server.url}</p>
                </div>
              </div>
              <div className="text-right">
                {server.response && (
                  <span className="text-sm font-mono">{server.response}</span>
                )}
                {server.responseTime && (
                  <p className="text-xs text-muted-foreground">
                    {server.responseTime}ms
                  </p>
                )}
              </div>
            </div>
            {server.error && (
              <div className="mt-2 text-sm text-red-400">
                Error: {server.error}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SignalR Status */}
      <div className="space-y-4 mb-6">
        <h4 className="font-semibold">Real-time Connection (SignalR)</h4>
        <div className={`p-4 rounded-lg border-2 transition-all ${
          isConnected ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <div>
                <h5 className="font-medium">SignalR Hub</h5>
                <p className="text-sm text-muted-foreground">wss://localhost:5001/worldhub</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-mono">{connectionState}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="space-y-4">
        <h4 className="font-semibold">Connection Tests</h4>
        <div className="flex space-x-2 flex-wrap">
          <button
            onClick={() => servers.forEach((server, index) => testServerConnection(server, index))}
            className="game-button-secondary text-sm"
          >
            Refresh All Servers
          </button>
          <button
            onClick={testGameServerAPI}
            className="game-button-secondary text-sm"
          >
            Test GameServer API
          </button>
          <button
            onClick={testSignalRConnection}
            className="game-button-secondary text-sm"
          >
            Test SignalR Connection
          </button>
        </div>

        {signalRTestResult && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-mono">{signalRTestResult}</p>
          </div>
        )}
      </div>

      {/* Connection URLs */}
      <div className="mt-6 p-4 rounded-lg bg-muted/50">
        <h5 className="font-medium mb-2">Available Endpoints</h5>
        <div className="text-sm space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-mono">GameServer HTTP API:</span>
            <a
              href="http://localhost:5105/api/v1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              http://localhost:5105/api/v1
            </a>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono">GameServer Swagger:</span>
            <a
              href="http://localhost:5105/swagger/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              http://localhost:5105/swagger
            </a>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono">GameServer HTTPS:</span>
            <a
              href="https://localhost:5001/api/v1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              https://localhost:5001/api/v1
            </a>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono">WorldServer:</span>
            <a
              href="http://localhost:5002"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              http://localhost:5002
            </a>
          </div>
          <div className="font-mono">SignalR Hub: wss://localhost:5001/worldhub</div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="mt-4 p-4 rounded-lg bg-blue-600/10 border border-blue-600/20">
        <h5 className="font-medium mb-2 text-blue-400">🎯 Next Steps</h5>
        <div className="text-sm space-y-1">
          <div>1. Open GameServer Swagger docs to see all available endpoints</div>
          <div>2. Configure Auth0 Client ID in .env file for authentication</div>
          <div>3. Test character movement and real-time features</div>
          <div>4. Use the demo component below to interact with your game data</div>
        </div>
      </div>
    </div>
  );
};