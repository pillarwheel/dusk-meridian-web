import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, Settings, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIMXAuth } from '@/contexts/IMXAuthContext';
import { UserProfile } from '@/components/auth/UserProfile';

export const Header: React.FC = () => {
  const { user, isAuthenticated, login, isLoading } = useIMXAuth();
  const isSignalRConnected = false;
  const connectionState = 'Disconnected';

  return (
    <header className="bg-card border-b border-border">
      {/* Top Bar with Logo and Controls */}
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DM</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">
              Dusk Meridian
            </span>
          </Link>
        </div>

        {/* Center Stats Placeholder */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Level 15</span>
            <span>•</span>
            <span>HP: 85/100</span>
            <span>•</span>
            <span>Gold: 1,247</span>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <button
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors",
              isSignalRConnected
                ? "bg-green-600/20 border-green-600 text-green-400"
                : "bg-secondary border-border text-muted-foreground hover:text-foreground"
            )}
            title={`Server: ${connectionState}`}
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
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Login'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Bar with Search */}
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

          {/* Quick Actions */}
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