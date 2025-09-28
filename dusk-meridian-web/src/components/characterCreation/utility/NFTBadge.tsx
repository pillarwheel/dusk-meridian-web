import React from 'react';
import { Crown, Star, Gem, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';
import { characterCreationUtils } from '@/api/endpoints/characterCreation';

interface NFTBadgeProps {
  tier: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export const NFTBadge: React.FC<NFTBadgeProps> = ({
  tier,
  count = 1,
  size = 'md',
  showCount = false,
  className
}) => {
  const tierInfo = characterCreationUtils.getNFTTierInfo(tier);

  const getIcon = () => {
    switch (tier) {
      case 1: return Star;
      case 2: return Gem;
      case 3: return Crown;
      case 4: return Zap;
      default: return Star;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-6 h-6 text-xs';
      case 'md': return 'w-8 h-8 text-sm';
      case 'lg': return 'w-12 h-12 text-base';
      default: return 'w-8 h-8 text-sm';
    }
  };

  const getGlowColor = () => {
    switch (tier) {
      case 1: return 'shadow-gray-400/50';
      case 2: return 'shadow-blue-400/50';
      case 3: return 'shadow-purple-400/50';
      case 4: return 'shadow-yellow-400/50';
      default: return 'shadow-gray-400/50';
    }
  };

  const Icon = getIcon();

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full border-2 shadow-lg transition-all',
          tierInfo.color.replace('text-', 'border-'),
          tierInfo.color.replace('text-', 'bg-').replace('400', '400/20'),
          getGlowColor(),
          getSizeClasses()
        )}
      >
        <Icon className={cn('w-1/2 h-1/2', tierInfo.color)} />

        {showCount && count > 1 && (
          <div className={cn(
            'absolute -top-1 -right-1 flex items-center justify-center rounded-full border',
            'bg-background text-xs font-bold min-w-4 h-4 px-1',
            tierInfo.color.replace('text-', 'border-'),
            tierInfo.color
          )}>
            {count}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <span className={cn('font-medium', tierInfo.color)}>
          Tier {tier} - {tierInfo.name}
        </span>
        {showCount && (
          <span className="text-xs text-muted-foreground">
            {count} owned
          </span>
        )}
      </div>
    </div>
  );
};