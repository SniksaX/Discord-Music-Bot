// src/services/commands/Play.command.ts
import { ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { CommandHandler } from './command.handler';
import { audioPlayer } from '../audio/audio.player';
import { DiscordService } from '../discord.service';
import { queueManager } from '../queue/queue.mannager';

class PlayCommand extends CommandHandler {
    name = 'play';
    description = 'Plays a YouTube video or playlist. Login is NOT required.';
    options = [
        {
            name: 'url',
            type: 3,
            description: 'YouTube URL or Playlist URL',
            required: true,
        },
    ];

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
            await interaction.reply({ content: 'You need to be in a voice channel!', ephemeral: true });
            return;
        }

        const urlOrPlaylistId = interaction.options.getString('url', true);
        const guildId = interaction.guildId!;
        const voiceChannelId = interaction.member.voice.channel.id;
        const textChannel = interaction.channel as TextChannel;
        const guildQueue = queueManager.getOrCreateQueue(guildId, voiceChannelId, textChannel);

        await interaction.deferReply();

        console.log(`Attempting to play URL: ${urlOrPlaylistId}`);

        try {
            queueManager.add(guildId, {
                url: urlOrPlaylistId,
                title: "Fetching title...",
                requestedBy: interaction.user.id,
            });
            if (!guildQueue.playing) {
                DiscordService.playNextSong(guildId);
            }
            await interaction.editReply({ content: `🎵 Added to queue: ${urlOrPlaylistId}. Starting playback.` });

        } catch (error: any) {
            console.error('Error adding song to queue:', error);
            await interaction.editReply({ content: `❌ Failed to add to queue! ${error.message}` });
        }
    }
}

export const playCommand = new PlayCommand();