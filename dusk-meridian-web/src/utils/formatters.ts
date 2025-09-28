import { formatDistanceToNow, format } from 'date-fns';

export const formatNumber = (value: number, decimals: number = 0): string => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
};

export const formatCurrency = (value: string | number, currency: string = 'ETH'): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return `0 ${currency}`;

  if (currency === 'ETH' && numValue < 0.001) {
    return `${(numValue * 1000000).toFixed(0)} μETH`;
  }

  return `${formatNumber(numValue, 3)} ${currency}`;
};

export const formatWei = (weiValue: string, decimals: number = 18): string => {
  const value = BigInt(weiValue);
  const divisor = BigInt(10 ** decimals);
  const quotient = value / divisor;
  const remainder = value % divisor;

  if (remainder === 0n) {
    return quotient.toString();
  }

  const remainderStr = remainder.toString().padStart(decimals, '0');
  const trimmedRemainder = remainderStr.replace(/0+$/, '');

  return `${quotient}.${trimmedRemainder}`;
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatTimeAgo = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDate = (date: string | Date, pattern: string = 'MMM dd, yyyy'): string => {
  return format(new Date(date), pattern);
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

export const formatExperience = (current: number, max: number): string => {
  return `${formatNumber(current)} / ${formatNumber(max)} XP`;
};

export const formatLevel = (level: number): string => {
  return `Lv. ${level}`;
};

export const formatHealth = (current: number, max: number): string => {
  const percentage = (current / max) * 100;
  return `${current}/${max} (${percentage.toFixed(0)}%)`;
};

export const formatPosition = (x: number, y: number, z?: number): string => {
  if (z !== undefined) {
    return `(${x}, ${y}, ${z})`;
  }
  return `(${x}, ${y})`;
};

export const formatRarity = (rarity: string): string => {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
};

export const formatPopulation = (population: number): string => {
  return formatNumber(population);
};

export const formatDistance = (distance: number, unit: string = 'km'): string => {
  if (distance < 1000 && unit === 'km') {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} ${unit}`;
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
};

export const formatWalletAddress = (address: string, start: number = 6, end: number = 4): string => {
  if (!address) return '';
  if (address.length <= start + end) return address;

  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

export const formatTransactionHash = (hash: string): string => {
  return formatWalletAddress(hash, 8, 8);
};

export const formatItemQuantity = (quantity: number, name: string): string => {
  if (quantity === 1) {
    return name;
  }
  return `${formatNumber(quantity)} ${name}`;
};

export const formatBuildingStatus = (status: string): string => {
  return status.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export const formatQuestObjective = (current: number, required: number, description: string): string => {
  return `${description} (${current}/${required})`;
};