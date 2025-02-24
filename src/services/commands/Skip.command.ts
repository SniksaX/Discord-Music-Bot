import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { CommandHandler } from './command.handler';
import { audioPlayer } from '../audio/audio.player';
import { queueManager } from '../queue/queue.mannager';

class SkipCommand extends CommandHandler {
    name = 'skip';
    description = 'Skips the currently playing song.';

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
            await interaction.reply({ content: 'You need to be in a voice channel to skip!', ephemeral: true });
            return;
        }

        const guildQueue = queueManager.getQueue(interaction.guildId!);
        if (!guildQueue) {
            await interaction.reply({ content: 'Nothing is currently playing.', ephemeral: true });
            return;
        }
        if(!guildQueue.playing) {
            await interaction.reply({content: 'Nothing to Skip', ephemeral: true})
            return;
        }

        audioPlayer.stop();
        await interaction.reply('Skipped to the next song.');
    }
}

export const skipCommand = new SkipCommand();