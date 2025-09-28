import React from 'react';
import { CheckCircle2, Lock, Star, Users, Zap, Sword, Shield, Target } from 'lucide-react';
import { cn } from '@/utils/cn';
import * as CharacterCreationTypes from '@/api/types/characterCreation';
import { NFTBadge } from './NFTBadge';

interface SkillTemplateCardProps {
  template: CharacterCreationTypes.SkillTemplate;
  isSelected?: boolean;
  isLocked?: boolean;
  onSelect?: (template: CharacterCreationTypes.SkillTemplate) => void;
  allSkills?: CharacterCreationTypes.Skill[];
  className?: string;
}

export const SkillTemplateCard: React.FC<SkillTemplateCardProps> = ({
  template,
  isSelected = false,
  isLocked = false,
  onSelect,
  allSkills = [],
  className
}) => {
  const getCategoryIcon = () => {
    switch (template.category.toLowerCase()) {
      case 'popular': return Star;
      case 'combat': return Sword;
      case 'defense': return Shield;
      case 'magic': return Zap;
      case 'specialized': return Target;
      default: return Users;
    }
  };

  const getCategoryColor = () => {
    switch (template.category.toLowerCase()) {
      case 'popular': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'combat': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'defense': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'magic': return 'text-purple-400 bg-purple-400/20 border-purple-400/30';
      case 'specialized': return 'text-green-400 bg-green-400/20 border-green-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getSelectedSkills = () => {
    return allSkills.filter(skill => template.preselectedSkillIds.includes(skill.id));
  };

  const CategoryIcon = getCategoryIcon();

  return (
    <div
      className={cn(
        'relative bg-card border rounded-lg p-4 transition-all cursor-pointer hover:border-primary/50',
        isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border',
        isLocked && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={() => !isLocked && onSelect?.(template)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={cn('p-2 rounded-lg border', getCategoryColor())}>
            <CategoryIcon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{template.name}</h3>
            <div className="flex items-center space-x-2">
              <span className={cn('text-xs px-2 py-1 rounded-full border', getCategoryColor())}>
                {template.category}
              </span>
              {template.requiredNFTTier && (
                <NFTBadge tier={template.requiredNFTTier} size="sm" />
              )}
            </div>
          </div>
        </div>

        {/* Selection Indicator */}
        <div className="flex items-center space-x-2">
          {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
          {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {template.description}
      </p>

      {/* Stat Modifiers */}
      {Object.keys(template.statModifiers).length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Stat Modifiers</h4>
          <div className="flex flex-wrap gap-1">
            {Object.entries(template.statModifiers).map(([stat, modifier]) => (
              <span
                key={stat}
                className={cn(
                  'text-xs px-2 py-1 rounded-full border',
                  modifier > 0
                    ? 'text-green-400 bg-green-400/20 border-green-400/30'
                    : 'text-red-400 bg-red-400/20 border-red-400/30'
                )}
              >
                {stat.charAt(0).toUpperCase() + stat.slice(1)}: {modifier > 0 ? '+' : ''}{modifier}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills Preview */}
      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-muted-foreground">Included Skills</h4>
          <span className="text-xs text-muted-foreground">
            {template.preselectedSkillIds.length} skills
          </span>
        </div>

        <div className="space-y-1 max-h-20 overflow-y-auto">
          {getSelectedSkills().slice(0, 3).map((skill) => (
            <div key={skill.id} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="text-xs text-foreground">{skill.name}</span>
            </div>
          ))}

          {template.preselectedSkillIds.length > 3 && (
            <div className="text-xs text-muted-foreground pl-4">
              +{template.preselectedSkillIds.length - 3} more skills
            </div>
          )}
        </div>
      </div>

      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              Requires Tier {template.requiredNFTTier} NFT
            </p>
          </div>
        </div>
      )}
    </div>
  );
};