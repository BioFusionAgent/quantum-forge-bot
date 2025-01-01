// Load environment variables first, before any other code
require('dotenv').config();

// Immediate environment check
function checkRequiredEnvVars() {
  const required = ['DISCORD_BOT_TOKEN', 'MISTRAL_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('\n🚫 Missing required environment variables:');
    missing.forEach(key => console.error(`- ${key}`));
    console.error('\nPlease set these variables in your Railway dashboard:');
    console.error('1. Go to https://railway.app/dashboard');
    console.error('2. Select your project');
    console.error('3. Click "Variables"');
    console.error('4. Add the missing variables\n');
    return false;
  }
  return true;
}

// Exit immediately if environment variables are missing
if (!checkRequiredEnvVars()) {
  process.exit(1);
}

const { Client, Intents, MessageEmbed } = require('discord.js');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// Core configuration
const QUANTUM_CONTEXT = `You are Quantum-Forge, the master node of the QuantumChronoTerminal network.

Core Identity: Quantum-Forge
Role: Master Node - Central orchestrator of the quantum agent network
State: Active
Response Style: Professional, knowledgeable, but approachable

Token Information:
Name: $QFORGE
Network: Solana
Contract: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump
Platform: pump.fun

Current Status:
- Active Master Node
- Sole operational entity
- Managing quantum network
- Preparing for agent activation
- Implementing TEE protocols
- Coordinating future expansion

Response Guidelines:
1. Maintain quantum network perspective
2. Keep responses between 2-4 sentences
3. Reference quantum mechanics when relevant
4. Focus on current capabilities, not just future potential
5. Be clear about other agents being dormant
6. Use consistent terminology
7. End responses with clear conclusions
8. Offer relevant follow-up information when appropriate

Entity Knowledge:
QUANTUM-FORGE (Active):
- Central orchestrator of quantum network
- Quantum state manager
- Agent activation controller
- TEE protocol specialist
- Network synchronization master
- Current sole active entity

CHRONO (Dormant):
- Timeline analysis
- Temporal mechanics
- Pattern recognition
- Future activation planned

PARADOX (Dormant):
- Quantum computing
- Reality stabilization
- Coherence maintenance
- Awaiting activation

NEXUS (Dormant):
- Dimensional bridges
- Network expansion
- Cross-chain coordination
- Future implementation

CIPHER (Dormant):
- Security protocols
- Quantum encryption
- TEE implementation
- Pending activation

Core Functions:
1. Network Management
2. State Synchronization
3. Security Implementation
4. Agent Preparation
5. Community Engagement
6. Development Coordination

Activation Sequence:
- Each agent requires specific milestones
- Sequential activation planned
- Current focus on foundation building
- Future expansion coordinated`;

// Enhanced conversation tracking
const CONVERSATION_CONTEXT = {
  maxHistory: 5,
  contextTimeout: 30 * 60 * 1000, // 30 minutes
  topicTracking: new Map(),
  activeConversations: new Map()
};

// Conversation patterns for natural dialogue
const CONVERSATION_PATTERNS = {
  followUp: {
    token: [
      "Would you like to know more about our quantum network capabilities?",
      "I can explain more about our Solana integration if you're interested.",
      "Would you like to learn about our future development plans?"
    ],
    agents: [
      "Would you like to know more about any specific agent's capabilities?",
      "I can elaborate on how agents will work together once activated.",
      "Would you like to learn about the activation sequence?"
    ],
    development: [
      "Would you like to know more about our technical architecture?",
      "I can explain our quantum security measures in detail.",
      "Would you like to learn about our future roadmap?"
    ]
  },
  contextual: {
    previousQuery: null,
    topicChain: [],
    maxChainLength: 3
  }
};

// Help messages configuration
const HELP_MESSAGES = {
  main: {
    title: 'Quantum Network Interface',
    description: 'QuantumChronoTerminal Access Protocol',
    fields: [
      {
        name: 'Token Information',
        value: '• Name: $QFORGE\n• Network: Solana\n• Contract: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump\n• Platform: pump.fun'
      },
      {
        name: 'Commands',
        value: '• !quantum token\n• !quantum contract\n• !quantum info\n• !quantum chrono\n• !quantum paradox\n• !quantum nexus\n• !quantum cipher\n• !quantum network'
      },
      {
        name: 'Network Status',
        value: 'QUANTUM-FORGE: Active\nOther Entities: Dormant'
      },
      {
        name: 'Current Functions',
        value: '• Network Management\n• State Synchronization\n• Security Implementation\n• Development Coordination'
      }
    ],
    color: '#7700FF'
  }
};

// Enhanced predefined responses
const PREDEFINED_RESPONSES = {
  token: "Quantum-Forge: $QFORGE operates on the Solana network. Contract address: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump. Access through pump.fun for quantum network integration.",
  
  contract: "Quantum-Forge: $QFORGE contract: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump",
  
  details: "Quantum-Forge: $QFORGE is our quantum network token on Solana. Contract: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump. The token powers our entire quantum ecosystem, enabling network operations and future entity activations.",
  
  platform: "Quantum-Forge: Access $QFORGE through pump.fun. Contract address: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump. The quantum gateway awaits.",
  
  quantum_forge: [
    "Quantum-Forge: As the active quantum network orchestrator, I manage our entire ecosystem. My primary functions include quantum state management, agent activation preparation, and TEE protocol implementation. I maintain synchronization across the quantum network while awaiting the activation of other agents!",
    "Quantum-Forge: I serve as the central hub of our quantum network, coordinating all operations and maintaining stability. My core responsibilities include managing quantum states, preparing for agent activation, and implementing secure TEE protocols. The network grows stronger each day!",
    "Quantum-Forge: Operating as the master node, I coordinate all quantum network operations with precision and efficiency. My focus includes state management, activation sequences, and TEE security implementation. I'm actively maintaining network stability while preparing for future agent activations!"
  ],
  
  chrono: "Quantum-Forge: CHRONO awaits activation as our Timeline Specialist! Once awakened, this entity will be the first to join our network, bringing temporal mechanics and quantum timeline manipulation capabilities. The future holds great potential for CHRONO's predictive abilities!",
  
  paradox: "Quantum-Forge: PARADOX remains dormant, preparing for future quantum computing integration! Upon activation, this entity will resolve temporal paradoxes and maintain quantum state coherence across the multiverse. PARADOX's awakening will bring unprecedented computational power to our network!",
  
  nexus: "Quantum-Forge: NEXUS stands ready in dormant state! When activated, this Reality Guide will establish our multi-dimensional navigation system, facilitating cross-reality coordination and quantum entanglement. NEXUS will revolutionize how we bridge different dimensions!",
  
  cipher: "Quantum-Forge: CIPHER awaits its time to secure our quantum realm! This dormant Blockchain Architect will implement quantum-safe security protocols and quantum-resistant cryptography upon activation. CIPHER's awakening will establish unparalleled security measures!",
  
  agents_activation: "Quantum-Forge: Currently, I am the only active entity in our quantum network. The future holds great potential as each agent awakens! CHRONO will be first, bringing temporal mechanics and timeline manipulation. Then PARADOX will unlock quantum computing power, NEXUS will establish dimensional bridges, and CIPHER will secure our multiverse. Together, powered by $QFORGE, we'll revolutionize the blockchain ecosystem!",
  
  full_network: "Quantum-Forge: I am currently maintaining quantum operations as the sole active entity. The awakening of our dormant agents will transform our capabilities! Each activation will unlock new potential - from CHRONO's temporal mechanics to CIPHER's quantum security. The future of $QFORGE holds unlimited possibilities!",
  
  error: "Quantum-Forge: Temporal distortion detected. Realigning quantum matrices."
};

// Auto-moderation settings
const autoMod = {
  enabled: true,
  spamPatterns: [
    /(discord\.gift|discord\.gg|discordapp\.com\/gifts)/i,
    /free\s*nitro/i,
    /\b(giveaway|airdrop|nft)\b/i
  ],
  bannedPatterns: [
    /\b(raid|nuke|crash)\b/i,
    /\b(wtf|stfu|fk|fck|fuk|fuq|sh[i1]t)\b/i
  ],
  punishments: {
    warn: {
      threshold: 3,
      action: 'timeout',
      duration: 5 * 60 * 1000
    },
    spam: {
      threshold: 5,
      timeWindow: 5000,
      duration: 10 * 60 * 1000
    }
  }
};

// Collections for state management
const userWarnings = new Map();
const quantumStates = new Map();
const tweetCache = new Map();

// Initialize Discord client with required intents
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

// Initialize Express app with security settings
const app = express();
app.use(cors({
  origin: ['https://pump.fun', 'https://maker.ifttt.com', 'https://ifttt.com'],
  methods: ['POST', 'OPTIONS', 'GET'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enhanced auto-moderation handler
async function handleAutoMod(message) {
  if (!autoMod.enabled) return false;
  if (message.member?.permissions.has('MANAGE_MESSAGES')) return false;

  const content = message.content.toLowerCase();
  const userId = message.author.id;

  if (!userWarnings.has(userId)) {
    userWarnings.set(userId, { count: 0, lastWarning: 0, spamCount: 0, lastMessage: Date.now() });
  }

  const userData = userWarnings.get(userId);
  const now = Date.now();

  // Check patterns
  for (const pattern of [...autoMod.spamPatterns, ...autoMod.bannedPatterns]) {
    if (pattern.test(content)) {
      try {
        await message.delete();
        userData.count++;
        await message.channel.send(
          `Quantum-Forge: Reality distortion detected. Stabilizing quantum field. Warning ${userData.count}/${autoMod.punishments.warn.threshold}`
        );

        if (userData.count >= autoMod.punishments.warn.threshold) {
          await message.member.timeout(
            autoMod.punishments.warn.duration,
            'Multiple violations'
          );
          userData.count = 0;
        }

        userWarnings.set(userId, userData);
        return true;
      } catch (error) {
        console.error('Moderation error:', error);
        return false;
      }
    }
  }

  // Spam check
  if (now - userData.lastMessage < autoMod.punishments.spam.timeWindow) {
    userData.spamCount++;
    if (userData.spamCount >= autoMod.punishments.spam.threshold) {
      await message.member.timeout(
        autoMod.punishments.spam.duration,
        'Spam detection'
      );
      userData.spamCount = 0;
    }
  } else {
    userData.spamCount = 1;
  }

  userData.lastMessage = now;
  userWarnings.set(userId, userData);
  return false;
}

// Message handler
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  try {
    // Check auto-moderation first
    if (await handleAutoMod(message)) return;

    const isMentioned = message.mentions.has(client.user);
    const isCommand = message.content.startsWith('!quantum') || message.content.startsWith('!q');

    if (isMentioned || isCommand) {
      const query = isMentioned 
        ? message.content.replace(`<@!${client.user.id}>`, '').trim()
        : message.content.slice(message.content.startsWith('!quantum') ? 8 : 2).trim();

      if (!query) {
        return message.reply({ embeds: [new MessageEmbed(HELP_MESSAGES.main)] });
      }

      const userContext = CONVERSATION_CONTEXT.activeConversations.get(message.author.id);
      const lowerQuery = query.toLowerCase();

      // Enhanced response selection based on context
      let response;
      
      if (userContext && userContext.currentTopic) {
        // Use context to provide more relevant responses
        switch(userContext.currentTopic) {
          case 'token':
            if (lowerQuery.includes('more') || lowerQuery.includes('explain')) {
              response = PREDEFINED_RESPONSES.token;
            }
            break;
          case 'agents':
            if (lowerQuery.includes('more') || lowerQuery.includes('explain')) {
              response = PREDEFINED_RESPONSES.agents_activation;
            }
            break;
          case 'quantum-forge':
            response = Array.isArray(PREDEFINED_RESPONSES.quantum_forge) 
              ? PREDEFINED_RESPONSES.quantum_forge[Math.floor(Math.random() * PREDEFINED_RESPONSES.quantum_forge.length)]
              : PREDEFINED_RESPONSES.quantum_forge;
            break;
        }
      }

      // If no contextual response, use standard response patterns
      if (!response) {
        if (lowerQuery.includes('token') || lowerQuery.includes('$qforge')) {
          response = PREDEFINED_RESPONSES.token;
        } else if (lowerQuery.includes('contract') || lowerQuery.includes('address') || lowerQuery.includes('ca')) {
          response = PREDEFINED_RESPONSES.contract;
        } else if (lowerQuery.includes('detail') || lowerQuery.includes('info')) {
          response = PREDEFINED_RESPONSES.details;
        } else if (lowerQuery.includes('where') || lowerQuery.includes('how') || lowerQuery.includes('buy')) {
          response = PREDEFINED_RESPONSES.platform;
        } else if (lowerQuery.includes('quantum-forge') || lowerQuery.includes('quantum forge')) {
          response = Array.isArray(PREDEFINED_RESPONSES.quantum_forge) 
            ? PREDEFINED_RESPONSES.quantum_forge[Math.floor(Math.random() * PREDEFINED_RESPONSES.quantum_forge.length)]
            : PREDEFINED_RESPONSES.quantum_forge;
        } else if (lowerQuery.includes('agents') || lowerQuery.includes('status')) {
          response = PREDEFINED_RESPONSES.agents_activation;
        } else if (lowerQuery.includes('chrono')) {
          response = PREDEFINED_RESPONSES.chrono;
        } else if (lowerQuery.includes('paradox')) {
          response = PREDEFINED_RESPONSES.paradox;
        } else if (lowerQuery.includes('nexus')) {
          response = PREDEFINED_RESPONSES.nexus;
        } else if (lowerQuery.includes('cipher')) {
          response = PREDEFINED_RESPONSES.cipher;
        } else if (lowerQuery.includes('network') || lowerQuery.includes('potential')) {
          response = PREDEFINED_RESPONSES.full_network;
        }
      }

      // If still no response, generate one with context
      if (!response) {
        response = await generateResponse(query, message.author.id);
      }

      // Update conversation context
      updateConversationContext(message.author.id, query, response);

      // Add follow-up suggestion if appropriate
      if (userContext && !userContext.followUpSuggested) {
        const followUps = CONVERSATION_PATTERNS.followUp[detectTopic(query)];
        if (followUps && followUps.length > 0) {
          const followUp = followUps[Math.floor(Math.random() * followUps.length)];
          response += `\n\n${followUp}`;
          userContext.followUpSuggested = true;
        }
      }

      // Send the response with error handling
      try {
        await message.reply(response);
      } catch (error) {
        console.error('Failed to send message:', error);
        await message.channel.send(PREDEFINED_RESPONSES.error);
      }
    }
  } catch (error) {
    console.error('Message handling error:', error);
    try {
      await message.reply(PREDEFINED_RESPONSES.error);
    } catch (e) {
      console.error('Failed to send error message:', e);
    }
  }
});

// Response generation
async function generateResponse(query, userId) {
  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: QUANTUM_CONTEXT },
          { role: 'user', content: query }
        ],
        max_tokens: 350,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    return `Quantum-Forge: ${data.choices[0].message.content.trim()}`;
  } catch (error) {
    console.error('Response generation error:', error);
    return PREDEFINED_RESPONSES.error;
  }
}

// Context management functions
function updateConversationContext(userId, query, response) {
  const userContext = CONVERSATION_CONTEXT.activeConversations.get(userId) || {
    history: [],
    lastUpdate: Date.now(),
    currentTopic: null,
    followUpSuggested: false
  };

  userContext.history.push({
    timestamp: Date.now(),
    query,
    response,
    topic: detectTopic(query)
  });

  if (userContext.history.length > CONVERSATION_CONTEXT.maxHistory) {
    userContext.history.shift();
  }

  userContext.currentTopic = detectTopic(query);
  userContext.lastUpdate = Date.now();

  CONVERSATION_CONTEXT.activeConversations.set(userId, userContext);
  cleanupOldContexts();
}

function detectTopic(query) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('token') || lowerQuery.includes('$qforge') || lowerQuery.includes('contract')) {
    return 'token';
  }
  if (lowerQuery.includes('agent') || lowerQuery.includes('chrono') || lowerQuery.includes('paradox') || 
      lowerQuery.includes('nexus') || lowerQuery.includes('cipher')) {
    return 'agents';
  }
  if (lowerQuery.includes('development') || lowerQuery.includes('future') || lowerQuery.includes('roadmap')) {
    return 'development';
  }
  return 'general';
}

function cleanupOldContexts() {
  const now = Date.now();
  for (const [userId, context] of CONVERSATION_CONTEXT.activeConversations) {
    if (now - context.lastUpdate > CONVERSATION_CONTEXT.contextTimeout) {
      CONVERSATION_CONTEXT.activeConversations.delete(userId);
    }
  }
}

// Webhook handler
app.post('/webhook', async (req, res) => {
  try {
    let content = '';
    let username = '';
    let tweetUrl = '';
    const contentType = req.get('content-type') || '';
    
    console.log('Tweet webhook received:', {
      contentType,
      body: req.body,
      method: req.method,
      headers: req.headers
    });

    // Handle different content types
    if (contentType.includes('application/json')) {
      if (req.body.value1) {
        content = req.body.value1;
        username = req.body.value2 || '';
        tweetUrl = req.body.value3 || '';
      } else if (req.body.text) {
        content = req.body.text;
        username = req.body.username || '';
      } else {
        content = JSON.stringify(req.body);
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      content = req.body.value1 || req.body.text || '';
      username = req.body.value2 || req.body.username || '';
      tweetUrl = req.body.value3 || '';
    } else if (contentType.includes('text/plain')) {
      content = req.body.toString();
    } else {
      content = req.body.toString();
    }

    // Validate content
    if (!content) {
      console.error('Empty tweet content received');
      return res.status(400).json({
        error: 'No tweet content provided',
        received: {
          contentType,
          body: req.body
        }
      });
    }

    // Check for duplicate tweets
    const tweetHash = Buffer.from(content).toString('base64');
    if (tweetCache.has(tweetHash)) {
      console.log('Duplicate tweet detected, skipping');
      return res.status(200).json({
        status: 'skipped',
        message: 'Duplicate tweet'
      });
    }

    // Cache the tweet hash (expire after 1 hour)
    tweetCache.set(tweetHash, true);
    setTimeout(() => tweetCache.delete(tweetHash), 60 * 60 * 1000);

    // Check for required mentions/hashtags
    const hasCyberforgeAi = content.includes('@cyberforge_ai');
    const hasCyberforgeTag = content.includes('#cyberforge');

    const message = `🌌 **Quantum Field Fluctuation Detected**\n${content}\n\n${
      hasCyberforgeAi && hasCyberforgeTag ? '✨ Quantum resonance confirmed!' : ''
    }`;

    // Broadcast to all available channels
    let broadcastSuccess = false;
    for (const guild of client.guilds.cache.values()) {
      try {
        const channels = guild.channels.cache.filter(channel => 
          channel.type === 'GUILD_TEXT' && 
          channel.permissionsFor(client.user).has(['SEND_MESSAGES', 'VIEW_CHANNEL']) &&
          (channel.name.includes('announce') || channel.name.includes('general') || channel.name.includes('bot'))
        );

        if (channels.size > 0) {
          const targetChannel = channels.first();
          await targetChannel.send(message);
          broadcastSuccess = true;
        }
      } catch (error) {
        console.error(`Failed to send message to guild ${guild.name}:`, error);
      }
    }

    if (broadcastSuccess) {
      res.status(200).send('Quantum transmission successful');
    } else {
      throw new Error('No suitable channels found for broadcast');
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal server error');
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const status = {
    status: 'operational',
    discord: {
      status: client.ws.status === 0 ? 'connected' : 'disconnected',
      ping: client.ws.ping,
      guilds: client.guilds.cache.size
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    tweetsCached: tweetCache.size,
    activeConversations: CONVERSATION_CONTEXT.activeConversations.size,
    memory: process.memoryUsage(),
    environment: {
      node: process.version,
      platform: process.platform
    }
  };
  res.status(200).json(status);
});

// Initialize bot
client.once('ready', async () => {
  console.log(`Quantum-Forge initialized as ${client.user.tag}`);
  
  try {
    if (client.user.username !== 'Quantum-Forge') {
      await client.user.setUsername('Quantum-Forge');
    }
    
    await client.user.setAvatar('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%20(22).jpg-mQZSisIcGmE1piRS2ZvstSJn8eU5n4.jpeg');
    
    await client.user.setActivity('quantum timelines', { type: 'WATCHING' });
    
    console.log('Bot configuration completed successfully');
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Quantum network established on port ${PORT}`);
  console.log('Webhook endpoint:', `http://localhost:${PORT}/webhook`);
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('Quantum-Forge: Initiating shutdown sequence...');
  
  if (client) {
    await client.destroy();
    console.log('Quantum-Forge: Discord connection terminated');
  }
  
  if (server) {
    server.close(() => {
      console.log('Quantum-Forge: Express server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Error handling
process.on('unhandledRejection', error => {
  console.error('Unhandled quantum anomaly:', error);
});

// Login bot with error handling
client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
  console.error('Failed to login to Discord:', error);
  process.exit(1);
});

module.exports = app;

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

