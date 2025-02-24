//src/service/discord.service.ts

import { client, DISCORD_TOKEN } from '../config/discord.config';
import {
    Interaction,
    ChatInputCommandInteraction,
    GuildMember,
} from 'discord.js';

import { CommandHandler } from './commands/command.handler';
import { GoogleService } from './google.service';
import { audioPlayer } from './audio/audio.player';
import { queueManager } from './queue/queue.mannager';
import { YoutubeService } from './youtube.service';
import { Profile, ProfileModel } from '../models/Profile';
import { pool } from '../config/database';
import { oauth2Client } from '../config/google.config';

import { stopCommand } from './commands/Stop.command';
import { selectPlaylistCommand } from './commands/SelectPlayList.command';
import { skipCommand } from './commands/Skip.command';
import { loginCommand } from './commands/Login.command';
import { playCommand } from './commands/Play.command';
import { pauseCommand } from './commands/Pause.command';

export class DiscordService {
    private static commands: CommandHandler[] = [
        playCommand,
        loginCommand,
        selectPlaylistCommand,
        skipCommand,
        stopCommand,
        pauseCommand,
    ];
    private static googleUserMap: Map<string, { accessToken: string; refreshToken?: string }> = new Map();

    static async initialize() {
        if (!DISCORD_TOKEN) {
            console.log('Discord token not found. Discord bot will not be initialized.');
            return;
        }

        try {
            await this.loadUsersFromDatabase();

            client.on('ready', () => {
                console.log(`Logged in as ${client.user?.tag}!`);
            });

            client.on('interactionCreate', async (interaction: Interaction) => {
                if (interaction.isChatInputCommand()) {
                    await this.handleCommand(interaction as ChatInputCommandInteraction);
                } else if (interaction.isStringSelectMenu() && interaction.customId === 'playlistSelect') {
                    await this.handlePlaylistSelectMenu(interaction);
                }
            });

            client.login(DISCORD_TOKEN);
        } catch (error) {
            console.error('Failed to initialize Discord bot:', error);
        }
    }
    private static async loadUsersFromDatabase() {
        try {
            const query = 'SELECT discord_id, access_token, refresh_token FROM userinfo.profile WHERE refresh_token IS NOT NULL AND discord_id IS NOT NULL';
            const result = await pool.query(query);
    
            for (const row of result.rows) {
                this.googleUserMap.set(row.discord_id, { accessToken: row.access_token, refreshToken: row.refresh_token });
                console.log(`Loaded user with Discord ID: ${row.discord_id}`);
            }
            console.log(`Loaded ${result.rows.length} users from the database.`);
        } catch (error) {
            console.error('Error loading users from database:', error);
        }
    }

    private static async handleCommand(interaction: ChatInputCommandInteraction) {
        const command = this.commands.find(c => c.name === interaction.commandName);
        if (!command) {
            await interaction.reply({ content: 'Unknown command.', ephemeral: true });
            return;
        }
    
        try {
            if (command.name === 'selectplaylist' && !await this.isValidToken(interaction.user.id)) {
                await interaction.reply({ content: 'Please log in using /login to use /selectplaylist.', ephemeral: true });
                return;
            }
    
    
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing command ${command.name}:`, error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }

    private static async isValidToken(discordUserId: string): Promise<boolean> {
        console.log(`isValidToken called for user: ${discordUserId}`);
    
        let userData = this.googleUserMap.get(discordUserId);
    
        if (!userData) {
            console.log(`No user data found in googleUserMap for user: ${discordUserId}`);
            return false;
        }
    
        if (userData.refreshToken) {
            console.log(`RefreshToken found, attempting to refresh token proactively for user: ${discordUserId}`); // ADDED LOG - Proactive refresh
    
            try {
                const newTokens = await this.refreshUserToken(discordUserId);
                userData.accessToken = newTokens.accessToken;
                this.googleUserMap.set(discordUserId, userData);
                console.log(`Proactive token refresh successful for user: ${discordUserId}. New accessToken (truncated): ${userData.accessToken.substring(0, 20)}...`); // Modified log
    
            } catch (refreshError) {
                console.error("Proactive token refresh failed:", refreshError);
                this.googleUserMap.delete(discordUserId);
                console.log(`Proactive token refresh failed and user removed from googleUserMap for user: ${discordUserId}`); // Modified log
                return false;
            }
            return true;
        } else if (userData.accessToken) {
            console.log(`AccessToken found but no refreshToken. Assuming accessToken might be valid for user: ${discordUserId} (truncated): ${userData.accessToken.substring(0, 20)}...`); // Modified log
            return true;
        } else {
            console.log(`No accessToken or refreshToken found for user: ${discordUserId}`);
            return false;
        }
    }
    
    private static async refreshUserToken(discordUserId: string): Promise<{ accessToken: string; refreshToken?: string }> {
        console.log(`refreshUserToken START for Discord user ID: ${discordUserId}`); // ADDED LOG
    
        const profile = await ProfileModel.findByDiscordId(discordUserId);
        console.log("Found profile from DB:", profile); // ADDED LOG
    
        if (!profile || !profile.refresh_token) {
            console.error(`No refresh token available for Discord user ID: ${discordUserId}`);
            throw new Error("No refresh token available.");
        }
    
        try {
            const tokenResponse = await oauth2Client.getToken(profile.refresh_token);
            const tokens = tokenResponse.tokens;
    
            console.log("Token refresh response from Google:", tokens); // ADDED LOG
    
            if (!tokens.access_token) {
                console.error("Failed to refresh token: Access token not present in response.");
                throw new Error("Failed to refresh the token");
            }
    
            await ProfileModel.updateTokens(profile.google_id, tokens.access_token, tokens.refresh_token || profile.refresh_token);
            const userData = this.googleUserMap.get(discordUserId);
            if (userData) {
                this.googleUserMap.set(discordUserId, { accessToken: tokens.access_token, refreshToken: tokens.refresh_token || userData.refreshToken });
                console.log(`Token refreshed and googleUserMap updated for Discord user ID: ${discordUserId}. New accessToken (truncated): ${tokens.access_token.substring(0, 20)}...`); // ADDED LOG
            } else {
                console.warn(`User data not found in googleUserMap after refresh for Discord user ID: ${discordUserId}`);
            }
    
            console.log(`refreshUserToken END (success) for Discord user ID: ${discordUserId}`); // ADDED LOG
            return { accessToken: tokens.access_token, refreshToken: tokens.refresh_token || undefined };
    
        } catch (error: any) {
            console.error(`Error refreshing token for Discord user ID: ${discordUserId}`, error);
            this.googleUserMap.delete(discordUserId);
            console.log(`refreshUserToken END (failure) and user removed from googleUserMap for Discord user ID: ${discordUserId}`); // ADDED LOG
            throw new Error(`Failed to refresh token: ${error.message}`);
        }
    }
    

    static async handlePlaylistSelectMenu(interaction: any) {
        if (!interaction.isStringSelectMenu()) return;
        const selectedPlaylistId = interaction.values[0];

        if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
            await interaction.reply({ content: 'You need to be in a voice channel!', ephemeral: true });
            return;
        }

        const guildQueue = queueManager.getOrCreateQueue(
            interaction.guildId!,
            interaction.member.voice.channel.id,
            interaction.channel
        );

        const userData = this.googleUserMap.get(interaction.user.id);
        if (!userData) {
            await interaction.reply({ content: "Error: Please try logging in again.", ephemeral: true });
            return;
        }

        try {
          const videos = await YoutubeService.getPlaylistVideos(selectedPlaylistId, userData.accessToken);
          if (videos && videos.items) {
              const playlistItems = videos.items.map((video: any) => ({
                  url: `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`,
                  title: video.snippet.title,
                  requestedBy: interaction.user.id,
              }));
              queueManager.addMultiple(interaction.guildId!, playlistItems);
              await interaction.update({ content: `Added playlist to the queue.`, components: [] });
          } else {
            await interaction.update({ content: `Failed to get videos`, components: [] });
          }

          queueManager.setPlaylistId(interaction.guildId!, selectedPlaylistId);

            if (!guildQueue.playing) {
              DiscordService.playNextSong(interaction.guildId!);
            }
        } catch (error) {
            console.error('Error fetching playlist videos (in select menu handler):', error);
            await interaction.reply({ content: 'Failed to fetch playlist videos.', ephemeral: true });
        }
    }

    static async handleGoogleCallback(code: string, state: string) {
        try {
            const tokens = await GoogleService.getTokens(code);

           
            const userInfo = await GoogleService.getUserInfo();
            const profileData: Omit<Profile, 'id'> = {
                google_id: userInfo.id,
                discord_id: state,
                email: userInfo.email,
                name: userInfo.name,
                access_token: tokens.access_token!,
                refresh_token: tokens.refresh_token!
            }
           
            await ProfileModel.createOrUpdateProfile(profileData);

           
            this.googleUserMap.set(state, { accessToken: tokens.access_token!, refreshToken: tokens.refresh_token });

            const user = await client.users.fetch(state);
            if (user) {
                user.send('You have successfully logged in!  You can now use /selectplaylist.');
            }

        } catch (error) {
            console.error('Error in Google callback:', error);
            const user = await client.users.fetch(state);
            if (user) {
                user.send('Authentication failed. Please try again.');
            }
        }
  }

    static async playNextSong(guildId: string) {

        const guildQueue = queueManager.getQueue(guildId);
        if (!guildQueue) {
          return;
        }
        if (guildQueue.queue.length === 0) {
            guildQueue.playing = false;
            queueManager.removeGuildQueue(guildId);
            return;
        }

        queueManager.setPlaying(guildId, true)
        const nextSong = queueManager.next(guildId)!;

        const onSongEnd = () => {
          if(queueManager.isPaused(guildId)) return;
          DiscordService.playNextSong(guildId);
        }

        try {
          const metadata = await audioPlayer["fetchMetadata"](nextSong.url)
          queueManager.add(guildId, {
            ...nextSong,
            title: metadata.title
          })
          audioPlayer.play(guildId, guildQueue.voiceChannelId!, nextSong, onSongEnd);
          if (guildQueue.textChannel) {
            guildQueue.textChannel.send(`Now playing: ${metadata.title} (requested by <@${nextSong.requestedBy}>)`);
          }

        } catch (error: any) {
            console.error('Error playing song:', error);
            if (guildQueue.textChannel) {
              guildQueue.textChannel.send({ content: `Failed to play ${nextSong.title}! ${error.message}` });
            }
            this.playNextSong(guildId);
        }
    }

    static isUserLoggedIn(userId: string): boolean {
      return this.googleUserMap.has(userId);
    }
    static getUserData(userId: string) {
      return this.googleUserMap.get(userId);
    }
}