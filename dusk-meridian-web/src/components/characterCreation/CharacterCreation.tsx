import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Home } from 'lucide-react';
import { cn } from '@/utils/cn';
import * as CharacterCreationTypes from '@/api/types/characterCreation';
import { ProgressIndicator } from './utility/LoadingSpinner';

// Step Components
import { NFTValidationStep } from './steps/NFTValidationStep';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { GeographicalTraitStep } from './steps/GeographicalTraitStep';
import { SkillConfigurationStep } from './steps/SkillConfigurationStep';
import { AttributeDistributionStep } from './steps/AttributeDistributionStep';
import { ReviewAndCreateStep } from './steps/ReviewAndCreateStep';

interface CharacterCreationProps {
  walletAddress: string;
  onCharacterCreated: (character: any) => void;
  onCancel: () => void;
}

interface StepValidation {
  isValid: boolean;
  errors: string[];
}

export const CharacterCreation: React.FC<CharacterCreationProps> = ({
  walletAddress,
  onCharacterCreated,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [nftValidation, setNftValidation] = useState<CharacterCreationTypes.NFTValidationResponse | null>(null);
  const [nftBonuses, setNftBonuses] = useState<CharacterCreationTypes.NFTBonuses | null>(null);
  const [stepValidations, setStepValidations] = useState<Record<number, StepValidation>>({});

  // Character Creation Data State
  const [characterData, setCharacterData] = useState<CharacterCreationTypes.CharacterCreationData>({
    basicInfo: {
      name: '',
      race: undefined,
      characterClass: undefined
    },
    geographicalTrait: undefined,
    skillConfiguration: {
      useTemplate: true,
      templateId: undefined,
      template: undefined,
      selectedSkills: [],
      customSkillPoints: CharacterCreationTypes.BASE_SKILL_POINTS
    },
    attributes: {
      strength: CharacterCreationTypes.MIN_ATTRIBUTE_VALUE,
      dexterity: CharacterCreationTypes.MIN_ATTRIBUTE_VALUE,
      constitution: CharacterCreationTypes.MIN_ATTRIBUTE_VALUE,
      intelligence: CharacterCreationTypes.MIN_ATTRIBUTE_VALUE,
      wisdom: CharacterCreationTypes.MIN_ATTRIBUTE_VALUE,
      charisma: CharacterCreationTypes.MIN_ATTRIBUTE_VALUE
    },
    nftTier: 1,
    walletAddress
  });

  const steps = [
    { id: 'nft-validation', title: 'NFT Validation', component: NFTValidationStep },
    { id: 'basic-info', title: 'Basic Info', component: BasicInfoStep },
    { id: 'geographical-trait', title: 'Origin', component: GeographicalTraitStep },
    { id: 'skill-configuration', title: 'Skills', component: SkillConfigurationStep },
    { id: 'attribute-distribution', title: 'Attributes', component: AttributeDistributionStep },
    { id: 'review-create', title: 'Review', component: ReviewAndCreateStep }
  ];

  useEffect(() => {
    // Update NFT tier in character data when validation changes
    if (nftValidation) {
      const highestTier = Math.max(...nftValidation.ownedNFTs.map(nft => nft.tier), 1);
      setCharacterData(prev => ({ ...prev, nftTier: highestTier }));
    }
  }, [nftValidation]);

  const handleStepValidation = (stepIndex: number, isValid: boolean, errors: string[]) => {
    setStepValidations(prev => ({
      ...prev,
      [stepIndex]: { isValid, errors }
    }));
  };

  const handleNFTValidation = (validation: CharacterCreationTypes.NFTValidationResponse) => {
    setNftValidation(validation);
    handleStepValidation(0, validation.canCreateCharacter, []);
  };

  const handleNFTError = (error: string) => {
    handleStepValidation(0, false, [error]);
  };

  const handleBasicInfoChange = (updates: Partial<CharacterCreationTypes.BasicInfo>) => {
    setCharacterData(prev => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, ...updates }
    }));
  };

  const handleGeographicalTraitChange = (trait: CharacterCreationTypes.GeographicalTrait | undefined) => {
    setCharacterData(prev => ({
      ...prev,
      geographicalTrait: trait
    }));
  };

  const handleSkillConfigurationChange = (skillConfig: CharacterCreationTypes.SkillConfiguration) => {
    setCharacterData(prev => ({
      ...prev,
      skillConfiguration: skillConfig
    }));
  };

  const handleAttributesChange = (attributes: CharacterCreationTypes.AttributeDistribution) => {
    setCharacterData(prev => ({
      ...prev,
      attributes
    }));
  };

  const canProceedToStep = (stepIndex: number) => {
    // Check if all previous steps are valid
    for (let i = 0; i < stepIndex; i++) {
      const validation = stepValidations[i];
      if (!validation || !validation.isValid) {
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1 && canProceedToStep(currentStep + 1)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleJumpToStep = (stepIndex: number) => {
    if (stepIndex <= currentStep || canProceedToStep(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const handleEditStep = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      handleJumpToStep(stepIndex);
    }
  };

  const getAvailableAttributePoints = () => {
    const basePoints = CharacterCreationTypes.BASE_ATTRIBUTE_POINTS;
    const nftBonus = nftBonuses?.attributePointBonus || 0;
    return basePoints + nftBonus;
  };

  const getProgressSteps = () => {
    return steps.map((step, index) => ({
      id: step.id,
      title: step.title,
      completed: stepValidations[index]?.isValid || false,
      current: currentStep === index
    }));
  };

  const renderCurrentStep = () => {
    const StepComponent = steps[currentStep].component;

    switch (currentStep) {
      case 0: // NFT Validation
        return (
          <NFTValidationStep
            walletAddress={walletAddress}
            onValidationComplete={handleNFTValidation}
            onError={handleNFTError}
          />
        );

      case 1: // Basic Info
        return (
          <BasicInfoStep
            characterName={characterData.basicInfo.name}
            selectedRace={characterData.basicInfo.race}
            selectedClass={characterData.basicInfo.characterClass}
            onNameChange={(name) => handleBasicInfoChange({ name })}
            onRaceSelect={(race) => handleBasicInfoChange({ race })}
            onClassSelect={(characterClass) => handleBasicInfoChange({ characterClass })}
            onValidationChange={(isValid, errors) => handleStepValidation(1, isValid, errors)}
          />
        );

      case 2: // Geographical Trait
        return (
          <GeographicalTraitStep
            selectedTrait={characterData.geographicalTrait}
            onTraitSelect={handleGeographicalTraitChange}
            onValidationChange={(isValid, errors) => handleStepValidation(2, isValid, errors)}
            nftTier={characterData.nftTier}
          />
        );

      case 3: // Skill Configuration
        return (
          <SkillConfigurationStep
            skillConfiguration={characterData.skillConfiguration}
            onSkillConfigurationChange={handleSkillConfigurationChange}
            onValidationChange={(isValid, errors) => handleStepValidation(3, isValid, errors)}
            nftTier={characterData.nftTier}
            nftBonuses={nftBonuses}
          />
        );

      case 4: // Attribute Distribution
        return (
          <AttributeDistributionStep
            attributes={characterData.attributes}
            onAttributesChange={handleAttributesChange}
            onValidationChange={(isValid, errors) => handleStepValidation(4, isValid, errors)}
            availablePoints={getAvailableAttributePoints()}
            nftBonuses={nftBonuses}
          />
        );

      case 5: // Review and Create
        return (
          <ReviewAndCreateStep
            characterData={characterData}
            nftValidation={nftValidation}
            nftBonuses={nftBonuses}
            onEdit={handleEditStep}
            onCharacterCreated={onCharacterCreated}
            onError={(error) => console.error('Character creation error:', error)}
          />
        );

      default:
        return <div>Invalid step</div>;
    }
  };

  const currentStepValidation = stepValidations[currentStep];
  const canProceed = currentStepValidation?.isValid || false;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onCancel}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Character Creation</h1>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
                </p>
              </div>
            </div>

            {/* Step indicators for larger screens */}
            <div className="hidden lg:block">
              <ProgressIndicator steps={getProgressSteps()} />
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar for mobile */}
      <div className="lg:hidden bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <ProgressIndicator steps={getProgressSteps()} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
            className={cn(
              'px-4 py-2 border rounded-lg transition-colors flex items-center space-x-2',
              currentStep === 0
                ? 'border-border text-muted-foreground cursor-not-allowed'
                : 'border-border hover:border-primary text-foreground hover:bg-primary/10'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Step Validation Status */}
          <div className="flex items-center space-x-4">
            {currentStepValidation && (
              <div className="flex items-center space-x-2">
                {currentStepValidation.isValid ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-green-400">Step Valid</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm text-yellow-400">
                      {currentStepValidation.errors.length > 0
                        ? currentStepValidation.errors[0]
                        : 'Step Incomplete'
                      }
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNextStep}
              disabled={!canProceed}
              className={cn(
                'px-4 py-2 rounded-lg transition-colors flex items-center space-x-2',
                canProceed
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary text-muted-foreground cursor-not-allowed'
              )}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-20" /> // Spacer for layout balance
          )}
        </div>

        {/* Step Errors */}
        {currentStepValidation && !currentStepValidation.isValid && currentStepValidation.errors.length > 1 && (
          <div className="mt-4 bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4">
            <h4 className="font-medium text-yellow-400 mb-2">Step Requirements</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {currentStepValidation.errors.map((error, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};