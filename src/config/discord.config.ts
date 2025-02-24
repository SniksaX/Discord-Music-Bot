//discord.config.ts

import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        // GatewayIntentBits.GuildMessages,
        // GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

export const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN!; 