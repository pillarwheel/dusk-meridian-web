import React, { useState, useEffect } from 'react';
import { RotateCcw, TrendingUp, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import * as CharacterCreationTypes from '@/api/types/characterCreation';
import { AttributeSlider } from '../utility/AttributeSlider';
import { characterCreationUtils } from '@/api/endpoints/characterCreation';

interface AttributeDistributionStepProps {
  attributes: CharacterCreationTypes.AttributeDistribution;
  onAttributesChange: (attributes: CharacterCreationTypes.AttributeDistribution) => void;
  onValidationChange: (isValid: boolean, errors: string[]) => void;
  availablePoints?: number;
  nftBonuses?: CharacterCreationTypes.NFTBonuses;
}

export const AttributeDistributionStep: React.FC<AttributeDistributionStepProps> = ({
  attributes,
  onAttributesChange,
  onValidationChange,
  availablePoints = CharacterCreationTypes.BASE_ATTRIBUTE_POINTS,
  nftBonuses
}) => {
  const [baseAttributes] = useState<CharacterCreationTypes.AttributeDistribution>({
    strength: CharacterCreationTypes.MIN_ATTRIBUTE_VALUE,
    dexterity: CharacterCreationTypes.MIN_ATTRIBUTE_VALUE,
    constitution: CharacterCreationTypes.MIN_ATTRIBUTE_VALUE,
    intelligence: CharacterCreationTypes.MIN_ATTRIBUTE_VALUE,
    wisdom: CharacterCreationTypes.MIN_ATTRIBUTE_VALUE,
    charisma: CharacterCreationTypes.MIN_ATTRIBUTE_VALUE
  });

  useEffect(() => {
    validateStep();
  }, [attributes, availablePoints, nftBonuses]);

  const getTotalAvailablePoints = () => {
    const nftBonus = nftBonuses?.attributePointBonus || 0;
    return availablePoints + nftBonus;
  };

  const getUsedPoints = () => {
    return Object.values(attributes).reduce((total, value) => {
      return total + (value - CharacterCreationTypes.MIN_ATTRIBUTE_VALUE);
    }, 0);
  };

  const getRemainingPoints = () => {
    return getTotalAvailablePoints() - getUsedPoints();
  };

  const validateStep = () => {
    const errors: string[] = [];
    const remainingPoints = getRemainingPoints();

    // Check if all points are spent
    if (remainingPoints > 0) {
      errors.push(`You have ${remainingPoints} unspent attribute points`);
    }

    // Check if over-allocated
    if (remainingPoints < 0) {
      errors.push(`You have allocated ${Math.abs(remainingPoints)} points over the limit`);
    }

    // Validate attribute ranges
    Object.entries(attributes).forEach(([attr, value]) => {
      if (value < CharacterCreationTypes.MIN_ATTRIBUTE_VALUE) {
        errors.push(`${attr} is below minimum value (${CharacterCreationTypes.MIN_ATTRIBUTE_VALUE})`);
      }
      if (value > CharacterCreationTypes.MAX_ATTRIBUTE_VALUE) {
        errors.push(`${attr} is above maximum value (${CharacterCreationTypes.MAX_ATTRIBUTE_VALUE})`);
      }
    });

    const isValid = errors.length === 0 && remainingPoints === 0;
    onValidationChange(isValid, errors);
  };

  const handleAttributeChange = (attribute: keyof CharacterCreationTypes.AttributeDistribution, value: number) => {
    const newAttributes = { ...attributes, [attribute]: value };
    onAttributesChange(newAttributes);
  };

  const handleReset = () => {
    onAttributesChange({ ...baseAttributes });
  };

  const handleDistributeEvenly = () => {
    const totalPoints = getTotalAvailablePoints();
    const pointsPerAttribute = Math.floor(totalPoints / 6);
    const remainder = totalPoints % 6;

    const evenDistribution = Object.keys(baseAttributes).reduce((acc, attr, index) => {
      const extraPoint = index < remainder ? 1 : 0;
      acc[attr as keyof CharacterCreationTypes.AttributeDistribution] =
        CharacterCreationTypes.MIN_ATTRIBUTE_VALUE + pointsPerAttribute + extraPoint;
      return acc;
    }, {} as CharacterCreationTypes.AttributeDistribution);

    onAttributesChange(evenDistribution);
  };

  const getAttributeList = (): (keyof CharacterCreationTypes.AttributeDistribution)[] => {
    return ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  };

  const getAttributeSummary = () => {
    const total = Object.values(attributes).reduce((sum, value) => sum + value, 0);
    const average = Math.round((total / 6) * 10) / 10;

    const highest = Math.max(...Object.values(attributes));
    const lowest = Math.min(...Object.values(attributes));

    return { total, average, highest, lowest };
  };

  const remainingPoints = getRemainingPoints();
  const usedPoints = getUsedPoints();
  const totalPoints = getTotalAvailablePoints();
  const summary = getAttributeSummary();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Attribute Distribution</h2>
        <p className="text-muted-foreground">
          Allocate your attribute points to customize your character's strengths
        </p>
      </div>

      {/* Point Budget */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold">Point Budget</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleDistributeEvenly}
              className="px-3 py-2 text-sm bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Distribute Evenly
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition-colors flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{totalPoints}</p>
            <p className="text-xs text-muted-foreground">Total Available</p>
            {nftBonuses?.attributePointBonus && (
              <p className="text-xs text-purple-400">+{nftBonuses.attributePointBonus} NFT bonus</p>
            )}
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{usedPoints}</p>
            <p className="text-xs text-muted-foreground">Points Used</p>
          </div>
          <div className="text-center">
            <p className={cn(
              'text-2xl font-bold',
              remainingPoints < 0 ? 'text-red-400' : remainingPoints > 0 ? 'text-yellow-400' : 'text-green-400'
            )}>
              {remainingPoints}
            </p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">{summary.average}</p>
            <p className="text-xs text-muted-foreground">Average</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Point Allocation</span>
            <span>{usedPoints}/{totalPoints}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                remainingPoints < 0 ? 'bg-red-400' : 'bg-primary'
              )}
              style={{ width: `${Math.min((usedPoints / totalPoints) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Attribute Sliders */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Attributes</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getAttributeList().map((attribute) => (
            <AttributeSlider
              key={attribute}
              attribute={attribute}
              value={attributes[attribute]}
              onChange={(value) => handleAttributeChange(attribute, value)}
              disabled={remainingPoints <= 0 && value < attributes[attribute]}
              className="bg-secondary/30 rounded-lg p-4"
            />
          ))}
        </div>
      </div>

      {/* Validation Status */}
      {remainingPoints !== 0 && (
        <div className={cn(
          'border rounded-lg p-4',
          remainingPoints < 0
            ? 'bg-red-600/10 border-red-600/30 text-red-400'
            : 'bg-yellow-600/10 border-yellow-600/30 text-yellow-400'
        )}>
          <div className="flex items-center space-x-3">
            {remainingPoints < 0 ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
            <div>
              <p className="font-medium">
                {remainingPoints < 0
                  ? 'Over Allocation'
                  : 'Incomplete Allocation'
                }
              </p>
              <p className="text-sm opacity-90">
                {remainingPoints < 0
                  ? `You have allocated ${Math.abs(remainingPoints)} points over your limit. Please reduce some attributes.`
                  : `You have ${remainingPoints} unspent points. Allocate all points to continue.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Character Summary */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Character Summary</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Score</p>
            <p className="text-xl font-bold">{summary.total}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Average</p>
            <p className="text-xl font-bold">{summary.average}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Highest</p>
            <p className="text-xl font-bold text-green-400">{summary.highest}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Lowest</p>
            <p className="text-xl font-bold text-red-400">{summary.lowest}</p>
          </div>
        </div>

        {/* Attribute Breakdown */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Final Attributes</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {getAttributeList().map((attribute) => (
              <div key={attribute} className="flex justify-between items-center py-2 px-3 bg-background rounded-lg">
                <span className="capitalize font-medium">{attribute}</span>
                <span className="font-bold">{attributes[attribute]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
        <h4 className="font-medium text-blue-400 mb-2">Attribute Guide</h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• <strong>Strength:</strong> Affects melee damage, carrying capacity, and physical skills</p>
          <p>• <strong>Dexterity:</strong> Influences ranged accuracy, movement speed, and agility</p>
          <p>• <strong>Constitution:</strong> Determines health points, stamina, and resistance</p>
          <p>• <strong>Intelligence:</strong> Controls magical power, mana pool, and spell effectiveness</p>
          <p>• <strong>Wisdom:</strong> Affects perception, willpower, and mana regeneration</p>
          <p>• <strong>Charisma:</strong> Influences social interactions and some magical abilities</p>
        </div>
      </div>
    </div>
  );
};