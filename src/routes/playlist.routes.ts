//src/routes/playlist.routes.ts

import { Request, Response, Router } from 'express';
import { oauth2Client } from '../config/google.config';
import { YoutubeService } from '../services/youtube.service';

const router = Router();

router.get('/:id', async (req: Request, res: Response): Promise<any> => {
    const playlistId = req.params.id;
    const accessToken = oauth2Client.credentials.access_token;

    if (!accessToken) {
        return res.status(401).send('Unauthorized: No access token.');
    }

    try {
        const videos = await YoutubeService.getPlaylistVideos(playlistId, accessToken);
        res.send(generateVideoListHtml(videos.items));
    } catch (error) {
        console.error('Error fetching playlist videos:', error);
        res.status(500).send('Failed to fetch playlist videos.');
    }
});

function generateVideoListHtml(videos: any[]): string {
    let videoList = '<h1>Videos:</h1><ul>';
    videos.forEach((video) => {
        videoList += `<li>https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}</li>`;
    });
    videoList += '</ul>';
    return videoList;
}

export default router; 