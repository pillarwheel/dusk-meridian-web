import React from 'react';
import {
  Heart,
  Zap,
  Utensils,
  Droplets,
  Moon,
  Star,
  Coins,
  MapPin,
  Clock,
  CloudRain,
  Thermometer,
  Shield,
  Activity
} from 'lucide-react';
import { cn } from '@/utils/cn';
// import { HUDStats as HUDStatsType, StatValue, WeatherCondition } from '@/api/types/hud';

interface StatValue {
  current: number;
  max: number;
}

type WeatherCondition =
  | 'clear'
  | 'cloudy'
  | 'overcast'
  | 'light_rain'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'snow'
  | 'blizzard'
  | 'fog'
  | 'sandstorm';

interface SurvivalStats {
  lastEaten: Date | null;
  lastDrank: Date | null;
  lastSlept: Date | null;
  hunger: number;
  thirst: number;
  fatigue: number;
}

interface ExperienceData {
  current: number;
  level: number;
  nextLevelXP: number;
  totalXP: number;
}

interface CurrencyData {
  gold: number;
  silver: number;
  copper: number;
  premiumCurrency?: number;
}

interface LocationInfo {
  name: string;
  coordinates: {
    x: number;
    y: number;
    z: number;
  };
  settlementName?: string;
  regionName: string;
  temperature: number;
  danger: 'safe' | 'low' | 'medium' | 'high' | 'extreme';
}

interface GameTime {
  day: number;
  hour: number;
  minute: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  year: number;
}

interface ServerTimeInfo {
  serverTime: Date;
  gameTime: GameTime;
  tickCounter: number;
  timeScale: number;
}

interface WeatherForecast {
  time: number;
  condition: WeatherCondition;
  temperature: number;
}

interface WeatherInfo {
  condition: WeatherCondition;
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  forecast: WeatherForecast[];
}

interface HUDStatsType {
  health: StatValue;
  mana: StatValue;
  survival: SurvivalStats;
  experience: ExperienceData;
  currency: CurrencyData;
  actionPoints: StatValue;
  location: LocationInfo;
  serverTime: ServerTimeInfo;
  weather: WeatherInfo;
}

interface HUDStatsProps {
  stats: HUDStatsType;
  compact?: boolean;
}

const StatBar: React.FC<{
  icon: React.ReactNode;
  current: number;
  max: number;
  color: string;
  label: string;
  compact?: boolean;
}> = ({ icon, current, max, color, label, compact = false }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div className={cn("flex items-center space-x-2", compact && "space-x-1")}>
      <div className="text-muted-foreground">{icon}</div>
      <div className={cn("flex flex-col", compact && "min-w-16")}>
        <div className={cn("flex items-center space-x-1 text-xs", compact && "text-[10px]")}>
          <span className="text-foreground font-medium">{current}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{max}</span>
        </div>
        <div className={cn("w-16 h-1.5 bg-secondary rounded-full overflow-hidden", compact && "w-12 h-1")}>
          <div
            className={cn("h-full transition-all duration-300", color)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      {!compact && (
        <span className="text-xs text-muted-foreground hidden lg:block">{label}</span>
      )}
    </div>
  );
};

const SurvivalIndicator: React.FC<{
  icon: React.ReactNode;
  value: number;
  label: string;
  lastTime?: Date | null;
  compact?: boolean;
}> = ({ icon, value, label, lastTime, compact = false }) => {
  const getColor = (val: number) => {
    if (val > 70) return 'text-green-400';
    if (val > 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatLastTime = (time: Date | null) => {
    if (!time) return 'Never';
    const now = new Date();
    const diff = now.getTime() - time.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) return `${Math.floor(hours / 24)}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="flex items-center space-x-1" title={`Last ${label}: ${formatLastTime(lastTime)}`}>
      <div className="text-muted-foreground">{icon}</div>
      <span className={cn("text-xs font-medium", getColor(value), compact && "text-[10px]")}>
        {value}%
      </span>
    </div>
  );
};

const WeatherIcon: React.FC<{ condition: WeatherCondition; className?: string }> = ({ condition, className }) => {
  const icons = {
    clear: '☀️',
    cloudy: '⛅',
    overcast: '☁️',
    light_rain: '🌦️',
    heavy_rain: '🌧️',
    thunderstorm: '⛈️',
    snow: '❄️',
    blizzard: '🌨️',
    fog: '🌫️',
    sandstorm: '🏜️'
  };

  return <span className={className}>{icons[condition]}</span>;
};

export const HUDStats: React.FC<HUDStatsProps> = ({ stats, compact = false }) => {
  const formatCurrency = (currency: typeof stats.currency) => {
    if (currency.gold >= 1000000) {
      return `${(currency.gold / 1000000).toFixed(1)}M`;
    }
    if (currency.gold >= 1000) {
      return `${(currency.gold / 1000).toFixed(1)}K`;
    }
    return currency.gold.toString();
  };

  const formatGameTime = () => {
    const { gameTime } = stats.serverTime;
    return `Day ${gameTime.day}, ${gameTime.hour.toString().padStart(2, '0')}:${gameTime.minute.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3 px-2 py-1 bg-card/50 rounded-lg backdrop-blur-sm">
        <StatBar
          icon={<Heart className="w-3 h-3" />}
          current={stats.health.current}
          max={stats.health.max}
          color="bg-red-500"
          label="Health"
          compact
        />
        <StatBar
          icon={<Zap className="w-3 h-3" />}
          current={stats.mana.current}
          max={stats.mana.max}
          color="bg-blue-500"
          label="Mana"
          compact
        />
        <div className="flex items-center space-x-1">
          <Coins className="w-3 h-3 text-yellow-400" />
          <span className="text-xs font-medium">{formatCurrency(stats.currency)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-muted-foreground">Lv</span>
          <span className="text-xs font-medium">{stats.experience.level}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-card rounded-lg border border-border">
      {/* Vital Stats */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Vitals</h3>
        <div className="space-y-2">
          <StatBar
            icon={<Heart className="w-4 h-4" />}
            current={stats.health.current}
            max={stats.health.max}
            color="bg-red-500"
            label="Health"
          />
          <StatBar
            icon={<Zap className="w-4 h-4" />}
            current={stats.mana.current}
            max={stats.mana.max}
            color="bg-blue-500"
            label="Mana"
          />
          <StatBar
            icon={<Activity className="w-4 h-4" />}
            current={stats.actionPoints.current}
            max={stats.actionPoints.max}
            color="bg-green-500"
            label="Action Points"
          />
        </div>
      </div>

      {/* Survival & Progress */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Survival & Progress</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Level {stats.experience.level}</span>
            <span className="text-xs font-medium">
              {stats.experience.current}/{stats.experience.nextLevelXP} XP
            </span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{
                width: `${(stats.experience.current / stats.experience.nextLevelXP) * 100}%`
              }}
            />
          </div>
          <div className="flex items-center space-x-3">
            <SurvivalIndicator
              icon={<Utensils className="w-3 h-3" />}
              value={stats.survival.hunger}
              label="food"
              lastTime={stats.survival.lastEaten}
            />
            <SurvivalIndicator
              icon={<Droplets className="w-3 h-3" />}
              value={stats.survival.thirst}
              label="drink"
              lastTime={stats.survival.lastDrank}
            />
            <SurvivalIndicator
              icon={<Moon className="w-3 h-3" />}
              value={100 - stats.survival.fatigue}
              label="sleep"
              lastTime={stats.survival.lastSlept}
            />
          </div>
        </div>
      </div>

      {/* Currency & Location */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Currency & Location</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">{formatCurrency(stats.currency)}</span>
            <span className="text-xs text-muted-foreground">gold</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <div className="flex flex-col">
              <span className="text-xs font-medium">{stats.location.name}</span>
              <span className="text-xs text-muted-foreground">
                {stats.location.coordinates.x}, {stats.location.coordinates.y}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className={cn(
              "w-3 h-3",
              stats.location.danger === 'safe' && "text-green-400",
              stats.location.danger === 'low' && "text-yellow-400",
              stats.location.danger === 'medium' && "text-orange-400",
              stats.location.danger === 'high' && "text-red-400",
              stats.location.danger === 'extreme' && "text-purple-400"
            )} />
            <span className="text-xs capitalize">{stats.location.danger} zone</span>
          </div>
        </div>
      </div>

      {/* Time & Weather */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Time & Weather</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs font-medium">{formatGameTime()}</span>
              <span className="text-xs text-muted-foreground">
                Tick #{stats.serverTime.tickCounter}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <WeatherIcon condition={stats.weather.condition} className="text-sm" />
            <div className="flex flex-col">
              <span className="text-xs font-medium capitalize">
                {stats.weather.condition.replace('_', ' ')}
              </span>
              <div className="flex items-center space-x-1">
                <Thermometer className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {stats.location.temperature}°C
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};