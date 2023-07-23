import { SlashCommandBuilder } from "discord.js";
import { BotCommand } from ".";
import { embedFactory } from "../messages";

const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds / 60 - (hours * 60)));
    const seconds = totalSeconds - (hours * 3600) - (minutes * 60);

    return {
        hours,
        minutes,
        seconds
    }
}

const hourPartPad = (amount: number) => {
    return amount.toString().padStart(2, '0');
}

export const queueCommand: BotCommand = {
    command: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('List sounds in the queue'),
    handler: async ({ interaction, bot, queue }) => {
        const guildId = interaction.guild!.id;
        const q = queue.queue(guildId);
        if (q.length == 0) {
            interaction.reply('The queue is now empty, use the /play command to add musics');
        }
        else {
            let i = 1;
            let queue = q.map(x => {
                const duration = formatDuration(x.seconds);

                return `[${i++} - ${x.name} - ${hourPartPad(duration.hours)}:${hourPartPad(duration.minutes)}:${hourPartPad(duration.seconds)} ](${x.youtube_url}) `
            })
                .slice(0, 10)
                .join('\r\n');;

            const embed = embedFactory({
                author: {
                    author: bot.user!.username
                },
                description: queue
            })
            interaction.reply({ embeds: [embed]});
        }
    }
}
