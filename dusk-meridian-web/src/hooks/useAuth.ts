import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { signalRClient } from '../services/signalr';

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    getIdTokenClaims,
  } = useAuth0();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(false);

  // Get access token and set it in API client
  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated && !tokenLoading) {
        setTokenLoading(true);
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: 'magewar',
              scope: 'openid profile email',
            },
          });

          setAccessToken(token);
          apiClient.setAuthToken(token);

          // Set up SignalR token provider
          signalRClient.setAuthTokenProvider(() => token);

          // Store token for API client to use
          localStorage.setItem('auth0_token', token);

        } catch (error) {
          console.error('Failed to get access token:', error);
        } finally {
          setTokenLoading(false);
        }
      }
    };

    getToken();
  }, [isAuthenticated, getAccessTokenSilently, tokenLoading]);

  // Connect to SignalR when authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken && !signalRClient.isConnected()) {
      signalRClient.connect().catch(error => {
        console.error('Failed to connect to SignalR:', error);
      });
    }
  }, [isAuthenticated, accessToken]);

  // Disconnect SignalR when logging out
  const handleLogout = async () => {
    try {
      await signalRClient.disconnect();
      localStorage.removeItem('auth0_token');
      apiClient.clearAuthToken();
      setAccessToken(null);
    } catch (error) {
      console.error('Error during logout cleanup:', error);
    } finally {
      logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      });
    }
  };

  const login = () => {
    loginWithRedirect({
      authorizationParams: {
        audience: 'magewar',
        scope: 'openid profile email',
      },
    });
  };

  return {
    // Auth0 user info
    user,
    isAuthenticated,
    isLoading: isLoading || tokenLoading,

    // Auth methods
    login,
    logout: handleLogout,

    // Token info
    accessToken,
    getAccessTokenSilently,
    getIdTokenClaims,

    // Utility methods
    getUserId: () => user?.sub || null,
    getUserEmail: () => user?.email || null,
    getUserName: () => user?.name || user?.nickname || null,
    getUserPicture: () => user?.picture || null,
  };
};