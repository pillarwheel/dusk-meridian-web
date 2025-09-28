export interface Character {
  id: string;
  playerId: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  position: Position;
  stats: CharacterStats;
  equipment: Equipment;
  inventory: InventoryItem[];
  skills: Skill[];
  status: CharacterStatus;
  faction: number;
  createdAt: string;
  lastActive: string;
}

export interface Position {
  x: number;
  y: number;
  z: number;
  worldId: number;
  settlementId?: number;
}

export interface CharacterStats {
  strength: number;
  dexterity: number;
  intelligence: number;
  vitality: number;
  luck: number;

  // Derived stats
  attack: number;
  defense: number;
  magicAttack: number;
  magicDefense: number;
  speed: number;
  criticalChance: number;
  criticalDamage: number;
}

export interface Equipment {
  weapon?: EquipmentItem;
  armor?: EquipmentItem;
  helmet?: EquipmentItem;
  boots?: EquipmentItem;
  gloves?: EquipmentItem;
  accessory1?: EquipmentItem;
  accessory2?: EquipmentItem;
  powerSource?: PowerSourceItem;
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: EquipmentType;
  rarity: ItemRarity;
  level: number;
  stats: Partial<CharacterStats>;
  enchantments: Enchantment[];
  durability: number;
  maxDurability: number;
  description: string;
  imageUrl: string;
  isNFT: boolean;
  tokenId?: string;
}

export interface PowerSourceItem {
  id: string;
  name: string;
  type: PowerSourceType;
  rarity: ItemRarity;
  level: number;
  power: number;
  abilities: PowerSourceAbility[];
  description: string;
  imageUrl: string;
  isNFT: boolean;
  tokenId?: string;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  quantity: number;
  item: Item;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  imageUrl: string;
  stackable: boolean;
  maxStack: number;
  value: number;
  uses?: ItemUse[];
}

export interface Skill {
  id: string;
  name: string;
  type: SkillType;
  level: number;
  experience: number;
  maxLevel: number;
  description: string;
  effects: SkillEffect[];
  requirements: SkillRequirement[];
  cooldown: number;
  manaCost: number;
}

export interface Enchantment {
  id: string;
  name: string;
  type: EnchantmentType;
  value: number;
  description: string;
}

export interface PowerSourceAbility {
  id: string;
  name: string;
  type: AbilityType;
  description: string;
  effects: SkillEffect[];
  cooldown: number;
  requirements: SkillRequirement[];
}

export interface SkillEffect {
  type: EffectType;
  value: number;
  duration?: number;
  target: EffectTarget;
}

export interface SkillRequirement {
  type: 'level' | 'skill' | 'item' | 'stat';
  value: number;
  description: string;
}

export interface ItemUse {
  type: 'consume' | 'activate' | 'craft';
  effects: SkillEffect[];
  requirements: SkillRequirement[];
}

export type CharacterClass =
  | 'Guardian'
  | 'Striker'
  | 'Specialist'
  | 'Coordinator';

export type CharacterStatus =
  | 'idle'
  | 'traveling'
  | 'in_combat'
  | 'crafting'
  | 'resting'
  | 'dead';

export type EquipmentType =
  | 'sword'
  | 'bow'
  | 'staff'
  | 'dagger'
  | 'shield'
  | 'light_armor'
  | 'heavy_armor'
  | 'robe'
  | 'helmet'
  | 'boots'
  | 'gloves'
  | 'ring'
  | 'amulet';

export type PowerSourceType =
  | 'Arcane'
  | 'Tech'
  | 'Divine'
  | 'Natural';

export type ItemType =
  | 'consumable'
  | 'material'
  | 'quest'
  | 'key'
  | 'currency';

export type ItemRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export type SkillType =
  | 'combat'
  | 'magic'
  | 'crafting'
  | 'utility'
  | 'passive';

export type EnchantmentType =
  | 'stat_boost'
  | 'elemental'
  | 'special_effect';

export type AbilityType =
  | 'offensive'
  | 'defensive'
  | 'utility'
  | 'passive';

export type EffectType =
  | 'damage'
  | 'heal'
  | 'buff'
  | 'debuff'
  | 'special';

export type EffectTarget =
  | 'self'
  | 'enemy'
  | 'ally'
  | 'area'
  | 'all';