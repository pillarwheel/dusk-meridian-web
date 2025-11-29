import { codexCachedApi } from '@/api/endpoints/codex-cached';

/**
 * Utility for importing Codex data from various sources
 */

export interface LoreDocument {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  content: string;
  summary: string;
  tags?: string[];
}

/**
 * Import lore entries from a JSON file
 */
export async function importLoreFromJSON(jsonData: LoreDocument[]): Promise<void> {
  const entries = jsonData.map(doc => ({
    id: doc.id,
    title: doc.title,
    category: doc.category,
    subcategory: doc.subcategory,
    content: doc.content,
    summary: doc.summary,
    tags: doc.tags ? doc.tags.join(', ') : undefined
  }));

  await codexCachedApi.bulkImportLore(entries);
  console.log(`Imported ${entries.length} lore entries`);
}

/**
 * Import lore from markdown files
 */
export async function importLoreFromMarkdown(
  id: string,
  title: string,
  category: string,
  markdownContent: string,
  options?: {
    subcategory?: string;
    tags?: string[];
  }
): Promise<void> {
  // Extract first paragraph as summary (up to 200 chars)
  const contentWithoutHeaders = markdownContent.replace(/^#.*$/gm, '').trim();
  const firstParagraph = contentWithoutHeaders.split('\n\n')[0];
  const summary = firstParagraph.slice(0, 200) + (firstParagraph.length > 200 ? '...' : '');

  await codexCachedApi.storeLoreEntry({
    id,
    title,
    category,
    subcategory: options?.subcategory,
    content: markdownContent,
    summary,
    tags: options?.tags ? options.tags.join(', ') : undefined
  });

  console.log(`Imported lore entry: ${title}`);
}

/**
 * Import creature/class data
 */
export async function importCreatureData(creatures: any[]): Promise<void> {
  // This would sync with the actual API when available
  // For now, just log what we would import
  console.log(`Would import ${creatures.length} creatures to cache`);

  // When the API is available, you can call:
  // await codexCachedApi.getCharacterClasses() which will cache them
}

/**
 * Import settlement data
 */
export async function importSettlementData(settlements: any[]): Promise<void> {
  // This would sync with the actual API when available
  console.log(`Would import ${settlements.length} settlements to cache`);

  // When the API is available:
  // await codexCachedApi.getSettlements() which will cache them
}

/**
 * Import faction data
 */
export async function importFactionData(factions: any[]): Promise<void> {
  console.log(`Would import ${factions.length} factions to cache`);

  // When the API is available:
  // await codexCachedApi.getFactions() which will cache them
}

/**
 * Helper to read a file and parse as JSON
 */
export function parseJSONFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Helper to read a markdown file
 */
export function readMarkdownFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Example: Pre-populate with sample Dusk Meridian lore
 */
export async function populateSampleLore(): Promise<void> {
  const sampleLore: LoreDocument[] = [
    {
      id: 'world-overview',
      title: 'The World of Dusk Meridian',
      category: 'World',
      content: `# The World of Dusk Meridian

Dusk Meridian is a vast persistent world where magic and technology intertwine. The world exists in a perpetual state of twilight, where the sun never fully rises or sets, creating a realm of eternal dusk.

## Geography

The world is divided into multiple continents, each with its own unique climate and resources. From the frozen wastes of the North to the tropical jungles of the South, every region offers different challenges and opportunities for adventurers.

## Magic System

Magic in Dusk Meridian follows a complex school-based system, with practitioners specializing in various disciplines such as Pyromancy, Cryomancy, and Etherealism.

## Factions

Six major factions vie for control of the world's resources and territories, each with their own ideologies and goals.`,
      summary: 'An overview of the world of Dusk Meridian, its geography, magic system, and political landscape.',
      tags: ['world', 'lore', 'overview']
    },
    {
      id: 'magic-schools',
      title: 'Schools of Magic',
      category: 'Mechanics',
      subcategory: 'Magic',
      content: `# Schools of Magic

## Pyromancy
The art of fire magic, favored by aggressive spellcasters who prefer direct damage.

## Cryomancy
Ice and cold magic, used for both offense and crowd control.

## Etherealism
The manipulation of spiritual and dimensional energies.

## Necromancy
The forbidden art of death magic and undeath.

## Healing Arts
Restorative magic focused on maintaining life and vitality.`,
      summary: 'A guide to the major schools of magic practiced in Dusk Meridian.',
      tags: ['magic', 'spells', 'mechanics']
    },
    {
      id: 'faction-blue',
      title: 'The Azure Covenant',
      category: 'Factions',
      content: `# The Azure Covenant

The Azure Covenant is one of the six major factions in Dusk Meridian, known for their mastery of water magic and naval superiority.

## Philosophy
The Covenant believes in order through knowledge and the preservation of ancient wisdom.

## Territory
They control the coastal regions and several major port cities.

## Notable Leaders
High Sage Marina Deepwater leads the Covenant with wisdom and strategic brilliance.`,
      summary: 'The Azure Covenant: A faction dedicated to knowledge, order, and mastery of water magic.',
      tags: ['faction', 'azure covenant', 'lore']
    }
  ];

  await importLoreFromJSON(sampleLore);
  console.log('Sample lore populated successfully');
}
