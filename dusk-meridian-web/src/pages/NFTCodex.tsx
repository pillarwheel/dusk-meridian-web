import React, { useState, useEffect } from 'react';
import { Hexagon, Shield, Zap, Sparkles, ChevronRight, Info } from 'lucide-react';
import { nftCollection } from '@/data/nftData';
import type { Tier1RoleNFT, Tier2PowerSourceNFT, Tier3SpecializationNFT } from '@/types/nft';
import { cn } from '@/utils/cn';
import { populateNFTData } from '@/utils/nftDataPopulator';

type ViewMode = 'overview' | 'tier1' | 'tier2' | 'tier3' | 'detail';

interface NFTCodexState {
  viewMode: ViewMode;
  selectedNFT: Tier1RoleNFT | Tier2PowerSourceNFT | Tier3SpecializationNFT | null;
}

export const NFTCodex: React.FC = () => {
  const [state, setState] = useState<NFTCodexState>({
    viewMode: 'overview',
    selectedNFT: null
  });

  // Auto-populate NFT cache in background on component mount
  useEffect(() => {
    // Run asynchronously in background, don't block UI
    populateNFTData().catch(err => {
      console.log('NFT cache population (background):', err.message);
    });
  }, []);

  const handleSelectNFT = (nft: any) => {
    setState({ viewMode: 'detail', selectedNFT: nft });
  };

  const handleBackToView = (view: ViewMode) => {
    setState({ viewMode: view, selectedNFT: null });
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          NFT System
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Dusk Meridian features a three-tier NFT architecture that defines your character's role, power source, and specialization
        </p>
      </div>

      {/* Tier Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Tier 1 */}
        <button
          onClick={() => setState({ ...state, viewMode: 'tier1' })}
          className="game-card text-left hover:bg-background/70 transition-all hover:scale-105"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Tier 1: Role Licenses</h3>
              <p className="text-sm text-muted-foreground">Foundation - Required</p>
            </div>
          </div>
          <p className="text-muted-foreground mb-4">
            Universal role licenses that determine what you do in the game. Soul-bound after first character creation.
          </p>
          <div className="flex items-center text-primary font-semibold">
            <span>{nftCollection.tier1.length} Roles</span>
            <ChevronRight className="w-4 h-4 ml-2" />
          </div>
        </button>

        {/* Tier 2 */}
        <button
          onClick={() => setState({ ...state, viewMode: 'tier2' })}
          className="game-card text-left hover:bg-background/70 transition-all hover:scale-105"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Tier 2: Power Sources</h3>
              <p className="text-sm text-muted-foreground">Method</p>
            </div>
          </div>
          <p className="text-muted-foreground mb-4">
            Power source certifications that determine how you perform your role. Tradeable and compatible with all roles.
          </p>
          <div className="flex items-center text-primary font-semibold">
            <span>{nftCollection.tier2.length} Power Sources</span>
            <ChevronRight className="w-4 h-4 ml-2" />
          </div>
        </button>

        {/* Tier 3 */}
        <button
          onClick={() => setState({ ...state, viewMode: 'tier3' })}
          className="game-card text-left hover:bg-background/70 transition-all hover:scale-105"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-pink-600/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Tier 3: Specializations</h3>
              <p className="text-sm text-muted-foreground">Advanced Builds</p>
            </div>
          </div>
          <p className="text-muted-foreground mb-4">
            Advanced specializations requiring specific role and power source combinations. Fully tradeable.
          </p>
          <div className="flex items-center text-primary font-semibold">
            <span>{nftCollection.tier3.length} Specializations</span>
            <ChevronRight className="w-4 h-4 ml-2" />
          </div>
        </button>
      </div>

      {/* Character Creation Flow */}
      <div className="game-card">
        <h2 className="text-2xl font-bold mb-4">Character Creation Process</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-background/50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-bold">1</span>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Select Role (Required)</h4>
              <p className="text-sm text-muted-foreground">
                Choose your fundamental role from Guardian, Striker, Specialist, or Coordinator. This NFT is soul-bound after use.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-background/50 rounded-lg">
            <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-400 font-bold">2</span>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Choose Power Source</h4>
              <p className="text-sm text-muted-foreground">
                Select how you'll perform your role: Magic, Martial Arts, Technology, Divine, Nature, or Psionic powers.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-background/50 rounded-lg">
            <div className="w-8 h-8 bg-pink-600/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-pink-400 font-bold">3</span>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Optional Specialization</h4>
              <p className="text-sm text-muted-foreground">
                If you own a compatible specialization NFT, equip it for advanced abilities and unique playstyles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* World Adaptation Info */}
      <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold mb-2 text-blue-400">Cross-World Compatibility</h3>
            <p className="text-muted-foreground">
              All NFTs automatically adapt to different world technology levels. A Spellcaster becomes a Technomancer in sci-fi worlds,
              maintaining the same mechanical function while fitting the setting's theme.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTier1Gallery = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Tier 1: Role License NFTs</h2>
          <p className="text-muted-foreground">Foundation roles - Soul-bound after character creation</p>
        </div>
        <button
          onClick={() => handleBackToView('overview')}
          className="game-button px-4 py-2"
        >
          Back to Overview
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {nftCollection.tier1.map((nft) => (
          <button
            key={nft.id}
            onClick={() => handleSelectNFT(nft)}
            className="game-card text-left hover:bg-background/70 transition-all hover:scale-105 group"
          >
            <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-blue-900/50 to-purple-900/50">
              <img
                src={nft.imagePath}
                alt={nft.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            </div>
            <h3 className="text-lg font-bold mb-2">{nft.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{nft.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded">
                {nft.roleType.toUpperCase()}
              </span>
              <span className="text-red-400">Soul-bound</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTier2Gallery = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Tier 2: Power Source Certification NFTs</h2>
          <p className="text-muted-foreground">Choose your method - Tradeable</p>
        </div>
        <button
          onClick={() => handleBackToView('overview')}
          className="game-button px-4 py-2"
        >
          Back to Overview
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nftCollection.tier2.map((nft) => (
          <button
            key={nft.id}
            onClick={() => handleSelectNFT(nft)}
            className="game-card text-left hover:bg-background/70 transition-all hover:scale-105 group"
          >
            <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-purple-900/50 to-pink-900/50">
              <img
                src={nft.imagePath}
                alt={nft.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            </div>
            <h3 className="text-lg font-bold mb-2">{nft.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{nft.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded">
                {nft.powerSource.toUpperCase()}
              </span>
              <span className="text-green-400">Tradeable</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {nft.specializations.length} Specializations
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTier3Gallery = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Tier 3: Specialization NFTs</h2>
          <p className="text-muted-foreground">Advanced builds - Fully tradeable</p>
        </div>
        <button
          onClick={() => handleBackToView('overview')}
          className="game-button px-4 py-2"
        >
          Back to Overview
        </button>
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {nftCollection.tier3.map((nft) => (
          <button
            key={nft.id}
            onClick={() => handleSelectNFT(nft)}
            className="game-card text-left hover:bg-background/70 transition-all hover:scale-105 group"
          >
            <div className="aspect-[2/3] rounded-lg overflow-hidden mb-3 bg-gradient-to-br from-pink-900/50 to-purple-900/50">
              <img
                src={nft.imagePath}
                alt={nft.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            </div>
            <h3 className="text-base font-bold mb-1">{nft.name}</h3>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={cn(
                "px-2 py-1 rounded",
                nft.rarity === 'legendary' && "bg-yellow-600/20 text-yellow-400",
                nft.rarity === 'epic' && "bg-purple-600/20 text-purple-400",
                nft.rarity === 'rare' && "bg-blue-600/20 text-blue-400"
              )}>
                {nft.rarity.toUpperCase()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!state.selectedNFT) return null;

    const nft = state.selectedNFT;
    const isTier1 = 'roleType' in nft;
    const isTier2 = 'powerSource' in nft;
    const isTier3 = 'specializationType' in nft;

    return (
      <div className="space-y-6">
        <button
          onClick={() => handleBackToView(isTier1 ? 'tier1' : isTier2 ? 'tier2' : 'tier3')}
          className="game-button px-4 py-2"
        >
          &larr; Back to Gallery
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-purple-900/50 to-pink-900/50">
              <img
                src={nft.imagePath}
                alt={nft.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className={cn(
                "px-3 py-1 rounded text-sm font-semibold",
                isTier1 && "bg-blue-600/20 text-blue-400",
                isTier2 && "bg-purple-600/20 text-purple-400",
                isTier3 && "bg-pink-600/20 text-pink-400"
              )}>
                Tier {nft.tier}
              </span>
              <span className={cn(
                "text-sm font-semibold",
                isTier1 && "text-red-400",
                !isTier1 && "text-green-400"
              )}>
                {isTier1 ? 'Soul-bound' : 'Tradeable'}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{nft.name}</h1>
              <p className="text-xl text-muted-foreground">{nft.description}</p>
            </div>

            {/* Tier 1 Specific */}
            {isTier1 && (
              <>
                <div className="game-card">
                  <h3 className="font-semibold mb-2">Role Description</h3>
                  <p className="text-muted-foreground">{nft.roleDescription}</p>
                </div>
                <div className="game-card">
                  <h3 className="font-semibold mb-2">Playstyle</h3>
                  <p className="text-muted-foreground">{nft.playstyle}</p>
                </div>
                <div className="game-card">
                  <h3 className="font-semibold mb-2">Primary Function</h3>
                  <p className="text-muted-foreground">{nft.primaryFunction}</p>
                </div>
              </>
            )}

            {/* Tier 2 Specific */}
            {isTier2 && (
              <>
                <div className="game-card">
                  <h3 className="font-semibold mb-2">Compatible Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {nft.compatibleRoles.map((role) => (
                      <span key={role} className="px-2 py-1 bg-secondary rounded text-sm">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="game-card">
                  <h3 className="font-semibold mb-2">Unlocks</h3>
                  <div className="flex flex-wrap gap-2">
                    {nft.unlockCategories.map((cat) => (
                      <span key={cat} className="px-2 py-1 bg-primary/20 text-primary rounded text-sm">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="game-card">
                  <h3 className="font-semibold mb-2">Specializations ({nft.specializations.length})</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {nft.specializations.slice(0, 8).map((spec) => (
                      <div key={spec}>{spec}</div>
                    ))}
                    {nft.specializations.length > 8 && (
                      <div className="text-primary">+{nft.specializations.length - 8} more</div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Tier 3 Specific */}
            {isTier3 && (
              <>
                <div className="game-card">
                  <h3 className="font-semibold mb-2">Lore</h3>
                  <p className="text-muted-foreground">{nft.loreDescription}</p>
                </div>
                <div className="game-card">
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>Role:</strong> {Array.isArray(nft.requiredRole) ? nft.requiredRole.join(', ') : nft.requiredRole}<br/>
                    <strong>Power Source:</strong> {Array.isArray(nft.requiredPowerSource) ? nft.requiredPowerSource.join(', ') : nft.requiredPowerSource}
                  </p>
                </div>
                <div className="game-card">
                  <h3 className="font-semibold mb-2">Signature Abilities</h3>
                  <div className="space-y-1">
                    {nft.signatureAbilities.map((ability) => (
                      <div key={ability} className="text-sm text-muted-foreground">• {ability}</div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Stats */}
            <div className="game-card">
              <h3 className="font-semibold mb-3">Base Statistics</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(nft.metadata).map(([stat, value]) => (
                  <div key={stat} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{stat}</span>
                    <span className="font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {state.viewMode === 'overview' && renderOverview()}
      {state.viewMode === 'tier1' && renderTier1Gallery()}
      {state.viewMode === 'tier2' && renderTier2Gallery()}
      {state.viewMode === 'tier3' && renderTier3Gallery()}
      {state.viewMode === 'detail' && renderDetail()}
    </div>
  );
};
