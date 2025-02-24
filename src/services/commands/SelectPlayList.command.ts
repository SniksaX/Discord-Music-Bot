// src/services/commands/selectPlaylist.command.ts
import { ChatInputCommandInteraction, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { CommandHandler } from './command.handler';
import { YoutubeService } from '../youtube.service';
import { DiscordService } from '../discord.service';

class SelectPlaylistCommand extends CommandHandler {
    name = 'selectplaylist';
    description = 'Select a playlist to play after logging in.';

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const userData = DiscordService.getUserData(interaction.user.id);

        if (!userData) {
            await interaction.reply({ content: 'You need to log in first using /login.', ephemeral: true });
            return;
        }

        try {
            const playlists = await YoutubeService.getAllPlaylists(userData.accessToken);
            if (!playlists || !playlists.items || playlists.items.length === 0) {
                await interaction.reply({ content: 'No playlists found for your account.', ephemeral: true });
                return;
            }

            const select = new StringSelectMenuBuilder()
                .setCustomId('playlistSelect')
                .setPlaceholder('Select a playlist')
                .addOptions(
                    playlists.items.map((playlist: any) =>
                        new StringSelectMenuOptionBuilder()
                            .setLabel(playlist.snippet.title)
                            .setValue(playlist.id)
                    )
                );

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

            await interaction.reply({
                content: 'Choose a playlist:',
                components: [row],
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error fetching playlists:', error);
            await interaction.reply({ content: 'Failed to fetch your playlists.', ephemeral: true });
        }
    }
}

export const selectPlaylistCommand = new SelectPlaylistCommand();