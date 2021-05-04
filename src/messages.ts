import Discord from 'discord.js'
import { BOT_NAME } from '.';

const DEFAULT_EMBED_COLOR = '#0099ff';
const DEFAULT_ICON = undefined;

export const embedFactory = (params:
    {
        author?: {
            author: string,
            iconURL?: string,
            url?: string
        },
        content?: string,
        title?: string,
        description?: string,
        fields?:
        {
            name: string,
            value: string,
            inline: boolean
        }[], color?: string
    }) => {
    const embed = new Discord.MessageEmbed()
        .setColor(params.color || DEFAULT_EMBED_COLOR);

    if (params.title)
        embed.setTitle(params.title);

    if (params.author)
        embed.setAuthor(params.author.author, params.author.iconURL || DEFAULT_ICON, params.author.url);
    else
        embed.setAuthor(BOT_NAME, DEFAULT_ICON);

    if (params.description)
        embed.setDescription(params.description);

    if (params.fields)
        embed.addFields(params.fields);

     embed.setFooter(`@${BOT_NAME} by github.com/abnerfs`, DEFAULT_ICON);

    return {
        content: params.content,
        embed
    };
}