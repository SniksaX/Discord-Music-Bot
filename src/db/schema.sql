-- src/db/schema.sql
CREATE SCHEMA IF NOT EXISTS userinfo;

CREATE TABLE userinfo.profile (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    discord_id VARCHAR(255) UNIQUE,
    email VARCHAR(255),
    name VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE userinfo.playlists (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER REFERENCES userinfo.profile(id),
    playlist_id VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE userinfo.playlist_videos (
    id SERIAL PRIMARY KEY,
    playlist_id INTEGER REFERENCES userinfo.playlists(id),
    video_id VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);