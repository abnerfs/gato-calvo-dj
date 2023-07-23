import { BOT_CLIENT_ID, BOT_TOKEN } from '../config';
import { ChatInputCommandInteraction, Client, REST, Routes, SlashCommandBuilder } from "discord.js"
import { playCommand } from "./play";
import { BotQueue } from '../logic/queue';
import { Player } from '../player';
import { skipCommand } from './skip';
import { queueCommand } from './queue';

type HandlerParams = {
    interaction: ChatInputCommandInteraction,
    queue: BotQueue,
    bot: Client,
    player: Player
}

export type BotCommand = {
    command: SlashCommandBuilder,
    handler: (handlerParams: HandlerParams) => Promise<void>;
}

export const commands = [
    playCommand,
    skipCommand,
    queueCommand
];

const rest = new REST().setToken(BOT_TOKEN);


export const commandDispatcher = (params: HandlerParams) => {
    const command = commands.find(x => x.command.name == params.interaction.commandName);
    if (command)
        return command.handler(params);

    return;
}

export const setupCommands = async (guildId: string) => {
    await rest.put(
        Routes.applicationGuildCommands(BOT_CLIENT_ID, guildId),
        {
            body: commands
                .map(x => x.command.toJSON())
        },
    );
}
