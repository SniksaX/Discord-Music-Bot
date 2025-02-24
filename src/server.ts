// src/server.ts
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import playlistRoutes from './routes/playlist.routes';
import { DiscordService } from './services/discord.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/auth', authRoutes);
app.use('/playlist', playlistRoutes);

DiscordService.initialize();

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});