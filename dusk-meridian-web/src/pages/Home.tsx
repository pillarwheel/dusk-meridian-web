import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, MapPin, Shield, Sparkles } from 'lucide-react';
import { ROUTES } from '@/utils/constants';

export const Home: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg p-8 text-center">
        <div className="mb-8 flex justify-center">
          <img
            src="/Images/DuskMeridian-Logo-v1.png"
            alt="Dusk Meridian Logo"
            className="w-full max-w-2xl h-auto"
          />
        </div>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          A persistent strategy MMO where factions clash, settlements rise, and legends are forged.
          Build your empire, command your forces, and shape the world.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={ROUTES.SETTLEMENTS}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            Explore Settlements
          </Link>
          <Link
            to={ROUTES.LOGIN}
            className="px-8 py-3 bg-transparent border-2 border-purple-400 hover:bg-purple-400/10 text-purple-400 font-semibold rounded-lg transition-colors duration-200"
          >
            Enter the World
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="w-12 h-12 mb-4 bg-purple-600/20 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Living Settlements</h3>
          <p className="text-muted-foreground">
            Discover dynamic cities and towns that grow, prosper, and evolve based on player actions.
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="w-12 h-12 mb-4 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Social Gameplay</h3>
          <p className="text-muted-foreground">
            Form alliances, trade with others, and participate in a player-driven economy.
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="w-12 h-12 mb-4 bg-green-600/20 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Persistent World</h3>
          <p className="text-muted-foreground">
            Your actions have lasting consequences in a world that continues even when you're away.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-xl font-semibold mb-4">World Status</h3>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-400 mb-2">3</div>
            <div className="text-muted-foreground">Active Settlements</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400 mb-2">17,000+</div>
            <div className="text-muted-foreground">Total Population</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400 mb-2">∞</div>
            <div className="text-muted-foreground">Possibilities</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-xl font-semibold mb-4">Recent World Events</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
            <div>
              <p className="font-medium">Settlement "Sunspire" continues to grow</p>
              <p className="text-sm text-muted-foreground">City population reaches 12,000 inhabitants</p>
            </div>
            <span className="text-xs text-muted-foreground">2m ago</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
            <div>
              <p className="font-medium">Trade routes established</p>
              <p className="text-sm text-muted-foreground">New connections between Goldenfields and Solar Bastion</p>
            </div>
            <span className="text-xs text-muted-foreground">15m ago</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Server connection stable</p>
              <p className="text-sm text-muted-foreground">All settlements online and functioning</p>
            </div>
            <span className="text-xs text-muted-foreground">1h ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};