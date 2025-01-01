const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

// Configuration
const config = {
  webhookUrl: process.env.WEBHOOK_URL || 'http://localhost:3000/webhook',
  testDelay: 1000, // Delay between tests in milliseconds
};

// Test cases
const testCases = [
  {
    name: 'Valid Tweet with URL',
    content: {
      value1: "@cyberforge_ai Quantum network expansion in progress! Check our latest update: https://example.com/update #cyberforge",
      value2: "QuantumUser",
      value3: "https://twitter.com/QuantumUser/status/123456789"
    }
  },
  {
    name: 'Community Engagement Tweet',
    content: {
      value1: "@cyberforge_ai Join our weekly airdrop! Share your quantum journey with us #cyberforge",
      value2: "CommunityMember"
    }
  },
  {
    name: 'Technical Update',
    content: {
      value1: "@cyberforge_ai Network stability at 99.9%! Quantum synchronization complete #cyberforge",
      value2: "TechTeam"
    }
  },
  {
    name: 'Missing Mention',
    content: {
      value1: "Exciting updates coming! #cyberforge",
      value2: "RandomUser"
    }
  },
  {
    name: 'Missing Hashtag',
    content: {
      value1: "@cyberforge_ai Great progress on the quantum network!",
      value2: "NetworkUser"
    }
  },
  {
    name: 'IFTTT Format',
    content: {
      value1: "@cyberforge_ai Testing the IFTTT integration #cyberforge",
      value2: "IFTTT_User",
      value3: "https://twitter.com/IFTTT_User/status/123456789"
    }
  }
];

// Content type test cases
const contentTypeTests = [
  {
    name: 'URL Encoded',
    contentType: 'application/x-www-form-urlencoded',
    body: 'value1=@cyberforge_ai+Test+message+%23cyberforge&value2=URLEncodedUser'
  },
  {
    name: 'Plain Text',
    contentType: 'text/plain',
    body: '@cyberforge_ai Plain text test #cyberforge'
  }
];

// Helper function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to run a single test
async function runTest(test, type = 'json') {
  try {
    console.log(`\nTesting: ${test.name}`);
    console.log('Payload:', JSON.stringify(type === 'json' ? test.content : test.body, null, 2));
    
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': type === 'json' ? 'application/json' : test.contentType
      },
      body: type === 'json' ? JSON.stringify(test.content) : test.body
    });

    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    return {
      name: test.name,
      status: response.status,
      result
    };
  } catch (error) {
    console.error(`Test "${test.name}" failed:`, error);
    return {
      name: test.name,
      error: error.message
    };
  }
}

// Main test function
async function runTests() {
  console.log('=== Starting Quantum-Forge Webhook Tests ===\n');
  console.log('Configuration:');
  console.log('Webhook URL:', config.webhookUrl);
  console.log('Test Delay:', config.testDelay, 'ms');
  console.log('\n=== Running Standard Tests ===');

  const results = [];

  // Run standard JSON tests
  for (const test of testCases) {
    results.push(await runTest(test));
    await delay(config.testDelay);
  }

  console.log('\n=== Running Content Type Tests ===');

  // Run content type tests
  for (const test of contentTypeTests) {
    results.push(await runTest(test, 'custom'));
    await delay(config.testDelay);
  }

  // Test webhook verification
  try {
    console.log('\n=== Testing Webhook Verification ===');
    const verifyResponse = await fetch(`${config.webhookUrl}/verify`);
    const verifyResult = await verifyResponse.json();
    console.log('Verification result:', JSON.stringify(verifyResult, null, 2));
    results.push({
      name: 'Webhook Verification',
      status: verifyResponse.status,
      result: verifyResult
    });
  } catch (error) {
    console.error('Verification test failed:', error);
    results.push({
      name: 'Webhook Verification',
      error: error.message
    });
  }

  // Test health check
  try {
    console.log('\n=== Testing Health Check ===');
    const healthResponse = await fetch(config.webhookUrl.replace('/webhook', '/health'));
    const healthResult = await healthResponse.json();
    console.log('Health check result:', JSON.stringify(healthResult, null, 2));
    results.push({
      name: 'Health Check',
      status: healthResponse.status,
      result: healthResult
    });
  } catch (error) {
    console.error('Health check test failed:', error);
    results.push({
      name: 'Health Check',
      error: error.message
    });
  }

  // Print summary
  console.log('\n=== Test Summary ===');
  const successful = results.filter(r => r.status === 200).length;
  const failed = results.filter(r => r.error || r.status !== 200).length;
  console.log(`Total tests: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results
      .filter(r => r.error || r.status !== 200)
      .forEach(r => console.log(`- ${r.name}: ${r.error || JSON.stringify(r.result)}`));
  }

  return results;
}

// Run tests if this file is being run directly
if (require.main === module) {
  runTests()
    .then(() => console.log('\n=== Test suite completed ==='))
    .catch(error => console.error('Test suite failed:', error));
}

module.exports = { runTests, config };

