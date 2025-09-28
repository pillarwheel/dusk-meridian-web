import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, Wallet, Users, Crown } from 'lucide-react';
import { cn } from '@/utils/cn';
import * as CharacterCreationTypes from '@/api/types/characterCreation';
import { NFTBadge } from '../utility/NFTBadge';
import { LoadingSpinner } from '../utility/LoadingSpinner';
import { characterCreationApi } from '@/api/endpoints/characterCreation';

interface NFTValidationStepProps {
  walletAddress: string;
  onValidationComplete: (validation: CharacterCreationTypes.NFTValidationResponse) => void;
  onError: (error: string) => void;
}

export const NFTValidationStep: React.FC<NFTValidationStepProps> = ({
  walletAddress,
  onValidationComplete,
  onError
}) => {
  const [validation, setValidation] = useState<CharacterCreationTypes.NFTValidationResponse | null>(null);
  const [nftBonuses, setNftBonuses] = useState<CharacterCreationTypes.NFTBonuses | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    validateNFTs();
  }, [walletAddress]);

  const validateNFTs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🎯 Validating NFTs for wallet:', walletAddress);

      // Run validation and bonus fetching in parallel
      const [validationResult, bonusesResult] = await Promise.all([
        characterCreationApi.validateNFTs(walletAddress),
        characterCreationApi.getNFTBonuses(walletAddress).catch(() => null) // Bonuses are optional
      ]);

      console.log('✅ NFT validation result:', validationResult);
      console.log('🎁 NFT bonuses result:', bonusesResult);

      setValidation(validationResult);
      setNftBonuses(bonusesResult);

      if (validationResult.canCreateCharacter) {
        onValidationComplete(validationResult);
      } else {
        onError(validationResult.message || 'Cannot create character with current NFTs');
      }
    } catch (err) {
      console.error('❌ NFT validation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate NFTs';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getRequiredNFTs = () => {
    return [
      { tier: 1, name: 'Basic', description: 'Required for character creation', required: true },
      { tier: 2, name: 'Standard', description: 'Required for character customization', required: true },
      { tier: 3, name: 'Premium', description: 'Optional bonuses and features', required: false },
      { tier: 4, name: 'Elite', description: 'Exclusive content and abilities', required: false }
    ];
  };

  const getOwnedNFTCount = (tier: number) => {
    if (!validation) return 0;
    const ownedTier = validation.ownedNFTs.find(nft => nft.tier === tier);
    return ownedTier?.count || 0;
  };

  const hasRequiredNFTs = () => {
    return getOwnedNFTCount(1) > 0 && getOwnedNFTCount(2) > 0;
  };

  const getHighestOwnedTier = () => {
    if (!validation) return 0;
    return Math.max(...validation.ownedNFTs.map(nft => nft.tier), 0);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner
          size="lg"
          message="Validating NFT Ownership"
          submessage="Checking your wallet for required NFTs..."
        />
      </div>
    );
  }

  if (error && !validation) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-6 max-w-md mx-auto">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Validation Failed</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={validateNFTs}
            className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors flex items-center justify-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Validation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">NFT Validation</h2>
        <p className="text-muted-foreground">
          Verify your NFT ownership to enable character creation and unlock bonuses
        </p>
      </div>

      {/* Wallet Info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Wallet className="w-6 h-6 text-primary" />
          <h3 className="text-lg font-semibold">Connected Wallet</h3>
        </div>
        <div className="bg-secondary/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
          <p className="font-mono text-sm">{walletAddress}</p>
        </div>
      </div>

      {/* Validation Results */}
      {validation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Character Slots */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold">Character Slots</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available Slots</span>
                <span className="font-medium">{validation.maxCharacterSlots}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Characters Created</span>
                <span className="font-medium">{validation.currentCharacterCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining Slots</span>
                <span className={cn(
                  'font-medium',
                  validation.maxCharacterSlots - validation.currentCharacterCount > 0
                    ? 'text-green-400'
                    : 'text-red-400'
                )}>
                  {validation.maxCharacterSlots - validation.currentCharacterCount}
                </span>
              </div>
            </div>
          </div>

          {/* Creation Status */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle2 className={cn(
                'w-6 h-6',
                validation.canCreateCharacter ? 'text-green-400' : 'text-red-400'
              )} />
              <h3 className="text-lg font-semibold">Creation Status</h3>
            </div>
            <div className="space-y-3">
              <div className={cn(
                'p-4 rounded-lg border',
                validation.canCreateCharacter
                  ? 'bg-green-400/10 border-green-400/30 text-green-400'
                  : 'bg-red-400/10 border-red-400/30 text-red-400'
              )}>
                <div className="flex items-center space-x-2">
                  {validation.canCreateCharacter ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {validation.canCreateCharacter ? 'Ready to Create' : 'Cannot Create Character'}
                  </span>
                </div>
                {validation.message && (
                  <p className="text-sm mt-2 opacity-90">{validation.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NFT Requirements */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold">NFT Requirements</h3>
          </div>
          <button
            onClick={validateNFTs}
            disabled={isLoading}
            className="px-3 py-2 text-sm bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getRequiredNFTs().map(requirement => {
            const ownedCount = getOwnedNFTCount(requirement.tier);
            const isOwned = ownedCount > 0;
            const isSatisfied = !requirement.required || isOwned;

            return (
              <div
                key={requirement.tier}
                className={cn(
                  'border rounded-lg p-4 transition-all',
                  isSatisfied ? 'border-green-400/30 bg-green-400/5' : requirement.required ? 'border-red-400/30 bg-red-400/5' : 'border-border'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <NFTBadge tier={requirement.tier} size="sm" />
                  {isSatisfied ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : requirement.required ? (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  ) : (
                    <div className="w-5 h-5 border border-border rounded-full" />
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{requirement.name} NFT</h4>
                  <p className="text-xs text-muted-foreground">{requirement.description}</p>

                  <div className="flex justify-between text-xs">
                    <span className={cn(
                      requirement.required ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {requirement.required ? 'Required' : 'Optional'}
                    </span>
                    <span className={cn(
                      'font-medium',
                      isOwned ? 'text-green-400' : 'text-muted-foreground'
                    )}>
                      Owned: {ownedCount}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NFT Bonuses */}
      {nftBonuses && getHighestOwnedTier() >= 3 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Crown className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold">Premium Bonuses</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nftBonuses.skillPointBonus > 0 && (
              <div className="bg-purple-400/10 border border-purple-400/30 rounded-lg p-4">
                <h4 className="font-medium text-purple-400 mb-2">Extra Skill Points</h4>
                <p className="text-2xl font-bold text-purple-400">+{nftBonuses.skillPointBonus}</p>
                <p className="text-xs text-muted-foreground">Additional skills you can select</p>
              </div>
            )}

            {nftBonuses.attributePointBonus > 0 && (
              <div className="bg-blue-400/10 border border-blue-400/30 rounded-lg p-4">
                <h4 className="font-medium text-blue-400 mb-2">Attribute Bonus</h4>
                <p className="text-2xl font-bold text-blue-400">+{nftBonuses.attributePointBonus}</p>
                <p className="text-xs text-muted-foreground">Extra attribute points to distribute</p>
              </div>
            )}

            {nftBonuses.premiumTemplatesUnlocked && (
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
                <h4 className="font-medium text-yellow-400 mb-2">Premium Templates</h4>
                <p className="text-2xl font-bold text-yellow-400">✓</p>
                <p className="text-xs text-muted-foreground">Access to exclusive skill templates</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Missing Requirements */}
      {validation && !validation.canCreateCharacter && (
        <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-semibold">Missing Requirements</h3>
          </div>
          <div className="space-y-2">
            {!hasRequiredNFTs() && (
              <p className="text-sm text-red-400">
                • You need at least one Tier 1 and one Tier 2 NFT to create a character
              </p>
            )}
            {validation.maxCharacterSlots <= validation.currentCharacterCount && (
              <p className="text-sm text-red-400">
                • You have reached the maximum number of characters for your NFT tier
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};