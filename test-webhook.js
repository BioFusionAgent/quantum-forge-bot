const fetch = require('node-fetch');

async function testWebhook() {
  const webhookUrl = 'https://berry-thoughtful-citrus.glitch.me/webhook';
  
  const tests = [
    // Test 1: Plain text
    {
      contentType: 'text/plain',
      body: 'Barts_future Hi #cyberforge https://twitter.com/Barts_future/status/1234567890'
    },
    // Test 2: JSON format
    {
      contentType: 'application/json',
      body: JSON.stringify({
        text: 'Test tweet from JSON format',
        username: 'JSONTester'
      })
    },
    // Test 3: IFTTT format
    {
      contentType: 'application/x-www-form-urlencoded',
      body: 'value1=Test+tweet+from+IFTTT&value2=IFTTT+Test'
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

