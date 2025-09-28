import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { validateIMXToken, clearIMXTokens } from '@/utils/tokenValidator';
// import { IMXAuthContextType, IMXAuthState, IMXUser, TransactionResult } from '@/api/types/imx';

interface IMXUser {
  sub: string;
  email?: string;
  nickname?: string;
  picture?: string;
  walletAddress?: string;
  accessToken?: string;
  idToken?: string;
}

interface IMXAuthState {
  user: IMXUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  walletAddress: string | null;
  provider: any | null;
}

interface TransactionResult {
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
}

interface IMXAuthContextType extends IMXAuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  connectWallet: () => Promise<string | null>;
  sendTransaction: (transaction: any) => Promise<TransactionResult>;
  refreshAuth: () => Promise<void>;
}
import { imxPassportService } from '@/services/imxPassport';

const IMXAuthContext = createContext<IMXAuthContextType | undefined>(undefined);

interface IMXAuthProviderProps {
  children: ReactNode;
}

export const IMXAuthProvider: React.FC<IMXAuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<IMXAuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    walletAddress: null,
    provider: null,
  });

  // Initialize authentication state on mount
  useEffect(() => {
    initializeAuth();
    setupTokenProvider();
    setupTokenRefreshListener();
  }, []);

  const setupTokenProvider = () => {
    // Provide current access token to API client when requested
    const handleTokenRequest = async () => {
      try {
        const token = await imxPassportService.getAccessToken();
        if (token) {
          const validation = validateIMXToken(token);
          if (validation.isValid) {
            (window as any).__imx_current_token = token;
          } else {
            console.warn('IMX token validation failed:', validation.error);
            clearIMXTokens();
            (window as any).__imx_current_token = null;
          }
        } else {
          (window as any).__imx_current_token = null;
        }
      } catch (error) {
        console.error('Error getting IMX token:', error);
        clearIMXTokens();
        (window as any).__imx_current_token = null;
      }
    };

    window.addEventListener('imx:get-token', handleTokenRequest);

    return () => {
      window.removeEventListener('imx:get-token', handleTokenRequest);
    };
  };

  const setupTokenRefreshListener = () => {
    // Listen for token expiration events and refresh authentication
    const handleTokenExpired = async () => {
      console.log('🔄 Token expired, attempting to refresh...');
      try {
        // Get fresh token from IMX Passport
        const freshToken = await imxPassportService.getAccessToken();
        if (freshToken) {
          const validation = validateIMXToken(freshToken);
          if (validation.isValid) {
            localStorage.setItem('imx_access_token', freshToken);
            console.log('✅ Fresh IMX token obtained and stored');

            // Update auth state with fresh data
            await initializeAuth();
          } else {
            console.warn('❌ Fresh token is also invalid:', validation.error);
            // Token is still invalid, user may need to re-login
            console.log('🚨 User may need to re-authenticate');
          }
        } else {
          console.log('❌ No fresh token available, user may need to re-login');
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    };

    window.addEventListener('imx:token-expired', handleTokenExpired);

    return () => {
      window.removeEventListener('imx:token-expired', handleTokenExpired);
    };
  };

  const initializeAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      if (!imxPassportService.isConfigured()) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'IMX Passport not configured. Please check your environment variables.',
        }));
        return;
      }

      const isAuth = await imxPassportService.isAuthenticated();

      if (isAuth) {
        const userInfo = await imxPassportService.getUserInfo();
        let walletAddress = null;
        let provider = null;

        // Try to get wallet address and provider (may fail if chain is not configured)
        try {
          walletAddress = await imxPassportService.getWalletAddress();
        } catch (walletError) {
          console.warn('Could not get wallet address during initialization:', walletError);
          if (walletError instanceof Error && walletError.message.includes('chain')) {
            console.warn('Chain setup error detected during wallet address retrieval.');
          }
        }

        try {
          provider = await imxPassportService.getProvider();
        } catch (providerError) {
          console.warn('Could not get provider during initialization:', providerError);
          if (providerError instanceof Error && providerError.message.includes('chain')) {
            console.warn('Chain setup error detected during provider initialization.');
          }
        }

        if (userInfo) {
          const accessToken = await imxPassportService.getAccessToken();
          const idToken = await imxPassportService.getIdToken();

          // Store tokens in localStorage for API client access (with debug logging)
          if (accessToken) {
            console.log('🔍 IMX Access Token received during init:', {
              length: accessToken.length,
              preview: accessToken.substring(0, 50) + '...'
            });

            const validation = validateIMXToken(accessToken);
            console.log('🔍 IMX Token validation result:', validation);

            if (validation.isValid) {
              localStorage.setItem('imx_access_token', accessToken);
              console.log('✅ IMX access token stored in localStorage');
            } else {
              console.warn('❌ IMX access token validation failed during init:', validation.error);
              console.warn('🔍 Raw token for manual inspection:', accessToken);
              // Don't clear tokens immediately - let them persist for debugging
              localStorage.setItem('imx_access_token', accessToken); // Store anyway for debugging
              console.log('🚨 Stored invalid token for debugging purposes');
            }
          } else {
            console.log('❌ No IMX access token received during initialization');
          }
          if (idToken) {
            localStorage.setItem('imx_id_token', idToken);
          }

          const user: IMXUser = {
            sub: userInfo.sub,
            email: userInfo.email,
            nickname: userInfo.nickname,
            picture: userInfo.picture,
            walletAddress,
            accessToken,
            idToken,
          };

          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            walletAddress,
            provider,
          });
          return;
        }
      }

      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication initialization failed',
      }));
    }
  };

  const login = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const user = await imxPassportService.login();

      if (user) {
        let provider = null;
        try {
          provider = await imxPassportService.getProvider();
        } catch (providerError) {
          console.warn('Could not initialize provider:', providerError);
          if (providerError instanceof Error && providerError.message.includes('chain')) {
            console.warn('Chain setup error detected. Authentication will continue without wallet provider.');
          }
        }

        // Store tokens in localStorage for API client access (with debug logging)
        if (user.accessToken) {
          console.log('🔍 IMX Access Token received during login:', {
            length: user.accessToken.length,
            preview: user.accessToken.substring(0, 50) + '...'
          });

          const validation = validateIMXToken(user.accessToken);
          console.log('🔍 IMX Token validation result during login:', validation);

          if (validation.isValid) {
            localStorage.setItem('imx_access_token', user.accessToken);
            console.log('✅ IMX access token stored in localStorage during login');
          } else {
            console.warn('❌ IMX access token validation failed during login:', validation.error);
            console.warn('🔍 Raw token for manual inspection:', user.accessToken);
            // Store anyway for debugging
            localStorage.setItem('imx_access_token', user.accessToken);
            console.log('🚨 Stored invalid token for debugging purposes during login');
          }
        } else {
          console.log('❌ No IMX access token received during login');
        }
        if (user.idToken) {
          localStorage.setItem('imx_id_token', user.idToken);
        }

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          walletAddress: user.walletAddress || null,
          provider,
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Login failed - no user returned',
        }));
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      await imxPassportService.logout();

      // Clear stored tokens
      localStorage.removeItem('imx_access_token');
      localStorage.removeItem('imx_id_token');
      (window as any).__imx_current_token = null;

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        walletAddress: null,
        provider: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
    }
  };

  const connectWallet = async (): Promise<string | null> => {
    try {
      setAuthState(prev => ({ ...prev, error: null }));

      const walletAddress = await imxPassportService.connectWallet();

      if (walletAddress) {
        let provider = null;
        try {
          provider = await imxPassportService.getProvider();
        } catch (providerError) {
          console.warn('Could not get provider after wallet connection:', providerError);
          if (providerError instanceof Error && providerError.message.includes('chain')) {
            console.warn('Chain setup error detected during wallet connection.');
          }
        }

        setAuthState(prev => ({
          ...prev,
          walletAddress,
          provider,
          user: prev.user ? { ...prev.user, walletAddress } : null,
        }));
      }

      return walletAddress;
    } catch (error) {
      console.error('Wallet connection error:', error);
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Wallet connection failed',
      }));
      return null;
    }
  };

  const sendTransaction = async (transaction: any): Promise<TransactionResult> => {
    try {
      setAuthState(prev => ({ ...prev, error: null }));

      return await imxPassportService.sendTransaction(transaction);
    } catch (error) {
      console.error('Transaction error:', error);
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Transaction failed',
      }));
      throw error;
    }
  };

  const refreshAuth = async (): Promise<void> => {
    await initializeAuth();
  };

  const contextValue: IMXAuthContextType = {
    ...authState,
    login,
    logout,
    connectWallet,
    sendTransaction,
    refreshAuth,
  };

  return (
    <IMXAuthContext.Provider value={contextValue}>
      {children}
    </IMXAuthContext.Provider>
  );
};

export const useIMXAuth = (): IMXAuthContextType => {
  const context = useContext(IMXAuthContext);
  if (context === undefined) {
    throw new Error('useIMXAuth must be used within an IMXAuthProvider');
  }
  return context;
};