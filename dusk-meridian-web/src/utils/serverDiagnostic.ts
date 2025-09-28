/**
 * Server Diagnostic Utilities
 *
 * Use these to diagnose server connectivity and CORS issues
 */

export const serverDiagnostic = {
  /**
   * Test server connectivity and CORS configuration
   */
  async testServers() {
    console.log('🔍 Server Diagnostic Test');
    console.log('========================');

    const servers = [
      { name: 'GameServer HTTP', url: 'http://localhost:5105' },
      { name: 'GameServer HTTPS', url: 'https://localhost:5001' },
      { name: 'WorldServer', url: 'http://localhost:5002' }
    ];

    for (const server of servers) {
      console.log(`\n🖥️  Testing ${server.name} (${server.url})`);
      await this.testServerConnectivity(server.url);
    }

    console.log('\n🔗 Testing API Endpoints:');
    await this.testApiEndpoints();

    console.log('\n📊 CORS Diagnostic Summary:');
    await this.diagnoseCORS();
  },

  /**
   * Test basic server connectivity
   */
  async testServerConnectivity(baseUrl: string) {
    try {
      // Test health endpoint
      const healthUrl = `${baseUrl}/health`;
      console.log(`   Testing: ${healthUrl}`);

      const response = await fetch(healthUrl, {
        method: 'GET',
        mode: 'cors' // This will trigger CORS if not configured
      });

      console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
      console.log(`   📋 Headers:`, Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log(`   📄 Response:`, data);
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);

      if (error instanceof TypeError && error.message.includes('CORS')) {
        console.log(`   🚫 CORS Error Detected`);
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log(`   🔌 Connection Error - Server may be down`);
      }
    }
  },

  /**
   * Test specific API endpoints
   */
  async testApiEndpoints() {
    const endpoints = [
      'http://localhost:5105/health',
      'http://localhost:5105/api/v1/health',
      'http://localhost:5105/api/character/my-characters'
    ];

    for (const endpoint of endpoints) {
      console.log(`\n🎯 Testing endpoint: ${endpoint}`);

      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });

        console.log(`   Status: ${response.status}`);
        console.log(`   CORS Headers:`, {
          'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
          'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
          'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        });

      } catch (error) {
        console.log(`   ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  },

  /**
   * Diagnose CORS configuration
   */
  async diagnoseCORS() {
    console.log('\n🔍 CORS Configuration Diagnosis:');

    // Test OPTIONS preflight request
    try {
      console.log('\n   Testing OPTIONS preflight request:');
      const response = await fetch('http://localhost:5105/api/character/my-characters', {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:8080',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'authorization,content-type'
        }
      });

      console.log(`   OPTIONS Status: ${response.status}`);
      console.log(`   CORS Response Headers:`, {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
        'Access-Control-Max-Age': response.headers.get('Access-Control-Max-Age')
      });

      if (response.headers.get('Access-Control-Allow-Origin')) {
        console.log('   ✅ CORS appears to be configured');
      } else {
        console.log('   ❌ CORS not configured - missing Access-Control-Allow-Origin');
      }

    } catch (error) {
      console.log(`   ❌ OPTIONS request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Check if servers are running on expected ports
   */
  async checkServerPorts() {
    console.log('🔌 Checking Server Ports:');
    console.log('========================');

    const ports = [
      { port: 5105, service: 'GameServer HTTP' },
      { port: 5001, service: 'GameServer HTTPS' },
      { port: 5002, service: 'WorldServer' },
      { port: 8080, service: 'Frontend Dev Server' }
    ];

    for (const { port, service } of ports) {
      console.log(`\n📡 ${service} (port ${port}):`);

      try {
        const response = await fetch(`http://localhost:${port}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000) // 3 second timeout
        });

        console.log(`   ✅ Running - Status: ${response.status}`);
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.log(`   ⏱️  Timeout - Server may be slow to respond`);
          } else if (error.message.includes('ECONNREFUSED') || error.message.includes('Failed to fetch')) {
            console.log(`   ❌ Not running - Connection refused`);
          } else {
            console.log(`   ⚠️  Unknown error: ${error.message}`);
          }
        }
      }
    }
  },

  /**
   * Quick CORS fix suggestions
   */
  suggestCORSFix() {
    console.log('\n🔧 CORS Fix Suggestions:');
    console.log('========================');
    console.log('\n📝 Backend Server (C#/.NET) needs CORS configuration:');
    console.log(`
    // In Startup.cs or Program.cs
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins("http://localhost:8080")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
    });

    // Enable CORS middleware
    app.UseCors("AllowFrontend");
    `);

    console.log('\n🔄 Or for development, allow all origins:');
    console.log(`
    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

    app.UseCors();
    `);
  }
};

// Make available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).serverDiagnostic = serverDiagnostic;
}