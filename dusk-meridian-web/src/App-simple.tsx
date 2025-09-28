import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎮 Dusk Meridian Web Client</h1>
      <p>✅ React is working!</p>
      <p>✅ Server is running on port 8083</p>
      <p>If you see this, the basic setup is functional.</p>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Quick Test</h3>
        <p>Current time: {new Date().toLocaleTimeString()}</p>
        <button onClick={() => alert('JavaScript is working!')}>
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App;