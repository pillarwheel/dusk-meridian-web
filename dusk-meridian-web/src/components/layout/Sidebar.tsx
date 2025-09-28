import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Map,
  ShoppingBag,
  BarChart3,
  User,
  BookOpen,
  Sword,
  Scroll,
  Trophy,
  Settings,
  LogOut,
  Castle
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/utils/constants';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navigation: NavItem[] = [
  { name: 'Home', href: ROUTES.HOME, icon: Home },
  { name: 'World Map', href: ROUTES.MAP, icon: Map },
  { name: 'Settlement', href: ROUTES.SETTLEMENT, icon: Castle },
  { name: 'Marketplace', href: ROUTES.MARKETPLACE, icon: ShoppingBag },
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: BarChart3 },
  { name: 'Character', href: ROUTES.CHARACTER, icon: User },
  { name: 'Codex', href: ROUTES.CODEX, icon: BookOpen },
];

const gameMenu: NavItem[] = [
  { name: 'Quests', href: '/quests', icon: Scroll, badge: 3 },
  { name: 'Combat', href: '/combat', icon: Sword },
  { name: 'Movement', href: ROUTES.MAP_MOVEMENT, icon: Map },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const NavLink: React.FC<{ item: NavItem }> = ({ item }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        to={item.href}
        className={cn(
          "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
      >
        <Icon className="w-5 h-5" />
        <span>{item.name}</span>
        {item.badge && (
          <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8">
        {/* Main Navigation */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Navigation
          </h3>
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
        </div>

        {/* Game Menu */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Game
          </h3>
          <div className="space-y-1">
            {gameMenu.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
        </div>

        {/* World Status */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">World Status</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Players Online</span>
              <span className="text-green-400 font-medium">Live Data</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Settlements</span>
              <span className="text-blue-400 font-medium">Database</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Character Classes</span>
              <span className="text-purple-400 font-medium">92 Total</span>
            </div>
            <div className="mt-3 pt-2 border-t border-border">
              <Link
                to={ROUTES.CODEX}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                View Full Statistics →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="px-4 py-4 border-t border-border">
        <div className="space-y-1">
          <Link
            to={ROUTES.PROFILE}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};