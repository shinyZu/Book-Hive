// Initialize dotenv
import dotenv from "dotenv";

dotenv.config();

const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios'); // To interact with your backend API

// Set up your bot with permissions to read and send messages
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Replace with your bot token
const token = process.env.CLIENT_TOKEN;

// Replace with your web application API URL
const apiBaseUrl = 'http://your-web-app-api.com/api';

// When the bot is logged in
client.once('ready', () => {
  console.log('BookHiveBot is online!');
  console.log(`Logged in as ${client.user.tag}!`);
});

// Log the bot in using the token
client.login(token);
