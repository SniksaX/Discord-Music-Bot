// src/services/commands/stop.command.ts
import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { CommandHandler } from './command.handler';
import { audioPlayer } from '../audio/audio.player';
import { getVoiceConnection } from '@discordjs/voice';
import { queueManager } from '../queue/queue.mannager';

class StopCommand extends CommandHandler {
    name = 'stop';
    description = 'Stops playback and clears the queue.';

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
            await interaction.reply({ content: 'You need to be in a voice channel to stop the music!', ephemeral: true });
            return;
        }

        const guildQueue = queueManager.getQueue(interaction.guildId!);
        if (!guildQueue) {
            await interaction.reply({ content: 'Nothing is currently playing.', ephemeral: true });
            return;
        }

        queueManager.clear(interaction.guildId!);
        audioPlayer.stop();
        let connection = getVoiceConnection(interaction.guildId as string);
        if (connection) {
            connection.destroy();
        }
        await interaction.reply('Stopped playback and cleared the queue.');
    }
}

export const stopCommand = new StopCommand();