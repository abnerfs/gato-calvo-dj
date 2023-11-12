import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { BotCommand } from ".";
import { searchYT } from "../search";
import { userToMention } from "../util";

const voiceChannelFromInteraction = (interaction: ChatInputCommandInteraction) => {
    const member = interaction.member as GuildMember;
    return member.voice.channel;
}

export const playCommand: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('play')
        .addStringOption(new SlashCommandStringOption()
            .setName('query')
            .setDescription('Query to search for')
            .setRequired(true))
        .setDescription('Add a song to queue'),
    handler: async ({ interaction, queue, player }) => {
        const voiceChannel = voiceChannelFromInteraction(interaction);
        if (!voiceChannel) {
            interaction.reply('❌ You need to be in a voice channel to use this command');
            return;
        }
        await interaction.deferReply({ ephemeral: true });
        const guildId = interaction.guild!.id;

        const query = interaction.options.getString('query')!;
        const searchResult = await searchYT(query);
        const mention = userToMention(interaction.user);
        if (searchResult) {
            queue.add(guildId, voiceChannel.id, {
                name: searchResult.title,
                youtube_url: searchResult.url,
                seconds: searchResult.duration.seconds,
                added_by: interaction.user
            });

            if (player.playMusic(guildId)) {
                interaction.followUp(`✅ Done`);
                interaction.channel?.send(`🎵 Now playing "${searchResult.title}", added by ${mention}.`);
            }
            else {
                interaction.followUp(`✅ Done`);
                interaction.channel?.send(`🎵 "${searchResult.title}" was added to the queue by ${mention}.`);
            }
        }
        else {
            interaction.followUp(`❌ Zero videos found for query ${query}`);
        }
        return;
    }
}
