import React from 'react';
import { Auth0Provider as Auth0ProviderBase } from '@auth0/auth0-react';
import { AUTH0_CONFIG } from '../utils/constants';

interface Auth0ProviderProps {
  children: React.ReactNode;
}

export const Auth0Provider: React.FC<Auth0ProviderProps> = ({ children }) => {
  // Check if we have Auth0 configuration
  if (!AUTH0_CONFIG.CLIENT_ID) {
    console.warn('Auth0 Client ID not configured. Authentication features disabled.');
    return <>{children}</>;
  }

  try {
    return (
      <Auth0ProviderBase
        domain={AUTH0_CONFIG.DOMAIN}
        clientId={AUTH0_CONFIG.CLIENT_ID}
        authorizationParams={{
          redirect_uri: AUTH0_CONFIG.REDIRECT_URI,
          audience: AUTH0_CONFIG.AUDIENCE,
          scope: AUTH0_CONFIG.SCOPE,
        }}
        cacheLocation="localstorage"
        useRefreshTokens={true}
      >
        {children}
      </Auth0ProviderBase>
    );
  } catch (error) {
    console.error('Auth0Provider initialization error:', error);
    // Fallback to no auth if Auth0 fails to initialize
    return <>{children}</>;
  }
};