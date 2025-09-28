/**
 * Authentication Test Utilities
 *
 * Use these functions in the browser console to test the fixed authentication flow
 */

import { authDebug } from './authDebug';
import { getBestValidToken, clearAllTokens } from './tokenValidator';

export const authTest = {
  /**
   * Complete authentication flow test
   */
  async runFullTest() {
    console.log('🚀 Starting Authentication Flow Test...');
    console.log('=====================================');

    try {
      // Test 1: Check initial state
      console.log('\n1️⃣ Initial Authentication State:');
      authDebug.checkTokens();

      // Test 2: Clear any invalid tokens
      console.log('\n2️⃣ Cleaning Invalid Tokens:');
      authDebug.clearInvalidTokens();

      // Test 3: Test token retrieval
      console.log('\n3️⃣ Testing Token Retrieval:');
      const token = getBestValidToken();
      console.log('Best Valid Token:', token ? 'Found' : 'None available');

      // Test 4: Test API call to character endpoint
      console.log('\n4️⃣ Testing Character API Endpoint:');
      await this.testCharacterEndpoint();

      // Test 5: Test health endpoint
      console.log('\n5️⃣ Testing Health Endpoint:');
      await this.testHealthEndpoint();

      console.log('\n✅ Authentication flow test completed');
      console.log('=====================================');

    } catch (error) {
      console.error('\n❌ Authentication test failed:', error);
      console.log('=====================================');
    }
  },

  /**
   * Test the character endpoint specifically
   */
  async testCharacterEndpoint() {
    const token = getBestValidToken();

    if (!token) {
      console.log('❌ No valid token available for character endpoint test');
      return;
    }

    try {
      const response = await fetch('http://localhost:5105/api/character/my-characters', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('📡 Character API Response:');
      console.log('  Status:', response.status);
      console.log('  Status Text:', response.statusText);
      console.log('  Headers:', Object.fromEntries(response.headers));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Character API Success');
        console.log('  Response Data:', data);
      } else {
        const errorText = await response.text();
        console.log('❌ Character API Error');
        console.log('  Error Response:', errorText);

        if (response.status === 401) {
          console.log('🔑 Token appears to be invalid or expired');
        } else if (response.status === 500) {
          console.log('🔧 Server error - check backend token validation');
        }
      }
    } catch (error) {
      console.error('💥 Character API call failed:', error);
    }
  },

  /**
   * Test the health endpoint
   */
  async testHealthEndpoint() {
    try {
      const response = await fetch('http://localhost:5105/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('📡 Health API Response:');
      console.log('  Status:', response.status);
      console.log('  Status Text:', response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Health endpoint is working');
        console.log('  Health Data:', data);
      } else {
        console.log('❌ Health endpoint error');
      }
    } catch (error) {
      console.error('💥 Health endpoint call failed:', error);
    }
  },

  /**
   * Force clear all tokens and test recovery
   */
  async testTokenRecovery() {
    console.log('🧹 Testing Token Recovery Flow...');

    // Clear all tokens
    clearAllTokens();
    console.log('  Cleared all tokens');

    // Check state
    authDebug.checkTokens();

    // Try API call (should fail)
    console.log('  Testing API call without tokens (should fail):');
    await this.testCharacterEndpoint();

    console.log('✅ Token recovery test completed');
    console.log('   You can now try logging in again to restore authentication');
  },

  /**
   * Quick status check
   */
  quickCheck() {
    console.log('⚡ Quick Authentication Check:');

    const token = getBestValidToken();
    const hasIMX = localStorage.getItem('imx_access_token');
    const hasAuth0 = localStorage.getItem('auth0_token');

    console.log('  Best Valid Token:', token ? '✅ Available' : '❌ None');
    console.log('  IMX Token Stored:', hasIMX ? '✅ Yes' : '❌ No');
    console.log('  Auth0 Token Stored:', hasAuth0 ? '✅ Yes' : '❌ No');

    if (token) {
      console.log('  ✅ Ready to make authenticated API calls');
    } else {
      console.log('  ❌ Authentication required');
    }
  }
};

// Make available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).authTest = authTest;
}