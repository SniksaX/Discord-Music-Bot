//src/service/audio/audio.player.ts
import {
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    NoSubscriberBehavior,
    VoiceConnectionStatus,
    entersState,
    StreamType,
    getVoiceConnection,
    joinVoiceChannel
} from '@discordjs/voice';
import ytdl, { YtResponse, YtFormat } from 'yt-dlp-exec';
import { Readable } from 'stream';
import { PlaylistQueueItem } from '../queue/queue.types';
import { client } from '../../config/discord.config'


class AudioPlayer {
    private player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
        }
    });

    constructor() {
        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        this.player.on(AudioPlayerStatus.Idle, () => {
            console.log('AudioPlayer Event: Idle');
        });
        this.player.on(AudioPlayerStatus.Buffering, () => {
            console.log('AudioPlayer Event: Buffering');
        });
        this.player.on(AudioPlayerStatus.Playing, () => {
            console.log('AudioPlayer Event: Playing');
        });
        this.player.on(AudioPlayerStatus.Paused, () => {
            console.log('AudioPlayer Event: Paused');
        });
        this.player.on(AudioPlayerStatus.AutoPaused, () => {
            console.log('AudioPlayer Event: AutoPaused');
        });

        this.player.on('error', error => {
            console.error('Audio Player Event: Error:', error);
        });
    }

    async play(guildId: string, voiceChannelId: string, item: PlaylistQueueItem, onSongEnd: () => void) {
        console.log(`audioPlayer.play START for URL: ${item.url}`); // START log
        try {
            console.log(`Fetching metadata for URL: ${item.url}`); // Metadata fetch start log
            const metadata: YtResponse = await this.fetchMetadata(item.url);
            console.log(`Metadata fetched successfully for URL: ${item.url}, title: ${metadata.title}`); // Metadata fetch success log
            const bestFormat = this.findBestAudioFormat(metadata);
            console.log(`Best audio format found for URL: ${item.url}, format: ${bestFormat.format_id}`); // Format found log

            console.log(`Fetching audio stream from URL: ${bestFormat.url}`); // Audio fetch start log
            const audioResponse = await fetch(bestFormat.url, {
                headers: bestFormat.http_headers as Record<string, string>,
            });
            console.log(`Audio stream response status for URL: ${item.url}: ${audioResponse.status} ${audioResponse.statusText}`); // Audio fetch response log

            if (!audioResponse.ok) {
                throw new Error(`Failed to fetch audio: ${audioResponse.status} ${audioResponse.statusText}`);
            }

            if (!audioResponse.body) {
                throw new Error("Audio response body is null.");
            }
            const stream = Readable.from(audioResponse.body as any);
            const resource = createAudioResource(stream, {
                inputType: StreamType.WebmOpus,
                inlineVolume: true,
            });

            let connection = getVoiceConnection(guildId);
            if (!connection) {
                console.log(`No existing voice connection, creating new connection for guild: ${guildId}, channel: ${voiceChannelId}`); // Connection create log
                connection = joinVoiceChannel({
                    channelId: voiceChannelId,
                    guildId: guildId,
                    adapterCreator: client.guilds.cache.get(guildId)!.voiceAdapterCreator,
                    selfDeaf: false,
                });
            } else {
                console.log(`Using existing voice connection for guild: ${guildId}`); // Connection reuse log
            }

            connection.on(VoiceConnectionStatus.Ready, () => {
                console.log('VoiceConnection Event: Ready - ready to play audio!');
            });

            connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                console.log('VoiceConnection Event: Disconnected - attempting reconnect...'); // Disconnected log
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                    // Seems to be re-established, ignore disconnect.
                    console.log('VoiceConnection Event: Reconnected successfully.'); // Reconnected log
                } catch (error) {
                    console.error('VoiceConnection Event: Disconnected - failed to reconnect, destroying connection.'); // Reconnect fail log
                    connection.destroy();
                }
            });

            if (resource.volume) {
                resource.volume.setVolume(0.5);
            }

            console.log(`Playing audio resource for URL: ${item.url}`); // Play resource log
            this.player.play(resource);
            connection.subscribe(this.player)
            this.player.on(AudioPlayerStatus.Idle, onSongEnd)
            console.log(`audioPlayer.play END (play started) for URL: ${item.url}`); // END log after play started

        } catch (error: any) {
            console.error(`audioPlayer.play ERROR for URL: ${item.url}:`, error); // ERROR log
            throw error;
        }
    }


    private async fetchMetadata(url: string): Promise<YtResponse> {
      return ytdl(url, {
          dumpSingleJson: true,
          noWarnings: true,
          preferFreeFormats: true,
          youtubeSkipDashManifest: true,
          referer: url,
      });
    }
    private findBestAudioFormat(metadata: YtResponse): YtFormat {
      let bestFormat: YtFormat | undefined;
      for (const format of metadata.formats) {
          if (format.acodec && format.acodec.startsWith('opus') && format.vcodec === 'none') {
              bestFormat = format;
              break;
          }
      }
      if (!bestFormat) {
        for (const format of metadata.formats) {
          if (format.acodec && format.vcodec === 'none') {
            bestFormat = format;
            break;
          }
        }
      }
      if (!bestFormat) {
          throw new Error('No suitable audio format found.');
      }
      return bestFormat
    }
    stop() {
        this.player.stop();
    }
    pause(){
        return this.player.pause();
    }
    unpause() {
       return this.player.unpause();
    }
    subscribe(connection: any){
        connection.subscribe(this.player)
    }

}

export const audioPlayer = new AudioPlayer();