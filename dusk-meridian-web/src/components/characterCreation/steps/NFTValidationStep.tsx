import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, Wallet, Users, Crown, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import * as CharacterCreationTypes from '@/api/types/characterCreation';
import { NFTBadge } from '../utility/NFTBadge';
import { LoadingSpinner } from '../utility/LoadingSpinner';
import { characterCreationApi } from '@/api/endpoints/characterCreation';
import { getClassSuggestions } from '@/utils/nftClassSuggestions';
import type { ClassSuggestion } from '@/utils/nftClassSuggestions';

interface NFTValidationStepProps {
  walletAddress: string;
  selectedNFTs: {
    tier1?: string;
    tier2?: string;
    tier3?: string;
    tier4?: string;
  };
  onValidationComplete: (validation: CharacterCreationTypes.NFTValidationResponse) => void;
  onNFTSelectionChange: (selectedNFTs: { tier1?: string; tier2?: string; tier3?: string; tier4?: string }) => void;
  onError: (error: string) => void;
}

export const NFTValidationStep: React.FC<NFTValidationStepProps> = ({
  walletAddress,
  selectedNFTs,
  onValidationComplete,
  onNFTSelectionChange,
  onError
}) => {
  const [validation, setValidation] = useState<CharacterCreationTypes.NFTValidationResponse | null>(null);
  const [nftBonuses, setNftBonuses] = useState<CharacterCreationTypes.NFTBonuses | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classSuggestions, setClassSuggestions] = useState<ClassSuggestion[]>([]);

  useEffect(() => {
    validateNFTs();
  }, [walletAddress]);

  useEffect(() => {
    // Update class suggestions whenever NFT selection changes
    const suggestions = getClassSuggestions(selectedNFTs);
    setClassSuggestions(suggestions);
  }, [selectedNFTs]);

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
    const ownedNFTs = validation.ownedTiers || [];

    // Count the number of NFTs with matching tier
    // Backend returns individual NFT objects, not aggregated counts
    const count = ownedNFTs.filter(nft => nft.tier === tier).length;

    return count;
  };

  const hasRequiredNFTs = () => {
    return getOwnedNFTCount(1) > 0 && getOwnedNFTCount(2) > 0;
  };

  const getHighestOwnedTier = () => {
    if (!validation) return 0;
    const ownedNFTs = validation.ownedTiers || [];
    return Math.max(...ownedNFTs.map(nft => nft.tier), 0);
  };

  const getNFTsForTier = (tier: number): CharacterCreationTypes.NFTTier[] => {
    if (!validation) return [];
    const ownedNFTs = validation.ownedTiers || [];
    return ownedNFTs.filter(nft => nft.tier === tier);
  };

  const handleNFTSelection = (tier: number, tokenId: string) => {
    const tierKey = `tier${tier}` as 'tier1' | 'tier2' | 'tier3' | 'tier4';
    const newSelection = {
      ...selectedNFTs,
      [tierKey]: selectedNFTs[tierKey] === tokenId ? undefined : tokenId
    };
    onNFTSelectionChange(newSelection);
  };

  const getSelectedNFTForTier = (tier: number): string | undefined => {
    const tierKey = `tier${tier}` as 'tier1' | 'tier2' | 'tier3' | 'tier4';
    return selectedNFTs[tierKey];
  };

  // Helper function to format NFT type strings into readable names
  const formatNFTType = (nftType: string): string => {
    const typeMap: Record<string, string> = {
      // Tier 1 Types
      'guardian': 'Guardian License',
      'striker': 'Striker License',
      'specialist': 'Specialist License',
      'coordinator': 'Coordinator License',

      // Tier 2 Types
      'martial_artist': 'Martial Artist Cert.',
      'spellcaster': 'Spellcaster Cert.',
      'technician': 'Technician Cert.',
      'divine_channeler': 'Divine Channeler Cert.',
      'nature_walker': 'Nature Walker Cert.',
      'psion': 'Psion Cert.',

      // Tier 3 Types (examples)
      'fire_mage': 'Fire Mage',
      'ice_mage': 'Ice Mage',
      'shadow_assassin': 'Shadow Assassin',
      'paladin': 'Paladin',
      'druid': 'Druid'
    };

    return typeMap[nftType.toLowerCase()] || nftType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
                <span className="font-medium">
                  {validation.availableCharacterSlots ?? 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Characters Created</span>
                <span className="font-medium">{validation.currentCharacterCount ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining Slots</span>
                <span className={cn(
                  'font-medium',
                  (validation.availableCharacterSlots ?? 0) - (validation.currentCharacterCount ?? 0) > 0
                    ? 'text-green-400'
                    : 'text-red-400'
                )}>
                  {(validation.availableCharacterSlots ?? 0) - (validation.currentCharacterCount ?? 0)}
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

      {/* NFT Selection */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Crown className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold">Select NFTs for Character</h3>
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

        <div className="space-y-6">
          {getRequiredNFTs().map(requirement => {
            const nftsForTier = getNFTsForTier(requirement.tier);
            const selectedNFT = getSelectedNFTForTier(requirement.tier);
            const isOwned = nftsForTier.length > 0;
            const isMissing = requirement.required && !isOwned;

            return (
              <div key={requirement.tier} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <NFTBadge tier={requirement.tier} size="sm" />
                    <div>
                      <h4 className="font-medium text-sm">{requirement.name} NFT</h4>
                      <p className="text-xs text-muted-foreground">{requirement.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      requirement.required
                        ? 'bg-red-400/20 text-red-400'
                        : 'bg-blue-400/20 text-blue-400'
                    )}>
                      {requirement.required ? 'Required' : 'Optional'}
                    </span>
                    {isOwned ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : isMissing ? (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    ) : (
                      <div className="w-5 h-5 border border-border rounded-full" />
                    )}
                  </div>
                </div>

                {isOwned ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {nftsForTier.map(nft => {
                      const isSelected = selectedNFT === nft.tokenId;
                      return (
                        <button
                          key={nft.tokenId}
                          onClick={() => handleNFTSelection(requirement.tier, nft.tokenId)}
                          className={cn(
                            'border rounded-lg p-4 text-left transition-all',
                            isSelected
                              ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              #{nft.tokenId.slice(0, 8)}...
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                          </div>
                          <div className="text-sm">
                            <div className="font-medium">Tier {nft.tier} NFT</div>
                            {nft.metadata?.name && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {nft.metadata.name}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-secondary/50 border border-border rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {isMissing
                        ? `You need at least one ${requirement.name} NFT to create a character`
                        : `No ${requirement.name} NFTs found in your wallet`
                      }
                    </p>
                  </div>
                )}
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
            {/* Display backend-provided missing requirements if available */}
            {validation.missingRequirements && validation.missingRequirements.length > 0 ? (
              validation.missingRequirements.map((req, idx) => (
                <p key={idx} className="text-sm text-red-400">
                  • {req}
                </p>
              ))
            ) : (
              <>
                {!hasRequiredNFTs() && (
                  <p className="text-sm text-red-400">
                    • You need at least one Tier 1 and one Tier 2 NFT to create a character
                  </p>
                )}
                {(validation.availableCharacterSlots ?? 0) <= (validation.currentCharacterCount ?? 0) && (
                  <p className="text-sm text-red-400">
                    • You have reached the maximum number of characters for your NFT tier
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Class Suggestions - Moved to end so Next button appears before this */}
      {(selectedNFTs.tier1 || selectedNFTs.tier2) && (
        <div className="bg-card border border-border rounded-lg p-6 mt-6">
          <div className="flex items-center space-x-3 mb-6">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="text-lg font-semibold">Suggested Character Classes</h3>
              <p className="text-sm text-muted-foreground">Based on your selected NFTs - for planning future characters</p>
            </div>
          </div>

          {classSuggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="border border-border rounded-lg p-4 hover:border-purple-400/50 transition-all bg-secondary/30"
                >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{suggestion.name}</h4>
                    <p className="text-xs text-purple-400">{suggestion.role}</p>
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2',
                    suggestion.difficulty === 'Beginner' && 'bg-green-400/20 text-green-400',
                    suggestion.difficulty === 'Intermediate' && 'bg-yellow-400/20 text-yellow-400',
                    suggestion.difficulty === 'Advanced' && 'bg-red-400/20 text-red-400'
                  )}>
                    {suggestion.difficulty}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {suggestion.description}
                </p>

                <div className="space-y-2">
                  {/* Required NFTs Section */}
                  <div className="text-xs">
                    <div className="font-medium text-muted-foreground mb-1">Required NFTs:</div>
                    <div className="space-y-1">
                      {suggestion.requiredNFTs.tier1.map((nftType, idx) => (
                        <div key={`t1-${idx}`} className="flex items-center space-x-2">
                          <NFTBadge tier={1} size="sm" />
                          <span className="text-foreground/80">{formatNFTType(nftType)}</span>
                        </div>
                      ))}
                      {suggestion.requiredNFTs.tier2.map((nftType, idx) => (
                        <div key={`t2-${idx}`} className="flex items-center space-x-2">
                          <NFTBadge tier={2} size="sm" />
                          <span className="text-foreground/80">{formatNFTType(nftType)}</span>
                        </div>
                      ))}
                      {suggestion.requiredNFTs.tier3 && suggestion.requiredNFTs.tier3.map((nftType, idx) => (
                        <div key={`t3-${idx}`} className="flex items-center space-x-2">
                          <NFTBadge tier={3} size="sm" />
                          <span className="text-foreground/80">{formatNFTType(nftType)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs">
                    <div className="font-medium text-muted-foreground mb-1">Playstyle:</div>
                    <div className="text-foreground/80 line-clamp-2">{suggestion.playstyle}</div>
                  </div>

                  <div className="text-xs">
                    <div className="font-medium text-muted-foreground mb-1">Key Skills:</div>
                    <div className="text-foreground/80 line-clamp-2">
                      {suggestion.primarySkills.slice(0, 3).join(', ')}
                    </div>
                  </div>
                </div>

                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>Future reference</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Select NFTs to see character class suggestions
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};