import React, { useState } from 'react';
import {
  Crown,
  Users,
  Shield,
  TrendingUp,
  Home,
  Sword,
  ShoppingBag,
  Hammer,
  Book,
  Coins,
  MapPin,
  Calendar,
  Zap,
  ChevronRight,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Eye,
  ArrowUpCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';
// Local type definitions to replace @/api/types/settlement imports
export type BuildingType =
  | 'town_hall'
  | 'barracks'
  | 'workshop'
  | 'market'
  | 'tavern'
  | 'library'
  | 'temple'
  | 'warehouse'
  | 'farm'
  | 'mine'
  | 'lumber_mill'
  | 'quarry'
  | 'blacksmith'
  | 'alchemist'
  | 'mage_tower'
  | 'walls'
  | 'gate'
  | 'tower'
  | 'house'
  | 'inn'
  | 'stable';

export type BuildingStatus = 'active' | 'inactive' | 'under_construction' | 'upgrading' | 'damaged' | 'destroyed' | 'abandoned';

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QueueItem {
  id: string;
  action: string;
  target: string;
  progress: number;
  timeRemaining: number;
  cost: Record<string, number>;
  priority: number;
}

export interface Workers {
  current: number;
  max: number;
  efficiency: number;
  wages: number;
}

export interface Building {
  id: string;
  type: BuildingType;
  name: string;
  level: number;
  maxLevel: number;
  health: number;
  maxHealth: number;
  position: Position;
  status: BuildingStatus;
  queue: QueueItem[];
  resources: {
    input: Record<string, any>;
    output: Record<string, any>;
    storage: Record<string, any>;
  };
  workers?: Workers;
  upgradeCost?: {
    gold: number;
    wood: number;
    stone: number;
    iron: number;
    time: number;
    requirements: string[];
  };
  description: string;
  abilities: string[];
  lastMaintenance: Date;
}

export interface Settlement {
  id: string;
  name: string;
  faction: string;
  population: {
    current: number;
    max: number;
    growth: number;
    happiness: number;
    loyalty: number;
  };
  defense: {
    rating: number;
    walls: {
      level: number;
      health: number;
      maxHealth: number;
      material: string;
    };
    towers: number;
    gates: Array<{
      id: string;
      name: string;
      direction: string;
      health: number;
      maxHealth: number;
      isOpen: boolean;
      guardStrength: number;
    }>;
    traps: any[];
  };
  resources: {
    storage: Record<string, {
      current: number;
      max: number;
      reserved: number;
    }>;
    production: Record<string, {
      rate: number;
      efficiency: number;
      workers: number;
      maxWorkers: number;
    }>;
    consumption: Record<string, number>;
  };
  buildings: Building[];
  garrison: {
    commander: string;
    units: Array<{
      id: string;
      type: string;
      count: number;
      level: number;
      health: number;
      experience: number;
      equipment: string[];
    }>;
    capacity: number;
    morale: number;
    training: any[];
    patrol: any[];
  };
  location: {
    x: number;
    y: number;
    z: number;
    regionName: string;
  };
  status: 'peaceful' | 'alert' | 'under_siege' | 'expanding' | 'abandoned';
  owner: string;
  founded: Date;
  lastUpdated: Date;
}

interface SettlementViewProps {
  settlement: Settlement;
  onEnterBuilding?: (building: Building) => void;
  onManageGarrison?: () => void;
  onTrade?: () => void;
  onRecruitUnits?: () => void;
  onViewMap?: () => void;
}

const BuildingIcon: React.FC<{ type: BuildingType; className?: string }> = ({ type, className }) => {
  const icons = {
    town_hall: Crown,
    barracks: Sword,
    workshop: Hammer,
    market: ShoppingBag,
    tavern: Users,
    library: Book,
    temple: Zap,
    warehouse: Home,
    farm: Home,
    mine: Home,
    lumber_mill: Home,
    quarry: Home,
    blacksmith: Hammer,
    alchemist: Zap,
    mage_tower: Zap,
    walls: Shield,
    gate: Shield,
    tower: Shield,
    house: Home,
    inn: Users,
    stable: Users
  };

  const Icon = icons[type] || Home;
  return <Icon className={className} />;
};

const ResourceBar: React.FC<{
  label: string;
  current: number;
  max: number;
  unit: string;
  color: string;
}> = ({ label, current, max, unit, color }) => {
  const percentage = Math.min(100, (current / max) * 100);
  const isLow = percentage < 25;
  const isFull = percentage >= 95;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn(
          "font-medium",
          isLow && "text-red-400",
          isFull && "text-green-400"
        )}>
          {current.toLocaleString()} / {max.toLocaleString()} {unit}
        </span>
      </div>
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const SettlementView: React.FC<SettlementViewProps> = ({
  settlement,
  onEnterBuilding,
  onManageGarrison,
  onTrade,
  onRecruitUnits,
  onViewMap
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'buildings' | 'production'>('overview');
  const [buildingFilter, setBuildingFilter] = useState<'all' | BuildingType>('all');

  const filteredBuildings = buildingFilter === 'all'
    ? settlement.buildings
    : settlement.buildings.filter(b => b.type === buildingFilter);

  const buildingTypes = Array.from(new Set(settlement.buildings.map(b => b.type)));

  const getStatusColor = (status: typeof settlement.status) => {
    switch (status) {
      case 'peaceful': return 'text-green-400';
      case 'alert': return 'text-yellow-400';
      case 'under_siege': return 'text-red-400';
      case 'expanding': return 'text-blue-400';
      case 'abandoned': return 'text-gray-400';
      default: return 'text-muted-foreground';
    }
  };

  const getBuildingStatusColor = (status: Building['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'under_construction': return 'bg-blue-500';
      case 'upgrading': return 'bg-purple-500';
      case 'damaged': return 'bg-orange-500';
      case 'destroyed': return 'bg-red-500';
      case 'abandoned': return 'bg-gray-400';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Settlement Header */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold">{settlement.name}</h1>
              <span className={cn("text-sm font-medium capitalize", getStatusColor(settlement.status))}>
                {settlement.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{settlement.location.regionName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Founded {settlement.founded.toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onManageGarrison}
              className="px-3 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
            >
              <Sword className="w-4 h-4 mr-2 inline" />
              Manage Garrison
            </button>
            <button
              onClick={onTrade}
              className="px-3 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 transition-colors text-sm"
            >
              <ShoppingBag className="w-4 h-4 mr-2 inline" />
              Trade
            </button>
            <button
              onClick={onRecruitUnits}
              className="px-3 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
            >
              <Users className="w-4 h-4 mr-2 inline" />
              Recruit Units
            </button>
            <button
              onClick={onViewMap}
              className="px-3 py-2 bg-purple-600/20 text-purple-400 border border-purple-600/30 rounded-lg hover:bg-purple-600/30 transition-colors text-sm"
            >
              <MapPin className="w-4 h-4 mr-2 inline" />
              View Map
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-sm text-muted-foreground">Population</p>
              <p className="text-xl font-bold">{settlement.population.current.toLocaleString()}</p>
              <p className="text-xs text-green-400">+{settlement.population.growth}/day</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-sm text-muted-foreground">Defense Rating</p>
              <p className="text-xl font-bold">{settlement.defense.rating}</p>
              <p className="text-xs text-muted-foreground">
                {settlement.defense.walls.level} {settlement.defense.walls.material} walls
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-sm text-muted-foreground">Happiness</p>
              <p className="text-xl font-bold">{settlement.population.happiness}%</p>
              <p className="text-xs text-muted-foreground">
                Loyalty: {settlement.population.loyalty}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center space-x-3">
            <Home className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-sm text-muted-foreground">Buildings</p>
              <p className="text-xl font-bold">{settlement.buildings.length}</p>
              <p className="text-xs text-muted-foreground">
                {settlement.buildings.filter(b => b.status === 'active').length} active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {['overview', 'buildings', 'production'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resource Storage */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Resource Storage</h3>
            <div className="space-y-4">
              <ResourceBar
                label="Food"
                current={settlement.resources.storage.food.current}
                max={settlement.resources.storage.food.max}
                unit="units"
                color="bg-green-500"
              />
              <ResourceBar
                label="Wood"
                current={settlement.resources.storage.wood.current}
                max={settlement.resources.storage.wood.max}
                unit="units"
                color="bg-amber-600"
              />
              <ResourceBar
                label="Stone"
                current={settlement.resources.storage.stone.current}
                max={settlement.resources.storage.stone.max}
                unit="units"
                color="bg-gray-500"
              />
              <ResourceBar
                label="Iron"
                current={settlement.resources.storage.iron.current}
                max={settlement.resources.storage.iron.max}
                unit="units"
                color="bg-slate-400"
              />
              <ResourceBar
                label="Gold"
                current={settlement.resources.storage.gold.current}
                max={settlement.resources.storage.gold.max}
                unit="coins"
                color="bg-yellow-500"
              />
            </div>
          </div>

          {/* Production Rates */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Production Rates</h3>
            <div className="space-y-3">
              {Object.entries(settlement.resources.production).map(([resource, data]) => (
                <div key={resource} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">{resource}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {data.rate}/hour
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({data.efficiency}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'buildings' && (
        <div className="space-y-4">
          {/* Building Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Filter:</span>
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value as any)}
              className="px-3 py-1 bg-background border border-border rounded-lg text-sm"
            >
              <option value="all">All Buildings</option>
              {buildingTypes.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Buildings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuildings.map((building) => (
              <div
                key={building.id}
                className="bg-card rounded-lg border border-border p-4 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => onEnterBuilding?.(building)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <BuildingIcon type={building.type} className="w-8 h-8 text-primary" />
                      <div className={cn(
                        "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card",
                        getBuildingStatusColor(building.status)
                      )} />
                    </div>
                    <div>
                      <h4 className="font-medium">{building.name}</h4>
                      <p className="text-xs text-muted-foreground">Level {building.level}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Health</span>
                    <span>{building.health}/{building.maxHealth}</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${(building.health / building.maxHealth) * 100}%` }}
                    />
                  </div>
                  {building.workers && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Workers</span>
                      <span>{building.workers.current}/{building.workers.max}</span>
                    </div>
                  )}
                  {building.queue.length > 0 && (
                    <div className="text-xs text-blue-400">
                      {building.queue.length} item(s) in queue
                    </div>
                  )}
                  {building.upgradeCost && building.level < building.maxLevel && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle upgrade
                      }}
                      className="w-full mt-2 px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded text-xs hover:bg-primary/30 transition-colors"
                    >
                      <ArrowUpCircle className="w-3 h-3 mr-1 inline" />
                      Upgrade (Lv {building.level + 1})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'production' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Production */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Active Production</h3>
            <div className="space-y-4">
              {settlement.buildings
                .filter(b => b.queue.length > 0)
                .map(building => (
                  <div key={building.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{building.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {building.queue.length} in queue
                      </span>
                    </div>
                    {building.queue.slice(0, 2).map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground capitalize">
                          {item.action} {item.target}
                        </span>
                        <span className="text-foreground">
                          {Math.floor(item.timeRemaining / 60)}h {item.timeRemaining % 60}m
                        </span>
                      </div>
                    ))}
                    {building.queue.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{building.queue.length - 2} more...
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Resource Efficiency */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Resource Efficiency</h3>
            <div className="space-y-4">
              {Object.entries(settlement.resources.production).map(([resource, data]) => (
                <div key={resource} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{resource}</span>
                    <span className="text-sm text-muted-foreground">
                      {data.workers}/{data.maxWorkers} workers
                    </span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${data.efficiency}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{data.efficiency}% efficiency</span>
                    <span>{data.rate}/hour</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};