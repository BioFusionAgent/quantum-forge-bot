const { Client, Intents, MessageEmbed } = require('discord.js');
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// Import custom modules
const { QUANTUM_CONTEXT } = require('./config/quantum-context');
const { RESPONSE_TEMPLATES } = require('./config/response-templates');
const { HELP_MESSAGES } = require('./config/help-messages');

// Constants
const VERIFY_SETTINGS = {
  channelName: 'quantum-verification',
  verifiedRole: 'Quantum Traveler',
  unverifiedRole: 'Unverified',
  verifyEmoji: '✓'
};

const WEBHOOK_SETTINGS = {
  channelId: process.env.WEBHOOK_CHANNEL || '1234567890',
  targetChannel: 'tweet-to-token'
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
        'tokenomics': HELP_MESSAGES.tokenomics,
        'agents': HELP_MESSAGES.agents,
        'launch': getLaunchInfo(),
        'airdrop': getAirdropInfo()
      };

      if (specialCommands[query]) {
        return message.reply({ embeds: [new MessageEmbed(specialCommands[query])] });
      }

      // Generate AI response
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

    const channel = await client.channels.fetch(WEBHOOK_SETTINGS.channelId);
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Quantum network established on port ${PORT}`);
});

// Login bot
client.login(process.env.DISCORD_BOT_TOKEN);

// Error handling
process.on('unhandledRejection', error => {
  console.error('Unhandled quantum anomaly:', error);
});

module.exports = app;

