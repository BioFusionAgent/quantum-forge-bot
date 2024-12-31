const fetch = require('node-fetch');

async function testWebhook() {
  const webhookUrl = 'https://your-glitch-url.glitch.me/webhook';

  const tests = [
    // Test 1: Plain text
    {
      contentType: 'text/plain',
      body: '@cyberforge_ai Hi #cyberforge Exploring quantum realms through digital innovation!'
    },
    // Test 2: JSON format
    {
      contentType: 'application/json',
      body: JSON.stringify({
        text: 'Quantum prediction: $QFORGE launching on December 31, 2024, 6:30 PM UTC! @cyberforge_ai #cyberforge',
        username: 'QuantumPredictor'
      })
    },
    // Test 3: IFTTT format
    {
      contentType: 'application/x-www-form-urlencoded',
      body: 'value1=Weekly+airdrop+alert:+Tweet+with+@cyberforge_ai+and+%23cyberforge+for+rewards!&value2=IFTTT+Alert'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\nTesting ${test.contentType}:`);
      console.log('Payload:', test.body);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': test.contentType,
        },
        body: test.body
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

