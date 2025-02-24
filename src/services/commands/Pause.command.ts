// src/services/commands/pause.command.ts
import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { CommandHandler } from './command.handler';
import { audioPlayer } from '../audio/audio.player';
import { queueManager } from '../queue/queue.mannager';

class PauseCommand extends CommandHandler {
    name = 'pause';
    description = 'Pauses or resumes playback.';

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
            await interaction.reply({ content: 'You need to be in a voice channel to pause/resume!', ephemeral: true });
            return;
        }

        const guildQueue = queueManager.getQueue(interaction.guildId!);
        if (!guildQueue) {
            await interaction.reply({ content: 'Nothing is currently playing.', ephemeral: true });
            return;
        }

        if (guildQueue.paused) {
            audioPlayer.unpause();
            queueManager.setPaused(interaction.guildId!, false)
            await interaction.reply('Resumed playback.');
        } else {
            audioPlayer.pause();
            queueManager.setPaused(interaction.guildId!, true)
            await interaction.reply('Paused playback.');
        }
    }
}

export const pauseCommand = new PauseCommand();