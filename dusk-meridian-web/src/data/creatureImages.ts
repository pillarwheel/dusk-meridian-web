/**
 * Creature Image Mapping
 *
 * Maps creature IDs and names to their corresponding images.
 * Used in Creature Codex (Monster Manual) entries.
 */

export type CreatureThreatLevel = 'Fodder' | 'Standard' | 'Elite' | 'MiniBoss' | 'WorldBoss' | 'Environmental';
export type CreatureZone = 'Sunward Desert' | 'Terminator Belt' | 'Antisolar/Frozen' | 'Cross-Zone' | 'Atmospheric' | 'All Zones';
export type CreatureType = 'Beast' | 'Elemental' | 'Undead' | 'Plant' | 'Aberration' | 'Dragon' | 'Construct';

export interface CreatureImageData {
  id?: string | number;
  name: string;
  imagePath: string;
  thumbnailPath?: string;
  zone: CreatureZone;
  threatLevel: CreatureThreatLevel;
  type: CreatureType;
  levelRange: string;
  description: string;
  lore?: string;
  size?: string;
  abilities?: string[];
  resources?: string[];
}

export const creatureImageMappings: CreatureImageData[] = [
  // World Bosses
  {
    id: '1',
    name: 'Helios Wyrm',
    imagePath: '/Images/Creatures/Helios_Wyrm.png',
    zone: 'Sunward Desert',
    threatLevel: 'WorldBoss',
    type: 'Dragon',
    levelRange: '80-100',
    size: '80-120m length',
    description: 'A colossal desert titan that embodies the raw power of the eternal sun. Its crystalline scales refract sunlight into deadly beams while its presence alone can incinerate unprepared adventurers.',
    lore: 'Ancient texts speak of the Helios Wyrm as a guardian of the deepest desert mysteries, born from concentrated solar radiation during the planet\'s transformation. It sleeps for decades beneath the dunes, emerging only when the desert itself is threatened.',
    abilities: ['Solar Beam', 'Sand Tsunami', 'Crystal Armor', 'Heat Wave'],
    resources: ['Solar Crystal', 'Wyrm Scale', 'Molten Core']
  },
  {
    id: '2',
    name: 'Storm Leviathan',
    imagePath: '/Images/Creatures/Storm_Leviathan.png',
    zone: 'Atmospheric',
    threatLevel: 'WorldBoss',
    type: 'Elemental',
    levelRange: '85-105',
    size: '150m+ wingspan',
    description: 'An atmospheric entity of pure storm energy that dwells in the perpetual twilight clouds. Lightning courses through its ethereal form as it rides the permanent storm systems of the Terminator Zone.',
    lore: 'Born from the chaotic energies where hot and cold air masses collide eternally, the Storm Leviathan is less a creature and more a living weather system. Ancient sky sailors claim it was once a mortal being transformed by exposure to raw atmospheric magic.',
    abilities: ['Lightning Strike', 'Tornado Summon', 'Thunder Clap', 'Storm Shield'],
    resources: ['Storm Core', 'Lightning Essence', 'Tempest Crystal']
  },
  {
    id: '3',
    name: 'Abyssal Kraken',
    imagePath: '/Images/Creatures/Abyssal_Kraken.png',
    zone: 'Antisolar/Frozen',
    threatLevel: 'WorldBoss',
    type: 'Aberration',
    levelRange: '90-110',
    size: '100m+ tentacle span',
    description: 'A nightmare from the frozen depths, the Abyssal Kraken lurks in the perpetually dark seas beneath the ice. Its massive tentacles can crush ships and its cold aura freezes even the bravest hearts.',
    lore: 'Legends say the Abyssal Kraken predates the planet\'s tidal lock, a remnant of an ancient oceanic ecosystem that adapted to the eternal darkness. Its psychic presence can be felt by sailors miles away, filling them with primal dread.',
    abilities: ['Tentacle Crush', 'Ink Cloud', 'Psychic Scream', 'Ice Prison'],
    resources: ['Kraken Beak', 'Abyssal Ink', 'Frozen Tentacle']
  },

  // Mini Bosses
  {
    id: '4',
    name: 'Cryo Tunneler',
    imagePath: '/Images/Creatures/Cryo_Tunneler.png',
    zone: 'Antisolar/Frozen',
    threatLevel: 'MiniBoss',
    type: 'Beast',
    levelRange: '50-65',
    size: '25-40m length',
    description: 'A massive burrowing creature adapted to tunnel through solid ice and permafrost. Its crystalline carapace and freezing breath make it a formidable opponent in close quarters.',
    lore: 'These creatures carve vast tunnel networks beneath the frozen wastes, creating underground highways used by brave traders and desperate refugees. Their tunnels can last for years before collapsing.',
    abilities: ['Ice Breath', 'Burrow Strike', 'Tremor Sense', 'Glacial Shell'],
    resources: ['Cryo Chitin', 'Ice Core', 'Tunnel Crystal']
  },

  // Elite Creatures
  {
    id: '5',
    name: 'Mirage Stalker',
    imagePath: '/Images/Creatures/Mirage_Stalker.png',
    zone: 'Sunward Desert',
    threatLevel: 'Elite',
    type: 'Beast',
    levelRange: '40-55',
    size: '8-12m length',
    description: 'An apex predator of the scorching dunes that uses heat refraction to create perfect optical illusions. By the time prey sees through the mirage, it\'s already too late.',
    lore: 'Desert nomads tell stories of entire caravans led astray by Mirage Stalkers, following false oases until they collapse from exhaustion. The creatures then feed at leisure on the dehydrated corpses.',
    abilities: ['Mirage Cloak', 'Ambush Strike', 'Heat Shimmer', 'Sand Burst'],
    resources: ['Refraction Gland', 'Stalker Hide', 'Desert Fang']
  },
  {
    id: '6',
    name: 'Twilight Prowler',
    imagePath: '/Images/Creatures/Twilight_Prowler.png',
    zone: 'Terminator Belt',
    threatLevel: 'Elite',
    type: 'Beast',
    levelRange: '45-60',
    size: '5-7m length',
    description: 'A pack predator perfectly adapted to the eternal dusk. Its fur shifts between light and shadow, making it nearly invisible in the twilight forests and grasslands.',
    lore: 'Prowlers hunt in coordinated packs of 5-12, using complex vocalizations to organize ambushes. Terminator settlers have learned to recognize their calls and retreat to fortified structures when heard.',
    abilities: ['Shadow Meld', 'Pack Tactics', 'Twilight Howl', 'Pounce'],
    resources: ['Twilight Pelt', 'Shadow Essence', 'Pack Fang']
  },
  {
    id: '7',
    name: 'Ice Phantom',
    imagePath: '/Images/Creatures/Ice_Phantoms.png',
    zone: 'Antisolar/Frozen',
    threatLevel: 'Elite',
    type: 'Undead',
    levelRange: '55-70',
    size: '2-3m height',
    description: 'Undead remnants of explorers who froze to death in the eternal darkness. They drain warmth from living beings and phase through solid ice at will.',
    lore: 'Each Ice Phantom retains fragments of its former life - explorers recognize familiar faces among the frost, sometimes hearing whispered warnings before an attack. Some believe they protect the frozen wastes from exploitation.',
    abilities: ['Heat Drain', 'Phase Shift', 'Frost Touch', 'Wailing Winds'],
    resources: ['Frozen Soul', 'Phantom Essence', 'Eternal Ice']
  },
  {
    id: '8',
    name: 'Void Hunter',
    imagePath: '/Images/Creatures/Void_Hunter.png',
    zone: 'Cross-Zone',
    threatLevel: 'Elite',
    type: 'Aberration',
    levelRange: '60-75',
    size: '4-6m length',
    description: 'A psionic predator that hunts across all climate zones, attracted to high concentrations of mental energy. It appears as a distortion in reality itself before materializing.',
    lore: 'Scholars debate whether Void Hunters are native to this world or extraplanar visitors. They seem drawn to powerful mages and psions, as if feeding on magical potential itself.',
    abilities: ['Psionic Blast', 'Reality Warp', 'Mind Spike', 'Void Step'],
    resources: ['Void Crystal', 'Psionic Organ', 'Reality Fragment']
  },
  {
    id: '9',
    name: 'Mist Walker',
    imagePath: '/Images/Creatures/Mist_Walker.png',
    zone: 'Terminator Belt',
    threatLevel: 'Elite',
    type: 'Elemental',
    levelRange: '35-50',
    size: '3-5m height',
    description: 'Ethereal beings formed from the perpetual mists of the Terminator Belt. They drift silently through fog banks, draining life force from those who wander too far from marked paths.',
    lore: 'Mist Walkers are most active during the thickest fogs, leading to superstitions about "fog madness" among Terminator settlers. Some believe they are the spirits of those lost in the mists, forever wandering.',
    abilities: ['Mist Form', 'Life Drain', 'Fog Cloud', 'Spectral Touch'],
    resources: ['Mist Essence', 'Ethereal Vapor', 'Spirit Crystal']
  },

  // Environmental Hazards & Fodder
  {
    id: '10',
    name: 'Dust Devils',
    imagePath: '/Images/Creatures/Dust_Devils.png',
    zone: 'Sunward Desert',
    threatLevel: 'Environmental',
    type: 'Elemental',
    levelRange: '15-30',
    size: 'Variable swarm',
    description: 'Swarms of small elemental entities born from desert winds and sand. Individually weak, but collectively they can strip flesh from bone in minutes.',
    lore: 'Desert veterans know to seek shelter immediately when Dust Devils appear on the horizon. Their approach is heralded by an eerie whistling sound that carries for miles.',
    abilities: ['Sand Blast', 'Swarm Tactics', 'Blinding Dust', 'Erosion'],
    resources: ['Elemental Dust', 'Wind Crystal', 'Sand Core']
  },
  {
    id: '11',
    name: 'Fungal Shambler',
    imagePath: '/Images/Creatures/Fungal_Shambler.png',
    zone: 'Terminator Belt',
    threatLevel: 'Fodder',
    type: 'Plant',
    levelRange: '10-25',
    size: '2-4m height',
    description: 'Ambulatory fungal colonies that thrive in the damp twilight forests. They release toxic spores when threatened and slowly decompose anything organic they encounter.',
    lore: 'Fungal Shamblers are the cleanup crew of the Terminator forests, breaking down fallen trees and dead creatures. However, they don\'t distinguish between "already dead" and "soon to be dead."',
    abilities: ['Spore Cloud', 'Toxic Touch', 'Regeneration', 'Root Grasp'],
    resources: ['Fungal Mass', 'Spore Sac', 'Mycelium Network']
  },

  // Additional Creatures
  {
    id: '12',
    name: 'Adaptation Parasites',
    imagePath: '/Images/Creatures/Adaptation_Parasites.png',
    zone: 'All Zones',
    threatLevel: 'Standard',
    type: 'Aberration',
    levelRange: '20-40',
    size: 'Microscopic to 1m',
    description: 'Parasitic organisms that infect host creatures and grant them temporary adaptations to extreme environments. Some desperate explorers intentionally expose themselves despite the risks.',
    lore: 'These parasites are believed to be a form of extremophile life that evolved during the planet\'s transformation. They\'ve become essential for some cross-zone trading operations, despite the health risks.',
    abilities: ['Host Modification', 'Environmental Adaptation', 'Rapid Reproduction', 'Symbiosis'],
    resources: ['Parasite Sample', 'Adaptation Gland', 'Bio-Material']
  },
  {
    id: '13',
    name: 'Migrator Herds',
    imagePath: '/Images/Creatures/Migrator_Herds.png',
    zone: 'Terminator Belt',
    threatLevel: 'Standard',
    type: 'Beast',
    levelRange: '5-20',
    size: 'Variable herd',
    description: 'Large herbivorous creatures that continuously migrate along the Terminator Belt, following optimal temperature zones. Their migrations mark the seasons for Belt settlements.',
    lore: 'Entire cultures have built around the Migrator Herds, following their ancient paths and harvesting their shed materials. The herds\' routes are considered sacred by many indigenous groups.',
    abilities: ['Stampede', 'Herd Immunity', 'Trampling Charge', 'Endurance'],
    resources: ['Migrator Hide', 'Shed Horn', 'Herd Meat']
  }
];

/**
 * Get creature image data by ID
 */
export function getCreatureImageById(id: string | number): CreatureImageData | null {
  const idStr = String(id);
  return creatureImageMappings.find(c => c.id && String(c.id) === idStr) || null;
}

/**
 * Get creature image data by name (case-insensitive, fuzzy match)
 */
export function getCreatureImageByName(name: string): CreatureImageData | null {
  const normalizedName = name.toLowerCase().trim();

  // Exact match first
  let match = creatureImageMappings.find(
    c => c.name.toLowerCase() === normalizedName
  );

  if (match) return match;

  // Partial match (contains)
  match = creatureImageMappings.find(
    c => c.name.toLowerCase().includes(normalizedName) ||
         normalizedName.includes(c.name.toLowerCase())
  );

  return match || null;
}

/**
 * Get creature image path by ID or name
 */
export function getCreatureImage(idOrName: string | number): string | null {
  // Try ID first
  if (typeof idOrName === 'number' || /^\d+$/.test(String(idOrName))) {
    const data = getCreatureImageById(idOrName);
    if (data) return data.imagePath;
  }

  // Try name
  const data = getCreatureImageByName(String(idOrName));
  return data ? data.imagePath : null;
}

/**
 * Get thumbnail image path (falls back to main image if no thumbnail)
 */
export function getCreatureThumbnail(idOrName: string | number): string | null {
  const image = getCreatureImage(idOrName);
  return image; // Can be extended to support separate thumbnails
}

/**
 * Get all creatures by zone
 */
export function getCreaturesByZone(zone: CreatureZone): CreatureImageData[] {
  return creatureImageMappings.filter(c => c.zone === zone || c.zone === 'All Zones');
}

/**
 * Get all creatures by threat level
 */
export function getCreaturesByThreatLevel(threatLevel: CreatureThreatLevel): CreatureImageData[] {
  return creatureImageMappings.filter(c => c.threatLevel === threatLevel);
}

/**
 * Get all creatures by type
 */
export function getCreaturesByType(type: CreatureType): CreatureImageData[] {
  return creatureImageMappings.filter(c => c.type === type);
}

/**
 * Get all available creature images
 */
export function getAllCreatureImages(): CreatureImageData[] {
  return [...creatureImageMappings];
}

/**
 * Check if creature has an image
 */
export function creatureHasImage(idOrName: string | number): boolean {
  return getCreatureImage(idOrName) !== null;
}

/**
 * Get fallback/default image for unknown creatures
 */
export function getDefaultCreatureImage(): string {
  return '/Images/Creatures/Void_Hunter.png';
}

/**
 * Get all unique zones
 */
export function getAllZones(): CreatureZone[] {
  const zones = new Set(creatureImageMappings.map(c => c.zone));
  return Array.from(zones);
}

/**
 * Get all unique threat levels
 */
export function getAllThreatLevels(): CreatureThreatLevel[] {
  const levels = new Set(creatureImageMappings.map(c => c.threatLevel));
  return Array.from(levels);
}
