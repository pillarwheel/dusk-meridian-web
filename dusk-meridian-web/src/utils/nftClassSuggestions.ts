/**
 * NFT to Character Class Suggestions Mapping
 * Based on Dusk Meridian character template specifications
 */

export interface ClassSuggestion {
  id: string;
  name: string;
  description: string;
  role: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  requiredNFTs: {
    tier1: string[];
    tier2: string[];
    tier3?: string[];
  };
  primarySkills: string[];
  secondarySkills: string[];
  playstyle: string;
}

// Tier 1 NFT Types
export const TIER1_NFTS = {
  GUARDIAN: 'guardian',
  STRIKER: 'striker',
  SPECIALIST: 'specialist',
  COORDINATOR: 'coordinator'
};

// Tier 2 NFT Types
export const TIER2_NFTS = {
  MARTIAL_ARTIST: 'martial_artist',
  SPELLCASTER: 'spellcaster',
  TECHNICIAN: 'technician',
  DIVINE_CHANNELER: 'divine_channeler',
  NATURE_WALKER: 'nature_walker',
  PSION: 'psion'
};

// All character class templates with NFT requirements
export const CHARACTER_TEMPLATES: ClassSuggestion[] = [
  // COMBAT-FOCUSED
  {
    id: 'knight_guardian',
    name: 'Knight-Guardian',
    description: 'Tank and protector specializing in defensive combat and leadership',
    role: 'Tank/Protector',
    difficulty: 'Beginner',
    requiredNFTs: {
      tier1: [TIER1_NFTS.GUARDIAN],
      tier2: [TIER2_NFTS.MARTIAL_ARTIST]
    },
    primarySkills: ['Swordsmanship', 'Combat Strategy', 'First Aid', 'Leadership', 'Patrolling'],
    secondarySkills: ['Blacksmithing (Weapons)', 'Home Repair'],
    playstyle: 'Defensive frontline fighter who protects allies and controls the battlefield'
  },
  {
    id: 'blade_master',
    name: 'Blade Master',
    description: 'Melee damage dealer with expert swordplay and martial prowess',
    role: 'Striker/Melee DPS',
    difficulty: 'Beginner',
    requiredNFTs: {
      tier1: [TIER1_NFTS.STRIKER],
      tier2: [TIER2_NFTS.MARTIAL_ARTIST]
    },
    primarySkills: ['Swordsmanship', 'Martial Arts (Unarmed)', 'Combat Strategy', 'Survival', 'Tracking'],
    secondarySkills: ['Blacksmithing (Weapons)', 'Meditation'],
    playstyle: 'Aggressive close-range combatant focused on dealing maximum damage'
  },
  {
    id: 'ranger_scout',
    name: 'Ranger-Scout',
    description: 'Ranged striker with exceptional tracking and wilderness survival skills',
    role: 'Striker/Ranged',
    difficulty: 'Beginner',
    requiredNFTs: {
      tier1: [TIER1_NFTS.STRIKER],
      tier2: [TIER2_NFTS.MARTIAL_ARTIST]
    },
    primarySkills: ['Archery', 'Tracking', 'Survival', 'Trapping', 'Hunting'],
    secondarySkills: ['Fishing', 'Navigation', 'Herbalism'],
    playstyle: 'Long-range combatant who excels in wilderness environments'
  },
  {
    id: 'martial_adept',
    name: 'Martial Adept',
    description: 'Mobile striker combining physical martial arts with mental discipline',
    role: 'Striker/Mobility',
    difficulty: 'Intermediate',
    requiredNFTs: {
      tier1: [TIER1_NFTS.STRIKER],
      tier2: [TIER2_NFTS.MARTIAL_ARTIST, TIER2_NFTS.PSION]
    },
    primarySkills: ['Martial Arts (Staff)', 'Martial Arts (Unarmed)', 'Meditation', 'Combat Strategy', 'Survival'],
    secondarySkills: ['Herbalism', 'First Aid'],
    playstyle: 'Highly mobile melee fighter using mind-body connection for enhanced combat'
  },

  // MAGIC-FOCUSED
  {
    id: 'elemental_wizard',
    name: 'Elemental Wizard',
    description: 'Offensive spellcaster specializing in elemental magic and destruction',
    role: 'Caster/Damage',
    difficulty: 'Intermediate',
    requiredNFTs: {
      tier1: [TIER1_NFTS.STRIKER],
      tier2: [TIER2_NFTS.SPELLCASTER]
    },
    primarySkills: ['Spellcasting', 'Spell Weaving', 'Meditation', 'Science', 'Enchanting'],
    secondarySkills: ['Alchemy', 'Herbalism'],
    playstyle: 'Powerful ranged magic user dealing devastating elemental damage'
  },
  {
    id: 'battle_cleric',
    name: 'Battle Cleric',
    description: 'Support healer who can also hold their own in melee combat',
    role: 'Coordinator/Healer',
    difficulty: 'Intermediate',
    requiredNFTs: {
      tier1: [TIER1_NFTS.COORDINATOR],
      tier2: [TIER2_NFTS.DIVINE_CHANNELER]
    },
    primarySkills: ['Healing Magic', 'Spellcasting', 'First Aid', 'Medicine', 'Leadership'],
    secondarySkills: ['Meditation', 'Herbalism', 'Swordsmanship'],
    playstyle: 'Versatile support character keeping allies alive while contributing to combat'
  },
  {
    id: 'druid_shaman',
    name: 'Druid-Shaman',
    description: 'Nature magic specialist with healing and animal companion abilities',
    role: 'Specialist/Nature',
    difficulty: 'Advanced',
    requiredNFTs: {
      tier1: [TIER1_NFTS.SPECIALIST],
      tier2: [TIER2_NFTS.NATURE_WALKER, TIER2_NFTS.SPELLCASTER]
    },
    primarySkills: ['Healing Magic', 'Herbalism', 'Animal Taming', 'Spellcasting', 'Survival'],
    secondarySkills: ['Meditation', 'Farming', 'Fishing'],
    playstyle: 'Versatile nature caster with healing, buffs, and pet companions'
  },
  {
    id: 'arcane_enchanter',
    name: 'Arcane Enchanter',
    description: 'Utility spellcaster focused on item enhancement and magical crafting',
    role: 'Specialist/Utility',
    difficulty: 'Advanced',
    requiredNFTs: {
      tier1: [TIER1_NFTS.SPECIALIST],
      tier2: [TIER2_NFTS.SPELLCASTER, TIER2_NFTS.TECHNICIAN]
    },
    primarySkills: ['Enchanting', 'Runecrafting', 'Spellcasting', 'Spell Weaving', 'Science'],
    secondarySkills: ['Alchemy', 'Engineering', 'Meditation'],
    playstyle: 'Support crafter creating powerful magical items and enhancements'
  },

  // TECHNICAL-FOCUSED
  {
    id: 'engineer_artificer',
    name: 'Engineer-Artificer',
    description: 'Technical specialist creating gadgets, traps, and mechanical devices',
    role: 'Specialist/Technical',
    difficulty: 'Beginner',
    requiredNFTs: {
      tier1: [TIER1_NFTS.SPECIALIST],
      tier2: [TIER2_NFTS.TECHNICIAN]
    },
    primarySkills: ['Engineering', 'Science', 'Blacksmithing (Tools)', 'Lockpicking', 'Carpentry'],
    secondarySkills: ['Mining', 'Alchemy', 'Trapping'],
    playstyle: 'Technical expert building and repairing equipment for the settlement'
  },
  {
    id: 'airship_pilot',
    name: 'Airship Pilot',
    description: 'Transport specialist combining technical and combat skills',
    role: 'Specialist/Transport',
    difficulty: 'Advanced',
    requiredNFTs: {
      tier1: [TIER1_NFTS.SPECIALIST],
      tier2: [TIER2_NFTS.TECHNICIAN, TIER2_NFTS.MARTIAL_ARTIST]
    },
    primarySkills: ['Navigation', 'Engineering', 'Science', 'Survival', 'Leadership'],
    secondarySkills: ['Combat Strategy', 'Tracking', 'Negotiation'],
    playstyle: 'Versatile specialist focused on airship operation and long-distance travel'
  },
  {
    id: 'alchemist_apothecary',
    name: 'Alchemist-Apothecary',
    description: 'Potion crafter specializing in consumables and medicine',
    role: 'Specialist/Crafter',
    difficulty: 'Intermediate',
    requiredNFTs: {
      tier1: [TIER1_NFTS.SPECIALIST],
      tier2: [TIER2_NFTS.SPELLCASTER]
    },
    primarySkills: ['Alchemy', 'Herbalism', 'Medicine', 'Science', 'Brewing'],
    secondarySkills: ['Cooking', 'Farming', 'First Aid'],
    playstyle: 'Support crafter creating potions, elixirs, and medicinal compounds'
  },

  // HYBRID & SUPPORT
  {
    id: 'paladin',
    name: 'Paladin',
    description: 'Holy warrior combining martial prowess with divine healing magic',
    role: 'Guardian/Healer Hybrid',
    difficulty: 'Advanced',
    requiredNFTs: {
      tier1: [TIER1_NFTS.GUARDIAN],
      tier2: [TIER2_NFTS.MARTIAL_ARTIST, TIER2_NFTS.DIVINE_CHANNELER]
    },
    primarySkills: ['Swordsmanship', 'Healing Magic', 'Leadership', 'Combat Strategy', 'First Aid'],
    secondarySkills: ['Meditation', 'Diplomacy'],
    playstyle: 'Versatile tank who can protect and heal allies simultaneously'
  },
  {
    id: 'bard_diplomat',
    name: 'Bard-Diplomat',
    description: 'Social coordinator with magic or divine support abilities',
    role: 'Coordinator/Social',
    difficulty: 'Intermediate',
    requiredNFTs: {
      tier1: [TIER1_NFTS.COORDINATOR],
      tier2: [TIER2_NFTS.SPELLCASTER, TIER2_NFTS.DIVINE_CHANNELER] // OR logic
    },
    primarySkills: ['Leadership', 'Negotiation', 'Diplomacy', 'Healing Magic', 'Spellcasting'],
    secondarySkills: ['Herbalism', 'Cooking', 'Medicine'],
    playstyle: 'Social support character excelling in negotiation and party buffs'
  },
  {
    id: 'beast_tamer_ranger',
    name: 'Beast Tamer-Ranger',
    description: 'Pet master combining nature magic with ranged combat',
    role: 'Specialist/Pet Master',
    difficulty: 'Advanced',
    requiredNFTs: {
      tier1: [TIER1_NFTS.SPECIALIST],
      tier2: [TIER2_NFTS.NATURE_WALKER, TIER2_NFTS.MARTIAL_ARTIST]
    },
    primarySkills: ['Animal Taming', 'Animal Husbandry', 'Archery', 'Tracking', 'Survival'],
    secondarySkills: ['Fishing', 'Herbalism', 'Leadership'],
    playstyle: 'Ranged fighter with animal companions providing utility and damage'
  },
  {
    id: 'shadow_assassin',
    name: 'Shadow Assassin',
    description: 'Stealth striker specializing in assassination and infiltration',
    role: 'Striker/Stealth',
    difficulty: 'Intermediate',
    requiredNFTs: {
      tier1: [TIER1_NFTS.STRIKER],
      tier2: [TIER2_NFTS.MARTIAL_ARTIST]
    },
    primarySkills: ['Swordsmanship', 'Lockpicking', 'Tracking', 'Trapping', 'Survival'],
    secondarySkills: ['Alchemy', 'Herbalism', 'Navigation'],
    playstyle: 'Stealth damage dealer excelling at single-target elimination'
  },

  // CRAFTING & ECONOMIC
  {
    id: 'master_blacksmith',
    name: 'Master Blacksmith',
    description: 'Elite weapons and tools crafter',
    role: 'Specialist/Crafter',
    difficulty: 'Beginner',
    requiredNFTs: {
      tier1: [TIER1_NFTS.SPECIALIST],
      tier2: [TIER2_NFTS.TECHNICIAN]
    },
    primarySkills: ['Blacksmithing (Weapons)', 'Blacksmithing (Tools)', 'Mining', 'Engineering', 'Carpentry'],
    secondarySkills: ['Combat Strategy'],
    playstyle: 'Crafting specialist focused on metalworking and tool creation'
  },
  {
    id: 'shopkeeper',
    name: 'Shopkeeper',
    description: 'Economic specialist managing trade and commerce',
    role: 'Specialist/Economic',
    difficulty: 'Beginner',
    requiredNFTs: {
      tier1: [TIER1_NFTS.SPECIALIST],
      tier2: [] // Only requires Tier 1 - most accessible
    },
    primarySkills: ['Negotiation', 'Leadership', 'Appraisal', 'Cooking', 'Brewing'],
    secondarySkills: ['Baking', 'Sewing', 'Carpentry'],
    playstyle: 'Merchant focused on trade, crafting basic goods, and settlement economy'
  },
  {
    id: 'farmer_homesteader',
    name: 'Farmer-Homesteader',
    description: 'Agriculture and settlement building specialist',
    role: 'Specialist/Settlement',
    difficulty: 'Beginner',
    requiredNFTs: {
      tier1: [TIER1_NFTS.SPECIALIST],
      tier2: [TIER2_NFTS.NATURE_WALKER]
    },
    primarySkills: ['Farming', 'Animal Husbandry', 'Herbalism', 'Cooking', 'Home Repair'],
    secondarySkills: ['Fishing', 'Carpentry', 'Survival'],
    playstyle: 'Settlement builder focused on food production and infrastructure'
  }
];

/**
 * Get class suggestions based on selected NFTs
 * Simplified version that shows relevant templates based on which tiers are selected
 */
export function getClassSuggestions(selectedNFTs: {
  tier1?: string;
  tier2?: string;
  tier3?: string;
  tier4?: string;
}): ClassSuggestion[] {
  // If no Tier 1 selected, return empty (Tier 1 is always required)
  if (!selectedNFTs.tier1) {
    return [];
  }

  const suggestions: Array<ClassSuggestion & { matchScore: number }> = [];

  // Count how many tiers the user has selected
  const selectedTierCount = [
    selectedNFTs.tier1,
    selectedNFTs.tier2,
    selectedNFTs.tier3,
    selectedNFTs.tier4
  ].filter(Boolean).length;

  for (const template of CHARACTER_TEMPLATES) {
    let matchScore = 0;

    // Calculate required tier count for this template
    const requiredTierCount =
      (template.requiredNFTs.tier1.length > 0 ? 1 : 0) +
      (template.requiredNFTs.tier2.length > 0 ? 1 : 0) +
      (template.requiredNFTs.tier3 && template.requiredNFTs.tier3.length > 0 ? 1 : 0);

    // Base score - all templates get shown since we can't determine NFT types yet
    matchScore = 50;

    // Prefer templates that match the number of tiers selected
    if (requiredTierCount === selectedTierCount) {
      matchScore += 30; // Perfect tier count match
    } else if (requiredTierCount < selectedTierCount) {
      matchScore += 20; // Template requires fewer tiers (user has extras)
    } else {
      matchScore += 10; // Template requires more tiers (user needs more)
    }

    // Bonus for having Tier 2 (most builds need it)
    if (selectedNFTs.tier2 && template.requiredNFTs.tier2.length > 0) {
      matchScore += 15;
    }

    // Bonus for having Tier 3 (advanced builds)
    if (selectedNFTs.tier3 && template.requiredNFTs.tier3 && template.requiredNFTs.tier3.length > 0) {
      matchScore += 25;
    }

    // Bonus for beginner-friendly builds when only Tier 1 selected
    if (selectedTierCount === 1 && template.difficulty === 'Beginner') {
      matchScore += 10;
    }

    // Special case: Shopkeeper is always relevant (only needs Tier 1)
    if (template.id === 'shopkeeper') {
      matchScore += 5;
    }

    suggestions.push({ ...template, matchScore });
  }

  // Sort by match score (highest first), then by difficulty (beginner first)
  return suggestions
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      const difficultyOrder = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2 };
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    })
    .slice(0, 6) // Return top 6 suggestions
    .map(({ matchScore, ...suggestion }) => suggestion);
}

/**
 * Check if selected NFTs exactly match a template's requirements
 */
export function getExactMatch(
  selectedNFTs: { tier1?: string; tier2?: string; tier3?: string; tier4?: string },
  template: ClassSuggestion
): boolean {
  // This is a simplified check - production would validate against actual NFT metadata
  const hasTier1 = !!selectedNFTs.tier1;
  const hasTier2 = !!selectedNFTs.tier2;
  const hasTier3 = !!selectedNFTs.tier3;

  const needsTier1 = template.requiredNFTs.tier1.length > 0;
  const needsTier2 = template.requiredNFTs.tier2.length > 0;
  const needsTier3 = template.requiredNFTs.tier3 && template.requiredNFTs.tier3.length > 0;

  return (needsTier1 === hasTier1) &&
         (needsTier2 === hasTier2) &&
         (!needsTier3 || needsTier3 === hasTier3);
}
