# Dusk Meridian NFT System

## Overview

Dusk Meridian features a comprehensive three-tier NFT architecture that defines character roles, power sources, and specializations. The system is fully integrated into the Codex with rich galleries and detailed information pages.

## Three-Tier Architecture

### Tier 1: Universal Role License NFTs (Foundation)
**Soul-bound after first character creation - Required for every character**

- **Guardian License** - Tank/Protector role
- **Striker License** - Damage Dealer role
- **Specialist License** - Utility/Technical role
- **Coordinator License** - Support/Leadership role

**Properties:**
- Soul-bound after first use
- Works across all game worlds and technology levels
- One required per character
- Defines what you do in the game

### Tier 2: Power Source Certification NFTs (Method)
**Tradeable - Determines how you perform your role**

- **Spellcaster Certification** - Elemental magic, enchantments, magical healing
- **Martial Artist Certification** - Physical combat and weapon mastery
- **Technician Certification** - Technology, gadgets, hacking
- **Divine Channeler Certification** - Faith-based powers, healing
- **Nature Walker Certification** - Natural/primal forces, animal companions
- **Psion Certification** - Mental powers, telepathy, telekinesis

**Properties:**
- Tradeable (can be unequipped and re-equipped)
- Compatible with all role types
- Adapt to world technology level
- Unlock multiple specializations

### Tier 3: Specialization NFTs (Advanced Builds)
**Fully tradeable - Specific combinations requiring Role + Power Source**

**Spellcaster Specializations (17 available):**
- Pyromancer, Cryomancer, Electromancer, Geomancer, Hydromancer
- Aeromancer, Necromancer, Illusionist, Conjurer, Abjurer
- Arcanist, Etherialist, Healer, Alchemist, Dracomancer
- Lumimancer, Spatiomancer

**Properties:**
- Fully tradeable
- Represent rare mastery achievements
- Provide signature abilities
- Adapt to different world types (fantasy, sci-fi, modern)

## File Structure

```
src/
├── types/
│   └── nft.ts                 # TypeScript types for NFT system
├── data/
│   └── nftData.ts            # Complete NFT data with metadata
├── pages/
│   └── NFTCodex.tsx          # Main NFT gallery and detail pages
├── utils/
│   └── nftDataPopulator.ts   # Cache population utilities
├── db/
│   └── codexDb.ts            # IndexedDB schema (updated with NFT table)
└── components/
    └── layout/
        └── Sidebar.tsx        # Navigation (includes NFT link)

public/
└── Images/
    └── NFTs/
        ├── Tier1/             # Role License images
        ├── Tier2/             # Power Source images
        └── Tier3/
            └── spellcasters/  # Specialization card art
```

## Usage

### Accessing the NFT System

1. **Via Navigation:** Click "NFTs" in the sidebar
2. **Via URL:** Navigate to `http://localhost:8080/nfts`
3. **From Codex:** Link from Codex pages

### Viewing NFTs

The NFT page has multiple views:

1. **Overview** - Introduction to the three-tier system
2. **Tier 1 Gallery** - All role licenses with images
3. **Tier 2 Gallery** - All power source certifications
4. **Tier 3 Gallery** - All specializations (17 spellcaster specs)
5. **Detail View** - Click any NFT for full information

### NFT Detail Pages Include:

- High-resolution artwork
- Full description and lore
- Requirements (for Tier 3)
- Compatible roles/power sources
- Base statistics
- Signature abilities
- World adaptation information
- Tradeable/Soul-bound status

## Character Creation Flow

```
1. Login & Wallet Connection
   ├── Immutable Passport authentication
   └── Wallet verification

2. Select Role (Tier 1)
   ├── Must own one of four Role License NFTs
   ├── Guardian, Striker, Specialist, or Coordinator
   └── Verified via blockchain query

3. Choose Power Source (Tier 2)
   ├── Select from owned Power Source NFTs
   ├── Spellcaster, Martial Artist, Technician, etc.
   └── Enables different playstyles

4. Optional Specialization (Tier 3)
   ├── Equip compatible specialization NFTs
   ├── Must meet requirements (Role + Power Source)
   └── Provides advanced abilities

5. World Adaptation
   └── NFTs automatically adapt to world's technology level
```

## NFT Metadata Structure

Each NFT includes comprehensive metadata:

```typescript
{
  tier: 1 | 2 | 3,
  name: string,
  description: string,
  imagePath: string,
  metadata: {
    strength: number,
    agility: number,
    constitution: number,
    intelligence: number,
    wisdom: number,
    charisma: number
  },
  // Tier-specific properties
  ...
}
```

## World Adaptation

NFTs automatically adapt to different world types:

| Original | Fantasy | Sci-Fi | Modern |
|----------|---------|--------|--------|
| Pyromancer | Fire Mage | Plasma Specialist | Thermal Manipulator |
| Cryomancer | Ice Mage | Cryo Specialist | Thermal Dampener |
| Technician | Artificer | Engineer | Hacker |
| Divine Channeler | Cleric | Bio-Mod Priest | Faith Healer |

## Rarity System (Tier 3)

Specializations have different rarity levels:

- **Common** - Standard specializations
- **Uncommon** - Enhanced abilities
- **Rare** - Most Tier 3 NFTs (Pyromancer, Cryomancer, etc.)
- **Epic** - Advanced specializations (Arcanist, Etherialist, Spatiomancer)
- **Legendary** - Ultimate specializations (Dracomancer)

## Integration with Codex

The NFT system is fully integrated with the Codex caching system:

1. **Cached in IndexedDB** - NFT data stored locally for offline access
2. **24-hour cache duration** - NFT data cached for one day
3. **Automatic population** - Data auto-loads on first visit
4. **Search capable** - Can search NFTs by name, tier, or type

## Populating NFT Data

### Automatic (Recommended)
```typescript
// Data auto-populates when you visit the NFT page
// Or manually trigger:
import { populateNFTData } from '@/utils/nftDataPopulator';
await populateNFTData();
```

### Querying NFTs
```typescript
import { getAllNFTsFromCache, getNFTsByTierFromCache } from '@/utils/nftDataPopulator';

// Get all NFTs
const allNFTs = await getAllNFTsFromCache();

// Get by tier
const tier1NFTs = await getNFTsByTierFromCache(1);
const tier2NFTs = await getNFTsByTierFromCache(2);
const tier3NFTs = await getNFTsByTierFromCache(3);
```

## Adding New NFTs

To add new NFT data:

1. Add image to appropriate folder in `public/Images/NFTs/`
2. Update data in `src/data/nftData.ts`
3. Follow the existing structure for your tier
4. Clear cache and refresh to see new NFTs

Example:
```typescript
{
  id: 'spec-new-mancer',
  tier: 3,
  name: 'New Mancer Specialization',
  specializationType: 'elemental_new',
  description: 'Master of new element',
  imagePath: '/Images/NFTs/Tier3/spellcasters/new-mancer.png',
  tradeable: true,
  requiredRole: ['striker'],
  requiredPowerSource: 'magic',
  rarity: 'rare',
  signatureAbilities: ['ability1', 'ability2'],
  loreDescription: 'Full lore text...',
  worldAdaptation: {
    fantasy: 'Fantasy Name',
    sci_fi: 'Sci-Fi Name',
    modern: 'Modern Name'
  },
  metadata: {
    strength: 10,
    agility: 12,
    constitution: 14,
    intelligence: 18,
    wisdom: 16,
    charisma: 14
  }
}
```

## Statistics

Current NFT counts:
- **Tier 1 (Roles):** 4 NFTs (2 minted on blockchain)
- **Tier 2 (Power Sources):** 7 NFTs (2 minted on blockchain)
- **Tier 3 (Specializations):** 17 NFTs (currently all Spellcaster-focused)
- **Total:** 28 NFTs

### Minted NFTs on Immutable zkEVM Testnet

Contract Address: `0x8a287861D4138e50Dd6126905FB606617b49dc50`

**Tier 1 (Minted):**
- Token ID 1: Coordinator License
- Token ID 2: Guardian License

**Tier 2 (Minted):**
- Token ID 5: Biochem Certification
- Token ID 6: Divine Channeler Certification

View on explorer: https://explorer.testnet.immutable.com/address/0x8a287861D4138e50Dd6126905FB606617b49dc50

## Future Enhancements

Planned features:
- [ ] Martial Artist Tier 3 specializations
- [ ] Technician Tier 3 specializations
- [ ] Divine Channeler Tier 3 specializations
- [ ] Nature Walker Tier 3 specializations
- [ ] Psion Tier 3 specializations
- [ ] NFT comparison tool
- [ ] Build simulator (Role + Power Source + Spec combinations)
- [ ] Blockchain integration for ownership verification
- [ ] Trading interface
- [ ] NFT crafting/upgrading system

## Blockchain Integration

The system is fully integrated with Immutable zkEVM Testnet:

### Current Status
- Frontend gallery and display: ✅ Complete
- Data structures and types: ✅ Complete with blockchain fields
- Character creation flow UI: ✅ Documented
- Blockchain verification: ✅ **Integrated**
- NFT Mapping Service: ✅ **Complete**
- GameServer API Integration: ✅ **Complete**

### Integration Architecture

```
Web Frontend (React) → NFT Verification API → GameServer → Immutable zkEVM
     ↓                        ↓                    ↓              ↓
  NFT Data            API Endpoints          NFT Service    Smart Contract
  (UI/UX)             (Auth, CRUD)          (Validation)   (0x8a2878...)
```

### Key Integration Files

**Frontend (Web):**
- `src/types/nft.ts` - TypeScript types with blockchain fields (tokenId, contractAddress)
- `src/data/nftData.ts` - NFT metadata mapped to minted tokens
- `src/services/nftMappingService.ts` - Token ID to NFT data mapping
- `src/api/endpoints/nftVerification.ts` - GameServer API integration

**Backend (GameServer - for reference):**
- `Services/NFTValidationService.cs` - Immutable API integration
- `Controllers/NFTController.cs` - NFT endpoints
- `Controllers/CharacterController.cs` - Character creation with NFT validation

### API Endpoints

**Validate NFTs for Character Creation:**
```typescript
GET /api/nft/validate-nfts
Authorization: Bearer <JWT>

Response: {
  canCreateCharacter: boolean,
  ownedTiers: Array<{
    tier: number,
    tokenId: string,
    contractAddress: string,
    metadata: { ... }
  }>,
  missingRequirements: string[],
  availableCharacterSlots: number
}
```

**Get NFT Inventory:**
```typescript
GET /api/nft/inventory
Authorization: Bearer <JWT>

Response: {
  success: boolean,
  walletAddress: string,
  ownedNFTs: Array<{
    tokenId: string,
    tier: number,
    name: string,
    isUsedForCharacter: boolean,
    associatedCharacterId: number | null
  }>,
  totalNFTs: number,
  hasRequiredNFTs: boolean,
  availableCharacterSlots: number
}
```

**Character Creation with NFT Validation:**
```typescript
POST /api/character/create
Authorization: Bearer <JWT>
Content-Type: application/json

Request: {
  characterName: string,
  selectedTier1NFT: string,  // Token ID
  selectedTier2NFT: string,  // Token ID
  selectedTier3NFT: string | null,
  ...
}

Response: {
  success: boolean,
  characterId: string,
  summary: { ... }
}
```

### NFT Mapping Service

The `nftMappingService` provides utilities for working with blockchain NFTs:

```typescript
import {
  getNFTByTokenId,
  mapBlockchainNFTToUIData,
  enrichNFTWithOwnership,
  verifyCharacterCreationRequirements,
  getTokenExplorerUrl
} from '@/services/nftMappingService';

// Get NFT data by token ID
const nft = getNFTByTokenId('1'); // Returns Coordinator License data

// Map blockchain response to UI data
const uiNFT = mapBlockchainNFTToUIData(blockchainNFT);

// Check ownership and availability
const ownedNFTs = getAllNFTsWithOwnership(ownedTokenIds, usedNFTs);

// Verify character creation requirements
const verification = verifyCharacterCreationRequirements(ownedTokenIds);
```

### Test Wallet Integration

**Test Wallet:** `0xe06b48766c74a65414836b5c97d905d4dd21cece`

This wallet owns:
- Token 1 (Coordinator)
- Token 2 (Guardian)
- Token 5 (Biochem)
- Token 6 (Divine)

For testing instructions, see: `G:\Code\pw-asb-serverfarm\TESTING_INSTRUCTIONS.md`

## Support

For questions or issues with the NFT system:
1. Check the NFT overview page in-app
2. Review this README
3. Check the Codex for lore and mechanics details
4. Consult the main game documentation

## Related Documentation

- `CODEX_CACHE_README.md` - Caching system documentation
- `src/types/nft.ts` - Complete TypeScript type definitions
- `src/data/nftData.ts` - Full NFT data catalog
