const fetch = require('node-fetch');

async function testWebhook() {
  // Use environment variable or default to localhost
  const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:3000/webhook';

  const tests = [
    // Test 1: IFTTT JSON Format
    {
      name: 'IFTTT JSON Format',
      contentType: 'application/json',
      body: {
        value1: "@cyberforge_ai Testing quantum network #cyberforge",
        value2: "IFTTT Integration Test"
      }
    },
    // Test 2: IFTTT Form Data
    {
      name: 'IFTTT Form Data',
      contentType: 'application/x-www-form-urlencoded',
      body: new URLSearchParams({
        value1: '@cyberforge_ai Testing webhook #cyberforge'
      }).toString()
    },
    // Test 3: Plain Text
    {
      name: 'Plain Text',
      contentType: 'text/plain',
      body: "@cyberforge_ai Plain text test #cyberforge"
    },
    // Test 4: Raw JSON
    {
      name: 'Raw JSON',
      contentType: 'application/json',
      body: {
        text: "@cyberforge_ai Raw JSON test #cyberforge",
        username: "Webhook Tester"
      }
    },
    // Test 5: IFTTT with Extra Fields
    {
      name: 'IFTTT Extended Format',
      contentType: 'application/json',
      body: {
        value1: "@cyberforge_ai Extended test #cyberforge",
        value2: "Additional Info",
        value3: "More Data"
      }
    }
  ];

  console.log(`Testing webhook at: ${webhookUrl}\n`);
  console.log('Starting webhook tests...\n');

  for (const test of tests) {
    try {
      console.log(`Running test: ${test.name}`);
      console.log('Content-Type:', test.contentType);
      console.log('Payload:', typeof test.body === 'object' ? JSON.stringify(test.body) : test.body);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': test.contentType,
          'Accept': 'application/json'
        },
        body: typeof test.body === 'object' ? JSON.stringify(test.body) : test.body
      });

      let result;
      try {
        result = await response.json();
      } catch {
        result = await response.text();
      }

      console.log('Status:', response.status);
      console.log('Response:', typeof result === 'object' ? JSON.stringify(result, null, 2) : result);

      if (response.ok) {
        console.log('✅ Test passed');
      } else {
        console.log('❌ Test failed');
      }
      console.log('\n-------------------\n');
    } catch (error) {
      console.error('❌ Test error:', error.message);
      console.log('\n-------------------\n');
    }
  }

  console.log('All tests completed');
}

// Run tests if called directly
if (require.main === module) {
  testWebhook().catch(console.error);
}

module.exports = { testWebhook };

