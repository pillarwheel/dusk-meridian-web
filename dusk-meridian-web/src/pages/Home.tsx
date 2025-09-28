import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, MapPin, Zap, Shield, Clock, TrendingUp, Activity } from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import { useWorldStatistics } from '@/hooks/useWorldStatistics';
// Re-enabling components gradually
// import { GameServerExample } from '@/components/examples/GameServerExample';
import { ServerConnectionTest } from '@/components/examples/ServerConnectionTest';
import { UnityActionQueueExample } from '@/components/examples/UnityActionQueueExample';

export const Home: React.FC = () => {
  const {
    worldStats,
    populationStats,
    isLoading,
    error,
    formattedWorldTime,
    playerStatusBreakdown,
    derivedStats,
    serverStatus,
    hasActiveBattles,
    lastUpdated
  } = useWorldStatistics({
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000 // 5 minutes
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="dusk-gradient rounded-lg p-8 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Dusk Meridian
          </h1>
          <p className="text-xl mb-6 opacity-90">
            A persistent strategy MMO where factions clash, settlements rise, and legends are forged.
            Build your empire, command your forces, and shape the world.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to={ROUTES.MAP} className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2">
              <span>Explore World</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to={ROUTES.MARKETPLACE} className="border border-white/30 px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
              Browse NFTs
            </Link>
            <Link to={ROUTES.CODEX} className="border border-white/30 px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
              Game Codex
            </Link>
          </div>

          {/* Live World Time */}
          {formattedWorldTime && (
            <div className="mt-6 flex items-center space-x-4 text-white/90">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-medium">
                {formattedWorldTime.fullDate} - {formattedWorldTime.formatted}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                formattedWorldTime.dayNight === 'day' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
              }`}>
                {formattedWorldTime.dayNight === 'day' ? '☀️ Day' : '🌙 Night'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {error && (
        <div className="bg-red-600/20 border border-red-600/30 text-red-400 p-4 rounded-lg">
          <p className="font-medium">Unable to load live world statistics</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isLoading ? 'animate-pulse' : ''}`}>
                {isLoading ? '...' :
                 playerStatusBreakdown ? playerStatusBreakdown.online.toLocaleString() : '1,247'}
              </p>
              <p className="text-sm text-muted-foreground">Players Online</p>
              {playerStatusBreakdown && (
                <p className="text-xs text-muted-foreground">
                  {playerStatusBreakdown.onlinePercentage.toFixed(1)}% of {playerStatusBreakdown.total.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isLoading ? 'animate-pulse' : ''}`}>
                {isLoading ? '...' :
                 worldStats ? worldStats.totalSettlements.toLocaleString() : '89'}
              </p>
              <p className="text-sm text-muted-foreground">Active Settlements</p>
              {worldStats && (
                <p className="text-xs text-muted-foreground">
                  {worldStats.totalFactions} factions
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isLoading ? 'animate-pulse' : ''}`}>
                {isLoading ? '...' :
                 worldStats ? worldStats.totalClasses : '92'}
              </p>
              <p className="text-sm text-muted-foreground">Character Classes</p>
              {populationStats && (
                <p className="text-xs text-muted-foreground">
                  Avg Level {populationStats.averageLevel.toFixed(1)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              hasActiveBattles ? 'bg-red-600/20' : 'bg-green-600/20'
            }`}>
              <Shield className={`w-5 h-5 ${hasActiveBattles ? 'text-red-400' : 'text-green-400'}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isLoading ? 'animate-pulse' : ''} ${
                hasActiveBattles ? 'text-red-400' : 'text-green-400'
              }`}>
                {isLoading ? '...' :
                 worldStats ? worldStats.activeBattles : '12'}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasActiveBattles ? 'Active Battles' : 'World at Peace'}
              </p>
              {derivedStats && (
                <p className="text-xs text-muted-foreground">
                  {(derivedStats.battleDensity * 100).toFixed(1)}% conflict rate
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Server Status Indicator */}
      {lastUpdated && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${
              serverStatus === 'online' ? 'bg-green-400' :
              serverStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
            }`} />
            <span>
              Live data updated {lastUpdated.toLocaleTimeString()}
              {worldStats && ` • Server uptime: ${worldStats.serverUptime}`}
            </span>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="game-card">
          <h3 className="text-xl font-bold mb-3">Interactive World Map</h3>
          <p className="text-muted-foreground mb-4">
            Explore a living world with real-time player movements, settlement growth, and faction territories.
          </p>
          <Link to={ROUTES.MAP} className="game-button-secondary">
            View Map
          </Link>
        </div>

        <div className="game-card">
          <h3 className="text-xl font-bold mb-3">NFT Marketplace</h3>
          <p className="text-muted-foreground mb-4">
            Trade powerful characters, unique power sources, and legendary equipment as NFTs.
          </p>
          <Link to={ROUTES.MARKETPLACE} className="game-button-secondary">
            Browse Marketplace
          </Link>
        </div>

        <div className="game-card">
          <h3 className="text-xl font-bold mb-3">Settlement Management</h3>
          <p className="text-muted-foreground mb-4">
            Build and manage your settlements, deploy forces, and coordinate with your faction.
          </p>
          <Link to={ROUTES.DASHBOARD} className="game-button-secondary">
            Manage Settlement
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="game-card">
        <h3 className="text-xl font-bold mb-4">Recent World Events</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
            <div>
              <p className="font-medium">Settlement "Iron Bastion" founded</p>
              <p className="text-sm text-muted-foreground">Blue faction establishes new stronghold in the northern mountains</p>
            </div>
            <span className="text-xs text-muted-foreground">2m ago</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
            <div>
              <p className="font-medium">Legendary NFT discovered</p>
              <p className="text-sm text-muted-foreground">Player "DragonSlayer" found a Mythic Power Source</p>
            </div>
            <span className="text-xs text-muted-foreground">15m ago</span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
            <div>
              <p className="font-medium">Battle concluded</p>
              <p className="text-sm text-muted-foreground">Red faction successfully defended "Crimson Keep"</p>
            </div>
            <span className="text-xs text-muted-foreground">1h ago</span>
          </div>
        </div>
      </div>

      {/* Server Connection Test */}
      <ServerConnectionTest />

      {/* Unity Action Queue System Demo */}
      <UnityActionQueueExample />

      {/* GameServer Integration Demo */}
      {/* <GameServerExample /> */}
    </div>
  );
};