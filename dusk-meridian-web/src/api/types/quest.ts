export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  status: QuestStatus;
  difficulty: QuestDifficulty;
  requirements: QuestRequirement[];
  objectives: QuestObjective[];
  rewards: QuestReward[];
  timeLimit?: number; // in seconds
  expiresAt?: string;
  startedAt?: string;
  completedAt?: string;
  giver: QuestGiver;
  location?: QuestLocation;
  isRepeatable: boolean;
  cooldown?: number; // in seconds
  chain?: QuestChain;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: ObjectiveType;
  target: string; // item id, monster id, location id, etc.
  required: number;
  current: number;
  completed: boolean;
  optional: boolean;
}

export interface QuestRequirement {
  type: RequirementType;
  value: string | number;
  description: string;
  met: boolean;
}

export interface QuestReward {
  type: RewardType;
  item?: string; // item id
  quantity?: number;
  experience?: number;
  currency?: {
    type: 'gold' | 'dusk' | 'plr';
    amount: number;
  };
  reputation?: {
    faction: string;
    amount: number;
  };
  title?: string;
  achievement?: string;
}

export interface QuestGiver {
  id: string;
  name: string;
  type: 'npc' | 'player' | 'system' | 'settlement';
  imageUrl?: string;
  location?: QuestLocation;
  reputation?: number;
}

export interface QuestLocation {
  worldId: number;
  position: Position;
  radius?: number;
  settlementId?: number;
  name: string;
}

export interface QuestChain {
  id: string;
  name: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  quests: string[]; // quest ids in order
}

export interface QuestProgress {
  questId: string;
  objectives: {
    [objectiveId: string]: number;
  };
  startedAt: string;
  lastUpdated: string;
}

export interface AvailableQuest {
  quest: Quest;
  canAccept: boolean;
  reasons?: string[]; // why can't accept if canAccept is false
}

export interface QuestLog {
  active: Quest[];
  completed: Quest[];
  failed: Quest[];
  available: AvailableQuest[];
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
}

export interface QuestUpdate {
  questId: string;
  objectiveId: string;
  newProgress: number;
  completed: boolean;
}

export interface Settlement {
  id: number;
  name: string;
  position: Position;
}

export interface Position {
  x: number;
  y: number;
  z: number;
}

export type QuestType =
  | 'main_story'
  | 'side_quest'
  | 'daily'
  | 'weekly'
  | 'event'
  | 'guild'
  | 'faction'
  | 'personal';

export type QuestStatus =
  | 'available'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'expired'
  | 'locked';

export type QuestDifficulty =
  | 'trivial'
  | 'easy'
  | 'medium'
  | 'hard'
  | 'extreme'
  | 'legendary';

export type ObjectiveType =
  | 'kill_monsters'
  | 'collect_items'
  | 'visit_location'
  | 'talk_to_npc'
  | 'craft_items'
  | 'build_structure'
  | 'defend_settlement'
  | 'escort'
  | 'survive'
  | 'puzzle';

export type RequirementType =
  | 'level'
  | 'quest_completed'
  | 'item_owned'
  | 'skill_level'
  | 'faction_reputation'
  | 'settlement_member'
  | 'class'
  | 'achievement';

export type RewardType =
  | 'experience'
  | 'currency'
  | 'item'
  | 'reputation'
  | 'title'
  | 'achievement'
  | 'skill_points'
  | 'access';