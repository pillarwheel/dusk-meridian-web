import React, { useState, useEffect, useCallback } from 'react';
import { User, CheckCircle2, AlertCircle, Search, Sparkles, Crown, Shield, Sword, Target } from 'lucide-react';
import { cn } from '@/utils/cn';
import * as CharacterCreationTypes from '@/api/types/characterCreation';
import { characterCreationApi, characterCreationUtils } from '@/api/endpoints/characterCreation';
import { LoadingSpinner } from '../utility/LoadingSpinner';

interface BasicInfoStepProps {
  characterName: string;
  selectedRace?: CharacterCreationTypes.Race;
  selectedClass?: CharacterCreationTypes.CharacterClass;
  onNameChange: (name: string) => void;
  onRaceSelect: (race: CharacterCreationTypes.Race) => void;
  onClassSelect: (characterClass: CharacterCreationTypes.CharacterClass) => void;
  onValidationChange: (isValid: boolean, errors: string[]) => void;
}

interface NameValidationState {
  isChecking: boolean;
  isAvailable?: boolean;
  suggestions?: string[];
  error?: string;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  characterName,
  selectedRace,
  selectedClass,
  onNameChange,
  onRaceSelect,
  onClassSelect,
  onValidationChange
}) => {
  const [races, setRaces] = useState<CharacterCreationTypes.Race[]>([]);
  const [classes, setClasses] = useState<CharacterCreationTypes.CharacterClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nameValidation, setNameValidation] = useState<NameValidationState>({
    isChecking: false
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    validateStep();
  }, [characterName, selectedRace, selectedClass, nameValidation]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (characterName.length >= CharacterCreationTypes.CHARACTER_NAME_MIN_LENGTH) {
        checkNameAvailability(characterName);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [characterName]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [raceData, classData] = await Promise.all([
        characterCreationApi.getAvailableRaces(),
        characterCreationApi.getAvailableClasses()
      ]);

      setRaces(raceData.filter(r => r.isActive));
      setClasses(classData.filter(c => c.isActive));
    } catch (error) {
      console.error('Failed to load races and classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkNameAvailability = useCallback(async (name: string) => {
    const nameValidationResult = characterCreationUtils.validateCharacterName(name);
    if (!nameValidationResult.valid) {
      setNameValidation({
        isChecking: false,
        isAvailable: false,
        error: nameValidationResult.errors[0]
      });
      return;
    }

    try {
      setNameValidation({ isChecking: true });
      const result = await characterCreationApi.checkNameAvailability(name);
      setNameValidation({
        isChecking: false,
        isAvailable: result.available,
        suggestions: result.suggestions,
        error: undefined
      });
    } catch (error) {
      console.error('Failed to check name availability:', error);
      setNameValidation({
        isChecking: false,
        error: 'Unable to check name availability'
      });
    }
  }, []);

  const validateStep = () => {
    const errors: string[] = [];

    // Name validation
    if (!characterName) {
      errors.push('Character name is required');
    } else {
      const nameValidationResult = characterCreationUtils.validateCharacterName(characterName);
      if (!nameValidationResult.valid) {
        errors.push(...nameValidationResult.errors);
      } else if (nameValidation.isAvailable === false) {
        errors.push('Character name is not available');
      }
    }

    // Race validation
    if (!selectedRace) {
      errors.push('Please select a race');
    }

    // Class validation
    if (!selectedClass) {
      errors.push('Please select a class');
    }

    const isValid = errors.length === 0 && nameValidation.isAvailable === true;
    onValidationChange(isValid, errors);
  };

  const getClassIcon = (className: string) => {
    const name = className.toLowerCase();
    if (name.includes('guardian') || name.includes('tank')) return Shield;
    if (name.includes('striker') || name.includes('warrior')) return Sword;
    if (name.includes('specialist') || name.includes('mage')) return Sparkles;
    if (name.includes('coordinator') || name.includes('support')) return Target;
    return Crown;
  };

  const getRaceIcon = (raceName: string) => {
    // You can customize these based on your actual races
    const name = raceName.toLowerCase();
    if (name.includes('human')) return User;
    if (name.includes('elf')) return Sparkles;
    if (name.includes('dwarf')) return Shield;
    if (name.includes('orc')) return Sword;
    return User;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner
          size="lg"
          message="Loading Character Options"
          submessage="Fetching available races and classes..."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Basic Character Information</h2>
        <p className="text-muted-foreground">
          Choose your character's name, race, and class
        </p>
      </div>

      {/* Character Name */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <User className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Character Name</h3>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={characterName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter your character's name..."
              className={cn(
                'w-full px-4 py-3 bg-background border rounded-lg transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                nameValidation.error
                  ? 'border-red-400'
                  : nameValidation.isAvailable === true
                  ? 'border-green-400'
                  : 'border-border'
              )}
              maxLength={CharacterCreationTypes.CHARACTER_NAME_MAX_LENGTH}
            />

            {/* Validation indicator */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {nameValidation.isChecking ? (
                <LoadingSpinner size="sm" />
              ) : nameValidation.error ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : nameValidation.isAvailable === true ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : null}
            </div>
          </div>

          {/* Name feedback */}
          <div className="space-y-2">
            {nameValidation.error && (
              <p className="text-sm text-red-400 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>{nameValidation.error}</span>
              </p>
            )}

            {nameValidation.isAvailable === true && (
              <p className="text-sm text-green-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Name is available!</span>
              </p>
            )}

            {nameValidation.isAvailable === false && !nameValidation.error && (
              <div className="space-y-2">
                <p className="text-sm text-red-400 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Name is already taken</span>
                </p>
                {nameValidation.suggestions && nameValidation.suggestions.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Suggested alternatives:</p>
                    <div className="flex flex-wrap gap-2">
                      {nameValidation.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => onNameChange(suggestion)}
                          className="text-xs px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full hover:bg-primary/30 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Character count */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Length: {CharacterCreationTypes.CHARACTER_NAME_MIN_LENGTH}-{CharacterCreationTypes.CHARACTER_NAME_MAX_LENGTH} characters
              </span>
              <span>
                {characterName.length}/{CharacterCreationTypes.CHARACTER_NAME_MAX_LENGTH}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Race Selection */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h3 className="text-lg font-semibold">Race</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {races.map((race) => {
            const RaceIcon = getRaceIcon(race.name);
            const isSelected = selectedRace?.id === race.id;

            return (
              <div
                key={race.id}
                onClick={() => onRaceSelect(race)}
                className={cn(
                  'border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50',
                  isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border'
                )}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    isSelected ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                  )}>
                    <RaceIcon className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold">{race.name}</h4>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />}
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {race.description}
                </p>

                {/* Racial traits preview */}
                {race.racialTraits.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-muted-foreground">Racial Traits</h5>
                    <div className="space-y-1">
                      {race.racialTraits.slice(0, 2).map((trait, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span className="text-xs text-foreground">{trait}</span>
                        </div>
                      ))}
                      {race.racialTraits.length > 2 && (
                        <p className="text-xs text-muted-foreground pl-4">
                          +{race.racialTraits.length - 2} more traits
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Class Selection */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Sword className="w-6 h-6 text-red-400" />
          <h3 className="text-lg font-semibold">Class</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((characterClass) => {
            const ClassIcon = getClassIcon(characterClass.name);
            const isSelected = selectedClass?.id === characterClass.id;

            return (
              <div
                key={characterClass.id}
                onClick={() => onClassSelect(characterClass)}
                className={cn(
                  'border rounded-lg p-4 cursor-pointer transition-all hover:border-primary/50',
                  isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border'
                )}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={cn(
                    'p-2 rounded-lg',
                    isSelected ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                  )}>
                    <ClassIcon className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold">{characterClass.name}</h4>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />}
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                  {characterClass.description}
                </p>

                {/* Primary attributes */}
                {characterClass.primaryAttributes.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">Primary Attributes</h5>
                    <div className="flex flex-wrap gap-1">
                      {characterClass.primaryAttributes.map((attr, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full"
                        >
                          {attr}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Class features preview */}
                {characterClass.classFeatures.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">Class Features</h5>
                    <div className="space-y-1">
                      {characterClass.classFeatures.slice(0, 2).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span className="text-xs text-foreground">{feature}</span>
                        </div>
                      ))}
                      {characterClass.classFeatures.length > 2 && (
                        <p className="text-xs text-muted-foreground pl-4">
                          +{characterClass.classFeatures.length - 2} more features
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selection Summary */}
      {(selectedRace || selectedClass || characterName) && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Current Selection</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Name</h4>
              <p className="font-medium">{characterName || 'Not selected'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Race</h4>
              <p className="font-medium">{selectedRace?.name || 'Not selected'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Class</h4>
              <p className="font-medium">{selectedClass?.name || 'Not selected'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};