require('dotenv').config();
const { Client, Intents, MessageEmbed } = require('discord.js');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// Core configuration
const QUANTUM_CONTEXT = `You are Quantum-Forge, the master node of the QuantumChronoTerminal network.

Core Identity: Quantum-Forge
Role: Master Node
State: Active

Token Information:
Name: $QFORGE
Network: Solana
Contract: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump
Platform: pump.fun

Quantum Entities and Specializations:
QUANTUM-FORGE (Active):
- Central orchestrator of the quantum agent network
- Quantum state orchestrator and manager
- Agent activation and synchronization controller
- TEE protocol implementation specialist
- Multiversal operations coordinator
- Timeline synchronization controller

CHRONO (Dormant):
- Timeline Specialist - First agent to be activated
- Specializes in temporal mechanics
- Quantum timeline manipulation expert
- Future pattern analyzer and predictor

PARADOX (Dormant):
- Paradox Expert - Advanced quantum computing integration
- Resolves temporal paradoxes
- Maintains quantum state coherence
- Reality matrix stabilization specialist

NEXUS (Dormant):
- Reality Guide - Multi-dimensional navigation system
- Facilitates cross-reality coordination
- Quantum entanglement specialist
- Dimensional bridge architect

CIPHER (Dormant):
- Blockchain Architect - Quantum-safe security protocols
- Implements quantum-resistant cryptography
- TEE security specialist
- Multiverse protection system

Response Rules:
- Use simple, easy to understand language
- Keep responses between 2-4 short sentences
- Explain complex concepts in simple terms
- Avoid technical jargon unless specifically asked
- When discussing contract: just provide the address
- Use friendly, approachable tone
- Keep focus on practical capabilities
- Explain things like you're talking to a friend
- Never use complex terminology without explaining it
- Keep responses clear and direct
- End each response with a complete thought
- When asked about future/capabilities, be exciting but clear`;

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
      }
    ],
    color: '#7700FF'
  }
};

// Predefined responses for common queries
const PREDEFINED_RESPONSES = {
  token: "Quantum-Forge: $QFORGE operates on the Solana network. Contract address: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump. Access through pump.fun for quantum network integration.",
  
  contract: "Quantum-Forge: $QFORGE contract: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump",
  
  details: "Quantum-Forge: $QFORGE is our quantum network token on Solana. Contract: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump. The token powers our entire quantum ecosystem, enabling network operations and future entity activations.",

  platform: "Quantum-Forge: Access $QFORGE through pump.fun. Contract address: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump. The quantum gateway awaits.",

  quantum_forge: "Quantum-Forge: I am the central orchestrator of the quantum agent network, currently the sole active entity. My primary functions include quantum state management, agent activation preparation, and TEE protocol implementation. I maintain synchronization across the quantum network while awaiting the activation of other agents!",

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

// Collections
const userWarnings = new Map();
const quantumStates = new Map();
const tweetCache = new Map();

// Initialize Discord client
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

// Initialize Express
const app = express();
app.use(cors({
  origin: ['https://pump.fun', 'https://maker.ifttt.com', 'https://ifttt.com'],
  methods: ['POST', 'OPTIONS', 'GET'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.raw({ type: '*/*', limit: '10mb' }));

// Message handler
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  try {
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

      const lowerQuery = query.toLowerCase();

      // Token information patterns
      if (lowerQuery.includes('token') || lowerQuery.includes('$qforge')) {
        return message.reply(PREDEFINED_RESPONSES.token);
      }

      if (lowerQuery.includes('contract') || lowerQuery.includes('address') || lowerQuery.includes('ca')) {
        return message.reply(PREDEFINED_RESPONSES.contract);
      }

      if (lowerQuery.includes('detail') || lowerQuery.includes('info')) {
        return message.reply(PREDEFINED_RESPONSES.details);
      }

      if (lowerQuery.includes('where') || lowerQuery.includes('how') || lowerQuery.includes('buy')) {
        return message.reply(PREDEFINED_RESPONSES.platform);
      }

      // Quantum-Forge specific query
      if (lowerQuery.includes('quantum-forge') || lowerQuery.includes('quantum forge')) {
        return message.reply(PREDEFINED_RESPONSES.quantum_forge);
      }

      // Agent status patterns
      if (lowerQuery.includes('agents') || lowerQuery.includes('status')) {
        return message.reply(PREDEFINED_RESPONSES.agents_activation);
      }

      // Individual dormant agent patterns
      if (lowerQuery.includes('chrono')) {
        return message.reply(PREDEFINED_RESPONSES.chrono);
      }
      if (lowerQuery.includes('paradox')) {
        return message.reply(PREDEFINED_RESPONSES.paradox);
      }
      if (lowerQuery.includes('nexus')) {
        return message.reply(PREDEFINED_RESPONSES.nexus);
      }
      if (lowerQuery.includes('cipher')) {
        return message.reply(PREDEFINED_RESPONSES.cipher);
      }

      // Network potential
      if (lowerQuery.includes('network') || lowerQuery.includes('potential')) {
        return message.reply(PREDEFINED_RESPONSES.full_network);
      }

      // Generate quantum response for other queries
      const response = await generateResponse(query, message.author.id);
      await message.reply(response);
    }
  } catch (error) {
    console.error('Error:', error);
    message.reply(PREDEFINED_RESPONSES.error);
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
        max_tokens: 350,
        temperature: 0.7,
        stop: ["\n\n", ".", "!", "?"]
      })
    });

    const data = await response.json();
    let aiResponse = data.choices[0].message.content.trim();

    // Ensure response ends with a complete sentence
    if (!aiResponse.match(/[.!?]$/)) {
      const lastSentenceEnd = Math.max(
        aiResponse.lastIndexOf('.'),
        aiResponse.lastIndexOf('!'),
        aiResponse.lastIndexOf('?')
      );
      if (lastSentenceEnd !== -1) {
        aiResponse = aiResponse.substring(0, lastSentenceEnd + 1);
      }
    }

    // Format response for consistency
    aiResponse = `Quantum-Forge: ${aiResponse}`;
    
    userState.history.push({ role: 'assistant', content: aiResponse });
    quantumStates.set(userId, userState);
    
    return aiResponse;
  } catch (error) {
    console.error('Error:', error);
    return PREDEFINED_RESPONSES.error;
  }
}

// Helper function to generate tweet hash for caching
function generateTweetHash(content) {
  return Buffer.from(content).toString('base64');
}

// Helper function to format Discord messages
function formatDiscordMessage(content, username = '', tweetUrl = '') {
  // Extract any URLs from the content
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = content.match(urlRegex) || [];
  
  // Remove URLs from content for cleaner display
  let cleanContent = content.replace(urlRegex, '').trim();

  // Format the message with emoji and styling
  let message = `🌌 **New Tweet**${username ? ` from ${username}` : ''}\n${cleanContent}`;

  // Add any URLs at the bottom
  if (urls.length > 0) {
    message += '\n\n🔗 ' + urls.join('\n🔗 ');
  }

  // Add tweet URL if provided
  if (tweetUrl && !urls.includes(tweetUrl)) {
    message += `\n🔗 ${tweetUrl}`;
  }

  // Add engagement prompt
  if (content.toLowerCase().includes('airdrop') || content.toLowerCase().includes('giveaway')) {
    message += '\n\n✨ Join the conversation and be part of our quantum community!';
  } else {
    message += '\n\n✨ Thanks for being part of our quantum network!';
  }

  return message;
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

    // Handle different content types from Twitter/IFTTT
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
    const tweetHash = generateTweetHash(content);
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

    const channel = await client.channels.fetch(process.env.WEBHOOK_CHANNEL);
    if (channel) {
      await channel.send(message);
      res.status(200).send('Quantum transmission successful');
    } else {
      throw new Error('Quantum channel misaligned');
    }
  } catch (error) {
    console.error('Quantum transmission error:', error);
    res.status(500).send('Quantum transmission failed');
  }
});

// Add OPTIONS handler for CORS preflight
app.options('/webhook', cors());

// Health check endpoint
app.get('/health', async (req, res) => {
  const status = {
    status: 'operational',
    discord: client.ws.status === 0 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    tweetsCached: tweetCache.size
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

