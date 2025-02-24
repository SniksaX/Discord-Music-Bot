import { TextChannel } from 'discord.js';
import { GuildQueue, PlaylistQueueItem } from './queue.types';

export class QueueManager {
    private guildQueues: Map<string, GuildQueue> = new Map();

    getOrCreateQueue(guildId: string, voiceChannelId: string, textChannel: TextChannel): GuildQueue {
        let queue = this.guildQueues.get(guildId);
        if (!queue) {
            queue = {
                queue: [],
                playing: false,
                voiceChannelId,
                textChannel,
                playlistId: undefined,
                paused: false,
            };
            this.guildQueues.set(guildId, queue);
        } else {
            queue.voiceChannelId = voiceChannelId;
            queue.textChannel = textChannel;
        }
        return queue;
    }

    getQueue(guildId: string): GuildQueue | undefined {
        return this.guildQueues.get(guildId);
    }

    add(guildId: string, item: PlaylistQueueItem) {
        const queue = this.guildQueues.get(guildId);
        if (!queue) {
          return;
        }
        queue.queue.push(item);
    }
    addMultiple(guildId: string, items: PlaylistQueueItem[]) {
        const queue = this.guildQueues.get(guildId);
        if(!queue) return;
        queue.queue.push(...items);
    }

    next(guildId: string): PlaylistQueueItem | undefined {
        const queue = this.guildQueues.get(guildId);
        if (!queue) {
            return undefined;
        }
        return queue.queue.shift();
    }

    clear(guildId: string) {
        const queue = this.guildQueues.get(guildId);
        if (queue) {
            queue.queue = [];
            this.guildQueues.delete(guildId)
        }
    }
    setPlaylistId(guildId: string, playlistId: string | undefined) {
        const queue = this.getQueue(guildId);
        if(queue) {
            queue.playlistId = playlistId
        }
    }

    removeGuildQueue(guildId: string) {
      this.guildQueues.delete(guildId);
    }
    isPaused(guildId: string): boolean {
      const queue = this.getQueue(guildId);
      if(!queue) return false;
      return queue.paused;
    }
    setPaused(guildId: string, paused: boolean) {
        const queue = this.getQueue(guildId);
        if(!queue) return;
        queue.paused = paused;
    }
    isPlaying(guildId: string): boolean {
        const queue = this.getQueue(guildId);
        if(!queue) return false;
        return queue.playing;
    }
    setPlaying(guildId: string, playing: boolean){
        const queue = this.getQueue(guildId);
        if(!queue) return;
        queue.playing = playing;
    }

}

export const queueManager = new QueueManager();