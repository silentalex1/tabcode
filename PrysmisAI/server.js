require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const ADMIN_ID = process.env.DISCORD_ADMIN_ID;

const keyStore = new Map();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/verify-key', (req, res) => {
    const { key } = req.body;
    
    if (!keyStore.has(key)) {
        return res.json({ valid: false, reason: "Invalid Key" });
    }

    const status = keyStore.get(key);
    
    if (status === 'blacklisted') {
        return res.json({ valid: false, reason: "Key Blacklisted" });
    }

    res.json({ valid: true });
});

client.on('ready', () => {
    console.log(`Bot logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot || message.author.id !== ADMIN_ID) return;

    if (message.content.startsWith('.genkey')) {
        const key = 'prysmis_' + Math.random().toString(36).substr(2, 9);
        keyStore.set(key, 'active');
        message.reply(`**Key:** \`${key}\``);
    }

    if (message.content.startsWith('.blacklist')) {
        const key = message.content.split(' ')[1];
        if (key && keyStore.has(key)) {
            keyStore.set(key, 'blacklisted');
            message.reply(`**Blacklisted:** ${key}`);
        }
    }

    if (message.content.startsWith('.whitelist')) {
        const key = message.content.split(' ')[1];
        if (key && keyStore.has(key)) {
            keyStore.set(key, 'active');
            message.reply(`**Whitelisted:** ${key}`);
        }
    }
});

if (BOT_TOKEN) {
    client.login(BOT_TOKEN);
}

app.listen(PORT, () => {
    console.log(`Prysmis running on port ${PORT}`);
});