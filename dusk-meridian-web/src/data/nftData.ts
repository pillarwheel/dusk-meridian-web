import type { Tier1RoleNFT, Tier2PowerSourceNFT, Tier3SpecializationNFT, NFTCollection } from '@/types/nft';

/**
 * Complete NFT data for Dusk Meridian
 */

// Tier 1: Role License NFTs
export const tier1RoleNFTs: Tier1RoleNFT[] = [
  {
    id: 'role-guardian',
    tier: 1,
    name: 'Guardian License NFT',
    roleType: 'guardian',
    description: 'Tank and Protector role license',
    imagePath: '/Images/NFTs/Tier1/dusk_meridian-nft-tier1-guardian-v1.png',
    soulbound: true,
    requiredForCharacter: true,
    roleDescription: 'Guardians stand as the first line of defense, absorbing damage and protecting allies from harm.',
    playstyle: 'Defensive tank with high survivability',
    primaryFunction: 'Protect allies, control enemy positioning, absorb damage',
    // Minted NFT details
    tokenId: '2',
    contractAddress: '0x8a287861D4138e50Dd6126905FB606617b49dc50',
    metadata: {
      strength: 16,
      agility: 10,
      constitution: 18,
      intelligence: 12,
      wisdom: 14,
      charisma: 12
    }
  },
  {
    id: 'role-striker',
    tier: 1,
    name: 'Striker License NFT',
    roleType: 'striker',
    description: 'Damage Dealer role license',
    imagePath: '/Images/NFTs/Tier1/dusk_meridian-nft-tier1-striker-v1.png',
    soulbound: true,
    requiredForCharacter: true,
    roleDescription: 'Strikers excel at dealing massive damage to eliminate threats quickly and efficiently.',
    playstyle: 'High damage output, aggressive combat',
    primaryFunction: 'Eliminate high-priority targets, deal burst damage',
    metadata: {
      strength: 16,
      agility: 16,
      constitution: 12,
      intelligence: 12,
      wisdom: 10,
      charisma: 12
    }
  },
  {
    id: 'role-specialist',
    tier: 1,
    name: 'Specialist License NFT',
    roleType: 'specialist',
    description: 'Utility and Technical role license',
    imagePath: '/Images/NFTs/Tier1/dusk_meridian-nft-tier1-specialist-v1.png',
    soulbound: true,
    requiredForCharacter: true,
    roleDescription: 'Specialists provide unique utility, control, and technical solutions to complex problems.',
    playstyle: 'Versatile problem-solver with crowd control',
    primaryFunction: 'Crowd control, debuffing, utility support',
    metadata: {
      strength: 12,
      agility: 14,
      constitution: 12,
      intelligence: 16,
      wisdom: 14,
      charisma: 14
    }
  },
  {
    id: 'role-coordinator',
    tier: 1,
    name: 'Coordinator License NFT',
    roleType: 'coordinator',
    description: 'Support and Leadership role license',
    imagePath: '/Images/NFTs/Tier1/dusk_meridian-nft-tier1-coordinator-v1.png',
    soulbound: true,
    requiredForCharacter: true,
    roleDescription: 'Coordinators enhance allies through healing, buffs, and tactical leadership.',
    playstyle: 'Support and enhancement focus',
    primaryFunction: 'Heal allies, provide buffs, coordinate tactics',
    // Minted NFT details
    tokenId: '1',
    contractAddress: '0x8a287861D4138e50Dd6126905FB606617b49dc50',
    metadata: {
      strength: 10,
      agility: 12,
      constitution: 14,
      intelligence: 14,
      wisdom: 18,
      charisma: 16
    }
  }
];

// Tier 2: Power Source Certification NFTs
export const tier2PowerSourceNFTs: Tier2PowerSourceNFT[] = [
  {
    id: 'power-spellcaster',
    tier: 2,
    name: 'Spellcaster Certification NFT',
    powerSource: 'magic',
    description: 'Mastery of arcane magic and elemental forces',
    imagePath: '/Images/NFTs/Tier2/dusk_meridian-nft-tier2-magic-v1.png',
    tradeable: true,
    compatibleRoles: ['guardian', 'striker', 'specialist', 'coordinator'],
    compatibleWorlds: ['fantasy', 'modern_magic', 'post_apocalyptic'],
    unlockCategories: ['elemental', 'enchantment', 'healing', 'protection'],
    specializations: [
      'Pyromancer', 'Cryomancer', 'Electromancer', 'Geomancer',
      'Hydromancer', 'Aeromancer', 'Necromancer', 'Illusionist',
      'Conjurer', 'Abjurer', 'Arcanist', 'Etherialist', 'Healer',
      'Alchemist', 'Dracomancer', 'Lumimancer', 'Spatiomancer'
    ],
    signatureAbilities: ['spell_casting', 'mana_manipulation', 'arcane_knowledge'],
    metadata: {
      strength: 10,
      agility: 12,
      constitution: 14,
      intelligence: 18,
      wisdom: 16,
      charisma: 14
    }
  },
  {
    id: 'power-biochem',
    tier: 2,
    name: 'Biochem Certification NFT',
    powerSource: 'biochem',
    description: 'Mastery of biological augmentation and chemical enhancement',
    imagePath: '/Images/NFTs/Tier2/dusk_meridian-nft-tier2-biochem-v1.png',
    tradeable: true,
    compatibleRoles: ['guardian', 'striker', 'specialist', 'coordinator'],
    compatibleWorlds: ['modern', 'sci_fi', 'cyberpunk', 'post_apocalyptic'],
    unlockCategories: ['bio_augmentation', 'chemical_enhancement', 'mutation', 'regeneration'],
    specializations: [
      'Bio-Engineer', 'Mutant', 'Gene-Mod', 'Biochemist', 'Symbiote'
    ],
    signatureAbilities: ['bio_augmentation', 'chemical_synthesis', 'mutation_control'],
    // Minted NFT details
    tokenId: '5',
    contractAddress: '0x8a287861D4138e50Dd6126905FB606617b49dc50',
    metadata: {
      strength: 14,
      agility: 14,
      constitution: 16,
      intelligence: 16,
      wisdom: 12,
      charisma: 12
    }
  },
  {
    id: 'power-martial-artist',
    tier: 2,
    name: 'Martial Artist Certification NFT',
    powerSource: 'martial_arts',
    description: 'Mastery of physical combat and weapon techniques',
    imagePath: '/Images/NFTs/Tier2/dusk_meridian-nft-tier2-martial_arts-v1.png',
    tradeable: true,
    compatibleRoles: ['guardian', 'striker', 'specialist', 'coordinator'],
    compatibleWorlds: ['fantasy', 'modern', 'sci_fi', 'post_apocalyptic'],
    unlockCategories: ['melee_combat', 'weapon_mastery', 'physical_enhancement', 'combat_techniques'],
    specializations: [
      'Bladedancer', 'Monk', 'Weapon Master', 'Berserker', 'Duelist'
    ],
    signatureAbilities: ['weapon_mastery', 'physical_prowess', 'combat_reflexes'],
    metadata: {
      strength: 18,
      agility: 16,
      constitution: 16,
      intelligence: 10,
      wisdom: 12,
      charisma: 12
    }
  },
  {
    id: 'power-technician',
    tier: 2,
    name: 'Technician Certification NFT',
    powerSource: 'tech',
    description: 'Mastery of technology, gadgets, and hacking',
    imagePath: '/Images/NFTs/Tier2/dusk_meridian-nft-tier2-tech-v1.png',
    tradeable: true,
    compatibleRoles: ['guardian', 'striker', 'specialist', 'coordinator'],
    compatibleWorlds: ['modern', 'sci_fi', 'cyberpunk', 'post_apocalyptic'],
    unlockCategories: ['tech_gadgets', 'hacking', 'robotics', 'engineering'],
    specializations: [
      'Technomancer', 'Hacker', 'Engineer', 'Gadgeteer', 'Mechanic'
    ],
    signatureAbilities: ['tech_manipulation', 'system_hacking', 'gadget_crafting'],
    metadata: {
      strength: 12,
      agility: 14,
      constitution: 12,
      intelligence: 18,
      wisdom: 14,
      charisma: 12
    }
  },
  {
    id: 'power-divine-channeler',
    tier: 2,
    name: 'Divine Channeler Certification NFT',
    powerSource: 'divine',
    description: 'Channel divine power through faith and devotion',
    imagePath: '/Images/NFTs/Tier2/dusk_meridian-nft-tier2-divine-v1.png',
    tradeable: true,
    compatibleRoles: ['guardian', 'striker', 'specialist', 'coordinator'],
    compatibleWorlds: ['fantasy', 'modern_magic', 'post_apocalyptic'],
    unlockCategories: ['divine_magic', 'healing', 'protection', 'smiting'],
    specializations: [
      'Cleric', 'Paladin', 'Priest', 'Divine Warrior', 'Exorcist'
    ],
    signatureAbilities: ['divine_channeling', 'faith_healing', 'holy_protection'],
    // Minted NFT details
    tokenId: '6',
    contractAddress: '0x8a287861D4138e50Dd6126905FB606617b49dc50',
    metadata: {
      strength: 14,
      agility: 10,
      constitution: 14,
      intelligence: 14,
      wisdom: 18,
      charisma: 16
    }
  },
  {
    id: 'power-nature-walker',
    tier: 2,
    name: 'Nature Walker Certification NFT',
    powerSource: 'nature',
    description: 'Harness primal forces and commune with nature',
    imagePath: '/Images/NFTs/Tier2/dusk_meridian-nft-tier2-nature-v1.png',
    tradeable: true,
    compatibleRoles: ['guardian', 'striker', 'specialist', 'coordinator'],
    compatibleWorlds: ['fantasy', 'modern_magic', 'post_apocalyptic'],
    unlockCategories: ['primal_magic', 'shapeshifting', 'animal_companion', 'natural_healing'],
    specializations: [
      'Druid', 'Ranger', 'Shaman', 'Beast Master', 'Wildshaper'
    ],
    signatureAbilities: ['nature_magic', 'animal_bond', 'primal_fury'],
    metadata: {
      strength: 14,
      agility: 14,
      constitution: 16,
      intelligence: 12,
      wisdom: 16,
      charisma: 14
    }
  },
  {
    id: 'power-psion',
    tier: 2,
    name: 'Psion Certification NFT',
    powerSource: 'psionic',
    description: 'Unlock mental powers and psychic abilities',
    imagePath: '/Images/NFTs/Tier2/dusk_meridian-nft-tier2-psionic-v1.png',
    tradeable: true,
    compatibleRoles: ['guardian', 'striker', 'specialist', 'coordinator'],
    compatibleWorlds: ['fantasy', 'modern', 'sci_fi', 'cyberpunk'],
    unlockCategories: ['telepathy', 'telekinesis', 'mind_control', 'psychic_defense'],
    specializations: [
      'Telepath', 'Telekinetic', 'Mind Blade', 'Psyker', 'Mental Fortress'
    ],
    signatureAbilities: ['mental_powers', 'psychic_manipulation', 'mind_fortress'],
    metadata: {
      strength: 10,
      agility: 12,
      constitution: 12,
      intelligence: 18,
      wisdom: 16,
      charisma: 14
    }
  }
];

// Tier 3: Specialization NFTs (Spellcaster-focused for existing artwork)
export const tier3SpecializationNFTs: Tier3SpecializationNFT[] = [
  {
    id: 'spec-pyromancer',
    tier: 3,
    name: 'Pyromancer Specialization',
    specializationType: 'elemental_fire',
    description: 'Master of fire magic and destructive flames',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-pyromancer.png',
    tradeable: true,
    requiredRole: ['striker', 'specialist'],
    requiredPowerSource: 'magic',
    rarity: 'rare',
    signatureAbilities: ['fireball', 'flame_burst', 'inferno', 'fire_shield'],
    loreDescription: 'Pyromancers wield the destructive power of fire, channeling flames to incinerate their foes. Masters of this art can summon infernos that consume entire battlefields.',
    worldAdaptation: {
      fantasy: 'Fire Mage',
      sci_fi: 'Plasma Specialist',
      modern: 'Thermal Manipulator'
    },
    metadata: {
      strength: 12,
      agility: 14,
      constitution: 12,
      intelligence: 18,
      wisdom: 14,
      charisma: 14
    }
  },
  {
    id: 'spec-cryomancer',
    tier: 3,
    name: 'Cryomancer Specialization',
    specializationType: 'elemental_ice',
    description: 'Master of ice magic and frozen control',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-cryomancer.png',
    tradeable: true,
    requiredRole: ['guardian', 'striker', 'specialist', 'coordinator'],
    requiredPowerSource: 'magic',
    rarity: 'rare',
    signatureAbilities: ['ice_lance', 'frozen_prison', 'blizzard', 'frost_armor'],
    loreDescription: 'Cryomancers command the power of absolute zero, freezing enemies solid and controlling the battlefield with icy terrain.',
    worldAdaptation: {
      fantasy: 'Ice Mage',
      sci_fi: 'Cryo Specialist',
      modern: 'Thermal Dampener'
    },
    metadata: {
      strength: 10,
      agility: 12,
      constitution: 14,
      intelligence: 18,
      wisdom: 16,
      charisma: 14
    }
  },
  {
    id: 'spec-electromancer',
    tier: 3,
    name: 'Electromancer Specialization',
    specializationType: 'elemental_lightning',
    description: 'Master of lightning and electrical energy',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-electromancer.png',
    tradeable: true,
    requiredRole: ['striker', 'specialist'],
    requiredPowerSource: 'magic',
    rarity: 'rare',
    signatureAbilities: ['lightning_bolt', 'chain_lightning', 'thunderstorm', 'electric_field'],
    loreDescription: 'Electromancers harness the raw power of lightning, striking with the speed and fury of a storm.',
    worldAdaptation: {
      fantasy: 'Storm Mage',
      sci_fi: 'Energy Manipulator',
      modern: 'Electric Controller'
    },
    metadata: {
      strength: 10,
      agility: 16,
      constitution: 12,
      intelligence: 18,
      wisdom: 14,
      charisma: 14
    }
  },
  {
    id: 'spec-geomancer',
    tier: 3,
    name: 'Geomancer Specialization',
    specializationType: 'elemental_earth',
    description: 'Master of earth magic and stone manipulation',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-geomancer.png',
    tradeable: true,
    requiredRole: ['guardian', 'specialist'],
    requiredPowerSource: 'magic',
    rarity: 'rare',
    signatureAbilities: ['stone_wall', 'earthquake', 'rock_armor', 'earth_spike'],
    loreDescription: 'Geomancers command the solid earth itself, raising stone walls and causing earthquakes to reshape the battlefield.',
    worldAdaptation: {
      fantasy: 'Earth Mage',
      sci_fi: 'Geo-kinetic',
      modern: 'Seismic Controller'
    },
    metadata: {
      strength: 14,
      agility: 10,
      constitution: 18,
      intelligence: 16,
      wisdom: 16,
      charisma: 12
    }
  },
  {
    id: 'spec-hydromancer',
    tier: 3,
    name: 'Hydromancer Specialization',
    specializationType: 'elemental_water',
    description: 'Master of water magic and fluid manipulation',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-hydromancer.png',
    tradeable: true,
    requiredRole: ['coordinator', 'specialist'],
    requiredPowerSource: 'magic',
    rarity: 'rare',
    signatureAbilities: ['water_blast', 'healing_rain', 'tidal_wave', 'water_shield'],
    loreDescription: 'Hydromancers flow like water, adapting to any situation with healing waves and crushing tides.',
    worldAdaptation: {
      fantasy: 'Water Mage',
      sci_fi: 'Hydro Specialist',
      modern: 'Fluid Manipulator'
    },
    metadata: {
      strength: 12,
      agility: 14,
      constitution: 14,
      intelligence: 16,
      wisdom: 18,
      charisma: 14
    }
  },
  {
    id: 'spec-aeromancer',
    tier: 3,
    name: 'Aeromancer Specialization',
    specializationType: 'elemental_air',
    description: 'Master of air magic and wind manipulation',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-aeromancer.png',
    tradeable: true,
    requiredRole: ['striker', 'specialist'],
    requiredPowerSource: 'magic',
    rarity: 'rare',
    signatureAbilities: ['wind_blade', 'tornado', 'flight', 'air_shield'],
    loreDescription: 'Aeromancers ride the winds, striking with the speed of a gale and the freedom of the open sky.',
    worldAdaptation: {
      fantasy: 'Wind Mage',
      sci_fi: 'Aero-kinetic',
      modern: 'Wind Controller'
    },
    metadata: {
      strength: 10,
      agility: 18,
      constitution: 12,
      intelligence: 16,
      wisdom: 14,
      charisma: 14
    }
  },
  {
    id: 'spec-necromancer',
    tier: 3,
    name: 'Necromancer Specialization',
    specializationType: 'death_magic',
    description: 'Master of death magic and undead armies',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-necromancer.png',
    tradeable: true,
    requiredRole: ['specialist', 'coordinator'],
    requiredPowerSource: 'magic',
    rarity: 'epic',
    signatureAbilities: ['raise_undead', 'death_bolt', 'life_drain', 'bone_shield'],
    loreDescription: 'Necromancers command the power of death itself, raising armies of undead and draining life from their foes.',
    worldAdaptation: {
      fantasy: 'Death Mage',
      sci_fi: 'Necrotic Technician',
      modern: 'Entropy Manipulator'
    },
    metadata: {
      strength: 10,
      agility: 12,
      constitution: 14,
      intelligence: 18,
      wisdom: 16,
      charisma: 12
    }
  },
  {
    id: 'spec-illusionist',
    tier: 3,
    name: 'Illusionist Specialization',
    specializationType: 'illusion_magic',
    description: 'Master of illusions and deception',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-illusionist.png',
    tradeable: true,
    requiredRole: ['specialist'],
    requiredPowerSource: 'magic',
    rarity: 'rare',
    signatureAbilities: ['invisibility', 'mirror_image', 'phantasmal_force', 'confuse'],
    loreDescription: 'Illusionists bend reality itself, creating deceptions so real they can harm or heal.',
    worldAdaptation: {
      fantasy: 'Illusion Mage',
      sci_fi: 'Holographic Specialist',
      modern: 'Perception Manipulator'
    },
    metadata: {
      strength: 8,
      agility: 16,
      constitution: 10,
      intelligence: 18,
      wisdom: 14,
      charisma: 18
    }
  },
  {
    id: 'spec-conjurer',
    tier: 3,
    name: 'Conjurer Specialization',
    specializationType: 'summoning_magic',
    description: 'Master of summoning and conjuration',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-conjurer.png',
    tradeable: true,
    requiredRole: ['specialist', 'coordinator'],
    requiredPowerSource: 'magic',
    rarity: 'rare',
    signatureAbilities: ['summon_creature', 'conjure_weapon', 'portal', 'familiar'],
    loreDescription: 'Conjurers bring forth allies and weapons from other planes, never fighting alone.',
    worldAdaptation: {
      fantasy: 'Summoner',
      sci_fi: 'Dimensional Caller',
      modern: 'Reality Bender'
    },
    metadata: {
      strength: 10,
      agility: 12,
      constitution: 12,
      intelligence: 18,
      wisdom: 16,
      charisma: 16
    }
  },
  {
    id: 'spec-abjurer',
    tier: 3,
    name: 'Abjurer Specialization',
    specializationType: 'protection_magic',
    description: 'Master of protective wards and barriers',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-abjurer.png',
    tradeable: true,
    requiredRole: ['guardian', 'coordinator'],
    requiredPowerSource: 'magic',
    rarity: 'rare',
    signatureAbilities: ['magic_shield', 'dispel_magic', 'ward', 'counterspell'],
    loreDescription: 'Abjurers specialize in protection, weaving magical barriers that can withstand even the mightiest attacks.',
    worldAdaptation: {
      fantasy: 'Ward Mage',
      sci_fi: 'Shield Specialist',
      modern: 'Barrier Creator'
    },
    metadata: {
      strength: 12,
      agility: 10,
      constitution: 16,
      intelligence: 16,
      wisdom: 18,
      charisma: 14
    }
  },
  {
    id: 'spec-arcanist',
    tier: 3,
    name: 'Arcanist Specialization',
    specializationType: 'pure_magic',
    description: 'Master of pure arcane force',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-arcanist.png',
    tradeable: true,
    requiredRole: ['striker', 'specialist'],
    requiredPowerSource: 'magic',
    rarity: 'epic',
    signatureAbilities: ['arcane_blast', 'magic_missile', 'spell_amplification', 'mana_surge'],
    loreDescription: 'Arcanists wield raw magical energy, unbound by elemental constraints, striking with pure arcane force.',
    worldAdaptation: {
      fantasy: 'Pure Mage',
      sci_fi: 'Energy Architect',
      modern: 'Force Manipulator'
    },
    metadata: {
      strength: 8,
      agility: 12,
      constitution: 12,
      intelligence: 20,
      wisdom: 16,
      charisma: 14
    }
  },
  {
    id: 'spec-etherialist',
    tier: 3,
    name: 'Etherialist Specialization',
    specializationType: 'ethereal_magic',
    description: 'Master of ethereal and spirit magic',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-etherialist.png',
    tradeable: true,
    requiredRole: ['specialist', 'coordinator'],
    requiredPowerSource: 'magic',
    rarity: 'epic',
    signatureAbilities: ['ethereal_form', 'spirit_bolt', 'phase_shift', 'astral_projection'],
    loreDescription: 'Etherialists walk between worlds, phasing through reality and commanding spiritual energies.',
    worldAdaptation: {
      fantasy: 'Spirit Mage',
      sci_fi: 'Phase Specialist',
      modern: 'Reality Phaser'
    },
    metadata: {
      strength: 8,
      agility: 14,
      constitution: 10,
      intelligence: 18,
      wisdom: 18,
      charisma: 16
    }
  },
  {
    id: 'spec-healer',
    tier: 3,
    name: 'Healer Specialization',
    specializationType: 'healing_magic',
    description: 'Master of restorative and healing magic',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-healer.png',
    tradeable: true,
    requiredRole: ['coordinator'],
    requiredPowerSource: 'magic',
    rarity: 'rare',
    signatureAbilities: ['major_heal', 'regeneration', 'mass_cure', 'resurrection'],
    loreDescription: 'Healers channel life energy itself, mending wounds and bringing allies back from the brink of death.',
    worldAdaptation: {
      fantasy: 'Life Mage',
      sci_fi: 'Bio Regenerator',
      modern: 'Vital Energy Manipulator'
    },
    metadata: {
      strength: 10,
      agility: 12,
      constitution: 14,
      intelligence: 16,
      wisdom: 20,
      charisma: 16
    }
  },
  {
    id: 'spec-alchemist',
    tier: 3,
    name: 'Alchemist Specialization',
    specializationType: 'alchemical_magic',
    description: 'Master of potions and transmutation',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-alchemist.png',
    tradeable: true,
    requiredRole: ['specialist', 'coordinator'],
    requiredPowerSource: 'magic',
    rarity: 'rare',
    signatureAbilities: ['potion_brewing', 'transmutation', 'explosive_flask', 'elixir_of_life'],
    loreDescription: 'Alchemists blend science and magic, creating powerful potions and transmuting matter itself.',
    worldAdaptation: {
      fantasy: 'Potion Master',
      sci_fi: 'Molecular Engineer',
      modern: 'Chemical Manipulator'
    },
    metadata: {
      strength: 12,
      agility: 12,
      constitution: 14,
      intelligence: 18,
      wisdom: 16,
      charisma: 12
    }
  },
  {
    id: 'spec-dracomancer',
    tier: 3,
    name: 'Dracomancer Specialization',
    specializationType: 'dragon_magic',
    description: 'Master of draconic power and dragon-fire',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-dracomancer.png',
    tradeable: true,
    requiredRole: ['striker', 'guardian'],
    requiredPowerSource: 'magic',
    rarity: 'legendary',
    signatureAbilities: ['dragon_breath', 'draconic_scales', 'wing_buffet', 'dragon_roar'],
    loreDescription: 'Dracomancers channel the ancient power of dragons, breathing fire and taking on draconic aspects.',
    worldAdaptation: {
      fantasy: 'Dragon Mage',
      sci_fi: 'Draconic Gene-Mod',
      modern: 'Dragon Soul'
    },
    metadata: {
      strength: 16,
      agility: 14,
      constitution: 16,
      intelligence: 18,
      wisdom: 16,
      charisma: 18
    }
  },
  {
    id: 'spec-lumimancer',
    tier: 3,
    name: 'Lumimancer Specialization',
    specializationType: 'light_magic',
    description: 'Master of light and radiant energy',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-lumimancer.png',
    tradeable: true,
    requiredRole: ['striker', 'coordinator'],
    requiredPowerSource: 'magic',
    rarity: 'rare',
    signatureAbilities: ['light_beam', 'blinding_flash', 'radiant_aura', 'holy_light'],
    loreDescription: 'Lumimancers wield the pure power of light, banishing darkness and smiting evil.',
    worldAdaptation: {
      fantasy: 'Light Mage',
      sci_fi: 'Photon Specialist',
      modern: 'Light Bender'
    },
    metadata: {
      strength: 10,
      agility: 14,
      constitution: 12,
      intelligence: 18,
      wisdom: 16,
      charisma: 16
    }
  },
  {
    id: 'spec-spatiomancer',
    tier: 3,
    name: 'Spatiomancer Specialization',
    specializationType: 'space_magic',
    description: 'Master of spatial manipulation and teleportation',
    imagePath: '/Images/NFTs/Tier3/spellcasters/asb_alpha_card-spatiomancer.png',
    tradeable: true,
    requiredRole: ['specialist'],
    requiredPowerSource: 'magic',
    rarity: 'epic',
    signatureAbilities: ['teleport', 'dimension_door', 'gravity_well', 'spatial_distortion'],
    loreDescription: 'Spatiomancers bend space itself, teleporting across battlefields and creating zones of warped reality.',
    worldAdaptation: {
      fantasy: 'Space Mage',
      sci_fi: 'Spatial Engineer',
      modern: 'Space-Time Manipulator'
    },
    metadata: {
      strength: 8,
      agility: 16,
      constitution: 10,
      intelligence: 20,
      wisdom: 16,
      charisma: 14
    }
  }
];

// Complete NFT Collection
export const nftCollection: NFTCollection = {
  tier1: tier1RoleNFTs,
  tier2: tier2PowerSourceNFTs,
  tier3: tier3SpecializationNFTs
};

// Helper functions
export function getNFTById(id: string): Tier1RoleNFT | Tier2PowerSourceNFT | Tier3SpecializationNFT | undefined {
  return [
    ...tier1RoleNFTs,
    ...tier2PowerSourceNFTs,
    ...tier3SpecializationNFTs
  ].find(nft => nft.id === id);
}

export function getNFTsByTier(tier: 1 | 2 | 3) {
  switch (tier) {
    case 1: return tier1RoleNFTs;
    case 2: return tier2PowerSourceNFTs;
    case 3: return tier3SpecializationNFTs;
  }
}

export function getNFTsByRole(role: string) {
  return tier1RoleNFTs.filter(nft => nft.roleType === role);
}

export function getNFTsByPowerSource(powerSource: string) {
  return [
    ...tier2PowerSourceNFTs.filter(nft => nft.powerSource === powerSource),
    ...tier3SpecializationNFTs.filter(nft => nft.requiredPowerSource === powerSource)
  ];
}
