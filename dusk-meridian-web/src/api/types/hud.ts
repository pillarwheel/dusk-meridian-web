export interface HUDStats {
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

export interface StatValue {
  current: number;
  max: number;
}

export interface SurvivalStats {
  lastEaten: Date | null;
  lastDrank: Date | null;
  lastSlept: Date | null;
  hunger: number; // 0-100
  thirst: number; // 0-100
  fatigue: number; // 0-100
}

export interface ExperienceData {
  current: number;
  level: number;
  nextLevelXP: number;
  totalXP: number;
}

export interface CurrencyData {
  gold: number;
  silver: number;
  copper: number;
  premiumCurrency?: number;
}

export interface LocationInfo {
  name: string;
  coordinates: {
    x: number;
    y: number;
    z: number;
  };
  settlementName?: string;
  regionName: string;
  temperature: number; // Celsius
  danger: 'safe' | 'low' | 'medium' | 'high' | 'extreme';
}

export interface ServerTimeInfo {
  serverTime: Date;
  gameTime: GameTime;
  tickCounter: number;
  timeScale: number; // How fast game time passes relative to real time
}

export interface GameTime {
  day: number;
  hour: number;
  minute: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  year: number;
}

export interface WeatherInfo {
  condition: WeatherCondition;
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number; // 0-100%
  forecast: WeatherForecast[];
}

export type WeatherCondition =
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

export interface WeatherForecast {
  time: number; // Hours ahead
  condition: WeatherCondition;
  temperature: number;
}