//services/google.service.ts

import { google } from 'googleapis';
import { oauth2Client } from '../config/google.config';
import { GoogleProfile, GoogleTokens } from '../types/google.types';

export class GoogleService {
    static async getTokens(code: string): Promise<GoogleTokens> {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        return tokens as GoogleTokens;
    }

    static async getUserInfo(): Promise<GoogleProfile> {
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        
        return {
            id: userInfo.data.id!,
            email: userInfo.data.email!,
            name: userInfo.data.name!
        };
    }

    static setCredentials(tokens: GoogleTokens) {
        oauth2Client.setCredentials(tokens);
    }
} 