import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, SlashCommandStringOption } from "discord.js";
import { BotCommand } from ".";
import { searchSC, searchYT } from "../search";
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
        .addStringOption(new SlashCommandStringOption()
            .setName('platform')
            .setDescription('Platform to search song on')
            .setRequired(true)
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
        const mention = userToMention(interaction.user);
        
        
        if (platform === 'youtube') {
            const searchResult = await searchYT(query);

            if (searchResult) {
                queue.add(guildId, voiceChannel.id, {
                    name: searchResult.title,
                    url: searchResult.url,
                    seconds: searchResult.duration.seconds,
                    added_by: interaction.user.id
                });
    
                if (player.playMusic(guildId)) {
                    interaction.followUp(`✅ Done`);
                    interaction.channel?.send(`🎵 Now playing "${searchResult.title}", added by ${mention}.`);
                } else {
                    interaction.followUp(`✅ Done`);
                    interaction.channel?.send(`🎵 "${searchResult.title}" was added to the queue by ${mention}.`);
                }
            }
        } else if (platform === 'soundcloud') {
            const searchResult = await searchSC(query);

            if (searchResult) {
                queue.add(guildId, voiceChannel.id, {
                    name: searchResult.title,
                    url: searchResult.permalink_url,
                    seconds: searchResult.full_duration,
                    added_by: interaction.user.id
                });
    
                if (player.playMusic(guildId)) {
                    interaction.followUp(`✅ Done`);
                    interaction.channel?.send(`🎵 Now playing "${searchResult.title}", added by ${mention}.`);
                } else {
                    interaction.followUp(`✅ Done`);
                    interaction.channel?.send(`🎵 "${searchResult.title}" was added to the queue by ${mention}.`);
                }
            }
        }
        return;
    }
}
