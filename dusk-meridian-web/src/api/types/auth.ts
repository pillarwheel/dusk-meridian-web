export interface User {
  id: string;
  username: string;
  email: string;
  walletAddress?: string;
  profileImage?: string;
  joinedAt: string;
  lastActive: string;
  isOnline: boolean;
  preferences: UserPreferences;
  stats: UserStats;
  subscription?: UserSubscription;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  gameplay: GameplaySettings;
}

export interface NotificationSettings {
  email: boolean;
  browser: boolean;
  ingame: boolean;
  quest_completed: boolean;
  settlement_attacked: boolean;
  marketplace_activity: boolean;
  system_announcements: boolean;
}

export interface PrivacySettings {
  show_online_status: boolean;
  show_character_stats: boolean;
  allow_friend_requests: boolean;
  show_in_leaderboards: boolean;
}

export interface GameplaySettings {
  auto_accept_guild_invites: boolean;
  auto_decline_duels: boolean;
  show_damage_numbers: boolean;
  enable_pvp: boolean;
  ui_scale: number;
  sound_volume: number;
  music_volume: number;
}

export interface UserStats {
  totalPlayTime: number; // in seconds
  charactersCreated: number;
  questsCompleted: number;
  settlementsJoined: number;
  achievementsUnlocked: number;
  nftsOwned: number;
  totalSpent: string; // in wei
  totalEarned: string; // in wei
}

export interface UserSubscription {
  type: 'basic' | 'premium' | 'vip';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  benefits: string[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: 'Bearer';
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password?: string;
  walletAddress?: string;
  signature?: string;
  message?: string;
  provider?: 'email' | 'wallet' | 'immutable';
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  isFirstLogin: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password?: string;
  walletAddress?: string;
  signature?: string;
  message?: string;
  referralCode?: string;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
  verificationRequired: boolean;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordResponse {
  message: string;
  resetToken?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  profileImage?: string;
  preferences?: Partial<UserPreferences>;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface WalletConnection {
  address: string;
  chainId: number;
  provider: string;
  isConnected: boolean;
  balance?: {
    eth: string;
    dusk: string;
    plr: string;
  };
}

export interface Session {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}