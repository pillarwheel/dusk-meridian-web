export const API_ENDPOINTS = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5105/api/v1',
  BASE_URL_HTTPS: import.meta.env.VITE_API_URL_HTTPS || 'https://localhost:5001/api/v1',
  SIGNALR_HUB_URL: import.meta.env.VITE_SIGNALR_HUB_URL || 'wss://localhost:5001/worldhub',
  // Character API uses /api/ without version prefix
  CHARACTER_BASE_URL: 'http://localhost:5105/api',
} as const;

export const BLOCKCHAIN_CONFIG = {
  CHAIN_ID: Number(import.meta.env.VITE_CHAIN_ID) || 13371,
  PLR_TOKEN_ADDRESS: import.meta.env.VITE_PLR_TOKEN_ADDRESS,
  DUSK_TOKEN_ADDRESS: import.meta.env.VITE_DUSK_TOKEN_ADDRESS,
  MARKETPLACE_ADDRESS: import.meta.env.VITE_MARKETPLACE_ADDRESS,
} as const;

export const AUTH0_CONFIG = {
  DOMAIN: import.meta.env.VITE_AUTH0_DOMAIN || 'dev-r0zv6y6fgmopsqqs.us.auth0.com',
  CLIENT_ID: import.meta.env.VITE_AUTH0_CLIENT_ID,
  AUDIENCE: import.meta.env.VITE_AUTH0_AUDIENCE || 'magewar',
  SCOPE: import.meta.env.VITE_AUTH0_SCOPE || 'openid profile email',
  get REDIRECT_URI() {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/callback`;
    }
    return 'http://localhost:8080/callback'; // fallback for SSR
  },
} as const;

export const CHARACTER_CLASSES = [
  'Guardian',
  'Striker',
  'Specialist',
  'Coordinator'
] as const;

export const POWER_SOURCE_TYPES = [
  'Arcane',
  'Tech',
  'Divine',
  'Natural'
] as const;

export const ITEM_RARITIES = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythic'
] as const;

export const BUILDING_TYPES = [
  'town_hall',
  'barracks',
  'workshop',
  'market',
  'temple',
  'academy',
  'wall',
  'tower',
  'farm',
  'mine',
  'quarry',
  'lumber_mill'
] as const;

export const FACTION_COLORS = {
  1: '#3B82F6', // Blue
  2: '#EF4444', // Red
  3: '#10B981', // Green
  4: '#F59E0B', // Yellow
  5: '#8B5CF6', // Purple
  6: '#F97316', // Orange
} as const;

export const MAP_CONFIG = {
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 8,
  DEFAULT_ZOOM: 1,
  TILE_SIZE: 256,
  SETTLEMENT_MIN_RADIUS: 5,
  SETTLEMENT_MAX_RADIUS: 50,
} as const;

export const WEBSOCKET_EVENTS = {
  SETTLEMENT_UPDATE: 'settlement:update',
  WORLD_PLAYER_COUNT: 'world:playerCount',
  CHARACTER_UPDATE: 'character:update',
  QUEST_PROGRESS: 'quest:progress',
  MARKETPLACE_LISTING: 'marketplace:listing',
  FACTION_UPDATE: 'faction:update',
  COMBAT_START: 'combat:start',
  COMBAT_END: 'combat:end',
} as const;

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'dusk_auth_token',
  REFRESH_TOKEN: 'dusk_refresh_token',
  USER_PREFERENCES: 'dusk_user_preferences',
  SELECTED_CHARACTER: 'dusk_selected_character',
  MAP_VIEW_STATE: 'dusk_map_view_state',
} as const;

export const ROUTES = {
  HOME: '/',
  MAP: '/map',
  MAP_MOVEMENT: '/map/movement',
  MARKETPLACE: '/marketplace',
  DASHBOARD: '/dashboard',
  CHARACTER: '/character',
  CHARACTER_CREATE: '/character/create',
  CODEX: '/codex',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  SETTLEMENT: '/settlement',
  SETTLEMENT_TESTING: '/settlement/testing',
} as const;

export const QUERY_KEYS = {
  WORLDS: ['worlds'],
  WORLD: (id: number) => ['world', id],
  SETTLEMENTS: (worldId: number) => ['settlements', worldId],
  CHARACTERS: ['characters'],
  CHARACTER: (id: string) => ['character', id],
  MARKETPLACE_LISTINGS: ['marketplace', 'listings'],
  USER_NFTS: ['user', 'nfts'],
  QUEST_LOG: (characterId: string) => ['quest-log', characterId],
} as const;

export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
} as const;