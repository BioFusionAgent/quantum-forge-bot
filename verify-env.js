// First, let's create a verification script
const { Client, Intents } = require('discord.js');

async function verifyEnvironment() {
  console.log('Starting environment verification...');
  
  // 1. Check if variables are present
  const token = process.env.DISCORD_BOT_TOKEN;
  const mistralKey = process.env.MISTRAL_API_KEY;
  
  console.log('\nEnvironment Variables Status:');
  console.log('DISCORD_BOT_TOKEN:', token ? '✓ Present' : '✗ Missing');
  console.log('MISTRAL_API_KEY:', mistralKey ? '✓ Present' : '✗ Missing');
  
  // 2. Verify Discord token format
  if (token) {
    console.log('\nValidating Discord token format...');
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('❌ Invalid token format. Token should have 3 parts separated by dots.');
      process.exit(1);
    }
    console.log('✓ Token format appears valid');
  }

  // 3. Test Discord connection
  console.log('\nTesting Discord connection...');
  const client = new Client({
    intents: [Intents.FLAGS.GUILDS]
  });

  try {
    await client.login(token);
    console.log('✓ Successfully connected to Discord as:', client.user.tag);
    await client.destroy();
  } catch (error) {
    console.error('❌ Discord connection failed:', error.message);
    console.log('\nPossible solutions:');
    console.log('1. Token might be invalid or expired');
    console.log('2. Bot might not be invited to any servers');
    console.log('3. Token might have leading/trailing spaces');
    process.exit(1);
  }
}

// Run verification
verifyEnvironment().catch(console.error);

