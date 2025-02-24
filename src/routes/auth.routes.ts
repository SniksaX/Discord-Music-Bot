// src/routes/auth.routes.ts

import { Request, Response, Router } from 'express';
import { oauth2Client, SCOPES } from '../config/google.config';
import { DiscordService } from '../services/discord.service';

const router = Router();

router.get('/google', (req: Request, res: Response) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: SCOPES,
    });
    res.redirect(authUrl);
});

router.get('/google/callback', async (req: Request, res: Response): Promise<any> => {
    const { code, state } = req.query;

    if (!code || !state) {
        return res.status(400).send('Missing authorization code or state.');
    }

    try {
      await DiscordService.handleGoogleCallback(code.toString(), state.toString());
        res.send('Authentication successful!  Return to Discord.');
    } catch (error) {
        console.error('Error during OAuth callback:', error);
        res.status(500).send('Authentication failed.');
    }
});

export default router; 