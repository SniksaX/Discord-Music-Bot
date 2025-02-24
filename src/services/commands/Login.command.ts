// src/services/commands/login.command.ts
import { ChatInputCommandInteraction } from 'discord.js';
import { CommandHandler } from './command.handler';
import { oauth2Client, SCOPES } from '../../config/google.config';

class LoginCommand extends CommandHandler {
    name = 'login';
    description = 'Log in with your Google account.';

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: SCOPES,
            state: interaction.user.id,
        });

        try {
            await interaction.user.send(`Please log in with Google: ${authUrl}`);
            await interaction.reply({ content: 'I\'ve sent you a DM with the login link!', ephemeral: true });
        } catch (error) {
            console.error("Failed to send DM:", error);
            await interaction.reply({ content: "I couldn't send you a DM. Make sure you have DMs enabled.", ephemeral: true });
        }
    }
}

export const loginCommand = new LoginCommand();