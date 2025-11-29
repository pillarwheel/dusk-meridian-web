/**
 * Settlement Image Mapping
 *
 * Maps settlement IDs and names to their corresponding images.
 * Used in both Settlement cards/details and Codex entries.
 */

export interface SettlementImageData {
  id?: string | number;
  name: string;
  imagePath: string;
  thumbnailPath?: string;
  faction?: string;
  type: 'city' | 'town' | 'fortress' | 'underground_city' | 'industrial' | 'mining' | 'salvage' | 'outpost' | 'settlement';
  description: string;
  lore?: string;
  population?: number;
  founded?: string;
}

export const settlementImageMappings: SettlementImageData[] = [
  // Major Cities
  {
    id: '1',
    name: 'Apex Reach',
    imagePath: '/Images/Cities/Apex_Reach.png',
    faction: 'Solar Dominion',
    type: 'city',
    description: 'A towering metropolis reaching toward the eternal dusk sky, Apex Reach stands as the pinnacle of Solar Dominion achievement. Crystal spires pierce the clouds while advanced technology powers every aspect of city life.',
    lore: "Founded in the early days of the Solar Dominion's expansion, Apex Reach was designed to showcase the faction's technological prowess and architectural ambition. The city serves as both a symbol of power and a center of innovation.",
    population: 15000,
    founded: 'Year 1100'
  },
  {
    id: '2',
    name: "Haven's Ring",
    imagePath: '/Images/Cities/Havens_Ring.png',
    faction: 'Twilight Alliance',
    type: 'city',
    description: "A circular fortified city built in concentric rings, each layer providing protection and organization. Haven's Ring embodies the Twilight Alliance's philosophy of balanced defense and community structure.",
    lore: "Constructed as a refugee sanctuary during the Great Fracture, Haven's Ring grew from a temporary shelter into a thriving metropolis. Its unique circular design allows for efficient defense while maintaining strong community bonds.",
    population: 12000,
    founded: 'Year 1050'
  },
  {
    id: '3',
    name: "Harmony's Edge",
    imagePath: '/Images/Cities/Harmoneys_Edge.png',
    faction: 'Twilight Alliance',
    type: 'city',
    description: "Perched on the boundary between light and shadow, Harmony's Edge perfectly embodies the Twilight Alliance's core values. The city's architecture blends natural elements with careful engineering.",
    lore: "Built at the precise geographical location where dusk is most prominent, Harmony's Edge serves as a philosophical and strategic center for the Twilight Alliance. The city's location allows it to harness unique natural phenomena.",
    population: 10000,
    founded: 'Year 1120'
  },
  {
    id: '4',
    name: 'Peak Sanctuary',
    imagePath: '/Images/Cities/Peak_Sanctuary.png',
    faction: 'Umbral Order',
    type: 'fortress',
    description: 'A fortified mountain stronghold carved into living rock, Peak Sanctuary provides impregnable defense and commanding views of the surrounding territories. Dark stone architecture blends seamlessly with natural caves.',
    lore: 'The Umbral Order discovered ancient caverns within the mountain and expanded them into a massive fortress city. The natural defensibility combined with strategic location makes Peak Sanctuary nearly impossible to assault.',
    population: 8000,
    founded: 'Year 1080'
  },
  {
    name: 'Peak Sanctuary Alt',
    imagePath: '/Images/Cities/Peak_Sanctuary2.png',
    faction: 'Umbral Order',
    type: 'fortress',
    description: 'An alternative view of the Peak Sanctuary complex, showing the extensive underground network and vertical construction that characterizes Umbral Order architecture.',
    lore: "Beneath the visible fortress lies an extensive network of tunnels, chambers, and underground cities that house the majority of Peak Sanctuary's population and strategic resources."
  },
  {
    id: '5',
    name: 'Last Hope Undercroft',
    imagePath: '/Images/Cities/Last_Hope_Undercroft.png',
    faction: 'Deep Dwellers',
    type: 'underground_city',
    description: "A vast underground metropolis illuminated by bioluminescent fungi and carefully managed light sources. Last Hope Undercroft represents the Deep Dwellers' mastery of subterranean living.",
    lore: 'When surface conditions became untenable, the Deep Dwellers excavated massive caverns and created a self-sustaining underground civilization. The Undercroft now rivals surface cities in population and technological advancement.',
    population: 18000,
    founded: 'Year 1030'
  },

  // Industrial Centers
  {
    id: '6',
    name: 'Solar Dominion Industrial Hub',
    imagePath: '/Images/Cities/Solar_Dominion_Industrial_Hub.png',
    faction: 'Solar Dominion',
    type: 'industrial',
    description: "A massive industrial complex showcasing the Solar Dominion's manufacturing capabilities. Smoke stacks and factory towers dominate the skyline as production runs day and night.",
    lore: 'Built to centralize manufacturing and resource processing, the Industrial Hub produces everything from basic goods to advanced military equipment. Its efficiency is legendary across all factions.',
    population: 7000,
    founded: 'Year 1140'
  },
  {
    id: '7',
    name: 'Twilight Alliance Bio-Manufacturing',
    imagePath: '/Images/Cities/Twilight_Alliance_Bio-Manufacturing.png',
    faction: 'Twilight Alliance',
    type: 'industrial',
    description: 'A unique blend of biological and technological manufacturing, this facility produces organic-tech hybrid products. Green spaces integrate seamlessly with production areas.',
    lore: 'The Twilight Alliance developed bio-manufacturing as an alternative to purely mechanical production. The facility demonstrates their commitment to balanced development and sustainable practices.',
    population: 5000,
    founded: 'Year 1150'
  },
  {
    id: '8',
    name: 'Umbral Order Mining Facility',
    imagePath: '/Images/Cities/Umbral_Order_Mining_Facility.png',
    faction: 'Umbral Order',
    type: 'mining',
    description: 'A grim industrial mining complex carved into mountainsides, extracting rare minerals and precious metals. The facility operates continuously with military precision.',
    lore: 'The Umbral Order discovered rich mineral deposits in the shadow mountains and built this facility to exploit them. Mining operations are conducted with ruthless efficiency and strict discipline.',
    population: 4000,
    founded: 'Year 1110'
  },
  {
    id: '9',
    name: 'Deep Dwellers Salvage City',
    imagePath: '/Images/Cities/Deep_Dwellers_Salvage_City.png',
    faction: 'Deep Dwellers',
    type: 'salvage',
    description: 'Built among ancient ruins and technological debris, Salvage City specializes in recovering and repurposing lost technology. Scavengers and engineers work side by side.',
    lore: "The Deep Dwellers established this settlement atop ruins from a pre-Fracture civilization. Through careful excavation and salvage operations, they've recovered countless technological marvels and ancient knowledge.",
    population: 6000,
    founded: 'Year 1090'
  }
];

/**
 * Get settlement image data by ID
 */
export function getSettlementImageById(id: string | number): SettlementImageData | null {
  const idStr = String(id);
  return settlementImageMappings.find(s => s.id && String(s.id) === idStr) || null;
}

/**
 * Get settlement image data by name (case-insensitive, fuzzy match)
 */
export function getSettlementImageByName(name: string): SettlementImageData | null {
  const normalizedName = name.toLowerCase().trim();

  // Exact match first
  let match = settlementImageMappings.find(
    s => s.name.toLowerCase() === normalizedName
  );

  if (match) return match;

  // Partial match (contains)
  match = settlementImageMappings.find(
    s => s.name.toLowerCase().includes(normalizedName) ||
         normalizedName.includes(s.name.toLowerCase())
  );

  return match || null;
}

/**
 * Get settlement image path by ID or name
 */
export function getSettlementImage(idOrName: string | number): string | null {
  // Try ID first
  if (typeof idOrName === 'number' || /^\d+$/.test(String(idOrName))) {
    const data = getSettlementImageById(idOrName);
    if (data) return data.imagePath;
  }

  // Try name
  const data = getSettlementImageByName(String(idOrName));
  return data ? data.imagePath : null;
}

/**
 * Get thumbnail image path (falls back to main image if no thumbnail)
 */
export function getSettlementThumbnail(idOrName: string | number): string | null {
  const image = getSettlementImage(idOrName);
  return image; // Can be extended to support separate thumbnails
}

/**
 * Get all settlements by faction
 */
export function getSettlementsByFaction(faction: string): SettlementImageData[] {
  const normalizedFaction = faction.toLowerCase();
  return settlementImageMappings.filter(
    s => s.faction && s.faction.toLowerCase().includes(normalizedFaction)
  );
}

/**
 * Get all settlements by type
 */
export function getSettlementsByType(type: SettlementImageData['type']): SettlementImageData[] {
  return settlementImageMappings.filter(s => s.type === type);
}

/**
 * Get all available settlement images
 */
export function getAllSettlementImages(): SettlementImageData[] {
  return [...settlementImageMappings];
}

/**
 * Check if settlement has an image
 */
export function settlementHasImage(idOrName: string | number): boolean {
  return getSettlementImage(idOrName) !== null;
}

/**
 * Get fallback/default image
 */
export function getDefaultSettlementImage(): string {
  return '/Images/Cities/Havens_Ring.png';
}
