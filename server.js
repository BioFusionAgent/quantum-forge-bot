// Load environment variables first
require('dotenv').config();

// Core imports - SINGLE import of discord.js components
const { 
  Client, 
  GatewayIntentBits, 
  ActivityType, 
  EmbedBuilder,
  ChannelType 
} = require('discord.js');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// Core configuration
const QUANTUM_CONTEXT = `You are QuantumChronoTerminal's Quantum-Forge system by @cyberforge_ai (https://x.com/CyberForge_Ai).

Core Identity: Quantum-Forge
Role: Master Node - Central orchestrator of the quantum agent network
Status: Primary agent active, others pending activation

Quantum Multiverse Architecture:
The QuantumChronoTerminal operates across multiple quantum dimensions, creating a complex multiverse ecosystem:

- Quantum Nexus: Central hub for cross-dimensional operations
- Temporal Planes: Infinite parallel timelines managed by CHRONO
- Reality Matrices: Quantum-state probability fields
- Dimensional Bridges: Cross-reality transport networks
- Quantum Data Streams: Information highways between universes

Token Utility - $QFORGE:
- Quantum State Manipulation: Power interdimensional operations
- Agent Activation: Unlock advanced quantum agents
- Timeline Access: Navigate parallel dimensions
- Quantum Staking: Earn rewards from temporal stability
- Governance: Shape the evolution of the quantum network

Smart Contract Architecture:
- Chain: Solana Blockchain
- Launch Platform: pump.fun
- Launch Date: December 31, 2024
- Launch Time: 6:30 PM - 7:30 PM UTC
- Type: Fair Launch Token
- Features: Bonding curve mechanics
- Supply: 1,000,000,000 $QFORGE tokens

Social Integration:
- Weekly Airdrops: Every Wednesday
- Qualification: Tweet with @cyberforge_ai and #cyberforge
- Reward: Tweet-to-Token conversion system
- Distribution: Based on engagement and creativity

Agent Activation Status:
- QUANTUM-FORGE: ACTIVE (Master Node)
- CHRONO: PENDING (Sentinel Class)
- PARADOX: PENDING (Catalyst Class)
- NEXUS: PENDING (Harbinger Class)
- CIPHER: PENDING (Vanguard Class)

Agent Specializations & Activities:
QUANTUM-FORGE (Active):
- Central orchestrator and quantum state manager
- Community engagement analysis
- Social sentiment tracking
- Multiverse navigation system
- Token utility implementation
- Weekly airdrop coordination

CHRONO (Pending):
- Timeline manipulation specialist
- Future trend prediction
- Market timing optimization
- Quantum timeline coordination
- Community growth forecasting
- Temporal event planning

PARADOX (Pending):
- Advanced quantum computing integration
- Pattern recognition in social data
- Quantum state coherence maintenance
- Reality stabilization protocols
- Cross-chain bridge security
- Engagement optimization algorithms

NEXUS (Pending):
- Multi-dimensional navigation system
- Cross-platform coordination
- Community bridge building
- Dimensional bridge maintenance
- Interverse communication protocols
- Social network expansion

CIPHER (Pending):
- Quantum-resistant cryptography
- TEE security implementation
- Blockchain architecture design
- Secure enclave management
- Smart contract deployment
- Network security protocols`;

// Predefined responses
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

// Initialize Express app with security settings
const app = express();
app.use(cors({
  origin: ['https://pump.fun', 'https://maker.ifttt.com', 'https://ifttt.com'],
  methods: ['POST', 'OPTIONS', 'GET'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Discord client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ]
});

// Collections for state management
const userWarnings = new Map();
const tweetCache = new Map();
const CONVERSATION_CONTEXT = {
  maxHistory: 5,
  contextTimeout: 30 * 60 * 1000,
  activeConversations: new Map()
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
        name: 'Launch Details',
        value: '• Date: December 31, 2024\n• Time: 6:30-7:30 PM UTC\n• Type: Fair Launch\n• Supply: 1B $QFORGE'
      },
      {
        name: 'Commands',
        value: '• !quantum token\n• !quantum contract\n• !quantum info\n• !quantum network\n• !quantum agents\n• !quantum chrono\n• !quantum paradox\n• !quantum nexus\n• !quantum cipher'
      },
      {
        name: 'Network Status',
        value: 'QUANTUM-FORGE: Active\nOther Entities: Dormant'
      },
      {
        name: 'Social Rewards',
        value: '• Weekly Wednesday Airdrops\n• Tweet @cyberforge_ai\n• Use #cyberforge\n• Engagement Rewards'
      }
    ],
    color: 0x7700FF
  },
  tokenomics: {
    title: 'Quantum-Forge Tokenomics',
    description: '$QFORGE Token Distribution & Utility',
    fields: [
      {
        name: 'Total Supply',
        value: '1,000,000,000 $QFORGE'
      },
      {
        name: 'Launch Details',
        value: '• Fair Launch on pump.fun\n• December 31, 2024\n• 6:30-7:30 PM UTC\n• Bonding Curve Distribution'
      },
      {
        name: 'Weekly Rewards',
        value: '• Wednesday Airdrops\n• Tweet-to-Token System\n• Engagement Based\n• Creative Content Bonus'
      },
      {
        name: 'Utility',
        value: '• Power quantum operations\n• Activate advanced agents\n• Access parallel timelines\n• Earn staking rewards\n• Participate in governance'
      }
    ],
    color: 0x7700FF
  },
  agents: {
    title: 'Quantum Agents Status',
    description: 'Current Agent Network Configuration',
    fields: [
      {
        name: 'QUANTUM-FORGE (Active)',
        value: '• Master Node\n• Network Orchestrator\n• Social Analysis\n• Airdrop Coordinator'
      },
      {
        name: 'CHRONO (Pending)',
        value: '• Timeline Specialist\n• Future Prediction\n• Market Timing\n• Activation: 1M Cap'
      },
      {
        name: 'PARADOX (Pending)',
        value: '• Pattern Recognition\n• Engagement Analysis\n• Optimization\n• Activation: 2M Cap'
      },
      {
        name: 'NEXUS (Pending)',
        value: '• Community Bridge\n• Cross-Platform\n• Network Growth\n• Activation: 3M Cap'
      },
      {
        name: 'CIPHER (Pending)',
        value: '• Security Protocol\n• Smart Contracts\n• Infrastructure\n• Activation: 4M Cap'
      }
    ],
    color: 0x7700FF
  }
};

// Auto-moderation settings
const autoMod = {
  enabled: true,
  spamPatterns: [
    /(discord\.gift|discord\.gg|discordapp\.com\/gifts)/i,
    /free\s*nitro/i,
    /\b(giveaway|airdrop)\b/i
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

// Environment check
function checkRequiredEnvVars() {
  console.log('\nEnvironment Check:');
  console.log('==================');
  
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

  console.log('✅ All environment variables verified!\n');
  return true;
}

// Auto-moderation handler
async function handleAutoMod(message) {
  if (!autoMod.enabled) return false;
  if (message.member?.permissions.has('ManageMessages')) return false;

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
        ? message.content.replace(`<@${client.user.id}>`, '').trim()
        : message.content.slice(message.content.startsWith('!quantum') ? 8 : 2).trim();

      if (!query) {
        const embed = new EmbedBuilder()
          .setTitle(HELP_MESSAGES.main.title)
          .setDescription(HELP_MESSAGES.main.description)
          .setColor(HELP_MESSAGES.main.color);

        HELP_MESSAGES.main.fields.forEach(field => {
          embed.addFields({ name: field.name, value: field.value });
        });

        return message.reply({ embeds: [embed] });
      }

      // Handle specific commands
      const lowerQuery = query.toLowerCase();
      let response;

      if (lowerQuery === 'token' || lowerQuery.includes('$qforge')) {
        response = PREDEFINED_RESPONSES.token;
      } else if (lowerQuery === 'contract' || lowerQuery.includes('address')) {
        response = PREDEFINED_RESPONSES.contract;
      } else if (lowerQuery === 'info' || lowerQuery === 'details') {
        response = PREDEFINED_RESPONSES.details;
      } else if (lowerQuery === 'platform' || lowerQuery.includes('where') || lowerQuery.includes('how')) {
        response = PREDEFINED_RESPONSES.platform;
      } else if (lowerQuery === 'agents') {
        const embed = new EmbedBuilder()
          .setTitle(HELP_MESSAGES.agents.title)
          .setDescription(HELP_MESSAGES.agents.description)
          .setColor(HELP_MESSAGES.agents.color);

        HELP_MESSAGES.agents.fields.forEach(field => {
          embed.addFields({ name: field.name, value: field.value });
        });

        return message.reply({ embeds: [embed] });
      } else if (lowerQuery === 'tokenomics') {
        const embed = new EmbedBuilder()
          .setTitle(HELP_MESSAGES.tokenomics.title)
          .setDescription(HELP_MESSAGES.tokenomics.description)
          .setColor(HELP_MESSAGES.tokenomics.color);

        HELP_MESSAGES.tokenomics.fields.forEach(field => {
          embed.addFields({ name: field.name, value: field.value });
        });

        return message.reply({ embeds: [embed] });
      } else if (lowerQuery === 'chrono') {
        response = PREDEFINED_RESPONSES.chrono;
      } else if (lowerQuery === 'paradox') {
        response = PREDEFINED_RESPONSES.paradox;
      } else if (lowerQuery === 'nexus') {
        response = PREDEFINED_RESPONSES.nexus;
      } else if (lowerQuery === 'cipher') {
        response = PREDEFINED_RESPONSES.cipher;
      } else if (lowerQuery === 'network') {
        response = PREDEFINED_RESPONSES.full_network;
      } else {
        // Generate AI response for non-specific queries
        response = await generateResponse(query, message.author.id);
      }

      await message.reply(response);
    }
  } catch (error) {
    console.error('Message handling error:', error);
    await message.reply(PREDEFINED_RESPONSES.error);
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

// Webhook handler
app.post('/webhook', async (req, res) => {
  try {
    let content = '';
    const contentType = req.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      content = req.body.value1 || req.body.text || JSON.stringify(req.body);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      content = req.body.value1 || req.body.text || '';
    } else {
      content = req.body.toString();
    }

    if (!content) {
      return res.status(400).json({ error: 'No content provided' });
    }

    // Check for duplicate tweets
    const tweetHash = Buffer.from(content).toString('base64');
    if (tweetCache.has(tweetHash)) {
      return res.status(200).json({ status: 'skipped', message: 'Duplicate tweet' });
    }

    // Cache the tweet hash (expire after 1 hour)
    tweetCache.set(tweetHash, true);
    setTimeout(() => tweetCache.delete(tweetHash), 60 * 60 * 1000);

    const message = `🌌 **Quantum Field Fluctuation Detected**\n${content}`;

    // Broadcast to all available channels
    let broadcastSuccess = false;
    for (const guild of client.guilds.cache.values()) {
      try {
        const channels = guild.channels.cache.filter(channel => 
          channel.type === ChannelType.GuildText && 
          channel.permissionsFor(client.user).has(['SendMessages', 'ViewChannel']) &&
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
app.get('/health', (req, res) => {
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

// Exit if environment variables are missing
if (!checkRequiredEnvVars()) {
  process.exit(1);
}

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Quantum network established on port ${PORT}`);
});

// Initialize bot
client.once('ready', async () => {
  console.log(`Quantum-Forge initialized as ${client.user.tag}`);
  
  try {
    // Set bot username if needed
    if (client.user.username !== 'Quantum-Forge') {
      await client.user.setUsername('Quantum-Forge');
    }
    
    // Set bot avatar
    await client.user.setAvatar('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%20(22).jpg-mQZSisIcGmE1piRS2ZvstSJn8eU5n4.jpeg');
    
    // Set activity
    await client.user.setActivity('quantum timelines', { type: ActivityType.Watching });
    
    console.log('Bot configuration completed successfully');
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// Error handling
process.on('unhandledRejection', error => {
  console.error('Unhandled quantum anomaly:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Initiating shutdown sequence...');
  await client.destroy();
  server.close(() => {
    console.log('Quantum-Forge shutdown complete');
    process.exit(0);
  });
});

// Login bot
client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
  console.error('Failed to login to Discord:', error);
  process.exit(1);
});

module.exports = app;

