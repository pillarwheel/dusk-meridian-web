import jwtDecode from 'jwt-decode';

interface IMXTokenClaims {
  sub: string;
  email?: string;
  wallet_address?: string;
  ether_key?: string;
  imx_eth_address?: string;
  zkevm_eth_address?: string;
  exp: number;
  iat: number;
  aud?: string;
  iss?: string;
}

interface Auth0TokenClaims {
  sub: string;
  email?: string;
  wallet_address?: string;
  exp: number;
  iat: number;
  aud?: string;
  iss?: string;
}

export interface TokenValidationResult {
  isValid: boolean;
  claims?: IMXTokenClaims | Auth0TokenClaims;
  error?: string;
}

/**
 * Validates a JWT token by checking its structure, expiration, and required claims
 */
export function validateToken(token: string, requiredClaims: string[] = ['sub']): TokenValidationResult {
  try {
    if (!token || token.trim() === '') {
      return { isValid: false, error: 'Token is empty or null' };
    }

    // Decode the JWT token
    const decoded = jwtDecode<IMXTokenClaims | Auth0TokenClaims>(token);

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return { isValid: false, error: 'Token is expired' };
    }

    // Check if token has valid issued time
    if (decoded.iat && decoded.iat > now + 300) { // Allow 5 minutes clock skew
      return { isValid: false, error: 'Token issued time is invalid' };
    }

    // Check required claims
    for (const claim of requiredClaims) {
      if (!decoded[claim as keyof typeof decoded]) {
        return { isValid: false, error: `Missing required claim: ${claim}` };
      }
    }

    return { isValid: true, claims: decoded };
  } catch (error) {
    return {
      isValid: false,
      error: `Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Validates IMX token specifically for backend requirements
 */
export function validateIMXToken(token: string): TokenValidationResult {
  // Strict validation for IMX tokens
  try {
    if (!token || token.trim() === '') {
      return { isValid: false, error: 'Token is empty or null' };
    }

    // Decode the JWT token
    const decoded = jwtDecode<IMXTokenClaims | Auth0TokenClaims>(token);

    // Check if token is expired (strict validation, no grace period)
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return { isValid: false, error: `Token is expired (expired at ${new Date(decoded.exp * 1000).toISOString()})` };
    }

    // For IMX tokens, only require 'sub' claim (not wallet_address or email)
    if (!decoded.sub) {
      return { isValid: false, error: 'Missing required sub claim' };
    }

    return { isValid: true, claims: decoded };
  } catch (error) {
    return {
      isValid: false,
      error: `IMX token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Validates Auth0 token specifically for backend requirements
 */
export function validateAuth0Token(token: string): TokenValidationResult {
  const result = validateToken(token, ['sub']);

  if (!result.isValid) {
    return result;
  }

  // Additional Auth0-specific validation can go here
  return result;
}

/**
 * Gets a valid IMX token from localStorage, clearing invalid ones
 */
export function getValidIMXToken(): string | null {
  try {
    const token = localStorage.getItem('imx_access_token');
    if (!token) {
      console.log('📝 No IMX token in localStorage');
      return null;
    }

    console.log('🔍 Checking IMX token validity...');
    const validation = validateIMXToken(token);
    console.log('🔍 IMX token validation result:', validation);

    if (validation.isValid) {
      console.log('✅ IMX token is valid, returning for API use');
      return token;
    }

    // Token is invalid - clear it and request fresh token
    console.warn('⚠️  IMX token validation failed:', validation.error);
    console.log('🔧 Clearing expired token and requesting refresh');

    clearIMXTokens();

    // Dispatch event to refresh authentication
    window.dispatchEvent(new CustomEvent('imx:token-expired'));

    return null;

  } catch (error) {
    console.error('❌ Error validating IMX token:', error);
    console.log('🔧 Clearing tokens on error');

    clearIMXTokens();
    return null;
  }
}

/**
 * Gets a valid Auth0 token from localStorage, clearing invalid ones
 */
export function getValidAuth0Token(): string | null {
  try {
    const token = localStorage.getItem('auth0_token');
    if (!token) {
      return null;
    }

    const validation = validateAuth0Token(token);
    if (validation.isValid) {
      return token;
    }

    // Token is invalid, clear it
    console.warn('Auth0 token validation failed:', validation.error);
    clearAuth0Tokens();
    return null;
  } catch (error) {
    console.error('Error validating Auth0 token:', error);
    clearAuth0Tokens();
    return null;
  }
}

/**
 * Clears IMX tokens from localStorage and global window object
 */
export function clearIMXTokens(): void {
  try {
    localStorage.removeItem('imx_access_token');
    localStorage.removeItem('imx_id_token');
    (window as any).__imx_current_token = null;
    console.log('Cleared invalid IMX tokens');
  } catch (error) {
    console.error('Error clearing IMX tokens:', error);
  }
}

/**
 * Clears Auth0 tokens from localStorage
 */
export function clearAuth0Tokens(): void {
  try {
    localStorage.removeItem('auth0_token');
    console.log('Cleared invalid Auth0 tokens');
  } catch (error) {
    console.error('Error clearing Auth0 tokens:', error);
  }
}

/**
 * Transform IMX token to add missing wallet_address claim
 */
export function transformIMXTokenForBackend(token: string): string {
  try {
    // Split the original token to preserve the original header and signature
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('ℹ️  Invalid token format, returning original');
      return token;
    }

    // Decode the original payload
    const originalPayload = JSON.parse(atob(tokenParts[1]));

    // Check if wallet_address is missing but we have alternative wallet fields
    const walletAddress = originalPayload.wallet_address ||
                         originalPayload.ether_key ||
                         originalPayload.imx_eth_address ||
                         originalPayload.zkevm_eth_address;

    // Always transform IMX tokens to ensure wallet_address is present
    if (walletAddress && (!originalPayload.wallet_address || originalPayload.wallet_address === undefined)) {
      console.log('🔧 Transforming IMX token: adding wallet_address from',
                  originalPayload.ether_key ? 'ether_key' :
                  originalPayload.imx_eth_address ? 'imx_eth_address' : 'zkevm_eth_address');

      // Create new payload with wallet_address added
      const transformedPayload = {
        ...originalPayload,
        wallet_address: walletAddress
      };

      // Create a new token preserving original header and signature
      const newPayloadEncoded = btoa(JSON.stringify(transformedPayload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const transformedToken = `${tokenParts[0]}.${newPayloadEncoded}.${tokenParts[2]}`;

      console.log('✅ Token transformed successfully');
      console.log('🔍 Added wallet_address:', walletAddress);
      console.log('🔍 Transformed token length:', transformedToken.length);

      return transformedToken;
    }

    // Token already has wallet_address
    if (originalPayload.wallet_address) {
      console.log('ℹ️  Token already has wallet_address:', originalPayload.wallet_address);
      return token;
    }

    // No wallet fields available
    console.log('⚠️  No wallet address fields found in token');
    return token;

  } catch (error) {
    console.error('❌ Token transformation failed:', error);
    console.log('🔄 Returning original token');
    return token;
  }
}

/**
 * Gets the best available valid token (IMX first, then Auth0 fallback)
 */
export function getBestValidToken(): string | null {
  // Try IMX token first
  const imxToken = getValidIMXToken();
  if (imxToken) {
    console.log('🎯 Returning original IMX token (preserving signature)');
    console.log('🔍 Backend will map ether_key → wallet_address automatically');
    return imxToken; // Send original unmodified token
  }

  // Fallback to Auth0 token
  const auth0Token = getValidAuth0Token();
  if (auth0Token) {
    console.log('🎯 Returning Auth0 token for API use');
    return auth0Token;
  }

  console.log('❌ No valid tokens available');
  return null;
}

/**
 * Clears all authentication tokens
 */
export function clearAllTokens(): void {
  clearIMXTokens();
  clearAuth0Tokens();
  console.log('Cleared all authentication tokens');
}