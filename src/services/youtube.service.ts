//src/services/youtube.service.ts

export class YoutubeService {
    static async getAllPlaylists(accessToken: string) {
        console.log("getAllPlaylists called with accessToken:", accessToken);
        const url = 'https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50';

        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            console.log("YouTube API response status:", response.status);
            console.log("YouTube API response headers:", response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("YouTube API error text:", errorText);
                throw new Error(`YouTube API error (fetching playlists): ${response.status} - ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching all playlists:', error);
            throw new Error(`Failed to fetch all playlists: ${error}`);
        }
    }

    static async getPlaylistVideos(playlistId: string, accessToken: string) {
      console.log("getPlaylistVideos called with accessToken:", accessToken);
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50`;

        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            console.log("YouTube API response status:", response.status);
            console.log("YouTube API response headers:", response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("YouTube API error text:", errorText);
                throw new Error(`YouTube API error (fetching playlist items, status: ${response.status}): ${errorText}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error('Error fetching playlist videos:', error);
            throw new Error(`Failed to fetch playlist videos for playlistId ${playlistId}: ${error.message}`);
        }
    }
}