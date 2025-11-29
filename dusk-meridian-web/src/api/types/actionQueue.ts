export enum ActionStatus {
  Queued = 'Queued',
  InProgress = 'InProgress',
  Paused = 'Paused',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
}

export enum ActionCategory {
  Physiological = 'Physiological', // Food, water, sleep
  Safety = 'Safety', // Shelter, health, security
  Social = 'Social', // Interactions, relationships
  Esteem = 'Esteem', // Achievements, reputation
  SelfActualization = 'SelfActualization', // Skills, quests, exploration
}

export enum ActionType {
  // Movement
  MoveTo = 'MoveTo',
  Follow = 'Follow',
  Patrol = 'Patrol',

  // Survival
  Eat = 'Eat',
  Drink = 'Drink',
  Sleep = 'Sleep',
  Rest = 'Rest',

  // Gathering
  GatherResource = 'GatherResource',
  Hunt = 'Hunt',
  Fish = 'Fish',
  Mine = 'Mine',
  Harvest = 'Harvest',

  // Crafting
  Craft = 'Craft',
  Smelt = 'Smelt',
  Cook = 'Cook',
  Brew = 'Brew',

  // Combat
  Attack = 'Attack',
  Defend = 'Defend',
  Retreat = 'Retreat',
  Guard = 'Guard',

  // Social
  Talk = 'Talk',
  Trade = 'Trade',
  Gift = 'Gift',

  // Building
  Build = 'Build',
  Repair = 'Repair',
  Upgrade = 'Upgrade',
  Demolish = 'Demolish',

  // Training
  TrainSkill = 'TrainSkill',
  Practice = 'Practice',
  Study = 'Study',

  // Other
  UseItem = 'UseItem',
  EquipItem = 'EquipItem',
  UnequipItem = 'UnequipItem',
  DropItem = 'DropItem',
  PickupItem = 'PickupItem',
}

export interface ActionQueueDto {
  id: string;
  characterId: string;
  actionName: string;
  actionType: ActionType;
  actionCategory: ActionCategory;
  priorityLevel: number;
  status: ActionStatus;

  // Target information
  targetX: number | null;
  targetY: number | null;
  targetZ: number | null;
  targetBuildingId: string | null;
  targetCharacterId: string | null;
  targetResourceId: string | null;
  targetItemId: string | null;

  // Progress
  durationSeconds: number;
  progressPercent: number;
  estimatedCompletionTime: string | null;

  // Metadata
  parameters: Record<string, any> | null;
  repeatCount: number;
  currentRepeat: number;

  // Timestamps
  enqueuedAt: string;
  startedAt: string | null;
  pausedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;

  // Failure info
  failedReason: string | null;
  errorDetails: string | null;
}

export interface CreateActionDto {
  actionName: string;
  actionType: ActionType;
  actionCategory?: ActionCategory;
  priorityLevel?: number;

  // Target (at least one should be specified depending on action type)
  targetX?: number;
  targetY?: number;
  targetZ?: number;
  targetBuildingId?: string;
  targetCharacterId?: string;
  targetResourceId?: string;
  targetItemId?: string;

  // Optional
  parameters?: Record<string, any>;
  repeatCount?: number;
}

export interface UpdateActionDto {
  priorityLevel?: number;
  status?: ActionStatus;
  parameters?: Record<string, any>;
}

export interface ActionTemplateDto {
  id: string;
  name: string;
  description: string;
  category: string;
  actions: CreateActionDto[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export interface CreateActionTemplateDto {
  name: string;
  description: string;
  category: string;
  actions: CreateActionDto[];
}

export interface ActionQueueSummary {
  characterId: string;
  totalActions: number;
  queuedActions: number;
  inProgressActions: number;
  completedActions: number;
  failedActions: number;
  currentAction: ActionQueueDto | null;
  nextAction: ActionQueueDto | null;
}

export interface ActionProgressUpdate {
  actionId: string;
  characterId: string;
  progressPercent: number;
  status: ActionStatus;
  estimatedCompletionTime: string | null;
}

export interface ActionCompletionResult {
  actionId: string;
  characterId: string;
  success: boolean;
  rewards: {
    experience?: number;
    items?: Array<{ itemId: string; quantity: number }>;
    resources?: Array<{ resourceId: string; quantity: number }>;
  } | null;
  message: string;
}
