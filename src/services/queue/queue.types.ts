import { TextChannel } from 'discord.js';

export interface PlaylistQueueItem {
    url: string;
    title: string;
    requestedBy: string;
}

export interface GuildQueue {
    playlistId?: string;
    queue: PlaylistQueueItem[];
    playing: boolean;
    voiceChannelId: string | null;
    textChannel: TextChannel | null;
    paused: boolean;
}