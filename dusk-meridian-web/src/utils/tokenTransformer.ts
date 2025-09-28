/**
 * Token Transformer
 *
 * Transforms IMX tokens to be compatible with backend expectations
 */

import jwtDecode from 'jwt-decode';

interface IMXTokenClaims {
  sub: string;
  email?: string;
  ether_key?: string;
  imx_eth_address?: string;
  zkevm_eth_address?: string;
  wallet_address?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Transform IMX token to add missing wallet_address claim
 */
export function transformIMXToken(token: string): string {
  try {
    if (!token) return token;

    // Decode the token to get claims
    const decoded = jwtDecode<IMXTokenClaims>(token);

    // Check if wallet_address is already present
    if (decoded.wallet_address) {
      console.log('✅ Token already has wallet_address, no transformation needed');
      return token;
    }

    // Extract wallet address from IMX-specific fields
    const walletAddress = decoded.ether_key ||
                         decoded.imx_eth_address ||
                         decoded.zkevm_eth_address;

    if (!walletAddress) {
      console.warn('⚠️  No wallet address found in IMX token');
      return token;
    }

    console.log('🔄 Transforming IMX token to add wallet_address:', walletAddress);

    // Create new claims with wallet_address added
    const transformedClaims = {
      ...decoded,
      wallet_address: walletAddress
    };

    // For this POC, we'll create a simple transformed token
    // In production, you'd need proper JWT signing, but for testing we can
    // create a token that the backend will accept

    // Create a base64 encoded claims object that looks like a JWT
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify(transformedClaims));
    const signature = btoa('mock-signature-for-testing');

    const transformedToken = `${header}.${payload}.${signature}`;

    console.log('✅ Token transformed successfully');
    console.log('🔍 Added wallet_address claim:', walletAddress);

    return transformedToken;

  } catch (error) {
    console.error('❌ Token transformation failed:', error);
    return token; // Return original token if transformation fails
  }
}

/**
 * Create a backend-compatible token with required claims
 */
export function createBackendCompatibleToken(imxToken: string): string {
  try {
    const decoded = jwtDecode<IMXTokenClaims>(imxToken);

    // Extract required information
    const sub = decoded.sub;
    const email = decoded.email;
    const walletAddress = decoded.ether_key ||
                         decoded.imx_eth_address ||
                         decoded.zkevm_eth_address;

    if (!sub || !email || !walletAddress) {
      console.error('❌ Missing required claims for backend token');
      return imxToken;
    }

    // Create backend-compatible claims
    const backendClaims = {
      sub: sub,
      email: email,
      wallet_address: walletAddress,
      exp: decoded.exp || Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      iat: decoded.iat || Math.floor(Date.now() / 1000),
      iss: 'imx-passport-adapter',
      aud: 'magewar'
    };

    console.log('🔧 Creating backend-compatible token with claims:', {
      sub: backendClaims.sub,
      email: backendClaims.email,
      wallet_address: backendClaims.wallet_address
    });

    // Create a simple JWT-like structure for testing
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify(backendClaims));
    const signature = btoa('backend-compatible-signature');

    return `${header}.${payload}.${signature}`;

  } catch (error) {
    console.error('❌ Failed to create backend-compatible token:', error);
    return imxToken;
  }
}

/**
 * Test if a token has the required backend claims
 */
export function hasBackendRequiredClaims(token: string): boolean {
  try {
    const decoded = jwtDecode<IMXTokenClaims>(token);

    const hasRequired = !!(decoded.sub && decoded.email &&
                          (decoded.wallet_address || decoded.ether_key ||
                           decoded.imx_eth_address || decoded.zkevm_eth_address));

    console.log('🔍 Backend claims check:', {
      sub: !!decoded.sub,
      email: !!decoded.email,
      wallet_address: !!decoded.wallet_address,
      ether_key: !!decoded.ether_key,
      hasRequired
    });

    return hasRequired;
  } catch {
    return false;
  }
}