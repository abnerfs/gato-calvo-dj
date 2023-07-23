import { ChatInputCommandInteraction, Client, GuildMember, SlashCommandBuilder, SlashCommandStringOption, VoiceBasedChannel } from "discord.js";
import { BotCommand } from ".";
import { searchYT } from "../search";

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

        const guildId = interaction.guild!.id;

        const query = interaction.options.getString('query')!;
        const searchResult = await searchYT(query);
        if (searchResult) {
            queue.enqueueMusic(guildId, voiceChannel.id, {
                name: searchResult.title,
                youtube_url: searchResult.url,
                seconds: searchResult.duration.seconds
            })
            if(player.playMusic(guildId)) {
                interaction.reply(`🎵  Now playing "${searchResult.title}"!`);
            }
            else {
                interaction.reply(`🎵  Added "${searchResult.title}" to the queue!`);
            }
        }
        else {
            interaction.reply(`❌ Zero videos found for query ${query}`);
        }
        return;
    }
}
