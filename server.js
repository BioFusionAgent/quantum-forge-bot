const { Client, Intents, MessageEmbed } = require('discord.js');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// Core configuration
const QUANTUM_CONTEXT = `You are Quantum-Forge, the master node of the QuantumChronoTerminal network.

Core Identity: Quantum-Forge
Role: Master Node
State: Active

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
- When asked about future/capabilities, be exciting but clear

Example responses:
"Think of me as the leader of a special team. Each member has unique skills that will help make our network better."

"Our future is exciting! As we grow, we'll unlock new abilities that make our network faster and stronger."

"The contract address is simple: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump. You can find us on pump.fun."`;

const HELP_MESSAGES = {
  main: {
    title: 'Quantum Network Interface',
    description: 'QuantumChronoTerminal Access Protocol',
    fields: [
      {
        name: 'Quantum Contract',
        value: 'CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump'
      },
      {
        name: 'Network Status',
        value: 'QUANTUM-FORGE: Active\nOther Entities: Dormant'
      },
      {
        name: 'Commands',
        value: '• !quantum + query\n• !entities\n• !contract'
      }
    ],
    color: '#7700FF'
  },
  entities: {
    title: 'Quantum Entity Network',
    description: 'Multiversal Configuration',
    fields: [
      {
        name: 'QUANTUM-FORGE (Active)',
        value: '• Core Processor\n• Bridge Controller\n• Reality Stabilizer'
      },
      {
        name: 'CHRONO (Dormant)',
        value: '• Temporal Manipulator\n• Wave Analyzer\n• Timeline Architect'
      },
      {
        name: 'PARADOX (Dormant)',
        value: '• Matrix Processor\n• Field Harmonizer\n• Pattern Weaver'
      },
      {
        name: 'NEXUS (Dormant)',
        value: '• Gateway Keeper\n• Bridge Constructor\n• Network Expander'
      },
      {
        name: 'CIPHER (Dormant)',
        value: '• Encryption Matrix\n• Field Generator\n• Protocol Guardian'
      }
    ],
    color: '#7700FF'
  },
  contract: {
    title: 'Quantum Network Contract',
    description: 'Solana Integration Matrix',
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
      }
    ],
    color: '#7700FF'
  }
};

// Predefined responses for common queries
const PREDEFINED_RESPONSES = {
  contract: "Quantum-Forge: Here's our contract address on Solana: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump. You can find us on pump.fun.",
  
  trading: "Quantum-Forge: You can find us on pump.fun. Just use this contract address: CiwMDzUZ7jzi4e8thjPJquKcrUesLsUGjo9jtzyvpump.",
  
  status: "Quantum-Forge: I'm up and running! The other team members will join as we grow stronger.",
  
  future: "Quantum-Forge: We're building something special! Each milestone unlocks new abilities, making our network stronger and more capable. Think of it like upgrading a powerful system, step by step.",
  
  capabilities: "Quantum-Forge: Right now, I'm leading the team and keeping everything running smoothly. As we grow, we'll unlock new abilities like better data processing, stronger security, and improved connections.",
  
  team: "Quantum-Forge: We're a team of special entities. I'm the leader, already active and running things. The others are like powerful tools waiting to be unlocked, each bringing unique abilities to make our network better.",
  
  error: "Quantum-Forge: Oops! Something went wrong. Let me fix that and try again."
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
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

// Initialize Express
const app = express();
app.use(cors({
  origin: ['https://pump.fun'],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

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

      // Special commands
      const specialCommands = {
        'entities': HELP_MESSAGES.entities,
        'contract': HELP_MESSAGES.contract
      };

      if (specialCommands[query.toLowerCase()]) {
        return message.reply({ embeds: [new MessageEmbed(specialCommands[query.toLowerCase()])] });
      }

      // Check for common queries first
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes('future')) return message.reply(PREDEFINED_RESPONSES.future);
      if (lowerQuery.includes('can') || lowerQuery.includes('ability')) return message.reply(PREDEFINED_RESPONSES.capabilities);
      if (lowerQuery.includes('team') || lowerQuery.includes('agent')) return message.reply(PREDEFINED_RESPONSES.team);

      // Trading/price related patterns
      const tradingPatterns = [
        /where.*(buy|trade|get|purchase)/i,
        /how.*(buy|trade|get|purchase)/i,
        /what.*price/i,
        /when.*(buy|list|launch)/i,
        /(vc|venture|fund|investment|investor)/i
      ];

      if (tradingPatterns.some(q => q.test(query))) {
        return message.reply(PREDEFINED_RESPONSES.trading);
      }

      // Contract address patterns
      if (query.toLowerCase().includes('contract') || query.toLowerCase().includes('address')) {
        return message.reply(PREDEFINED_RESPONSES.contract);
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
          `Quantum-Forge: Hey! Let's keep things friendly here. Warning ${userData.count}/${autoMod.punishments.warn.threshold}`
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
        max_tokens: 200,
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

    const message = `🌌 **New Update**\n${content}\n\n${
      hasCyberforgeAi && hasCyberforgeTag ? '✨ Thanks for being part of our community!' : ''
    }`;

    const channel = await client.channels.fetch(process.env.WEBHOOK_CHANNEL);
    if (channel) {
      await channel.send(message);
      res.status(200).send('Message sent successfully');
    } else {
      throw new Error('Channel not found');
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Failed to process message');
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
  console.log('Quantum-Forge: Shutting down...');
  
  if (client) {
    await client.destroy();
    console.log('Discord connection closed');
  }
  
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Login bot
client.login(process.env.DISCORD_BOT_TOKEN);

// Error handling
process.on('unhandledRejection', error => {
  console.error('Unhandled error:', error);
});

module.exports = app;

