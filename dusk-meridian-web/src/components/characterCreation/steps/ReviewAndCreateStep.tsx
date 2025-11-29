import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Sword,
  MapPin,
  TrendingUp,
  Crown,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Edit,
  Eye,
  Zap
} from 'lucide-react';
import { cn } from '@/utils/cn';
import * as CharacterCreationTypes from '@/api/types/characterCreation';
import { NFTBadge } from '../utility/NFTBadge';
import { LoadingSpinner } from '../utility/LoadingSpinner';
import { characterCreationApi } from '@/api/endpoints/characterCreation';

interface ReviewAndCreateStepProps {
  characterData: CharacterCreationTypes.CharacterCreationData;
  nftValidation?: CharacterCreationTypes.NFTValidationResponse;
  nftBonuses?: CharacterCreationTypes.NFTBonuses;
  onEdit: (step: string) => void;
  onCharacterCreated: (character: any) => void;
  onError: (error: string) => void;
}

export const ReviewAndCreateStep: React.FC<ReviewAndCreateStepProps> = ({
  characterData,
  nftValidation,
  nftBonuses,
  onEdit,
  onCharacterCreated,
  onError
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState<string>('');

  const handleCreateCharacter = async () => {
    try {
      setIsCreating(true);
      setCreationStep('Validating character data...');

      // Final validation
      await new Promise(resolve => setTimeout(resolve, 500));
      setCreationStep('Applying NFT bonuses...');

      await new Promise(resolve => setTimeout(resolve, 500));
      setCreationStep('Creating character...');

      // Create the character using smart endpoint selection (dev/prod based on env)
      console.log('🎮 [ReviewAndCreateStep] Creating character with data:', JSON.stringify(characterData, null, 2));
      const newCharacter = await characterCreationApi.createCharacterSmart(characterData);

      console.log('Character creation response:', newCharacter);
      setCreationStep('Character created successfully!');
      await new Promise(resolve => setTimeout(resolve, 1000));

      onCharacterCreated(newCharacter);
    } catch (error) {
      console.error('Character creation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create character';
      onError(errorMessage);
    } finally {
      setIsCreating(false);
      setCreationStep('');
    }
  };

  const getSkillCount = () => {
    if (characterData.skillConfiguration.useTemplate) {
      return characterData.skillConfiguration.templateId
        ? characterData.skillConfiguration.selectedSkills.length
        : 0;
    }
    return characterData.skillConfiguration.selectedSkills.length;
  };

  const getTotalAttributePoints = () => {
    return Object.values(characterData.attributes).reduce((total, value) => total + value, 0);
  };

  const getHighestAttribute = () => {
    const entries = Object.entries(characterData.attributes);
    const highest = entries.reduce((max, [attr, value]) => value > max.value ? { attr, value } : max, { attr: '', value: 0 });
    return highest;
  };

  const getCharacterArchetype = () => {
    const { strength, dexterity, constitution, intelligence, wisdom, charisma } = characterData.attributes;

    if (strength >= Math.max(dexterity, intelligence, wisdom, charisma)) {
      return { type: 'Warrior', description: 'A physical powerhouse focused on combat prowess' };
    }
    if (dexterity >= Math.max(strength, intelligence, wisdom, charisma)) {
      return { type: 'Scout', description: 'Agile and quick, excelling in mobility and precision' };
    }
    if (intelligence >= Math.max(strength, dexterity, wisdom, charisma)) {
      return { type: 'Mage', description: 'A master of magical arts and arcane knowledge' };
    }
    if (wisdom >= Math.max(strength, dexterity, intelligence, charisma)) {
      return { type: 'Cleric', description: 'Wise and perceptive, balancing magic and intuition' };
    }
    if (charisma >= Math.max(strength, dexterity, intelligence, wisdom)) {
      return { type: 'Leader', description: 'Charismatic and influential, inspiring others' };
    }

    return { type: 'Balanced', description: 'A versatile character with well-rounded abilities' };
  };

  const archetype = getCharacterArchetype();

  if (isCreating) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <LoadingSpinner
            size="lg"
            message="Creating Your Character"
            submessage={creationStep}
          />
          <div className="mt-8 bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Creating {characterData.basicInfo.name}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✓ Validating character data</p>
              <p className={cn(creationStep.includes('NFT') && 'text-primary')}>
                {creationStep.includes('NFT') ? '⏳' : '✓'} Applying NFT bonuses
              </p>
              <p className={cn(creationStep.includes('Creating') && 'text-primary')}>
                {creationStep.includes('Creating') ? '⏳' : creationStep.includes('successfully') ? '✓' : '○'} Creating character
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Review & Create Character</h2>
        <p className="text-muted-foreground">
          Review your character details and create your new character
        </p>
      </div>

      {/* Character Summary Card */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{characterData.basicInfo.name}</h3>
              <p className="text-muted-foreground">
                {characterData.basicInfo.race?.name} {characterData.basicInfo.characterClass?.name}
              </p>
              <p className="text-sm text-primary font-medium">{archetype.type} Archetype</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-muted-foreground">
                Tier {nftValidation?.ownedNFTs?.reduce((max, nft) => Math.max(max, nft.tier), 1) || 1} NFT
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{archetype.description}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{getTotalAttributePoints()}</p>
            <p className="text-xs text-muted-foreground">Total Attributes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{getSkillCount()}</p>
            <p className="text-xs text-muted-foreground">Skills Selected</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">{getHighestAttribute().value}</p>
            <p className="text-xs text-muted-foreground">Highest ({getHighestAttribute().attr})</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {nftBonuses ? Object.values(nftBonuses).filter(v => typeof v === 'number' && v > 0).length : 0}
            </p>
            <p className="text-xs text-muted-foreground">NFT Bonuses</p>
          </div>
        </div>
      </div>

      {/* Detailed Review Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>
            <button
              onClick={() => onEdit('basic-info')}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{characterData.basicInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Race:</span>
              <span className="font-medium">{characterData.basicInfo.race?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Class:</span>
              <span className="font-medium">{characterData.basicInfo.characterClass?.name}</span>
            </div>
          </div>

          {characterData.basicInfo.race?.racialTraits && (
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Racial Traits</h4>
              <div className="space-y-1">
                {characterData.basicInfo.race.racialTraits.slice(0, 3).map((trait, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-xs">{trait}</span>
                  </div>
                ))}
                {characterData.basicInfo.race.racialTraits.length > 3 && (
                  <p className="text-xs text-muted-foreground pl-4">
                    +{characterData.basicInfo.race.racialTraits.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Geographical Trait */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold">Geographical Origin</h3>
            </div>
            <button
              onClick={() => onEdit('geographical-trait')}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          {characterData.geographicalTrait ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Region:</span>
                <span className="font-medium">{characterData.geographicalTrait.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trait:</span>
                <span className="font-medium">{characterData.geographicalTrait.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">{characterData.geographicalTrait.description}</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No regional trait selected</p>
            </div>
          )}
        </div>

        {/* Skills Configuration */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold">Skills</h3>
            </div>
            <button
              onClick={() => onEdit('skill-configuration')}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Method:</span>
              <span className="font-medium">
                {characterData.skillConfiguration.useTemplate ? 'Template-based' : 'Custom Selection'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Skills Selected:</span>
              <span className="font-medium">{getSkillCount()}</span>
            </div>

            {characterData.skillConfiguration.useTemplate && characterData.skillConfiguration.template && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Template</h4>
                <p className="text-sm font-medium">{characterData.skillConfiguration.template.name}</p>
                <p className="text-xs text-muted-foreground">{characterData.skillConfiguration.template.description}</p>
              </div>
            )}

            {characterData.skillConfiguration.selectedSkills.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Selected Skills</h4>
                <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto">
                  {characterData.skillConfiguration.selectedSkills.slice(0, 5).map((skill, index) => (
                    <div key={index} className="text-xs bg-secondary/50 rounded px-2 py-1">
                      {skill.name}
                    </div>
                  ))}
                  {characterData.skillConfiguration.selectedSkills.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      +{characterData.skillConfiguration.selectedSkills.length - 5} more skills
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Attributes */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold">Attributes</h3>
            </div>
            <button
              onClick={() => onEdit('attribute-distribution')}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(characterData.attributes).map(([attr, value]) => (
              <div key={attr} className="flex justify-between items-center py-2 px-3 bg-secondary/30 rounded-lg">
                <span className="capitalize text-sm">{attr}</span>
                <span className="font-bold">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Total Points: <span className="font-medium">{getTotalAttributePoints()}</span>
            </p>
          </div>
        </div>
      </div>

      {/* NFT Bonuses */}
      {nftBonuses && (Object.values(nftBonuses).some(v => typeof v === 'number' && v > 0) || nftBonuses.premiumTemplatesUnlocked) && (
        <div className="bg-gradient-to-r from-purple-600/10 to-yellow-600/10 border border-purple-600/30 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Crown className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold">NFT Bonuses Applied</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {nftBonuses.skillPointBonus > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">+{nftBonuses.skillPointBonus}</p>
                <p className="text-xs text-muted-foreground">Extra Skill Points</p>
              </div>
            )}
            {nftBonuses.attributePointBonus > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">+{nftBonuses.attributePointBonus}</p>
                <p className="text-xs text-muted-foreground">Extra Attribute Points</p>
              </div>
            )}
            {nftBonuses.premiumTemplatesUnlocked && (
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">✓</p>
                <p className="text-xs text-muted-foreground">Premium Templates</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Creation Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Ready to Create</h3>
            <p className="text-sm text-muted-foreground">
              Your character configuration is complete and ready for creation
            </p>
          </div>
          <button
            onClick={handleCreateCharacter}
            disabled={isCreating}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Create Character</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
        <h4 className="font-medium text-blue-400 mb-2">Final Review</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Double-check all your selections before creating your character</p>
          <p>• You can edit any section by clicking the edit button next to it</p>
          <p>• Character creation is permanent - you cannot modify these core attributes later</p>
          <p>• NFT bonuses are automatically applied and cannot be changed</p>
        </div>
      </div>
    </div>
  );
};