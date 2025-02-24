//src/types/google.types.ts

export interface GoogleProfile {
    id: string;
    email: string;
    name: string;
}

export interface GoogleTokens {
    access_token: string;
    refresh_token: string;
}

export interface PlaylistItem {
    id: string;
    snippet: {
        title: string;
        resourceId?: {
            videoId: string;
        };
    };
} 