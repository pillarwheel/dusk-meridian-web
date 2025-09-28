import { apiClient } from '../client';
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  UpdateProfileRequest,
  VerifyEmailRequest,
  RefreshTokenRequest,
  AuthTokens,
  Session
} from '../types';

export const authApi = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', request);
    return response.data;
  },

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', request);
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async refreshToken(request: RefreshTokenRequest): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>('/auth/refresh', request);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  async updateProfile(request: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.patch<User>('/auth/profile', request);
    return response.data;
  },

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/auth/change-password', request);
  },

  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', request);
    return response.data;
  },

  async confirmResetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/confirm-reset-password', {
      token,
      newPassword,
    });
  },

  async verifyEmail(request: VerifyEmailRequest): Promise<void> {
    await apiClient.post('/auth/verify-email', request);
  },

  async resendVerificationEmail(): Promise<void> {
    await apiClient.post('/auth/resend-verification');
  },

  async connectWallet(address: string, signature: string, message: string): Promise<User> {
    const response = await apiClient.post<User>('/auth/connect-wallet', {
      address,
      signature,
      message,
    });
    return response.data;
  },

  async disconnectWallet(): Promise<User> {
    const response = await apiClient.post<User>('/auth/disconnect-wallet');
    return response.data;
  },

  async loginWithWallet(address: string, signature: string, message: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/wallet-login', {
      address,
      signature,
      message,
    });
    return response.data;
  },

  async loginWithImmutable(accessToken: string, idToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/immutable-login', {
      accessToken,
      idToken,
    });
    return response.data;
  },

  async getSessions(): Promise<Session[]> {
    const response = await apiClient.get<Session[]>('/auth/sessions');
    return response.data;
  },

  async revokeSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/auth/sessions/${sessionId}`);
  },

  async revokeAllSessions(): Promise<void> {
    await apiClient.delete('/auth/sessions');
  },

  async enable2FA(): Promise<{
    qrCode: string;
    secret: string;
    backupCodes: string[];
  }> {
    const response = await apiClient.post('/auth/2fa/enable');
    return response.data;
  },

  async confirm2FA(token: string): Promise<void> {
    await apiClient.post('/auth/2fa/confirm', { token });
  },

  async disable2FA(token: string): Promise<void> {
    await apiClient.post('/auth/2fa/disable', { token });
  },

  async verify2FA(token: string): Promise<void> {
    await apiClient.post('/auth/2fa/verify', { token });
  },

  async generateBackupCodes(): Promise<string[]> {
    const response = await apiClient.post<string[]>('/auth/2fa/backup-codes');
    return response.data;
  },

  async getAuthProviders(): Promise<Array<{
    provider: string;
    name: string;
    enabled: boolean;
    connected: boolean;
    connectUrl?: string;
  }>> {
    const response = await apiClient.get('/auth/providers');
    return response.data;
  },

  async connectProvider(provider: string, authCode: string): Promise<User> {
    const response = await apiClient.post<User>(`/auth/providers/${provider}/connect`, {
      authCode,
    });
    return response.data;
  },

  async disconnectProvider(provider: string): Promise<User> {
    const response = await apiClient.delete<User>(`/auth/providers/${provider}`);
    return response.data;
  },

  async deleteAccount(confirmation: string): Promise<void> {
    await apiClient.delete('/auth/account', {
      data: { confirmation },
    });
  },

  async exportUserData(): Promise<{
    url: string;
    expiresAt: string;
  }> {
    const response = await apiClient.post('/auth/export-data');
    return response.data;
  }
};