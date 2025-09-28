import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, User, Wallet, Settings, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import { HUDStats } from '@/components/hud/HUDStats';
// import { HUDStats as HUDStatsType } from '@/api/types/hud';
import { useIMXAuth } from '@/contexts/IMXAuthContext';
import { UserProfile } from '@/components/auth/UserProfile';

export const Header: React.FC = () => {
  // Use IMX Passport authentication
  const { user, isAuthenticated, login, logout, isLoading } = useIMXAuth();
  const isSignalRConnected = false;
  const connectionState = 'Disconnected';

  // TODO: Implement SignalR connection status
  // const { isConnected: isSignalRConnected, connectionState } = useSignalR();

  // Mock HUD data - replace with actual game state
  const mockHUDStats = {
    health: { current: 85, max: 100 },
    mana: { current: 42, max: 60 },
    survival: {
      lastEaten: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      lastDrank: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      lastSlept: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      hunger: 75,
      thirst: 90,
      fatigue: 25
    },
    experience: {
      current: 2850,
      level: 15,
      nextLevelXP: 3500,
      totalXP: 28750
    },
    currency: {
      gold: 1247,
      silver: 85,
      copper: 23,
      premiumCurrency: 5
    },
    actionPoints: { current: 8, max: 12 },
    location: {
      name: "Ironhold Outpost",
      coordinates: { x: 245, y: 158, z: 12 },
      settlementName: "Ironhold",
      regionName: "Northern Wastes",
      temperature: -5,
      danger: 'medium' as const
    },
    serverTime: {
      serverTime: new Date(),
      gameTime: {
        day: 127,
        hour: 14,
        minute: 32,
        season: 'winter' as const,
        year: 2
      },
      tickCounter: 156742,
      timeScale: 24 // 24x real time
    },
    weather: {
      condition: 'snow' as const,
      temperature: -5,
      humidity: 85,
      windSpeed: 15,
      visibility: 60,
      forecast: []
    }
  };

  return (
    <header className="bg-card border-b border-border">
      {/* Top Bar with Logo, HUD, and Controls */}
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 dusk-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DM</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              Dusk Meridian
            </span>
          </Link>
        </div>

        {/* Compact HUD Stats */}
        <div className="flex-1 flex justify-center">
          <HUDStats stats={mockHUDStats} compact />
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-4">
          {/* SignalR Connection Status */}
          <button
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors",
              isSignalRConnected
                ? "bg-green-600/20 border-green-600 text-green-400"
                : "bg-secondary border-border text-muted-foreground hover:text-foreground"
            )}
            title={`SignalR: ${connectionState}`}
          >
            {isSignalRConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-sm hidden sm:block">
              {connectionState}
            </span>
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <UserProfile compact />
            ) : (
              <button
                onClick={login}
                className="game-button text-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Login'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Bar with Search and Navigation Tools */}
      <div className="px-6 py-2 bg-background/50 border-t border-border">
        <div className="flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search settlements, players, NFTs..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="flex items-center space-x-2 ml-4">
            <button className="px-3 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
              Quick Travel
            </button>
            <button className="px-3 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
              Rest
            </button>
            <button className="px-3 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
              Inventory
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};