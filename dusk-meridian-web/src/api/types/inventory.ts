export enum ItemType {
  Weapon = 'Weapon',
  Armor = 'Armor',
  Accessory = 'Accessory',
  Consumable = 'Consumable',
  Material = 'Material',
  Quest = 'Quest',
  Currency = 'Currency',
  Tool = 'Tool',
  Ammunition = 'Ammunition',
  Container = 'Container',
  Book = 'Book',
  Misc = 'Misc',
}

export enum ItemRarity {
  Common = 'Common',
  Uncommon = 'Uncommon',
  Rare = 'Rare',
  Epic = 'Epic',
  Legendary = 'Legendary',
  Mythic = 'Mythic',
  Artifact = 'Artifact',
}

export enum EquipmentSlot {
  Head = 'Head',
  Neck = 'Neck',
  Shoulders = 'Shoulders',
  Back = 'Back',
  Chest = 'Chest',
  Wrists = 'Wrists',
  Hands = 'Hands',
  Waist = 'Waist',
  Legs = 'Legs',
  Feet = 'Feet',
  MainHand = 'MainHand',
  OffHand = 'OffHand',
  TwoHand = 'TwoHand',
  RangedWeapon = 'RangedWeapon',
  Ring1 = 'Ring1',
  Ring2 = 'Ring2',
  Trinket1 = 'Trinket1',
  Trinket2 = 'Trinket2',
  Ammo = 'Ammo',
}

export enum WeaponType {
  Sword = 'Sword',
  Axe = 'Axe',
  Mace = 'Mace',
  Dagger = 'Dagger',
  Staff = 'Staff',
  Spear = 'Spear',
  Bow = 'Bow',
  Crossbow = 'Crossbow',
  Wand = 'Wand',
  Shield = 'Shield',
  Fist = 'Fist',
  Gun = 'Gun',
}

export enum ArmorType {
  Cloth = 'Cloth',
  Leather = 'Leather',
  Mail = 'Mail',
  Plate = 'Plate',
  Shield = 'Shield',
}

export interface ItemDto {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;

  // Visual
  iconUrl: string | null;
  modelUrl: string | null;

  // Properties
  level: number;
  weight: number;
  value: number;

  // Equipment specific
  equipmentSlot: EquipmentSlot | null;
  weaponType: WeaponType | null;
  armorType: ArmorType | null;

  // Stats
  stats: ItemStatDto[];
  effects: ItemEffectDto[];
  requirements: ItemRequirementDto[];

  // Stack info
  stackable: boolean;
  maxStackSize: number;

  // Trading
  tradeable: boolean;
  bindOnEquip: boolean;
  bindOnPickup: boolean;

  // Metadata
  craftable: boolean;
  unique: boolean;
  questItem: boolean;

  createdAt: string;
}

export interface ItemStatDto {
  statName: string;
  statValue: number;
  isPercentage: boolean;
}

export interface ItemEffectDto {
  effectName: string;
  effectDescription: string;
  duration: number | null; // null for permanent
  magnitude: number;
}

export interface ItemRequirementDto {
  requirementType: 'Level' | 'Class' | 'Skill' | 'Attribute' | 'Quest';
  requirementValue: string;
  minimumValue: number;
}

export interface InventoryItemDto {
  id: string; // unique instance ID
  itemId: string; // reference to ItemDto
  item: ItemDto; // populated item data

  // Instance properties
  quantity: number;
  durability: number | null; // null if not applicable
  maxDurability: number | null;

  // Position
  slot: number | null; // null if not in specific slot
  bagId: string | null; // which bag/container
  equipped: boolean;
  equippedSlot: EquipmentSlot | null;

  // Customization
  enchantments: EnchantmentDto[];
  gems: GemDto[];
  customName: string | null;

  // Metadata
  acquiredAt: string;
  boundToCharacter: boolean;
}

export interface EnchantmentDto {
  id: string;
  name: string;
  description: string;
  stats: ItemStatDto[];
  permanence: 'Permanent' | 'Temporary' | 'UntilDeath';
}

export interface GemDto {
  id: string;
  name: string;
  color: string;
  stats: ItemStatDto[];
  socketSlot: number;
}

export interface InventoryDto {
  characterId: string;
  maxSlots: number;
  usedSlots: number;
  weightCapacity: number;
  currentWeight: number;

  items: InventoryItemDto[];
  equipment: Record<EquipmentSlot, InventoryItemDto | null>;

  bags: BagDto[];
  currency: CurrencyDto[];
}

export interface BagDto {
  id: string;
  name: string;
  iconUrl: string | null;
  slots: number;
  usedSlots: number;
  bagSlot: number; // which bag slot (0-4 typically)
  items: InventoryItemDto[];
}

export interface CurrencyDto {
  currencyId: string;
  currencyName: string;
  amount: number;
  iconUrl: string | null;
  displayOrder: number;
}

export interface EquipItemDto {
  inventoryItemId: string;
  slot: EquipmentSlot;
}

export interface UnequipItemDto {
  slot: EquipmentSlot;
}

export interface MoveItemDto {
  inventoryItemId: string;
  targetSlot: number;
  targetBagId: string | null;
}

export interface SplitStackDto {
  inventoryItemId: string;
  quantity: number;
  targetSlot: number;
  targetBagId: string | null;
}

export interface MergeStackDto {
  sourceInventoryItemId: string;
  targetInventoryItemId: string;
}

export interface DropItemDto {
  inventoryItemId: string;
  quantity: number;
}

export interface UseItemDto {
  inventoryItemId: string;
  targetCharacterId: string | null;
}

export interface TradeOfferDto {
  tradeId: string;
  fromCharacterId: string;
  fromCharacterName: string;
  toCharacterId: string;
  toCharacterName: string;

  offeredItems: InventoryItemDto[];
  offeredCurrency: CurrencyDto[];

  requestedItems: InventoryItemDto[];
  requestedCurrency: CurrencyDto[];

  status: 'Pending' | 'Accepted' | 'Declined' | 'Completed' | 'Cancelled';
  expiresAt: string;
  createdAt: string;
}

export interface CreateTradeOfferDto {
  toCharacterId: string;
  offeredItemIds: string[];
  offeredCurrency: { currencyId: string; amount: number }[];
  requestedItemIds: string[];
  requestedCurrency: { currencyId: string; amount: number }[];
}

export interface LootContainerDto {
  containerId: string;
  containerName: string;
  x: number;
  y: number;
  z: number;
  items: InventoryItemDto[];
  expiresAt: string;
  canLoot: boolean;
}

export interface CraftingRecipeDto {
  id: string;
  name: string;
  description: string;
  category: string;

  // Result
  resultItemId: string;
  resultItem: ItemDto;
  resultQuantity: number;

  // Requirements
  requiredMaterials: RecipeMaterialDto[];
  requiredSkills: RecipeSkillRequirement[];
  requiredTools: string[]; // tool item IDs

  // Crafting
  craftingTime: number; // seconds
  experienceGained: number;
  successRate: number;

  // Learning
  learned: boolean;
  learningRequirements: ItemRequirementDto[];
}

export interface RecipeMaterialDto {
  itemId: string;
  itemName: string;
  quantity: number;
  consumed: boolean;
}

export interface RecipeSkillRequirement {
  skillName: string;
  minimumLevel: number;
}

export interface CraftingQueueDto {
  id: string;
  characterId: string;
  recipeId: string;
  recipe: CraftingRecipeDto;

  quantity: number;
  currentQuantity: number;

  status: 'Queued' | 'InProgress' | 'Paused' | 'Completed' | 'Failed';
  progressPercent: number;

  startedAt: string | null;
  completedAt: string | null;
  estimatedCompletionTime: string | null;
}

export interface StartCraftingDto {
  recipeId: string;
  quantity: number;
  useHighQualityMaterials: boolean;
}

export interface RepairItemDto {
  inventoryItemId: string;
  repairAll: boolean;
}

export interface EnchantItemDto {
  inventoryItemId: string;
  enchantmentId: string;
  replaceExisting: boolean;
}

export interface SocketGemDto {
  inventoryItemId: string;
  gemInventoryItemId: string;
  socketSlot: number;
}

export interface ItemTooltipData {
  item: ItemDto;
  inventoryItem: InventoryItemDto | null;
  comparisons: ItemDto[]; // items to compare against
  canEquip: boolean;
  canUse: boolean;
  missingRequirements: string[];
}
