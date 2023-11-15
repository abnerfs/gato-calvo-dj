import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { BotCommand } from ".";
import { searchSC, searchYT } from "../search";
import { MusicResult } from "../logic/queue";

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
            .setDescription('Platform to search song on')
            .setRequired(false)
            .addChoices(
                { name: 'youtube', value: 'youtube' },
                { name: 'soundcloud', value: 'soundcloud' }))
        .setDescription('Add a song to queue'),
    handler: async ({ interaction, queue, player }) => {
        const voiceChannel = voiceChannelFromInteraction(interaction);
        if (!voiceChannel) {
            interaction.reply('❌ You need to be in a voice channel to use this command');
            return;
        }
        await interaction.deferReply();
        const guildId = interaction.guild!.id;

        const DEFAULT_PLATFORM = 'youtube';
        const query = interaction.options.getString('query')!;
        const platform = interaction.options.getString('platform') ?? DEFAULT_PLATFORM;

        let searchResult: MusicResult | undefined = undefined;
        if (!platform || platform === 'youtube') {
            searchResult = await searchYT(query);
        } else if (platform === 'soundcloud') {
            searchResult = await searchSC(query);
        }

        if (searchResult) {
            queue.add(guildId, voiceChannel.id, {
                ...searchResult,
                added_by: interaction.user.id
            });

            if (player.playMusic(guildId)) {
                interaction.followUp(`🎵 Now playing "${searchResult.name}".`);
            } else {
                interaction.followUp(`🎵 "${searchResult.name}" was added to the queue.`);
            }
        }
        return;
    }
}
