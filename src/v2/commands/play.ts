import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { BotCommand } from ".";
import { searchSC, searchYT } from "../search";

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
        .addStringOption(new SlashCommandStringOption()
            .setName('platform')
            .addChoices(
                {name: 'youtube', value: 'youtube'}, 
                {name: 'soundcloud', value: 'soundcloud'}))
        .setDescription('Add a song to queue'),
    handler: async ({ interaction, queue, player }) => {
        const voiceChannel = voiceChannelFromInteraction(interaction);
        if (!voiceChannel) {
            interaction.reply('❌ You need to be in a voice channel to use this command');
            return;
        }
        await interaction.deferReply({ ephemeral: true });
        const guildId = interaction.guild!.id;

        const DEFAULT_PLATFORM = 'youtube';
        const query = interaction.options.getString('query')!;
        const platform = interaction.options.getString('platform') ?? DEFAULT_PLATFORM;

        if (platform == 'youtube') {
            const searchResult = await searchYT(query);
            if (searchResult) {
                queue.enqueueMusic(guildId, voiceChannel.id, {
                    name: searchResult.title,
                    url: searchResult.url,
                    seconds: searchResult.duration.seconds
                })
                if (player.playMusic(guildId)) {
                    interaction.followUp(`🎵  Now playing "${searchResult.title}"!`);
                }
                else {
                    interaction.followUp(`🎵  Added "${searchResult.title}" to the queue!`);
                }
            }
            else {
                interaction.followUp(`❌ Zero videos found for query ${query}`);
            }
        } else if (platform == "soundcloud") {
            const searchResult = await searchSC(query);

            if (searchResult) {
                queue.enqueueMusic(guildId, voiceChannel.id, {
                    name: searchResult.title,
                    url: searchResult.uri,
                    seconds: searchResult.full_duration
                })

                if (player.playMusic(guildId)) {
                    interaction.followUp(`🎵  Now playing "${searchResult.title}"!`);
                } else {
                    interaction.followUp(`🎵  Added "${searchResult.title}" to the queue!`);
                }
            } else {
                interaction.followUp(`❌ Zero videos found for query ${query}`);
            }
        }
        return;
    }
}
