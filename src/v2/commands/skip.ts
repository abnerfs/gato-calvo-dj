import { SlashCommandBuilder } from "discord.js";
import { BotCommand } from ".";

export const skipCommand: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the sound being currently played'),
    handler: async ({ interaction, player }) => {
        const guildId = interaction.guild!.id;
        player.skip(guildId);
        interaction.reply('✅ Done');
    }
}
