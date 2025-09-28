/**
 * Token Debug Utilities
 *
 * Debug why tokens are being rejected
 */

import jwtDecode from 'jwt-decode';

export const tokenDebug = {
  /**
   * Analyze a token without validation to see its actual structure
   */
  analyzeToken(token: string, tokenType: string = 'Unknown') {
    console.log(`🔍 Analyzing ${tokenType} Token:`);
    console.log('='.repeat(50));

    if (!token) {
      console.log('❌ Token is null or empty');
      return;
    }

    try {
      // Decode without validation
      const decoded = jwtDecode(token);

      console.log('📋 Token Structure:');
      console.log('   Length:', token.length);
      console.log('   Parts:', token.split('.').length);

      console.log('\n📄 Decoded Claims:');
      console.log(JSON.stringify(decoded, null, 2));

      console.log('\n⏰ Time Analysis:');
      const now = Math.floor(Date.now() / 1000);

      if ((decoded as any).exp) {
        const exp = (decoded as any).exp;
        const timeUntilExpiry = exp - now;
        console.log(`   Expires: ${new Date(exp * 1000).toISOString()}`);
        console.log(`   Time until expiry: ${timeUntilExpiry} seconds`);
        console.log(`   Is expired: ${timeUntilExpiry < 0 ? '❌ YES' : '✅ NO'}`);
      }

      if ((decoded as any).iat) {
        const iat = (decoded as any).iat;
        console.log(`   Issued: ${new Date(iat * 1000).toISOString()}`);
        console.log(`   Age: ${now - iat} seconds`);
      }

      console.log('\n🔑 Required Claims Check:');
      const requiredClaims = ['sub'];
      const backendClaims = ['sub', 'wallet_address', 'email'];

      requiredClaims.forEach(claim => {
        const hasIt = !!(decoded as any)[claim];
        console.log(`   ${claim}: ${hasIt ? '✅' : '❌'} ${hasIt ? `"${(decoded as any)[claim]}"` : 'MISSING'}`);
      });

      console.log('\n🎯 Backend Expected Claims:');
      backendClaims.forEach(claim => {
        const hasIt = !!(decoded as any)[claim];
        console.log(`   ${claim}: ${hasIt ? '✅' : '❌'} ${hasIt ? `"${(decoded as any)[claim]}"` : 'MISSING'}`);
      });

      return decoded;

    } catch (error) {
      console.log('❌ Token decode failed:', error);
      console.log('   This might indicate the token is malformed');
    }
  },

  /**
   * Debug all stored tokens
   */
  debugAllTokens() {
    console.log('🔍 Token Debug Analysis');
    console.log('========================');

    const tokens = {
      'IMX Access': localStorage.getItem('imx_access_token'),
      'IMX ID': localStorage.getItem('imx_id_token'),
      'Auth0': localStorage.getItem('auth0_token')
    };

    for (const [name, token] of Object.entries(tokens)) {
      console.log(`\n📝 ${name} Token:`);
      if (token) {
        this.analyzeToken(token, name);
      } else {
        console.log('   ❌ Not found in localStorage');
      }
    }

    // Check global token
    const globalToken = (window as any).__imx_current_token;
    if (globalToken) {
      console.log('\n📝 Global IMX Token:');
      this.analyzeToken(globalToken, 'Global IMX');
    }
  },

  /**
   * Test token validation logic step by step
   */
  testTokenValidation() {
    console.log('🧪 Testing Token Validation Logic');
    console.log('==================================');

    const imxToken = localStorage.getItem('imx_access_token');

    if (!imxToken) {
      console.log('❌ No IMX token to test');
      return;
    }

    console.log('\n1️⃣ Step 1: Basic checks');
    console.log('   Token exists:', !!imxToken);
    console.log('   Token not empty:', imxToken.trim() !== '');

    try {
      console.log('\n2️⃣ Step 2: JWT decode');
      const decoded = jwtDecode(imxToken) as any;
      console.log('   ✅ JWT decode successful');

      console.log('\n3️⃣ Step 3: Expiration check');
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp) {
        const expired = decoded.exp < now;
        console.log(`   Token exp: ${decoded.exp}`);
        console.log(`   Current time: ${now}`);
        console.log(`   Is expired: ${expired ? '❌ YES' : '✅ NO'}`);
      } else {
        console.log('   ⚠️  No expiration claim found');
      }

      console.log('\n4️⃣ Step 4: Issued time check');
      if (decoded.iat) {
        const futureIssued = decoded.iat > now + 300; // 5 min skew
        console.log(`   Token iat: ${decoded.iat}`);
        console.log(`   Max allowed: ${now + 300}`);
        console.log(`   Future issued: ${futureIssued ? '❌ YES' : '✅ NO'}`);
      } else {
        console.log('   ⚠️  No issued time claim found');
      }

      console.log('\n5️⃣ Step 5: Required claims check');
      const requiredClaims = ['sub'];
      requiredClaims.forEach(claim => {
        const hasIt = !!decoded[claim];
        console.log(`   ${claim}: ${hasIt ? '✅ PRESENT' : '❌ MISSING'}`);
      });

      console.log('\n6️⃣ Step 6: Backend claims check');
      const backendClaims = ['sub', 'wallet_address', 'email'];
      backendClaims.forEach(claim => {
        const hasIt = !!decoded[claim];
        console.log(`   ${claim}: ${hasIt ? '✅ PRESENT' : '❌ MISSING'}`);
      });

      // Try to identify why validation might fail
      console.log('\n🔍 Validation Failure Analysis:');

      const failures = [];
      if (decoded.exp && decoded.exp < now) failures.push('Token expired');
      if (decoded.iat && decoded.iat > now + 300) failures.push('Token issued in future');
      if (!decoded.sub) failures.push('Missing sub claim');

      if (failures.length > 0) {
        console.log('   ❌ Validation would fail due to:');
        failures.forEach(reason => console.log(`      • ${reason}`));
      } else {
        console.log('   ✅ Token should pass basic validation');
        console.log('   🤔 Issue might be in our validation logic');
      }

    } catch (error) {
      console.log('   ❌ JWT decode failed:', error);
    }
  },

  /**
   * Bypass validation temporarily to test API call
   */
  async testBypassValidation() {
    console.log('🚫 Testing API Call with Bypass Validation');
    console.log('==========================================');

    const imxToken = localStorage.getItem('imx_access_token');

    if (!imxToken) {
      console.log('❌ No IMX token found');
      return;
    }

    console.log('🔄 Attempting API call with raw token (bypassing validation)...');

    try {
      const response = await fetch('http://localhost:5105/api/character/my-characters', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${imxToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log(`📡 Response Status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API call SUCCESS with raw token!');
        console.log('📄 Response:', data);
        console.log('💡 This means the token IS valid - our validation logic is wrong');
      } else if (response.status === 401) {
        console.log('❌ Still 401 - token might actually be invalid');
        const errorText = await response.text();
        console.log('📄 Error response:', errorText);
      } else {
        console.log(`⚠️  Unexpected status: ${response.status}`);
        const errorText = await response.text();
        console.log('📄 Error response:', errorText);
      }

    } catch (error) {
      console.error('💥 API call failed:', error);
    }
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).tokenDebug = tokenDebug;
}