import {
  validateIMXToken,
  validateAuth0Token,
  clearIMXTokens,
  clearAuth0Tokens,
  clearAllTokens,
  getBestValidToken
} from './tokenValidator';

/**
 * Debug utilities for authentication testing
 */
export const authDebug = {
  /**
   * Check the status of all stored tokens
   */
  checkTokens() {
    console.log('=== Authentication Debug ===');

    const imxToken = localStorage.getItem('imx_access_token');
    const auth0Token = localStorage.getItem('auth0_token');
    const imxIdToken = localStorage.getItem('imx_id_token');

    console.log('📦 Stored Tokens:');
    console.log('  IMX Access Token:', imxToken ? 'Present' : 'Missing');
    console.log('  IMX ID Token:', imxIdToken ? 'Present' : 'Missing');
    console.log('  Auth0 Token:', auth0Token ? 'Present' : 'Missing');

    if (imxToken) {
      const imxValidation = validateIMXToken(imxToken);
      console.log('  IMX Token Valid:', imxValidation.isValid);
      if (!imxValidation.isValid) {
        console.log('  IMX Token Error:', imxValidation.error);
      } else {
        console.log('  IMX Token Claims:', imxValidation.claims);
      }
    }

    if (auth0Token) {
      const auth0Validation = validateAuth0Token(auth0Token);
      console.log('  Auth0 Token Valid:', auth0Validation.isValid);
      if (!auth0Validation.isValid) {
        console.log('  Auth0 Token Error:', auth0Validation.error);
      } else {
        console.log('  Auth0 Token Claims:', auth0Validation.claims);
      }
    }

    const bestToken = getBestValidToken();
    console.log('🎯 Best Valid Token:', bestToken ? 'Found' : 'None');

    console.log('============================');
  },

  /**
   * Clear all invalid tokens
   */
  clearInvalidTokens() {
    console.log('🧹 Clearing invalid tokens...');

    const imxToken = localStorage.getItem('imx_access_token');
    const auth0Token = localStorage.getItem('auth0_token');

    if (imxToken && !validateIMXToken(imxToken).isValid) {
      clearIMXTokens();
      console.log('✅ Cleared invalid IMX tokens');
    }

    if (auth0Token && !validateAuth0Token(auth0Token).isValid) {
      clearAuth0Tokens();
      console.log('✅ Cleared invalid Auth0 tokens');
    }

    console.log('🏁 Token cleanup complete');
  },

  /**
   * Force clear all tokens
   */
  clearAllTokens() {
    console.log('🗑️  Clearing ALL tokens...');
    clearAllTokens();
    console.log('✅ All tokens cleared');
  },

  /**
   * Test API call with current authentication
   */
  async testApiCall() {
    console.log('🔗 Testing API call...');

    try {
      const response = await fetch('http://localhost:5105/api/character/my-characters', {
        headers: {
          'Authorization': `Bearer ${getBestValidToken()}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 API Response Status:', response.status);
      console.log('📡 API Response Headers:', Object.fromEntries(response.headers));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Success:', data);
      } else {
        const errorText = await response.text();
        console.log('❌ API Error:', errorText);
      }
    } catch (error) {
      console.error('💥 API Call Failed:', error);
    }
  },

  /**
   * Test authentication flow step by step
   */
  async testAuthFlow() {
    console.log('🔐 Testing Authentication Flow...');

    // Step 1: Check initial state
    console.log('\n1️⃣ Initial State:');
    this.checkTokens();

    // Step 2: Clear invalid tokens
    console.log('\n2️⃣ Clearing Invalid Tokens:');
    this.clearInvalidTokens();

    // Step 3: Check state after cleanup
    console.log('\n3️⃣ State After Cleanup:');
    this.checkTokens();

    // Step 4: Test API call
    console.log('\n4️⃣ Testing API Call:');
    await this.testApiCall();

    console.log('\n🏁 Authentication flow test complete');
  }
};

// Make available globally for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).authDebug = authDebug;
}