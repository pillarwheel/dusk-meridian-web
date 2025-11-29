import { config, passport } from '@imtbl/sdk';
// import { IMXUser, TransactionResult } from '@/api/types/imx';

interface IMXUser {
  sub: string;
  email?: string;
  nickname?: string;
  picture?: string;
  walletAddress?: string;
  accessToken?: string;
  idToken?: string;
}

interface TransactionResult {
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
}

interface IMXConfig {
  clientId: string;
  publishableKey: string;
  environment: 'SANDBOX' | 'PRODUCTION';
  redirectUri: string;
  logoutRedirectUri: string;
}

class IMXPassportService {
  private passportInstance: passport.Passport | null = null;
  private config: IMXConfig;

  constructor() {
    // Get current port from window location or fallback to env
    const currentPort = window.location.port || '8080';
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:${currentPort}`;

    this.config = {
      clientId: import.meta.env.VITE_IMX_CLIENT_ID,
      publishableKey: import.meta.env.VITE_IMX_PUBLISHABLE_KEY,
      environment: import.meta.env.VITE_IMX_ENVIRONMENT as 'SANDBOX' | 'PRODUCTION',
      redirectUri: `${baseUrl}/redirect`,
      logoutRedirectUri: `${baseUrl}/logout`,
    };

    this.validateConfiguration();
    this.initialize();
  }

  private validateConfiguration() {
    const missingVars = [];

    if (!this.config.clientId) missingVars.push('VITE_IMX_CLIENT_ID');
    if (!this.config.publishableKey) missingVars.push('VITE_IMX_PUBLISHABLE_KEY');
    if (!this.config.environment) missingVars.push('VITE_IMX_ENVIRONMENT');

    if (missingVars.length > 0) {
      console.error('Missing required IMX environment variables:', missingVars);
      console.error('Please ensure these variables are set in your .env file');
    }

    // Check if we're using placeholder values
    if (this.config.clientId === 'your_imx_client_id_here') {
      console.warn('IMX Client ID appears to be a placeholder. Please set the correct value in .env');
    }

    if (this.config.publishableKey === 'your_imx_publishable_key_here') {
      console.warn('IMX Publishable Key appears to be a placeholder. Please set the correct value in .env');
    }
  }

  private initialize() {
    try {
      // Only initialize if we have valid configuration
      if (!this.config.clientId || !this.config.publishableKey ||
          this.config.clientId === 'your_imx_client_id_here' ||
          this.config.publishableKey === 'your_imx_publishable_key_here') {
        console.warn('IMX Passport configuration incomplete. Running in demo mode without blockchain features.');
        return;
      }

      // Get chain ID from environment
      const chainId = import.meta.env.VITE_CHAIN_ID || '13371';

      this.passportInstance = new passport.Passport({
        baseConfig: {
          environment: this.config.environment === 'SANDBOX'
            ? config.Environment.SANDBOX
            : config.Environment.PRODUCTION,
          publishableKey: this.config.publishableKey,
        },
        clientId: this.config.clientId,
        redirectUri: this.config.redirectUri,
        logoutRedirectUri: this.config.logoutRedirectUri,
        audience: 'platform_api',
        scope: 'openid offline_access email transact',
      });

      console.log('IMX Passport initialized with config:', {
        environment: this.config.environment,
        chainId: chainId,
        clientId: this.config.clientId ? '[CONFIGURED]' : '[MISSING]',
        publishableKey: this.config.publishableKey ? '[CONFIGURED]' : '[MISSING]',
      });
    } catch (error) {
      console.error('Failed to initialize IMX Passport:', error);
      console.warn('App will continue without blockchain features');
    }
  }

  async login(): Promise<IMXUser | null> {
    if (!this.passportInstance) {
      console.warn('IMX Passport not initialized. Please configure IMX environment variables.');
      return null;
    }

    try {
      const userProfile = await this.passportInstance.login();

      if (userProfile) {
        const user: IMXUser = {
          sub: userProfile.sub,
          email: userProfile.email,
          nickname: userProfile.nickname,
          picture: userProfile.picture,
          accessToken: userProfile.accessToken,
          idToken: userProfile.idToken,
        };

        // Try to get wallet address
        try {
          const walletAddress = await this.getWalletAddress();
          user.walletAddress = walletAddress;
        } catch (walletError) {
          console.warn('Could not get wallet address:', walletError);
        }

        return user;
      }

      return null;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async loginCallback(): Promise<void> {
    if (!this.passportInstance) {
      console.warn('IMX Passport not initialized. Please configure IMX environment variables.');
      return null;
    }

    try {
      await this.passportInstance.loginCallback();
    } catch (error) {
      console.error('Login callback failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (!this.passportInstance) {
      console.warn('IMX Passport not initialized. Please configure IMX environment variables.');
      return null;
    }

    try {
      await this.passportInstance.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async connectWallet(): Promise<string | null> {
    if (!this.passportInstance) {
      console.warn('IMX Passport not initialized. Please configure IMX environment variables.');
      return null;
    }

    try {
      console.log('Attempting to connect EVM provider...');
      const provider = await this.passportInstance.connectEvm();
      console.log('EVM provider connected successfully');

      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });

      console.log('Wallet accounts retrieved:', accounts.length > 0 ? '[ACCOUNTS_FOUND]' : '[NO_ACCOUNTS]');
      return accounts[0] || null;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      if (error instanceof Error && error.message.includes('chain')) {
        console.error('Chain setup error detected. Check environment configuration.');
      }
      throw error;
    }
  }

  async getWalletAddress(): Promise<string | null> {
    if (!this.passportInstance) {
      console.warn('IMX Passport not initialized. Please configure IMX environment variables.');
      return null;
    }

    try {
      const provider = await this.passportInstance.connectEvm();
      const accounts = await provider.request({
        method: 'eth_accounts'
      });

      return accounts[0] || null;
    } catch (error) {
      console.error('Failed to get wallet address:', error);
      if (error instanceof Error && error.message.includes('chain')) {
        console.error('Chain setup error when getting wallet address. This is likely due to provider configuration.');
      }
      return null;
    }
  }

  async getProvider() {
    if (!this.passportInstance) {
      console.warn('IMX Passport not initialized. Please configure IMX environment variables.');
      return null;
    }

    try {
      return await this.passportInstance.connectEvm();
    } catch (error) {
      console.error('Failed to get EVM provider:', error);
      if (error instanceof Error && error.message.includes('chain')) {
        console.error('Chain setup error when getting provider. Check IMX environment configuration.');
      }
      throw error;
    }
  }

  async sendTransaction(transaction: any): Promise<TransactionResult> {
    if (!this.passportInstance) {
      console.warn('IMX Passport not initialized. Please configure IMX environment variables.');
      return null;
    }

    try {
      const provider = await this.passportInstance.connectEvm();

      // Use zkEVM gasless transaction if available
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transaction],
      });

      return {
        transactionHash: txHash,
        status: 'pending',
      };
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  async getUserInfo(): Promise<passport.UserProfile | null> {
    if (!this.passportInstance) {
      return null;
    }

    try {
      return await this.passportInstance.getUserInfo();
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  async getIdToken(): Promise<string | null> {
    if (!this.passportInstance) {
      return null;
    }

    try {
      return await this.passportInstance.getIdToken();
    } catch (error) {
      console.error('Failed to get ID token:', error);
      return null;
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.passportInstance) {
      return null;
    }

    try {
      return await this.passportInstance.getAccessToken();
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.passportInstance) {
      return false;
    }

    try {
      const userInfo = await this.getUserInfo();
      return !!userInfo;
    } catch (error) {
      return false;
    }
  }

  getConfig(): IMXConfig {
    return this.config;
  }

  isConfigured(): boolean {
    return !!(
      this.config.clientId &&
      this.config.publishableKey &&
      this.config.environment &&
      this.config.redirectUri &&
      this.config.logoutRedirectUri
    );
  }
}

// Export singleton instance
export const imxPassportService = new IMXPassportService();