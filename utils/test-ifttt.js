const fetch = require('node-fetch');

async function testWebhook() {
  const webhookUrl = 'https://your-glitch-url.glitch.me/webhook';

  // Test cases for different payload formats
  const testCases = [
    // IFTTT format
    {
      value1: "@cyberforge_ai Just discovered an amazing quantum pattern! #cyberforge",
      value2: "Twitter Integration Test",
      value3: "Weekly Airdrop Eligible"
    },
    // Direct format
    {
      text: "🌌 @cyberforge_ai Preparing for December 31 launch! #cyberforge",
      username: "Quantum Explorer"
    },
    // String format
    "@cyberforge_ai The quantum realm awaits! #cyberforge"
  ];

  for (const payload of testCases) {
    try {
      console.log('\nTesting payload:', payload);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.text();
      
      console.log('Status:', response.status);
      console.log('Response:', result);
    } catch (error) {
      console.error('Test failed:', error);
    }
  }
}

// Run the tests
console.log('Starting webhook tests...');
testWebhook().then(() => console.log('\nTests completed'));

