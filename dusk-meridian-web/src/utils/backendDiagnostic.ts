/**
 * Backend Diagnostic Utilities
 *
 * Test different token strategies with the backend to identify the exact authentication issues
 */

import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { API_ENDPOINTS } from './constants';
import { transformIMXTokenForBackend } from './tokenValidator';

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
 * Test character API with different token strategies
 */
export async function testBackendTokenStrategies(): Promise<void> {
  console.log('🔬 Starting backend token strategy diagnostics...');

  // Get the original IMX token
  const originalToken = localStorage.getItem('imx_access_token');
  if (!originalToken) {
    console.log('❌ No IMX token found in localStorage');
    return;
  }

  console.log('📊 Testing multiple token strategies with backend...');

  // Strategy 1: Original IMX token
  await testTokenStrategy('Original IMX Token', originalToken);

  // Strategy 2: Transformed token (with wallet_address)
  const transformedToken = transformIMXTokenForBackend(originalToken);
  await testTokenStrategy('Transformed Token', transformedToken);

  // Strategy 3: Test with no Authorization header
  await testTokenStrategy('No Token', null);

  // Strategy 4: Test with malformed token
  await testTokenStrategy('Malformed Token', 'invalid.token.here');
}

/**
 * Test a specific token strategy against the character API
 */
async function testTokenStrategy(strategyName: string, token: string | null): Promise<void> {
  console.log(`\n🧪 Testing Strategy: ${strategyName}`);
  console.log('=' .repeat(50));

  if (token) {
    // Decode and show token info
    try {
      const decoded = jwtDecode<IMXTokenClaims>(token);
      console.log('📝 Token Claims:', {
        sub: decoded.sub,
        email: decoded.email,
        wallet_address: decoded.wallet_address,
        ether_key: decoded.ether_key,
        exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'No expiry',
        tokenLength: token.length
      });
    } catch (e) {
      console.log('⚠️  Could not decode token');
    }
  }

  // Test the character API endpoint
  const testUrl = `${API_ENDPOINTS.CHARACTER_BASE_URL}/character/my-characters`;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log('🌐 Making request to:', testUrl);
    console.log('📤 Request headers:', Object.keys(headers));

    const response = await axios.get(testUrl, { headers });

    console.log('✅ SUCCESS!');
    console.log('📊 Response status:', response.status);
    console.log('📦 Response data:', Array.isArray(response.data) ? `Array with ${response.data.length} items` : response.data);

  } catch (error: any) {
    console.log('❌ FAILED');

    if (error.response) {
      console.log('📊 Response status:', error.response.status);
      console.log('📊 Response headers:', error.response.headers);
      console.log('📦 Response data:', error.response.data);

      // Analyze specific error types
      if (error.response.status === 401) {
        console.log('🔍 401 Analysis:');
        console.log('   - Authentication failed');
        console.log('   - Token may be invalid, expired, or missing required claims');

        if (error.response.data?.message) {
          console.log('   - Backend error message:', error.response.data.message);
        }
      } else if (error.response.status === 403) {
        console.log('🔍 403 Analysis:');
        console.log('   - Token is valid but lacks permissions');
      } else if (error.response.status === 500) {
        console.log('🔍 500 Analysis:');
        console.log('   - Backend server error');
        console.log('   - May indicate token processing issues');
      }
    } else {
      console.log('🌐 Network error:', error.message);
    }
  }

  console.log(''); // Add spacing
}

/**
 * Analyze backend requirements by testing minimal token structures
 */
export async function analyzeBackendRequirements(): Promise<void> {
  console.log('🔬 Analyzing backend authentication requirements...');

  const originalToken = localStorage.getItem('imx_access_token');
  if (!originalToken) {
    console.log('❌ No IMX token available for analysis');
    return;
  }

  try {
    const decoded = jwtDecode<IMXTokenClaims>(originalToken);

    // Test different claim combinations
    const testClaims = [
      { name: 'Minimal (sub only)', claims: { sub: decoded.sub } },
      { name: 'Sub + Email', claims: { sub: decoded.sub, email: decoded.email } },
      { name: 'Sub + Ether Key', claims: { sub: decoded.sub, ether_key: decoded.ether_key } },
      { name: 'Sub + Wallet Address', claims: { sub: decoded.sub, wallet_address: decoded.ether_key } },
      { name: 'Full Claims', claims: {
        sub: decoded.sub,
        email: decoded.email,
        wallet_address: decoded.ether_key,
        exp: decoded.exp,
        iat: decoded.iat
      }}
    ];

    console.log('🧪 Testing different claim combinations...');

    for (const test of testClaims) {
      const testToken = createTestToken(test.claims);
      await testTokenStrategy(`Test: ${test.name}`, testToken);
    }

  } catch (error) {
    console.error('❌ Failed to analyze backend requirements:', error);
  }
}

/**
 * Create a test JWT token with specific claims (for testing only)
 */
function createTestToken(claims: Record<string, any>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(claims));
  const signature = btoa('test-signature');
  return `${header}.${payload}.${signature}`;
}

/**
 * Run comprehensive backend diagnostics
 */
export async function runBackendDiagnostics(): Promise<void> {
  console.log('🚀 Starting comprehensive backend diagnostics...');
  console.log('This will help identify the exact authentication issue.');

  await testBackendTokenStrategies();
  await analyzeBackendRequirements();

  console.log('✅ Backend diagnostics complete!');
  console.log('Check the console logs above for detailed analysis.');
}

// Make functions available globally for easy testing
declare global {
  interface Window {
    testBackendTokens: () => Promise<void>;
    analyzeBackend: () => Promise<void>;
    runBackendDiag: () => Promise<void>;
  }
}

window.testBackendTokens = testBackendTokenStrategies;
window.analyzeBackend = analyzeBackendRequirements;
window.runBackendDiag = runBackendDiagnostics;