//src/models/Profile.ts

import { pool } from '../config/database';

export interface Profile {
    id: number;
    google_id: string;
    discord_id: string | null;
    email: string;
    name: string;
    access_token: string | null;
    refresh_token: string | null;
}

export const ProfileModel = {
    async createOrUpdateProfile(profileData: Omit<Profile, 'id'>) {
        const findQuery = 'SELECT * FROM userinfo.profile WHERE google_id = $1';
        const findResult = await pool.query(findQuery, [profileData.google_id]);

        if (findResult.rows.length > 0) {
            
            const updateQuery = `
                UPDATE userinfo.profile
                SET discord_id = $2, email = $3, name = $4, access_token = $5, refresh_token = $6
                WHERE google_id = $1
                RETURNING *
            `;
            const updateValues = [
                profileData.google_id,
                profileData.discord_id, 
                profileData.email,
                profileData.name,
                profileData.access_token,
                profileData.refresh_token
            ];
            const updateResult = await pool.query(updateQuery, updateValues);
            return updateResult.rows[0];
        } else {
            
            const insertQuery = `
              INSERT INTO userinfo.profile (google_id, discord_id, email, name, access_token, refresh_token)
              VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING *
            `;
            const insertValues = [
              profileData.google_id,
              profileData.discord_id, 
              profileData.email,
              profileData.name,
              profileData.access_token,
              profileData.refresh_token
            ];
            const insertResult = await pool.query(insertQuery, insertValues);
            return insertResult.rows[0];
        }
    },

    async findByGoogleId(googleId: string) {
        const query = 'SELECT * FROM userinfo.profile WHERE google_id = $1';
        const result = await pool.query(query, [googleId]);
        return result.rows[0] as Profile | undefined;
    },
    async findByDiscordId(discordId: string) {
        const query = 'SELECT * FROM userinfo.profile WHERE discord_id = $1';
        const result = await pool.query(query, [discordId]);
        return result.rows[0] as Profile | undefined;
    },

    async updateTokens(googleId: string, accessToken: string | null, refreshToken: string | null) {
        const query = `
          UPDATE userinfo.profile
          SET access_token = $1, refresh_token = $2
          WHERE google_id = $3
          RETURNING *
        `;
        const result = await pool.query(query, [accessToken, refreshToken, googleId]);
        return result.rows[0] as Profile | undefined;
    },

    async savePlaylist(profileId: number, playlistId: string, title: string) {
        const query = `
            INSERT INTO userinfo.playlists (profile_id, playlist_id, title)
            VALUES ($1, $2, $3)
            RETURNING *
          `;
        const result = await pool.query(query, [profileId, playlistId, title]);
        return result.rows[0];
    },

    async savePlaylistVideo(playlistDbId: number, videoId: string, title: string) {
        const query = `
            INSERT INTO userinfo.playlist_videos (playlist_id, video_id, title)
            VALUES ($1, $2, $3)
            RETURNING *
          `;
        const result = await pool.query(query, [playlistDbId, videoId, title]);
        return result.rows[0];
    }
};