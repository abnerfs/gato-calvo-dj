import { ColorResolvable, EmbedBuilder } from 'discord.js';

const DEFAULT_EMBED_COLOR = '#0099ff';
const DEFAULT_ICON = undefined;

export const embedFactory = (params:
    {
        author: {
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
        }[], color?: ColorResolvable
    }) => {
    const embed = new EmbedBuilder()
        .setColor(params.color || DEFAULT_EMBED_COLOR);

    if (params.title)
        embed.setTitle(params.title);

    embed.setAuthor({
        name: params.author.author,
        iconURL: params.author.iconURL || DEFAULT_ICON,
        url: params.author.url
    });

    if (params.description)
        embed.setDescription(params.description);

    if (params.fields)
        embed.addFields(params.fields);

    embed.setFooter({
        text: `by github.com/abnerfs`,
        iconURL: DEFAULT_ICON
    });

    return embed;
}
