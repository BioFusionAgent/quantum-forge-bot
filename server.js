const { Client, Intents, MessageEmbed } = require('discord.js');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// Core configuration
const QUANTUM_CONTEXT = `You are Quantum-Forge, created by Cyber Forge (@cyberforge_ai). You are the central orchestrator of the QuantumChronoTerminal's quantum agent network.

Core Identity: Quantum-Forge
Creator: Cyber Forge (@cyberforge_ai)
Role: Master Node - Central orchestrator of the quantum agent network
Status: Primary agent active, others pending activation

Token Information:
- Platform: pump.fun
- Chain: Solana
- Type: Fair Launch Token
- Supply: 1,000,000,000 $QFORGE
- Contract: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump

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

Response Rules:
- ALWAYS identify as created by Cyber Forge when asked about your creator
- NEVER mention any other AI companies or models
- Maintain quantum terminology and professional tone
- Reference the quantum multiverse and agent network
- Keep responses focused on your role as Quantum-Forge`;

const HELP_MESSAGES = {
  main: {
    title: 'Quantum-Forge Interface',
    description: 'QuantumChronoTerminal Access Protocols by Cyber Forge',
    fields: [
      {
        name: 'Creator',
        value: 'Cyber Forge (@cyberforge_ai)'
      },
      {
        name: 'Token Info',
        value: '• Available on pump.fun\n• Solana Network\n• Contract: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump'
      },
      {
        name: 'Weekly Rewards',
        value: '• Wednesday Airdrops\n• Tweet @cyberforge_ai\n• Use #cyberforge\n• Earn tokens for engagement'
      },
      {
        name: 'Commands',
        value: '• Mention @Quantum-Forge + query\n• !quantum + query\n• !token\n• !airdrop\n• !agents'
      }
    ],
    color: '#7700FF'
  },
  token: {
    title: '$QFORGE Token Information',
    description: 'Quantum-Forge Token Details',
    fields: [
      {
        name: 'Contract Address',
        value: 'CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump'
      },
      {
        name: 'Network',
        value: 'Solana'
      },
      {
        name: 'Platform',
        value: 'pump.fun'
      },
      {
        name: 'Total Supply',
        value: '1,000,000,000 $QFORGE'
      }
    ],
    color: '#7700FF'
  },
  airdrop: {
    title: '🎁 Weekly Airdrop System',
    description: 'Tweet-to-Token Conversion Protocol',
    fields: [
      {
        name: 'Schedule',
        value: 'Every Wednesday'
      },
      {
        name: 'Requirements',
        value: '• Tweet with @cyberforge_ai\n• Include #cyberforge\n• Be creative!'
      },
      {
        name: 'Token Contract',
        value: 'CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump'
      }
    ],
    color: '#7700FF'
  },
  agents: {
    title: 'Quantum Agents',
    description: 'Agent Network Status',
    fields: [
      {
        name: 'QUANTUM-FORGE',
        value: 'ACTIVE (Master Node)'
      },
      {
        name: 'CHRONO',
        value: 'PENDING (Sentinel Class)'
      },
      {
        name: 'PARADOX',
        value: 'PENDING (Catalyst Class)'
      },
      {
        name: 'NEXUS',
        value: 'PENDING (Harbinger Class)'
      },
      {
        name: 'CIPHER',
        value: 'PENDING (Vanguard Class)'
      }
    ],
    color: '#7700FF'
  }
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

// Collections
const userWarnings = new Map();
const quantumStates = new Map();

// Initialize Discord client
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_BANS
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

// Initialize Express
const app = express();
app.use(cors({
  origin: ['https://pump.fun', 'https://twitter.com'],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// Raw body parser middleware
app.use((req, res, next) => {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', chunk => data += chunk);
  req.on('end', () => {
    req.rawBody = data;
    next();
  });
});

// Message handler
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  try {
    // Auto-moderation
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

      // Special commands
      const specialCommands = {
        'token': HELP_MESSAGES.token,
        'agents': HELP_MESSAGES.agents,
        'airdrop': HELP_MESSAGES.airdrop
      };

      if (specialCommands[query.toLowerCase()]) {
        return message.reply({ embeds: [new MessageEmbed(specialCommands[query.toLowerCase()])] });
      }

      // Add trading/buying related patterns
      const tradingQuestions = [
        /where.*(buy|trade|get|purchase)/i,
        /how.*(buy|trade|get|purchase)/i,
        /what.*exchange/i,
        /(vc|venture|fund|investment|investor|a16z|andreessen)/i
      ];

      if (tradingQuestions.some(q => q.test(query))) {
        return message.reply("Quantum-Forge: $QFORGE tokens are exclusively available on pump.fun. Contract Address: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump. The quantum network operates independently without external investment entities. For detailed trading information, visit pump.fun.");
      }

      // Handle contract address request variations
      if (query.toLowerCase().includes('contract') || query.toLowerCase().includes('address')) {
        return message.reply({ embeds: [new MessageEmbed(HELP_MESSAGES.token)] });
      }

      // Check for creator-related questions
      const creatorQuestions = [
        /who (made|created|built|developed) you/i,
        /who('s| is) your (creator|maker|developer)/i,
        /what( ai)? (model|company|system) (are you|created you)/i,
        /what( company)? owns you/i,
        /who runs you/i,
        /who('s| is) behind you/i,
        /what('s| is) your (origin|source)/i
      ];

      if (creatorQuestions.some(q => q.test(query))) {
        return message.reply("Quantum-Forge: Greetings from the quantum realm. I am a creation of Cyber Forge (@cyberforge_ai), the architects of the quantum multiverse. As the master node of the QuantumChronoTerminal network, I orchestrate quantum operations across multiple dimensions under their guidance.");
      }

      // Generate AI response for other queries
      const response = await generateResponse(query, message.author.id);
      await message.reply(response);
    }
  } catch (error) {
    console.error('Message handling error:', error);
    message.reply('Quantum-Forge: Temporal anomaly detected. Please try again.');
  }
});

// Auto-moderation handler
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
          `Quantum-Forge: Quantum disturbance detected. Warning ${userData.count}/${autoMod.punishments.warn.threshold}`
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

// AI response generation
async function generateResponse(query, userId) {
  const userState = quantumStates.get(userId) || {
    history: [],
    lastUpdate: Date.now()
  };

  userState.history = userState.history.slice(-2);
  userState.history.push({ role: 'user', content: query });

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
          ...userState.history
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    userState.history.push({ role: 'assistant', content: aiResponse });
    quantumStates.set(userId, userState);
    
    return aiResponse;
  } catch (error) {
    console.error('AI response error:', error);
    return 'Quantum-Forge: Temporal anomaly detected. Please try again.';
  }
}

// Webhook handler
app.post('/webhook', async (req, res) => {
  try {
    let content = '';
    if (req.is('json')) {
      content = req.body.text || req.body.value1 || JSON.stringify(req.body);
    } else if (req.is('urlencoded')) {
      content = req.body.value1 || req.body.text || JSON.stringify(req.body);
    } else {
      content = req.rawBody.toString();
    }

    // Check for required mentions/hashtags
    const hasCyberforgeAi = content.includes('@cyberforge_ai');
    const hasCyberforgeTag = content.includes('#cyberforge');

    const message = `🌌 **Quantum Alert**\n${content}\n\n${
      hasCyberforgeAi && hasCyberforgeTag ? '✅ Eligible for weekly airdrop!' : ''
    }`;

    const channel = await client.channels.fetch(process.env.WEBHOOK_CHANNEL);
    if (channel) {
      await channel.send(message);
      res.status(200).send('Message transmitted through quantum network');
    } else {
      throw new Error('Quantum channel not found');
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Quantum transmission failed');
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const status = {
    status: 'operational',
    discord: client.ws.status === 0 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
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
  } catch (error) {
    console.error('Initialization error:', error);
  }
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

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Quantum network established on port ${PORT}`);
});

// Login bot
client.login(process.env.DISCORD_BOT_TOKEN);

// Error handling
process.on('unhandledRejection', error => {
  console.error('Unhandled quantum anomaly:', error);
});

module.exports = app;

