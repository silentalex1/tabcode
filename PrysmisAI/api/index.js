const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const app = express();
const db = new sqlite3.Database(':memory:'); 

app.use(cors());
app.use(bodyParser.json());

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN; 
const ADMIN_ID = process.env.DISCORD_ADMIN_ID; 

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS keys (key_value TEXT PRIMARY KEY, status TEXT)");
});

app.post('/verify-key', (req, res) => {
    const { key } = req.body;
    db.get("SELECT status FROM keys WHERE key_value = ?", [key], (err, row) => {
        if (err) return res.status(500).json({ valid: false });
        if (!row) return res.json({ valid: false });
        if (row.status === 'blacklisted') return res.json({ valid: false, reason: "Key Blacklisted" });
        res.json({ valid: true });
    });
});

client.on('ready', () => {
    console.log(`Bot logged in as ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot || message.author.id !== ADMIN_ID) return;

    if (message.content.startsWith('.genkey')) {
        const key = 'prysmis_' + Math.random().toString(36).substr(2, 9);
        db.run("INSERT INTO keys (key_value, status) VALUES (?, ?)", [key, 'active']);
        message.reply(`**Generated Key:** \`${key}\``);
    }

    if (message.content.startsWith('.blacklist')) {
        const key = message.content.split(' ')[1];
        db.run("UPDATE keys SET status = 'blacklisted' WHERE key_value = ?", [key]);
        message.reply(`**Blacklisted:** ${key}`);
    }

    if (message.content.startsWith('.whitelist')) {
        const key = message.content.split(' ')[1];
        db.run("UPDATE keys SET status = 'active' WHERE key_value = ?", [key]);
        message.reply(`**Whitelisted:** ${key}`);
    }
});

if(BOT_TOKEN) {
    client.login(BOT_TOKEN);
}

module.exports = app;