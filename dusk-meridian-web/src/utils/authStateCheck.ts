/**
 * Authentication State Checker
 *
 * Run this to diagnose current authentication state and get next steps
 */

import { authDebug } from './authDebug';
import { getBestValidToken } from './tokenValidator';

export const authStateCheck = {
  /**
   * Complete authentication state analysis
   */
  diagnoseAuthState() {
    console.log('🔐 Authentication State Diagnosis');
    console.log('=====================================');

    // Check tokens
    console.log('\n📋 Step 1: Token Status');
    authDebug.checkTokens();

    // Check authentication context
    console.log('\n👤 Step 2: Authentication Context Status');
    this.checkAuthContext();

    // Check localStorage
    console.log('\n💾 Step 3: LocalStorage Analysis');
    this.checkLocalStorage();

    // Provide recommendations
    console.log('\n💡 Step 4: Recommendations');
    this.provideRecommendations();
  },

  /**
   * Check React authentication context state
   */
  checkAuthContext() {
    // Check if we can access the auth context state
    try {
      const imxContext = (window as any).React?.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentDispatcher?.current;

      console.log('🔍 Auth Context Check:');

      // Check for IMX auth context signs in DOM or global variables
      const hasIMXUser = !!(window as any).__imx_current_token;
      const hasAuth0Context = !!(window as any).auth0;

      console.log(`   IMX Token Available: ${hasIMXUser ? '✅' : '❌'}`);
      console.log(`   Auth0 Context: ${hasAuth0Context ? '✅' : '❌'}`);

      // Check page URL for auth callbacks
      const currentUrl = window.location.href;
      const isAuthCallback = currentUrl.includes('/redirect') || currentUrl.includes('/callback');
      console.log(`   On Auth Callback Page: ${isAuthCallback ? '✅' : '❌'}`);

    } catch (error) {
      console.log('   Could not access auth context details');
    }
  },

  /**
   * Analyze localStorage for auth data
   */
  checkLocalStorage() {
    const authKeys = [
      'imx_access_token',
      'imx_id_token',
      'auth0_token',
      'auth0_user',
      'dusk_auth_token',
      'dusk_refresh_token'
    ];

    console.log('🗃️  LocalStorage Auth Data:');

    let hasAnyTokens = false;
    authKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        hasAnyTokens = true;
        console.log(`   ${key}: ✅ Present (${value.length} chars)`);
      } else {
        console.log(`   ${key}: ❌ Missing`);
      }
    });

    if (!hasAnyTokens) {
      console.log('\n🚨 No authentication tokens found in localStorage');
      console.log('   This indicates the user has not logged in yet');
    }
  },

  /**
   * Provide specific recommendations based on current state
   */
  provideRecommendations() {
    const token = getBestValidToken();
    const hasIMXToken = !!localStorage.getItem('imx_access_token');
    const hasAuth0Token = !!localStorage.getItem('auth0_token');
    const currentUrl = window.location.pathname;

    console.log('🎯 Recommended Next Steps:');

    if (!token && !hasIMXToken && !hasAuth0Token) {
      console.log('\n❌ No valid tokens found');
      console.log('   Problem: User is not authenticated');
      console.log('   Solution: User needs to log in');
      console.log('   Action: Navigate to login page or trigger login flow');

      if (currentUrl !== '/login') {
        console.log('\n🔄 Quick Fix:');
        console.log('   1. Navigate to: http://localhost:8080/login');
        console.log('   2. OR click the login button in the UI');
        console.log('   3. OR run: window.location.href = "/login"');
      }

    } else if (hasIMXToken || hasAuth0Token) {
      console.log('\n⚠️  Tokens present but invalid');
      console.log('   Problem: Stored tokens are expired or malformed');
      console.log('   Solution: Clear tokens and re-login');
      console.log('   Action: Run authDebug.clearAllTokens() then login');

    } else {
      console.log('\n✅ Authentication appears functional');
      console.log('   Try making a test API call');
    }

    console.log('\n🧪 Testing Options:');
    console.log('   • Test API call: authTest.testCharacterEndpoint()');
    console.log('   • Full auth test: authTest.runFullTest()');
    console.log('   • Clear tokens: authDebug.clearAllTokens()');
  },

  /**
   * Quick authentication status check
   */
  quickStatus() {
    const token = getBestValidToken();
    const hasStoredTokens = !!(localStorage.getItem('imx_access_token') || localStorage.getItem('auth0_token'));

    console.log('⚡ Authentication Quick Status:');

    if (token) {
      console.log('   ✅ AUTHENTICATED - Valid token available');
      console.log('   🎯 Ready to make API calls');
    } else if (hasStoredTokens) {
      console.log('   ⚠️  TOKENS EXPIRED - Stored tokens are invalid');
      console.log('   🔄 Need to re-login');
    } else {
      console.log('   ❌ NOT AUTHENTICATED - No tokens found');
      console.log('   🔑 Need to login first');
    }
  },

  /**
   * Test if login page is accessible
   */
  async testLoginAccess() {
    console.log('🔗 Testing Login Page Access...');

    try {
      // Check if we can navigate to login
      const currentUrl = window.location.href;
      console.log(`   Current URL: ${currentUrl}`);

      if (window.location.pathname === '/login') {
        console.log('   ✅ Already on login page');
      } else {
        console.log('   🔄 Can navigate to login page');
        console.log('   Run: window.location.href = "/login"');
      }

    } catch (error) {
      console.error('   ❌ Error testing login access:', error);
    }
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).authStateCheck = authStateCheck;
}