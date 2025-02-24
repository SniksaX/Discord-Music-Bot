// src/services/commands/command.handler.ts
import { ChatInputCommandInteraction } from 'discord.js';

export abstract class CommandHandler {
    abstract name: string;
    abstract description: string;
    abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;
}