import React, { useState, useEffect, useCallback } from 'react';
import { User, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import * as CharacterCreationTypes from '@/api/types/characterCreation';
import { characterCreationApi, characterCreationUtils } from '@/api/endpoints/characterCreation';
import { LoadingSpinner } from '../utility/LoadingSpinner';

interface BasicInfoStepProps {
  characterName: string;
  onNameChange: (name: string) => void;
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
  onNameChange,
  onValidationChange
}) => {
  const [nameValidation, setNameValidation] = useState<NameValidationState>({
    isChecking: false
  });

  useEffect(() => {
    validateStep();
  }, [characterName, nameValidation]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (characterName.length >= CharacterCreationTypes.CHARACTER_NAME_MIN_LENGTH) {
        checkNameAvailability(characterName);
      } else if (characterName.length > 0) {
        setNameValidation({
          isChecking: false,
          isAvailable: false,
          error: `Name must be at least ${CharacterCreationTypes.CHARACTER_NAME_MIN_LENGTH} characters`
        });
      } else {
        setNameValidation({ isChecking: false });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [characterName]);

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
        isAvailable: undefined,
        error: 'Unable to check name availability. You can still proceed.'
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

    // Allow proceeding even if name check failed (undefined) but name format is valid
    const isValid = errors.length === 0 && (nameValidation.isAvailable === true || nameValidation.isAvailable === undefined);
    onValidationChange(isValid, errors);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Character Name</h2>
        <p className="text-muted-foreground">
          Choose a unique name for your character
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Your class name will be determined by your skill selection in the next steps
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
                nameValidation.error && nameValidation.isAvailable !== undefined
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
              ) : nameValidation.error && nameValidation.isAvailable !== undefined ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : nameValidation.isAvailable === true ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : null}
            </div>
          </div>

          {/* Name feedback */}
          <div className="space-y-2">
            {nameValidation.error && nameValidation.isAvailable !== undefined && (
              <p className="text-sm text-yellow-400 flex items-center space-x-2">
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

      {/* Information about character creation */}
      <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-blue-400">About Character Creation</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>No fixed classes or races:</strong> Dusk Meridian uses a skill-based character system
          </p>
          <p>
            • <strong>Geographical Traits:</strong> Choose your character's origin in the next step (optional)
          </p>
          <p>
            • <strong>Skills:</strong> Select from templates or build a custom skill set
          </p>
          <p>
            • <strong>Class Name:</strong> Your "class" will be defined by your skill template selection
          </p>
        </div>
      </div>

      {/* Selection Summary */}
      {characterName && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Current Selection</h3>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Character Name</h4>
            <p className="font-medium text-xl">{characterName}</p>
          </div>
        </div>
      )}
    </div>
  );
};
